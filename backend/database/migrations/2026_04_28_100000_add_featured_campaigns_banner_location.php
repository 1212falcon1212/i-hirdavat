<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE banners MODIFY COLUMN location ENUM('home_hero','home_promo','home_middle','home_brand','home_grid','home_bottom','home_showcase','home_featured_campaigns','sidebar','category_top') NOT NULL DEFAULT 'home_hero'");
        }

        Schema::table('banners', function (Blueprint $table) {
            $table->string('image_path')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE banners MODIFY COLUMN location ENUM('home_hero','home_promo','home_middle','home_brand','home_grid','home_bottom','home_showcase','sidebar','category_top') NOT NULL DEFAULT 'home_hero'");
        }

        Schema::table('banners', function (Blueprint $table) {
            $table->string('image_path')->nullable(false)->change();
        });
    }
};
