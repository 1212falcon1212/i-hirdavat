import type { Metadata } from 'next';
import { YardimCmsPage, generateYardimMetadata } from '@/components/cms/YardimCmsPage';

const SLUG = 'yardim-satici-rehberi-urun-ekleme';
const FALLBACK = {
    title: 'Ürün Ekleme - i-hırdavat Yardım',
    description: "i-hırdavat'ta nasıl ürün eklenir ve teklif oluşturulur?",
};

export async function generateMetadata(): Promise<Metadata> {
    return generateYardimMetadata(SLUG, FALLBACK);
}

export default async function UrunEklemePage() {
    return (
        <YardimCmsPage
            slug={SLUG}
            eyebrow="Satıcı Rehberi"
            next={{ title: 'Fiyat ve Stok Güncelleme', href: '/yardim/satici-rehberi/fiyat-stok' }}
        />
    );
}
