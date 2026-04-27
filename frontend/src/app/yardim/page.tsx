import Link from 'next/link';
import {
    BookOpen,
    Store,
    ShoppingCart,
    ArrowRight,
    CheckCircle,
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Yardım Merkezi - i-hırdavat',
    description: 'i-hırdavat kullanım kılavuzları, satıcı ve alıcı rehberleri.',
};

const quickLinks = [
    {
        title: 'Başlarken',
        description: 'Firma bilgileri ve bayi kayıt adımları',
        icon: BookOpen,
        href: '/yardim/baslarken',
    },
    {
        title: 'Satıcı Rehberi',
        description: 'Ürün listeleme, sipariş yönetimi, hakedişler',
        icon: Store,
        href: '/yardim/satici-rehberi/urun-ekleme',
    },
    {
        title: 'Alıcı Rehberi',
        description: 'Ürün arama, fiyat karşılaştırma, sipariş takibi',
        icon: ShoppingCart,
        href: '/yardim/alici-rehberi/fiyat-karsilastirma',
    },
];

const popularTopics = [
    { title: 'VKN\'mı nereden bulabilirim?', href: '/yardim/baslarken#vkn' },
    { title: 'Nasıl ürün eklerim?', href: '/yardim/satici-rehberi/urun-ekleme' },
    { title: 'Hakedişimi nasıl çekerim?', href: '/yardim/satici-rehberi/hakedis' },
    { title: 'Sipariş nasıl veririm?', href: '/yardim/alici-rehberi/sepet-odeme' },
    { title: 'Kargo takibi nasıl yapılır?', href: '/yardim/alici-rehberi/siparis-takibi' },
];

export default function YardimPage() {
    return (
        <div>
            <div className="mb-10">
                <h1 className="mb-3 text-3xl font-black tracking-tight text-neutral-950">
                    Yardım Konuları
                </h1>
                <p className="max-w-2xl text-neutral-600">
                    i-hırdavat kullanımı hakkında aradığınız tüm bilgiler burada.
                    Alıcı ve satıcı süreçleri için hazırlanmış rehberlerden seçim yapabilirsiniz.
                </p>
            </div>

            <div className="mb-12 grid gap-4 sm:grid-cols-3">
                {quickLinks.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group rounded-md border border-neutral-200 bg-[#F8FAFC] p-5 transition-colors hover:border-[#1E3A5F]/30 hover:bg-white"
                    >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm bg-[#1E3A5F] text-white transition-colors group-hover:bg-accent-500 group-hover:text-primary-900">
                            <item.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mb-2 flex items-center gap-2 font-bold text-neutral-950">
                            {item.title}
                            <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </h3>
                        <p className="text-sm leading-6 text-neutral-600">{item.description}</p>
                    </Link>
                ))}
            </div>

            <div>
                <h2 className="mb-4 text-lg font-bold text-neutral-950">
                    Sık Sorulan Sorular
                </h2>
                <div className="space-y-2">
                    {popularTopics.map((topic) => (
                        <Link
                            key={topic.href}
                            href={topic.href}
                            className="group flex items-center gap-3 rounded-sm border border-transparent p-3 transition-colors hover:border-neutral-200 hover:bg-[#F8FAFC]"
                        >
                            <CheckCircle className="h-5 w-5 text-[#1E3A5F]" />
                            <span className="text-neutral-700 transition-colors group-hover:text-[#1E3A5F]">
                                {topic.title}
                            </span>
                            <ArrowRight className="ml-auto h-4 w-4 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mt-12 rounded-md border border-[#D9E2EF] bg-[#F0F4FA] p-6">
                <h3 className="mb-2 font-bold text-neutral-950">
                    Aradığınızı bulamadınız mı?
                </h3>
                <p className="mb-4 text-sm text-neutral-600">
                    Destek ekibimiz size yardımcı olmak için hazır.
                </p>
                <a
                    href="mailto:destek@i-hirdavat.com"
                    className="inline-flex items-center gap-2 rounded-sm bg-[#1E3A5F] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0F1F35]"
                >
                    Bize Ulaşın
                    <ArrowRight className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}
