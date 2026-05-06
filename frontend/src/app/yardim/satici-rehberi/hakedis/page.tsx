import type { Metadata } from 'next';
import { YardimCmsPage, generateYardimMetadata } from '@/components/cms/YardimCmsPage';

const SLUG = 'yardim-satici-rehberi-hakedis';
const FALLBACK = {
    title: 'Ödeme Talebi ve Hakedişler - i-hırdavat Yardım',
    description: "i-hırdavat'ta satış hakedişlerinizi nasıl çekersiniz?",
};

export async function generateMetadata(): Promise<Metadata> {
    return generateYardimMetadata(SLUG, FALLBACK);
}

export default async function HakedisPage() {
    return (
        <YardimCmsPage
            slug={SLUG}
            eyebrow="Satıcı Rehberi"
            previous={{ title: 'Sipariş Yönetimi', href: '/yardim/satici-rehberi/siparis-yonetimi' }}
        />
    );
}
