// Shared data + small icon helpers
const PRODUCT = {
  brand: "Bosch Profesyonel",
  title: "BOSCH GSR 12V-30 Vidalama (2×2.0Ah; Plastik)",
  sku: "0.601.9G9.000",
  category: "Matkap",
  psf: 10314.64,
  rating: 4.7,
  ratingCount: 248,
  totalSold: "1.240+",
  images: ["mainshot", "case", "battery", "charger", "in-hand"],
  specs: {
    "Genel": [
      ["Ürün kodu", "0.601.9G9.000"],
      ["Marka", "Bosch Profesyonel"],
      ["Model", "GSR 12V-30"],
      ["Garanti", "2 yıl üretici garantisi"],
    ],
    "Performans": [
      ["Tork (yumuşak/sert/maks.)", "18 / 30 / — Nm"],
      ["Rölanti devir sayısı (1. vites / 2. vites)", "0 – 420 / 0 – 1.600 dev/dak"],
      ["Vida çapı, maks.", "8 mm"],
      ["Mandren açıklığı", "1.5 – 10 mm"],
    ],
    "Batarya & Şarj": [
      ["Akü tipi", "Li-Ion"],
      ["Akü voltajı", "12 V"],
      ["Akü kapasitesi", "2.0 Ah (2 adet)"],
      ["Şarj süresi", "~35 dk"],
    ],
    "Boyut & Ağırlık": [
      ["Ağırlık (akü dahil)", "0.93 kg"],
      ["Uzunluk", "189 mm"],
      ["Kutu içeriği", "Cihaz, 2× akü, şarj cihazı, taşıma çantası"],
    ],
  },
  documents: [
    { name: "Kullanım kılavuzu", size: "2.4 MB", type: "PDF" },
    { name: "CE uygunluk sertifikası", size: "180 KB", type: "PDF" },
    { name: "Teknik datasheet", size: "640 KB", type: "PDF" },
  ],
};

const SELLERS_BASE = [
  {
    id: 1, name: "makita-bayi", rating: 4.8, ratingCount: 312,
    location: "İstanbul / Anadolu",
    delivery: "Çar, 29 Nis",
    deliveryNote: "Bugün 16:00'a kadar siparişlerde",
    stock: 110,
    minQty: 1,
    price: 8973.74,
    psf: 10314.64,
    vat: "KDV Hariç",
    payment: ["Vadeli", "Kapıda"],
    badges: ["EN UYGUN", "Hızlı Kargo"],
    contractPrice: 8520.00,
    tiers: [
      { min: 1, price: 8973.74 },
      { min: 5, price: 8780.00 },
      { min: 10, price: 8550.00 },
      { min: 25, price: 8320.00 },
    ],
    shipsIn: "Aynı gün",
  },
  {
    id: 2, name: "izeltas-bayi", rating: 4.6, ratingCount: 184,
    location: "Bursa / Nilüfer",
    delivery: "Çar, 29 Nis",
    deliveryNote: "Yarın kargoda",
    stock: 7,
    minQty: 1,
    price: 9489.42,
    psf: 10314.64,
    vat: "KDV Hariç",
    payment: ["Vadeli"],
    badges: [],
    contractPrice: null,
    tiers: [
      { min: 1, price: 9489.42 },
      { min: 5, price: 9320.00 },
      { min: 10, price: 9100.00 },
    ],
    shipsIn: "1 iş günü",
  },
  {
    id: 3, name: "depo-anadolu", rating: 4.4, ratingCount: 96,
    location: "Ankara / OSTİM",
    delivery: "Per, 30 Nis",
    deliveryNote: "Stoktan",
    stock: 42,
    minQty: 2,
    price: 9120.00,
    psf: 10314.64,
    vat: "KDV Hariç",
    payment: ["Vadeli", "Havale"],
    badges: ["Vadeli %0 Faiz"],
    contractPrice: null,
    tiers: [
      { min: 2, price: 9120.00 },
      { min: 10, price: 8950.00 },
    ],
    shipsIn: "2 iş günü",
  },
  {
    id: 4, name: "tekno-yapi", rating: 4.9, ratingCount: 521,
    location: "İzmir / Bornova",
    delivery: "Per, 30 Nis",
    deliveryNote: "Stoktan",
    stock: 28,
    minQty: 1,
    price: 9215.00,
    psf: 10314.64,
    vat: "KDV Hariç",
    payment: ["Vadeli", "Havale", "Kart"],
    badges: ["5★ Bayi"],
    contractPrice: null,
    tiers: [
      { min: 1, price: 9215.00 },
      { min: 10, price: 9050.00 },
    ],
    shipsIn: "1 iş günü",
  },
];

