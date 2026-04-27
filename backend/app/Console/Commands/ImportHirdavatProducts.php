<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductImage;
use App\Models\Offer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * hirdavat_products.json dosyasından kategori ağacı, marka, ürün, görsel ve
 * teknik özellikleri DB'ye import eder.
 *
 * Kullanım:
 *   php artisan import:hirdavat-products            (mevcut veriyi koruyarak update/insert)
 *   php artisan import:hirdavat-products --fresh    (kategori/ürün/marka/teklif tamamen wipe edilir)
 */
class ImportHirdavatProducts extends Command
{
    protected $signature = 'import:hirdavat-products
        {--file= : JSON dosya yolu (varsayılan: proje kökündeki hirdavat_products.json)}
        {--fresh : Mevcut categories/brands/products/offers tablolarını sıfırla}';

    protected $description = 'hirdavat_products.json içeriğini DB\'ye import eder (kategori ağacı, markalar, ürünler, görseller, özellikler)';

    private const FALLBACK_CATEGORY = 'Diğer Ürünler';

    /**
     * Ham marka string'leri için manuel kanonikleştirme.
     * Anahtar: trim+mb_strtolower; Değer: kanonik gösterim.
     */
    private const BRAND_CANONICAL_MAP = [
        'bosch' => 'Bosch',
        'bosch profesyonel seri' => 'Bosch Profesyonel',
        'bosch profesyonel' => 'Bosch Profesyonel',
        'bosch aksesuar' => 'Bosch Aksesuar',
        'bosch aksesuarlar' => 'Bosch Aksesuarlar',
        'bosch hafif hizmet' => 'Bosch Hafif Hizmet',
        'bosch bahçe aletleri' => 'Bosch Bahçe Aletleri',
        'bosch ölçme aletleri' => 'Bosch Ölçme Aletleri',
        'stanley' => 'Stanley',
        'knipex' => 'Knipex',
        'mitutoyo' => 'Mitutoyo',
        'dremel' => 'Dremel',
        'osaka' => 'Osaka',
        'proter' => 'Proter',
        'uni-t' => 'Uni-T',
        'diğer' => 'Diğer',
    ];

    /**
     * Bilinen veri bozulmaları için kategori adı düzeltmeleri.
     */
    private const CATEGORY_NAME_FIXUP = [
        'latma Aksesuarları' => 'Aydınlatma Aksesuarları',
    ];

    public function handle(): int
    {
        $path = $this->option('file') ?: base_path('../hirdavat_products.json');
        if (! is_file($path)) {
            $this->error("JSON dosyası bulunamadı: {$path}");
            return self::FAILURE;
        }

        $this->info("📂 JSON okunuyor: {$path}");
        $raw = file_get_contents($path);
        $data = json_decode($raw, true);
        if (! is_array($data) || ! isset($data['products'])) {
            $this->error('Geçersiz JSON formatı (products array bulunamadı).');
            return self::FAILURE;
        }

        $items = $data['products'];
        $this->info(sprintf('📦 JSON\'da %d kayıt bulundu (success_count=%d).', count($items), $data['success_count'] ?? 0));

        if ($this->option('fresh')) {
            $this->wipe();
        }

        // 1) Markalar
        $this->info('🏷  Markalar normalize ediliyor...');
        $brandIdMap = $this->upsertBrands($items);
        $this->info(sprintf('   → %d kanonik marka oluşturuldu/güncellendi.', count($brandIdMap)));

        // 2) Kategoriler (hiyerarşik)
        $this->info('🗂  Kategori ağacı kuruluyor...');
        $categoryIdMap = $this->upsertCategories($items);
        $this->info(sprintf('   → %d kategori (tüm seviyeler) oluşturuldu/güncellendi.', count($categoryIdMap)));

        // 3) Ürünler + görseller + özellikler
        $this->info('📥 Ürünler import ediliyor...');
        $stats = $this->upsertProducts($items, $brandIdMap, $categoryIdMap);

        $this->info('');
        $this->info('✅ Import tamamlandı.');
        $this->info(sprintf('   Yeni ürün: %d', $stats['created']));
        $this->info(sprintf('   Güncellenen: %d', $stats['updated']));
        $this->info(sprintf('   Atlanan: %d', $stats['skipped']));
        $this->info(sprintf('   Toplam görsel: %d', $stats['images']));
        $this->info(sprintf('   Toplam özellik: %d', $stats['attributes']));

        return self::SUCCESS;
    }

    private function wipe(): void
    {
        $this->warn('⚠️  --fresh: ürün/kategori/marka/teklif/sepet kayıtları siliniyor...');
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('cart_items')->truncate();
        DB::table('wishlists')->truncate();
        Offer::query()->forceDelete();
        DB::table('offers')->truncate();
        DB::table('product_attributes')->truncate();
        DB::table('product_images')->truncate();
        DB::table('products')->truncate();
        DB::table('categories')->truncate();
        DB::table('brands')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        $this->info('   → Tablolar temizlendi.');
    }

