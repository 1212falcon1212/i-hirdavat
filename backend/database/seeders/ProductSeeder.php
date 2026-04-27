<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * i-hırdavat örnek ürün seeder'ı.
 *
 * ~60 gerçek hırdavat ürünü — doğru markalar, gerçekçi SKU'lar, Unsplash
 * kategori stok görselleri. Ilan fiyatlandırması OfferSeeder tarafından
 * eklenir (her ürün için 2-4 satıcı, farklı fiyatlar).
 */
class ProductSeeder extends Seeder
{
    private const IMG_POWER_TOOL = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=800&fit=crop&q=80';
    private const IMG_HAND_TOOL  = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop&q=80';
    private const IMG_FASTENER   = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=800&fit=crop&q=80';
    private const IMG_SAFETY     = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=800&fit=crop&q=80';
    private const IMG_ELECTRIC   = 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&h=800&fit=crop&q=80';
    private const IMG_PLUMBING   = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&q=80';
    private const IMG_GARDEN     = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop&q=80';

    public function run(): void
    {
        $catIds = Category::pluck('id', 'slug')->toArray();

        $catalog = array_merge(
            $this->powerTools($catIds),
            $this->handTools($catIds),
            $this->fasteners($catIds),
            $this->safety($catIds),
            $this->electric($catIds),
            $this->plumbing($catIds),
            $this->garden($catIds),
        );

        foreach ($catalog as $row) {
            Product::updateOrCreate(
                ['barcode' => $row['barcode']],
                array_merge($row, [
                    'is_active' => true,
                    'approval_status' => 'approved',
                ])
            );
        }

        $this->command?->info(sprintf('✓ %d hırdavat ürünü eklendi.', count($catalog)));
    }

