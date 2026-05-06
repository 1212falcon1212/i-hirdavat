<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hiyerarşik kategori desteği: aynı slug farklı parent altında olabilir.
     * `slug` üzerindeki global unique kaldırılır; (parent_id, slug) composite unique eklenir.
     */
    public function up(): void
    {
        // slug kolonu üzerindeki unique index'leri portatif şekilde düşür
        // (MySQL/MariaDB ve SQLite test bağlantılarında çalışır).
        $uniqueSlugIndexes = collect(Schema::getIndexes('categories'))
            ->filter(fn ($idx) => in_array('slug', $idx['columns'] ?? [], true) && ! empty($idx['unique']))
            ->all();

        foreach ($uniqueSlugIndexes as $idx) {
            Schema::table('categories', function ($table) use ($idx) {
                $table->dropIndex($idx['name']);
            });
        }

        Schema::table('categories', function ($table) {
            $table->unique(['parent_id', 'slug'], 'categories_parent_slug_unique');
            $table->index('slug', 'categories_slug_idx');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function ($table) {
            $table->dropUnique('categories_parent_slug_unique');
            $table->dropIndex('categories_slug_idx');
            $table->unique('slug');
        });
    }
};
