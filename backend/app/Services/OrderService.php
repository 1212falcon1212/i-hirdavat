<?php

namespace App\Services;

use App\Events\OrderCreated;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Setting;
use App\Models\SubOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    protected CartService $cartService;

    protected OrderPricingService $pricingService;

    public function __construct(CartService $cartService, OrderPricingService $pricingService)
    {
        $this->cartService = $cartService;
        $this->pricingService = $pricingService;
    }

    /**
     * Create an order from cart
     */
    public function createFromCart(
        Cart $cart,
        array $shippingAddress,
        ?string $notes = null,
        ?string $shippingProvider = null,
        float $shippingCost = 0,
        string $paymentMethod = 'credit_card'
    ): Order {
        // Validate cart first
        $issues = $this->cartService->validateCart($cart);
        $criticalIssues = array_filter($issues, fn ($i) => in_array($i['type'], ['unavailable', 'stock']));

        if (! empty($criticalIssues)) {
            throw new \Exception('Sepetinizde düzeltilmesi gereken sorunlar var.');
        }

        // Sync prices to current values
        $this->cartService->syncPrices($cart);
        $cart->refresh();
        $cart->load(['items.product.category', 'items.offer', 'items.seller']);

        if ($cart->isEmpty()) {
            throw new \Exception('Sepetiniz boş.');
        }

        // Minimum sipariş tutarı kontrolü
        $minOrderAmount = (float) Setting::getValue('commission.min_order_amount', 2000);
        $cartTotal = $cart->items->sum(fn ($i) => $i->price_at_addition * $i->quantity);
        if ($cartTotal < $minOrderAmount) {
            throw new \Exception('Minimum sipariş tutarı ₺'.number_format($minOrderAmount, 0, ',', '.')."'dir.");
        }

        // Pricing breakdown'u OrderPricingService'ten al — komisyon, KDV, stopaj,
        // hizmet bedeli ve kargo TEK kaynaktan hesaplanır. Sipariş anında snapshot
        // alınır; sonradan ayar değişirse mevcut sipariş etkilenmez.
        $breakdown = $this->pricingService->calculateForCart($cart);

        return DB::transaction(function () use ($cart, $shippingAddress, $notes, $shippingProvider, $shippingCost, $paymentMethod, $breakdown) {
            $orderNumber = $this->generateOrderNumber();
            $defaultKdvRate = (float) ($breakdown['meta']['default_kdv_rate'] ?? 20.00);

            // Group items by seller for service-fee share allocation.
            $sellerItemCounts = [];
            foreach ($cart->items as $item) {
                $sid = $item->seller_id;
                $sellerItemCounts[$sid] = ($sellerItemCounts[$sid] ?? 0) + 1;
            }

            // Calculate per-item snapshots
            $orderItemsData = [];
            $totalCommission = 0.0;
            $totalWithholding = 0.0;
            $totalKdv = 0.0;
            $totalServiceFeeShare = 0.0;

            foreach ($cart->items as $item) {
                $unitPrice = (float) $item->price_at_addition;
                $quantity = (int) $item->quantity;
                $totalPrice = $unitPrice * $quantity;

                $kdvRate = (float) ($item->product?->category?->vat_rate ?? $defaultKdvRate);
                $netPrice = $kdvRate > 0 ? $totalPrice / (1 + $kdvRate / 100) : $totalPrice;
                $kdvAmount = round($totalPrice - $netPrice, 2);

                $sellerBreakdown = $breakdown['per_seller'][$item->seller_id] ?? null;

                // Komisyon: KDV-hariç kalem geliri × commission_rate
                $commissionRate = (float) ($breakdown['meta']['commission_rate'] ?? 10);
                $commissionEnabled = (bool) ($breakdown['meta']['commission_enabled'] ?? true);
                $commissionAmount = $commissionEnabled
                    ? round($netPrice * $commissionRate / 100, 2)
                    : 0.0;

                // Stopaj: KDV-hariç kalem geliri × stopaj_rate
                $stopajRate = (float) ($breakdown['meta']['stopaj_rate'] ?? 20);
                $stopajEnabled = (bool) ($breakdown['meta']['stopaj_enabled'] ?? true);
                $withholdingTax = $stopajEnabled
                    ? round($netPrice * $stopajRate / 100, 2)
                    : 0.0;

                // Hizmet bedeli payı (raporlama amaçlı — satıcı kesintisinde kullanılmaz):
                $svcFeeEnabled = (bool) ($breakdown['meta']['service_fee_enabled'] ?? true);
                $svcFee = (float) ($breakdown['meta']['service_fee'] ?? 50);
                $totalItems = max(1, array_sum($sellerItemCounts));
                $serviceFeeShare = $svcFeeEnabled
                    ? round($svcFee * (1 / $totalItems), 2)
                    : 0.0;

                // Kargo payı: satıcı kargo toplamını o satıcıdaki kalem sayısına böl.
                $sellerShipping = $sellerBreakdown['shipping'] ?? 0.0;
                $shippingShare = $sellerItemCounts[$item->seller_id] > 0
                    ? round($sellerShipping / $sellerItemCounts[$item->seller_id], 2)
                    : 0.0;

                // Net satıcı hakedişi: gross − komisyon − stopaj − hizmet bedeli − kargo
                // (B2B modeli — tüm platform/devlet/kargo kesintileri satıcının
                // brüt cirosundan düşülür).
                $sellerPayoutAmount = round(
                    $totalPrice - $commissionAmount - $withholdingTax - $serviceFeeShare - $shippingShare,
                    2
                );
                $netSellerAmount = $sellerPayoutAmount;

                $totalCommission += $commissionAmount;
                $totalWithholding += $withholdingTax;
                $totalKdv += $kdvAmount;
                $totalServiceFeeShare += $serviceFeeShare;

                $orderItemsData[] = [
                    'product_id' => $item->product_id,
                    'offer_id' => $item->offer_id,
                    'seller_id' => $item->seller_id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => round($totalPrice, 2),
                    'kdv_rate' => $kdvRate,
                    'kdv_amount' => $kdvAmount,
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $commissionAmount,
                    'platform_commission_amount' => $commissionAmount,
                    'service_fee_share' => $serviceFeeShare,
                    'marketplace_fee' => 0,
                    'withholding_tax' => $withholdingTax,
                    'shipping_cost_share' => $shippingShare,
                    'net_seller_amount' => $netSellerAmount,
                    'seller_payout_amount' => $sellerPayoutAmount,
                ];

                // Decrease stock
                if (! $item->offer->decreaseStock($quantity)) {
                    throw new \Exception("Stok yetersiz: {$item->product->name}");
                }
            }

            $itemsSubtotal = (float) $breakdown['items_subtotal'];
            $shippingTotal = (float) $breakdown['shipping_total'];
            $serviceFeeAmount = (float) $breakdown['service_fee'];
            $grandTotal = (float) $breakdown['grand_total'];

            // Yasal: kargo ücreti, hizmet bedeli ve KDV alıcının ödeyeceği tutara
            // dahildir; total_amount = grand_total. Eski kolon `shipping_cost`
            // alıcının kargo bedelini taşır (geriye uyumluluk).
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $cart->user_id,
                'subtotal' => $itemsSubtotal,
                'total_commission' => $totalCommission,
                'service_fee_amount' => $serviceFeeAmount,
                'platform_commission_total' => $totalCommission,
                'stopaj_total' => $totalWithholding,
                'kdv_total' => $totalKdv,
                'total_amount' => $grandTotal,
                'shipping_cost' => $shippingTotal > 0 ? $shippingTotal : $shippingCost,
                'shipping_provider' => $shippingProvider,
                'payment_method' => $paymentMethod,
                'status' => 'pending',
                'payment_status' => 'pending',
                'shipping_address' => $shippingAddress,
                'notes' => $notes,
            ]);

            // Create sub-orders grouped by seller, then create order items under each
            $itemsBySeller = collect($orderItemsData)->groupBy('seller_id');

            foreach ($itemsBySeller as $sellerId => $sellerItems) {
                $subOrder = SubOrder::create([
                    'order_id' => $order->id,
                    'seller_id' => $sellerId,
                    'status' => 'pending',
                    'subtotal' => $sellerItems->sum('total_price'),
                    'total_commission' => $sellerItems->sum('commission_amount'),
                    'total_payout' => $sellerItems->sum('seller_payout_amount'),
                ]);

                foreach ($sellerItems as $itemData) {
                    $order->items()->create([
                        ...$itemData,
                        'sub_order_id' => $subOrder->id,
                    ]);
                }
            }

            // Mark cart as converted
            $cart->markAsConverted();

            // Load items with relations for notifications
            $order->load('items.product', 'items.seller', 'subOrders', 'user');

            // Don't notify on order creation - notify after payment confirmed
            // app(NotificationService::class)->notifyOrderCreated($order);

            // Siparis olusturuldu event'i tetikle (e-posta vb. listener'lar dinler)
            event(new OrderCreated($order));

            return $order;
        });
    }

    /**
     * Generate unique order number
     */
    public function generateOrderNumber(): string
    {
        $prefix = 'IHR'; // iHirdavat
        $date = now()->format('ymd');
        $random = strtoupper(Str::random(4));
        $sequence = str_pad(Order::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$date}{$sequence}{$random}";
    }

    /**
     * Cancel an order
     */
    public function cancelOrder(Order $order): void
    {
        if (! $order->canBeCancelled()) {
            throw new \Exception('Bu sipariş iptal edilemez.');
        }

        DB::transaction(function () use ($order) {
            // Restore stock for each item
            foreach ($order->items as $item) {
                if ($item->offer) {
                    $item->offer->increment('stock', $item->quantity);
                    if ($item->offer->status === 'sold_out') {
                        $item->offer->update(['status' => 'active']);
                    }
                }
            }

            $order->cancel();
        });
    }

    /**
     * Get order by ID with relations
     */
    public function getOrder(int $orderId): ?Order
    {
        return Order::with(['items.product', 'items.seller', 'subOrders.seller:id,seller_name,nickname,city', 'user'])
            ->find($orderId);
    }

    /**
     * Get user's orders
     */
    public function getUserOrders(int $userId, int $perPage = 10)
    {
        return Order::forUser($userId)
            ->with(['items.product', 'items.seller:id,seller_name,nickname,city,role', 'subOrders.seller:id,seller_name,nickname,city'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
