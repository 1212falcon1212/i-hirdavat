import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import { CategoryClient } from './CategoryClient';

interface CategoryData {
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
  };
  breadcrumb?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

function formatSlugToName(slug: string): string {
  const words = slug.replace(/-/g, ' ').split(' ');
  return words
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join('/');
  const lastSlug = slug[slug.length - 1];

  const data = await serverFetch<CategoryData>(`/categories/slug/${fullSlug}`, {
    revalidate: 300,
  });

  const categoryName = data?.category?.name || formatSlugToName(lastSlug || '');
  const description =
    data?.category?.description ||
    `${categoryName} urunlerini en uygun fiyatlarla i-hirdavat'ta bulun`;

  return {
    title: `${categoryName} | i-hirdavat`,
    description,
    openGraph: {
      title: `${categoryName} | i-hirdavat`,
      description,
      type: 'website',
      siteName: 'i-hirdavat',
      url: `https://i-hirdavat.com/market/category/${fullSlug}`,
    },
    twitter: {
      card: 'summary',
      title: `${categoryName} | i-hirdavat`,
      description,
    },
    alternates: {
      canonical: `https://i-hirdavat.com/market/category/${fullSlug}`,
    },
  };
}

export default function MarketCategoryPage() {
  return <CategoryClient />;
}
