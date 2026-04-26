<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Demo alıcıyı al
        $buyer = User::where('email', 'buyer@ihirdavat.com')->first();

        if (!$buyer) {
            $this->command->warn('⚠️ Alıcı bulunamadı. Önce DemoAccountSeeder çalıştırın.');
            return;
        }

        // Aktif teklifleri al
        $offers = Offer::where('status', 'active')
            ->with(['product', 'seller'])
            ->inRandomOrder()
            ->take(50)
            ->get();

        if ($offers->isEmpty()) {
            $this->command->warn('⚠️ Teklif bulunamadı. Önce OfferSeeder çalıştırın.');
            return;
        }

        // Sipariş durumları
        $statuses = [
            'pending' => 'pending',
            'confirmed' => 'paid',
            'shipped' => 'paid',
            'delivered' => 'paid',
            'cancelled' => 'refunded',
        ];

        $orderCount = 0;
        $usedOffers = collect();

        // 20 sipariş oluştur
        for ($i = 0; $i < 20; $i++) {
            // Rastgele 1-5 teklif seç
            $itemCount = rand(1, 5);
            $selectedOffers = $offers->whereNotIn('id', $usedOffers)->take($itemCount);

            if ($selectedOffers->isEmpty()) {
                break;
            }

            // Sipariş tarihi (son 30 gün içinde rastgele)
            $orderDate = Carbon::now()->subDays(rand(0, 30));

            // Durum seç
            $statusKeys = array_keys($statuses);
            $statusKey = $statusKeys[array_rand($statusKeys)];
            $paymentStatus = $statuses[$statusKey];

            // Ara toplam ve komisyon hesapla
            $subtotal = 0;
            $totalCommission = 0;

            foreach ($selectedOffers as $offer) {
                $quantity = rand(1, 3);
                $itemTotal = $offer->price * $quantity;
                $commissionRate = $offer->product->category->commission_rate ?? 8;
                $commission = $itemTotal * ($commissionRate / 100);

                $subtotal += $itemTotal;
                $totalCommission += $commission;
            }

            // Shipping address JSON olarak
            $shippingAddress = json_encode([
                'name' => $buyer->seller_name,
                'address' => $buyer->address ?? 'Test Adres',
                'city' => $buyer->city ?? 'İstanbul',
                'district' => 'Merkez',
                'phone' => $buyer->phone ?? '05361112233',
            ]);

            // Sipariş oluştur
            $order = Order::create([
                'user_id' => $buyer->id,
                'order_number' => 'EP-' . date('Ymd', $orderDate->timestamp) . '-' . str_pad($orderCount + 1, 4, '0', STR_PAD_LEFT),
                'status' => $statusKey,
                'payment_status' => $paymentStatus,
                'subtotal' => $subtotal,
                'total_commission' => $totalCommission,
                'total_amount' => $subtotal,
                'shipping_address' => $shippingAddress,
                'notes' => null,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            // Sipariş öğelerini oluştur
            foreach ($selectedOffers as $offer) {
                $quantity = rand(1, 3);
                $unitPrice = $offer->price;
                $commissionRate = $offer->product->category->commission_rate ?? 8;
                $commission = $unitPrice * $quantity * ($commissionRate / 100);

                OrderItem::create([
                    'order_id' => $order->id,
                    'offer_id' => $offer->id,
                    'product_id' => $offer->product_id,
                    'seller_id' => $offer->seller_id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $unitPrice * $quantity,
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $commission,
                    'seller_payout_amount' => ($unitPrice * $quantity) - $commission,
                ]);

                $usedOffers->push($offer->id);
            }

            $orderCount++;
        }

        $this->command->info("✅ {$orderCount} sipariş oluşturuldu.");
    }
}
