# Market ve Landing Tasarım Fikirleri

## Amaç

Bu doküman, mevcut i-hırdavat arayüzünü kökten değiştirmeden daha sade, şık ve canlı bir B2B deneyime taşımak için tasarım yönünü tanımlar. Uygulama sırası önce **Market Anasayfa**, sonra **Landing Page** olacak.

## Ortak Görsel Dil

- Ana karakter: kurumsal, net, hızlı satın almaya odaklı B2B hırdavat pazaryeri.
- Renk sistemi: koyu lacivert marka zemini, beyaz içerik yüzeyleri, açık gri sayfa zemini, amber vurgu.
- UI geometrisi: küçük radius, net sınırlar, hafif gölge; fazla yuvarlak, dekoratif ve kart üstüne kart hissinden kaçın.
- Görsel kullanım: gerçek hırdavat ürünleri, kategori görselleri, marka logoları ve ürün cutout’ları. Soyut gradient/orb dekorasyon kullanılmamalı.
- Tipografi: güçlü ama sıkı başlıklar, okunabilir gövde metni, ürün ve fiyat alanlarında yoğun ama düzenli bilgi mimarisi.

## 1. Market Anasayfa Tasarım Yönü

Market anasayfa, alıcının hızlı ürün bulduğu ve teklif karşılaştırdığı operasyon ekranı gibi hissettirmeli. Mevcut akışta `HeroSlider`, güven rozetleri, ürün listesi ve kategori banner’ı var. Yeni tasarım bu yapının üstüne daha işlevsel bir ilk ekran eklemeli.

### İlk Ekran

Hero alanı klasik kampanya slider’ı gibi değil, B2B alım paneli gibi çalışmalı:

- Sol tarafta büyük ve net arama alanı: “SKU, barkod veya ürün adı ara”.
- Aramanın altında hızlı girişler: “Matkap”, “Civata”, “İş güvenliği”, “Kablo”.
- Sağ tarafta kompakt “Hızlı Sipariş” paneli: SKU listesi yapıştırma, barkodla arama, Excel/CSV toplu sipariş bağlantısı.
- Alt bantta kısa güven sinyalleri: aynı gün kargo, çok teklifli ürünler, bayi fiyatları, stokta ürünler.

### Kategori Keşfi

Ürün listesinden önce yatay, görselli kategori şeridi eklenmeli:

- El Aletleri
- Elektrikli Aletler
- Bağlantı Elemanları
- Tesisat & Su
- Elektrik Malzemeleri
- İş Güvenliği

Her kategori küçük ürün görseli, kısa başlık ve ürün sayısı ile gösterilebilir. Bu alan canlılık verir ama sayfayı ağırlaştırmamalı.

### Ürün ve Teklif Alanı

Mevcut ürün kartları korunabilir, ancak bilgi hiyerarşisi güçlendirilmeli:

- “En düşük teklif” en güçlü fiyat alanı olmalı.
- PSF daha ikincil görünmeli.
- Stok ve teklif sayısı hızlı okunmalı.
- Karşılaştırma ve favori ikonları kompakt kalmalı.
- Liste üstünde filtreler sade bir toolbar olarak sunulmalı.

### Ek Bölüm Fikirleri

- “Bugün Avantajlı Teklifler”: PSF’ye göre avantajlı ürünler.
- “Çok Teklifli Ürünler”: fiyat karşılaştırmaya uygun ürünler.
- “Popüler Markalar”: Bosch, Makita, DeWalt, Stanley, 3M, İzeltaş.
- “Tekrar Sipariş”: daha sonra kullanıcı geçmişine bağlanabilecek sade bir panel.

## Market Uygulama Sırası

1. İlk ekranı yeniden tasarla: arama + hızlı sipariş + güven sinyalleri.
2. Kategori keşif şeridini ekle.
3. Ürün liste başlığını ve filtre toolbar’ını sadeleştir.
4. Ürün kartı bilgi hiyerarşisini iyileştir.
5. Marka ve avantajlı teklif bölümlerini ekle.

## 2. Landing Page Tasarım Yönü

Landing page, marketten farklı olarak kayıt dönüşümüne ve güven oluşturmaya odaklanmalı. Daha az ürün yoğunluğu, daha fazla değer önerisi ve kurumsal güven kullanılmalı.

### İlk Ekran

- H1: “Bayi fiyatlı hırdavat tedariki tek panelde” gibi net bir teklif.
- Alt metin: alıcı ve satıcıların aynı platformda teklif, stok, ödeme ve kargo süreçlerini yönettiğini anlatmalı.
- CTA: “Ücretsiz Bayi Kaydı” ve “Pazaryeri’ni İncele”.
- Görsel: depo rafları, ürün cutout’ları ve küçük dashboard mockup birleşimi.

### Bölüm Akışı

1. Nasıl çalışır: firma doğrulama, ürün/teklif keşfi, sipariş/kargo/fatura.
2. Alıcı ve satıcı avantajları: iki kolonlu sade karşılaştırma.
3. Operasyon güveni: PayTR, e-fatura, kargo, ERP entegrasyonları.
4. Sosyal kanıt: SKU sayısı, doğrulanmış satıcılar, aynı gün kargo oranı.
5. Kapanış CTA: kayıt ve giriş aksiyonları.

## Landing Uygulama Sırası

Market anasayfa netleştikten sonra landing tarafında önce hero ve “Nasıl çalışır” bölümü ele alınmalı. Ardından avantajlar, sosyal kanıt ve CTA bölümleri aynı görsel sisteme çekilmeli.
