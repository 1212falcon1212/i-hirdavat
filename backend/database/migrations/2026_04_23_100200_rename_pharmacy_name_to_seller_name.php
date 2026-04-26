<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * users.pharmacy_name kolonunu seller_name olarak yeniden adlandırır.
 * Backend kodunda tüm kullanım noktaları bu migration ile aynı anda güncellenmelidir.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'pharmacy_name') && !Schema::hasColumn('users', 'seller_name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('pharmacy_name', 'seller_name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'seller_name') && !Schema::hasColumn('users', 'pharmacy_name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('seller_name', 'pharmacy_name');
            });
        }
    }
};
