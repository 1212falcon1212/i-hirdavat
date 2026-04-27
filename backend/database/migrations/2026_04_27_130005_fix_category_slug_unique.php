<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hiyerarşik kategori desteği: aynı slug farklı parent altında olabilir.
     * `slug` üzerindeki global unique kaldırılır; (parent_id, slug) composite unique eklenir.
     */
    public function up(): void
    {
        $indexes = DB::select("SHOW INDEX FROM categories WHERE Column_name='slug' AND Non_unique=0");
        foreach ($indexes as $idx) {
            DB::statement("ALTER TABLE categories DROP INDEX `{$idx->Key_name}`");
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
