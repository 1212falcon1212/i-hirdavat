<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

/**
 * Rol rename: 'pharmacy' → 'seller'.
 * company_pharmacy_links tablosu → company_seller_links.
 * pharmacy_id kolonu → seller_id.
 *
 * Role string-typed (2026_01_29 migration'ında enum'dan VARCHAR'a çevrilmiş),
 * yani sadece DB::update ile değer değiştirmemiz yeterli.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1) User.role değerlerini güncelle
        DB::table('users')->where('role', 'pharmacy')->update(['role' => 'seller']);
        DB::table('users')->where('role', 'pharmacist')->update(['role' => 'seller']);

        // 2) company_pharmacy_links → company_seller_links
        if (Schema::hasTable('company_pharmacy_links') && !Schema::hasTable('company_seller_links')) {
            Schema::rename('company_pharmacy_links', 'company_seller_links');
        }

        // 3) pharmacy_id → seller_id
        if (Schema::hasTable('company_seller_links') && Schema::hasColumn('company_seller_links', 'pharmacy_id')) {
            Schema::table('company_seller_links', function (Blueprint $table) {
                $table->renameColumn('pharmacy_id', 'seller_id');
            });
        }
    }

    public function down(): void
    {
        // Rol değerleri geri al
        DB::table('users')->where('role', 'seller')->update(['role' => 'pharmacy']);

        if (Schema::hasTable('company_seller_links') && Schema::hasColumn('company_seller_links', 'seller_id')) {
            Schema::table('company_seller_links', function (Blueprint $table) {
                $table->renameColumn('seller_id', 'pharmacy_id');
            });
        }

        if (Schema::hasTable('company_seller_links') && !Schema::hasTable('company_pharmacy_links')) {
            Schema::rename('company_seller_links', 'company_pharmacy_links');
        }
    }
};
