<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Import edilmiş ürünler arasından farklı kategorilerden çeşitli ürünler seçer
 * ve bunlar için 1-3 demo satıcıdan random fiyat/stoklu Offer kayıtları oluşturur.
 *
 * DemoAccountSeeder'ın daha önce çalışmış ve sellerlar oluşmuş olmalıdır.
 * Idempotent: önce mevcut Offer'ları truncate eder.
 */
class TestOfferSeeder extends Seeder
{
    private const PRODUCTS_PER_ROOT_CATEGORY = 8;

    private const OFFER_COUNT_RANGE = [1, 3];

    private const STOCK_RANGE = [5, 200];

    /**
     * PSF'in yüzde kaçından satılacağı (alıcıya bayi indirimi simülasyonu).
     */
    private const PRICE_DISCOUNT_RANGE = [85, 100];

    public function run(): void
    {
        $sellers = User::sellers()->pluck('id')->all();
        if ($sellers === []) {
            $this->command?->warn('⚠️  Hiç seller bulunamadı, TestOfferSeeder atlanıyor.');
            return;
        }

        $rootCats = Category::whereNull('parent_id')->where('is_active', true)->get();
        $createdOffers = 0;
        $touchedProducts = 0;

        foreach ($rootCats as $root) {
            $descendantIds = $root->getDescendantIds();
            $products = Product::query()
                ->whereIn('category_id', $descendantIds)
                ->where('is_active', true)
                ->whereNotNull('psf')
                ->where('psf', '>', 0)
                ->inRandomOrder()
                ->limit(self::PRODUCTS_PER_ROOT_CATEGORY)
                ->get();

            foreach ($products as $product) {
                $touchedProducts++;
                $offerCount = random_int(self::OFFER_COUNT_RANGE[0], self::OFFER_COUNT_RANGE[1]);
                $usedSellers = (array) array_rand(array_flip($sellers), min($offerCount, count($sellers)));
                $usedSellers = is_array($usedSellers) ? $usedSellers : [$usedSellers];

                foreach ($usedSellers as $sellerId) {
                    $discount = random_int(self::PRICE_DISCOUNT_RANGE[0], self::PRICE_DISCOUNT_RANGE[1]) / 100;
                    $price = round((float) $product->psf * $discount, 2);

                    Offer::create([
                        'product_id' => $product->id,
                        'seller_id' => $sellerId,
                        'price' => $price,
                        'stock' => random_int(self::STOCK_RANGE[0], self::STOCK_RANGE[1]),
                        'expiry_date' => null,
                        'batch_number' => null,
                        'status' => Offer::STATUS_ACTIVE,
                    ]);
                    $createdOffers++;
                }
            }
        }

        $this->command?->info(sprintf(
            '✓ TestOfferSeeder: %d ürüne %d satıcıdan toplam %d ilan eklendi.',
            $touchedProducts,
            count($sellers),
            $createdOffers
        ));
    }
}
