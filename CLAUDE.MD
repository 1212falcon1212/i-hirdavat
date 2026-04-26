# i-hirdavat.com — Market & Satıcı Paneli Dönüşüm Rehberi

> Bu doküman i-depo.com kod tabanından i-hirdavat.com kod tabanına dönüşüm
> yapılırken Claude Code'un referans alacağı master prompt'tur. Backend
> mantığı, API endpoint'leri, auth/payment/kargo entegrasyonları **AYNEN
> KORUNUR** — sadece tasarım, içerik ve sektöre-özel UX değişir.

---

## 0. GLOBAL KURALLAR — DEĞİŞTİRİLMESİ YASAK

- Component dosyalarının **yapısı** (dosya adları, export'lar, prop'lar)
- API endpoint'leri, route tanımları, auth middleware'leri
- Payment (PayTR), kargo (Aras), ERP entegrasyon flow'ları
- Database schema (migration gerekirse ayrıca rapor edilir)
- Responsive breakpoint'ler, SSR/ISR davranışları
- i18n altyapısı

**Tek istisna:** GLN alanı. Bu alan `taxNumber` (10 haneli Vergi Kimlik No) olarak
yeniden adlandırılacak. Validator: `^\d{10}$`. Backend modelinde alan adı
değişir, migration yazılır, seed güncellenir.

---

## 1. DESIGN TOKENS — "Industrial Pro"

Mevcut Tailwind config / CSS variable dosyasında aşağıdaki token'ları güncelle:

```css
:root {
  /* === PRIMARY — Steel Blue === */
  --color-primary-50:  #F0F4FA;
  --color-primary-100: #D9E2EF;
  --color-primary-500: #2C5282;   /* hover, active */
  --color-primary-700: #1E3A5F;   /* brand, header, CTA */
  --color-primary-900: #0F1F35;   /* headings on light bg */

  /* === ACCENT — Safety Yellow === */
  --color-accent-400:  #FFC933;   /* hover */
  --color-accent-500:  #FFB800;   /* primary accent */
  --color-accent-600:  #D99700;   /* pressed */
  --color-accent-bg:   #FFF8E1;   /* bg tint for badges */

  /* === NEUTRAL — Industrial Gray === */
  --color-neutral-50:  #F4F5F7;   /* page bg */
  --color-neutral-100: #E9EBEF;   /* card bg alt */
  --color-neutral-200: #D1D5DB;   /* borders */
  --color-neutral-400: #9CA3AF;   /* muted text */
  --color-neutral-600: #4B5563;   /* body text secondary */
  --color-neutral-800: #1F2937;   /* body text */
  --color-neutral-900: #111827;   /* headings */

  /* === SEMANTIC === */
  --color-success:     #2F855A;   /* stokta, onay */
  --color-success-bg:  #F0FDF4;
  --color-warning:     #C05621;   /* stok azaldı */
  --color-warning-bg:  #FFFBEB;
  --color-danger:      #C53030;   /* stok yok */
  --color-danger-bg:   #FEF2F2;
  --color-info:        #2C5282;

  /* === RADIUS — Keskin, endüstriyel === */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-xl: 8px;
  /* YASAK: 12px+ ve full. Hırdavatta yumuşak form güven kırıcı. */

  /* === SHADOWS — Minimal, flat === */
  --shadow-sm:  0 1px 2px rgba(15, 31, 53, 0.06);
  --shadow-md:  0 2px 4px rgba(15, 31, 53, 0.08);
  --shadow-lg:  0 4px 8px rgba(15, 31, 53, 0.10);
  /* YASAK: blurry soft shadow'lar, glow efektleri */

  /* === TYPOGRAPHY === */
  --font-heading: 'Manrope', 'Inter', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Roboto Mono', monospace;
  /* SKU ve ürün kodları için mono font */
}

/* Fiyat, stok, SKU ve tüm sayısal veriler için ZORUNLU */
.tabular-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

### Gradient ve efekt yasakları

- **Pembe gradient butonlar KALDIRILACAK.** Tüm primary butonlar solid
  `--color-primary-700`, hover'da `--color-primary-500`.
- **Accent CTA butonları** (sepete ekle, satın al) solid
  `--color-accent-500`, hover'da `--color-accent-400`, yazı rengi
  `--color-neutral-900` (siyah, sarı üstüne beyaz OKUNMAZ).
- Turkuaz arkaplan tint'leri (`bg-cyan-50` vb) → `--color-neutral-50`.

---

## 2. GLOBAL KOMPONENTLER

### 2.1 Top Bar

```
ESKİ: 🚚 Türkiye geneli ücretsiz kargo • 🕐 Hafta içi 09:00-18:00 |
      Nasıl Satıcı Olurum? | İletişim | ☎ 05428482646

