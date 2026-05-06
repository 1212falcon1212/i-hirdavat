<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-seller shipping settings.
 *
 * Each seller (user with role=seller) configures their own shipping rules from
 * the seller dashboard ("Hesabım → Ayarlar → Kargo Ayarları"). These values
 * override the platform-wide fallback defined in commission settings.
 *
 *  - shipping_flat_fee:      bayinin sipariş başına aldığı sabit kargo (₺)
 *  - free_shipping_threshold: bu tutarın üstündeki sepet alt toplamı için kargo bedava (₺); null = devre dışı
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'shipping_flat_fee')) {
                $table->decimal('shipping_flat_fee', 10, 2)->nullable()->after('sector_type');
            }
            if (! Schema::hasColumn('users', 'free_shipping_threshold')) {
                $table->decimal('free_shipping_threshold', 12, 2)->nullable()->after('shipping_flat_fee');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $drop = [];
            foreach (['shipping_flat_fee', 'free_shipping_threshold'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $drop[] = $col;
                }
            }
            if (! empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};
