<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

/**
 * Yardim Merkezi sayfalarini idempotent olarak ekler.
 *
 * Slug semasi: URL yolu hyphen-cased
 *   /yardim                                        -> yardim
 *   /yardim/baslarken                              -> yardim-baslarken
 *   /yardim/alici-rehberi/fiyat-karsilastirma      -> yardim-alici-rehberi-fiyat-karsilastirma
 *   /yardim/alici-rehberi/sepet-odeme              -> yardim-alici-rehberi-sepet-odeme
 *   /yardim/alici-rehberi/siparis-takibi           -> yardim-alici-rehberi-siparis-takibi
 *   /yardim/satici-rehberi/urun-ekleme             -> yardim-satici-rehberi-urun-ekleme
 *   /yardim/satici-rehberi/fiyat-stok              -> yardim-satici-rehberi-fiyat-stok
 *   /yardim/satici-rehberi/siparis-yonetimi        -> yardim-satici-rehberi-siparis-yonetimi
 *   /yardim/satici-rehberi/hakedis                 -> yardim-satici-rehberi-hakedis
 */
class YardimPagesSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->pages() as $page) {
            Page::updateOrCreate(
                ['slug' => $page['slug']],
                array_merge($page, [
                    'template' => 'default',
                    'status' => 'published',
                ]),
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function pages(): array
    {
        return [
            [
                'slug' => 'yardim',
                'title' => 'Yardım Merkezi',
                'sort_order' => 100,
                'meta_title' => 'Yardım Merkezi — i-hırdavat',
                'meta_description' => 'i-hırdavat kullanım kılavuzları, satıcı ve alıcı rehberleri.',
                'excerpt' => 'i-hırdavat kullanımı hakkında aradığınız tüm bilgiler burada. Alıcı ve satıcı süreçleri için hazırlanmış rehberlerden seçim yapabilirsiniz.',
                'content' => $this->indexContent(),
            ],
            [
                'slug' => 'yardim-baslarken',
                'title' => 'Bayi Kaydı ve Doğrulama',
                'sort_order' => 101,
                'meta_title' => 'Bayi Kaydı ve Doğrulama — i-hırdavat Yardım',
                'meta_description' => "i-hırdavat'a nasıl bayi kaydı yapılır? VKN, MERSİS ve Ticaret Sicil No ile doğrulama adımları.",
                'excerpt' => 'i-hırdavat, kurumsal alıcı ve satıcıların tek platformda buluştuğu B2B hırdavat pazaryeridir. Platforma kayıt olmak için firma bilgilerinizi (VKN + MERSİS) ile doğrulamanız gerekir.',
                'content' => $this->baslarkenContent(),
            ],
            [
                'slug' => 'yardim-alici-rehberi-fiyat-karsilastirma',
                'title' => 'En Uygun Fiyatı Bulma',
                'sort_order' => 110,
                'meta_title' => 'En Uygun Fiyatı Bulma — i-hırdavat Yardım',
                'meta_description' => "i-hırdavat'ta en uygun fiyatı nasıl bulursunuz? Fiyat karşılaştırma rehberi.",
                'excerpt' => 'i-hırdavat, aynı ürün için birden fazla satıcının tekliflerini görmenizi sağlar. Karşılaştırma yaparak en uygun fiyatı kolayca bulabilirsiniz.',
                'content' => $this->fiyatKarsilastirmaContent(),
            ],
            [
                'slug' => 'yardim-alici-rehberi-sepet-odeme',
                'title' => 'Sepet ve Ödeme Adımları',
                'sort_order' => 111,
                'meta_title' => 'Sepet ve Ödeme — i-hırdavat Yardım',
                'meta_description' => "i-hırdavat'ta sepet oluşturma ve ödeme işlemleri nasıl yapılır?",
                'excerpt' => 'Sepete eklediğiniz ürünleri güvenli bir şekilde satın alabilirsiniz. Birden fazla satıcıdan ürün ekleyip tek seferde ödeme yapabilirsiniz.',
                'content' => $this->sepetOdemeContent(),
            ],
            [
                'slug' => 'yardim-alici-rehberi-siparis-takibi',
                'title' => 'Sipariş Takibi',
                'sort_order' => 112,
                'meta_title' => 'Sipariş Takibi — i-hırdavat Yardım',
                'meta_description' => "i-hırdavat'ta siparişlerinizi nasıl takip edersiniz?",
                'excerpt' => 'Siparişlerinizi "Siparişlerim" sayfasından anlık olarak takip edebilirsiniz. Kargo durumu değişikliklerinde bildirim alırsınız.',
                'content' => $this->siparisTakibiContent(),
            ],
            [
                'slug' => 'yardim-satici-rehberi-urun-ekleme',
                'title' => 'Ürün Ekleme ve Teklif Oluşturma',
                'sort_order' => 120,
                'meta_title' => 'Ürün Ekleme — i-hırdavat Yardım',
                'meta_description' => "i-hırdavat'ta nasıl ürün eklenir ve teklif oluşturulur?",
                'excerpt' => "i-hırdavat'ta ürün satışı yapmak için önce teklif oluşturmanız gerekmektedir. Her teklif bir ürün, stok miktarı ve birim fiyat içerir.",
                'content' => $this->urunEklemeContent(),
            ],
            [
                'slug' => 'yardim-satici-rehberi-fiyat-stok',
                'title' => 'Fiyat ve Stok Güncelleme',
                'sort_order' => 121,
                'meta_title' => 'Fiyat ve Stok Güncelleme — i-hırdavat Yardım',
                'meta_description' => "i-hırdavat'ta tekliflerinizin fiyat ve stok bilgilerini nasıl güncellersiniz?",
                'excerpt' => 'Aktif tekliflerinizin fiyat ve stok bilgilerini istediğiniz zaman güncelleyebilirsiniz. Rekabetçi kalmak için piyasa fiyatlarını takip etmenizi öneririz.',
                'content' => $this->fiyatStokContent(),
            ],
            [
                'slug' => 'yardim-satici-rehberi-siparis-yonetimi',
                'title' => 'Sipariş Yönetimi ve Kargo',
                'sort_order' => 122,
                'meta_title' => 'Sipariş Yönetimi ve Kargo — i-hırdavat Yardım',
                'meta_description' => "i-hırdavat'ta satıcı olarak siparişleri nasıl yönetir ve kargoya verirsiniz?",
                'excerpt' => 'Tekliflerinize sipariş geldiğinde bildirim alacaksınız. Siparişleri zamanında hazırlayıp kargoya vermek, başarılı satıcı puanı için kritik öneme sahiptir.',
                'content' => $this->siparisYonetimiContent(),
            ],
            [
                'slug' => 'yardim-satici-rehberi-hakedis',
                'title' => 'Ödeme Talebi ve Hakedişler',
                'sort_order' => 123,
                'meta_title' => 'Hakedişler — i-hırdavat Yardım',
                'meta_description' => "i-hırdavat'ta satış hakedişlerinizi nasıl çekersiniz?",
                'excerpt' => 'Satışlarınızdan elde ettiğiniz gelir, sabit ₺50 hizmet bedeli düşüldükten sonra cüzdanınıza aktarılır. Cüzdan bakiyenizi istediğiniz zaman banka hesabınıza çekebilirsiniz.',
                'content' => $this->hakedisContent(),
            ],
        ];
    }

    private function indexContent(): string
    {
        return <<<'HTML'
<h2>Yardım Konuları</h2>
<p>i-hırdavat kullanımı hakkında aradığınız tüm bilgiler burada. Alıcı ve satıcı süreçleri için hazırlanmış rehberlerden seçim yapabilirsiniz.</p>

<h3>Hızlı Erişim</h3>
<ul>
<li><strong>Başlarken:</strong> Firma bilgileri ve bayi kayıt adımları.</li>
<li><strong>Satıcı Rehberi:</strong> Ürün listeleme, sipariş yönetimi, hakedişler.</li>
<li><strong>Alıcı Rehberi:</strong> Ürün arama, fiyat karşılaştırma, sipariş takibi.</li>
</ul>

<h3>Sık Sorulan Sorular</h3>
<ul>
<li><a href="/yardim/baslarken">VKN'mı nereden bulabilirim?</a></li>
<li><a href="/yardim/satici-rehberi/urun-ekleme">Nasıl ürün eklerim?</a></li>
<li><a href="/yardim/satici-rehberi/hakedis">Hakedişimi nasıl çekerim?</a></li>
<li><a href="/yardim/alici-rehberi/sepet-odeme">Sipariş nasıl veririm?</a></li>
<li><a href="/yardim/alici-rehberi/siparis-takibi">Kargo takibi nasıl yapılır?</a></li>
</ul>

<h3>Aradığınızı Bulamadınız Mı?</h3>
<p>Destek ekibimiz size yardımcı olmak için hazır. <a href="mailto:destek@i-hirdavat.com">destek@i-hirdavat.com</a> adresinden bize ulaşabilirsiniz.</p>
HTML;
    }

    private function baslarkenContent(): string
    {
        return <<<'HTML'
<p>i-hırdavat, kurumsal alıcı ve satıcıların tek platformda buluştuğu B2B hırdavat pazaryeridir. Platforma kayıt olmak için firma bilgilerinizi (<strong>VKN + MERSİS</strong>) ile doğrulamanız gerekir.</p>

<h2>VKN (Vergi Kimlik Numarası) Nedir?</h2>
<p>VKN, Türkiye'de tüzel kişilere verilen <strong>10 haneli vergi kimlik numarasıdır</strong>. Şahıs şirketleri için TCKN kullanılırken, limited ve anonim şirketler için VKN zorunludur.</p>

<h3>VKN'nizi Nereden Bulabilirsiniz?</h3>
<ul>
<li>İmza sirküleriniz ve vergi levhanız üzerinde</li>
<li>e-Devlet üzerinden "Vergi Levhası Sorgulama" servisinde</li>
<li>Mali müşavirinizden talep edebilirsiniz</li>
</ul>

<h2>MERSİS No Nedir?</h2>
<p>MERSİS (Merkezi Sicil Kayıt Sistemi), Gümrük ve Ticaret Bakanlığı tarafından işletilen ve tüm tüzel kişilere verilen <strong>16 haneli benzersiz kimlik numarasıdır</strong>. Ticaret sicil kaydınızla otomatik olarak üretilir.</p>

<h2>Kayıt Adımları</h2>
<ol>
<li><strong>Hesap Tipinizi Seçin —</strong> Bayi / Satıcı (ürün satmak ve satın almak için) veya Kurumsal Alıcı (sadece satın almak için).</li>
<li><strong>Firma Bilgilerinizi Girin —</strong> Firma ünvanı, VKN (10 hane), MERSİS (16 hane), Ticaret Sicil No ve vergi dairesi bilgilerinizi girin. Sistem bu bilgileri otomatik olarak doğrular.</li>
<li><strong>İletişim ve Adres —</strong> Firma adresi (ticari sicil kaydınızla uyumlu), telefon, WhatsApp hattı ve web sitesi gibi iletişim bilgilerinizi ekleyin.</li>
<li><strong>Sözleşme Onayı —</strong> B2B bayi sözleşmesini onaylayın. Dijital imzanızla sözleşme aktifleşir.</li>
<li><strong>Hesabınız Aktif —</strong> Ürün listelemeye, sipariş vermeye ve B2B pazaryerinin avantajlarından yararlanmaya başlayın.</li>
</ol>

<h2>Güvenlik ve Doğrulama</h2>
<p>Sadece doğrulanmış firma hesapları ürün listeleyebilir ve sipariş verebilir. Bu, platformun kurumsal güvenilirliğini korur.</p>

<h2>Kayıt Sırasında Sorun mu Yaşıyorsunuz?</h2>
<p>VKN veya MERSİS doğrulaması başarısız oluyorsa <a href="/iletisim">destek ekibimizle iletişime geçin</a>. 24 saat içinde yanıt veriyoruz.</p>
HTML;
    }

    private function fiyatKarsilastirmaContent(): string
    {
        return <<<'HTML'
<p>i-hırdavat, aynı ürün için birden fazla satıcının tekliflerini görmenizi sağlar. Karşılaştırma yaparak en uygun fiyatı kolayca bulabilirsiniz.</p>

<h2>Ürün Arama</h2>
<h3>Arama Yöntemleri</h3>
<ul>
<li><strong>Ürün adı:</strong> En az 3 karakter yazarak arama yapın.</li>
<li><strong>Barkod:</strong> Barkod numarası ile doğrudan arama.</li>
<li><strong>Kategori:</strong> El aletleri, elektrikli aletler, bağlantı elemanları gibi kategorilerden göz atın.</li>
</ul>

<h2>Fiyat Karşılaştırma</h2>
<p>Ürün sayfasına gittiğinizde, o ürün için mevcut tüm teklifleri görebilirsiniz. Her teklif şu bilgileri içerir:</p>
<ul>
<li><strong>Satıcı Bilgisi:</strong> Satıcı adı ve puanı.</li>
<li><strong>Birim Fiyat:</strong> KDV dahil satış fiyatı.</li>
<li><strong>Stok Durumu:</strong> Mevcut miktar.</li>
<li><strong>Kargo / Vade:</strong> Teslimat süresi ve ödeme koşulları.</li>
</ul>

<h2>Filtreleme ve Sıralama</h2>
<ul>
<li><strong>Fiyata göre sıralama:</strong> En düşükten en yükseğe veya tam tersi.</li>
<li><strong>Stok filtresi:</strong> Belirli miktarın üzerindeki teklifleri gösterin.</li>
<li><strong>Satıcı puanı:</strong> Yüksek puanlı satıcıları tercih edin.</li>
<li><strong>Aynı gün sevkiyat:</strong> 16:00'a kadar siparişlerde aynı gün kargolanan teklifler.</li>
</ul>

<h2>Alışveriş İpuçları</h2>
<ul>
<li>En düşük fiyat her zaman en iyi seçenek olmayabilir; satıcı puanını kontrol edin.</li>
<li>Aynı satıcıdan birden fazla ürün alarak kargo tasarrufu yapabilirsiniz.</li>
<li>Toplu alımda iskontolu fiyatlar için satıcıyla teklif oluşturabilirsiniz.</li>
</ul>
HTML;
    }

    private function sepetOdemeContent(): string
    {
        return <<<'HTML'
<p>Sepete eklediğiniz ürünleri güvenli bir şekilde satın alabilirsiniz. Birden fazla satıcıdan ürün ekleyebilir, tek seferde ödeme yapabilirsiniz.</p>

<h2>Sepete Ürün Ekleme</h2>
<ol>
<li>Ürün sayfasından istediğiniz teklifi seçin.</li>
<li>Almak istediğiniz miktarı girin.</li>
<li>"Sepete Ekle" butonuna tıklayın.</li>
</ol>
<p><strong>İpucu:</strong> Farklı satıcılardan ürün ekleyebilirsiniz. Her satıcı için ayrı kargo ücreti uygulanabilir.</p>

<h2>Sepet Görüntüleme</h2>
<p>Sağ üstteki sepet ikonuna tıklayarak sepetinizi görüntüleyebilirsiniz. Sepet sayfasında:</p>
<ul>
<li>Ürünlerin miktarını değiştirebilirsiniz.</li>
<li>Ürün çıkarabilirsiniz.</li>
<li>Kargo ve toplam tutarı görebilirsiniz.</li>
</ul>

<h2>Ödeme Adımları</h2>
<h3>1. Teslimat Adresi</h3>
<p>Kayıtlı firma adresiniz varsayılan teslimat adresi olarak gelir. Farklı bir adres ekleyebilir veya düzenleyebilirsiniz.</p>

<h3>2. Ödeme Yöntemi</h3>
<ul>
<li><strong>Kredi/Banka Kartı:</strong> Anında ödeme, 3D Secure güvenliği.</li>
<li><strong>Havale/EFT:</strong> Banka transferi, doğrulama sonrası gönderim.</li>
</ul>

<h2>Güvenli Ödeme</h2>
<ul>
<li>Tüm ödemeler 256-bit SSL ile şifrelenir.</li>
<li>Kart bilgileriniz saklanmaz.</li>
<li>3D Secure doğrulama ile ek güvenlik.</li>
</ul>

<h2>Önemli Bilgiler</h2>
<ul>
<li>Sipariş onaylandıktan sonra iptal için satıcıyla iletişime geçin.</li>
<li>Havale/EFT ödemelerinde 24 saat içinde ödeme yapılmalıdır.</li>
</ul>
HTML;
    }

    private function siparisTakibiContent(): string
    {
        return <<<'HTML'
<p>Siparişlerinizi "Siparişlerim" sayfasından anlık olarak takip edebilirsiniz. Kargo durumu değişikliklerinde bildirim alırsınız.</p>

<h2>Siparişlerinize Erişim</h2>
<p><strong>Hesabım &gt; Siparişlerim</strong> yolunu izleyerek tüm siparişlerinizi görüntüleyebilirsiniz.</p>

<h2>Sipariş Durumları</h2>
<ul>
<li><strong>Ödeme Bekleniyor:</strong> Havale/EFT ödemesi bekleniyor.</li>
<li><strong>Hazırlanıyor:</strong> Satıcı siparişi hazırlıyor.</li>
<li><strong>Kargoda:</strong> Kargo firması tarafından taşınıyor.</li>
<li><strong>Dağıtımda:</strong> Teslimat için yola çıktı.</li>
<li><strong>Teslim Edildi:</strong> Sipariş başarıyla teslim alındı.</li>
</ul>

<h2>Kargo Takibi</h2>
<p>Sipariş kargoya verildiğinde takip numarası siparişinize eklenir. Bu numara ile kargo firmasının sitesinden de takip yapabilirsiniz.</p>
<ul>
<li>Sipariş detay sayfasında "Kargo Takibi" butonuna tıklayın.</li>
<li>Anlık konum ve tahmini teslimat tarihi gösterilir.</li>
<li>Tüm kargo hareketleri kronolojik olarak listelenir.</li>
</ul>

<h2>Bildirimler</h2>
<ul>
<li>Sipariş durumu değiştiğinde e-posta alırsınız.</li>
<li>Kargo yola çıktığında SMS bildirimi (opsiyonel).</li>
<li>PWA push bildirimleri (izin verdiyseniz).</li>
</ul>

<h2>Teslimat Sonrası</h2>
<p>Siparişiniz teslim edildikten sonra:</p>
<ul>
<li>Teslimat onayı yapmanız istenir (7 gün otomatik onay).</li>
<li>Satıcıyı puanlayabilirsiniz.</li>
<li>Sorun varsa destek talebi oluşturabilirsiniz.</li>
</ul>
HTML;
    }

    private function urunEklemeContent(): string
    {
        return <<<'HTML'
<p>i-hırdavat'ta ürün satışı yapmak için önce teklif oluşturmanız gerekmektedir. Her teklif bir ürün, stok miktarı ve birim fiyat içerir.</p>

<h2>Ürün Ekleme Adımları</h2>

<h3>1. Ürün Seçimi</h3>
<p><strong>Satıcı Paneli &gt; Ürünlerim &gt; Yeni Teklif</strong> yolunu izleyin. Açılan formda ürün adı veya barkod ile arama yapın.</p>
<p><strong>Ürün Arama Yöntemleri:</strong></p>
<ul>
<li>Ürün adının ilk 3+ harfini yazarak arama.</li>
<li>Barkod numarası ile doğrudan arama.</li>
<li>Kategori filtresi ile daraltma.</li>
</ul>

<h3>2. Stok ve Fiyat Bilgisi</h3>
<p>Ürünü seçtikten sonra stok miktarını ve birim satış fiyatını girin.</p>
<ul>
<li><strong>Stok Miktarı:</strong> Satışa sunmak istediğiniz adet sayısı.</li>
<li><strong>Birim Fiyat:</strong> KDV hariç birim satış fiyatı (₺).</li>
</ul>

<h3>3. Kargo Bilgileri</h3>
<p>Aynı gün sevkiyat seçeneğini ürün bazında tanımlayabilirsiniz. Bu bilgi alıcıya teklif satırında gösterilir.</p>

<h2>Teklif Yayınlama</h2>
<p>Tüm bilgileri girdikten sonra "Teklifi Yayınla" butonuna tıklayın. Teklifiniz anında diğer bayilere görünür hale gelecektir.</p>

<h2>Başarılı Satış İçin İpuçları</h2>
<ul>
<li>Rekabetçi fiyat belirleyin — sistem size piyasa ortalamalarını gösterir.</li>
<li>Stok bilgisini güncel tutun — yanlış stok bilgisi olumsuz değerlendirmeye yol açar.</li>
<li>Açıklama alanını kullanarak ekstra bilgi verin.</li>
<li>Toplu alımda iskonto sunarak hacimli sipariş çekin.</li>
</ul>
HTML;
    }

    private function fiyatStokContent(): string
    {
        return <<<'HTML'
<p>Aktif tekliflerinizin fiyat ve stok bilgilerini istediğiniz zaman güncelleyebilirsiniz. Rekabetçi kalmak için piyasa fiyatlarını takip etmenizi öneririz.</p>

<h2>Tekliflerinize Erişim</h2>
<p><strong>Satıcı Paneli &gt; Ürünlerim</strong> menüsünden tüm aktif ve pasif tekliflerinizi görebilirsiniz.</p>

<h3>Teklif Durumları</h3>
<ul>
<li><strong>Aktif:</strong> Satışta, alıcılara görünür.</li>
<li><strong>Stok Bitti:</strong> Stok eklenince aktifleşir.</li>
<li><strong>Pasif:</strong> Elle durdurulmuş.</li>
</ul>

<h2>Fiyat Güncelleme</h2>
<ol>
<li>Tekliflerim sayfasından ilgili teklifi bulun.</li>
<li>"Düzenle" butonuna tıklayın.</li>
<li>Yeni fiyatı girin ve kaydedin.</li>
</ol>
<p>Fiyat değişikliği anında uygulanır ve alıcılara yeni fiyat gösterilir.</p>

<h3>Piyasa Fiyatı Takibi</h3>
<p>Ürün sayfalarında piyasa ortalaması ve en düşük fiyat bilgisi gösterilir. Bu bilgiyi kullanarak rekabetçi fiyatlandırma yapabilirsiniz.</p>

<h2>Stok Güncelleme</h2>
<p>Stok miktarını artırabilir veya azaltabilirsiniz. Stok 0'a düştüğünde teklif otomatik olarak "Stok Bitti" durumuna geçer. Sipariş alındığında stok otomatik olarak düşer; manuel güncelleme yapmanıza gerek yoktur.</p>

<h2>Stok Yönetimi İpuçları</h2>
<ul>
<li>Günlük olarak stoklarınızı kontrol edin.</li>
<li>Satamayacağınız ürünleri hemen pasife alın.</li>
<li>Yanlış stok bilgisi olumsuz puanlamaya yol açar.</li>
<li>ERP entegrasyonu ile otomatik stok senkronizasyonu yapabilirsiniz.</li>
</ul>
HTML;
    }

    private function siparisYonetimiContent(): string
    {
        return <<<'HTML'
<p>Tekliflerinize sipariş geldiğinde bildirim alacaksınız. Siparişleri zamanında hazırlayıp kargoya vermek, başarılı satıcı puanı için kritik öneme sahiptir.</p>

<h2>Sipariş Bildirimleri</h2>
<p>Yeni sipariş aldığınızda:</p>
<ul>
<li>E-posta ile bildirim gönderilir.</li>
<li>Satıcı panelinde "Yeni Siparişler" sayacı güncellenir.</li>
<li>PWA bildirimi gönderilir (izin verdiyseniz).</li>
</ul>

<h2>Sipariş Durumları</h2>
<ul>
<li><strong>Beklemede:</strong> Yeni sipariş, hazırlanmayı bekliyor.</li>
<li><strong>Hazırlanıyor:</strong> Sipariş hazırlık aşamasında.</li>
<li><strong>Kargoda:</strong> Kargoya verildi, yolda.</li>
<li><strong>Teslim Edildi:</strong> Alıcıya ulaştı.</li>
<li><strong>İptal:</strong> Sipariş iptal edildi.</li>
</ul>

<h2>Kargoya Verme Süreci</h2>
<h3>1. Siparişi Hazırlayın</h3>
<p>Ürünleri dikkatlice paketleyin. SKU ve adet bilgilerinin siparişteki ile eşleştiğinden emin olun.</p>

<h3>2. Kargo Etiketi Oluşturun</h3>
<p>Sipariş detay sayfasında "Kargoya Ver" butonuna tıklayın. Sistem otomatik olarak kargo etiketi oluşturur.</p>
<p><strong>Entegre Kargo Firmaları:</strong> Aras Kargo, Yurtiçi, MNG, PTT, Sürat ve daha fazlası.</p>

<h3>3. Takip Numarasını Girin</h3>
<p>Kargo firmasından aldığınız takip numarasını sisteme girin. Alıcı otomatik olarak bilgilendirilir ve kargo takibi yapabilir.</p>

<h2>Süre Limitleri</h2>
<ul>
<li>Siparişler <strong>48 saat</strong> içinde kargoya verilmelidir.</li>
<li>Gecikmeler satıcı puanınızı olumsuz etkiler.</li>
<li>Kargolanamayacak siparişleri hemen iptal edin.</li>
</ul>
HTML;
    }

    private function hakedisContent(): string
    {
        return <<<'HTML'
<p>Satışlarınızdan elde ettiğiniz gelir, sabit ₺50 hizmet bedeli düşüldükten sonra cüzdanınıza aktarılır. Cüzdan bakiyenizi istediğiniz zaman banka hesabınıza çekebilirsiniz.</p>

<h2>Hakediş Süreci</h2>
<ol>
<li><strong>Sipariş Tamamlanır:</strong> Alıcı siparişi teslim alır veya 7 gün geçer.</li>
<li><strong>Hizmet Bedeli Kesintisi:</strong> Sabit ₺50 hizmet bedeli düşülür.</li>
<li><strong>Cüzdana Aktarım:</strong> Net tutar cüzdan bakiyenize eklenir.</li>
<li><strong>Ödeme Talebi:</strong> İstediğiniz zaman banka hesabınıza çekin.</li>
</ol>

<h2>Cüzdan Yönetimi</h2>
<h3>Bakiye Görüntüleme</h3>
<p>Satıcı Paneli &gt; Hesap Hareketlerim menüsünden mevcut bakiyenizi, bekleyen hakedişlerinizi ve geçmiş işlemlerinizi görüntüleyebilirsiniz.</p>

<h3>Banka Hesabı Ekleme</h3>
<p>Ödeme almak için en az bir banka hesabı tanımlamanız gerekir. Birden fazla hesap ekleyebilir ve varsayılan hesap seçebilirsiniz.</p>

<h2>Ödeme Talebi Oluşturma</h2>
<ol>
<li>Hesap Hareketleri sayfasında "Ödeme Talebi Oluştur" butonuna tıklayın.</li>
<li>Çekmek istediğiniz tutarı girin.</li>
<li>Banka hesabınızı seçin.</li>
<li>Talebi onaylayın.</li>
</ol>

<h2>Ödeme Koşulları</h2>
<ul>
<li>Minimum çekim tutarı: <strong>₺100</strong>.</li>
<li>Ödemeler <strong>1-3 iş günü</strong> içinde hesabınıza geçer.</li>
<li>Çekim işlemlerinden ek kesinti yapılmaz.</li>
</ul>

<h2>Hizmet Bedeli</h2>
<ul>
<li><strong>Hizmet Bedeli:</strong> Sabit ₺50 / satıcı (sipariş başına).</li>
<li><strong>Stopaj:</strong> %1.</li>
<li><strong>Yüzdesel Komisyon:</strong> YOK.</li>
</ul>
HTML;
    }
}
