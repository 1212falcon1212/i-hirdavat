<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\SellerWallet;
use App\Models\Setting;
use App\Models\SubOrder;
use App\Models\User;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SettlementService
{
    /**
     * Get upcoming (not yet released) settlements grouped by expected release date
     * Now uses sub_orders for per-seller settlement tracking
     */
    public function getUpcomingSettlements(User $seller): array
    {
        $holdDays = (int) Setting::getValue('payment.hold_days', 35);

        $wallet = SellerWallet::where('seller_id', $seller->id)->first();
        if (! $wallet) {
            return [];
        }

        // Get sub_order IDs that have already been released
        $releasedSubOrderIds = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', WalletTransaction::TYPE_RELEASE)
            ->whereNotNull('sub_order_id')
            ->pluck('sub_order_id')
            ->toArray();

        // Also get order IDs for backward compat (pre-suborder releases)
        $releasedOrderIds = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', WalletTransaction::TYPE_RELEASE)
            ->whereNotNull('order_id')
            ->whereNull('sub_order_id')
            ->pluck('order_id')
            ->toArray();

        // Find confirmed sub_orders with pending earnings (exclude returned)
        $pendingSubOrders = SubOrder::where('seller_id', $seller->id)
            ->where('status', 'delivered')
            ->where('status', '!=', 'returned')
            ->whereNotNull('buyer_confirmed_at')
            ->whereNotIn('id', $releasedSubOrderIds)
            ->whereHas('order', fn ($q) => $q->where('payment_status', 'paid')->whereNotIn('id', $releasedOrderIds))
            ->with(['items.product', 'order'])
            ->orderBy('buyer_confirmed_at')
            ->get();

        // Group by expected release date
        $groups = [];
        foreach ($pendingSubOrders as $subOrder) {
            $releaseDate = Carbon::parse($subOrder->buyer_confirmed_at)->addDays($holdDays)->format('Y-m-d');
            if (! isset($groups[$releaseDate])) {
                $groups[$releaseDate] = [
                    'date' => $releaseDate,
                    'sub_orders' => [],
                ];
            }
            $groups[$releaseDate]['sub_orders'][] = $subOrder;
        }

        // Build settlement groups
        $result = [];
        foreach ($groups as $date => $group) {
            $releaseDateCarbon = Carbon::parse($date);
            $totals = $this->calculateSubOrderGroupTotals($group['sub_orders']);

            $result[] = [
                'date' => $date,
                'date_formatted' => $releaseDateCarbon->locale('tr')->translatedFormat('d F Y'),
                'days_remaining' => max(0, (int) now()->startOfDay()->diffInDays($releaseDateCarbon->startOfDay(), false)),
                'total_sales' => round($totals['total_sales'], 2),
                'total_commission' => round($totals['total_commission'], 2),
                'total_service_fee' => round($totals['total_service_fee'], 2),
                'total_withholding_tax' => round($totals['total_withholding_tax'], 2),
                'total_shipping_share' => round($totals['total_shipping_share'], 2),
                'total_refunds' => round($totals['total_refunds'], 2),
                'net_amount' => round($totals['net_amount'], 2),
                'order_count' => count($group['sub_orders']),
                'item_count' => $totals['item_count'],
            ];
        }

        usort($result, fn ($a, $b) => strcmp($a['date'], $b['date']));

        return $result;
    }

    /**
     * Get past (released) settlements grouped by release date
     */
    public function getPastSettlements(User $seller): array
    {
        $wallet = SellerWallet::where('seller_id', $seller->id)->first();
        if (! $wallet) {
            return [];
        }

        // Get release transactions grouped by date
        $releases = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', WalletTransaction::TYPE_RELEASE)
            ->whereNotNull('order_id')
            ->orderByDesc('created_at')
            ->get();

        if ($releases->isEmpty()) {
            return [];
        }

        // Group by release date
        $groups = [];
        foreach ($releases as $release) {
            $dateKey = Carbon::parse($release->created_at)->format('Y-m-d');
            if (! isset($groups[$dateKey])) {
                $groups[$dateKey] = [
                    'date' => $dateKey,
                    'order_ids' => [],
                    'total_released' => 0,
                ];
            }
            $groups[$dateKey]['order_ids'][] = $release->order_id;
            $groups[$dateKey]['total_released'] += (float) $release->amount;
        }

        $result = [];
        foreach ($groups as $dateKey => $group) {
            $releaseDateCarbon = Carbon::parse($dateKey)->locale('tr');

            // Get order items for these orders
            $orders = Order::whereIn('id', array_unique($group['order_ids']))
                ->whereHas('items', fn ($q) => $q->where('seller_id', $seller->id))
                ->with(['items' => fn ($q) => $q->where('seller_id', $seller->id)])
                ->get();

            $totals = $this->calculateGroupTotals($orders, $seller->id);

            $result[] = [
                'date' => $dateKey,
                'date_formatted' => $releaseDateCarbon->translatedFormat('d F Y'),
                'days_remaining' => 0,
                'total_sales' => round($totals['total_sales'], 2),
                'total_commission' => round($totals['total_commission'], 2),
                'total_service_fee' => round($totals['total_service_fee'], 2),
                'total_withholding_tax' => round($totals['total_withholding_tax'], 2),
                'total_shipping_share' => round($totals['total_shipping_share'], 2),
                'total_refunds' => round($totals['total_refunds'], 2),
                'net_amount' => round($group['total_released'], 2),
                'order_count' => count($orders),
                'item_count' => $totals['item_count'],
            ];
        }

        // Sort by date descending (newest first)
        usort($result, fn ($a, $b) => strcmp($b['date'], $a['date']));

        return $result;
    }

    /**
     * Get settlement details for a specific date
     */
    public function getSettlementDetails(User $seller, string $date, string $type = 'upcoming'): array
    {
        $holdDays = (int) Setting::getValue('payment.hold_days', 35);
        $wallet = SellerWallet::where('seller_id', $seller->id)->first();

        if (! $wallet) {
            return ['summary' => [], 'details' => []];
        }

        if ($type === 'upcoming') {
            $orders = $this->getUpcomingOrdersForDate($seller, $date, $holdDays, $wallet);
        } else {
            $orders = $this->getPastOrdersForDate($seller, $date, $wallet);
        }

        if ($orders->isEmpty()) {
            return ['summary' => [], 'details' => []];
        }

        return $this->buildDetailsResponse($orders, $seller->id);
    }

    /**
     * Get summary statistics for all upcoming settlements (sub_order based)
     */
    public function getUpcomingSummary(User $seller): array
    {
        $wallet = SellerWallet::where('seller_id', $seller->id)->first();
        if (! $wallet) {
            return [
                'total_sales' => 0,
                'total_commission' => 0,
                'total_service_fee' => 0,
                'total_withholding_tax' => 0,
                'total_shipping_share' => 0,
                'total_refunds' => 0,
                'net_estimated_total' => 0,
            ];
        }

        $releasedSubOrderIds = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', WalletTransaction::TYPE_RELEASE)
            ->whereNotNull('sub_order_id')
            ->pluck('sub_order_id')
            ->toArray();

        $releasedOrderIds = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', WalletTransaction::TYPE_RELEASE)
            ->whereNotNull('order_id')
            ->whereNull('sub_order_id')
            ->pluck('order_id')
            ->toArray();

        $pendingSubOrders = SubOrder::where('seller_id', $seller->id)
            ->where('status', 'delivered')
            ->where('status', '!=', 'returned')
            ->whereNotNull('buyer_confirmed_at')
            ->whereNotIn('id', $releasedSubOrderIds)
            ->whereHas('order', fn ($q) => $q->where('payment_status', 'paid')->whereNotIn('id', $releasedOrderIds))
            ->with('items')
            ->get();

        $totals = $this->calculateSubOrderGroupTotals($pendingSubOrders);

        return [
            'total_sales' => round($totals['total_sales'], 2),
            'total_commission' => round($totals['total_commission'], 2),
            'total_service_fee' => round($totals['total_service_fee'], 2),
            'total_withholding_tax' => round($totals['total_withholding_tax'], 2),
            'total_shipping_share' => round($totals['total_shipping_share'], 2),
            'total_refunds' => round($totals['total_refunds'], 2),
            'net_estimated_total' => round($totals['net_amount'], 2),
        ];
    }

    /**
     * Sipariş grubu için satıcı toplamlarını hesaplar.
     *
     * B2B model — net = gross − komisyon − stopaj − hizmet bedeli − kargo − iade.
     * Tüm kesintiler order_items üzerindeki SNAPSHOT alanlarından okunur.
     */
    private function calculateGroupTotals(Collection|array $orders, int $sellerId): array
    {
        $totalSales = 0.0;
        $totalCommission = 0.0;
        $totalWithholding = 0.0;
        $totalServiceFee = 0.0;
        $totalShipping = 0.0;
        $itemCount = 0;

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                if ((int) $item->seller_id !== $sellerId) {
                    continue;
                }

                $totalSales += (float) $item->total_price;
                $totalCommission += (float) ($item->commission_amount ?? 0);
                $totalWithholding += (float) ($item->withholding_tax ?? 0);
                $totalServiceFee += (float) ($item->service_fee_share ?? 0);
                $totalShipping += (float) ($item->shipping_cost_share ?? 0);
                $itemCount += (int) $item->quantity;
            }
        }

        $orderIds = collect($orders)->pluck('id')->unique()->filter()->toArray();
        $totalRefunds = 0.0;
        if (! empty($orderIds)) {
            $totalRefunds = (float) ReturnRequest::whereIn('order_id', $orderIds)
                ->where('seller_id', $sellerId)
                ->whereIn('status', ['approved', 'refunded'])
                ->sum('refund_amount');
        }

        $netAmount = $totalSales - $totalCommission - $totalWithholding
            - $totalServiceFee - $totalShipping - $totalRefunds;

        return [
            'total_sales' => $totalSales,
            'total_commission' => $totalCommission,
            'total_withholding_tax' => $totalWithholding,
            'total_service_fee' => $totalServiceFee,
            'total_shipping_share' => $totalShipping,
            'total_refunds' => $totalRefunds,
            'net_amount' => $netAmount,
            'item_count' => $itemCount,
        ];
    }

    /**
     * Sub-order grubu için satıcı toplamlarını hesaplar (tüm kalemler aynı satıcıdan).
     *
     * B2B model — net = gross − komisyon − stopaj − hizmet bedeli − kargo − iade.
     */
    private function calculateSubOrderGroupTotals(Collection|array $subOrders): array
    {
        $totalSales = 0.0;
        $totalCommission = 0.0;
        $totalWithholding = 0.0;
        $totalServiceFee = 0.0;
        $totalShipping = 0.0;
        $itemCount = 0;

        foreach ($subOrders as $subOrder) {
            foreach ($subOrder->items as $item) {
                $totalSales += (float) $item->total_price;
                $totalCommission += (float) ($item->commission_amount ?? 0);
                $totalWithholding += (float) ($item->withholding_tax ?? 0);
                $totalServiceFee += (float) ($item->service_fee_share ?? 0);
                $totalShipping += (float) ($item->shipping_cost_share ?? 0);
                $itemCount += (int) $item->quantity;
            }
        }

        $allItemIds = collect($subOrders)->flatMap(fn ($so) => $so->items->pluck('id'))->unique()->filter()->toArray();
        $totalRefunds = 0.0;
        if (! empty($allItemIds)) {
            $totalRefunds = (float) ReturnRequest::whereIn('order_item_id', $allItemIds)
                ->whereIn('status', ['approved', 'refunded'])
                ->sum('refund_amount');
        }

        $netAmount = $totalSales - $totalCommission - $totalWithholding
            - $totalServiceFee - $totalShipping - $totalRefunds;

        return [
            'total_sales' => $totalSales,
            'total_commission' => $totalCommission,
            'total_withholding_tax' => $totalWithholding,
            'total_service_fee' => $totalServiceFee,
            'total_shipping_share' => $totalShipping,
            'total_refunds' => $totalRefunds,
            'net_amount' => $netAmount,
            'item_count' => $itemCount,
        ];
    }

    /**
     * Get upcoming sub_orders for a specific expected release date
     * Returns as a Collection of "virtual order" objects for backward-compat with buildDetailsResponse
     */
    private function getUpcomingOrdersForDate(User $seller, string $date, int $holdDays, SellerWallet $wallet): Collection
    {
        $releasedSubOrderIds = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', WalletTransaction::TYPE_RELEASE)
            ->whereNotNull('sub_order_id')
            ->pluck('sub_order_id')
            ->toArray();

        $releasedOrderIds = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', WalletTransaction::TYPE_RELEASE)
            ->whereNotNull('order_id')
            ->whereNull('sub_order_id')
            ->pluck('order_id')
            ->toArray();

        // Calculate the confirmation date range that would result in this release date
        $releaseDate = Carbon::parse($date);
        $confirmStart = $releaseDate->copy()->subDays($holdDays)->startOfDay();
        $confirmEnd = $releaseDate->copy()->subDays($holdDays)->endOfDay();

        // Query sub_orders by THEIR buyer_confirmed_at (not parent order's)
        $subOrders = SubOrder::where('seller_id', $seller->id)
            ->where('status', 'delivered')
            ->where('status', '!=', 'returned')
            ->whereNotNull('buyer_confirmed_at')
            ->whereNotIn('id', $releasedSubOrderIds)
            ->whereBetween('buyer_confirmed_at', [$confirmStart, $confirmEnd])
            ->whereHas('order', fn ($q) => $q->where('payment_status', 'paid')->whereNotIn('id', $releasedOrderIds))
            ->with(['items.product', 'order'])
            ->get();

        // Map sub_orders to order-like objects for buildDetailsResponse compatibility
        return $subOrders->map(function ($subOrder) {
            $order = $subOrder->order;
            $order->setRelation('items', $subOrder->items);

            return $order;
        });
    }

    /**
     * Get past orders for a specific release date
     */
    private function getPastOrdersForDate(User $seller, string $date, SellerWallet $wallet): Collection
    {
        $dateStart = Carbon::parse($date)->startOfDay();
        $dateEnd = Carbon::parse($date)->endOfDay();

        $orderIds = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', WalletTransaction::TYPE_RELEASE)
            ->whereNotNull('order_id')
            ->whereBetween('created_at', [$dateStart, $dateEnd])
            ->pluck('order_id')
            ->unique()
            ->toArray();

        return Order::whereIn('id', $orderIds)
            ->whereHas('items', fn ($q) => $q->where('seller_id', $seller->id))
            ->with(['items' => fn ($q) => $q->where('seller_id', $seller->id)->with('product')])
            ->get();
    }

    /**
     * Build the details response with summary rows and per-order detail rows
     */
    private function buildDetailsResponse(Collection $orders, int $sellerId): array
    {
        $totals = $this->calculateGroupTotals($orders, $sellerId);

        // Oran etiketleri SNAPSHOT'tan türetilir (tarihsel doğruluk).
        // Snapshot yoksa mevcut ayarları fallback olarak kullan.
        $netSales = 0.0;
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                if ((int) $item->seller_id !== $sellerId) {
                    continue;
                }
                $netSales += (float) $item->total_price - (float) ($item->kdv_amount ?? 0);
            }
        }
        $netSales = max(0.01, $netSales);

        $commissionRate = $totals['total_commission'] > 0
            ? round(($totals['total_commission'] / $netSales) * 100, 2)
            : (float) Setting::getValue('commission.platform_commission_rate',
                (float) Setting::getValue('commission.commission_percentage', 10));
        $stopajRate = $totals['total_withholding_tax'] > 0
            ? round(($totals['total_withholding_tax'] / $netSales) * 100, 2)
            : (float) Setting::getValue('commission.stopaj_rate',
                (float) Setting::getValue('commission.withholding_tax_rate', 20));

        // Summary rows — net = gross - komisyon - stopaj - iadeler.
        // Kargo ve hizmet bedeli alıcıya yansıdığı için satıcı netinden DÜŞMEZ.
        $summary = [
            [
                'label' => 'Satış Tutarı',
                'description' => 'Ürün satış gelirleri',
                'amount' => round($totals['total_sales'], 2),
                'type' => 'credit',
            ],
        ];

        if ($totals['total_commission'] > 0) {
            $summary[] = [
                'label' => "Komisyon (%{$commissionRate})",
                'description' => 'Platform komisyonu (KDV hariç tutar üzerinden)',
                'amount' => round(-$totals['total_commission'], 2),
                'type' => 'debit',
            ];
        }

        if ($totals['total_withholding_tax'] > 0) {
            $summary[] = [
                'label' => "Stopaj (%{$stopajRate})",
                'description' => 'E-ticaret stopajı (KDV hariç tutar üzerinden)',
                'amount' => round(-$totals['total_withholding_tax'], 2),
                'type' => 'debit',
            ];
        }

        if ($totals['total_service_fee'] > 0) {
            $summary[] = [
                'label' => 'Hizmet Bedeli',
                'description' => 'Sipariş başına platform hizmet bedeli',
                'amount' => round(-$totals['total_service_fee'], 2),
                'type' => 'debit',
            ];
        }

        if ($totals['total_shipping_share'] > 0) {
            $summary[] = [
                'label' => 'Kargo Payı',
                'description' => 'Bu siparişe düşen kargo bedeli',
                'amount' => round(-$totals['total_shipping_share'], 2),
                'type' => 'debit',
            ];
        }

        if ($totals['total_refunds'] > 0) {
            $summary[] = [
                'label' => 'İade Kesintisi',
                'description' => 'Onaylanan iade talepleri tutarı',
                'amount' => round(-$totals['total_refunds'], 2),
                'type' => 'debit',
            ];
        }

        $summary[] = [
            'label' => 'Net Hakediş',
            'description' => '',
            'amount' => round($totals['net_amount'], 2),
            'type' => 'total',
        ];

        // Detail rows (per order, not per item) — snapshot tabanlı, B2B model.
        $details = [];
        foreach ($orders as $order) {
            $orderTotal = 0.0;
            $orderCommission = 0.0;
            $orderWithholding = 0.0;
            $orderServiceFee = 0.0;
            $orderShipping = 0.0;
            $orderItemCount = 0;

            foreach ($order->items as $item) {
                if ((int) $item->seller_id !== $sellerId) {
                    continue;
                }
                $orderTotal += (float) $item->total_price;
                $orderCommission += (float) ($item->commission_amount ?? 0);
                $orderWithholding += (float) ($item->withholding_tax ?? 0);
                $orderServiceFee += (float) ($item->service_fee_share ?? 0);
                $orderShipping += (float) ($item->shipping_cost_share ?? 0);
                $orderItemCount += (int) $item->quantity;
            }

            if ($orderTotal <= 0) {
                continue;
            }

            // Net = gross − komisyon − stopaj − hizmet bedeli − kargo
            $orderNet = $orderTotal - $orderCommission - $orderWithholding
                - $orderServiceFee - $orderShipping;

            $orderItems = [];
            foreach ($order->items as $item) {
                if ((int) $item->seller_id !== $sellerId) {
                    continue;
                }
                $orderItems[] = [
                    'product_name' => $item->product?->name ?? 'Ürün',
                    'quantity' => (int) $item->quantity,
                    'unit_price' => round((float) $item->unit_price, 2),
                    'total_price' => round((float) $item->total_price, 2),
                ];
            }

            $details[] = [
                'order_number' => $order->order_number,
                'order_date' => Carbon::parse($order->created_at)->format('d.m.Y'),
                'item_count' => $orderItemCount,
                'total_price' => round($orderTotal, 2),
                'commission' => round($orderCommission, 2),
                // 'service_fee' artık GERÇEK hizmet bedelidir (eski kullanım
                // komisyon değildi: legacy alias kaldırıldı).
                'service_fee' => round($orderServiceFee, 2),
                'withholding_tax' => round($orderWithholding, 2),
                'shipping_share' => round($orderShipping, 2),
                'net_amount' => round($orderNet, 2),
                'items' => $orderItems,
            ];
        }

        return [
            'summary' => $summary,
            'details' => $details,
        ];
    }
}
