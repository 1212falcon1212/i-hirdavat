import type { Metadata } from 'next';
import { YardimCmsPage, generateYardimMetadata } from '@/components/cms/YardimCmsPage';

const SLUG = 'yardim-satici-rehberi-fiyat-stok';
const FALLBACK = {
    title: 'Fiyat ve Stok Güncelleme - i-hırdavat Yardım',
    description: "i-hırdavat'ta tekliflerinizin fiyat ve stok bilgilerini nasıl güncellersiniz?",
};

export async function generateMetadata(): Promise<Metadata> {
    return generateYardimMetadata(SLUG, FALLBACK);
}

export default async function FiyatStokPage() {
    return (
        <YardimCmsPage
            slug={SLUG}
            eyebrow="Satıcı Rehberi"
            previous={{ title: 'Ürün Ekleme', href: '/yardim/satici-rehberi/urun-ekleme' }}
            next={{ title: 'Sipariş Yönetimi', href: '/yardim/satici-rehberi/siparis-yonetimi' }}
        />
    );
}
