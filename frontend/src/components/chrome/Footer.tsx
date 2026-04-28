"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Facebook,
  Instagram,
  Landmark,
  Linkedin,
  ShieldCheck,
  Twitter,
  WalletCards,
  Youtube,
} from "lucide-react";
import { cmsApi, type CmsLayoutResponse, type FooterSettings, type NavigationMenuItem } from "@/lib/api";
import { ChromeIcon } from "./Icon";

const fallbackFooter: FooterSettings = {
  description: "Türkiye'nin profesyonel hırdavat ve iş güvenliği pazaryeri. Stoklu bayi ilanlarını karşılaştırın, kurumsal alım süreçlerinizi hızlandırın.",
  phone: "0850 XXX XX XX",
  phone_raw: "0850XXXXXXX",
  email: "info@i-hirdavat.com",
  copyright: "i-hirdavat.com. Tüm hakları saklıdır.",
  pharmacist_note: "Sadece kayıtlı B2B alıcılar içindir",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
};

const fallbackMenus: NavigationMenuItem[] = [
  { id: 1, title: "Kurumsal", open_in_new_tab: false, children: [{ id: 11, title: "Hakkımızda", url: "/hakkimizda", open_in_new_tab: false }, { id: 12, title: "Bayi Ol", url: "/register", open_in_new_tab: false }, { id: 13, title: "İletişim", url: "/iletisim", open_in_new_tab: false }] },
  { id: 2, title: "Yardım", open_in_new_tab: false, children: [{ id: 21, title: "Sipariş Takibi", url: "/yardim/alici-rehberi/siparis-takibi", open_in_new_tab: false }, { id: 22, title: "Hızlı Sipariş", url: "/yardim/alici-rehberi/hizli-siparis", open_in_new_tab: false }, { id: 23, title: "SSS", url: "/yardim", open_in_new_tab: false }] },
  { id: 3, title: "Yasal", open_in_new_tab: false, children: [{ id: 31, title: "KVKK Aydınlatma", url: "/legal/kvkk", open_in_new_tab: false }, { id: 32, title: "Çerez Politikası", url: "/legal/cookies", open_in_new_tab: false }, { id: 33, title: "Üyelik Sözleşmesi", url: "/legal/terms", open_in_new_tab: false }] },
  { id: 4, title: "Kategoriler", open_in_new_tab: false, children: [{ id: 41, title: "El Aletleri", url: "/market/category/el-aletleri", open_in_new_tab: false }, { id: 42, title: "Elektrikli Aletler", url: "/market/category/elektrikli-aletler", open_in_new_tab: false }, { id: 43, title: "İş Güvenliği", url: "/market/category/is-guvenligi", open_in_new_tab: false }] },
];

const paymentMethods = [
  { key: "visa", label: "Visa" },
  { key: "mastercard", label: "Mastercard" },
  { key: "troy", label: "Troy" },
  { key: "havale", label: "Havale/EFT" },
  { key: "vadeli", label: "Vadeli" },
  { key: "dbs", label: "DBS" },
] as const;

