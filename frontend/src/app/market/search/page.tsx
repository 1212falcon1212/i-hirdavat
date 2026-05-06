import type { Metadata } from 'next';
import { SearchClient } from './SearchClient';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  if (!query) {
    return {
      title: 'Urun Ara | i-hirdavat',
      description: "i-hirdavat'ta binlerce urun arasinda arama yapin",
    };
  }

  return {
    title: `"${query}" Arama Sonuclari | i-hirdavat`,
    description: `"${query}" icin arama sonuclari - i-hirdavat'ta en uygun fiyatlarla bulun`,
    openGraph: {
      title: `"${query}" Arama Sonuclari | i-hirdavat`,
      description: `"${query}" icin arama sonuclari`,
      type: 'website',
      siteName: 'i-hirdavat',
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function SearchPage() {
  return <SearchClient />;
}