YENİ: 📋 Kurumsal alıcılara KDV hariç fiyatlar • ⚡ 14:00'a kadar
      siparişler aynı gün kargoda | Bayi/Satıcı Ol | Teknik Destek |
      B2B Hattı: 0850 XXX XX XX
```

Arkaplan: `--color-primary-700`. Yazı rengi: `rgba(255,255,255,0.9)`.
İkon renkleri: `--color-accent-500`.

### 2.2 Header

Yapı aynen kalır (logo + arama + hesap + favori + sepet) ama:

- **Logo:** "i-depo" → "i-hırdavat". Alt etiket "B2B ECZANE PAZARYERİ" →
  **"B2B HIRDAVAT PAZARYERİ"**. Logo ikonu kalabilir (+ sembolü) veya
  anahtar/cıvata SVG ile değiştirilebilir (tercih: mevcut + ikonu kalsın,
  renk değiştirilsin — `--color-accent-500` bg üstüne `--color-primary-700`).
- **Arama inputu:**
  - Placeholder rotation (her 3 sn değişsin):
    ```
    "M8x20 DIN 933 civata ara..."
    "Bosch GSB 550 darbeli matkap ara..."
    "İzeltaş alyan takımı ara..."
    "3lü topraklı priz ara..."
    "Makita akülü matkap 18V ara..."
    "3M iş güvenliği eldiveni ara..."
    ```
  - Sağdaki scanner ikonunu TUT ama tooltip: "Barkod / SKU ile ara".
  - Arama kutusu min genişlik daha geniş — arama bu platformun kalbi.
- **Bell ikonunun yanındaki 21 badge** formatı korunur (`--color-danger`).

### 2.3 Mega Menu — Tamamen Yeni Kategori Ağacı

```
🔧 El Aletleri
   ├─ Anahtarlar (Lokma, İngiliz, Yıldız, Alyan Takımı)
   ├─ Tornavida & Bits (Düz, Yıldız, Torx, Darbeli)
   ├─ Penseler & Kerpetenler (Yan keski, Kargaburnu, Pense)
   ├─ Çekiç & Balyoz
   ├─ Keski & Zımbalar
   └─ Testere & Eğe

⚡ Elektrikli Aletler
   ├─ Matkaplar (Darbeli, Hilti Tipi, Akülü Vidalama)
   ├─ Taşlama & Kesme (Avuç içi, Büyük taşlama)
   ├─ Zımpara & Rende
   ├─ Hava Kompresörü & Ekipman
   └─ Jeneratör & Kaynak Makinesi

🔩 Bağlantı Elemanları
   ├─ Civatalar (DIN 933, 931, 912, 7991)
   ├─ Somunlar (DIN 934, 985 fiber, kelebek)
   ├─ Vidalar (ahşap, sunta, teneke, matkap uçlu)
   ├─ Pullar (düz, yaylı, ikiz)
   ├─ Dübeller (çelik, plastik, kimyasal)
   └─ Çivi & Zımba Teli

🧱 İnşaat & Yapı
   ├─ Çimento, Harç & Alçı
   ├─ İzolasyon (su, ısı, ses)
   ├─ Boya & İnceltici
   ├─ Kalıp Malzemeleri
   └─ Demir & Hasır

🚰 Tesisat & Su
   ├─ PPR-C & PVC Borular
   ├─ Bakır Boru & Fitting
   ├─ Vanalar (Küresel, Kelebek, Çekvalf)
   ├─ Armatürler (Banyo, Mutfak, Bahçe)
   └─ Pompa & Hidrofor

💡 Elektrik Malzemeleri
   ├─ Kablolar (NYA, NYM, YVV, TTR)
   ├─ Şalt Malzemeleri (Sigorta, Kontaktör, Röle)
   ├─ Priz, Anahtar & Buat
   ├─ Aydınlatma (LED, ampul, armatür)
   └─ Pano & Kofra

