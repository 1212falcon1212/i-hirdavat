import type { Metadata } from 'next';
import { YardimCmsPage, generateYardimMetadata } from '@/components/cms/YardimCmsPage';

const SLUG = 'yardim-alici-rehberi-fiyat-karsilastirma';
const FALLBACK = {
    title: 'En Uygun Fiyatı Bulma - i-hırdavat Yardım',
    description: "i-hırdavat'ta en uygun fiyatı nasıl bulursunuz? Fiyat karşılaştırma rehberi.",
};

export async function generateMetadata(): Promise<Metadata> {
    return generateYardimMetadata(SLUG, FALLBACK);
}

export default async function FiyatKarsilastirmaPage() {
    return (
        <YardimCmsPage
            slug={SLUG}
            eyebrow="Alıcı Rehberi"
            next={{ title: 'Sepet ve Ödeme', href: '/yardim/alici-rehberi/sepet-odeme' }}
        />
    );
}
