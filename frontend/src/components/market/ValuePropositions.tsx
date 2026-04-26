'use client';

import { Tag, Zap, ShieldCheck } from 'lucide-react';

/**
 * CLAUDE.md §3.2 — Trust Strip (3 kart).
 * Image-matched: beyaz kart + sol sarı dikey bant + outline ikon + başlık + alt metin.
 */
const propositions = [
    {
        icon: Tag,
        title: 'Bayi Fiyatları',
        subtitle: '%15-25 rakip altı',
    },
    {
        icon: Zap,
        title: 'Aynı Gün Kargo',
        subtitle: "14:00'a kadar",
    },
    {
        icon: ShieldCheck,
        title: 'Orijinal Ürün',
        subtitle: 'Resmi distribütör',
    },
] as const;

export function ValuePropositions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {propositions.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.title}
                        className="relative bg-white rounded-sm border border-neutral-200 py-4 pr-4 pl-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                        {/* Left yellow stripe */}
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />

                        <Icon className="w-6 h-6 text-primary-700 shrink-0" strokeWidth={2} />

                        <div className="min-w-0">
                            <p className="text-base font-bold text-neutral-900 leading-tight">
                                {item.title}
                            </p>
                            <p className="text-[13px] text-neutral-600 mt-0.5">
                                {item.subtitle}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
