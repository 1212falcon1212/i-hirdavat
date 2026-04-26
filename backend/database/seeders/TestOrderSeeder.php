<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Offer;
use App\Models\Order;
use App\Models\OrderItem;

class TestOrderSeeder extends Seeder
{
    /**
     * User 6 için test siparişleri oluştur
     */
    public function run(): void
    {
        $sellerId = 6;
        $buyerId = 7; // buyer@ihirdavat.com

        // User 6 için önce teklifler oluştur
        $products = Product::inRandomOrder()->limit(10)->get();
        $offersCreated = 0;

        foreach ($products as $product) {
            // Mevcut teklif var mı kontrol et
            if (!Offer::where('seller_id', $sellerId)->where('product_id', $product->id)->exists()) {
                Offer::create([
                    'seller_id' => $sellerId,
                    'product_id' => $product->id,
                    'price' => rand(50, 500),
                    'stock' => rand(50, 200),
                    'expiry_date' => now()->addMonths(rand(6, 18)),
                    'batch_number' => 'BN' . rand(1000, 9999),
                    'status' => 'active',
                ]);
                $offersCreated++;
            }
        }
        $this->command->info("User 6 için {$offersCreated} teklif oluşturuldu.");

        // User 6'nın tekliflerini al
        $offers = Offer::where('seller_id', $sellerId)->where('status', 'active')->with('product.category')->limit(5)->get();
        $this->command->info("User 6 teklif sayısı: " . $offers->count());

        // Test siparişleri oluştur (3 adet)
        $statuses = [
            ['status' => 'confirmed', 'payment' => 'paid'],
            ['status' => 'processing', 'payment' => 'paid'],
            ['status' => 'pending', 'payment' => 'paid'],
        ];

        foreach ($statuses as $index => $statusData) {
            $orderNumber = 'ORD-TEST-' . time() . '-' . ($index + 1);

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $buyerId,
                'subtotal' => 0,
                'total_commission' => 0,
                'total_amount' => 0,
                'status' => $statusData['status'],
                'payment_status' => $statusData['payment'],
                'shipping_status' => 'pending',
                'shipping_address' => [
                    'name' => 'Test Alıcı',
                    'phone' => '05551234567',
                    'address' => 'Test Mahallesi, Test Sokak No:1',
                    'city' => 'İstanbul',
                    'district' => 'Kadıköy',
                ],
            ]);

            $subtotal = 0;
            $totalCommission = 0;

            // Her siparişe 2-3 ürün ekle
            $orderOffers = $offers->random(min(rand(2, 3), $offers->count()));

            foreach ($orderOffers as $offer) {
                $quantity = rand(2, 5);
                $unitPrice = $offer->price;
                $totalPrice = $quantity * $unitPrice;
                $commissionRate = $offer->product->category->commission_rate ?? 8;
                $commissionAmount = $totalPrice * ($commissionRate / 100);
                $sellerPayout = $totalPrice - $commissionAmount;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $offer->product_id,
                    'offer_id' => $offer->id,
                    'seller_id' => $sellerId,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $commissionAmount,
                    'seller_payout_amount' => $sellerPayout,
                ]);

                $subtotal += $totalPrice;
                $totalCommission += $commissionAmount;
            }

            $order->update([
                'subtotal' => $subtotal,
                'total_commission' => $totalCommission,
                'total_amount' => $subtotal,
            ]);

            $this->command->info("Sipariş: {$orderNumber} ({$statusData['status']}) - Tutar: " . number_format($subtotal, 2) . " TL");
        }

        $this->command->info('Tamamlandı! User 6 için 3 test siparişi oluşturuldu.');
    }
}
