<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * i-hırdavat ilan (offer) seeder'ı.
 *
 * Her ürün için 2-4 farklı bayiden ilan üretir. İlanlar:
 * - `psf` (önerilen satış fiyatı) etrafında ±%15 dağılım
 * - Stok: 5-250 arası (bazıları düşük → "Son N" rozeti test'i için)
 * - Batch no + status='active'
 */
class OfferSeeder extends Seeder
{
    public function run(): void
    {
        $sellers = User::sellers()
            ->where('is_verified', true)
            ->get();

        if ($sellers->isEmpty()) {
            $this->command?->warn('⚠️ Bayi bulunamadı. Önce DemoAccountSeeder çalıştırın.');
            return;
        }

        $products = Product::where('is_active', true)->get();

        if ($products->isEmpty()) {
            $this->command?->warn('⚠️ Ürün bulunamadı. Önce ProductSeeder çalıştırın.');
            return;
        }

        $offerCount = 0;

        foreach ($products as $product) {
            $psf = (float) ($product->psf ?? 500);
            if ($psf <= 0) {
                $psf = 500;
            }

            // Bayi KDV hariç fiyat: PSF'in %70-85'i arasında
            $dealerMin = (int) ($psf * 0.70);
            $dealerMax = (int) ($psf * 0.85);

            // Her ürüne 2-4 satıcıdan ilan (rastgele)
            $pickedSellers = $sellers->random(min($sellers->count(), random_int(2, 4)));
            $lowStockProduct = ($product->id % 7 === 0); // her 7 üründen biri düşük stoklu

            foreach ($pickedSellers as $i => $seller) {
                $dealerPrice = random_int($dealerMin, $dealerMax)
                    + (random_int(0, 99) / 100);

                $stock = $lowStockProduct
                    ? random_int(2, 12)       // düşük — "Son N adet" test
                    : random_int(25, 250);

                Offer::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'seller_id' => $seller->id,
                    ],
                    [
                        'price' => round($dealerPrice, 2),
                        'stock' => $stock,
                        'expiry_date' => now()->addYears(5)->addDays((int) $i),
                        'batch_number' => sprintf('B%d-%d-%d', now()->year, $seller->id, $product->id),
                        'status' => 'active',
                    ]
                );

                $offerCount++;
            }
        }

        $this->command?->info(sprintf(
            '✓ %d ilan (offer) oluşturuldu — %d ürün × 2-4 bayi.',
            $offerCount,
            $products->count(),
        ));
    }
}