    /** @return array<int, array<string, mixed>> */
    private function powerTools(array $catIds): array
    {
        $matkaplar = $catIds['matkaplar'] ?? $catIds['elektrikli-aletler'] ?? null;
        $taslama   = $catIds['taslama-kesme'] ?? $catIds['elektrikli-aletler'] ?? null;
        $kaynak    = $catIds['jenerator-kaynak'] ?? $catIds['elektrikli-aletler'] ?? null;
        $zimpara   = $catIds['zimpara-rende'] ?? $catIds['elektrikli-aletler'] ?? null;

        return [
            // Matkaplar
            ['barcode' => '4059952620411', 'name' => 'Bosch GSB 550 RE Darbeli Matkap 13mm 600W',         'brand' => 'Bosch',      'manufacturer' => 'Robert Bosch',    'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 2450,  'desi' => 5],
            ['barcode' => '4059952620428', 'name' => 'Bosch GSB 16 RE Darbeli Matkap 13mm 750W',          'brand' => 'Bosch',      'manufacturer' => 'Robert Bosch',    'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 2890,  'desi' => 6],
            ['barcode' => '4059952620435', 'name' => 'Bosch GBH 2-26 SDS-Plus Kırıcı Delici 830W',        'brand' => 'Bosch',      'manufacturer' => 'Robert Bosch',    'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 6450,  'desi' => 8],
            ['barcode' => '0088381804912', 'name' => 'Makita HP457DWE 18V LXT Akülü Darbeli Matkap',      'brand' => 'Makita',     'manufacturer' => 'Makita Corp.',    'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 4890,  'desi' => 10],
            ['barcode' => '0088381804929', 'name' => 'Makita DDF485RFJ 18V Akülü Vidalama',               'brand' => 'Makita',     'manufacturer' => 'Makita Corp.',    'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 5450,  'desi' => 9],
            ['barcode' => '0885911718110', 'name' => 'DeWalt DCD796P2 18V XR Darbeli Matkap Seti',        'brand' => 'DeWalt',     'manufacturer' => 'Stanley B&D',     'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 7890,  'desi' => 12],
            ['barcode' => '0885911718127', 'name' => 'DeWalt DCH273N 18V SDS-Plus Kırıcı Delici',         'brand' => 'DeWalt',     'manufacturer' => 'Stanley B&D',     'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 9450,  'desi' => 11],
            ['barcode' => '0045242511235', 'name' => 'Milwaukee M18 FPD2-0 FUEL Akülü Darbeli Matkap',    'brand' => 'Milwaukee',  'manufacturer' => 'Milwaukee Tool',  'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 8750,  'desi' => 10],
            ['barcode' => '0045242511242', 'name' => 'Milwaukee M18 CHPX-0 SDS-Plus Kırıcı',              'brand' => 'Milwaukee',  'manufacturer' => 'Milwaukee Tool',  'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 11450, 'desi' => 12],
            ['barcode' => '4024738001234', 'name' => 'Hilti TE 6-A36 Akülü Kırıcı Delici',                'brand' => 'Hilti',      'manufacturer' => 'Hilti Corp.',     'category_id' => $matkaplar, 'image' => self::IMG_POWER_TOOL, 'psf' => 14500, 'desi' => 13],

            // Taşlama & Kesme
            ['barcode' => '4059952621227', 'name' => 'Bosch GWS 750-125 Avuç Taşlama 125mm 750W',         'brand' => 'Bosch',      'manufacturer' => 'Robert Bosch',    'category_id' => $taslama,   'image' => self::IMG_POWER_TOOL, 'psf' => 1890,  'desi' => 5],
            ['barcode' => '0088381805421', 'name' => 'Makita GA5030 Avuç Taşlama 125mm 720W',             'brand' => 'Makita',     'manufacturer' => 'Makita Corp.',    'category_id' => $taslama,   'image' => self::IMG_POWER_TOOL, 'psf' => 1750,  'desi' => 4],
            ['barcode' => '0885911719254', 'name' => 'DeWalt DWE4057 Avuç Taşlama 125mm 800W',            'brand' => 'DeWalt',     'manufacturer' => 'Stanley B&D',     'category_id' => $taslama,   'image' => self::IMG_POWER_TOOL, 'psf' => 2450,  'desi' => 5],

            // Kaynak & Jeneratör
            ['barcode' => '8690000010011', 'name' => 'Lincoln Electric Invertec V205-T Kaynak Makinası',  'brand' => 'Lincoln',    'manufacturer' => 'Lincoln Elec.',   'category_id' => $kaynak,    'image' => self::IMG_POWER_TOOL, 'psf' => 18450, 'desi' => 25],
            ['barcode' => '8690000010028', 'name' => 'Magmaweld ID 250 MW Inverter Kaynak Makinası',      'brand' => 'Magmaweld',  'manufacturer' => 'Magmaweld',       'category_id' => $kaynak,    'image' => self::IMG_POWER_TOOL, 'psf' => 12890, 'desi' => 22],

            // Zımpara
            ['barcode' => '4059952622011', 'name' => 'Bosch GSS 23 AE Titreşimli Zımpara 190W',           'brand' => 'Bosch',      'manufacturer' => 'Robert Bosch',    'category_id' => $zimpara,   'image' => self::IMG_POWER_TOOL, 'psf' => 1690,  'desi' => 4],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function handTools(array $catIds): array
    {
        $anahtar   = $catIds['anahtarlar'] ?? $catIds['el-aletleri'] ?? null;
        $tornavida = $catIds['tornavida-bits'] ?? $catIds['el-aletleri'] ?? null;
        $pense     = $catIds['pense-kerpeten'] ?? $catIds['el-aletleri'] ?? null;
        $cekic     = $catIds['cekic-balyoz'] ?? $catIds['el-aletleri'] ?? null;

        return [
            ['barcode' => '8695003100011', 'name' => 'İzeltaş 24 Parça Cırcırlı Lokma Takımı 1/2" Set',   'brand' => 'İzeltaş',    'manufacturer' => 'İzeltaş Makine',  'category_id' => $anahtar,   'image' => self::IMG_HAND_TOOL, 'psf' => 1450, 'desi' => 4],
            ['barcode' => '8695003100028', 'name' => 'İzeltaş 9 Parça Kombine Anahtar Takımı 8-22mm',     'brand' => 'İzeltaş',    'manufacturer' => 'İzeltaş Makine',  'category_id' => $anahtar,   'image' => self::IMG_HAND_TOOL, 'psf' => 680,  'desi' => 2],
            ['barcode' => '8695003100035', 'name' => 'İzeltaş 8 Parça T-Saplı Alyan Takımı',               'brand' => 'İzeltaş',    'manufacturer' => 'İzeltaş Makine',  'category_id' => $anahtar,   'image' => self::IMG_HAND_TOOL, 'psf' => 345,  'desi' => 1],
            ['barcode' => '8695006400018', 'name' => 'Ceta Form 12 Parça Yıldız Anahtar Takımı 6-32mm',   'brand' => 'Ceta Form',  'manufacturer' => 'Ceta Form',       'category_id' => $anahtar,   'image' => self::IMG_HAND_TOOL, 'psf' => 890,  'desi' => 3],
            ['barcode' => '0076174003031', 'name' => 'Stanley 1-83-069 İngiliz Anahtar 12"',               'brand' => 'Stanley',    'manufacturer' => 'Stanley B&D',     'category_id' => $anahtar,   'image' => self::IMG_HAND_TOOL, 'psf' => 485,  'desi' => 1],

            ['barcode' => '8695003100042', 'name' => 'İzeltaş 7 Parça Tornavida Takımı Yıldız+Düz',        'brand' => 'İzeltaş',    'manufacturer' => 'İzeltaş Makine',  'category_id' => $tornavida, 'image' => self::IMG_HAND_TOOL, 'psf' => 220,  'desi' => 1],
            ['barcode' => '4059952631118', 'name' => 'Bosch 43 Parça Bits Uç Seti',                         'brand' => 'Bosch',      'manufacturer' => 'Robert Bosch',    'category_id' => $tornavida, 'image' => self::IMG_HAND_TOOL, 'psf' => 445,  'desi' => 1],
            ['barcode' => '0076174042121', 'name' => 'Stanley FatMax 6 Parça Tornavida Seti',              'brand' => 'Stanley',    'manufacturer' => 'Stanley B&D',     'category_id' => $tornavida, 'image' => self::IMG_HAND_TOOL, 'psf' => 395,  'desi' => 1],

            ['barcode' => '8695003100059', 'name' => 'İzeltaş 3 Parça Profesyonel Pense Takımı 180mm',    'brand' => 'İzeltaş',    'manufacturer' => 'İzeltaş Makine',  'category_id' => $pense,     'image' => self::IMG_HAND_TOOL, 'psf' => 640,  'desi' => 2],
            ['barcode' => '4003773085010', 'name' => 'Knipex 8 Parça Kombine Pense Seti',                   'brand' => 'Knipex',     'manufacturer' => 'Knipex Werk',     'category_id' => $pense,     'image' => self::IMG_HAND_TOOL, 'psf' => 2890, 'desi' => 3],

            ['barcode' => '0076174511000', 'name' => 'Stanley FatMax AntiVibe 16oz Çekiç',                  'brand' => 'Stanley',    'manufacturer' => 'Stanley B&D',     'category_id' => $cekic,     'image' => self::IMG_HAND_TOOL, 'psf' => 385,  'desi' => 2],
            ['barcode' => '8695003100066', 'name' => 'İzeltaş Ustura Çekiç 500gr Fiberglass Saplı',        'brand' => 'İzeltaş',    'manufacturer' => 'İzeltaş Makine',  'category_id' => $cekic,     'image' => self::IMG_HAND_TOOL, 'psf' => 185,  'desi' => 2],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function fasteners(array $catIds): array
    {
        $civata = $catIds['civatalar'] ?? $catIds['baglanti-elemanlari'] ?? null;
        $somun  = $catIds['somunlar']  ?? $catIds['baglanti-elemanlari'] ?? null;
        $vida   = $catIds['vidalar']   ?? $catIds['baglanti-elemanlari'] ?? null;
        $dubel  = $catIds['dubeller']  ?? $catIds['baglanti-elemanlari'] ?? null;

        return [
            ['barcode' => '8690111001011', 'name' => 'Würth M8x20 DIN 933 Galvaniz Civata (100 Adet)',     'brand' => 'Würth',      'manufacturer' => 'Würth',           'category_id' => $civata,    'image' => self::IMG_FASTENER, 'psf' => 125,  'desi' => 1],
            ['barcode' => '8690111001028', 'name' => 'Würth M10x30 DIN 933 Galvaniz Civata (50 Adet)',    'brand' => 'Würth',      'manufacturer' => 'Würth',           'category_id' => $civata,    'image' => self::IMG_FASTENER, 'psf' => 155,  'desi' => 1],
            ['barcode' => '8690111001035', 'name' => 'Würth M12x40 DIN 933 Galvaniz Civata (25 Adet)',    'brand' => 'Würth',      'manufacturer' => 'Würth',           'category_id' => $civata,    'image' => self::IMG_FASTENER, 'psf' => 145,  'desi' => 2],
            ['barcode' => '8690111001042', 'name' => 'Würth M6x16 DIN 912 Alyan Civata A2 Paslanmaz (100 Adet)', 'brand' => 'Würth', 'manufacturer' => 'Würth',          'category_id' => $civata,    'image' => self::IMG_FASTENER, 'psf' => 210,  'desi' => 1],
            ['barcode' => '8690222002011', 'name' => 'Berdan M8x25 DIN 933 Siyah Civata (100 Adet)',       'brand' => 'Berdan',     'manufacturer' => 'Berdan Cıvata',   'category_id' => $civata,    'image' => self::IMG_FASTENER, 'psf' => 85,   'desi' => 1],

            ['barcode' => '8690111002011', 'name' => 'Würth M8 DIN 934 Galvaniz Altıköşe Somun (250 Adet)', 'brand' => 'Würth',      'manufacturer' => 'Würth',           'category_id' => $somun,     'image' => self::IMG_FASTENER, 'psf' => 95,   'desi' => 1],
            ['barcode' => '8690111002028', 'name' => 'Würth M10 DIN 985 Fiber (Kilit) Somun (100 Adet)',   'brand' => 'Würth',      'manufacturer' => 'Würth',           'category_id' => $somun,     'image' => self::IMG_FASTENER, 'psf' => 135,  'desi' => 1],

            ['barcode' => '8690111003011', 'name' => 'SPAX 4x50 Sunta Vidası Torx (500 Adet)',             'brand' => 'SPAX',       'manufacturer' => 'SPAX',            'category_id' => $vida,      'image' => self::IMG_FASTENER, 'psf' => 285,  'desi' => 2],
            ['barcode' => '8690111003028', 'name' => 'SPAX 4x30 Ahşap Vidası Phillips (1000 Adet)',         'brand' => 'SPAX',       'manufacturer' => 'SPAX',            'category_id' => $vida,      'image' => self::IMG_FASTENER, 'psf' => 215,  'desi' => 2],
            ['barcode' => '8690111003035', 'name' => 'Bosch 3.5x25 Matkap Uçlu Teneke Vida (250 Adet)',    'brand' => 'Bosch',      'manufacturer' => 'Robert Bosch',    'category_id' => $vida,      'image' => self::IMG_FASTENER, 'psf' => 145,  'desi' => 1],

            ['barcode' => '8690111004011', 'name' => 'Fischer SX 8x40 Standart Plastik Dübel (100 Adet)',  'brand' => 'Fischer',    'manufacturer' => 'Fischer',         'category_id' => $dubel,     'image' => self::IMG_FASTENER, 'psf' => 65,   'desi' => 1],
            ['barcode' => '8690111004028', 'name' => 'Hilti HIT-HY 200 Kimyasal Dübel Kartuşu 330ml',      'brand' => 'Hilti',      'manufacturer' => 'Hilti Corp.',     'category_id' => $dubel,     'image' => self::IMG_FASTENER, 'psf' => 1890, 'desi' => 3],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function safety(array $catIds): array
    {
        $eldiven  = $catIds['eldivenler']   ?? $catIds['is-guvenligi'] ?? null;
        $baret    = $catIds['baret-kulak']  ?? $catIds['is-guvenligi'] ?? null;
        $maske    = $catIds['maske-filtre'] ?? $catIds['is-guvenligi'] ?? null;
        $gozluk   = $catIds['gozluk-yuz']   ?? $catIds['is-guvenligi'] ?? null;
        $ayakkabi = $catIds['is-ayakkabi']  ?? $catIds['is-guvenligi'] ?? null;

        return [
            ['barcode' => '4031101000011', 'name' => 'Uvex Unipur 6639 Nitril Kaplama İş Eldiveni 10 (L)', 'brand' => 'Uvex',       'manufacturer' => 'Uvex Safety',     'category_id' => $eldiven,   'image' => self::IMG_SAFETY, 'psf' => 145,  'desi' => 1],
            ['barcode' => '4031101000028', 'name' => 'Uvex Athletic 8916 Anti-Kesilme Eldiven Kesim C',   'brand' => 'Uvex',       'manufacturer' => 'Uvex Safety',     'category_id' => $eldiven,   'image' => self::IMG_SAFETY, 'psf' => 235,  'desi' => 1],
            ['barcode' => '0050051900011', 'name' => '3M Comfort Grip Nitril Genel Kullanım Eldiven L',    'brand' => '3M',         'manufacturer' => '3M Company',      'category_id' => $eldiven,   'image' => self::IMG_SAFETY, 'psf' => 95,   'desi' => 1],

            ['barcode' => '4031101000035', 'name' => 'Uvex Pheos Alpine Baret (Beyaz)',                    'brand' => 'Uvex',       'manufacturer' => 'Uvex Safety',     'category_id' => $baret,     'image' => self::IMG_SAFETY, 'psf' => 425,  'desi' => 2],
            ['barcode' => '0050051900028', 'name' => '3M Peltor H510A Kulak Koruyucu 27dB',                'brand' => '3M',         'manufacturer' => '3M Company',      'category_id' => $baret,     'image' => self::IMG_SAFETY, 'psf' => 385,  'desi' => 2],

            ['barcode' => '0050051900035', 'name' => '3M 9322+ Aura FFP2 NR D Toz Maskesi (10 Adet)',      'brand' => '3M',         'manufacturer' => '3M Company',      'category_id' => $maske,     'image' => self::IMG_SAFETY, 'psf' => 275,  'desi' => 1],
            ['barcode' => '0050051900042', 'name' => '3M 9332+ Aura FFP3 NR D Toz Maskesi (10 Adet)',      'brand' => '3M',         'manufacturer' => '3M Company',      'category_id' => $maske,     'image' => self::IMG_SAFETY, 'psf' => 385,  'desi' => 1],

            ['barcode' => '4031101000042', 'name' => 'Uvex Pheos S İş Gözlüğü Şeffaf',                     'brand' => 'Uvex',       'manufacturer' => 'Uvex Safety',     'category_id' => $gozluk,    'image' => self::IMG_SAFETY, 'psf' => 145,  'desi' => 1],

            ['barcode' => '8690333100011', 'name' => 'Yılmaz Çelik Burunlu İş Ayakkabısı S3 SRC No:42',    'brand' => 'Yılmaz',     'manufacturer' => 'Yılmaz Safety',   'category_id' => $ayakkabi,  'image' => self::IMG_SAFETY, 'psf' => 890,  'desi' => 3],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function electric(array $catIds): array
    {
        $kablo      = $catIds['kablolar']          ?? $catIds['elektrik-malzemeleri'] ?? null;
        $priz       = $catIds['priz-anahtar']      ?? $catIds['elektrik-malzemeleri'] ?? null;
        $salt       = $catIds['salt-malzemeleri']  ?? $catIds['elektrik-malzemeleri'] ?? null;
        $aydinlatma = $catIds['aydinlatma']        ?? $catIds['elektrik-malzemeleri'] ?? null;

        return [
            ['barcode' => '8690444100011', 'name' => 'Öznur NYA 2.5mm Tek Damar Kablo (100m Makara)',      'brand' => 'Öznur',      'manufacturer' => 'Öznur Kablo',     'category_id' => $kablo,      'image' => self::IMG_ELECTRIC, 'psf' => 1650, 'desi' => 8],
            ['barcode' => '8690444100028', 'name' => 'Öznur NYM 3x2.5mm Çok Damar Kablo (100m)',           'brand' => 'Öznur',      'manufacturer' => 'Öznur Kablo',     'category_id' => $kablo,      'image' => self::IMG_ELECTRIC, 'psf' => 2890, 'desi' => 10],
            ['barcode' => '8690555100011', 'name' => 'Viko Karre Topraklı Priz Beyaz (10 Adet)',           'brand' => 'Viko',       'manufacturer' => 'Panasonic',       'category_id' => $priz,       'image' => self::IMG_ELECTRIC, 'psf' => 385,  'desi' => 2],
            ['barcode' => '8690555100028', 'name' => 'Viko Karre Anahtar Beyaz (10 Adet)',                 'brand' => 'Viko',       'manufacturer' => 'Panasonic',       'category_id' => $priz,       'image' => self::IMG_ELECTRIC, 'psf' => 295,  'desi' => 1],
            ['barcode' => '8690666100011', 'name' => 'Schneider Electric C60N 16A B Eğrisi 1 Faz Sigorta','brand' => 'Schneider',  'manufacturer' => 'Schneider',       'category_id' => $salt,       'image' => self::IMG_ELECTRIC, 'psf' => 125,  'desi' => 1],
            ['barcode' => '8690666100028', 'name' => 'ABB F204 AC-40/0.03 4P Kaçak Akım Röle',             'brand' => 'ABB',        'manufacturer' => 'ABB',             'category_id' => $salt,       'image' => self::IMG_ELECTRIC, 'psf' => 885,  'desi' => 1],
            ['barcode' => '8690777100011', 'name' => 'Philips Master LED E27 9W Beyaz (10 Adet)',          'brand' => 'Philips',    'manufacturer' => 'Signify',         'category_id' => $aydinlatma, 'image' => self::IMG_ELECTRIC, 'psf' => 685,  'desi' => 2],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function plumbing(array $catIds): array
    {
        $boru    = $catIds['ppr-pvc-borular'] ?? $catIds['tesisat-su'] ?? null;
        $vana    = $catIds['vanalar']         ?? $catIds['tesisat-su'] ?? null;
        $armatur = $catIds['armaturler']      ?? $catIds['tesisat-su'] ?? null;
        $pompa   = $catIds['pompa-hidrofor']  ?? $catIds['tesisat-su'] ?? null;

        return [
            ['barcode' => '8690888100011', 'name' => 'Pilsa PPR-C 25mm Beyaz Tesisat Borusu (4m)',         'brand' => 'Pilsa',      'manufacturer' => 'Pilsa',           'category_id' => $boru,    'image' => self::IMG_PLUMBING, 'psf' => 145,  'desi' => 3],
            ['barcode' => '8690888100028', 'name' => 'Pilsa PPR-C 32mm Beyaz Tesisat Borusu (4m)',         'brand' => 'Pilsa',      'manufacturer' => 'Pilsa',           'category_id' => $boru,    'image' => self::IMG_PLUMBING, 'psf' => 195,  'desi' => 4],
            ['barcode' => '8690999100011', 'name' => 'Duyar 1/2" Pirinç Küresel Vana Kırmızı Kollu',       'brand' => 'Duyar',      'manufacturer' => 'Duyar',           'category_id' => $vana,    'image' => self::IMG_PLUMBING, 'psf' => 85,   'desi' => 1],
            ['barcode' => '8690999100028', 'name' => 'Duyar 3/4" Pirinç Çekvalf Vana',                     'brand' => 'Duyar',      'manufacturer' => 'Duyar',           'category_id' => $vana,    'image' => self::IMG_PLUMBING, 'psf' => 145,  'desi' => 1],
            ['barcode' => '8691010100011', 'name' => 'E.C.A. Niobe Banyo Bataryası Krom',                  'brand' => 'E.C.A.',     'manufacturer' => 'E.C.A.',          'category_id' => $armatur, 'image' => self::IMG_PLUMBING, 'psf' => 1890, 'desi' => 4],
            ['barcode' => '8691111100011', 'name' => 'Pentax CAM 100/00 Jet Pompa 1HP',                    'brand' => 'Pentax',     'manufacturer' => 'Pentax',          'category_id' => $pompa,   'image' => self::IMG_PLUMBING, 'psf' => 6890, 'desi' => 18],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function garden(array $catIds): array
    {
        $hortum  = $catIds['hortum-sulama']    ?? $catIds['bahce-orman'] ?? null;
        $testere = $catIds['motorlu-testere']  ?? $catIds['bahce-orman'] ?? null;
        $budama  = $catIds['budama-makas']     ?? $catIds['bahce-orman'] ?? null;

        return [
            ['barcode' => '4015120001011', 'name' => 'Gardena 18/25 Comfort Bahçe Hortumu 20m Set',        'brand' => 'Gardena',    'manufacturer' => 'Gardena',         'category_id' => $hortum,  'image' => self::IMG_GARDEN, 'psf' => 1245, 'desi' => 6],
            ['barcode' => '0088381810011', 'name' => 'Makita EA3203S Motorlu Testere 32cc 35cm',           'brand' => 'Makita',     'manufacturer' => 'Makita Corp.',    'category_id' => $testere, 'image' => self::IMG_GARDEN, 'psf' => 5890, 'desi' => 18],
            ['barcode' => '4015120001028', 'name' => 'Gardena 8905 Comfort Budama Makası',                 'brand' => 'Gardena',    'manufacturer' => 'Gardena',         'category_id' => $budama,  'image' => self::IMG_GARDEN, 'psf' => 385,  'desi' => 1],
        ];
    }
}
