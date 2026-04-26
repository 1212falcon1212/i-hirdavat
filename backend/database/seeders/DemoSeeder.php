<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * i-hirdavat demo data seeder — örnek ürün + teklif + kullanıcı verisi.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin user (no GLN)
        User::updateOrCreate(
            ['email' => 'admin@i-hirdavat.com'],
            [
                'password' => Hash::make('password'),
                'seller_name' => 'i-hırdavat Admin',
                'nickname' => 'admin',
                'tax_number' => '9999999999',
                'city' => 'İstanbul',
                'role' => User::ROLE_SUPER_ADMIN,
                'is_verified' => true,
                'verified_at' => now(),
                'verification_status' => 'approved',
            ]
        );

        // Create demo seller (bayi) users
        $sellers = [
            ['email' => 'anadolu.hirdavat@i-hirdavat.com', 'seller_name' => 'Anadolu Hırdavat',     'tax_number' => '1111111111', 'city' => 'Ankara'],
            ['email' => 'ege.toptan@i-hirdavat.com',     'seller_name' => 'Ege Toptan Aletleri',     'tax_number' => '2222222222', 'city' => 'İzmir'],
        ];

        foreach ($sellers as $seller) {
            User::updateOrCreate(
                ['email' => $seller['email']],
                [
                    'password' => Hash::make('password'),
                    'seller_name' => $seller['seller_name'],
                    'nickname' => explode('@', $seller['email'])[0],
                    'tax_number' => $seller['tax_number'],
                    'city' => $seller['city'],
                    'role' => User::ROLE_SELLER,
                    'is_verified' => true,
                    'verified_at' => now(),
                    'verification_status' => 'approved',
                    'sector_type' => 'wholesaler',
                ]
            );
        }

        // Sample hardware products
        $products = [
            ['barcode' => '8691234567001', 'name' => 'Bosch GSB 550 RE Darbeli Matkap 13mm 600W', 'brand' => 'Bosch', 'manufacturer' => 'Robert Bosch'],
            ['barcode' => '8691234567002', 'name' => 'Makita HP457DWE Akülü Darbeli Matkap 18V',  'brand' => 'Makita', 'manufacturer' => 'Makita Corporation'],
            ['barcode' => '8691234567003', 'name' => 'DeWalt DWE4057 Avuç Taşlama 125mm 800W',    'brand' => 'DeWalt', 'manufacturer' => 'Stanley Black & Decker'],
            ['barcode' => '8691234567004', 'name' => 'Stanley FatMax 8m Şerit Metre',             'brand' => 'Stanley', 'manufacturer' => 'Stanley Black & Decker'],
            ['barcode' => '8691234567005', 'name' => '3M 9322+ FFP2 NR D Toz Maskesi 10 Adet',    'brand' => '3M', 'manufacturer' => '3M Company'],
            ['barcode' => '8691234567006', 'name' => 'İzeltaş 24 Parça Alyan Takımı T-Saplı',     'brand' => 'İzeltaş', 'manufacturer' => 'İzeltaş Makine'],
            ['barcode' => '8691234567007', 'name' => 'Würth M8x20 DIN 933 Galvaniz Civata 100 Adet','brand' => 'Würth', 'manufacturer' => 'Würth'],
            ['barcode' => '8691234567008', 'name' => 'Hilti TE 6-A Akülü Kırıcı Delici',          'brand' => 'Hilti', 'manufacturer' => 'Hilti Corporation'],
            ['barcode' => '8691234567009', 'name' => 'Milwaukee M18 FUEL Akülü Vidalama',         'brand' => 'Milwaukee', 'manufacturer' => 'Milwaukee Tool'],
            ['barcode' => '8691234567010', 'name' => 'Uvex 8916 Anti-Kesilme İş Eldiveni L',      'brand' => 'Uvex', 'manufacturer' => 'Uvex Safety'],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['barcode' => $product['barcode']],
                $product + ['is_active' => true]
            );
        }

        // Offers — 2-3 per product from random sellers
        $sellerIds = User::sellers()->pluck('id');
        if ($sellerIds->isEmpty()) {
            $this->command?->warn('No sellers available — offers not seeded.');
            return;
        }
        foreach (Product::all() as $product) {
            $pickedCount = min(3, $sellerIds->count());
            foreach ($sellerIds->shuffle()->take($pickedCount) as $sellerId) {
                Offer::updateOrCreate(
                    ['product_id' => $product->id, 'seller_id' => $sellerId],
                    [
                        'price' => rand(150, 2500) + (rand(0, 99) / 100),
                        'stock' => rand(5, 250),
                        'expiry_date' => now()->addYears(5),
                        'status' => 'active',
                    ]
                );
            }
        }

        $this->command?->info('i-hirdavat demo veriler oluşturuldu.');
        $this->command?->info('Admin: admin@i-hirdavat.com / password');
    }
}
