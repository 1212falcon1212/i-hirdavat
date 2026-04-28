<?php

use App\Models\Banner;
use App\Models\BlogPost;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;

return new class extends Migration
{
    public function up(): void
    {
        $featuredCampaigns = [
            [
                'title' => 'Aynı Gün Sevkiyat',
                'subtitle' => '16:00 öncesi stoklu siparişlerde hızlı kargo.',
                'image_path' => 'banners/01KQ9MPEVXVYDSPMWXXVECJ86D.png',
                'link_url' => '/market/kargo-bilgi',
                'button_text' => 'Detaylar',
                'sort_order' => 1,
            ],
            [
                'title' => 'Profesyonel Markalar',
                'subtitle' => 'Öne çıkan markaların aktif bayi ilanları tek ekranda.',
                'image_path' => 'banners/01KQ9MPEVZEE5234B1FZ0V8HE3.png',
                'link_url' => '/market/markalar',
                'button_text' => 'Keşfet',
                'sort_order' => 2,
            ],
            [
                'title' => 'Toplu Alım Fırsatları',
                'subtitle' => 'Kademeli fiyat, vadeli ödeme ve stoklu sevkiyat avantajı.',
                'image_path' => 'banners/01KQ9MPEW06CHY1MZS2AP7SK3M.png',
                'link_url' => '/yardim/alici-rehberi/toplu-alim',
                'button_text' => 'Bilgi Al',
                'sort_order' => 3,
            ],
            [
                'title' => 'Marka Şenliği',
                'subtitle' => 'Bosch, Makita, DeWalt ve İzeltaş ilanlarını karşılaştırın.',
                'image_path' => 'banners/01KQ9MPEW2NK1DYJA76TWG3G6Q.png',
                'link_url' => '/market/markalar',
                'button_text' => 'Markaları Gör',
                'sort_order' => 4,
            ],
        ];

        foreach ($featuredCampaigns as $banner) {
            Banner::updateOrCreate(
                ['location' => 'home_featured_campaigns', 'image_path' => $banner['image_path']],
                [
                    ...$banner,
                    'location' => 'home_featured_campaigns',
                    'badge_text' => null,
                    'tab_name' => null,
                    'bg_color' => null,
                    'is_active' => true,
                    'starts_at' => null,
                    'ends_at' => null,
                ]
            );
        }

        $videoStories = [
            'banners/01KQ9PASY728ND7ZY0XN49CDSC.png',
            'banners/01KQ9PASYAPT1SVT0CAPAX5JCK.png',
            'banners/01KQ9PASYB197AZQNTJ3AN3FY6.png',
            'banners/01KQ9PASYD6SJ1N0RPT7CC0BZ6.png',
        ];

        foreach ($videoStories as $index => $imagePath) {
            Banner::updateOrCreate(
                ['location' => 'home_video_stories', 'image_path' => $imagePath],
                [
                    'title' => null,
                    'subtitle' => null,
                    'badge_text' => null,
                    'image_path' => $imagePath,
                    'link_url' => null,
                    'button_text' => null,
                    'location' => 'home_video_stories',
                    'tab_name' => null,
                    'bg_color' => null,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                    'starts_at' => null,
                    'ends_at' => null,
                ]
            );
        }

        $blogImages = [
            'profesyonel-matkap-secimi-akulu-mu-kablolu-mu' => 'https://images.unsplash.com/photo-1622044939413-0b829c342434?auto=format&fit=crop&w=1600&q=75',
            'din-civata-standartlarini-anlamak-933-931-912-7991' => 'https://images.unsplash.com/photo-1763888450676-f0f7a3987917?auto=format&fit=crop&w=1600&q=75',
            'is-guvenligi-eldiveni-secimi-kesim-sinifi-standardi-en-388' => 'https://images.unsplash.com/photo-1647329797478-52c45b06856b?auto=format&fit=crop&w=1600&q=75',
            'b2b-hirdavat-tedarikinde-excel-ile-toplu-siparis' => 'https://images.unsplash.com/photo-1749244768351-2726dc23d26c?auto=format&fit=crop&w=1600&q=75',
            'avuc-ici-taslama-diski-secimi-uygulamaya-gore-disk-turleri' => 'https://images.unsplash.com/photo-1734888369502-3e01d4c0a46e?auto=format&fit=crop&w=1600&q=75',
            'hirdavat-bayisi-icin-stok-devir-hizi-optimizasyonu' => 'https://images.unsplash.com/photo-1749244768351-2726dc23d26c?auto=format&fit=crop&w=1600&q=75',
            'tornavida-setinde-bit-cesitleri-ph-pz-tx-slotted' => 'https://images.unsplash.com/photo-1529255848089-c4e456d166e0?auto=format&fit=crop&w=1600&q=75',
            'santiyede-baret-siniflari-ansi-vs-en-397' => 'https://images.unsplash.com/photo-1690473768831-200986892e62?auto=format&fit=crop&w=1600&q=75',
            'kademeli-bayi-iskontosu-10-50-100' => 'https://images.unsplash.com/photo-1749244768351-2726dc23d26c?auto=format&fit=crop&w=1600&q=75',
            'ppr-c-ve-pvc-boru-farki-hangisi-nerede-kullanilir' => 'https://images.unsplash.com/photo-1743580886673-812abb5acf3a?auto=format&fit=crop&w=1600&q=75',
        ];

        foreach ($blogImages as $slug => $imageUrl) {
            BlogPost::where('slug', $slug)->update(['featured_image' => $imageUrl]);
        }

        Cache::flush();
    }

    public function down(): void
    {
        Banner::whereIn('location', ['home_featured_campaigns', 'home_video_stories'])
            ->whereIn('image_path', [
                'banners/01KQ9MPEVXVYDSPMWXXVECJ86D.png',
                'banners/01KQ9MPEVZEE5234B1FZ0V8HE3.png',
                'banners/01KQ9MPEW06CHY1MZS2AP7SK3M.png',
                'banners/01KQ9MPEW2NK1DYJA76TWG3G6Q.png',
                'banners/01KQ9PASY728ND7ZY0XN49CDSC.png',
                'banners/01KQ9PASYAPT1SVT0CAPAX5JCK.png',
                'banners/01KQ9PASYB197AZQNTJ3AN3FY6.png',
                'banners/01KQ9PASYD6SJ1N0RPT7CC0BZ6.png',
            ])
            ->delete();

        Cache::flush();
    }
};
