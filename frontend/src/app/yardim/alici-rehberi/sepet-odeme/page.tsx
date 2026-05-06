import type { Metadata } from 'next';
import { YardimCmsPage, generateYardimMetadata } from '@/components/cms/YardimCmsPage';

const SLUG = 'yardim-alici-rehberi-sepet-odeme';
const FALLBACK = {
    title: 'Sepet ve Ödeme - i-hırdavat Yardım',
    description: "i-hırdavat'ta sepet oluşturma ve ödeme işlemleri nasıl yapılır?",
};

export async function generateMetadata(): Promise<Metadata> {
    return generateYardimMetadata(SLUG, FALLBACK);
}

export default async function SepetOdemePage() {
    return (
        <YardimCmsPage
            slug={SLUG}
            eyebrow="Alıcı Rehberi"
            previous={{ title: 'Fiyat Karşılaştırma', href: '/yardim/alici-rehberi/fiyat-karsilastirma' }}
            next={{ title: 'Sipariş Takibi', href: '/yardim/alici-rehberi/siparis-takibi' }}
        />
    );
}
