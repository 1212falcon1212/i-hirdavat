"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cmsApi, type CmsLayoutResponse } from "@/lib/api";
import { useCartStore } from "@/stores/useCartStore";
import { QuickOrderModal } from "@/components/market/QuickOrderModal";
import { ChromeIcon } from "./Icon";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [settings, setSettings] = useState<CmsLayoutResponse["settings"] | null>(null);
  const items = useCartStore((state) => state.items);
  const setCartOpen = useCartStore((state) => state.setOpen);

  useEffect(() => {
    cmsApi.getLayout().then((res) => {
      const raw = res.data as { data?: CmsLayoutResponse } & CmsLayoutResponse | undefined;
      const layout: CmsLayoutResponse | undefined = raw?.data ?? raw;
      if (layout?.settings) setSettings(layout.settings);
    });
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + Number(item.offer?.price ?? 0) * item.quantity, 0);
  const popularSearches = [
    { label: "Bosch", query: "Bosch" },
    { label: "Matkap", query: "Matkap" },
    { label: "Testere", query: "Testere" },
    { label: "Zımpara", query: "Zımpara" },
  ];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (value.length < 2) return;
    router.push(`/market/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <header className="border-b border-[#E6E8EE] bg-white">
      <div className="mx-auto grid min-h-[108px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-7 lg:grid-cols-[220px_minmax(360px,1fr)_auto] lg:gap-8 lg:py-5">
        <Link href="/market" className="flex items-center gap-2.5 text-[#0A1F44]">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFC72C] text-lg font-black shadow-[inset_0_-2px_0_rgba(0,0,0,.08)]">İ</span>
          <span className="hidden leading-none sm:block">
            <span className="block text-xl font-extrabold tracking-[-0.02em]">{settings?.site_name || "i-hirdavat"}</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.18em] text-[#7E8898]">B2B Pazaryeri</span>
          </span>
        </Link>

        <div className="relative min-w-0">
          <form onSubmit={onSubmit} className="flex h-12 overflow-hidden rounded-[10px] border border-[#E6E8EE] bg-[#FAFBFD] focus-within:border-[#1F4ED8]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Aradığın ürünü, markayı veya SKU'yu yaz..."
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#0B1220] outline-none placeholder:text-[#7E8898]"
            />
            <button type="submit" className="grid w-14 place-items-center bg-[#1F4ED8] text-white hover:bg-[#1740B8]" aria-label="Ara">
              <ChromeIcon name="search" size={17} />
            </button>
          </form>
          <div className="absolute left-0 top-[54px] hidden gap-2 text-[11px] text-[#5B6679] lg:flex">
            <span>Popüler:</span>
            {popularSearches.map((term) => (
              <button key={term.query} type="button" onClick={() => router.push(`/market/search?q=${encodeURIComponent(term.query)}`)} className="text-[#1F4ED8] hover:underline">
                {term.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickOrderOpen(true)}
            className="hidden h-10 items-center gap-2 rounded-md bg-[#FFC72C] px-4 text-sm font-bold text-[#0A1F44] hover:bg-[#E5B026] lg:inline-flex"
          >
            <ChromeIcon name="bolt" size={14} /> Hızlı Sipariş
          </button>
          <Link href="/market/hesabim" className="grid h-10 w-10 place-items-center rounded-md text-[#2A3447] hover:bg-[#F6F7FA]" aria-label="Hesabım">
            <ChromeIcon name="user" size={20} />
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="hidden h-10 items-center gap-2 rounded-md bg-[#0A1F44] px-4 text-sm font-semibold text-white hover:bg-[#142B5C] sm:inline-flex"
          >
            <ChromeIcon name="cart" size={16} />
            Sepet ({cartCount}) · {cartTotal.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL
          </button>
        </div>
      </div>
      <QuickOrderModal open={quickOrderOpen} onClose={() => setQuickOrderOpen(false)} />
    </header>
  );
}