🔐 Hırdavat & Nalburiye
   ├─ Kilitler (Kapı, Asma, Barel)
   ├─ Menteşe & Sürgü
   ├─ Çekme & Tutamak
   └─ Çeşitli Aksesuar

🦺 İş Güvenliği
   ├─ Baret & Kulak Koruyucu
   ├─ Eldiven (Nitril, deri, anti-kesilme)
   ├─ Gözlük & Yüz Siperi
   ├─ Maske & Filtre
   └─ İş Ayakkabısı & Çizme

🌳 Bahçe & Orman
   ├─ Hortum & Sulama
   ├─ Budama Makasları
   ├─ Motorlu Testere & Çim Biçme
   └─ Fiskiye & Pompa
```

Mega menu hover'da **ikon + alt kategori listesi + öne çıkan 3 marka**
yapısında açılsın. Öne çıkan markalar her kategoride farklı.

---

## 3. ANASAYFA — Section'lar

### 3.1 Hero Banner

Tek büyük görsel banner (şampuan) → **3'lü carousel**:
1. **Sezon kampanyası** — "Bosch Yaz Kampanyası %20" (büyük ürün görseli,
   sarı vurgu metin, CTA "Kampanyayı İncele")
2. **Marka vitrin** — "DeWalt Akülü Seri" (ürün compound görsel)
3. **Kategori vurgu** — "İş Güvenliği Ekipmanlarında Toplu İndirim"

Carousel overlay: `linear-gradient(90deg, rgba(30,58,95,0.85) 0%, rgba(30,58,95,0.1) 70%)`.
Metinler sola yaslı, CTA buton solid accent yellow.

**Görsel kaynakları (Unsplash/Pexels):**
- `industrial warehouse bosch tools` / `makita drill workshop` /
  `hardware store professional` / `construction site tools organized`

### 3.2 Trust Strip (3 kart)

| Eski | Yeni | İkon |
|---|---|---|
| Komisyonsuz Satış — Sadece sabit 50₺ | **Bayi Fiyatları** — Rakiplerin %15-25 altında | 💰 tag |
| Ücretsiz Kargo — Tüm siparişlerde satıcı karşılar | **Aynı Gün Kargo** — 14:00'a kadar siparişler | ⚡ lightning |
| Güvenli Tedarik — Onaylı eczaneler | **Orijinal Ürün** — Resmi distribütör kanalı | 🛡 shield |

Kart arkaplanı: `--color-primary-700`. Yazı: beyaz. İkon bg: `--color-accent-500`.

### 3.3 Günün Fırsatı

Konsept aynen kalır. Ürün verisi değişir:
- Örnek: "Bosch GSB 16 RE Darbeli Matkap 750W — 1.890₺ KDV Hariç"
- CTA "Fırsatı Yakala" → aynı kalabilir veya "Hemen Sipariş Ver"
- Stok bilgisi eklenir: "Son 47 adet"

### 3.4 Sezonun Öne Çıkanları + Haftanın Ürünleri

İki 3'lü ürün grid yapısı korunur. Ürünler hırdavat. Başlıklar:
- "Sezonun Öne Çıkanları" → **"Bu Ay Popüler"** (ay-bazlı trend)
- "Haftanın Ürünleri" → ✓ aynı kalabilir

### 3.5 Son Satılanlar → **Canlı Sipariş Akışı**

Mevcut "Son Satılanlar" bölümü zenginleştir:
```
┌──────────────────────────────────────────────────┐
│ 📈 Canlı Sipariş Akışı          Canlı ●         │
├──────────────────────────────────────────────────┤
│ • 2 dk önce • Ankara • 50 adet M8 galv. civata  │
│ • 5 dk önce • İzmir  • Bosch GWS 750 taşlama     │
│ • 8 dk önce • Bursa  • 3M FFP2 maske 20 adet     │
│ • 12 dk önce • İstanbul • 100m NYA 2.5mm kablo   │
└──────────────────────────────────────────────────┘
```

Social proof + güven. "Canlı" nokta `--color-success`, pulse animation.
Kişisel veri yok (firma adı değil şehir).

### 3.6 Flaş Fırsatlar (Geri Sayımlı)

Konsept korunur. Sayaç stili aynı kalır ama renk: arkaplan
`--color-neutral-900`, sayı rengi `--color-accent-500`. İndirim rozeti
(%19, %15, %32) bg `--color-accent-500`, yazı `--color-neutral-900`.

### 3.7 Çok Satanlar

Konsept aynı. "X ilan" alt metni → **"Bu ay X adet satıldı"** (gerçek
sipariş verisi, eğer backend destekliyorsa; yoksa "En çok satan").

### 3.8 Kategori Showcase Grid (Anne Bebek, Makyaj tarzı)

Bu bölüm hırdavat kategorileriyle doldurulacak. Her kategori için 4-6
ürünlü 2-col grid. Kategoriler: **El Aletleri**, **Elektrikli Aletler**,
**Bağlantı Elemanları**, **İş Güvenliği** — trafik en yüksek 4 kategori.

### 3.9 Marka Kampanya Kartları — **Kritik Rebrand**

6 renkli kart yapısı korunur ama markalar ve renkler değişir:

| Pozisyon | Eski Marka | Yeni Marka | Arkaplan |
|---|---|---|---|
| 1 | Bioderma (pembe) | **Bosch Professional** | `#005691` (Bosch brand blue) |
| 2 | La Roche Posay (mavi) | **Makita** | `#00A0DC` (Makita cyan) |
| 3 | Avene (yeşil) | **DeWalt** | `#FEBD17` / sarı (DeWalt signature) |
| 4 | Solgar (mor) | **Stanley** | `#FDD900` / siyah (Stanley yellow-black) |
| 5 | Vichy (turuncu) | **3M** | `#FF0000` (3M red) |
| 6 | Nuxe (mor) | **İzeltaş / Ceta Form** | `--color-primary-700` (yerel marka vurgu) |

