"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhySection from "@/components/landing/WhySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

// ─── Types ──────────────────────────────────────────────────────────────────

interface HeroContent {
  title: string;
  highlight_word: string;
  subtitle: string;
  cta_primary_text: string;
  cta_secondary_text: string;
  social_proof_text: string;
  social_proof_rating: string;
}

interface HowItWorksStep {
  title: string;
  description: string;
}

interface HowItWorksContent {
  section_title: string;
  section_subtitle: string;
  steps: HowItWorksStep[];
  gln_card_title: string;
  gln_card_subtitle: string;
  gln_checklist: string[];
  trusted_by_text: string;
  trusted_by_cities: string[];
}

interface AdvantageFeature {
  icon: string;
  title: string;
  description: string;
}

interface AdvantagesContent {
  section_title: string;
  section_subtitle: string;
  features: AdvantageFeature[];
}

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

interface StatsContent {
  section_title: string;
  section_subtitle: string;
  items: StatItem[];
}

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

interface TestimonialsContent {
  section_title: string;
  section_subtitle: string;
  items: TestimonialItem[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqContent {
  section_title: string;
  items: FaqItem[];
}

interface CtaContent {
  title: string;
  subtitle: string;
  cta_primary_text: string;
  cta_secondary_text: string;
}

interface LandingContent {
  hero: HeroContent;
  how_it_works: HowItWorksContent;
  advantages: AdvantagesContent;
  stats: StatsContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  cta: CtaContent;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_CONTENT: LandingContent = {
  hero: {
    title: "Türkiye'nin {highlight} Hırdavat Pazaryeri",
    highlight_word: "B2B",
    subtitle:
      "Bayi fiyatlarıyla el aletleri, elektrikli aletler, bağlantı elemanları, iş güvenliği ve daha fazlası. 14:00'a kadar verilen siparişler aynı gün kargoda.",
    cta_primary_text: "Ücretsiz Bayi Kaydı",
    cta_secondary_text: "Nasıl Çalışır?",
    social_proof_text: "3.500+ kayıtlı bayi aktif kullanıyor",
    social_proof_rating: "4.8",
  },
  how_it_works: {
    section_title: "3 Adımda Tedarike Başlayın",
    section_subtitle:
      "Vergi kimlik numaranızla dakikalar içinde sisteme dahil olun, kurumsal alıcılara bayi fiyatlarıyla satın veya satın.",
    steps: [
      {
        title: "VKN ile Hızlı Kayıt",
        description:
          "10 haneli Vergi Kimlik Numaranız ve MERSİS bilginizle firmanızı oluşturun. Manuel evrak gerekmez, otomatik doğrulama.",
      },
      {
        title: "Ürünlerinizi Listeleyin veya Arayın",
        description:
          "SKU / barkod ile stokları tek tek ya da Excel/CSV ile toplu listeleyin. Alıcıysanız kategorilerden filtreleyerek en uygun fiyatı yakalayın.",
      },
      {
        title: "Sipariş ve Kargo Tek Panelde",
        description:
          "Entegre PayTR ödeme, Aras Kargo etiketi, e-fatura ve ERP senkronu tek panelden. 14:00'a kadar siparişler aynı gün çıkar.",
      },
    ],
    gln_card_title: "Hızlı Satıcı Onayı",
    gln_card_subtitle: "Sadece doğrulanmış firmalar",
    gln_checklist: [
      "VKN + MERSİS otomatik doğrulama",
      "Ticaret Sicil kontrolü",
      "Kurumsal B2B sözleşmesi",
    ],
    trusted_by_text: "Türkiye'nin dört bir yanından kurumsal alıcı ve satıcılar güveniyor",
    trusted_by_cities: [
      "İstanbul",
      "Ankara",
      "İzmir",
      "Bursa",
      "Kocaeli",
      "Konya",
      "Gaziantep",
    ],
  },
  advantages: {
    section_title: "Neden i-hırdavat?",
    section_subtitle:
      "Toptancı, üretici, bayi ve perakendecilerin tek gerçek B2B hırdavat pazaryeri.",
    features: [
      {
        icon: "trending-up",
        title: "Bayi Fiyatları & Kademeli İskonto",
        description:
          "Tüm satıcıların tekliflerini karşılaştırın, toplu alımda 10+ %5, 50+ %10, 100+ %15'e varan iskontolar yakalayın.",
      },
      {
        icon: "box",
        title: "Stokları Hızla Nakde Çevir",
        description:
          "Depodaki fazla stoklarınızı kurumsal alıcılara satın. Excel/CSV toplu yükleme + SKU yönetimi ile raf ömrü sorununu çözün.",
      },
      {
        icon: "credit-card",
        title: "Güvenli PayTR Ödeme",
        description:
          "Kredi kartı, havale veya cari hesapla güvenle ödeyin. Havuz hesabında tutulan bakiye, teslim onayıyla bayiye aktarılır.",
      },
      {
        icon: "file-check",
        title: "Otomatik E-Fatura & ERP Entegrasyonu",
        description:
          "Logo, Mikro, Netsis, Eta, Nebim, Akinsoft, Zirve ve BizimHesap entegrasyonu. Her sipariş otomatik fatura + muhasebe sync.",
      },
      {
        icon: "truck",
        title: "Aynı Gün Kargo",
        description:
          "14:00'a kadar verilen siparişler aynı gün Aras Kargo / MNG ile çıkar. Türkiye genelinde hızlı teslimat.",
      },
      {
        icon: "shield",
        title: "Düşük Komisyon, Yüksek Hacim",
        description:
          "Platformda sabit düşük komisyon oranı. Yüksek cirolu bayiler için özel komisyon yapılandırması.",
      },
    ],
  },
  stats: {
    section_title: "Rakamlarla i-hırdavat",
    section_subtitle: "Her gün büyüyen kurumsal hırdavat ağı",
    items: [
      { value: 3500, suffix: "+", label: "Kayıtlı Bayi" },
      { value: 125000, suffix: "+", label: "Aktif Ürün / SKU" },
      { value: 94, suffix: "%", label: "Aynı Gün Kargo Oranı" },
      { value: 24, suffix: "/7", label: "Teknik Destek" },
    ],
  },
  testimonials: {
    section_title: "Bayiler Ne Diyor?",
    section_subtitle:
      "Platformumuzu kullanan hırdavatçı ve kurumsal alıcıların deneyimleri.",
    items: [
      {
        quote:
          "Excel'den 200 kalem SKU'yu yapıştırıp sepete attım, yarım saatte sipariş çıktı. Eskiden WhatsApp'la günler sürüyordu.",
        author: "A.Y.",
        role: "Şantiye Alım Sorumlusu, İstanbul",
      },
      {
        quote:
          "Stok yönetimi ve toplu fiyat güncelleme özellikleri işimizi inanılmaz kolaylaştırdı. ERP entegrasyonu da kusursuz.",
        author: "F.D.",
        role: "Toptancı, Ankara",
      },
      {
        quote:
          "Bosch, Makita, DeWalt... tüm büyük markalar tek platformda. Aynı gün kargo sözünü de tutuyorlar, güvenilir.",
        author: "M.K.",
        role: "Perakende Bayi, İzmir",
      },
    ],
  },
  faq: {
    section_title: "Sıkça Sorulan Sorular",
    items: [
      {
        question: "Kayıt olmak için ne gerekiyor?",
        answer:
          "10 haneli Vergi Kimlik Numaranız (VKN), 16 haneli MERSİS numaranız ve Ticaret Sicil No'nuz yeterli. Otomatik doğrulamayla hesabınız kısa sürede aktif olur.",
      },
      {
        question: "Üyelik ücreti var mı?",
        answer:
          "Platforma kayıt ve ürün listeleme tamamen ücretsizdir. Komisyon sadece satış gerçekleştiğinde, düşük sabit oranlı olarak alınır.",
      },
      {
        question: "Ödeme güvenliği nasıl sağlanıyor?",
        answer:
          "Tüm ödemeler PayTR altyapısı üzerinden gerçekleşir. Alıcı ödemesini yaptığında bakiye havuz hesapta tutulur; ürün teslim onayından sonra satıcı cüzdanına aktarılır.",
      },
      {
        question: "Kargo nasıl çalışıyor?",
        answer:
          "Entegre Aras Kargo / MNG / Hepsijet altyapısıyla satıcı tek tıkla kargo etiketi oluşturur. 14:00'a kadar verilen siparişler aynı gün çıkar.",
      },
      {
        question: "Hangi ERP'lere entegreyim?",
        answer:
          "Logo Go 3, Mikro Fly, Netsis 3, Eta:SQL, Nebim V3, Akinsoft Wolvox, Zirve ve BizimHesap entegrasyonu mevcut. Yeni ERP talepleri için destek ekibimizle iletişime geçin.",
      },
    ],
  },
  cta: {
    title: "Hemen Ücretsiz Başlayın",
    subtitle:
      "VKN ve MERSİS bilgilerinizle dakikalar içinde kayıt olun. Üyelik ve ürün listeleme tamamen ücretsiz.",
    cta_primary_text: "Bayi Olarak Kayıt Ol",
    cta_secondary_text: "Giriş Yap",
  },
};

// ─── Loading skeleton ───────────────────────────────────────────────────────

function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 lg:h-20" />

      {/* Hero skeleton */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-4 w-48 bg-white/[0.06] rounded-full animate-pulse" />
              <div className="space-y-3">
                <div className="h-12 w-full bg-white/[0.06] rounded-xl animate-pulse" />
                <div className="h-12 w-3/4 bg-white/[0.06] rounded-xl animate-pulse" />
              </div>
              <div className="h-6 w-2/3 bg-white/[0.06] rounded-lg animate-pulse" />
              <div className="flex gap-4">
                <div className="h-14 w-44 bg-white/[0.06] rounded-xl animate-pulse" />
                <div className="h-14 w-44 bg-white/[0.06] rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <div className="h-[420px] bg-white/[0.04] rounded-2xl border border-white/[0.06] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function LandingClient() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<LandingContent>(DEFAULT_CONTENT);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/market");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch CMS content
  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      try {
        const response = await api.get<LandingContent>("/landing-content");
        if (!cancelled && response.data) {
          setContent((prev) => ({
            hero: { ...prev.hero, ...response.data!.hero },
            how_it_works: {
              ...prev.how_it_works,
              ...response.data!.how_it_works,
            },
            advantages: { ...prev.advantages, ...response.data!.advantages },
            stats: { ...prev.stats, ...response.data!.stats },
            testimonials: {
              ...prev.testimonials,
              ...response.data!.testimonials,
            },
            faq: { ...prev.faq, ...response.data!.faq },
            cta: { ...prev.cta, ...response.data!.cta },
          }));
        }
      } catch {
        // Defaults are already rendered
      }
    }

    fetchContent();
    return () => {
      cancelled = true;
    };
  }, []);

  // Show skeleton during auth check
  if (authLoading) {
    return <LandingSkeleton />;
  }

  // Don't render for authenticated users (they'll be redirected)
  if (isAuthenticated) {
    return <LandingSkeleton />;
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        // Smooth scrolling for anchor links
        scrollBehavior: "smooth",
      }}
    >
      <LandingHeader />

      <main>
        <HeroSection content={content.hero} />

        <FeaturesSection content={content.how_it_works} />

        <WhySection
          title={content.advantages.section_title}
          subtitle={content.advantages.section_subtitle}
          features={content.advantages.features}
        />

        <TestimonialsSection
          title={content.testimonials.section_title}
          subtitle={content.testimonials.section_subtitle}
          items={content.testimonials.items}
        />

        <FaqSection
          title={content.faq.section_title}
          items={content.faq.items}
        />

        <CtaSection content={content.cta} stats={content.stats.items} />
      </main>

      <LandingFooter />
    </div>
  );
}
