<?php

use App\Models\Banner;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;

return new class extends Migration
{
    public function up(): void
    {
        if (Banner::where('location', 'home_featured_campaigns')->exists()) {
            return;
        }

        $locationOrder = ['home_grid' => 0, 'home_showcase' => 1, 'home_brand' => 2];

        $legacyBanners = Banner::query()
            ->whereIn('location', ['home_grid', 'home_showcase', 'home_brand'])
            ->orderBy('sort_order')
            ->get()
            ->sortBy(fn (Banner $banner) => sprintf('%02d-%04d', $locationOrder[$banner->location] ?? 99, $banner->sort_order));

        foreach ($legacyBanners as $index => $banner) {
            $copy = $banner->replicate(['created_at', 'updated_at']);
            $copy->location = 'home_featured_campaigns';
            $copy->sort_order = $index + 1;
            $copy->save();
        }

        Cache::forget('cms.homepage');
        Cache::forget('cms.banners.home_featured_campaigns');
    }

    public function down(): void
    {
        Banner::where('location', 'home_featured_campaigns')->delete();

        Cache::forget('cms.homepage');
        Cache::forget('cms.banners.home_featured_campaigns');
    }
};