**Not:** Marka renklerini brand guideline'a uygun kullan. Yazılar daima
kontrast sağlayacak şekilde seç (Stanley'de siyah, diğerlerinde beyaz).

Her kartta: **Marka adı** + **kampanya başlığı** (1 satır) + "Ürünleri İncele →"

### 3.10 Kategori Banner Grid (4'lü)

Aynı yapı. Görseller hırdavat kategorilerine özel:
- El Aletleri (alet duvarı fotoğrafı)
- Elektrikli Aletler (matkap close-up)
- İş Güvenliği (baret + eldiven)
- Bağlantı Elemanları (civata makro)

Arkaplan gradient'ler → sektör renkleri:
- El Aletleri: `--color-primary-700` → `--color-primary-500`
- Elektrikli: `--color-neutral-900` → `--color-neutral-800`
- İş Güvenliği: `--color-accent-600` → `--color-accent-500`
- Bağlantı: `--color-neutral-800` → `--color-primary-700`

### 3.11 Tüm Ürünler Grid

Ürün kartı yapısı tamamen yeniden tasarlanıyor — bkz. **Bölüm 5**.

---

## 4. YENİ SECTIONLAR (i-depo'da yok, eklenecek)

### 4.1 Hızlı Sipariş Kutusu

Trust strip'in hemen altında veya header'da "Hızlı Sipariş" butonu →
modal:

```
┌─────────────────────────────────────────────┐
│  Hızlı Sipariş                              │
│  SKU veya ürün kodu listesini yapıştır      │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │ BSH-GSB550-13-RE  5                   │  │
│  │ M8X20-DIN933-Z    100                 │  │
│  │ MKT-DHP485-18V    2                   │  │
│  │ ...                                    │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  Format: SKU [boşluk/tab] adet, satır başı  │
│                                              │
│  [ Excel'den İçe Aktar ]  [ Sepete Ekle → ] │
└─────────────────────────────────────────────┘
```

Bu özellik hırdavat B2B'sinin "sihirli anı" — eski siparişten SKU
listesini yapıştır, 2 saniyede 50 ürünlü sepet oluşsun.

### 4.2 Son Siparişimi Tekrarla (girişli kullanıcıya)

Anasayfada, giriş yapılmışsa Hero altında tek satır banner:
```
🔄 Son siparişini tekrarla (12 gün önce, 14 kalem) →
```

Click → sepete otomatik doldur, miktarları güncellenebilir.

---

## 5. ÜRÜN KARTI — Tamamen Yeniden

B2B hırdavatta ürün kartı dermokozmetikten **çok daha yoğun**. Stok
adedi, SKU, KDV hariç/dahil, kademeli iskonto, adet seçici — hepsi kart
seviyesinde olmalı.

```
┌──────────────────────────────────────────────────┐
│  [ürün görseli 1:1]             ♡ ⚖             │
│                                                   │
│  BOSCH                         ✓ Stokta: 247    │ ← mono font, tabular
│  GSB 550 RE Darbeli Matkap 13mm 600W             │
│  SKU: BSH-GSB550-13-RE                           │ ← mono font, muted
│                                                   │
│  ─────────────────────────────────────────────   │
│                                                   │
│  Liste: ₺2.450,00                                │ ← üstü çizili, sm
│  Bayi:  ₺1.890,00    KDV Hariç                  │ ← XL bold accent
│         ₺2.230,20    KDV Dahil (%20)            │ ← sm muted
│                                                   │
│  💼 Toplu: 10+ %5  •  50+ %10  •  100+ %15      │ ← badge row
│                                                   │
│  [ − ] [  1  ] [ + ]      [ 🛒 Sepete Ekle ]    │ ← accent button
└──────────────────────────────────────────────────┘
```

### Kart state'leri

| Durum | Stok Göstergesi | Buton |
|---|---|---|
| Normal (>50) | ✓ Stokta: 247 (success color) | Sepete Ekle (accent) |
| Azalıyor (≤20) | ⚠ Son 12 adet (warning color) | Sepete Ekle (accent) |
| Tükenmek üzere (≤5) | ⚠ Son 3 adet! (danger color, bold) | Sepete Ekle (accent) |
| Stok yok | ✗ Tükendi (danger color) | Bekleme Listesi (outline) |
| Ön sipariş | 📦 Ön sipariş, 7 iş günü (info color) | Ön Sipariş Ver (primary) |

### Favori ve Karşılaştırma

Sağ üst köşede iki ikon:
- ♡ Favori (varsa dolu kırmızı, yoksa outline)
- ⚖ Karşılaştırmaya ekle (hırdavatta kritik — alıcı 3-4 alternatifi
  yan yana görmek ister)

**Karşılaştırma özelliği yeni eklenecek.** Sepet gibi floating bir
drawer, kullanıcı max 4 ürün ekler, teknik özellikler tablosu açılır.

### Ürün kart tipi farkları

- **Anasayfa "Günün Fırsatı"**: büyük yatay kart, 50/50 görsel+bilgi
- **Anasayfa ürün şeritleri**: yukarıdaki standart kart, küçültülmüş
- **Kategori sayfası**: standart kart
- **Liste görünümü** (kategori sayfasında toggle): yatay kart, daha fazla
  detay sığar, toplu işlem için checkbox sol

---

## 6. KATEGORİ SAYFASI

Layout iskelet aynen kalır: sol sidebar + sağ grid. Ama **filtreler
dinamik** olacak — her kategoride farklı teknik özellik filtreleri
gösterilecek.

### 6.1 Breadcrumb

```
Pazaryeri / Elektrikli Aletler / Matkaplar / Darbeli Matkaplar
```

Aktif kategori bold, diğerleri muted link.

### 6.2 Sayfa Başlığı

```
Darbeli Matkaplar
1.247 ürün bulundu
```

Sağ tarafta **görünüm toggle**: `[Grid 2'li] [Grid 3'lü] [Liste]` ve
**"Sepete Hızlı Ekle" modu** (checkbox + miktar inputu her kartta).

### 6.3 Sidebar Filtreleri (dinamik)

```
┌─────────────────────────────┐
│ ⚙ FİLTRELER       Temizle    │
├─────────────────────────────┤
│ SIRALAMA                     │
│ ◉ Önerilen                   │
│ ○ En Çok Satan               │
│ ○ Fiyat: Düşük → Yüksek      │
│ ○ Fiyat: Yüksek → Düşük      │
│ ○ Yeni Eklenenler            │
│ ○ Bayi Puanı                 │
├─────────────────────────────┤
│ STOK DURUMU                  │
│ ☑ Stokta Var (1.189)         │
│ ☐ Ön Sipariş (34)            │
│ ☐ Tükenenler (24)            │
├─────────────────────────────┤
│ MARKA          [ara...] 🔍   │
│ ☐ Bosch (423)                │
│ ☐ Makita (312)               │
│ ☐ DeWalt (189)               │
│ ☐ Stanley (98)               │
│ ☐ Milwaukee (67)             │
│ + Tümünü göster              │
├─────────────────────────────┤
│ FİYAT ARALIĞI                │
│ [────●═══════●────]          │
│   500₺          5.000₺       │
│ [ Min ]    [ Max ]           │
├─────────────────────────────┤
│ GÜÇ (Watt)                   │
│ ☐ 0-400W (87)                │
│ ☐ 400-600W (245)             │
│ ☐ 600-800W (412)             │
│ ☐ 800W+ (98)                 │
├─────────────────────────────┤
│ ENERJİ KAYNAĞI               │
│ ☐ Kablolu (220V) (534)       │
│ ☐ Akülü 12V (123)            │
│ ☐ Akülü 18V (287)            │
│ ☐ Akülü 20V+ (156)           │
├─────────────────────────────┤
│ KULLANIM SINIFI              │
│ ☐ Profesyonel (456)          │
│ ☐ Yarı-profesyonel (345)     │
│ ☐ Hobi/Ev tipi (246)         │
├─────────────────────────────┤
│ KAMPANYA                     │
│ ☐ İndirimli (324)            │
│ ☐ Toplu alım iskontolu (198) │
│ ☐ Aynı gün sevkiyat (1.043)  │
└─────────────────────────────┘
```

**Facet'ler (filtre başlıkları)** kategori bazlı değişir:
- Boya kategorisi: "Kaplama Alanı, Kuruma Süresi, Renk"
- Civata kategorisi: "M ölçüsü, Uzunluk, Kafa Tipi, Malzeme, Kaplama"
- Eldiven kategorisi: "Beden, Malzeme, Kesim Koruma Sınıfı, Standart"

Backend'den `filterSchema` per-category çekilmeli (yeni endpoint:
`GET /api/categories/:slug/filters`).

