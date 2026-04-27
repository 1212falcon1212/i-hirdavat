# Handoff — i-hirdavat B2B Hırdavat Pazaryeri

## Genel Bakış

Bu paket, **i-hirdavat** adlı B2B hırdavat pazaryerinin masaüstü web arayüzü için tasarım referanslarını içerir. Üç ana yüzey üzerinde çalıştık:

1. **Global Chrome** — Tüm sayfalarda paylaşılan header, kategori navbar, footer
2. **Anasayfa** — Hero, kategori şeritleri, ürün rafları, kampanya bantları, video ve blog bölümleri
3. **İlan Detay Sayfası** — Tek bir SKU üzerinde birden fazla **bayi ilanının** karşılaştırıldığı sayfa (ürün-bayi ayrışmış model)

Ek olarak header/navbar/footer için 3'er alternatif keşif dosyası bulunur.

---

## Tasarım Dosyaları Hakkında

Bu pakettteki dosyalar **HTML olarak yapılmış tasarım referanslarıdır** — niyet edilen görünümü ve davranışı gösteren prototiplerdir, doğrudan kopyalanacak prodüksiyon kodu değildir. Görev bu HTML tasarımlarını **hedef projenin mevcut ortamında** (React, Vue, Next.js, Nuxt, Laravel Blade, vb.) o projenin yerleşik kalıplarını ve kütüphanelerini kullanarak **yeniden inşa etmektir**. Henüz bir frontend stack'i seçilmemişse, pazaryeri ölçeği için **Next.js (App Router) + TypeScript + Tailwind CSS** önerilir.

JSX dosyaları React 18 üzerinde çalışacak şekilde yazılmıştır ancak Babel standalone ile inline derlendiği için import/export yapısı yoktur — komponent isimleri `window` üzerinden paylaşılır. Prodüksiyon implementasyonunda her komponent kendi dosyasında olmalı, normal import/export ile bağlanmalıdır.

---

## Fidelite

**Yüksek fidelite (hi-fi)** — Renkler, tipografi, spacing, gölgeler ve etkileşimler son tasarıma yakındır. Aşağıdaki design token'lar ve bileşen ölçüleri korunarak pixel-perfect uygulama yapılmalıdır. Ürün görselleri ve kampanya görselleri **placeholder**'dır (SVG veya boş kutu); prodüksiyonda gerçek ürün/kampanya görselleriyle değiştirilmelidir.

---

## Design Tokens

### Renkler
```
--brand-yellow:       #FFC72C   /* Ana CTA, marka aksaniyle */
--brand-yellow-dark:  #E5B026
--brand-navy:         #0A1F44   /* Header üst şerit, navbar, koyu CTA */
--brand-navy-2:       #142B5C   /* Navbar varyantı */
--brand-blue:         #1F4ED8   /* Sekonder CTA, link, arama butonu */
--brand-blue-dark:    #1740B8

--ink-900:            #0B1220   /* Ana metin */
--ink-700:            #2A3447   /* İkincil metin, ikon */
--ink-500:            #5B6679   /* Yardımcı metin */
--ink-400:            #7E8898   /* Disabled / tarih */
--ink-300:            #A9B1BD

--line:               #E6E8EE   /* Border */
--line-2:             #EFF1F5   /* Soft border */
--bg:                 #F6F7FA   /* Sayfa arka planı */
--bg-soft:            #FAFBFD   /* Soft surface */
--white:              #FFFFFF

--success:            #16A34A
--success-bg:         #E8F6EE
--warn:               #D97706
--warn-bg:            #FEF3E2
--danger:             #DC2626
--danger-bg:          #FEECEC
--info:               #0369A1
--info-bg:            #E6F1FA
```

### Tipografi
- **Font**: `Inter` (Google Fonts), fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Mono**: `JetBrains Mono`, fallback `ui-monospace, SFMono-Regular, Menlo, monospace`
- **Ağırlıklar**: 400, 500, 600, 700, 800, 900
- **Letter-spacing**: Başlıklarda `-0.02em`, uppercase mikro etiketlerde `+0.06em ~ +0.1em`

