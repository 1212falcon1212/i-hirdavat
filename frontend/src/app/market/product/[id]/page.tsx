import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductData {
  product: {
    id: number;
    name: string;
    brand?: string;
    description?: string;
    image_url?: string;
    category?: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await serverFetch<ProductData>(`/products/${id}`, { revalidate: 60 });
  const product = data?.product;

  if (!product) {
    return {
      title: 'Urun Bulunamadi | i-hirdavat',
      description: 'Aradiginiz urun bulunamadi.',
    };
  }

  const title = `${product.name} | i-hirdavat`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.brand ? product.brand + ' ' : ''}${product.name} - En uygun fiyatlarla i-hirdavat'ta`;
  const imageUrl = product.image_url || 'https://i-hirdavat.com/images/og-default.png';

  return {
    title,
    description,
    openGraph: {
      title: product.name,
      description,
      images: [{ url: imageUrl, width: 800, height: 600, alt: product.name }],
      type: 'website',
      siteName: 'i-hirdavat',
      url: `https://i-hirdavat.com/market/product/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://i-hirdavat.com/market/product/${id}`,
    },
  };
}

export default function MarketProductDetailPage() {
  return <ProductDetailClient />;
}
