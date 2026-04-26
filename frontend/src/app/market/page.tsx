import type { Metadata } from 'next';
import { MarketHomeClient } from './MarketHomeClient';

export const metadata: Metadata = {
  title: 'Pazaryeri | i-hırdavat - B2B Hırdavat Tedarik Platformu',
  description:
    "Hırdavat ihtiyaçlarınızı bayi fiyatlarıyla karşılayın. 125.000+ ürün, güvenilir tedarikçiler, 14:00'a kadar aynı gün kargo.",
  openGraph: {
    title: 'i-hırdavat - B2B Hırdavat Tedarik Platformu',
    description:
      "Hırdavat ihtiyaçlarınızı bayi fiyatlarıyla karşılayın. Binlerce ürün, güvenilir tedarikçiler.",
    type: 'website',
    siteName: 'i-hırdavat',
    url: 'https://i-hirdavat.com/market',
    images: [
      {
        url: 'https://i-hirdavat.com/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'i-hırdavat B2B Hırdavat Pazaryeri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'i-hırdavat - B2B Hırdavat Tedarik Platformu',
    description:
      "Bayi fiyatlarıyla aynı gün kargo hırdavat tedariki.",
    images: ['https://i-hirdavat.com/images/og-default.png'],
  },
  alternates: {
    canonical: 'https://i-hirdavat.com/market',
  },
};

export default function MarketHomePage() {
  return <MarketHomeClient />;
}