### Border Radius
```
--r-sm:  6px
--r:     10px
--r-lg:  14px
--r-xl:  18px
```

### Gölgeler
```
--shadow-sm:  0 1px 2px rgba(11,18,32,.04), 0 1px 1px rgba(11,18,32,.03)
--shadow:     0 2px 6px rgba(11,18,32,.06), 0 1px 2px rgba(11,18,32,.04)
--shadow-lg:  0 12px 32px rgba(11,18,32,.10), 0 2px 6px rgba(11,18,32,.04)
```

### Spacing
4px tabanlı; en sık kullanılanlar 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48px.

---

## Global Chrome

`chrome.jsx` dosyasında tanımlı. Üç parçalı:

### 1. Promo Şeridi (üst lacivert şerit)
- **Yükseklik**: 25px
- **BG**: `--brand-navy`
- **Metin**: `#C7D0E4`, `font-size: 11px`
- **İçerik (sol)**: 3 USP — `📦 16:00'a kadar siparişlerde aynı gün kargo · 💳 Vadeli ödemede %0 faiz · 🛡 7/24 bayi destek`
- **İçerik (sağ)**: `Bayi Ol | Yardım | TR ▾`
- **Padding**: `6px 32px`

### 2. Header (beyaz minimal — H3)
- **Yükseklik**: ~108px
- **BG**: `white`
- **Border-bottom**: `1px solid --line`
- **Layout**: 3 kolon grid `auto 1fr auto`, gap 32px, padding `20px 32px`
- **Logo (sol)**:
  - `İ` markı: 36×36, `--brand-yellow` BG, navy text, `border-radius: 8px`, `font-weight: 900`
  - "i-hirdavat" başlık + altında "B2B PAZARYERİ" kapital small (10px, --ink-400)
  - `<a href="Anasayfa.html">` ile ana sayfaya tıklanabilir
- **Arama (orta)**:
  - Yükseklik 48px, `border: 1px solid --line`, `border-radius: 10px`, BG `--bg-soft`
  - Placeholder: "Aradığın ürünü, markayı veya SKU'yu yaz..."
  - Sağda mavi (`--brand-blue`) buton, beyaz arama ikonu
  - Altında: "Popüler:" + 4 mavi link (Bosch matkap, iş güvenliği eldiveni, Karcher yıkama, İzeltaş pense), 11px
- **Sağ aksiyonlar**:
  - "Hızlı Sipariş" — sarı buton, ⚡ ikonlu
  - Heart, User ikonları (20px)
  - "Sepet (3) · 1.299 TL" — lacivert buton

### 3. Kategori Navbar (N3 — mega menu'lü)
- **Yükseklik**: 44px (kapalıyken)
- **BG**: `#0F2552`
- **Sol blok**: "Tüm Kategoriler" — `rgba(255,199,44,.12)` BG ile vurgulu, font-weight 700, chevron-down ikonlu
- **Diğer kategoriler**: 7 adet — El Aletleri (HOT rozetli), Elektrikli Aletler, İş Güvenliği, Bağlantı Elemanları, Ölçüm Aletleri, Aydınlatma, Hidrolik & Pnömatik
  - Renk: white, font-weight: 500
  - Hover: `rgba(255,255,255,.06)` BG + 2px sarı altçizgi
  - Her birinde 14px ikon
- **Sağ**: 🔥 Kampanyalar — `--brand-yellow` text, font-weight 700
- **Mega Menu (hover ile açılır)**:
  - 3 kolon grid `220px 1fr 240px`, padding `24px 32px`, BG white, shadow-lg
  - **Kolon 1**: Kategori adı (uppercase 11px) + 6 alt kategori link + "Tümünü Gör →" mavi link
  - **Kolon 2**: "POPÜLER MARKALAR" + 8 marka kartı (4×2 grid) — Bosch, Makita, DeWalt, Stanley, İzeltaş, Bahco, Knipex, Hilti
  - **Kolon 3**: Sarı gradient kart `linear-gradient(135deg, #FFC72C, #FFD66B)`, "HAFTANIN FIRSATI" + başlık + "Keşfet →" navy buton

