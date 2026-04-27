'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BookOpen,
    ShoppingCart,
    Store,
    HelpCircle,
    ChevronRight,
    Home,
    ArrowLeft,
    Wrench,
    Search,
} from 'lucide-react';

const navigation = [
    {
        title: 'Başlarken',
        icon: BookOpen,
        items: [
            { title: 'Bayi Kaydı ve Doğrulama', href: '/yardim/baslarken' },
        ],
    },
    {
        title: 'Satıcı Rehberi',
        icon: Store,
        items: [
            { title: 'Ürün Ekleme ve Teklif Oluşturma', href: '/yardim/satici-rehberi/urun-ekleme' },
            { title: 'Fiyat ve Stok Güncelleme', href: '/yardim/satici-rehberi/fiyat-stok' },
            { title: 'Sipariş Yönetimi ve Kargo', href: '/yardim/satici-rehberi/siparis-yonetimi' },
            { title: 'Ödeme Talebi ve Hakedişler', href: '/yardim/satici-rehberi/hakedis' },
        ],
    },
    {
        title: 'Alıcı Rehberi',
        icon: ShoppingCart,
        items: [
            { title: 'En Uygun Fiyatı Bulma', href: '/yardim/alici-rehberi/fiyat-karsilastirma' },
            { title: 'Sepet ve Ödeme Adımları', href: '/yardim/alici-rehberi/sepet-odeme' },
            { title: 'Sipariş Takibi', href: '/yardim/alici-rehberi/siparis-takibi' },
            { title: 'Hızlı Sipariş', href: '/yardim/alici-rehberi/hizli-siparis' },
            { title: 'Toplu Alım İskontosu', href: '/yardim/alici-rehberi/toplu-alim' },
        ],
    },
];

export default function YardimLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const currentTitle = navigation
        .flatMap((s) => s.items)
        .find((i) => i.href === pathname)?.title;

    return (
        <div className="min-h-screen bg-[#F4F5F7]">
            <header className="sticky top-0 z-40 border-b border-[#0F1F35]/20 bg-[#0F1F35] text-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-[72px] items-center justify-between gap-5 py-3">
                        <div className="flex min-w-0 items-center gap-4">
                            <Link href="/market" className="flex shrink-0 items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-500 text-primary-900">
                                    <Wrench className="h-5 w-5" />
                                </div>
                                <div className="leading-none">
                                    <span className="block text-xl font-black tracking-tight">i-hırdavat</span>
                                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-[2.8px] text-accent-500">
                                        B2B Hırdavat
                                    </span>
                                </div>
                            </Link>
                            <div className="hidden h-8 w-px bg-white/15 sm:block" />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <HelpCircle className="h-4 w-4 text-accent-500" />
                                    Yardım Merkezi
                                </div>
                                <p className="mt-1 hidden text-xs text-white/55 sm:block">
                                    Alıcı ve satıcı iş akışları için operasyon rehberi
                                </p>
                            </div>
                        </div>
                        <div className="hidden items-center gap-2 md:flex">
                            <Link
                                href="/market"
                                className="rounded-sm px-3 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                Pazaryeri
                            </Link>
                            <Link
                                href="/market/hesabim"
                                className="rounded-sm bg-accent-500 px-4 py-2 text-sm font-bold text-primary-900 transition-colors hover:bg-accent-400"
                            >
                                Hesabım
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <section className="border-b border-[#D9E2EF] bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <nav className="mb-3 flex items-center gap-2 text-sm text-neutral-500">
                                <Link href="/market" className="hover:text-[#1E3A5F]">
                                    Pazaryeri
                                </Link>
                                <ChevronRight className="h-4 w-4" />
                                <Link href="/yardim" className="hover:text-[#1E3A5F]">
                                    Yardım Merkezi
                                </Link>
                                {pathname !== '/yardim' && (
                                    <>
                                        <ChevronRight className="h-4 w-4" />
                                        <span className="font-medium text-neutral-900">{currentTitle || 'Sayfa'}</span>
                                    </>
                                )}
                            </nav>
                            <h1 className="text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl">
                                {pathname === '/yardim' ? 'Yardım Merkezi' : currentTitle || 'Yardım Konusu'}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                                Sipariş, teklif, stok, ödeme ve satıcı operasyonları için güncel rehberler.
                            </p>
                        </div>
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="search"
                                placeholder="Yardım konularında ara..."
                                className="h-11 w-full rounded-sm border border-neutral-200 bg-[#F8FAFC] pl-10 pr-3 text-sm outline-none transition focus:border-[#1E3A5F] focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex gap-7">
                    <aside className="hidden w-72 flex-shrink-0 lg:block">
                        <nav className="sticky top-28 rounded-md border border-neutral-200 bg-white p-3 shadow-sm">
                            <Link
                                href="/yardim"
                                className={`flex items-center gap-2 rounded-sm px-3 py-2.5 text-sm font-bold transition-colors ${pathname === '/yardim'
                                        ? 'bg-[#1E3A5F] text-white'
                                        : 'text-neutral-700 hover:bg-[#F0F4FA] hover:text-[#1E3A5F]'
                                    }`}
                            >
                                <Home className="h-4 w-4" />
                                Ana Sayfa
                            </Link>

                            {navigation.map((section) => (
                                <div key={section.title} className="mt-5">
                                    <h3 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-neutral-400">
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </h3>
                                    <ul className="space-y-1">
                                        {section.items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={`block rounded-sm px-3 py-2 text-sm transition-colors ${pathname === item.href
                                                            ? 'bg-[#F0F4FA] font-semibold text-[#1E3A5F]'
                                                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                                                        }`}
                                                >
                                                    {item.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    <main className="min-w-0 flex-1">
                        <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
                            {children}
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/yardim"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-[#1E3A5F]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Tüm Yardım Konuları
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