### 6.4 Stok Durumu Rozetleri

Mevcut "Son Birimler" ve "Stokta Yok" rozetlerini genişlet:

| Rozet | Renk | Koşul |
|---|---|---|
| ✓ Stokta | success | qty > 50 |
| ⚠ Son X adet | warning | 5 < qty ≤ 50 |
| ⚠ Son X adet! | danger | 0 < qty ≤ 5 |
| ✗ Tükendi | danger | qty = 0, önsipariş yok |
| 📦 Ön Sipariş | info | qty = 0, önsipariş aktif |

Ürün kartında **sayısal stok mutlaka görünür** — "Son Birimler" yerine
"Son 12 adet" gibi net bilgi. Hırdavatçı müşterisine stok vaadi için net
sayı ister.

---

## 7. SATICI PANELİ — Yapısal Değişiklikler

### 7.1 Dashboard Metrik Kartları

4 kart → **5 kart**. Beşinci kart kritik **Stok Uyarısı**:

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Bu Ay Ciro   │ Bekleyen     │ Cari Bakiye  │ Aktif Ürün   │ ⚠ Stok Uyarı │
│ ₺47.892,50   │ 23 sipariş   │ ₺12.340,00   │ 1.247 ürün   │ 12 kritik     │
│ ↗ %18 (Ay)   │ 7 kargo bek. │ PayTR onayı  │ 34 pasif      │ Hemen gör →  │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

