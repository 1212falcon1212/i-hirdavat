'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

/**
 * `beforeinstallprompt` Chrome/Edge/Android için tetiklenir; iOS Safari'nin
 * native event'i yoktur, kendi banner'ımızı koşullu olarak gösteririz.
 */
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

const DISMISS_KEY = 'pwa-install-dismissed-at';
const COOLDOWN_DAYS = 14;

function isStandalone() {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    // iOS Safari fallback
    return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos() {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

function recentlyDismissed(): boolean {
    try {
        const ts = window.localStorage.getItem(DISMISS_KEY);
        if (!ts) return false;
        const ageMs = Date.now() - Number(ts);
        return ageMs < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosHint, setShowIosHint] = useState(false);

    useEffect(() => {
        if (isStandalone() || recentlyDismissed()) return;

        // Chrome / Edge / Android
        const onPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', onPrompt);

        // iOS Safari — native event yok, manuel ipucu (sayfa belirli süre açık kalsın)
        if (isIos()) {
            const t = window.setTimeout(() => setShowIosHint(true), 25_000);
            return () => {
                window.removeEventListener('beforeinstallprompt', onPrompt);
                window.clearTimeout(t);
            };
        }

        return () => window.removeEventListener('beforeinstallprompt', onPrompt);
    }, []);

    const dismiss = () => {
        try {
            window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
            // localStorage kapalıysa sessiz devam
        }
        setDeferredPrompt(null);
        setShowIosHint(false);
    };

    const install = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'dismissed') {
            dismiss();
        } else {
            setDeferredPrompt(null);
        }
    };

    if (deferredPrompt) {
        return (
            <div
                role="dialog"
                aria-label="Uygulamayı yükle"
                className="pointer-events-auto fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-[14px] border border-[#E6E8EE] bg-white p-3 shadow-[0_12px_32px_rgba(11,18,32,.12)] sm:bottom-5 sm:left-auto sm:right-5 sm:mx-0"
            >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#FFC72C] text-[#0A1F44]">
                    <Download className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0A1F44]">Uygulamayı yükle</p>
                    <p className="truncate text-xs text-[#5B6679]">Tek dokunuşla erişim, daha hızlı sayfa açılışı.</p>
                </div>
                <button
                    type="button"
                    onClick={install}
                    className="shrink-0 rounded-md bg-[#0A1F44] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#142B5C]"
                >
                    Yükle
                </button>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Kapat"
                    className="shrink-0 rounded-md p-1.5 text-[#7E8898] transition-colors hover:bg-[#F6F7FA]"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    if (showIosHint) {
        return (
            <div
                role="dialog"
                aria-label="Ana ekrana ekle"
                className="pointer-events-auto fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-[14px] border border-[#E6E8EE] bg-white p-3 shadow-[0_12px_32px_rgba(11,18,32,.12)] sm:bottom-5 sm:left-auto sm:right-5 sm:mx-0"
            >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#FFC72C] text-[#0A1F44]">
                    <Download className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0A1F44]">Ana ekrana ekle</p>
                    <p className="mt-0.5 text-xs leading-snug text-[#5B6679]">
                        Safari&apos;de paylaş simgesine dokunun, ardından
                        <strong className="font-semibold"> &ldquo;Ana Ekrana Ekle&rdquo;</strong> ile yükleyin.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Kapat"
                    className="shrink-0 rounded-md p-1.5 text-[#7E8898] transition-colors hover:bg-[#F6F7FA]"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return null;
}
