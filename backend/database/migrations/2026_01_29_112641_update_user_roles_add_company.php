<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds 'company' role and renames 'pharmacist' to 'pharmacy'
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        // 1. Change enum to varchar for flexibility (MySQL only)
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role VARCHAR(50) NOT NULL DEFAULT 'pharmacy'");
        }
        // SQLite doesn't need this - the column is already a string type

        // 2. Update existing 'pharmacist' users to 'pharmacy'
        DB::table('users')
            ->where('role', 'pharmacist')
            ->update(['role' => 'pharmacy']);

        // 3. Make gln_code nullable for company users (skip for SQLite as it doesn't support column modification well)
        if ($driver === 'mysql') {
            Schema::table('users', function (Blueprint $table) {
                $table->string('gln_code', 13)->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        // 1. Update 'pharmacy' back to 'pharmacist'
        DB::table('users')
            ->where('role', 'pharmacy')
            ->update(['role' => 'pharmacist']);

        // 2. Delete company users (or handle appropriately)
        DB::table('users')
            ->where('role', 'company')
            ->delete();

        // 3. Convert back to enum (MySQL only)
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('super-admin', 'pharmacist') NOT NULL DEFAULT 'pharmacist'");
        }
    }
};
