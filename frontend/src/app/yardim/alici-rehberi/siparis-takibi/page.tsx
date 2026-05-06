import type { Metadata } from 'next';
import { YardimCmsPage, generateYardimMetadata } from '@/components/cms/YardimCmsPage';

const SLUG = 'yardim-alici-rehberi-siparis-takibi';
const FALLBACK = {
    title: 'Sipariş Takibi - i-hırdavat Yardım',
    description: "i-hırdavat'ta siparişlerinizi nasıl takip edersiniz?",
};

export async function generateMetadata(): Promise<Metadata> {
    return generateYardimMetadata(SLUG, FALLBACK);
}

export default async function SiparisTakibiPage() {
    return (
        <YardimCmsPage
            slug={SLUG}
            eyebrow="Alıcı Rehberi"
            previous={{ title: 'Sepet ve Ödeme', href: '/yardim/alici-rehberi/sepet-odeme' }}
        />
    );
}