Stok uyarısı kartı **tıklanabilir** — kritik stoklu ürün listesine gider,
bayi hızla stok güncelleyebilir.

### 7.2 Tab Yapısı (7 → 8 tab)

Mevcut: İlanlarım, Siparişlerim, Beğendiklerim, Hesap Hareketlerim,
Destek, Firma İstekleri, Ayarlarım

Yeni:
1. **Ürünlerim** (eski "İlanlarım" — hırdavatta "ürün" daha doğru)
2. **Siparişlerim** (aynı, badge sayısı korunur)
3. **Stok & Fiyat Yönetimi** (YENİ — toplu CSV import, bayi fiyat kademesi)
4. **Hesap Hareketlerim** (aynı)
5. **Müşteri İstekleri** (eski "Firma İstekleri" — teklif/sipariş talepleri)
6. **Destek** (aynı)
7. **Raporlar** (YENİ — satış, ciro, en çok satan, stok devir hızı)
8. **Ayarlarım & Bilgilerim** (aynı)

"Beğendiklerim" satıcı panelinde gerekli değil — kaldırılıyor, alıcı
tarafında kalır.

### 7.3 Sol Sub-Menu (Ayarlar sekmesi içinde)

| Mevcut | Yeni |
|---|---|
| Kullanıcı Bilgilerim | **Firma Bilgilerim** |
| Satış Bilgilerim | ✓ Kalır |
| Adreslerim | **Depo Adresleri** (çoklu, birden fazla depoya destek) |
| Kartlarım | ✓ Kalır |
| Bildirim Tercihleri | ✓ Kalır |
| Güvenlik | ✓ Kalır |
| ERP Entegrasyonları | ✓ Kalır + genişler |
| — | **YENİ: Fiyat Listesi Yönetimi** |
| — | **YENİ: Stok Senkronizasyonu** |
| — | **YENİ: Kargo Hesabı** |

