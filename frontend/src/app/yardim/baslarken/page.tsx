import type { Metadata } from 'next';
import { YardimCmsPage, generateYardimMetadata } from '@/components/cms/YardimCmsPage';

const SLUG = 'yardim-baslarken';
const FALLBACK = {
    title: 'Bayi Kaydı ve Doğrulama — i-hırdavat Yardım',
    description: "i-hırdavat'a nasıl bayi kaydı yapılır? VKN, MERSİS ve Ticaret Sicil No ile doğrulama adımları.",
};

export async function generateMetadata(): Promise<Metadata> {
    return generateYardimMetadata(SLUG, FALLBACK);
}

export default async function BaslarkenPage() {
    return <YardimCmsPage slug={SLUG} eyebrow="Başlarken" />;
}
