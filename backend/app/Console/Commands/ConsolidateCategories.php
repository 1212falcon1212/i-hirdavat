<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Category;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * JSON import sonrası 29 root kategorinin bazılarını mantıklı ana kategorilere
 * taşır ve isim çürümelerini düzeltir.
 *
 * Idempotent: tüm işlemler slug-bazlı; hedef zaten doğruysa atlar.
 */
class ConsolidateCategories extends Command
{
    protected $signature = 'categories:consolidate {--dry-run : Sadece planı göster, değişiklik yapma}';

    protected $description = 'Sparse root kategorileri uygun ana kategorilere taşır ve isimleri normalleştirir';

    /**
     * Yeniden adlandırılacak kategoriler.
     * mevcut_slug => [yeni_isim, yeni_slug]
     */
    private const RENAMES = [
        'aydinlatma-aletleri' => ['Aydınlatma', 'aydinlatma'],
    ];

    /**
     * Reparent edilecek root kategoriler.
     * source_slug => target_slug (her ikisi de root olduğu varsayılır;
     *  source root değilse de işlem yine de geçerli).
     */
    private const MOVES = [
        // Aydınlatma şemsiyesi altında topla
        'aydinlatma-aksesuarlari' => 'aydinlatma',
        'led-lambalar' => 'aydinlatma',

        // El aletleri altında topla
        'purmuzler' => 'el-aletleri',
        'tornavida-setleri' => 'el-aletleri',
        'vida-tamir-setleri' => 'el-aletleri',
        'penseler' => 'el-aletleri',

        // Elektrikli el aletleri altında topla
        'matkap' => 'elektrikli-el-aletleri',
        'dogrultmalar' => 'elektrikli-el-aletleri',
        'kaynak-makinalari' => 'elektrikli-el-aletleri',
        'kaynak-aksesuarlari' => 'elektrikli-el-aletleri',

        // Aksesuarlar altında topla
        'versa-aksesuarlari' => 'aksesuarlar',
        'versatip-aksesuarlari' => 'aksesuarlar',
        'kesme-aksesuarlari' => 'aksesuarlar',
        'zimparalama-aksesuarlari' => 'aksesuarlar',

        // Oto bakım altında topla
        'sanziman-krikosu' => 'oto-bakim-aletleri',

        // Ölçme cihazları altında topla
        'olcu-aletleri' => 'dijital-olcme-cihazlari',
    ];

