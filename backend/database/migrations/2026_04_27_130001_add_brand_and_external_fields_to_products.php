<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->after('brand')->constrained('brands')->nullOnDelete();
            $table->string('slug')->nullable()->after('name');
            $table->string('sku', 64)->nullable()->after('barcode');
            $table->string('external_id')->nullable()->after('sku');
            $table->string('external_url', 512)->nullable()->after('external_id');

            $table->index('slug');
            $table->index('sku');
            $table->index('external_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropIndex(['slug']);
            $table->dropIndex(['sku']);
            $table->dropIndex(['external_id']);
            $table->dropColumn(['brand_id', 'slug', 'sku', 'external_id', 'external_url']);
        });
    }
};
