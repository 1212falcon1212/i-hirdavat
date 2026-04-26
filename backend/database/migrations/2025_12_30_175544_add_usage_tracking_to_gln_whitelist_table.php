<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('gln_whitelist', function (Blueprint $table) {
            $table->boolean('is_used')->default(false)->after('is_active');
            $table->foreignId('used_by_user_id')->nullable()->after('is_used')->constrained('users')->nullOnDelete();
            $table->timestamp('used_at')->nullable()->after('used_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gln_whitelist', function (Blueprint $table) {
            $table->dropForeign(['used_by_user_id']);
            $table->dropColumn(['is_used', 'used_by_user_id', 'used_at']);
        });
    }
};