const fmtTRY = (n) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// Tiny inline icon set (stroke-based)
const Icon = ({ name, size = 16, className = "" }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", className };
  switch (name) {
    case "search":   return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "bolt":     return <svg {...props}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>;
    case "bell":     return <svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case "user":     return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "heart":    return <svg {...props}><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"/></svg>;
    case "cart":     return <svg {...props}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2 12h12l2-8H6"/></svg>;
    case "chevron-down":  return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case "chevron-up":    return <svg {...props}><path d="m6 15 6-6 6 6"/></svg>;
    case "chevron-right": return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevron-left":  return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>;
    case "info":     return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>;
    case "check":    return <svg {...props}><path d="m5 12 5 5 9-11"/></svg>;
    case "plus":     return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "minus":    return <svg {...props}><path d="M5 12h14"/></svg>;
    case "truck":    return <svg {...props}><path d="M3 6h12v10H3zM15 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>;
    case "shield":   return <svg {...props}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "store":    return <svg {...props}><path d="M3 9 5 4h14l2 5"/><path d="M3 9v11h18V9"/><path d="M3 9c0 2 2 3 3 3s3-1 3-3 2 3 3 3 3-1 3-3 2 3 3 3 3-1 3-3"/></svg>;
    case "star":     return <svg {...props} fill="currentColor" stroke="none"><path d="m12 2 3 7 7 .6-5.3 4.7L18 22l-6-3.5L6 22l1.3-7.7L2 9.6 9 9z"/></svg>;
    case "heart-fill": return <svg {...props} fill="currentColor" stroke="none"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"/></svg>;
    case "doc":      return <svg {...props}><path d="M14 3H6v18h12V7zM14 3v4h4"/></svg>;
    case "download": return <svg {...props}><path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16"/></svg>;
    case "filter":   return <svg {...props}><path d="M4 5h16M7 12h10M10 19h4"/></svg>;
    case "sort":     return <svg {...props}><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/></svg>;
    case "tag":      return <svg {...props}><path d="m20 12-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></svg>;
    case "package":  return <svg {...props}><path d="m12 3 9 5v8l-9 5-9-5V8z"/><path d="M3 8h18M12 21V13"/></svg>;
    case "clock":    return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "alert":    return <svg {...props}><path d="M12 4 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg>;
    case "sparkles": return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/></svg>;
    case "trending": return <svg {...props}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>;
    case "chat":     return <svg {...props}><path d="M21 12a8 8 0 0 1-8 8H4l1.5-3A8 8 0 1 1 21 12Z"/></svg>;
    case "x":        return <svg {...props}><path d="M6 6l12 12M6 18 18 6"/></svg>;
    case "menu":     return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case "drill":    return <svg {...props}><path d="M3 10h7v6H3z"/><path d="M10 11h6l4-3v8l-4-3h-6"/><path d="M5 16v3M8 16v3"/></svg>;
    case "trophy":   return <svg {...props}><path d="M7 4h10v4a5 5 0 0 1-10 0Z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 16h6l1 4H8z"/></svg>;
    case "wallet":   return <svg {...props}><path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 7v0a2 2 0 0 1 2-2h12"/><circle cx="17" cy="13" r="1.2" fill="currentColor"/></svg>;
    case "pin":      return <svg {...props}><path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "split":    return <svg {...props}><path d="M3 6h4l5 6 5-6h4M3 18h4l5-6"/></svg>;
    default: return null;
  }
};

// star rating
const Stars = ({ value, size = 12 }) => {
  return (
    <span style={{ display: "inline-flex", color: "#F59E0B", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <Icon key={i} name="star" size={size} className={i <= Math.round(value) ? "" : "muted-star"} />
      ))}
    </span>
  );
};

Object.assign(window, { PRODUCT, SELLERS_BASE, fmtTRY, Icon, Stars });