### 7.4 Firma Bilgilerim Formu

Mevcut alanlar değişiyor:

```
DEĞİŞTİRİLEMEZ (sistem onaylı):
- Firma Unvanı
- Vergi Kimlik No (10 hane)       [eski: GLN Kodu, 13 hane]
- Vergi Dairesi
- MERSİS No (16 hane)              [YENİ]
- Ticaret Sicil No                 [YENİ]
- Adres
- İl / İlçe
- E-posta

DEĞİŞTİRİLEBİLİR:
- Gösterim Adı (takma ad)
- Yetkili Kişi Adı
- Cep Telefonu
- Sabit Telefon
- WhatsApp Hattı                   [YENİ]
- Web Sitesi (opsiyonel)
- Sektör (dropdown):               [YENİ]
  • Toptancı / Distribütör
  • Üretici
  • İthalatçı
  • Perakendeci / Bayi
```

**Migration notu:** `sellers` tablosunda `gln_code` kolonu
`tax_number` ve `mersis_no` olarak değişir. Eski GLN validator
(`^\d{13}$`) → yeni validator (`^\d{10}$` VKN ve `^\d{16}$` MERSİS).

### 7.5 ERP Entegrasyonları — Hırdavat Sektörü

Mevcut i-depo'da hangi ERP'ler varsa (muhtemelen BizimHesap ve benzerleri),
hırdavatta baskın olanları ekle:

- **Logo Go 3 / Tiger 3**
- **Mikro Fly / Mikro Jump**
- **Netsis 3 Enterprise**
- **Eta:SQL**
- **Nebim V3**
- **Akinsoft Wolvox**
- **Zirve** (ufak ölçekli firmalar)
- **BizimHesap** (mevcut — korunur)

Her entegrasyon için:
- API key / kullanıcı adı / parola alanları
- Test bağlantısı butonu
- Son senkron zamanı
- Hata logları (son 24 saat)

### 7.6 Ürünlerim Tab'ı — Toplu İşlem Araçları

Mevcut tablo + CRUD korunur ama üstte **toplu işlem bar'ı** eklenir:

```
☑ Tümünü Seç  (187 ürün seçili)

[ Fiyat Güncelle ▼ ] [ Stok Güncelle ▼ ] [ Kategori Değiştir ▼ ]
[ Kampanya Uygula ▼ ] [ Durumunu Değiştir ▼ ] [ Excel'e Aktar ]
[ 🗑 Seçilenleri Sil ]
```

Ve **Excel Import** butonu üstte — hırdavatçı 1.000 ürünü Excel'den toplu
yükler:
```
📤 Excel ile Toplu Yükle
   Şablon indir → Doldur → Yükle → Eşleştir → Onayla
```

---

## 8. MOBİL VE RESPONSIVE

Mevcut breakpoint'ler korunur. Hırdavat B2B alıcısı **depoda mobil
kullanır** — şu kritik:

- Arama çubuğu mobilde **üstte sabit** (sticky)
- Barkod/SKU scanner **kamera erişimli** (yeni feature, opsiyonel)
- Hızlı Sipariş modülü mobilde **bottom sheet** olarak açılır
- Ürün kartında stok adedi ve SKU masaüstünde kadar prominent olmalı

