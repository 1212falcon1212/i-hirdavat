<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

/**
 * i-hırdavat marka seeder — B2B hırdavat pazaryeri markaları.
 *
 * Öne çıkan 6 marka (CLAUDE.md §3.9 marka kampanya kartları) + yaygın
 * kullanılan diğer uluslararası ve yerli markalar.
 */
class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            // === Öne çıkan 6 marka (BrandCampaigns) ===
            [
                'name' => 'Bosch Professional',
                'slug' => 'bosch',
                'description' => 'Mavi seri profesyonel elektrikli aletler.',
                'website_url' => 'https://www.bosch-professional.com/tr/tr/',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Makita',
                'slug' => 'makita',
                'description' => 'Japon kökenli profesyonel akülü ve kablolu elektrikli aletler.',
                'website_url' => 'https://www.makita.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'DeWalt',
                'slug' => 'dewalt',
                'description' => 'Amerikan kökenli XR ve FlexVolt profesyonel aletler.',
                'website_url' => 'https://www.dewalt.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Stanley',
                'slug' => 'stanley',
                'description' => 'Klasik el aletleri, ölçüm setleri, FatMax serisi.',
                'website_url' => 'https://www.stanleytools.com',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'name' => '3M',
                'slug' => '3m',
                'description' => 'FFP2/FFP3 maskeler, iş güvenliği eldivenleri ve kişisel koruyucu ekipman.',
                'website_url' => 'https://www.3m.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'İzeltaş',
                'slug' => 'izeltas',
                'description' => 'Yerli üretim anahtar, pense ve alyan takımları.',
                'website_url' => 'https://www.izeltas.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 6,
            ],

            // === Diğer önemli markalar ===
            [
                'name' => 'Milwaukee',
                'slug' => 'milwaukee',
                'description' => 'M18 FUEL akülü aletler, profesyonel kullanım.',
                'website_url' => 'https://www.milwaukeetool.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Hilti',
                'slug' => 'hilti',
                'description' => 'İnşaat ve endüstri için ağır hizmet aletleri.',
                'website_url' => 'https://www.hilti.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 8,
            ],
            [
                'name' => 'Würth',
                'slug' => 'wurth',
                'description' => 'Bağlantı elemanları, civata ve endüstriyel sarf malzeme.',
                'website_url' => 'https://www.wurth.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 9,
            ],
            [
                'name' => 'Black & Decker',
                'slug' => 'black-decker',
                'description' => 'Ev tipi ve hobi elektrikli aletler.',
                'website_url' => 'https://www.blackanddecker.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 10,
            ],
            [
                'name' => 'Ceta Form',
                'slug' => 'ceta-form',
                'description' => 'Yerli el aletleri ve profesyonel anahtar takımları.',
                'website_url' => 'https://www.cetaform.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 11,
            ],
            [
                'name' => 'Karcher',
                'slug' => 'karcher',
                'description' => 'Basınçlı yıkama ve temizlik ekipmanları.',
                'website_url' => 'https://www.kaercher.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 12,
            ],
            [
                'name' => 'Hikoki',
                'slug' => 'hikoki',
                'description' => 'Eski adıyla Hitachi Power Tools — Japon elektrikli aletler.',
                'website_url' => 'https://www.hikoki-powertools.com',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 13,
            ],
            [
                'name' => 'Metabo',
                'slug' => 'metabo',
                'description' => 'Alman kökenli endüstriyel elektrikli aletler.',
                'website_url' => 'https://www.metabo.com',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 14,
            ],
            [
                'name' => 'AEG',
                'slug' => 'aeg',
                'description' => 'Alman markası profesyonel elektrikli aletler.',
                'website_url' => 'https://www.aeg-powertools.com',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 15,
            ],
            [
                'name' => 'Festool',
                'slug' => 'festool',
                'description' => 'Premium Alman ahşap işçiliği aletleri.',
                'website_url' => 'https://www.festool.com',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 16,
            ],
            [
                'name' => 'Honeywell',
                'slug' => 'honeywell',
                'description' => 'İş güvenliği ekipmanları ve gözlük.',
                'website_url' => 'https://www.honeywell.com',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 17,
            ],
            [
                'name' => 'Uvex',
                'slug' => 'uvex',
                'description' => 'İş güvenliği eldiveni, gözlüğü ve bot ekipmanları.',
                'website_url' => 'https://www.uvex-safety.com',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 18,
            ],
            [
                'name' => 'Einhell',
                'slug' => 'einhell',
                'description' => 'Ev tipi / hobi elektrikli aletler, bahçe ekipmanı.',
                'website_url' => 'https://www.einhell.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 19,
            ],
            [
                'name' => 'Pentax',
                'slug' => 'pentax',
                'description' => 'Pompa ve hidrofor ekipmanları.',
                'website_url' => 'https://www.pentax-pumps.com',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 20,
            ],
        ];

        foreach ($brands as $brandData) {
            Brand::updateOrCreate(
                ['slug' => $brandData['slug']],
                $brandData
            );
        }

        $this->command->info('20 hırdavat markası başarıyla eklendi.');
    }
}
