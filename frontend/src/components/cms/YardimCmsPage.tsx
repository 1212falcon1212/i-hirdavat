import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CmsContentPage } from '@/components/cms/CmsContentPage';
import { getCmsPage } from '@/lib/cms-server';
import type { CmsPage } from '@/lib/api';

interface YardimNavLink {
    title: string;
    href: string;
}

interface YardimCmsPageProps {
    /** CMS slug — `yardim-...` formatinda */
    slug: string;
    /** Sayfa basliginda gosterilecek bolum etiketi (Alici Rehberi, Satici Rehberi vs.) */
    eyebrow: string;
    /** Onceki yardim konusu — ust ve alt navigasyonda gozukur */
    previous?: YardimNavLink;
    /** Sonraki yardim konusu */
    next?: YardimNavLink;
}

/**
 * Yardim merkezi alt sayfalari icin ortak server bileseni.
 *
 * Backend `GET /api/cms/pages/{slug}` endpoint'inden veri ceker, server-side
 * `next: { tags: ['page:<slug>'] }` cache'ini kullanir. Filament'ten sayfa
 * kaydedilince Laravel `PageObserver`, `/api/revalidate` cagrisiyla bu
 * tag'i invalide eder ve icerik anlik yansir.
 */
export async function YardimCmsPage({ slug, eyebrow, previous, next }: YardimCmsPageProps) {
    const page: CmsPage | null = await getCmsPage(slug);

    return (
        <div className="space-y-8">
            <CmsContentPage page={page} eyebrow={eyebrow} />

            {(previous || next) && (
                <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    {previous ? (
                        <Link
                            href={previous.href}
                            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-[#1E3A5F]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Önceki: {previous.title}
                        </Link>
                    ) : (
                        <span />
                    )}
                    {next && (
                        <Link
                            href={next.href}
                            className="inline-flex items-center gap-2 rounded-sm bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
                        >
                            Sonraki: {next.title}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

export async function generateYardimMetadata(slug: string, fallback: { title: string; description: string }) {
    const page = await getCmsPage(slug);
    return {
        title: page?.meta_title ?? page?.title ?? fallback.title,
        description: page?.meta_description ?? page?.excerpt ?? fallback.description,
    };
}
