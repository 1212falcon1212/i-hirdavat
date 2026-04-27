import { CmsContentPage } from '@/components/cms/CmsContentPage';

export default async function DynamicBuyerGuidePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return <CmsContentPage slug={slug} eyebrow="Alıcı Rehberi" />;
}