---

## 9. DEPENDENCY DEĞİŞİKLİKLERİ

**Muhtemelen eklenecek:**
- `papaparse` — Excel/CSV import için (Hızlı Sipariş ve toplu ürün yükleme)
- `qrcode.react` — SKU QR üretimi (ürün detay sayfasında, depo workflow)

**Muhtemelen kaldırılabilir:**
- Hiçbir şey — mevcut stack zaten yeterli

Yeni dependency eklerken önce `package.json`'a not düş, onay beklemeden
`npm install` etme.

---

## 10. YAPMAMAN GEREKENLER — KATI LİSTE

1. ❌ Backend API'lerinin request/response şemalarını değiştirme
   (tek istisna: `gln` → `taxNumber` alan adı)
2. ❌ Auth middleware, session, JWT yapısını değiştirme
3. ❌ PayTR entegrasyon kodunu değiştirme
4. ❌ Aras Kargo / BizimHesap entegrasyon kodunu değiştirme
5. ❌ Yeni route/sayfa oluşturma (mevcut route'ları giydir)
6. ❌ CSS gradient, glass effect, neumorphism kullanma (keskin, flat, endüstriyel)
7. ❌ Emoji'leri UI'da decoration olarak kullanma (ikon set kullan: Lucide / Heroicons)
8. ❌ Turkuaz/pembe/mint renkleri UI'da bırakma — **hepsi token'lar üzerinden**
9. ❌ 12px+ border radius kullanma
10. ❌ Dermokozmetik terminolojisini yanlışlıkla bırakma (arama: "eczane",
    "pharma", "cream", "krem", "serum" geçen UI string'leri kontrol et)

---

## 11. KONTROL LİSTESİ — Teslimden Önce

- [ ] `grep -r "GLN\|gln\|eczane\|Eczane\|pharma"` → sadece backend
      migration/legacy yerlerde kalmalı, UI'da hiç yok
- [ ] `grep -r "#1DB5C4\|turkuaz\|cyan-\|pink-"` → tailwind utility
      class'ları kontrol et, hepsi token'a geçmiş olmalı
- [ ] Lighthouse skorları mevcut seviyeyi korumalı (Performance,
      Accessibility, SEO)
- [ ] Mobil görünümde header, arama, mega menu ve ürün kartı sağlıklı
- [ ] Satıcı paneli — tüm formlar submit çalışıyor
- [ ] Test hesabıyla tam sipariş akışı: arama → sepet → ödeme → kargo
- [ ] Karşılaştırma özelliği floating drawer çalışıyor
- [ ] Hızlı Sipariş modülü SKU eşleştirme mantığı doğru

---

## 12. REFERANS SİTELER — Tonla ilham almak için

- **wurth.com.tr** — B2B hırdavat ton, kategori yapısı, fiyat gösterimi
- **kocpro.koctas.com.tr** — Türk B2B kullanıcı alışkanlıkları
- **rs-online.com/tr** — Teknik filtre yapısı, SKU-centric UX
- **grainger.com** — Dashboard ve toplu sipariş flow
- **screwfix.com** — Mobil UX, hızlı arama

**NE TAKLİT ETMEYECEĞİZ:** Bu sitelerin görsel stilini birebir
kopyalamak. Token'ları "Industrial Pro"da kalır. Sadece UX pattern'leri
ve bilgi yoğunluğu için referans.

---

## 13. İLETİŞİM

Bu dokümanı Claude Code'a verirken, her major değişiklik öncesi "plan
göster, uygulama için onay bekle" modunda çalıştır. Migration gerektiren
değişiklikler (GLN → Vergi No) için özel onay al.

Çalışma sırası önerisi:
1. Design token'lar (tailwind.config + global.css)
2. Global komponentler (Header, TopBar, MegaMenu, Footer)
3. Ürün kartı (her yerde kullanıldığı için önce tek komponent hazır olmalı)
4. Anasayfa section'ları (yukarıdan aşağıya)
5. Kategori sayfası (filter schema dahil)
6. Satıcı paneli (dashboard, ürünlerim, yeni tab'lar)
7. Migration ve seed güncellemeleri
8. Regresyon testi