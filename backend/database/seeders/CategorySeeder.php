<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * i-hırdavat kategori seeder.
 *
 * Kategori ağacı `database/hardware_categories.json` dosyasından okunur
 * (CLAUDE.md §2.3 — mega menu için 9 ana kategori + alt kategoriler).
 */
class CategorySeeder extends Seeder
{
    private const DEFAULT_COMMISSION_RATE = 10.00;

    public function run(): void
    {
        $this->command->info('Kategori seed işlemi başlıyor...');

        $this->command->warn('Mevcut kategoriler siliniyor...');
        Category::query()->delete();
        $driver = DB::connection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE categories AUTO_INCREMENT = 1');
        } elseif ($driver === 'sqlite') {
            DB::statement("DELETE FROM sqlite_sequence WHERE name = 'categories'");
        }

        $jsonPath = database_path('hardware_categories.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("JSON dosyası bulunamadı: {$jsonPath}");
            return;
        }

        $categoriesData = json_decode((string) file_get_contents($jsonPath), true);

        if (!is_array($categoriesData)) {
            $this->command->error('JSON dosyası okunamadı');
            return;
        }

        $totalMain = 0;
        $totalSub = 0;
        $sortOrder = 1;

        foreach ($categoriesData as $categoryNode) {
            if (!isset($categoryNode['name'], $categoryNode['slug'])) {
                continue;
            }

            $parent = Category::create([
                'name' => $categoryNode['name'],
                'slug' => $categoryNode['slug'],
                'description' => $categoryNode['description'] ?? ($categoryNode['name'] . ' kategorisi'),
                'parent_id' => null,
                'is_active' => true,
                'sort_order' => $sortOrder++,
                'commission_rate' => $categoryNode['commission_rate'] ?? self::DEFAULT_COMMISSION_RATE,
                'show_on_homepage' => $categoryNode['show_on_homepage'] ?? false,
            ]);

            $totalMain++;
            $this->command->info("✓ Ana Kategori: {$parent->name} (ID: {$parent->id})");

            $childSortOrder = 1;
            foreach ($categoryNode['children'] ?? [] as $child) {
                if (!isset($child['name'], $child['slug'])) {
                    continue;
                }

                $slug = $child['slug'];
                if (Category::where('slug', $slug)->exists()) {
                    $slug = $slug . '-' . $parent->id;
                }

                Category::create([
                    'name' => $child['name'],
                    'slug' => $slug,
                    'description' => $child['description'] ?? ($child['name'] . ' ürünleri'),
                    'parent_id' => $parent->id,
                    'is_active' => true,
                    'sort_order' => $childSortOrder++,
                    'commission_rate' => $child['commission_rate']
                        ?? $categoryNode['commission_rate']
                        ?? self::DEFAULT_COMMISSION_RATE,
                    'show_on_homepage' => false,
                ]);
                $totalSub++;
            }
        }

        $this->command->info('-----------------------------------');
        $this->command->info("✓ Toplam {$totalMain} ana kategori eklendi");
        $this->command->info("✓ Toplam {$totalSub} alt kategori eklendi");
        $this->command->info('-----------------------------------');
    }
}
