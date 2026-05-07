'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Register formu daha uzun olduğu için sağ panele biraz daha genişlik veriyoruz
  // ama sol panel split-screen olarak kalıyor (login ile aynı görsel hiyerarşi).
  const isRegister = pathname === '/register';

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sol Panel — Industrial Pro gradient (steel blue tonları) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' as const }}
        className="hidden lg:flex lg:w-[42%] xl:w-[40%] relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500"
      >
        {/* Subtle background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute top-20 left-20 w-64 h-64 bg-accent-500/15 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], scale: [1, 0.9, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl"
          />
          {/* Grid Pattern — endüstriyel doku */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-accent-500 rounded-md flex items-center justify-center group-hover:bg-accent-400 transition-colors">
                <span className="text-primary-900 font-black text-xl leading-none">i</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">i-hırdavat</span>
                <span className="text-[10px] font-medium text-accent-500 -mt-0.5 tracking-wider uppercase">
                  B2B Hırdavat Pazaryeri
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Center Illustration — endüstriyel ikonlar (çekiç + civata + matkap) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="relative">
              {/* Main Icon — anahtar / wrench */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
                className="relative z-10"
              >
                <div className="w-48 h-48 xl:w-64 xl:h-64 bg-white/15 backdrop-blur-md rounded-md flex items-center justify-center shadow-md border border-white/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-24 h-24 xl:w-32 xl:h-32 text-white"
                  >
                    {/* Wrench path */}
                    <path d="M14.7 6.3a4.5 4.5 0 0 0 6 6L21 15l-9 9-9-9 2.7-2.7a4.5 4.5 0 0 0 6-6l-2.7 2.7-3-3 3-3 2.7 2.7a4.5 4.5 0 0 0 3 3z" />
                  </svg>
                </div>
              </motion.div>

              {/* Floating icon: screw / civata */}
              <motion.div
                animate={{ y: [0, -15, 0], x: [0, 5, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
                className="absolute -top-8 -right-8 w-20 h-20 bg-accent-500 rounded-md flex items-center justify-center shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 text-primary-900"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Hex nut */}
                  <polygon points="12 2 20 7 20 17 12 22 4 17 4 7" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
              </motion.div>

              {/* Floating icon: drill */}
              <motion.div
                animate={{ y: [0, 10, 0], x: [0, -5, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
                className="absolute -bottom-6 -left-10 w-16 h-16 bg-white/15 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Hard hat */}
                  <path d="M3 18a9 9 0 0 1 18 0" />
                  <line x1="12" y1="9" x2="12" y2="4" />
                  <line x1="9" y1="5" x2="15" y2="5" />
                  <line x1="2" y1="18" x2="22" y2="18" />
                </svg>
              </motion.div>

              {/* Floating icon: check shield */}
              <motion.div
                animate={{ y: [0, 8, 0], x: [0, 8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 }}
                className="absolute top-1/2 -right-16 w-14 h-14 bg-white/15 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                Türkiye&apos;nin B2B
                <br />
                Hırdavat Pazaryeri
              </h2>
              <p className="text-lg text-white/80 max-w-md">
                Binlerce bayi, yüzlerce üretici ve toptancı. Kurumsal bayi fiyatlarıyla hırdavat tedarikini tek platformda toplayın.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              {[
                { value: '3.500+', label: 'Kayıtlı Bayi' },
                { value: '125K+', label: 'Ürün / SKU' },
                { value: '94%', label: 'Aynı Gün Kargo' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                >
                  <div className="text-3xl font-bold text-white tabular-num">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sağ Panel */}
      <div className={`w-full lg:w-[58%] xl:w-[60%] flex ${isRegister ? 'items-start' : 'items-center'} justify-center px-4 sm:px-6 py-8 lg:py-10 bg-neutral-50`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`w-full ${isRegister ? 'max-w-[720px]' : 'max-w-[440px]'}`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-7">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-accent-500">
                <span className="text-primary-900 font-black text-lg leading-none">i</span>
              </div>
              <div>
                <span className="text-xl font-black text-neutral-900 tracking-tight">i-hırdavat</span>
                <span className="text-[9px] font-semibold block tracking-widest uppercase text-primary-700">
                  B2B Hırdavat Pazaryeri
                </span>
              </div>
            </Link>
          </div>

          {/* Form card — flat industrial shadow, keskin köşe */}
          <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-7 sm:p-9">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
