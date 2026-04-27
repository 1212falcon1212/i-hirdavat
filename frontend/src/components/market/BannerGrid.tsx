'use client';

import Image from 'next/image';
import Link from 'next/link';

// CLAUDE.md §3.8 + §3.10 — 4 kategori banner
const banners = [
    {
        title: 'El Aletleri',
        subtitle: 'Anahtar, tornavida, pense, çekiç',
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=400&fit=crop',
        href: '/market/category/el-aletleri',
    },
    {
        title: 'Elektrikli Aletler',
        subtitle: 'Matkap, taşlama, vidalama, testere',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=400&fit=crop',
        href: '/market/category/elektrikli-aletler',
    },
    {
        title: 'İş Güvenliği',
        subtitle: 'Baret, eldiven, maske, iş ayakkabısı',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop',
        href: '/market/category/is-guvenligi',
    },
    {
        title: 'Bağlantı Elemanları',
        subtitle: 'Civata, somun, vida, pul, dübel',
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=400&fit=crop',
        href: '/market/category/baglanti-elemanlari',
    },
];

export function BannerGrid() {
    return (
        <section className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner, index) => (
                    <Link
                        key={index}
                        href={banner.href}
                        className="group relative overflow-hidden rounded-md h-40 md:h-48 shadow-sm hover:shadow-md transition-shadow duration-150"
                    >
                        <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-neutral-900/65 group-hover:bg-neutral-900/55 transition-colors" />
                        <div className="relative h-full flex items-end p-5 md:p-6">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                                    {banner.title}
                                </h3>
                                <p className="text-white/85 text-sm">
                                    {banner.subtitle}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
