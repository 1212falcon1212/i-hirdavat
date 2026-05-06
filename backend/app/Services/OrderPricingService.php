<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Pazaryeri sipariş fiyatlandırma servisi.
 *
 * Tek "doğru" hesaplama yeri. Hem checkout önizleme hem de OrderService::createFromCart
 * bu servisi kullanır; satıcı paneli/raporlar mevcut FeeCalculationService'i kullanmaya
 * devam edebilir (legacy uyumluluk).
 *
 * == HESAPLAMA TABANI / VARSAYIMLAR ==
 *
 *  - Listeleme fiyatları KDV DAHİLDİR (alıcının gördüğü PSF / bayi teklif fiyatı).
 *    Kalem KDV oranı: product.category.vat_rate (yoksa default_kdv_rate).
 *
 *  - KDV ayrıştırma:   gross / (1 + kdv/100)  → net      ;   gross - net → kdv_amount
 *
 *  - Platform komisyonu (default %10): KALEM NET (KDV hariç) tutar üzerinden alınır.
 *    Bu, satıcıya rapor edilen "komisyon gideri" gerçek matrahla uyumlu olsun diye.
 *
 *  - Stopaj (Türk e-ticaret uygulaması): KDV-hariç kalem geliri × stopaj oranı.
 *    [Not: Bazı yapılar stopajı sadece komisyon geliri üzerine uygular. Burada
 *     legacy konvansiyonu koruyoruz: net seller revenue * stopajRate.]
 *
 *  - Hizmet bedeli (default 50₺): SİPARİŞ BAŞINA TEK SEFER alıcıdan tahsil edilir,
 *    satıcılara kalem-payı olarak dağıtılmaz (alıcının ödediği grand_total'a eklenir).
 *
 *  - Kargo: HER SATICI kendi flat_fee + free_shipping_threshold'unu user kaydında
 *    tutar. Bayi belirlememişse `commission.shipping_fallback_fee` kullanılır.
 *    Sepet alt toplamı satıcı bazında threshold'u aşıyorsa kargo bedava (0).
 */
class OrderPricingService
{
    public function __construct() {}

    /**
     * Sepetten fiyatlandırma kırılımı üret (sipariş henüz oluşturulmadan).
     *
     * @return array{
     *   items_subtotal: float,
     *   kdv_total: float,
     *   shipping_total: float,
     *   service_fee: float,
     *   commission_total: float,
     *   stopaj_total: float,
     *   grand_total: float,
     *   per_seller: array<int, array{
     *     gross: float, net: float, kdv: float,
     *     shipping: float,
     *     commission: float, stopaj: float,
     *     service_fee_share: float,
     *     seller_payout: float,
     *   }>,
     *   meta: array{
     *     commission_rate: float, stopaj_rate: float,
     *     service_fee: float, default_kdv_rate: float,
     *     commission_enabled: bool, service_fee_enabled: bool, stopaj_enabled: bool,
     *   }
     * }
     */
    public function calculateForCart(Cart $cart): array
    {
        $cart->loadMissing(['items.product.category', 'items.offer', 'items.seller']);

        $lineItems = $cart->items->map(function ($cartItem): array {
            return [
                'gross' => (float) $cartItem->price_at_addition * (int) $cartItem->quantity,
                'kdv_rate' => $this->resolveKdvRate($cartItem->product?->category?->vat_rate),
                'seller_id' => (int) $cartItem->seller_id,
                'seller' => $cartItem->seller,
            ];
        })->values();

        return $this->calculateFromLines($lineItems);
    }

    /**
     * Kayıtlı bir Order için kırılımı yeniden üret (read-only önizleme amaçlı).
     */
    public function calculateForOrder(Order $order): array
    {
        $order->loadMissing(['items.product.category', 'items.seller']);

        $lineItems = $order->items->map(function ($item): array {
            return [
                'gross' => (float) $item->total_price,
                'kdv_rate' => (float) ($item->kdv_rate
                    ?: $item->product?->category?->vat_rate
                    ?? $this->defaultKdvRate()),
                'seller_id' => (int) $item->seller_id,
                'seller' => $item->seller,
            ];
        })->values();

        return $this->calculateFromLines($lineItems);
    }

    /**
     * @param  Collection<int, array{gross: float, kdv_rate: float, seller_id: int, seller: ?User}>  $lines
     */
    protected function calculateFromLines(Collection $lines): array
    {
        $commissionEnabled = (bool) Setting::getValue('commission.platform_commission_enabled', true);
        $serviceFeeEnabled = (bool) Setting::getValue('commission.service_fee_enabled', true);
        $stopajEnabled = (bool) Setting::getValue('commission.stopaj_enabled', true);

        $commissionRate = (float) Setting::getValue('commission.platform_commission_rate',
            (float) Setting::getValue('commission.commission_percentage', 10.00));
        $stopajRate = (float) Setting::getValue('commission.stopaj_rate',
            (float) Setting::getValue('commission.withholding_tax_rate', 20.00));
        $serviceFee = (float) Setting::getValue('commission.service_fee',
            (float) Setting::getValue('commission.flat_service_fee', 50.00));

        $perSeller = [];
        $itemsSubtotal = 0.0;
        $kdvTotal = 0.0;

        foreach ($lines as $line) {
            $sellerId = $line['seller_id'];
            $gross = (float) $line['gross'];
            $kdvRate = (float) $line['kdv_rate'];

            $net = $this->extractNet($gross, $kdvRate);
            $kdv = $this->round2($gross - $net);

            $itemsSubtotal += $gross;
            $kdvTotal += $kdv;

            if (! isset($perSeller[$sellerId])) {
                $perSeller[$sellerId] = [
                    'seller' => $line['seller'],
                    'gross' => 0.0,
                    'net' => 0.0,
                    'kdv' => 0.0,
                    'item_count' => 0,
                ];
            }

            $perSeller[$sellerId]['gross'] += $gross;
            $perSeller[$sellerId]['net'] += $net;
            $perSeller[$sellerId]['kdv'] += $kdv;
            $perSeller[$sellerId]['item_count']++;
        }

        // Hizmet bedeli payı: satıcıların item sayısına göre dağıtılır.
        // (Alıcı toplamına tek sefer ekleniyor; satıcı kesintisinde kullanılmaz —
        //  yalnızca raporlama amaçlı per_seller içinde share gösterilir.)
        $totalItemCount = array_sum(array_column($perSeller, 'item_count')) ?: 1;
        $shippingTotal = 0.0;
        $commissionTotal = 0.0;
        $stopajTotal = 0.0;

        foreach ($perSeller as $sellerId => &$bucket) {
            /** @var ?User $seller */
            $seller = $bucket['seller'];
            $bucket['gross'] = $this->round2($bucket['gross']);
            $bucket['net'] = $this->round2($bucket['net']);
            $bucket['kdv'] = $this->round2($bucket['kdv']);

            $bucket['shipping'] = $this->resolveSellerShipping($seller, $bucket['gross']);
            $shippingTotal += $bucket['shipping'];

            $bucket['commission'] = $commissionEnabled
                ? $this->round2($bucket['net'] * ($commissionRate / 100.0))
                : 0.0;
            $commissionTotal += $bucket['commission'];

            $bucket['stopaj'] = $stopajEnabled
                ? $this->round2($bucket['net'] * ($stopajRate / 100.0))
                : 0.0;
            $stopajTotal += $bucket['stopaj'];

            $bucket['service_fee_share'] = $serviceFeeEnabled
                ? $this->round2($serviceFee * ($bucket['item_count'] / $totalItemCount))
                : 0.0;

            // Satıcı net hakedişi: gross − komisyon − stopaj − hizmet bedeli − kargo.
            // Tüm platform/devlet/kargo kesintileri satıcının brüt cirosundan
            // düşülür; hakediş satırı bu dört kalemin tamamını içerir.
            $bucket['seller_payout'] = $this->round2(
                $bucket['gross']
                - $bucket['commission']
                - $bucket['stopaj']
                - $bucket['service_fee_share']
                - $bucket['shipping']
            );

            unset($bucket['seller']);
            unset($bucket['item_count']);
        }
        unset($bucket);

        $serviceFeeAmount = $serviceFeeEnabled ? $serviceFee : 0.0;
        $grandTotal = $this->round2($itemsSubtotal + $shippingTotal + $serviceFeeAmount);

        return [
            'items_subtotal' => $this->round2($itemsSubtotal),
            'kdv_total' => $this->round2($kdvTotal),
            'shipping_total' => $this->round2($shippingTotal),
            'service_fee' => $this->round2($serviceFeeAmount),
            'commission_total' => $this->round2($commissionTotal),
            'stopaj_total' => $this->round2($stopajTotal),
            'grand_total' => $grandTotal,
            'per_seller' => $perSeller,
            'meta' => [
                'commission_rate' => $commissionRate,
                'stopaj_rate' => $stopajRate,
                'service_fee' => $serviceFee,
                'default_kdv_rate' => $this->defaultKdvRate(),
                'commission_enabled' => $commissionEnabled,
                'service_fee_enabled' => $serviceFeeEnabled,
                'stopaj_enabled' => $stopajEnabled,
            ],
        ];
    }

    /**
     * Satıcının kendi tanımladığı kargo ücretini hesapla; tanım yoksa
     * platform fallback'ini kullan. Threshold aşıldıysa 0.
     */
    public function resolveSellerShipping(?User $seller, float $sellerSubtotal): float
    {
        $fallbackFee = (float) Setting::getValue('commission.shipping_fallback_fee', 49.90);
        $platformCap = Setting::getValue('commission.min_order_for_free_shipping_cap', null);

        if (! $seller) {
            return $this->round2($fallbackFee);
        }

        $flatFee = $seller->shipping_flat_fee !== null
            ? (float) $seller->shipping_flat_fee
            : $fallbackFee;

        $threshold = $seller->free_shipping_threshold;
        if ($threshold !== null) {
            $threshold = (float) $threshold;
            // Platform üst sınırını uygula (varsa): bayi threshold platform cap'inin
            // altında tutmalı — yani bayi ücretsiz kargoyu çok yüksek bir değere
            // koyamaz. Cap = "threshold üst sınırı".
            if ($platformCap !== null && (float) $platformCap > 0) {
                $threshold = min($threshold, (float) $platformCap);
            }
            if ($sellerSubtotal >= $threshold) {
                return 0.0;
            }
        }

        return $this->round2(max(0.0, $flatFee));
    }

    protected function defaultKdvRate(): float
    {
        return (float) Setting::getValue('commission.default_kdv_rate', 20.00);
    }

    protected function resolveKdvRate(mixed $categoryRate): float
    {
        if ($categoryRate === null || $categoryRate === '') {
            return $this->defaultKdvRate();
        }

        return (float) $categoryRate;
    }

    protected function extractNet(float $gross, float $kdvRate): float
    {
        if ($kdvRate <= 0) {
            return $this->round2($gross);
        }

        return $this->round2($gross / (1.0 + $kdvRate / 100.0));
    }

    protected function round2(float $value): float
    {
        // bcadd/bcsub vs. — float drift'i engellemek için yarı-banker yuvarlama
        // yerine 2 hane standardı yeterli. Toplamların cent-perfect olmaması
        // dağıtım kaynaklı; ihtiyaç halinde son satıra delta eklenebilir.
        return (float) round($value, 2, PHP_ROUND_HALF_UP);
    }
}
