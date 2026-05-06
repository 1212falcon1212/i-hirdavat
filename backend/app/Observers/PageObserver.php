<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Page;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PageObserver
{
    /**
     * Backend cache'i temizler ve Next.js ISR tag'ini gecersiz kilar
     */
    private function bustCaches(Page $page, ?string $previousSlug = null): void
    {
        $slugs = array_unique(array_filter([
            $page->slug,
            $previousSlug,
        ]));

        foreach ($slugs as $slug) {
            // Backend Laravel cache (CmsController kullanir)
            Cache::forget("cms.page.{$slug}");
            Cache::forget("legal.page.{$slug}");

            $this->revalidateFrontendTag("page:{$slug}");
        }
    }

    /**
     * Next.js revalidate endpoint'ini cagirir
     */
    private function revalidateFrontendTag(string $tag): void
    {
        $frontendUrl = config('services.frontend.url');
        $secret = config('services.frontend.revalidate_secret');

        if (empty($frontendUrl) || empty($secret)) {
            // Yapilandirma yoksa sessiz gec — local development'ta normal
            return;
        }

        try {
            $response = Http::timeout(5)
                ->acceptJson()
                ->withHeaders(['x-revalidate-secret' => $secret])
                ->post(rtrim($frontendUrl, '/').'/api/revalidate', [
                    'tag' => $tag,
                ]);

            if (! $response->successful()) {
                Log::warning('Frontend revalidate failed', [
                    'tag' => $tag,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Frontend revalidate exception', [
                'tag' => $tag,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function saved(Page $page): void
    {
        // saved hem create hem update icin tetiklenir
        $previousSlug = $page->wasChanged('slug') ? (string) $page->getOriginal('slug') : null;
        $this->bustCaches($page, $previousSlug);
    }

    public function deleted(Page $page): void
    {
        $this->bustCaches($page);
    }
}
