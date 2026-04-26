<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * GLN sistemini platformdan tamamen kaldır:
 *  - users.gln_code kolonu drop
 *  - gln_whitelist tablosu drop
 *
 * i-hirdavat'ın B2B hırdavat iş modelinde GLN (Global Location Number) ihtiyaç değildir;
 * bunun yerine VKN (tax_number, 10 hane) ve MERSİS (mersis_no, 16 hane) kullanılır.
 * Bu alanlar zaten User tablosunda mevcut.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1) users tablosundan gln_code kolonunu kaldır
        if (Schema::hasColumn('users', 'gln_code')) {
            Schema::table('users', function (Blueprint $table) {
                // unique index varsa önce düşür
                try {
                    $table->dropUnique(['gln_code']);
                } catch (\Throwable $e) {
                    // index zaten yoksa sessizce geç
                }
                $table->dropColumn('gln_code');
            });
        }

        // 2) gln_whitelist tablosunu tamamen drop et
        Schema::dropIfExists('gln_whitelist');
    }

    public function down(): void
    {
        // gln_code geri ekle (nullable — geri dönüş senaryosunda eski verilere kullanıcı manuel girer)
        if (!Schema::hasColumn('users', 'gln_code')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('gln_code', 13)->nullable()->unique()->after('password');
            });
        }

        // gln_whitelist tablosunu minimum yapıyla geri yarat
        if (!Schema::hasTable('gln_whitelist')) {
            Schema::create('gln_whitelist', function (Blueprint $table) {
                $table->id();
                $table->string('gln_code', 13)->unique();
                $table->string('pharmacy_name');
                $table->string('city')->nullable();
                $table->string('district')->nullable();
                $table->string('address')->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_used')->default(false);
                $table->unsignedBigInteger('used_by_user_id')->nullable();
                $table->timestamp('used_at')->nullable();
                $table->timestamps();
            });
        }
    }
};
