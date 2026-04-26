<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hırdavat satıcı profili için yeni alanlar:
 *  - whatsapp_number: kurumsal WhatsApp iletişim hattı
 *  - website: firma web sitesi
 *  - sector_type: toptancı / üretici / ithalatçı / perakendeci
 *  - trade_registry_no: Ticaret Sicil No
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'whatsapp_number')) {
                $table->string('whatsapp_number', 20)->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'website')) {
                $table->string('website', 255)->nullable()->after('whatsapp_number');
            }
            if (!Schema::hasColumn('users', 'sector_type')) {
                $table->string('sector_type', 30)->nullable()->after('website');
            }
            if (!Schema::hasColumn('users', 'trade_registry_no')) {
                $table->string('trade_registry_no', 30)->nullable()->after('tax_office');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $drop = [];
            foreach (['whatsapp_number', 'website', 'sector_type', 'trade_registry_no'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $drop[] = $col;
                }
            }
            if (!empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};
