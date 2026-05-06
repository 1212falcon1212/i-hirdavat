<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Order;
use App\Models\SellerWallet;
use App\Models\Setting;
use App\Models\SubOrder;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\WalletService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Bosch.bayi@i-hirdavat.com hesabi icin tamamlanmis test siparisleri olusturur.
 * Hakedis akislarini ve satis dashboardunu gozle dogrulamak icin kullanilir.
 *
 *  - 3 ayri tamamlanmis siparis (delivered + buyer_confirmed_at)
 *  - Her siparis 1-2 farkli urun
 *  - Pricing snapshot alanlari (komisyon, KDV, stopaj, hizmet bedeli, kargo) doldurulur
 *  - WalletService::addOrderEarnings ile cuzdana islenir
 *  - En eski siparis available bakiyeye serbest birakilir; digerleri pending kalir
 *
 * Idempotent: order_number "BOSCHTEST*" pattern'i ile DB'de varsa tekrar yaratmaz.
 */
class BoschTestOrdersSeeder extends Seeder
{
    public function run(): void
    {
        $seller = User::where('email', 'bosch.bayi@i-hirdavat.com')->first();
        if (! $seller) {
            $this->command->error('Bosch satici bulunamadi.');

            return;
        }

        $buyer = User::where('email', 'alici@i-hirdavat.com')->first();
        if (! $buyer) {
            $this->command->error('Test alici (alici@i-hirdavat.com) bulunamadi.');

            return;
        }

        // Idempotency yerine BATCH-INCREMENTAL: her calistirildiginda mevcut
        // BOSCHTEST sayisindan devam ederek yeni siparisler ekler. Sifirdan
        // baslamak icin once `Order::where('order_number','like','BOSCHTEST%')->delete()`.
        $existingCount = Order::where('order_number', 'like', 'BOSCHTEST%')->count();

        // Komisyon / hizmet ayarlarini Setting tablosundan al
        $commissionRate = (float) Setting::getValue('commission.commission_percentage', 10.00);
        $serviceFee = (float) Setting::getValue('commission.service_fee', 50.00);
        $defaultKdv = (float) Setting::getValue('commission.default_kdv_rate', 20.00);
        $stopajRate = (float) Setting::getValue('commission.stopaj_rate', 20.00);
        $shippingFlat = (float) ($seller->shipping_flat_fee ?? Setting::getValue('commission.shipping_fallback_fee', 49.90));

        // Bosch'tan stoklu farkli teklifleri çek (en fazla 8)
        $offers = Offer::where('seller_id', $seller->id)
            ->where('status', 'active')
            ->where('stock', '>=', 5)
            ->whereNotNull('product_id')
            ->orderBy('id')
            ->limit(8)
            ->get();

        if ($offers->count() < 3) {
            $this->command->error('Yeterli aktif Bosch teklifi yok (en az 3 gerekli).');

            return;
        }

        $walletService = app(WalletService::class);

        // İlk run: temel 3 senaryo (release + 2 pending). Sonraki run'larda
        // ek 4 varyant: multi-item, bekleyen-onay, kargoda, ikinci-release.
        $isFirstBatch = $existingCount === 0;

        if ($isFirstBatch) {
            $scenarios = [
                // En eski — buyer_confirmed_at 40 gun once → available'a release edilir
                [
                    'label' => '40 gün önceki teslimat (release edildi)',
                    'days_ago' => 40,
                    'release' => true,
                    'order_status' => 'delivered',
                    'sub_order_status' => 'delivered',
                    'confirm' => true,
                    'items' => [
                        ['offer' => $offers[0], 'qty' => 2],
                    ],
                ],
                [
                    'label' => '15 gün önce, alıcı onayladı (pending)',
                    'days_ago' => 15,
                    'release' => false,
                    'order_status' => 'delivered',
                    'sub_order_status' => 'delivered',
                    'confirm' => true,
                    'items' => [
                        ['offer' => $offers[1], 'qty' => 1],
                        ['offer' => $offers[2], 'qty' => 3],
                    ],
                ],
                [
                    'label' => '5 gün önce, alıcı onayladı (pending)',
                    'days_ago' => 5,
                    'release' => false,
                    'order_status' => 'delivered',
                    'sub_order_status' => 'delivered',
                    'confirm' => true,
                    'items' => [
                        ['offer' => $offers[3] ?? $offers[0], 'qty' => 4],
                    ],
                ],
            ];
        } else {
            $scenarios = [
                [
                    'label' => '50 gün önceki teslimat (ikinci release)',
                    'days_ago' => 50,
                    'release' => true,
                    'order_status' => 'delivered',
                    'sub_order_status' => 'delivered',
                    'confirm' => true,
                    'items' => [
                        ['offer' => $offers[2 % $offers->count()], 'qty' => 1],
                        ['offer' => $offers[3 % $offers->count()], 'qty' => 2],
                    ],
                ],
                [
                    'label' => '8 gün önce, çoklu kalemli yüksek tutarlı (pending)',
                    'days_ago' => 8,
                    'release' => false,
                    'order_status' => 'delivered',
                    'sub_order_status' => 'delivered',
                    'confirm' => true,
                    'items' => [
                        ['offer' => $offers[0], 'qty' => 5],
                        ['offer' => $offers[1], 'qty' => 1],
                        ['offer' => $offers[4 % $offers->count()] ?? $offers[2], 'qty' => 2],
                        ['offer' => $offers[5 % $offers->count()] ?? $offers[3], 'qty' => 3],
                    ],
                ],
                [
                    'label' => '3 gün önce teslim edildi, alıcı ONAYLAMADI (hakediş YOK)',
                    'days_ago' => 3,
                    'release' => false,
                    'order_status' => 'delivered',
                    'sub_order_status' => 'delivered',
                    'confirm' => false,           // buyer_confirmed_at = null → wallet'a yansımaz
                    'items' => [
                        ['offer' => $offers[1 % $offers->count()], 'qty' => 1],
                    ],
                ],
                [
                    'label' => '2 gün önce kargoya verildi, henüz teslim edilmedi (hakediş YOK)',
                    'days_ago' => 2,
                    'release' => false,
                    'order_status' => 'shipped',
                    'sub_order_status' => 'shipped',
                    'confirm' => false,
                    'items' => [
                        ['offer' => $offers[6 % $offers->count()] ?? $offers[0], 'qty' => 2],
                    ],
                ],
            ];
        }

        $shippingAddress = [
            'name' => $buyer->seller_name ?? 'Test Kurumsal Alici',
            'phone' => $buyer->phone ?? '0532 000 0000',
            'address' => 'Sanayi Sitesi 5. Cadde No:14',
            'city' => 'Istanbul',
            'district' => 'Umraniye',
            'postal_code' => '34762',
        ];

        $createdOrderIds = [];
        $globalIdx = $existingCount;

        foreach ($scenarios as $scenario) {
            $globalIdx++;
            $isShippedOnly = ($scenario['order_status'] ?? 'delivered') === 'shipped';
            $deliveredAt = $isShippedOnly ? null : Carbon::now()->subDays($scenario['days_ago']);
            $shippedAt = Carbon::now()->subDays($scenario['days_ago'] + ($isShippedOnly ? 0 : 2));
            $confirmedAt = ($scenario['confirm'] ?? true) && ! $isShippedOnly
                ? $deliveredAt->copy()->addDay()
                : null;
            $createdAt = Carbon::now()->subDays($scenario['days_ago'] + 3);

            DB::transaction(function () use (
                $globalIdx, $scenario, $seller, $buyer, $createdAt, $shippedAt, $deliveredAt, $confirmedAt,
                $commissionRate, $serviceFee, $defaultKdv, $stopajRate, $shippingFlat,
                $shippingAddress, $walletService, &$createdOrderIds,
            ) {
                // === Items: per-item KDV/komisyon/stopaj snapshot'u ===
                $itemsBuilt = [];
                $subtotal = 0.0;
                $totalKdv = 0.0;
                $totalCommission = 0.0;
                $totalWithholding = 0.0;

                $itemCount = count($scenario['items']);
                $svcFeeShare = round($serviceFee / max(1, $itemCount), 2);
                $shippingShareEach = round($shippingFlat / max(1, $itemCount), 2);

                foreach ($scenario['items'] as $line) {
                    /** @var \App\Models\Offer $offer */
                    $offer = $line['offer'];
                    $qty = (int) $line['qty'];
                    $unitPrice = (float) $offer->price;
                    $totalPrice = round($unitPrice * $qty, 2);

                    $kdvRate = (float) ($offer->product?->category?->vat_rate ?? $defaultKdv);
                    $netPrice = $kdvRate > 0 ? $totalPrice / (1 + $kdvRate / 100) : $totalPrice;
                    $kdvAmount = round($totalPrice - $netPrice, 2);

                    $commissionAmount = round($netPrice * $commissionRate / 100, 2);
                    $withholdingTax = round($netPrice * $stopajRate / 100, 2);
                    $sellerPayout = round($totalPrice - $commissionAmount - $withholdingTax, 2);

                    $subtotal += $totalPrice;
                    $totalKdv += $kdvAmount;
                    $totalCommission += $commissionAmount;
                    $totalWithholding += $withholdingTax;

                    $itemsBuilt[] = [
                        'product_id' => $offer->product_id,
                        'offer_id' => $offer->id,
                        'seller_id' => $seller->id,
                        'quantity' => $qty,
                        'unit_price' => $unitPrice,
                        'total_price' => $totalPrice,
                        'kdv_rate' => $kdvRate,
                        'kdv_amount' => $kdvAmount,
                        'commission_rate' => $commissionRate,
                        'commission_amount' => $commissionAmount,
                        'platform_commission_amount' => $commissionAmount,
                        'service_fee_share' => $svcFeeShare,
                        'marketplace_fee' => 0,
                        'withholding_tax' => $withholdingTax,
                        'shipping_cost_share' => $shippingShareEach,
                        'net_seller_amount' => $sellerPayout,
                        'seller_payout_amount' => $sellerPayout,
                    ];
                }

                $grandTotal = round($subtotal + $shippingFlat + $serviceFee, 2);

                $orderNumber = sprintf('BOSCHTEST%s%04d', $createdAt->format('ymd'), $globalIdx);
                $orderStatus = $scenario['order_status'] ?? 'delivered';
                $subOrderStatus = $scenario['sub_order_status'] ?? 'delivered';
                $shippingStatus = $orderStatus === 'shipped' ? 'shipped' : 'delivered';
                $latestUpdate = $confirmedAt ?? $deliveredAt ?? $shippedAt ?? $createdAt;

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $buyer->id,
                    'subtotal' => round($subtotal, 2),
                    'total_commission' => round($totalCommission, 2),
                    'service_fee_amount' => $serviceFee,
                    'platform_commission_total' => round($totalCommission, 2),
                    'stopaj_total' => round($totalWithholding, 2),
                    'kdv_total' => round($totalKdv, 2),
                    'total_amount' => $grandTotal,
                    'shipping_cost' => $shippingFlat,
                    'shipping_provider' => 'aras',
                    'tracking_number' => 'TEST-'.strtoupper(Str::random(8)),
                    'shipping_status' => $shippingStatus,
                    'shipped_at' => $shippedAt,
                    'delivered_at' => $deliveredAt,
                    'buyer_confirmed_at' => $confirmedAt,
                    'status' => $orderStatus,
                    'payment_status' => 'paid',
                    'payment_method' => 'credit_card',
                    'shipping_address' => $shippingAddress,
                    'notes' => 'Otomatik test siparisi: '.($scenario['label'] ?? 'BoschTestOrdersSeeder'),
                    'created_at' => $createdAt,
                    'updated_at' => $latestUpdate,
                ]);

                $subOrder = SubOrder::create([
                    'order_id' => $order->id,
                    'seller_id' => $seller->id,
                    'status' => $subOrderStatus,
                    'shipped_at' => $shippedAt,
                    'delivered_at' => $deliveredAt,
                    'buyer_confirmed_at' => $confirmedAt,
                    'subtotal' => round($subtotal, 2),
                    'total_commission' => round($totalCommission, 2),
                    'total_payout' => array_sum(array_column($itemsBuilt, 'seller_payout_amount')),
                    'tracking_number' => $order->tracking_number,
                    'shipping_provider' => 'aras',
                    'shipping_status' => $shippingStatus,
                    'created_at' => $createdAt,
                    'updated_at' => $latestUpdate,
                ]);

                foreach ($itemsBuilt as $itemData) {
                    $orderItem = $order->items()->create([
                        ...$itemData,
                        'sub_order_id' => $subOrder->id,
                        'created_at' => $createdAt,
                        'updated_at' => $latestUpdate,
                    ]);

                    // Cuzdana isleme YALNIZCA alici onayladiysa yapilir; aksi
                    // halde sipariş "hakediş bekliyor" değil, "henüz hakedişe
                    // dahil edilmemiş" durumunda kalır (frontend filtreleri
                    // confirmed_at + status==delivered üzerinden çalışır).
                    if (($scenario['confirm'] ?? true) && $subOrderStatus === 'delivered') {
                        $walletService->addOrderEarnings(
                            $seller,
                            $order,
                            (float) $orderItem->total_price,
                            (float) $orderItem->commission_amount,
                            (float) $orderItem->withholding_tax,
                            $orderItem->id,
                            $subOrder->id,
                            (float) $orderItem->shipping_cost_share,
                        );
                    }
                }

                if ($scenario['release']) {
                    $walletService->releasePendingBalance($seller, $order, $subOrder->id);
                }

                $createdOrderIds[] = $order->order_number.' — '.($scenario['label'] ?? '');
            });
        }

        $wallet = SellerWallet::where('seller_id', $seller->id)->first();

        $this->command->info('=== BoschTestOrdersSeeder ===');
        foreach ($createdOrderIds as $on) {
            $this->command->info("  ✓ {$on}");
        }
        $this->command->info('--- Wallet snapshot ---');
        if ($wallet) {
            $this->command->info('  Available     : ₺'.number_format((float) $wallet->balance, 2));
            $this->command->info('  Pending       : ₺'.number_format((float) $wallet->pending_balance, 2));
            $this->command->info('  Total earned  : ₺'.number_format((float) $wallet->total_earned, 2));
            $this->command->info('  Total commission: ₺'.number_format((float) $wallet->total_commission, 2));
        }
        $txCount = WalletTransaction::whereHas('wallet', fn ($q) => $q->where('seller_id', $seller->id))->count();
        $this->command->info("  Transactions  : {$txCount}");
    }
}