    /**
     * Markaları kanonik forma indirir, brands tablosuna yazar, key→id map döner.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<string, int>  brand canonical (mb_strtolower) → brand_id
     */
    private function upsertBrands(array $items): array
    {
        $canonicalSet = [];
        foreach ($items as $item) {
            $raw = trim((string) ($item['brand'] ?? ''));
            if ($raw === '') {
                continue;
            }
            $key = mb_strtolower($raw, 'UTF-8');
            $canonical = self::BRAND_CANONICAL_MAP[$key] ?? $this->canonicalizeBrandName($raw);
            $canonicalKey = mb_strtolower($canonical, 'UTF-8');
            $canonicalSet[$canonicalKey] = $canonical;
        }

        $map = [];
        foreach ($canonicalSet as $key => $name) {
            $brand = Brand::firstOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'is_active' => true,
                    'is_featured' => false,
                    'sort_order' => 0,
                ]
            );
            $map[$key] = $brand->id;
        }

        return $map;
    }

    private function canonicalizeBrandName(string $raw): string
    {
        // Tamamı UPPERCASE ise title-case'e çevir; karışıksa olduğu gibi bırak
        $trimmed = trim($raw);
        if (mb_strtoupper($trimmed, 'UTF-8') === $trimmed) {
            return mb_convert_case(mb_strtolower($trimmed, 'UTF-8'), MB_CASE_TITLE, 'UTF-8');
        }
        return $trimmed;
    }

    /**
     * Tüm kategori path'lerini parse edip parent-child Category kayıtları üretir.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<string, int>  full path slug → category_id (leaf dahil her seviye)
     */
    private function upsertCategories(array $items): array
    {
        // Tüm benzersiz path'leri çıkar (son eleman = ürün adı, drop edilir)
        $paths = [];
        foreach ($items as $item) {
            $cats = $item['categories'] ?? [];
            if (! is_array($cats) || count($cats) < 2) {
                // length 0/1: leaf yok demek, fallback'a düşecek
                continue;
            }
            $hierarchy = array_slice($cats, 0, count($cats) - 1);
            $hierarchy = array_values(array_map(fn ($n) => $this->normalizeCategoryName($n), $hierarchy));
            $hierarchy = array_values(array_filter($hierarchy, fn ($n) => $n !== ''));
            if ($hierarchy === []) {
                continue;
            }
            $paths[] = $hierarchy;
        }

        // Fallback root da ekle
        $paths[] = [self::FALLBACK_CATEGORY];

        // Parent → child sırasıyla insert: derinlik sırası önemli
        $map = [];
        foreach ($paths as $hierarchy) {
            $parentId = null;
            $accSlugs = [];
            foreach ($hierarchy as $depth => $name) {
                $accSlugs[] = Str::slug($name);
                $fullSlug = implode('/', $accSlugs);
                if (isset($map[$fullSlug])) {
                    $parentId = $map[$fullSlug];
                    continue;
                }
                $category = Category::firstOrCreate(
                    ['full_slug' => $fullSlug],
                    [
                        'name' => $name,
                        'slug' => Str::slug($name),
                        'parent_id' => $parentId,
                        'is_active' => true,
                        'show_on_homepage' => false,
                        'commission_rate' => 0,
                    ]
                );
                $map[$fullSlug] = $category->id;
                $parentId = $category->id;
            }
        }

        return $map;
    }

    private function normalizeCategoryName(string $name): string
    {
        $name = trim($name);
        return self::CATEGORY_NAME_FIXUP[$name] ?? $name;
    }

    /**
     * Tek tek ürünleri yazar, görsellerini ve özelliklerini ekler.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @param  array<string, int>  $brandIdMap
     * @param  array<string, int>  $categoryIdMap
     * @return array<string, int>
     */
    private function upsertProducts(array $items, array $brandIdMap, array $categoryIdMap): array
    {
        $stats = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'images' => 0, 'attributes' => 0];

        $bar = $this->output->createProgressBar(count($items));
        $bar->start();

        foreach ($items as $item) {
            $bar->advance();

            // Skip: error, name yok
            if (! empty($item['error']) || empty($item['name'])) {
                $stats['skipped']++;
                continue;
            }

            $externalId = (string) ($item['id'] ?? '');
            if ($externalId === '') {
                $stats['skipped']++;
                continue;
            }

            // Marka resolve
            $brandRaw = trim((string) ($item['brand'] ?? ''));
            $brandId = null;
            $brandLabel = null;
            if ($brandRaw !== '') {
                $key = mb_strtolower($brandRaw, 'UTF-8');
                $canonical = self::BRAND_CANONICAL_MAP[$key] ?? $this->canonicalizeBrandName($brandRaw);
                $canonicalKey = mb_strtolower($canonical, 'UTF-8');
                $brandId = $brandIdMap[$canonicalKey] ?? null;
                $brandLabel = $canonical;
            }

            // Kategori resolve (leaf)
            $cats = $item['categories'] ?? [];
            $categoryId = null;
            if (is_array($cats) && count($cats) >= 2) {
                $hierarchy = array_slice($cats, 0, count($cats) - 1);
                $hierarchy = array_values(array_map(fn ($n) => $this->normalizeCategoryName($n), $hierarchy));
                $hierarchy = array_values(array_filter($hierarchy, fn ($n) => $n !== ''));
                if ($hierarchy !== []) {
                    $accSlugs = array_map(fn ($n) => Str::slug($n), $hierarchy);
                    $leafSlug = implode('/', $accSlugs);
                    $categoryId = $categoryIdMap[$leafSlug] ?? null;
                }
            }
            if ($categoryId === null) {
                $categoryId = $categoryIdMap[Str::slug(self::FALLBACK_CATEGORY)] ?? null;
            }

            // Fiyat (psf)
            $priceRaw = $item['price'] ?? null;
            $psf = null;
            if ($priceRaw !== null && $priceRaw !== '') {
                $clean = preg_replace('/[^0-9\.,]/', '', (string) $priceRaw);
                $clean = str_replace(',', '.', (string) $clean);
                $psf = is_numeric($clean) ? (float) $clean : null;
            }

            // Barcode (boş olabilir, dup olabilir; constraint gevşedi)
            $barcode = trim((string) ($item['barcode'] ?? ''));
            if ($barcode === '') {
                $barcode = null;
            }

            // Slug (ürün için)
            $slug = $this->makeUniqueProductSlug((string) $item['name'], $externalId);

            // Product upsert by external_id
            $product = Product::updateOrCreate(
                ['external_id' => $externalId],
                [
                    'barcode' => $barcode,
                    'sku' => trim((string) ($item['sku'] ?? '')) ?: null,
                    'external_url' => $item['url'] ?? null,
                    'slug' => $slug,
                    'name' => trim((string) $item['name']),
                    'brand' => $brandLabel,
                    'brand_id' => $brandId,
                    'manufacturer' => null,
                    'description' => $item['description'] ?: null,
                    'image' => $this->firstImage($item),
                    'category_id' => $categoryId,
                    'psf' => $psf,
                    'is_active' => true,
                    'approval_status' => 'approved',
                    'source' => 'import',
                ]
            );

            if ($product->wasRecentlyCreated) {
                $stats['created']++;
            } else {
                $stats['updated']++;
            }

            // Görseller (rebuild)
            ProductImage::where('product_id', $product->id)->delete();
            $images = $item['images'] ?? [];
            if (is_array($images) && $images !== []) {
                foreach (array_values($images) as $idx => $url) {
                    if (! is_string($url) || $url === '') {
                        continue;
                    }
                    ProductImage::create([
                        'product_id' => $product->id,
                        'url' => $url,
                        'sort_order' => $idx,
                        'is_primary' => $idx === 0,
                    ]);
                    $stats['images']++;
                }
            }

            // Özellikler (rebuild)
            ProductAttribute::where('product_id', $product->id)->delete();
            $features = $item['features'] ?? [];
            if (is_array($features) && $features !== []) {
                foreach (array_values($features) as $idx => $f) {
                    $label = trim((string) ($f['label'] ?? ''));
                    $value = trim((string) ($f['value'] ?? ''));
                    if ($label === '' && $value === '') {
                        continue;
                    }
                    // Bazı label'larda baş "-" karakteri var: temizle
                    $label = ltrim($label, '-‎ ');
                    $label = trim($label);
                    if ($label === '') {
                        continue;
                    }
                    ProductAttribute::create([
                        'product_id' => $product->id,
                        'label' => mb_substr($label, 0, 255, 'UTF-8'),
                        'value' => mb_substr($value, 0, 1024, 'UTF-8'),
                        'sort_order' => $idx,
                    ]);
                    $stats['attributes']++;
                }
            }
        }

        $bar->finish();
        $this->newLine(2);

        return $stats;
    }

    private function firstImage(array $item): ?string
    {
        $images = $item['images'] ?? [];
        if (! is_array($images) || $images === []) {
            return null;
        }
        $first = reset($images);
        return is_string($first) && $first !== '' ? $first : null;
    }

    private function makeUniqueProductSlug(string $name, string $externalId): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'urun';
        }
        // external_id'nin son 8 karakterini ekle benzersizlik için
        $suffix = substr(md5($externalId), 0, 8);
        return mb_substr($base, 0, 240, 'UTF-8') . '-' . $suffix;
    }
}
