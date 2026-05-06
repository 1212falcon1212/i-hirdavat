<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@ihirdavat.com'],
            [
                'password' => Hash::make('admin123'),
                'seller_name' => 'iHırdavat Admin',
                'phone' => '0532 000 0000',
                'address' => 'Admin Caddesi No:1',
                'city' => 'İstanbul',
                'is_verified' => true,
                'role' => 'super-admin',
            ]
        );

        $this->command->info('✅ Admin user created: admin@ihirdavat.com / admin123');

        // Create Test Seller (Bayi) Users
        $seller1 = User::firstOrCreate(
            ['email' => 'bayi1@test.com'],
            [
                'password' => Hash::make('test123'),
                'seller_name' => 'Merkez Hırdavat',
                'phone' => '0532 111 1111',
                'address' => 'Merkez Mahallesi No:10',
                'city' => 'İstanbul',
                'is_verified' => true,
                'role' => 'seller',
            ]
        );

        $seller2 = User::firstOrCreate(
            ['email' => 'bayi2@test.com'],
            [
                'password' => Hash::make('test123'),
                'seller_name' => 'Sanayi Hırdavat',
                'phone' => '0532 222 2222',
                'address' => 'Sanayi Caddesi No:20',
                'city' => 'Ankara',
                'is_verified' => true,
                'role' => 'seller',
            ]
        );

        $this->command->info('✅ Test seller users created');

        // Create Categories with Commission Rates
        $categories = [
            [
                'name' => 'El Aletleri',
                'slug' => 'el-aletleri',
                'description' => 'Anahtar, tornavida, pense ve manuel el aletleri',
                'commission_rate' => 8.00,
            ],
            [
                'name' => 'Elektrikli Aletler',
                'slug' => 'elektrikli-aletler',
                'description' => 'Matkap, taşlama, vidalama ve diğer elektrikli aletler',
                'commission_rate' => 10.00,
            ],
            [
                'name' => 'Bağlantı Elemanları',
                'slug' => 'baglanti-elemanlari',
                'description' => 'Civata, somun, vida ve dübeller',
                'commission_rate' => 7.50,
            ],
            [
                'name' => 'İş Güvenliği',
                'slug' => 'is-guvenligi',
                'description' => 'Baret, eldiven, gözlük ve iş ayakkabıları',
                'commission_rate' => 10.00,
            ],
            [
                'name' => 'Tesisat & Su',
                'slug' => 'tesisat-su',
                'description' => 'PPR boru, vana, fitting ve tesisat ürünleri',
                'commission_rate' => 9.00,
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        $this->command->info('✅ Test categories created with commission rates');

        // Get category IDs
        $elAletleriCategory = Category::where('slug', 'el-aletleri')->first();
        $elektrikliCategory = Category::where('slug', 'elektrikli-aletler')->first();
        $baglantiCategory = Category::where('slug', 'baglanti-elemanlari')->first();
        $isGuvenligiCategory = Category::where('slug', 'is-guvenligi')->first();
        $tesisatCategory = Category::where('slug', 'tesisat-su')->first();

        // Create Test Products
        $products = [
            // El Aletleri
            [
                'barcode' => '86800001001',
                'name' => 'CETA FORM 17 PARÇA LOKMA TAKIMI 1/2"',
                'brand' => 'CETA FORM',
                'manufacturer' => 'Ceta Form',
                'description' => 'Profesyonel kromvanadyum lokma takımı',
                'category_id' => $elAletleriCategory->id,
            ],
            [
                'barcode' => '86800001002',
                'name' => 'STANLEY YILDIZ TORNAVİDA SETİ 6 PARÇA',
                'brand' => 'STANLEY',
                'manufacturer' => 'Stanley Black & Decker',
                'description' => 'Manyetik uçlu yıldız tornavida seti',
                'category_id' => $elAletleriCategory->id,
            ],
            [
                'barcode' => '86800001003',
                'name' => 'İZELTAŞ KARGABURUN PENSE 200MM',
                'brand' => 'İZELTAŞ',
                'manufacturer' => 'İzeltaş',
                'description' => 'İzole saplı profesyonel kargaburun pense',
                'category_id' => $elAletleriCategory->id,
            ],
            // Elektrikli Aletler
            [
                'barcode' => '86800002001',
                'name' => 'BOSCH GSB 16 RE DARBELİ MATKAP 750W',
                'brand' => 'BOSCH',
                'manufacturer' => 'Robert Bosch GmbH',
                'description' => 'Profesyonel kablolu darbeli matkap',
                'category_id' => $elektrikliCategory->id,
            ],
            [
                'barcode' => '86800002002',
                'name' => 'MAKİTA HP488DWE 18V AKÜLÜ MATKAP',
                'brand' => 'MAKITA',
                'manufacturer' => 'Makita Corporation',
                'description' => '18V LXT akülü darbeli vidalama makinesi',
                'category_id' => $elektrikliCategory->id,
            ],
            // Bağlantı Elemanları
            [
                'barcode' => '86800003001',
                'name' => 'DIN 933 M8X20 GALVANİZ CIVATA (100 ADET)',
                'brand' => 'GENERIC',
                'manufacturer' => 'TR Standart',
                'description' => 'M8x20 8.8 kalitede galvaniz tam dişli civata',
                'category_id' => $baglantiCategory->id,
            ],
            [
                'barcode' => '86800003002',
                'name' => 'DIN 934 M8 GALVANİZ ALTI KÖŞE SOMUN (100 ADET)',
                'brand' => 'GENERIC',
                'manufacturer' => 'TR Standart',
                'description' => 'M8 galvaniz altı köşe standart somun',
                'category_id' => $baglantiCategory->id,
            ],
            [
                'barcode' => '86800003003',
                'name' => 'FİSCHER S8 ÜNİVERSAL DÜBEL (100 ADET)',
                'brand' => 'FISCHER',
                'manufacturer' => 'Fischer GmbH',
                'description' => '8mm üniversal beton/tuğla plastik dübel',
                'category_id' => $baglantiCategory->id,
            ],
            // İş Güvenliği
            [
                'barcode' => '86800004001',
                'name' => '3M VFLEX 9105 N95 TOZ MASKESİ (50 ADET)',
                'brand' => '3M',
                'manufacturer' => '3M',
                'description' => 'FFP2 sınıfı katlanabilir toz maskesi',
                'category_id' => $isGuvenligiCategory->id,
            ],
            [
                'barcode' => '86800004002',
                'name' => 'PORTWEST B-BRAND BARET MAVİ',
                'brand' => 'PORTWEST',
                'manufacturer' => 'Portwest',
                'description' => 'EN 397 standartlı endüstriyel baret',
                'category_id' => $isGuvenligiCategory->id,
            ],
            // Tesisat & Su
            [
                'barcode' => '86800005001',
                'name' => 'PİLSA PPR-C BORU 25MM (4 METRE)',
                'brand' => 'PİLSA',
                'manufacturer' => 'Pilsa',
                'description' => 'PN20 sıcak su tesisat borusu',
                'category_id' => $tesisatCategory->id,
            ],
            [
                'barcode' => '86800005002',
                'name' => 'VANA SANAYİ 1/2" KÜRESEL VANA PİRİNÇ',
                'brand' => 'VANA SANAYİ',
                'manufacturer' => 'Vana Sanayi',
                'description' => 'Tam geçişli pirinç küresel vana',
                'category_id' => $tesisatCategory->id,
            ],
        ];

        foreach ($products as $productData) {
            Product::firstOrCreate(
                ['barcode' => $productData['barcode']],
                $productData
            );
        }

        $this->command->info('✅ Test products created');

        // Create Offers for Products
        $allProducts = Product::all();
        $expiryDate1 = now()->addMonths(6);
        $expiryDate2 = now()->addMonths(12);

        foreach ($allProducts as $index => $product) {
            // Offer from Seller 1
            Offer::firstOrCreate(
                ['product_id' => $product->id, 'seller_id' => $seller1->id],
                [
                    'price' => rand(50, 500) + (rand(0, 99) / 100),
                    'stock' => rand(10, 100),
                    'expiry_date' => $expiryDate1,
                    'batch_number' => 'BATCH-'.$seller1->id.'-'.$product->id,
                    'status' => 'active',
                ]
            );

            // Offer from Seller 2 (different price)
            Offer::firstOrCreate(
                ['product_id' => $product->id, 'seller_id' => $seller2->id],
                [
                    'price' => rand(45, 520) + (rand(0, 99) / 100),
                    'stock' => rand(5, 80),
                    'expiry_date' => $expiryDate2,
                    'batch_number' => 'BATCH-'.$seller2->id.'-'.$product->id,
                    'status' => 'active',
                ]
            );
        }

        $this->command->info('✅ Test offers created for all products');
        $this->command->info('');
        $this->command->info('📋 Summary:');
        $this->command->info('   - Admin: admin@ihirdavat.com / admin123');
        $this->command->info('   - Seller 1: bayi1@test.com / test123');
        $this->command->info('   - Seller 2: bayi2@test.com / test123');
        $this->command->info('   - Categories: '.Category::count());
        $this->command->info('   - Products: '.Product::count());
        $this->command->info('   - Offers: '.Offer::count());
    }
}
