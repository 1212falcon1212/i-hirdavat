<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE banners MODIFY COLUMN location ENUM('home_hero','home_promo','home_middle','home_brand','home_grid','home_bottom','home_showcase','home_featured_campaigns','home_video_stories','sidebar','category_top') NOT NULL DEFAULT 'home_hero'");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE banners MODIFY COLUMN location ENUM('home_hero','home_promo','home_middle','home_brand','home_grid','home_bottom','home_showcase','home_featured_campaigns','sidebar','category_top') NOT NULL DEFAULT 'home_hero'");
    }
};
