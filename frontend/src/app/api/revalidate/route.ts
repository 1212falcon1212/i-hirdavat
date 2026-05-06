import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Next.js 16 `revalidateTag` artik `(tag, profile)` imzasini beklemekte.
 * Kullandigimiz default cache profili `default` (varsayilan TTL).
 */
const REVALIDATE_PROFILE = 'default';

/**
 * POST /api/revalidate
 *
 * Backend (Laravel `PageObserver`) bir CMS sayfasi kaydedildiginde
 * bu endpoint'e istek atar. `tag` parametresi kullanilarak ilgili
 * Next.js cache tag'i invalide edilir, sayfa bir sonraki istekte
 * taze veriyle render edilir.
 *
 * Auth: `x-revalidate-secret` header (veya `?secret=...` query)
 *       backend ile birebir ayni gizli anahtari icermelidir.
 */
export async function POST(request: Request): Promise<NextResponse> {
    const expectedSecret = process.env.REVALIDATE_SECRET;

    if (!expectedSecret) {
        return NextResponse.json(
            { ok: false, error: 'REVALIDATE_SECRET not configured' },
            { status: 500 },
        );
    }

    const url = new URL(request.url);
    const headerSecret = request.headers.get('x-revalidate-secret');
    const querySecret = url.searchParams.get('secret');
    const provided = headerSecret ?? querySecret;

    if (provided !== expectedSecret) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    let tag: string | null = url.searchParams.get('tag');

    if (!tag) {
        try {
            const body = (await request.json()) as { tag?: unknown };
            if (typeof body.tag === 'string' && body.tag.length > 0) {
                tag = body.tag;
            }
        } catch {
            // body opsiyonel — query/header ile de gelebilir
        }
    }

    if (!tag) {
        return NextResponse.json(
            { ok: false, error: 'Missing tag parameter' },
            { status: 400 },
        );
    }

    revalidateTag(tag, REVALIDATE_PROFILE);

    return NextResponse.json({ ok: true, tag, revalidated: true });
}
