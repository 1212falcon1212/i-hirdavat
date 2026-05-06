import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import { BrandClient } from './BrandClient';

interface BrandData {
  status: string;
  data: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
  };
}

function formatSlugToName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await serverFetch<BrandData>(`/brands/${slug}`, { revalidate: 300 });
  const brand = data?.data;

  const brandName = brand?.name || formatSlugToName(slug);
  const description =
    brand?.description || `${brandName} markali urunleri i-hirdavat'ta kesfedin`;
  const logoUrl = brand?.logo || 'https://i-hirdavat.com/images/og-default.png';

  return {
    title: `${brandName} Urunleri | i-hirdavat`,
    description,
    openGraph: {
      title: `${brandName} Urunleri | i-hirdavat`,
      description,
      images: [{ url: logoUrl, width: 400, height: 400, alt: brandName }],
      type: 'website',
      siteName: 'i-hirdavat',
      url: `https://i-hirdavat.com/market/marka/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${brandName} Urunleri | i-hirdavat`,
      description,
    },
    alternates: {
      canonical: `https://i-hirdavat.com/market/marka/${slug}`,
    },
  };
}

export default function MarketBrandPage() {
  return <BrandClient />;
}
