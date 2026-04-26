import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: "i-hırdavat | Türkiye'nin B2B Hırdavat Pazaryeri",
  description:
    "Bayi fiyatlarıyla el aletleri, elektrikli aletler, bağlantı elemanları, iş güvenliği ve daha fazlası. 14:00'a kadar verilen siparişler aynı gün kargoda. 3.500+ kayıtlı bayi.",
  keywords: [
    "hırdavat",
    "B2B hırdavat",
    "toptan hırdavat",
    "el aletleri",
    "elektrikli aletler",
    "bağlantı elemanları",
    "iş güvenliği",
    "bayi fiyatı",
    "pazaryeri",
    "civata",
    "Bosch",
    "Makita",
    "DeWalt",
  ],
  openGraph: {
    title: "i-hırdavat | B2B Hırdavat Pazaryeri",
    description:
      "Türkiye'nin B2B hırdavat pazaryeri. Bayi fiyatlarıyla kurumsal alıcılara toptan hırdavat.",
    type: "website",
    siteName: "i-hırdavat",
  },
  twitter: {
    card: "summary_large_image",
    title: "i-hırdavat | B2B Hırdavat Pazaryeri",
    description:
      "Türkiye'nin B2B hırdavat pazaryeri. Bayi fiyatlarıyla aynı gün kargo.",
  },
};

export default function HomePage() {
  return <LandingClient />;
}
