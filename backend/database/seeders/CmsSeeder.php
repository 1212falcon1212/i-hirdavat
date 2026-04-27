<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\HomepageSection;
use App\Models\NavigationMenu;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        // === Hero Bannerlar (anasayfa carousel) ===
        $heroBanners = [
            [
                'title' => 'Sezonun Yıldızı Profesyonel Hırdavat',
                'subtitle' => 'Matkap, vidalama ve ölçüm ekipmanlarında stoklu bayi ilanlarını karşılaştırın.',
                'badge_text' => 'KAMPANYALAR',
                'image_path' => 'banners/generated/market-hero-tools.png',
                'link_url' => '/market/products',
                'button_text' => 'Alışverişe Başla',
                'location' => 'home_hero',
                'sort_order' => 1,
                'is_active' => true,
                'tab_name' => 'Kampanyalar',
                'bg_color' => '#5EAEC9',
            ],
            [
                'title' => 'İş Güvenliği Sezonu',
                'subtitle' => 'Baret, eldiven, gözlük ve maske ekipmanlarında toplu alım avantajları.',
                'badge_text' => 'SANA ÖZEL',
                'image_path' => 'banners/generated/market-hero-safety.png',
                'link_url' => '/market/category/is-guvenligi',
                'button_text' => 'İlanları Gör',
                'location' => 'home_hero',
                'sort_order' => 2,
                'is_active' => true,
                'tab_name' => 'Sana Özel',
                'bg_color' => '#16A34A',
            ],
        ];

        foreach ($heroBanners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'location' => $banner['location']],
                $banner
            );
        }

        $this->command->info('✅ Hero bannerlar oluşturuldu.');

        // === Promosyon Bannerları (hero altı ikili) ===
        $promoBanners = [
            [
                'title' => 'Bağlantı Elemanları',
                'subtitle' => 'DIN standardı civata, somun ve pulda toptan fiyat.',
                'badge_text' => 'TOPTAN ALIM',
                'image_path' => 'banners/generated/market-promo-fasteners.png',
                'link_url' => '/market/category/baglanti-elemanlari',
                'button_text' => 'İncele',
                'location' => 'home_promo',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Tesisat & Elektrik',
                'subtitle' => 'Kablo, boru, vana ve ölçüm ekipmanlarında stoklu satıcı seçenekleri.',
                'badge_text' => 'STOKLU ÜRÜN',
                'image_path' => 'banners/generated/market-promo-plumbing.png',
                'link_url' => '/market/category/tesisat-su',
                'button_text' => 'Ürünleri Gör',
                'location' => 'home_promo',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($promoBanners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'location' => $banner['location']],
                $banner
            );
        }

        $this->command->info('✅ Promosyon bannerları oluşturuldu.');

        // === Orta Bannerlar (anasayfa orta strip) ===
        $middleBanners = [
            [
                'title' => 'Civata & Bağlantı Elemanları',
                'subtitle' => 'DIN standardı civata, somun ve pulda toptan fiyat',
                'image_path' => 'banners/generated/market-zone-brands.png',
                'link_url' => '/market/category/baglanti-elemanlari',
                'button_text' => 'İncele',
                'location' => 'home_middle',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Tesisat & Su',
                'subtitle' => 'PPR-C boru, vana ve armatürlerde aynı gün sevkiyat',
                'image_path' => 'banners/generated/market-zone-bulk.png',
                'link_url' => '/market/category/tesisat-su',
                'button_text' => 'Ürünleri Gör',
                'location' => 'home_middle',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($middleBanners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'location' => $banner['location']],
                $banner
            );
        }

        $this->command->info('✅ 2 promo banner oluşturuldu.');

        // === Grid/Vitrin Bannerları ===
        $gridBanners = [
            [
                'title' => 'Aynı Gün Sevkiyat',
                'subtitle' => '16:00 öncesi stoklu siparişlerde hızlı kargo.',
                'badge_text' => 'HIZLI KARGO',
                'image_path' => 'banners/generated/market-zone-delivery.png',
                'link_url' => '/market/kargo-bilgi',
                'button_text' => 'Detaylar',
                'location' => 'home_grid',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Marka Şenliği',
                'subtitle' => 'Bosch, Makita, DeWalt ve İzeltaş ilanlarını karşılaştırın.',
                'badge_text' => 'MARKALAR',
                'image_path' => 'banners/generated/market-zone-brands.png',
                'link_url' => '/market/markalar',
                'button_text' => 'Markaları Gör',
                'location' => 'home_grid',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($gridBanners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'location' => $banner['location']],
                $banner
            );
        }

        $this->command->info('✅ Grid bannerları oluşturuldu.');

        // === Marka/Vitrin Bannerları ===
        $showcaseBanners = [
            [
                'title' => 'Profesyonel Markalar',
                'subtitle' => 'Öne çıkan markaların aktif bayi ilanları tek ekranda.',
                'badge_text' => 'VİTRİN',
                'image_path' => 'banners/generated/market-zone-brands.png',
                'link_url' => '/market/markalar',
                'button_text' => 'Keşfet',
                'location' => 'home_brand',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Toplu Alım Fırsatları',
                'subtitle' => 'Kademeli fiyat, vadeli ödeme ve stoklu sevkiyat avantajı.',
                'badge_text' => 'B2B',
                'image_path' => 'banners/generated/market-zone-bulk.png',
                'link_url' => '/yardim/alici-rehberi/toplu-alim',
                'button_text' => 'Bilgi Al',
                'location' => 'home_showcase',
                'sort_order' => 1,
                'is_active' => true,
            ],
        ];

        foreach ($showcaseBanners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'location' => $banner['location']],
                $banner
            );
        }

        $this->command->info('✅ Marka ve vitrin bannerları oluşturuldu.');

        // === Alt Bannerlar (anasayfa kapanış / closing) ===
        $bottomBanners = [
            [
                'title' => 'Bayi Olun, Toptan Fiyatlardan Yararlanın',
                'subtitle' => 'Vergi kimlik numaranızla dakikalar içinde başvurun, evraklarınız onaylandıktan sonra siparişe başlayın.',
                'image_path' => 'banners/generated/market-bottom-seller.png',
                'link_url' => '/register',
                'button_text' => 'Bayi Başvurusu',
                'location' => 'home_bottom',
                'sort_order' => 1,
                'is_active' => true,
            ],
        ];

        foreach ($bottomBanners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'location' => $banner['location']],
                $banner
            );
        }

        $this->command->info('✅ 1 closing banner oluşturuldu.');

        // === Header Menüleri ===
        $headerMenus = [
            ['title' => 'Ana Sayfa', 'url' => '/market', 'sort_order' => 1],
            ['title' => 'Tüm Ürünler', 'url' => '/market/products', 'sort_order' => 2],
            ['title' => 'Markalar', 'url' => '/market/markalar', 'sort_order' => 3],
            ['title' => 'Kampanyalar', 'url' => '/market/kampanyalar', 'sort_order' => 4],
            ['title' => 'Bayi Ol', 'url' => '/register', 'sort_order' => 5],
            ['title' => 'Yardım', 'url' => '/yardim', 'sort_order' => 6],
        ];

        foreach ($headerMenus as $menu) {
            NavigationMenu::updateOrCreate(
                ['title' => $menu['title'], 'location' => 'header'],
                array_merge($menu, [
                    'location' => 'header',
                    'is_active' => true,
                ])
            );
        }

        $this->command->info('✅ Header menüleri oluşturuldu.');

        // === Footer Menüleri (parent-child) ===
        $footerGroups = [
            [
                'title' => 'Kurumsal',
                'sort_order' => 1,
                'children' => [
                    ['title' => 'Hakkımızda', 'url' => '/hakkimizda', 'sort_order' => 1],
                    ['title' => 'İletişim', 'url' => '/iletisim', 'sort_order' => 2],
                    ['title' => 'Yardım Merkezi', 'url' => '/yardim', 'sort_order' => 3],
                    ['title' => 'Bayi Ol', 'url' => '/register', 'sort_order' => 4],
                ],
            ],
            [
                'title' => 'Yardım',
                'sort_order' => 2,
                'children' => [
                    ['title' => 'Sipariş Takibi', 'url' => '/yardim/alici-rehberi/siparis-takibi', 'sort_order' => 1],
                    ['title' => 'Sepet ve Ödeme', 'url' => '/yardim/alici-rehberi/sepet-odeme', 'sort_order' => 2],
                    ['title' => 'Hızlı Sipariş', 'url' => '/yardim/alici-rehberi/hizli-siparis', 'sort_order' => 3],
                    ['title' => 'Toplu Alım İskontosu', 'url' => '/yardim/alici-rehberi/toplu-alim', 'sort_order' => 4],
                ],
            ],
            [
                'title' => 'Yasal',
                'sort_order' => 3,
                'children' => [
                    ['title' => 'KVKK Aydınlatma', 'url' => '/legal/kvkk', 'sort_order' => 1],
                    ['title' => 'Kullanım Koşulları', 'url' => '/legal/terms', 'sort_order' => 2],
                    ['title' => 'Gizlilik Politikası', 'url' => '/legal/privacy', 'sort_order' => 3],
                    ['title' => 'Çerez Politikası', 'url' => '/legal/cookies', 'sort_order' => 4],
                ],
            ],
            [
                'title' => 'Kategoriler',
                'sort_order' => 4,
                'children' => [
                    ['title' => 'El Aletleri', 'url' => '/market/category/el-aletleri', 'sort_order' => 1],
                    ['title' => 'Elektrikli Aletler', 'url' => '/market/category/elektrikli-aletler', 'sort_order' => 2],
                    ['title' => 'Bağlantı Elemanları', 'url' => '/market/category/baglanti-elemanlari', 'sort_order' => 3],
                    ['title' => 'Tesisat & Su', 'url' => '/market/category/tesisat-su', 'sort_order' => 4],
                    ['title' => 'Elektrik Malzemeleri', 'url' => '/market/category/elektrik-malzemeleri', 'sort_order' => 5],
                    ['title' => 'İş Güvenliği', 'url' => '/market/category/is-guvenligi', 'sort_order' => 6],
                    ['title' => 'İnşaat & Yapı', 'url' => '/market/category/insaat-yapi', 'sort_order' => 7],
                    ['title' => 'Bahçe & Orman', 'url' => '/market/category/bahce-orman', 'sort_order' => 8],
                ],
            ],
            [
                'title' => 'Markalar',
                'sort_order' => 5,
                'children' => [
                    ['title' => 'Bosch', 'url' => '/market/marka/bosch', 'sort_order' => 1],
                    ['title' => 'Makita', 'url' => '/market/marka/makita', 'sort_order' => 2],
                    ['title' => 'DeWalt', 'url' => '/market/marka/dewalt', 'sort_order' => 3],
                    ['title' => 'Stanley', 'url' => '/market/marka/stanley', 'sort_order' => 4],
                    ['title' => '3M', 'url' => '/market/marka/3m', 'sort_order' => 5],
                    ['title' => 'İzeltaş', 'url' => '/market/marka/izeltas', 'sort_order' => 6],
                    ['title' => 'Milwaukee', 'url' => '/market/marka/milwaukee', 'sort_order' => 7],
                    ['title' => 'Ceta Form', 'url' => '/market/marka/ceta-form', 'sort_order' => 8],
                ],
            ],
        ];

        foreach ($footerGroups as $group) {
            $parent = NavigationMenu::updateOrCreate(
                ['title' => $group['title'], 'location' => 'footer', 'parent_id' => null],
                [
                    'location' => 'footer',
                    'sort_order' => $group['sort_order'],
                    'is_active' => true,
                ]
            );

            foreach ($group['children'] as $child) {
                NavigationMenu::updateOrCreate(
                    ['title' => $child['title'], 'location' => 'footer', 'parent_id' => $parent->id],
                    array_merge($child, [
                        'location' => 'footer',
                        'parent_id' => $parent->id,
                        'is_active' => true,
                    ])
                );
            }
        }

        $this->command->info('✅ Footer menüleri oluşturuldu (parent-child).');

        // === Ana Sayfa Bölümleri ===
        $sections = [
            [
                'title' => 'Çok Satanlar',
                'subtitle' => 'Bu ay hırdavatçıların en çok tercih ettiği ürünler',
                'type' => 'best_sellers',
                'settings' => ['limit' => 8],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Yeni Gelenler',
                'subtitle' => 'Kataloğa son eklenen ürünler',
                'type' => 'new_arrivals',
                'settings' => ['limit' => 8],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Fırsat Ürünleri',
                'subtitle' => 'Sınırlı stok, kaçırılmayacak bayi fiyatları',
                'type' => 'deals',
                'settings' => ['limit' => 8],
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Elektrikli Aletler',
                'subtitle' => 'Profesyonel matkap, taşlama ve akülü vidalama',
                'type' => 'product_carousel',
                'settings' => ['limit' => 8, 'category_slug' => 'elektrikli-aletler'],
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            HomepageSection::updateOrCreate(
                ['title' => $section['title']],
                $section
            );
        }

        $this->command->info('✅ Ana sayfa bölümleri oluşturuldu.');
    }
}