    /**
     * Bu root'lar tamamen kaldırılır; çocukları belirtilen target'a taşınır.
     * source_slug => target_slug
     */
    private const ABSORB_ROOTS = [
        'osaka-profesyonel' => 'el-aletleri',
        'elektrikli-ve-akulu-el-aletleri' => 'elektrikli-el-aletleri',
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        if ($dryRun) {
            $this->warn('🔍 DRY-RUN modu: değişiklik yapılmayacak.');
        }

        $this->info('=== KONSOLİDASYON PLANI ===');
        $this->newLine();

        DB::beginTransaction();
        try {
            // 1) Yeniden adlandırma
            $this->line('1) İsim/slug normalizasyonu:');
            foreach (self::RENAMES as $oldSlug => [$newName, $newSlug]) {
                $cat = Category::where('slug', $oldSlug)->whereNull('parent_id')->first();
                if (! $cat) {
                    $this->line("   - {$oldSlug}: bulunamadı, atlandı");
                    continue;
                }
                if ($cat->name === $newName && $cat->slug === $newSlug) {
                    $this->line("   - {$oldSlug}: zaten doğru, atlandı");
                    continue;
                }
                $this->line("   ✏  {$cat->name} ({$oldSlug}) → {$newName} ({$newSlug})");
                if (! $dryRun) {
                    $cat->name = $newName;
                    $cat->slug = $newSlug;
                    $cat->save();
                }
            }
            $this->newLine();

            // 2) Reparent
            $this->line('2) Reparent (root → child of):');
            foreach (self::MOVES as $sourceSlug => $targetSlug) {
                // Sadece root düzeyindeki source'u hedefle (aynı slugla derinlerde başka kategori olabilir)
                $source = Category::where('slug', $sourceSlug)->whereNull('parent_id')->first();
                if (! $source) {
                    $this->line("   - {$sourceSlug}: root olarak bulunamadı, atlandı");
                    continue;
                }
                $target = Category::where('slug', $targetSlug)->whereNull('parent_id')->first();
                if (! $target) {
                    $this->warn("   ! {$targetSlug} (target) bulunamadı, {$sourceSlug} atlanıyor");
                    continue;
                }
                if ((int) $source->parent_id === (int) $target->id) {
                    $this->line("   - {$sourceSlug}: zaten {$targetSlug} altında, atlandı");
                    continue;
                }
                // Slug çakışması kontrolü (parent_id, slug) unique
                $conflict = Category::where('parent_id', $target->id)
                    ->where('slug', $source->slug)
                    ->where('id', '!=', $source->id)
                    ->exists();
                if ($conflict) {
                    $this->warn("   ! {$sourceSlug} → {$targetSlug}: slug çakışması, atlanıyor (manuel müdahale gerekir)");
                    continue;
                }
                $this->line("   →  {$source->name} → {$target->name}");
                if (! $dryRun) {
                    $source->parent_id = $target->id;
                    $source->save(); // boot::saved ile full_slug + descendants güncellenir
                }
            }
            $this->newLine();

            // 3) Absorb (root sil, çocukları taşı)
            $this->line('3) Absorb (root kaldır, çocuklar yeni parent\'a):');
            foreach (self::ABSORB_ROOTS as $sourceSlug => $targetSlug) {
                $source = Category::where('slug', $sourceSlug)->whereNull('parent_id')->first();
                if (! $source) {
                    $this->line("   - {$sourceSlug}: bulunamadı, atlandı");
                    continue;
                }
                $target = Category::where('slug', $targetSlug)->whereNull('parent_id')->first();
                if (! $target) {
                    $this->warn("   ! {$targetSlug} bulunamadı, {$sourceSlug} atlanıyor");
                    continue;
                }
                $children = $source->children;
                $this->line("   ⊕  {$source->name} kaldırılıyor; {$children->count()} çocuk → {$target->name}");
                if (! $dryRun) {
                    foreach ($children as $child) {
                        $conflict = Category::where('parent_id', $target->id)
                            ->where('slug', $child->slug)
                            ->where('id', '!=', $child->id)
                            ->exists();
                        if ($conflict) {
                            // Slug çakışması varsa: kaynak sluga "-x" ekle
                            $child->slug = $child->slug . '-x';
                        }
                        $child->parent_id = $target->id;
                        $child->save();
                    }
                    // Source'a bağlı ürün varsa target'a taşı
                    DB::table('products')
                        ->where('category_id', $source->id)
                        ->update(['category_id' => $target->id]);
                    // Root'u sil
                    $source->delete();
                }
            }
            $this->newLine();

            if ($dryRun) {
                DB::rollBack();
                $this->warn('Dry-run: tüm değişiklikler geri alındı.');
            } else {
                DB::commit();
                $this->info('✅ Konsolidasyon tamamlandı.');
                // Cache temizle
                \Illuminate\Support\Facades\Cache::flush();
            }

            // Özet
            $this->newLine();
            $rootCount = Category::whereNull('parent_id')->count();
            $totalCount = Category::count();
            $this->info("Şu anki durum: {$rootCount} root / {$totalCount} toplam kategori");
            $this->info('Root kategoriler:');
            foreach (Category::whereNull('parent_id')->orderBy('name')->get() as $r) {
                $this->line(sprintf('  • %s (%d alt kategori)', $r->name, $r->children()->count()));
            }

            return self::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Hata: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
