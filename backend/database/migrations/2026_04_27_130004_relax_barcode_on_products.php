<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // barcode kolonu üzerindeki unique index'leri portatif şekilde düşür
        // (MySQL/MariaDB ve SQLite test bağlantılarında çalışır).
        $uniqueBarcodeIndexes = collect(Schema::getIndexes('products'))
            ->filter(fn ($idx) => in_array('barcode', $idx['columns'] ?? [], true) && ! empty($idx['unique']))
            ->all();

        foreach ($uniqueBarcodeIndexes as $idx) {
            Schema::table('products', function (Blueprint $table) use ($idx) {
                $table->dropIndex($idx['name']);
            });
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
