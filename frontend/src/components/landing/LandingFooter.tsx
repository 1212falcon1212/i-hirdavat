"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-accent-500 rounded-sm flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-900" strokeWidth={3} />
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  i-hırdavat
                </span>
                <span className="text-[9px] font-bold text-accent-500 tracking-[0.15em] uppercase whitespace-nowrap">
                  B2B Hırdavat Pazaryeri
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              Kurumsal alıcı ve bayiler için B2B hırdavat tedarik platformu. Bayi fiyatları,
              aynı gün kargo, entegre ERP / kargo / ödeme altyapısı.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#nasil-calisir"
                  className="hover:text-primary-500 transition-colors"
                >
                  Nasıl Çalışır?
                </a>
              </li>
              <li>
                <a
                  href="#avantajlar"
                  className="hover:text-primary-500 transition-colors"
                >
                  Avantajlar
                </a>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-primary-500 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-primary-500 transition-colors"
                >
                  Giriş Yap
                </Link>
              </li>
            </ul>
          </div>

          {/* Yardim */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Yardım</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/yardim"
                  className="hover:text-primary-500 transition-colors"
                >
                  Yardım Merkezi
                </Link>
              </li>
              <li>
                <Link
                  href="/yardim/satici-rehberi/urun-ekleme"
                  className="hover:text-primary-500 transition-colors"
                >
                  Satıcı Rehberi
                </Link>
              </li>
              <li>
                <Link
                  href="/yardim/alici-rehberi/siparis-takibi"
                  className="hover:text-primary-500 transition-colors"
                >
                  Alıcı Rehberi
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="hover:text-primary-500 transition-colors"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Yasal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/legal/terms"
                  className="hover:text-primary-500 transition-colors"
                >
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="hover:text-primary-500 transition-colors"
                >
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/kvkk"
                  className="hover:text-primary-500 transition-colors"
                >
                  KVKK Aydınlatma
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/60 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} i-Hırdavat. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">Güvenli Ödeme:</span>
            <div className="flex items-center gap-1.5">
              {["VISA", "MC", "EFT"].map((method) => (
                <div
                  key={method}
                  className="px-2.5 py-1 bg-slate-800/60 rounded text-[10px] font-bold text-slate-400"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
