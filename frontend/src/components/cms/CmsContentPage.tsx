'use client';

import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { AlertCircle, FileText } from 'lucide-react';
import { cmsApi, type CmsPage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CmsContentPageProps {
    slug: string;
    eyebrow?: string;
}

export function CmsContentPage({ slug, eyebrow = 'Bilgi' }: CmsContentPageProps) {
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!slug) return;

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
    }, [slug]);

    const sanitizedContent = useMemo(() => {
        if (!page?.content) return null;
        return DOMPurify.sanitize(page.content, {
            ALLOWED_TAGS: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'br', 'hr',
                'ul', 'ol', 'li',
                'strong', 'em', 'b', 'i', 'u',
                'a', 'span', 'div',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'blockquote', 'pre', 'code',
            ],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
            ALLOW_DATA_ATTR: false,
        });
    }, [page?.content]);

    if (loading) {
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
