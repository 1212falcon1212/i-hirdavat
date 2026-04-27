"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { WhatsAppBubble } from "@/components/market/WhatsAppBubble";
import { CompareDrawer } from "@/components/market/CompareDrawer";
import { MarketChrome } from "@/components/chrome/MarketChrome";

import { useAuth } from "@/contexts/AuthContext";

export default function MarketLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    if (isLoading) {
        return (
            <div
                className="min-h-screen dark:bg-slate-900 transition-colors duration-300 relative"
                style={{ backgroundColor: '#F4F5F7' }}
            >
                {/* Skeleton header to prevent CLS */}
                <header className="sticky top-0 z-50 shadow-sm">
                    <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 h-16 sm:h-20" />
                    <nav className="bg-black hidden lg:block h-11" />
                    <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 h-[52px] sm:h-[60px]" />
                </header>
                {/* Skeleton content area */}
                <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="w-full h-[400px] bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                </main>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <MarketChrome>
            {children}
            <WhatsAppBubble />
            <CompareDrawer />
        </MarketChrome>
    );
}
