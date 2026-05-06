<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * `wallet_transactions.type` enum'una 'release' degerini ekler.
 *
 * `WalletService::releasePendingBalance()` `WalletTransaction::TYPE_RELEASE = 'release'`
 * yazıyor ama mevcut enum bu degere izin vermiyordu — pending → available
 * serbest birakma transaction kaydi DB'ye duşemiyor, "Data truncated for type"
 * hatasi veriyordu. Bu migration enum'u modeldeki sabitlerle hizalar.
 */
return new class extends Migration
{
    public function up(): void
    {
        // SQLite enum desteklemiyor; sadece MySQL/MariaDB icin uygula.
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement(
            'ALTER TABLE wallet_transactions MODIFY COLUMN `type` '
            ."ENUM('sale','commission','shipping','vat','withholding','release','withdrawal','refund','adjustment') NOT NULL"
        );
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        // 'release' degerini drop edebilmek icin once o degeri kullanan satirlari
        // 'adjustment'a tasi (baska bir 'release' rolu yok).
        DB::table('wallet_transactions')->where('type', 'release')->update(['type' => 'adjustment']);

        DB::statement(
            'ALTER TABLE wallet_transactions MODIFY COLUMN `type` '
            ."ENUM('sale','commission','shipping','vat','withholding','withdrawal','refund','adjustment') NOT NULL"
        );
    }
};
