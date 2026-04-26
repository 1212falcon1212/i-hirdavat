'use client';

import Link from 'next/link';

interface BrandData {
  name: string;
  bg: string;        // solid brand color
  text: 'white' | 'dark';
  tagline: string;
  slug: string;
}

// CLAUDE.md §3.9 — 6 rebranded brand cards (Industrial Pro)
// Brand colors pulled from each brand's public guidelines; text color chosen for contrast.
const brands: BrandData[] = [
  { name: 'Bosch Professional', bg: '#005691', text: 'white', tagline: 'Mavi seri matkap ve taşlamalarda yaz kampanyası', slug: 'bosch' },
  { name: 'Makita',             bg: '#00A0DC', text: 'white', tagline: 'Akülü 18V LXT serisinde bayi fırsatı',          slug: 'makita' },
  { name: 'DeWalt',             bg: '#FEBD17', text: 'dark',  tagline: 'XR FlexVolt seti kombine avantajla',             slug: 'dewalt' },
  { name: 'Stanley',            bg: '#FDD900', text: 'dark',  tagline: 'El aletleri ve ölçüm setlerinde toplu indirim',  slug: 'stanley' },
  { name: '3M',                 bg: '#FF0000', text: 'white', tagline: 'FFP2 / FFP3 maske ve eldivende kurumsal fiyat',  slug: '3m' },
  { name: 'İzeltaş',            bg: '#1E3A5F', text: 'white', tagline: 'Yerli üretim anahtar, pense ve alyan takımı',    slug: 'izeltas' },
];

export function BrandCampaigns() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
      {brands.map((brand) => {
        const textClass = brand.text === 'dark' ? 'text-neutral-900' : 'text-white';
        const mutedClass = brand.text === 'dark' ? 'text-neutral-900/80' : 'text-white/90';
        const ctaClass = brand.text === 'dark' ? 'text-neutral-900' : 'text-white';
        return (
          <Link
            key={brand.slug}
            href={`/market/marka/${brand.slug}`}
            className="relative overflow-hidden rounded-md px-4 py-5 sm:px-6 sm:py-7 hover:-translate-y-0.5 transition-transform cursor-pointer block flex flex-col group shadow-sm hover:shadow-md"
            style={{ background: brand.bg }}
          >
            <p className={`relative text-base sm:text-xl font-black tracking-tight truncate ${textClass}`}>
              {brand.name}
            </p>
            <p className={`relative text-[12px] sm:text-[13px] mt-1 line-clamp-2 ${mutedClass}`}>
              {brand.tagline}
            </p>
            <p className={`relative text-[12px] sm:text-[13px] font-bold mt-3 sm:mt-4 ${ctaClass}`}>
              Ürünleri İncele &rarr;
            </p>
          </Link>
        );
      })}
    </div>
  );
}
