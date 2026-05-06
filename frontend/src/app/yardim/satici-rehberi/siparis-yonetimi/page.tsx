import type { Metadata } from 'next';
import { YardimCmsPage, generateYardimMetadata } from '@/components/cms/YardimCmsPage';

const SLUG = 'yardim-satici-rehberi-siparis-yonetimi';
const FALLBACK = {
    title: 'Sipariş Yönetimi ve Kargo - i-hırdavat Yardım',
    description: "i-hırdavat'ta satıcı olarak siparişleri nasıl yönetir ve kargoya verirsiniz?",
};

export async function generateMetadata(): Promise<Metadata> {
    return generateYardimMetadata(SLUG, FALLBACK);
}

export default async function SiparisYonetimiPage() {
    return (
        <YardimCmsPage
            slug={SLUG}
            eyebrow="Satıcı Rehberi"
            previous={{ title: 'Fiyat ve Stok', href: '/yardim/satici-rehberi/fiyat-stok' }}
            next={{ title: 'Hakedişler', href: '/yardim/satici-rehberi/hakedis' }}
        />
    );
}
