'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, FileText } from 'lucide-react';
import { cmsApi, type CmsPage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CmsContentPagePropsBySlug {
    slug: string;
    eyebrow?: string;
    page?: never;
}

interface CmsContentPagePropsByPage {
    slug?: never;
    eyebrow?: string;
    /**
     * Server tarafinda onceden cekilmis sayfa verisi.
     * Verildiginde client fetch tamamen atlanir, sayfa anlik render edilir.
     */
    page: CmsPage | null;
}

type CmsContentPageProps = CmsContentPagePropsBySlug | CmsContentPagePropsByPage;

const ALLOWED_TAGS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'strong', 'em', 'b', 'i', 'u',
    'a', 'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'pre', 'code',
];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'id'];

export function CmsContentPage(props: CmsContentPageProps) {
    const { eyebrow = 'Bilgi' } = props;
    const initialPage = 'page' in props ? props.page ?? null : null;
    const slug = 'slug' in props ? props.slug : undefined;

    const [page, setPage] = useState<CmsPage | null>(initialPage);
    const [loading, setLoading] = useState(slug !== undefined && initialPage === null);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Server'dan gelen page varsa client fetch yapma
        if (initialPage !== null || !slug) return;

        const loadPage = async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await cmsApi.getPage(slug);
                const body = res.data as unknown as { data?: CmsPage } | CmsPage | undefined;
                const nextPage = 'data' in (body ?? {}) ? (body as { data?: CmsPage }).data : (body as CmsPage);

                if (nextPage?.content) {
                    setPage(nextPage);
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [slug, initialPage]);

    const [sanitizedContent, setSanitizedContent] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!page?.content) {
            setSanitizedContent(null);
            return;
        }
        // dompurify v3 default export is the factory in SSR (no window),
        // so we lazy-load it on the client and tolerate either ESM shape.
        import('dompurify').then((mod) => {
            if (cancelled) return;
            const purify = (mod as unknown as { default?: { sanitize: (s: string, opts?: object) => string } }).default
                ?? (mod as unknown as { sanitize: (s: string, opts?: object) => string });
            const clean = purify.sanitize(page.content, {
                ALLOWED_TAGS,
                ALLOWED_ATTR,
                ALLOW_DATA_ATTR: false,
            });
            setSanitizedContent(clean);
        });
        return () => {
            cancelled = true;
        };
    }, [page?.content]);

    // Sayfa fetch ediliyor VEYA istemcide sanitize bitmedi → skeleton
    if (loading || (page?.content && sanitizedContent === null && !error)) {
        return (
            <div className="space-y-5">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-56 mt-8" />
                <Skeleton className="h-4 w-full" />
            </div>
        );
    }

    if (error || !page || !sanitizedContent) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <AlertCircle className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                <h1 className="mb-2 text-xl font-semibold text-gray-900">Sayfa bulunamadı</h1>
                <p className="mb-5 text-gray-500">Bu içerik henüz yayında değil veya kaldırılmış.</p>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Geri Dön
                </Button>
            </div>
        );
    }

    return (
        <article>
            <div className="mb-6 border-b border-gray-200 pb-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F0F4FA] px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
                    <FileText className="h-3.5 w-3.5" />
                    {eyebrow}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
                {page.excerpt && <p className="mt-3 text-gray-600">{page.excerpt}</p>}
            </div>

            <div
                className="prose prose-slate max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-li:text-gray-600
                    prose-a:text-[#1E3A5F] prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
        </article>
    );
}