export function Footer() {
  const [footer, setFooter] = useState(fallbackFooter);
  const [menus, setMenus] = useState(fallbackMenus);

  useEffect(() => {
    cmsApi.getLayout().then((res) => {
      const raw = res.data as { data?: CmsLayoutResponse } & CmsLayoutResponse | undefined;
      const layout: CmsLayoutResponse | undefined = raw?.data ?? raw;
      if (layout?.footer_settings) setFooter(layout.footer_settings);
      if (layout?.menus?.footer?.length) setMenus(layout.menus.footer);
    });
  }, []);

  const socialLinks = [
    { label: "Facebook", url: footer.facebook_url, Icon: Facebook },
    { label: "X", url: footer.twitter_url, Icon: Twitter },
    { label: "Instagram", url: footer.instagram_url, Icon: Instagram },
    { label: "LinkedIn", url: footer.linkedin_url, Icon: Linkedin },
    { label: "YouTube", url: footer.youtube_url, Icon: Youtube },
  ].filter((item) => Boolean(item.url));

  return (
    <footer className="bg-[#F0F2F7] px-4 py-10 sm:px-7">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 grid gap-3.5 md:grid-cols-4">
          {[
            ["truck", "Aynı Gün Kargo", "16:00'a kadar siparişlerde"],
            ["wallet", "Vadeli Ödeme", "60 güne kadar %0 faiz"],
            ["shield", "Güvenli Alışveriş", "Bayi onayı + iade garanti"],
            ["chat", "7/24 Destek", "Telefon, mail, canlı destek"],
          ].map(([icon, title, subtitle]) => (
            <div key={title} className="ih-card flex items-center gap-3.5 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-[#FFC72C] text-[#0A1F44]"><ChromeIcon name={icon} size={20} /></span>
              <span><strong className="block text-sm text-[#0A1F44]">{title}</strong><span className="text-[11px] text-[#5B6679]">{subtitle}</span></span>
            </div>
          ))}
        </div>

        <div className="grid gap-8 border-b border-[#E6E8EE] pb-6 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link href="/market" className="flex items-center gap-2.5 text-[#0A1F44]">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFC72C] text-lg font-black">İ</span>
              <span><span className="block text-xl font-extrabold tracking-[-0.02em]">i-hirdavat</span><span className="block text-[9px] font-bold uppercase tracking-[.18em] text-[#7E8898]">B2B Pazaryeri</span></span>
            </Link>
            <p className="mt-3 max-w-[280px] text-xs leading-6 text-[#5B6679]">{footer.description}</p>
            <div className="mt-4 flex gap-2">
              {socialLinks.map(({ label, url, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-8 w-8 place-items-center rounded-full border border-[#E6E8EE] bg-white text-[#2A3447] transition hover:border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white"
                >
                  <Icon size={15} strokeWidth={2.2} />
                </a>
              ))}
            </div>
          </div>
          {menus.slice(0, 4).map((group) => (
            <div key={group.id}>
              <h4 className="mb-3.5 text-xs font-extrabold uppercase tracking-[.06em] text-[#0A1F44]">{group.title}</h4>
              <ul className="flex flex-col gap-2">
                {group.children?.slice(0, 8).map((item) => (
                  <li key={item.id}><Link href={item.url || "#"} className="text-xs text-[#2A3447] hover:text-[#1F4ED8]">{item.title}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-3 pt-4 text-[11px] text-[#5B6679] lg:flex-row lg:items-center">
          <span>© 2026 {footer.copyright} · ETBIS Onaylı</span>
          <div className="flex flex-wrap items-center gap-2">
            {paymentMethods.map((method) => (
              <PaymentBadge key={method.key} method={method.key} label={method.label} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function PaymentBadge({ method, label }: { method: (typeof paymentMethods)[number]["key"]; label: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#E1E5EE] bg-white px-2.5 text-[10px] font-extrabold text-[#2A3447] shadow-[0_1px_0_rgba(10,31,68,0.04)]">
      <PaymentMark method={method} />
      {label}
    </span>
  );
}

function PaymentMark({ method }: { method: (typeof paymentMethods)[number]["key"] }) {
  if (method === "visa") {
    return <span className="text-[10px] font-black italic tracking-[-0.04em] text-[#1A4DB3]">V</span>;
  }

  if (method === "mastercard") {
    return (
      <span className="relative h-3.5 w-5">
        <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
        <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
      </span>
    );
  }

  if (method === "troy") {
    return <span className="text-[10px] font-black tracking-[-0.02em] text-[#00A6B2]">T</span>;
  }

  if (method === "havale") {
    return <Landmark size={13} strokeWidth={2.3} className="text-[#1F4ED8]" />;
  }

  if (method === "vadeli") {
    return <WalletCards size={13} strokeWidth={2.3} className="text-[#0FA958]" />;
  }

  if (method === "dbs") {
    return <ShieldCheck size={13} strokeWidth={2.3} className="text-[#6E35E8]" />;
  }

  return <CreditCard size={13} strokeWidth={2.3} className="text-[#2A3447]" />;
}