### 4. Breadcrumbs (opsiyonel)
- Sayfaya göre değişir; anasayfada gizlenir (`breadcrumbs={false}` prop'u ile)
- BG `--bg-soft`, padding `10px 32px`, font-size 12px
- Format: `Anasayfa / Matkap / Akülü / <ürün adı>`

### 5. Footer (F2 — açık zemin, kart tabanlı)
- **BG**: `#F0F2F7`
- **Padding**: `40px 32px`

**Üst USP Şeridi** (4'lü grid):
- 4 beyaz kart, gap 14px, padding 18px, `border-radius: 10px`
- Her kart: 44×44 sarı ikon kutusu (BG `--brand-yellow`, navy ikon) + başlık + altyazı
- İçerikler:
  1. 🚚 **Aynı Gün Kargo** — 16:00'a kadar siparişlerde
  2. 💳 **Vadeli Ödeme** — 60 güne kadar %0 faiz
  3. 🛡 **Güvenli Alışveriş** — Bayi onayı + iade garanti
  4. 💬 **7/24 Destek** — Telefon, mail, canlı destek

**Ana Link Grid** (5 kolon, `1.5fr 1fr 1fr 1fr 1fr`):
- **Kolon 1**: Logo + 280px maxwidth açıklama + 5 sosyal ikon (32×32 daire, beyaz BG, --line border)
- **Kolon 2 — KURUMSAL**: Hakkımızda, Kariyer, Bayi Ol, Basın Odası, İletişim
- **Kolon 3 — YARDIM**: Sipariş Takibi, İade & İptal, Kargo, SSS, Canlı Destek
- **Kolon 4 — YASAL**: KVKK Aydınlatma, Çerez Politikası, Mesafeli Satış, Üyelik Sözleşmesi
- **Kolon 5 — KATEGORİLER**: El Aletleri, Elektrikli Aletler, İş Güvenliği, Bağlantı Elemanları, Aydınlatma
- Başlıklar: 12px font-weight 800 navy, letter-spacing 0.06em, uppercase
- Linkler: 12px --ink-700, gap 8px

**Alt Şerit** (border-top --line, padding-top 18px):
- Sol: "© 2026 i-hirdavat A.Ş. · VKN: 1234567890 · MERSIS: 0123-4567-8901-2345 · ETBIS Onaylı"
- Sağ: 6 ödeme rozeti (VISA, MasterCard, Troy, Havale, Vadeli, DBS) — beyaz BG, --line border, 4px radius, 10px font-weight 700

---

## Anasayfa

`anasayfa.jsx` dosyasında tanımlı. Yukarıdan aşağı bölümler:

### A1. Hero (HeroV2)
- 4'lü turuncu kampanya chip'i: Kampanyalar, Sana Özel, Düzenle Yenile, İlham & Öneri
- Sol panel: "Sezonun Yıldızı" başlık + "ALIŞVERİŞE BAŞLA" sarı CTA
- Sağ panel: "BU AVANTAJLAR HIRDAVAT FIRSATLARI 22-30 NİSAN" başlığıyla 3 kareli görsel grid
- Altında 9'lu renkli kategori şerit kartı (yatay scroll, ok düğmeli)

### A2. Vitrin & i-hirdavatLIVE
- 2'li banner: "Vitrin Nisan Sayısı" + "i-hirdavatLIVE"
- Her ikisinde de tam görsel + üzerinde başlık metin

### A3. 3'lü Zone Banner
- Cüzdan / Yatak & Bazalar / Erinöz Bahçe — 3 eşit kart

### A4. Kategori Mini Kartlar (4'lü)
- "EV STİLİ DEĞİŞTİRME ZAMANI" kırmızı rozet
- Her karta: ürün görseli (placeholder) + alt overlay'de ürün adı + fiyat

### A5. Ürün Rafları (3 adet, her biri 6'lı kart)
- "Yakın Zamanda İncelediklerin"
- "Isıtma & Soğutma Yıldızları"
- "Çok Satan Ürünleri"
- **Ürün kartı yapısı** (kritik — pazaryeri modelinin temeli):
  - Ürün görseli (placeholder kare)
  - Sol üst rozet: İndirimli (kırmızı), Yıldızlı (mor), Çok Satan (yeşil), Yeni Çıktı (turuncu)
  - Marka + ürün adı
  - **PSF fiyatı** (Piyasa Satış Fiyatı, KDV dahil) — büyük punto navy
  - Alt link: "**X bayi ilanı →**" — bu link kullanıcıyı **İlan Detay sayfasına** götürür; orada birden fazla bayinin aynı ürün için verdiği ilan karşılaştırılır

### A6. Öne Çıkan Kampanyalar (4'lü tam görsel kart)

### A7. "İyi ki Almışım..." Video Bölümü (4'lü dikey video kartı)

### A8. İkonlu Kategori Scroller (10'lu yuvarlak)

### A9. Yaşayan Evler Blog (3'lü blog kartı)

---

## İlan Detay Sayfası

`v1.jsx` (masaüstü) ve `v_mobile.jsx` (mobil) dosyalarında. **Ürün-bayi ayrışmış** model — bir SKU için birden fazla bayinin ilanı yan yana gösterilir.

### Yapı (üstten alta)
1. **Galeri** (sol) + **Ürün Bilgi Paneli** (sağ) — 2 kolon grid
2. **Bayi İlanları Tablosu** — bu ürünü satan tüm bayiler, fiyat / stok / kargo / vade / yorum puanı kolonlarıyla
3. **Teknik Özellikler & Açıklama** — sekmeli yapı
4. **Yorumlar & Soru-Cevap**
5. **Benzer Ürünler** rafı

### Bayi İlanları Tablosu — kritik komponent
Her satır:
- Bayi logo + adı + puan (5 üzerinden) + yorum sayısı
- **Bayinin verdiği fiyat** (PSF'den farklı olabilir; her bayi kendi marjını koyar)
- Stok durumu rozeti (Stokta / Az Kaldı / Tükendi)
- Kargo bilgisi (ücretsiz / ücretli + süre)
- Vade seçeneği (peşin / 30/60/90 gün vadeli)
- "Sepete Ekle" sarı CTA
- Sıralama: en düşük fiyat varsayılan, ama kullanıcı puan/kargo/vadeye göre sıralayabilir

### Mobil
`v_mobile.jsx`'de kompakt versiyon — bayi ilanları aşağı kaydırmalı kartlar olarak verilir, 395×832 frame içinde.

---

## Etkileşimler & Davranışlar

### Header
- Logo tıklanınca anasayfaya gider
- Arama input enter veya buton → arama sonuçları sayfası
- Hızlı Sipariş → SKU/adet bulk giriş modal'ı (henüz tasarlanmadı, mock için tıklanabilir buton bırak)
- Sepet butonu → sepet sayfası

### Navbar
- Kategori üzerine **hover** ile mega menu açılır (300ms gecikme önerilir)
- Mouse menu'den çıkınca kapanır
- Mobilde: drawer olarak açılır (henüz tasarlanmadı, hamburger ikonu ile)

### Anasayfa
- 9'lu kategori şerit: yatay scroll, sağ-sol ok butonları
- Ürün kartı hover: hafif yükselme (translateY -2px) + shadow-sm → shadow
- "X bayi ilanı →" linki → İlan Detay sayfası

### İlan Detay
- Galeri: thumbnail tıkla → ana görsel değişir
- Bayi tablosu sıralama: kolon başlığı tıkla → asc/desc toggle
- "Sepete Ekle" → toast bildirim + sepet sayacı +1
- Sekmeler (Teknik / Açıklama / Yorum / SSS): tıkla, içerik fade-in 200ms

### Genel
- Tüm CTA'larda focus ring: `2px solid --brand-blue` `outline-offset: 2px`
- Tüm hover transition: `all 0.15s ease`
- Tüm shadow transition: `box-shadow 0.2s ease`

---

## Responsive Davranış

Tasarımlar şu an **1320px (anasayfa) / 1280px (ilan detay)** masaüstü için optimize edildi. Tablet ve mobil:
- ≥1024px: 5 kolon ürün grid
- ≥768px: 3 kolon
- <768px: 2 kolon, header tek satıra düşer (hamburger menu, arama tek satır)
- Mobil için ayrı bir frame olarak `v_mobile.jsx` mevcut — referans alınabilir

---

## State & Veri Yapısı (öneri)

### Ürün modeli
```ts
type Product = {
  id: string;            // SKU
  brand: string;
  title: string;
  category: string[];    // breadcrumb
  images: string[];
  psfPrice: number;      // KDV dahil PSF
  specs: Record<string, string>;
  description: string;
  rating: number;
  reviewCount: number;
};
```

### İlan (Bayi → Ürün) modeli
```ts
type Listing = {
  id: string;
  productId: string;     // ürün ile ilişki
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  vendorRating: number;
  vendorReviewCount: number;
  price: number;         // bayi fiyatı (PSF'den farklı)
  stock: 'in_stock' | 'low' | 'out';
  stockCount?: number;
  shipping: { free: boolean; cost?: number; daysMin: number; daysMax: number; };
  paymentTerms: ('cash' | 'vade30' | 'vade60' | 'vade90')[];
};
```

Anasayfada ürün kartı `psfPrice` gösterir + `listingCount` ("X bayi ilanı"). İlan detayda ilanlar bu `productId` üzerinden filtrelenip listelenir.

---

## Aset Notları

- Tüm ürün görselleri **placeholder** — prodüksiyonda her bayinin yüklediği ürün görselleri (CDN üzerinden) gelmeli
- Marka logoları placeholder text — gerçek SVG logoları temin edilmeli
- Ödeme rozetleri placeholder — VISA/MC/Troy SVG asetleri temin edilmeli
- İkonlar: Inline SVG component (`<Icon name="..." />`). Prodüksiyonda Lucide React veya Phosphor öneririz; mevcut isimler (truck, wallet, shield, drill, bolt, search, cart, heart, user, bell, menu, chevron-down, package, info, sparkles, wrench, trophy, tag, chat) ile büyük oranda örtüşür.

---

## Bu Pakettteki Dosyalar

| Dosya | İçerik |
|---|---|
| `Anasayfa.html` | Anasayfa prototip (DesignCanvas içinde) |
| `İlan Detay.html` | İlan detay sayfası — masaüstü + mobil frame |
| `Header Navbar Footer.html` | 3'er header/navbar/footer alternatif keşfi |
| `chrome.jsx` | **Seçilen** Chrome (H3 + N3 + F2) — implemente edilecek |
| `chrome_variants.jsx` | Diğer alternatifler — referans, implemente edilmez |
| `anasayfa.jsx` | Anasayfa bölümleri |
| `v1.jsx` | İlan detay masaüstü |
| `v_mobile.jsx` | İlan detay mobil |
| `data.jsx` | Mock veri (PRODUCT, ürün listeleri vb.) — ne tür alanlar tutuluyor görmek için |
| `styles.css` | Design token'lar + utility class'lar |
| `design-canvas.jsx` | Tasarımları yan yana göstermek için kullanılan canvas wrapper — implemente edilmez |

---

## Kontrol Listesi (developer için)

- [ ] Stack seçimi yapıldı (öneri: Next.js + TS + Tailwind)
- [ ] `styles.css` token'ları Tailwind config veya CSS değişkenleri olarak aktarıldı
- [ ] `Inter` Google Fonts entegrasyonu yapıldı
- [ ] Icon kütüphanesi seçildi ve Icon adları map'lendi
- [ ] Chrome komponentleri yazıldı: `<TopPromo />`, `<Header />`, `<CategoryNav />` (mega menu dahil), `<Footer />`
- [ ] Anasayfa bölümleri yazıldı (A1–A9)
- [ ] Product / Listing veri modeli tanımlandı + endpoint'ler bağlandı
- [ ] İlan detay sayfası (`/urun/[slug]`) yazıldı, bayi tablosu dinamik
- [ ] Responsive breakpoint'ler test edildi
- [ ] Erişilebilirlik: focus ring'ler, ARIA label'lar, klavye navigasyonu
