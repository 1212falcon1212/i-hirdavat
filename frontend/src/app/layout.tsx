import type { Metadata, Viewport } from "next";
import { Manrope, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { WebVitals } from "@/components/analytics/WebVitals";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

const manrope = Manrope({
  variable: "--font-heading-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "i-hırdavat | B2B Hırdavat Pazaryeri",
  description: "Türkiye'nin B2B hırdavat pazaryeri. Bayi fiyatlarıyla el aletleri, elektrikli aletler, bağlantı elemanları, iş güvenliği ve daha fazlası. 14:00'a kadar siparişler aynı gün kargoda.",
  keywords: [
    "hırdavat",
    "B2B hırdavat",
    "toptan hırdavat",
    "el aletleri",
    "elektrikli aletler",
    "bağlantı elemanları",
    "iş güvenliği",
    "civata",
    "Bosch",
    "Makita",
    "DeWalt",
    "Stanley",
    "bayi fiyatı",
    "pazaryeri",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "i-hırdavat",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A5F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://i-hirdavat.com" />
        <link rel="dns-prefetch" href="https://i-hirdavat.com" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/favicon.svg" color="#1E3A5F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="i-hırdavat" />
        <meta name="application-name" content="i-hırdavat" />
        <meta name="msapplication-TileColor" content="#1E3A5F" />
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-x-hidden bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} storageKey="frontend-theme">
          <AuthProvider>
            <WebVitals />
            {children}
            <Toaster position="top-right" />
            <PWAInstallPrompt />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
