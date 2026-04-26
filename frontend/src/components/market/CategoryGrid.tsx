'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

interface CategoryData {
  name: string;
  subtitle: string;
  gradient: string;
  icon: string;
  slug: string;
}

// CLAUDE.md §3.10 — 4 kategori banner (Industrial Pro gradients)
const categories: CategoryData[] = [
  {
    name: 'El Aletleri',
    subtitle: 'Anahtar, tornavida, pense, çekiç',
    gradient: 'from-primary-700 to-primary-500',
    icon: 'mdi:wrench',
    slug: 'el-aletleri',
  },
  {
    name: 'Elektrikli Aletler',
    subtitle: 'Matkap, taşlama, vidalama, kompresör',
    gradient: 'from-neutral-900 to-neutral-800',
    icon: 'mdi:drill',
    slug: 'elektrikli-aletler',
  },
  {
    name: 'İş Güvenliği',
    subtitle: 'Baret, eldiven, gözlük, maske, bot',
    gradient: 'from-accent-600 to-accent-500',
    icon: 'mdi:hard-hat',
    slug: 'is-guvenligi',
  },
  {
    name: 'Bağlantı Elemanları',
    subtitle: 'Civata, somun, vida, pul, dübel',
    gradient: 'from-neutral-800 to-primary-700',
    icon: 'mdi:screw-machine-flat-top',
    slug: 'baglanti-elemanlari',
  },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
      {categories.map((cat) => {
        const isLight = cat.slug === 'is-guvenligi';
        const textColor = isLight ? 'text-neutral-900' : 'text-white';
        const subColor = isLight ? 'text-neutral-900/80' : 'text-white/85';
        return (
          <Link
            key={cat.slug}
            href={`/market/category/${cat.slug}`}
            className={`rounded-md h-[140px] sm:h-[170px] overflow-hidden relative cursor-pointer group bg-gradient-to-br ${cat.gradient} hover:-translate-y-0.5 transition-transform block shadow-sm hover:shadow-md`}
          >
            <Icon
              icon={cat.icon}
              className={`absolute top-4 right-4 w-12 h-12 sm:w-14 sm:h-14 opacity-25 ${textColor}`}
            />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 z-10">
              <p className={`text-lg sm:text-xl font-black leading-tight ${textColor}`}>
                {cat.name}
              </p>
              <p className={`text-[11px] sm:text-xs mt-0.5 line-clamp-2 ${subColor}`}>
                {cat.subtitle}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
