<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Önce unique index'i bırak (isimle bul)
        $indexes = DB::select("SHOW INDEX FROM products WHERE Column_name='barcode' AND Non_unique=0");
        foreach ($indexes as $idx) {
            DB::statement("ALTER TABLE products DROP INDEX `{$idx->Key_name}`");
        }

        Schema::table('products', function (Blueprint $table) {
            $table->string('barcode', 32)->nullable()->change();
            $table->index('barcode', 'products_barcode_idx');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_barcode_idx');
            $table->string('barcode', 14)->nullable(false)->unique()->change();
        });
    }
};
