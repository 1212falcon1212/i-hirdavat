import { CmsContentPage } from '@/components/cms/CmsContentPage';

export default async function MarketCmsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-7 lg:py-14">
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-9">
                <CmsContentPage slug={slug} />
            </div>
        </div>
    );
}
