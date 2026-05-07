'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, ArrowRight, Home } from 'lucide-react';

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOnline) {
            window.location.reload();
        }
    }, [isOnline]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0A1F44] text-white">
            {/* Decorative grid pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="offline-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#offline-grid)" />
                </svg>
            </div>

            {/* Soft glow */}
            <div className="pointer-events-none absolute -top-40 -right-32 h-[420px] w-[420px] rounded-full bg-[#FFC72C]/10 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#1F4ED8]/10 blur-3xl" aria-hidden="true" />

            <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
                <Link href="/" className="mb-10 inline-flex items-center gap-2.5 transition-opacity hover:opacity-80">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-[#FFC72C] text-lg font-black text-[#0A1F44] shadow-[inset_0_-2px_0_rgba(0,0,0,.08)]">
                        İ
                    </span>
                    <span className="leading-none">
                        <span className="block text-lg font-extrabold tracking-[-0.02em]">i-hırdavat</span>
                        <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[.18em] text-white/60">
                            B2B Pazaryeri
                        </span>
                    </span>
                </Link>

                <div className="mb-7 grid h-20 w-20 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] backdrop-blur-sm">
                    <WifiOff className="h-10 w-10 text-[#FFC72C]" />
                </div>

                <h1 className="mb-3 text-2xl font-black sm:text-3xl">İnternet bağlantısı yok</h1>

                <p className="mb-8 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                    Bağlantınız kesilmiş görünüyor. Ağ geri geldiğinde sayfa otomatik yenilenir;
                    o ana kadar daha önce ziyaret ettiğin sayfalara çevrimdışı erişebilirsin.
                </p>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#FFC72C] px-5 py-3 text-sm font-bold text-[#0A1F44] transition-colors hover:bg-[#E5B026]"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Yeniden Dene
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                        <Home className="h-4 w-4" />
                        Anasayfaya Dön
                    </Link>
                </div>

                {/* Quick offline-friendly links */}
                <div className="mt-10 w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left backdrop-blur-sm">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/50">Çevrimdışı erişebilecekleriniz</p>
                    <ul className="space-y-1.5 text-sm">
                        {[
                            { href: '/market', label: 'Pazaryeri' },
                            { href: '/market/hesabim', label: 'Hesabım' },
                            { href: '/yardim', label: 'Yardım Merkezi' },
                        ].map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                                >
                                    <span>{link.label}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-white/40" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="mt-8 text-xs text-white/40">
                    Bağlantı durumu:{' '}
                    <span className={isOnline ? 'font-semibold text-emerald-400' : 'font-semibold text-[#FFC72C]'}>
                        {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </span>
                </p>
            </div>
        </div>
    );
}
