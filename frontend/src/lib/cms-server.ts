/**
 * Server-side CMS page fetcher.
 *
 * Backend `GET /api/cms/pages/{slug}` endpoint'inden sayfa verisini
 * cache tag'i ile cekiyoruz. Filament admin panelinde sayfa kaydedildiginde
 * Laravel `PageObserver`, frontend'in `/api/revalidate` route'una istek
 * atarak `page:<slug>` tag'ini invalide eder; boylece bir sonraki istekte
 * yeni icerik anlik olarak yansir.
 */

import type { CmsPage } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

interface CmsPageResponse {
    status?: string;
    data?: CmsPage;
}

/**
 * Verilen slug icin CMS sayfasini getirir.
 * Sayfa yoksa veya yayinda degilse `null` doner.
 */
export async function getCmsPage(slug: string): Promise<CmsPage | null> {
    if (!slug) return null;

    try {
        const response = await fetch(`${API_URL}/cms/pages/${encodeURIComponent(slug)}`, {
            headers: {
                Accept: 'application/json',
            },
            // Tag bazli ISR — `revalidateTag('page:<slug>')` ile invalide edilir
            next: { tags: [`page:${slug}`] },
        });

        if (!response.ok) {
            return null;
        }

        const body = (await response.json()) as CmsPageResponse | CmsPage;

        // Backend `{ status, data }` zarfi ile donuyor; geriye donuk uyumluluk icin duz objeyi de kabul et
        if (body && typeof body === 'object' && 'data' in body && body.data) {
            return body.data;
        }

        if (body && typeof body === 'object' && 'content' in body) {
            return body as CmsPage;
        }

        return null;
    } catch {
        return null;
    }
}
