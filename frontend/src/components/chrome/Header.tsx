"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { cmsApi, productsApi, type CmsLayoutResponse } from "@/lib/api";
import { useCartStore } from "@/stores/useCartStore";
import { useAuth } from "@/contexts/AuthContext";
import { QuickOrderModal } from "@/components/market/QuickOrderModal";
import { BarcodeScanner } from "@/components/mobile/BarcodeScanner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChromeIcon } from "./Icon";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanLookup, setIsScanLookup] = useState(false);
  const [settings, setSettings] = useState<CmsLayoutResponse["settings"] | null>(null);
  const cartCount = useCartStore((state) => state.itemCount);
  const cartTotal = useCartStore((state) => state.total);
  const setCartOpen = useCartStore((state) => state.setOpen);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleBarcodeScan = async (code: string) => {
    if (isScanLookup) return;
    const barcode = code.trim();
    if (!barcode) return;
    setIsScanLookup(true);
    setShowScanner(false);
    try {
      const response = await productsApi.search(barcode, 1);
      const products = response.data?.products || [];
      if (products.length === 1) {
        toast.success(`Ürün bulundu: ${products[0].name}`);
        router.push(`/market/product/${products[0].id}`);
      } else if (products.length > 1) {
        setQuery(barcode);
        router.push(`/market/search?q=${encodeURIComponent(barcode)}`);
      } else {
        toast.error(`"${barcode}" barkoduyla eşleşen ürün bulunamadı.`);
      }
    } catch (error) {
      console.error("Barcode search failed:", error);
      toast.error("Barkod aranırken bir hata oluştu.");
    } finally {
      setIsScanLookup(false);
    }
  };

  useEffect(() => {
    cmsApi.getLayout().then((res) => {
      const raw = res.data as { data?: CmsLayoutResponse } & CmsLayoutResponse | undefined;
      const layout: CmsLayoutResponse | undefined = raw?.data ?? raw;
      if (layout?.settings) setSettings(layout.settings);
    });
  }, []);

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
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="grid w-12 place-items-center border-l border-[#E6E8EE] bg-white text-[#0A1F44] transition-colors hover:bg-[#F0F4FA]"
              aria-label="Kamera ile barkod tara"
              title="Kamera ile barkod tara"
            >
              {isScanLookup ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
            </button>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Hesabım"
                className="grid h-10 w-10 place-items-center rounded-md text-[#2A3447] outline-none transition-colors hover:bg-[#F6F7FA] focus-visible:ring-2 focus-visible:ring-[#1F4ED8]/30"
              >
                <ChromeIcon name="user" size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 rounded-[10px] border border-[#E6E8EE] bg-white p-1.5 text-[#2A3447] shadow-[0_2px_6px_rgba(11,18,32,0.06),0_1px_2px_rgba(11,18,32,0.04)]"
            >
              {user ? (
                <>
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <p className="truncate text-sm font-extrabold text-[#0A1F44]">
                      {user.seller_name || user.pharmacy_name || "Hesabım"}
                    </p>
                    {user.email && (
                      <p className="truncate text-[11px] font-medium text-[#7E8898]">{user.email}</p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#EFF1F5]" />
                  <DropdownMenuItem
                    onSelect={() => router.push("/market/hesabim")}
                    className="cursor-pointer rounded-[6px] px-2 py-2 text-sm font-medium text-[#2A3447] focus:bg-[#F6F7FA] focus:text-[#0A1F44]"
                  >
                    <ChromeIcon name="user" size={14} />
                    Hesabım
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/market/hesabim?tab=siparislerim")}
                    className="cursor-pointer rounded-[6px] px-2 py-2 text-sm font-medium text-[#2A3447] focus:bg-[#F6F7FA] focus:text-[#0A1F44]"
                  >
                    <ChromeIcon name="box" size={14} />
                    Siparişlerim
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/market/hesabim?tab=begendiklerim")}
                    className="cursor-pointer rounded-[6px] px-2 py-2 text-sm font-medium text-[#2A3447] focus:bg-[#F6F7FA] focus:text-[#0A1F44]"
                  >
                    <ChromeIcon name="heart" size={14} />
                    Favorilerim
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/market/hesabim?tab=ayarlarim")}
                    className="cursor-pointer rounded-[6px] px-2 py-2 text-sm font-medium text-[#2A3447] focus:bg-[#F6F7FA] focus:text-[#0A1F44]"
                  >
                    <ChromeIcon name="map-pin" size={14} />
                    Adreslerim
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#EFF1F5]" />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="cursor-pointer rounded-[6px] px-2 py-2 text-sm font-semibold text-[#DC2626] focus:bg-[#FEECEC] focus:text-[#DC2626]"
                  >
                    <ChromeIcon name="logout" size={14} />
                    Çıkış Yap
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onSelect={() => router.push("/login")}
                    className="cursor-pointer rounded-[6px] px-2 py-2 text-sm font-semibold text-[#0A1F44] focus:bg-[#F6F7FA]"
                  >
                    <ChromeIcon name="user" size={14} />
                    Giriş Yap
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/register")}
                    className="cursor-pointer rounded-[6px] px-2 py-2 text-sm font-medium text-[#2A3447] focus:bg-[#F6F7FA] focus:text-[#0A1F44]"
                  >
                    <ChromeIcon name="bolt" size={14} />
                    Üye Ol
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </header>
  );
}
