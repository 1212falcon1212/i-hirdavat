<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        // Eski içerikleri temizle (FK sırasıyla)
        Schema::disableForeignKeyConstraints();
        DB::table('blog_posts')->truncate();
        DB::table('blog_categories')->truncate();
        Schema::enableForeignKeyConstraints();

        $categories = [
            ['name' => 'El Aletleri', 'slug' => 'el-aletleri', 'description' => 'Tornavida, pense, anahtar ve manuel aletlerde rehber yazılar', 'sort_order' => 1],
            ['name' => 'Elektrikli Aletler', 'slug' => 'elektrikli-aletler', 'description' => 'Matkap, taşlama, kesme ve şarjlı aletlerde inceleme ve karşılaştırmalar', 'sort_order' => 2],
            ['name' => 'İş Güvenliği', 'slug' => 'is-guvenligi', 'description' => 'Şantiye ve atölyede kişisel koruyucu ekipman rehberleri', 'sort_order' => 3],
            ['name' => 'Bağlantı Elemanları', 'slug' => 'baglanti-elemanlari', 'description' => 'Civata, somun, vida, dübel — DIN standartları ve kullanım rehberleri', 'sort_order' => 4],
            ['name' => 'B2B & Bayi', 'slug' => 'b2b-bayi', 'description' => 'Bayi yönetimi, toplu sipariş ve B2B e-ticaret ipuçları', 'sort_order' => 5],
        ];

        $catMap = [];
        foreach ($categories as $cat) {
            $catMap[$cat['slug']] = BlogCategory::create($cat)->id;
        }

        foreach ($this->getPosts($catMap) as $post) {
            BlogPost::create($post);
        }
    }

    private function getPosts(array $catMap): array
    {
        $now = now();

        return [
            [
                'title' => 'Profesyonel Matkap Seçimi: Akülü mü Kablolu mu?',
                'slug' => 'profesyonel-matkap-secimi-akulu-mu-kablolu-mu',
                'excerpt' => 'Şantiye, atölye ve servis kullanımında akülü ve kablolu matkapların güçlü-zayıf yönleri ve doğru tercih için kılavuz.',
                'content' => '<h2>Karar Vermeden Önce: Kullanım Senaryonuz Ne?</h2>
<p>Matkap seçiminde en kritik soru, aletin hangi sıklıkla ve ne tür işlerde kullanılacağıdır. Atölyede sabit bir bankoda 8 saat boyunca delik açan bir tesisatçı ile sahada 2-3 mobilya montajı yapan bir teknisyenin ihtiyaçları farklıdır. Bu yüzden satın alma kararı, kataloğa değil iş profiline göre verilmelidir.</p>

<h2>Kablolu Matkapların Avantajları</h2>
<p>220V şebekeden beslenen kablolu matkaplar, sürekli ve sabit tork üretir. 600-1100W aralığındaki Bosch GSB 1300, Makita HP1631 ve benzeri modeller beton, tuğla ve sert çelikte sınırsız çalışma süresi sunar. Akü zafiyeti yoktur; aksamı daha hafif olduğu için aynı güç sınıfında daha küçük gövdeye sığar.</p>

<h3>Ne zaman kablolu seçmeli?</h3>
<ul>
<li>Sabit atölye kullanımı, banko başında günlük 4+ saat çalışma</li>
<li>Beton/duvarda darbeli delme ihtiyacı (özellikle ≥13mm uçlar)</li>
<li>Düşük bütçe — aynı güç için akülünün yarısı fiyat</li>
</ul>

<h2>Akülü Matkapların Avantajları</h2>
<p>18V ve 20V Max sınıfı modern Li-ion akülü matkaplar (Makita DHP485, DeWalt DCD796, Bosch GSB 18V-50) artık kablolulara yakın tork değerleri sunuyor. 5.0Ah akü ile bir gün boyunca mobilya montajı, vida sıkma ve hafif duvar delme rahatlıkla yapılabiliyor.</p>

<h3>Akülü tercih edilmesi gereken durumlar:</h3>
<ul>
<li>Sahada, çatıda, asansörde — priz erişimi olmayan ortamlar</li>
<li>Mobilya montajı, alçıpan, kapı kasası gibi hafif-orta işler</li>
<li>Yedek akü stratejisi varsa (en az 2 akü) kesintisiz çalışma</li>
</ul>

<h2>Profesyonel Tercih: Hibrit Strateji</h2>
<p>Tecrübeli ustalar tek alet yerine kombinasyon kullanır: atölyede 750W kablolu darbeli matkap, sahada 18V akülü vidalama. Bu yaklaşım hem maliyet hem de iş sürekliliği açısından en optimum çözümdür.</p>

<h2>Bayi Tarafından İpucu</h2>
<p>Müşteriye satış yaparken sadece güç (W) değil, devir sayısı (rpm), tork (Nm), darbe sayısı (bpm) ve çene kapasitesi (mm) bilgisini de öne çıkarın. Profesyonel alıcı bu metrikleri karşılaştırarak karar verir.</p>',                'category_id' => $catMap['elektrikli-aletler'],
                'tags' => ['matkap', 'akülü', 'kablolu', 'bosch', 'makita', 'dewalt'],
                'meta_title' => 'Akülü mü Kablolu mu? Profesyonel Matkap Seçim Rehberi',
                'meta_description' => 'Bosch, Makita ve DeWalt matkaplarda akülü-kablolu karşılaştırması. Kullanım senaryosuna göre doğru matkap seçimi için rehber.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(28),
                'is_featured' => true,
            ],

            [
                'title' => 'DIN Civata Standartlarını Anlamak: 933, 931, 912, 7991',
                'slug' => 'din-civata-standartlarini-anlamak-933-931-912-7991',
                'excerpt' => 'En sık kullanılan DIN civata standartlarının kafa tipleri, kullanım alanları ve seçim kriterleri.',
                'content' => '<h2>DIN Standardı Neden Önemli?</h2>
<p>DIN (Deutsches Institut für Normung), Almanya kaynaklı uluslararası standartlar bütünüdür ve hırdavat sektöründe civata-somun ölçülerinin ortak dilidir. DIN numarasını bilmek, aynı ürünün farklı tedarikçilerden tedarikinde uyumsuzluk riskini sıfıra indirir. Müşteri "M8x30 DIN 933" dediğinde, dünyanın hangi köşesinde olursa olsun aynı ürünü alır.</p>

<h2>DIN 933 — Tam Diş Altıgen Başlı Civata</h2>
<p>Sektörün en yaygın civatası. Kafa altından uca kadar tüm gövde dişlidir. Konstrüksiyon, makine montajı, çelik yapı bağlantılarında kullanılır. M3\'ten M48\'e kadar geniş ölçü yelpazesi mevcuttur. Galvaniz, sarı pasif (sarıkrom), siyah ve A2/A4 paslanmaz seçenekleri vardır.</p>

<h2>DIN 931 — Yarım Diş Altıgen Başlı Civata</h2>
<p>Diş kısmı sadece civatanın ucunda yer alır, gövdenin geri kalanı düz silindirdir. Bu yapı, iki parçayı birbirine bağlarken düz silindirik kısmın delikten geçerek kayar bir mafsal görevi görmesine olanak verir. Ağır makine montajı, ekskavatör, vinç gibi yapılarda tercih edilir.</p>

<h2>DIN 912 — İmbus (Allen) Başlı Silindirik Civata</h2>
<p>Altıgen iç soketli, alyan anahtarı ile sıkılan civata tipi. Mobilya, hassas makine, otomotiv ve elektronik kabin montajında yaygın. Düz yüzey altına gömülecek şekilde monte edilir, dış yüzeyden kafa görünmez. Yüksek tork uygulaması gerektiren uygulamalarda 8.8, 10.9 ve 12.9 sınıf seçenekleri mevcuttur.</p>

<h2>DIN 7991 — Havşa Başlı İmbus Civata</h2>
<p>Konik havşa kafalı, alyan ile sıkılan civata. Yüzeyle aynı seviyede kalması istenen bağlantılarda kullanılır. Kapı menteşeleri, mobilya ayakları, alüminyum profil bağlantılarında standarttır.</p>

<h2>Kalite Sınıfı Etiketleri</h2>
<p>DIN civata kafasında 4.6, 5.6, 8.8, 10.9, 12.9 gibi rakamlar görürsünüz. İlk rakam minimum çekme dayanımının 1/100\'ü (kgf/mm²), ikinci rakam ise akma sınırının çekme dayanımına oranıdır. Yapısal montajlarda en az 8.8 sınıfı önerilir; kritik mil uygulamalarında 10.9 ve üzeri tercih edilir.</p>

<h2>Bayi Stoğu İçin Pratik Tavsiye</h2>
<p>Bağlantı elemanı bayisinin stokta tutması gereken minimum çeşitlilik: M6, M8, M10, M12 ana ölçülerinde DIN 933 ve DIN 931, 20-100mm arası uzunluklar, hem galvaniz hem A2 paslanmaz. Bu sade matriks, müşteri taleplerinin yaklaşık %80\'ini karşılar.</p>',                'category_id' => $catMap['baglanti-elemanlari'],
                'tags' => ['civata', 'din 933', 'din 931', 'din 912', 'bağlantı'],
                'meta_title' => 'DIN Civata Standartları: 933, 931, 912, 7991 Karşılaştırması',
                'meta_description' => 'En yaygın DIN civata standartlarının kafa tipleri, kullanım alanları, kalite sınıfları ve bayi stok stratejisi için pratik rehber.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(24),
                'is_featured' => true,
            ],

            [
                'title' => 'İş Güvenliği Eldiveni Seçimi: Kesim Sınıfı Standardı EN 388',
                'slug' => 'is-guvenligi-eldiveni-secimi-kesim-sinifi-standardi-en-388',
                'excerpt' => 'EN 388 standardının dört rakamını okumayı öğrenin ve işin tehlike profiline göre doğru eldiveni seçin.',
                'content' => '<h2>EN 388: Eldivenin "Etiket Kimliği"</h2>
<p>İş güvenliği eldivenlerinin etiketinde 4 rakamlı bir kod görürsünüz: örneğin "4543". Bu rakamlar EN 388 standardına göre eldivenin sırasıyla aşınma, bıçak kesimi, yırtılma ve delinme dayanımını belirtir. Her rakam 1-4 (veya kesim için 1-5) arası değer alır; rakam ne kadar yüksekse o özellik o kadar güçlüdür.</p>

<h2>Rakamları Çözmek</h2>
<ul>
<li><strong>1. Rakam (Aşınma 1-4):</strong> Yüzeyin sürtünme ile aşınmaya karşı dayanımı</li>
<li><strong>2. Rakam (Bıçak Kesimi 1-5):</strong> Düşük hızda dönen bıçağa karşı koruma. 5 en yüksek seviyedir; cam kırığı, çelik sac kenarı taşıyan kullanımda zorunlu.</li>
<li><strong>3. Rakam (Yırtılma 1-4):</strong> Ani çekme kuvvetlerine dayanım</li>
<li><strong>4. Rakam (Delinme 1-4):</strong> Sivri uçlu nesnelere (çivi, dikiş ucu) karşı koruma</li>
</ul>

<h2>2016 Güncellemesi: ISO 13997 (TDM Test) ve EN ISO 21420</h2>
<p>2016 sonrası eldivenlerde EN 388 koduna ek olarak harf de görebilirsiniz: A, B, C, D, E, F. Bu A\'dan F\'ye doğru artan ISO 13997 TDM test kesim direnci sınıfıdır. Çelik konstrüksiyon ve cam sektöründe en az "C" sınıfı zorunludur; F sınıfı ise zırhlı eldiven seviyesindedir.</p>

<h2>İş Profiline Göre Tavsiye</h2>
<table>
<thead><tr><th>İş Türü</th><th>Önerilen EN 388</th><th>Malzeme</th></tr></thead>
<tbody>
<tr><td>Mobilya montajı, hafif elektrik</td><td>2121 / Sınıf B</td><td>Naylon + nitril kaplama</td></tr>
<tr><td>Çelik konstrüksiyon</td><td>4543 / Sınıf D</td><td>HPPE + nitril köpük</td></tr>
<tr><td>Cam taşıma, sac kenarı</td><td>4544 / Sınıf E-F</td><td>Aramid + nitril</td></tr>
<tr><td>Kimyasal işlem</td><td>EN 374 + EN 388</td><td>Nitril veya neopren tam kaplama</td></tr>
</tbody>
</table>

<h2>Dikkat: "Anti-kesim" Pazarlaması Yanıltıcı</h2>
<p>Bazı satıcılar "anti-kesim eldiven" başlığıyla 1-2 sınıfı eldiveni profesyonel iş için pazarlar. Müşteriyi koruyacak gerçek eldiven C sınıfı ve üzeridir. Bayi olarak bu farkı anlatmak ürün iadesi ve iş kazası sorumluluğunu önler.</p>

<h2>Maliyet vs Korunma Dengesi</h2>
<p>F sınıfı bir eldiven 80-150 TL bandında olabilir, ucuz B sınıfı 15-25 TL. Doğru sınıfı seçerek aşırı pahalıya alımı önleyin; ama aynı zamanda iş kazası maliyetinin yanında eldiven fiyatının önemsiz kaldığını unutmayın.</p>',                'category_id' => $catMap['is-guvenligi'],
                'tags' => ['eldiven', 'iş güvenliği', 'en 388', 'kişisel koruyucu'],
                'meta_title' => 'İş Güvenliği Eldiveni: EN 388 Standardını Anlamak',
                'meta_description' => 'EN 388 dört rakamlı kodu okumayı, ISO 13997 TDM sınıfını ve iş profiline göre doğru eldiveni seçmeyi öğrenin.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(20),
                'is_featured' => true,
            ],

            [
                'title' => 'B2B Hırdavat Tedarikinde Excel ile Toplu Sipariş',
                'slug' => 'b2b-hirdavat-tedarikinde-excel-ile-toplu-siparis',
                'excerpt' => 'Yüzlerce kalemli siparişi tek tek girmeyi bırakın. Excel/CSV import ile 5 dakikada 500 satırlık siparişi sepete aktarın.',
                'content' => '<h2>Manuel Sipariş Sürecinin Maliyeti</h2>
<p>Hırdavat sektöründe ortalama bir bayi siparişi 30-150 satırdır. Geleneksel B2C site arayüzlerinde her ürünü ayrı ayrı arayıp sepete eklemek 1-2 saat sürer ve hata oranı yüksektir. Excel ile toplu sipariş özelliği bu süreci 5-10 dakikaya indirir.</p>

<h2>Toplu Sipariş Formatı</h2>
<p>i-hırdavat platformunda Hızlı Sipariş modülü iki sütunlu basit bir format kabul eder:</p>
<pre>SKU                    Adet
BSH-GSB550-13-RE       5
M8X20-DIN933-Z         500
MKT-DHP485-18V         2
3M-FFP2-9320           50</pre>
<p>Bu format Excel\'den kopyala-yapıştır ile veya CSV dosyası yüklenerek sepete dökülür. SKU eşleşmeyen kalemler kırmızıyla işaretlenir, kullanıcı manuel düzeltir.</p>

<h2>SKU Standardizasyonu — Bayinin Süpergücü</h2>
<p>Tedarikçinizin SKU sistemini öğrenmek ve kendi stok kartlarınızda aynı SKU\'yu kullanmak, hem stok eşleştirmeyi hem de toplu siparişi devrim niteliğinde hızlandırır. ERP\'nizde "SKU Tedarikçi" alanı tutarak her ürünün ana tedarikçi SKU\'sunu saklayın.</p>

<h2>Şablon ve Geçmiş Sipariş Kullanımı</h2>
<p>Sık tekrar eden siparişler için şablon oluşturma alışkanlığı kazanın:</p>
<ul>
<li><strong>Aylık standart sipariş şablonu</strong> — temel sarf malzemeleri (eldiven, civata, vida vs.)</li>
<li><strong>Mevsimsel şablonlar</strong> — kış/yaz farkı olan ürünler için</li>
<li><strong>Proje şablonları</strong> — belirli bir kurulumda gereken kalem listesi</li>
</ul>

<h2>Geçmişten Tekrar Sipariş</h2>
<p>i-hırdavat\'ta "Son Siparişimi Tekrarla" özelliği geçmiş bir siparişin tüm kalemlerini sepete döker, miktar ve fiyatlar güncellenir. Aylık tekrarlayan tedarik zincirine sahip bayiler için bu özellik manuel girişi tamamen ortadan kaldırır.</p>

<h2>Birden Fazla Bayiden Karşılaştırmalı Sipariş</h2>
<p>Pazaryeri modeli sayesinde aynı SKU için birden fazla bayinin fiyat-stok-kargo verisi yan yana görüntülenebilir. Toplu siparişte sistem otomatik olarak en düşük fiyatlı stoklu bayi ilanını seçer; ama kullanıcı kargo süresi veya vade tercihiyle override edebilir.</p>

<h2>Sayısal Disiplin: Stok Devir Hızı</h2>
<p>Toplu sipariş kolaylığı tedarik sürekliliğini artırır ama aşırı stoklama riski de doğurur. Aylık satış adedinizin 1.5-2 katından fazla stok tutmayın; aksi halde kasanız ürünlere bağlanır. Doğru sipariş miktarı için ABC analizi yapın.</p>',                'category_id' => $catMap['b2b-bayi'],
                'tags' => ['toplu sipariş', 'b2b', 'excel', 'sku', 'hızlı sipariş'],
                'meta_title' => 'Excel ile Toplu Hırdavat Siparişi: 5 Dakikada 500 Satır',
                'meta_description' => 'B2B hırdavat tedarikinde Excel/CSV ile toplu sipariş, SKU eşleştirme ve şablon kullanımı için pratik rehber.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(17),
                'is_featured' => true,
            ],

            [
                'title' => 'Avuç İçi Taşlama Diski Seçimi: Uygulamaya Göre Disk Türleri',
                'slug' => 'avuc-ici-taslama-diski-secimi-uygulamaya-gore-disk-turleri',
                'excerpt' => 'Kesme, kaba taşlama, parlatma — her uygulama için doğru diski seçmek aletin ömrünü ve iş kalitesini belirler.',
                'content' => '<h2>Disk Çeşitleri Genel Bakış</h2>
<p>Avuç içi taşlama makinesi (avuç taşlama, küçük taşlama olarak da bilinir) tek başına çok yönlü değildir; gerçek esneklik takılan diskten gelir. Doğru diski seçmek hem işin hızını hem de güvenliği belirler.</p>

<h2>1. Kesme Diski (Cut-off / Inox)</h2>
<p>İnce profilli (genellikle 1-2.5mm), kenarı keskin diskler. Yalnızca kesmek için kullanılır, taşlama amacıyla yana yaslamak diski kırar — bu en sık iş kazasının nedenidir. Inox (paslanmaz çelik) için ayrı diskler vardır; demir kesme diski ile paslanmaz keserseniz kesim yüzeyi karbon ile kirlenip korozyona açık olur.</p>

<h3>Kalın metal kesimi</h3>
<p>2.5mm-3mm kesme diskleri, ø115-125mm boyutta, 14-18 saniyede 5mm sac keser. Bosch X-Lock, Klingspor ve Norton üst kalite markalardır.</p>

<h3>İnce sac ve boru</h3>
<p>1mm ultra-ince diskler, daha hızlı keser ve daha az ısı üretir; ama bükülmeye duyarlıdır.</p>

<h2>2. Kaba Taşlama Diski (Grinding)</h2>
<p>6-8mm kalınlığındaki kaba taşlama diskleri kaynak çapakları, çelik fazlalıkları ve metal yüzey hazırlığı için kullanılır. Disk yüzeyi metale 25-30° açıyla yaslanır; bu açı kritiktir, daha düz açılarda diski yer ve makineyi zorlar.</p>

<h2>3. Flap Disk (Lameli Zımpara)</h2>
<p>Birden fazla zımpara kanadı flap (yelpaze) şeklinde dizilir. Tane sayısına göre P40-P120 arası seçenekler vardır. Çelik yüzeyi parlatma, boya öncesi yüzey hazırlığı, kaynak izini yumuşatma için idealdir. Klasik kaba taşlama diskine göre daha az ısı üretir, daha temiz yüzey bırakır.</p>

<h2>4. Tel Fırça (Wire Brush)</h2>
<p>Pas, eski boya, kaynak curufu temizleme için kullanılır. Çubuk tel ve dalgalı tel olarak iki tip vardır; çubuk daha agresiftir. Mutlaka tam kapalı koruyucu siperlik ve gözlük takın — kopan tel parçaları yüzeylerden seker.</p>

<h2>5. Diamond Disk (Beton/Mermer Kesme)</h2>
<p>Beton, granit, mermer kesimi için elmas tozu sinterli diskler. Soğutma ile (ıslak kesim) kullanmak diskin ömrünü 5-10 katına çıkarır.</p>

<h2>Disk Seçim Tablosu</h2>
<table>
<thead><tr><th>İş</th><th>Doğru Disk</th><th>Disk Kalınlığı</th></tr></thead>
<tbody>
<tr><td>Çelik profil kesim</td><td>Kesme diski (demir)</td><td>2.5mm</td></tr>
<tr><td>Inox boru kesim</td><td>Kesme diski (inox)</td><td>1-1.5mm</td></tr>
<tr><td>Kaynak çapak temizleme</td><td>Kaba taşlama veya flap</td><td>6mm / lameli</td></tr>
<tr><td>Boya öncesi yüzey</td><td>Flap disk P60-P80</td><td>—</td></tr>
<tr><td>Pas temizleme</td><td>Tel fırça (çubuk tel)</td><td>—</td></tr>
<tr><td>Beton kesim</td><td>Diamond disk</td><td>—</td></tr>
</tbody>
</table>

<h2>Güvenlik: Diskin "Ömür Bitiş" Sinyali</h2>
<p>Disk her kullanımda incelir, çapı küçülür. Diskin maksimum dönüş hızı (mm/s veya rpm) etiketinde yazar; çapı küçüldükçe makine devri aynı kalsa da çevre hızı düşer. Ancak çatlak, çentik veya yamulma görürseniz diski derhal değiştirin. Kazanın çoğu eskimiş diskten kaynaklanır.</p>',                'category_id' => $catMap['elektrikli-aletler'],
                'tags' => ['taşlama', 'disk', 'kesme', 'flap', 'avuç içi'],
                'meta_title' => 'Avuç İçi Taşlama Diski: Uygulamaya Göre Doğru Disk',
                'meta_description' => 'Kesme, kaba taşlama, flap, tel fırça, diamond disk — uygulama matriksi ve güvenlik noktalarıyla disk seçim rehberi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(14),
                'is_featured' => false,
            ],

            [
                'title' => 'Hırdavat Bayisi İçin Stok Devir Hızı Optimizasyonu',
                'slug' => 'hirdavat-bayisi-icin-stok-devir-hizi-optimizasyonu',
                'excerpt' => 'Stok devir hızı (turnover) ölçümü, ABC analizi ve yavaş hareket eden ürünlerin yönetimi — bayinizin nakit akışını rahatlatın.',
                'content' => '<h2>Neden Stok Devir Hızı?</h2>
<p>Bir hırdavat bayisinin sermayesinin yaklaşık %60-75\'i stoğa bağlıdır. Yanlış ürün karması, yavaş hareket eden kalemler, ölü stoklar — hepsi nakit akışınızı boğar. Stok devir hızı (yıllık satış adedinin ortalama stoğa oranı) bu sağlık göstergelerinin en önemlisidir.</p>

<h2>Stok Devir Hızı Hesabı</h2>
<p>Formül basittir:</p>
<pre>Devir Hızı = (Yıllık Satılan Miktar) / (Ortalama Stok Miktarı)</pre>
<p>Örnek: Yılda 600 adet M8x30 civata satıyor, ortalama stoğunuz 100 adetse devir hızınız 6\'dır. Bu ürün 2 ayda bir tamamen sıfırlanıyor demektir. Hırdavatta sağlıklı seviye 6-12 arasıdır.</p>

<h2>ABC Analizi ile Önceliklendirme</h2>
<p>Tüm ürünleri yıllık ciro katkısına göre sıralayın:</p>
<ul>
<li><strong>A grubu (~%70 ciro):</strong> Genellikle ürünlerin %15-20\'si. Bu kalemleri hiç tükettirmeyin, otomatik yeniden sipariş kuralları kurun.</li>
<li><strong>B grubu (~%20 ciro):</strong> Ürünlerin %30-35\'i. Haftalık kontrol, manuel sipariş.</li>
<li><strong>C grubu (~%10 ciro):</strong> Ürünlerin %50\'si. Yüksek devir hızı zorunlu değil, müşteri talebi geldikçe sipariş verilebilir veya stoksuz çalışılabilir.</li>
</ul>

<h2>Ölü Stok Tespiti ve Tasfiye</h2>
<p>6 aydan uzun süredir hareket görmeyen kalemler "ölü stok"tur. Bunları:</p>
<ol>
<li>İndirimli kampanyaya alın (yıl sonu sayım kampanyası, sezon outlet)</li>
<li>B2B platformda diğer bayilere toptan satın</li>
<li>Tedarikçiye iade görüşmesi yapın (özellikle markalı ürünlerde mümkün)</li>
<li>Son çare: maliyet altı satış ile sermayeyi kurtarın</li>
</ol>

<h2>JIT (Just-in-Time) Yaklaşımı</h2>
<p>Bazı kategorilerde (örn. büyük el aletleri, paket boya) düşük devir hızı normaldir; talep gelince sipariş verilir. B2B platformların aynı gün sevkiyat seçeneği bu modeli mümkün kılar. Yer kaplayan, dönmeyen ürünleri raftan alıp sanal stokla satışa açabilirsiniz.</p>

<h2>Mevsimsel Esneklik</h2>
<p>Hırdavatta mevsim trafiği farklıdır: ilkbahar/yaz bahçe ekipmanları, sonbahar boya/izolasyon, kış elektrikli ısıtıcı. Yıllık ortalama yerine mevsimsel devir hızı izleyin; aksi halde kış aylarında bahçe ekipmanı stoğu ile cüzdanınızı dondurursunuz.</p>

<h2>Dijital Takip</h2>
<p>ERP sisteminizde her ürün için "stok devir hızı" raporu olmalı. Logo, Mikro, Netsis, Eta gibi ana yazılımlar bu raporu hazır sunar. Excel ile manuel takip edenler, en azından A grubu ürünler için aylık devir hızı rakamını duvarına asmalıdır.</p>',                'category_id' => $catMap['b2b-bayi'],
                'tags' => ['stok yönetimi', 'devir hızı', 'abc analizi', 'bayi'],
                'meta_title' => 'Hırdavat Bayisi İçin Stok Devir Hızı Optimizasyonu',
                'meta_description' => 'Stok devir hızı hesabı, ABC analizi, ölü stok tasfiyesi ve JIT yaklaşımı — hırdavat bayisinin nakit akışı rehberi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(11),
                'is_featured' => false,
            ],

            [
                'title' => 'Tornavida Setinde Bit Çeşitleri: PH, PZ, TX, Slotted',
                'slug' => 'tornavida-setinde-bit-cesitleri-ph-pz-tx-slotted',
                'excerpt' => 'Yıldız, düz, torx, alyan — bit kafalarının farklarını ve doğru kullanımı bilmek vidayı sıkar, ucu kurtarır.',
                'content' => '<h2>Bit Standartları Neden Önemli?</h2>
<p>Yanlış bit kullanmak vidayı yalar (cam-out), bitin kendisini de erkenden bozar. Profesyonel ustalar genellikle 4-5 farklı bit kafa standardını rahatlıkla tanır; bayi olarak da müşteriye doğru ürünü önermek için bu standartlara hakim olmak gerekir.</p>

<h2>PH (Phillips) — Yıldız</h2>
<p>Yıldız bitlerin en yaygını. PH0\'dan PH4\'e ölçüleri vardır; en sık kullanılan PH2\'dir (mobilya, sunta, ahşap vidaları). Tasarımı kasıtlı olarak yüksek torkda "kayar" — bu bir hata değil, vidayı koparmamak için bir güvenlik mekanizmasıdır.</p>

<h2>PZ (Pozidriv) — Geliştirilmiş Yıldız</h2>
<p>Phillips\'in evrimi. Çapraz dizilmiş ekstra dört çentik vardır. Görünüşte PH\'a çok benzer ama PZ vida ile PH bit kullanmak (veya tersi) bitin kayarak uçtan kopmasına sebep olur. Avrupa menşeli mobilya, kapı menteşesi, alçıpan vidalarında PZ standarttır. PZ2 en yaygın boyuttur.</p>

<h3>PH ve PZ\'yi Ayırt Etme</h3>
<p>PZ vida başında, ana çentiklerin arasında ek olarak ince dört çentik daha vardır (toplam 8 işaret). PH\'da bu yan çentikler yoktur. Müşteriye satış öncesi vida başını kontrol etmesini söyleyin.</p>

<h2>TX (Torx) — Yıldız Soketli</h2>
<p>Altıgen yıldız (6 köşeli) soket. Ulaşılan en yüksek tork transferine olanak verir, neredeyse hiç kaymaz. Otomotiv, beyaz eşya, elektronik ve modern mobilyada (özellikle IKEA Allen anahtarı yerine) standarttır. T6\'dan T55\'e geniş ölçü serisi vardır. T15-T25 mobilyada, T30-T40 yapı vidalarında en yaygın.</p>

<h2>Düz (Slotted)</h2>
<p>En eski standart. Genellikle elektrik prizleri, klemensler, eski tip mobilyalarda kullanılır. Ölçü: bitin uç genişliği milimetreyle (örn. 5.5mm × 1.0mm). Düz bitin yanlış kullanımı bitin daha hızlı bozulmasına yol açar.</p>

<h2>HEX (Allen / İmbus)</h2>
<p>Altıgen iç soketli. Genellikle mobilya montajında alyan anahtarıyla kullanılır ama bit formu da mevcuttur. H4, H5, H6 mobilyada en yaygın boyutlardır.</p>

<h2>Kalite ve Ömür</h2>
<p>İyi bir bit S2 alaşımlı çelik ile üretilmiş, sertleştirilmiştir. Wera, Wiha, Bosch ve Makita orijinal bitler 1000+ vidayı zorlanmadan sıkar. Ucuz Çin malı bitler 50-100 vida sonrası ucu yumuşar, kullanımı bayinize de iade getirir.</p>

<h2>Bit Tutucu (Bit Holder) ve Manyetik Pencere</h2>
<p>Manyetik bit tutucu, bitin akülü vidalama makinesinde sabit kalmasını sağlar; vidanın da bite yapışmasıyla tek elle çalışmayı mümkün kılar. Kaliteli bir bit tutucu kadar bit takımının da kalitesi belirleyicidir.</p>

<h2>Bayi Stok Önerisi</h2>
<p>32-50 parçalı standart bit setleri PH, PZ, TX, slot, hex bit çeşitlerini bir arada sunar — müşteriye en kolay öneri budur. Bunun yanında 1/4" hex shaft\'lı bit + magnetic holder + extension bar kombinasyonunu da öne çıkarın.</p>',                'category_id' => $catMap['el-aletleri'],
                'tags' => ['bit', 'tornavida', 'phillips', 'torx', 'pozidriv'],
                'meta_title' => 'Bit Çeşitleri: PH, PZ, TX, Slotted Karşılaştırması',
                'meta_description' => 'Phillips, Pozidriv, Torx, slotted ve hex bitlerinin farkları, doğru kullanımı ve bayi için stok önerileri.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(8),
                'is_featured' => false,
            ],

            [
                'title' => 'Şantiyede Baret Sınıfları: ANSI vs EN 397',
                'slug' => 'santiyede-baret-siniflari-ansi-vs-en-397',
                'excerpt' => 'Baret etiketinde Type I, Type II, Class G, Class E ne anlama gelir? Şantiyenizin risk profiline göre doğru baret seçimi.',
                'content' => '<h2>Baret: En Çok Hafife Alınan KKD</h2>
<p>İş güvenliği eldiveni veya ayakkabısı genelde dikkat çekerken, baret çoğu zaman "tek tip ürün" olarak görülür. Oysa baret standartları içerik koruması, elektriksel izolasyon, yan darbe direnci gibi kritik özelliklerde önemli farklar barındırır.</p>

<h2>EN 397 — Avrupa Standardı</h2>
<p>Türkiye\'de kullanılan baretlerin büyük çoğunluğu EN 397 standardını taşır. Standart asgari özellikleri belirler:</p>
<ul>
<li>Üstten 5kg darbe yüksekliği 1m\'den</li>
<li>Yanal sertlik testi (LD)</li>
<li>Termal izolasyon -30°C / +50°C</li>
<li>Elektriksel temas testi (440V AC)</li>
</ul>
<p>Opsiyonel sembollerle ek koruma:</p>
<ul>
<li><strong>440V AC:</strong> 440V alternatif akıma karşı koruma</li>
<li><strong>MM:</strong> Erimiş metal sıçramasına karşı (kaynakhane)</li>
<li><strong>LD:</strong> Yanal deformasyon direnci</li>
<li><strong>-30°C / +150°C:</strong> Genişletilmiş termal performans</li>
</ul>

<h2>ANSI/ISEA Z89.1 — Amerikan Standardı</h2>
<p>İhraç ürün üretimi yapan firmalar bazen ANSI standartlı baretleri tercih eder.</p>
<ul>
<li><strong>Type I:</strong> Üstten darbe koruma (Avrupa\'daki gibi)</li>
<li><strong>Type II:</strong> Üst + yan darbe koruma (Avrupa\'da yaygın değil, profesyonel inşaat ve madencilikte değerlidir)</li>
</ul>
<p>Sınıflar:</p>
<ul>
<li><strong>Class G (General):</strong> 2200V altı koruma</li>
<li><strong>Class E (Electrical):</strong> 20.000V\'ye kadar elektriksel koruma — yüksek voltaj enerji hatları için</li>
<li><strong>Class C (Conductive):</strong> İletken — havalandırma delikleri var, elektrik izolasyon yok</li>
</ul>

<h2>Baret Tipleri</h2>
<h3>1. Klasik Yapı Bareti (Cap Style)</h3>
<p>Vizör kısa, ense kısmı açık. Genel inşaat, depo, fabrika için yeterli. En ucuz ve en yaygın.</p>

<h3>2. Full Brim (Geniş Kenar)</h3>
<p>360° vizör. Güneş, yağmur, sıçrama korumasında ekstra avantaj. Açık alan inşaat (özellikle yaz aylarında) tercih sebebidir.</p>

<h3>3. Vented (Havalandırmalı)</h3>
<p>Üst ve yan delikler, sıcak iklim için. Ama elektriksel temas riskine açık olduğu için Class C sınıfındadır — elektrik şantiyelerinde KULLANILMAZ.</p>

<h3>4. Climbing / Mountaineering Style</h3>
<p>Yüksek irtifa çalışması, çatı işleri, ağaç budama için. Çene kayışı zorunlu, yan darbe direnci yüksek. EN 12492 standardı.</p>

<h2>Baret Yaşam Süresi</h2>
<p>Üreticinin etiketinde "üretim tarihi" yer alır (ay/yıl şeklinde, çoğunlukla baretin iç yüzeyinde damgalı). EN 397 baretlerin tipik kullanım ömrü 3-5 yıldır; UV ve termal stres polietileni kırılganlaştırır. Sert darbeler aldıktan sonra (görünür çatlak olmasa bile) baret YENİLENMELİDİR.</p>

<h2>Bayi Stok Önerisi</h2>
<p>Standart bayi stoğu için: 3M H-700 serisi, MSA V-Gard, Centurion 1100. EN 397 + 440V AC + MM çoklu sertifikalı modeller en geniş kullanım alanını kapsar. Her renkte (sarı, beyaz, mavi, yeşil, kırmızı) en az 10\'ar adet bulundurun — şantiyelerde rol bazlı renk kodu yaygındır.</p>',                'category_id' => $catMap['is-guvenligi'],
                'tags' => ['baret', 'iş güvenliği', 'en 397', 'ansi', 'şantiye'],
                'meta_title' => 'Baret Sınıfları: ANSI Type I/II vs EN 397',
                'meta_description' => 'Baret standartları, EN 397 opsiyonel semboller, ANSI Type I/II ve Class E elektriksel koruma — şantiye için doğru baret seçimi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(6),
                'is_featured' => false,
            ],

            [
                'title' => 'Kademeli Bayi İskontosu: 10+ %5, 50+ %10, 100+ %15',
                'slug' => 'kademeli-bayi-iskontosu-10-50-100',
                'excerpt' => 'Toplu alım iskontosu nasıl yapılandırılır? Marjları korurken bayinizin alım hacmini büyütmek için iskonto matriksi.',
                'content' => '<h2>Neden Kademeli İskonto?</h2>
<p>B2B hırdavat satışında müşteri her sipariş kalemini olduğu kadarıyla almaz; doğru iskonto teşvikiyle 10\'luk siparişi 50\'liye, 50\'liyi 100\'lüye yükselte yön­leyebilirsiniz. Hem ciro hem de stok devir hızı için kazançlı bir manevradır.</p>

<h2>İskonto Matriksi Tasarımı</h2>
<p>Tipik 3-kademeli yapı:</p>
<ul>
<li><strong>10-49 adet:</strong> %5 iskonto</li>
<li><strong>50-99 adet:</strong> %10 iskonto</li>
<li><strong>100+ adet:</strong> %15 iskonto</li>
</ul>
<p>Bu matriks tüm ürünlere uygulanmaz — yüksek marjlı kategorilerde (el aletleri, iş güvenliği) anlamlıdır. Düşük marjlı bağlantı elemanlarında ise daha tutucu bir matriks (%2-5-8) tercih edilir.</p>

<h2>Marj Koruma Hesabı</h2>
<p>%15 iskonto verirken brüt marjınız %30 ise net karınız %15\'e düşer. Bu seviyenin altına inmemek için ürün bazlı kontrol şarttır:</p>
<pre>Yeni Marj = Brüt Marj - (İskonto × (1 - Brüt Marj))</pre>
<p>Örnek: %30 brüt marjlı bir ürüne %15 iskonto:
%30 - (%15 × %70) = %30 - %10.5 = %19.5 net marj</p>

<h2>Müşteri Segmentine Göre Farklı Matriks</h2>
<p>Tek tip iskonto yerine müşteri segmentlerine göre matriks ayarlayın:</p>
<ul>
<li><strong>Sadık bayiler (yıllık 100K+ ciro):</strong> Standart matriksin %2 üstü</li>
<li><strong>Yeni müşteriler:</strong> İlk siparişe özel %5 hoş geldin iskonto</li>
<li><strong>Spot satışlar:</strong> İskonto yok veya minimum</li>
</ul>

<h2>İskonto + Vade Kombinasyonu</h2>
<p>Peşin alımları teşvik etmek için iskontoya peşin/vade farkı ekleyin:</p>
<ul>
<li>Peşin: %15 iskonto</li>
<li>30 gün vade: %12 iskonto</li>
<li>60 gün vade: %8 iskonto</li>
</ul>
<p>Bu yapı nakit akışınızı iyileştirir ve müşteriye seçim esnekliği sunar.</p>

<h2>Sezonsal Promosyonlar</h2>
<p>Standart matriksin üstüne sezonsal kampanyalar eklenebilir: "Mart ayında 100+ alımlarda ek %3", "Yıl sonu kampanyası: %20\'ye varan iskonto". Bu kampanyalar ölü stok tasfiyesi için de etkili bir araçtır.</p>

<h2>Otomatik İskonto Hesaplaması</h2>
<p>i-hırdavat platformu sepete eklenen miktara göre iskonto kademesini otomatik uygular. Kullanıcı 9 adet seçtiğinde "1 adet daha eklerseniz %5 iskonto kazanırsınız" uyarısı çıkar — bu mikro-up-sell etkili bir psikolojik tetikleyicidir.</p>

<h2>Yanlış Yapılan Hatalar</h2>
<ol>
<li><strong>Tek matriksi tüm kategorilere uygulama:</strong> Ürün marjını öldürür</li>
<li><strong>İskontoyu fiyat etiketinde gizleme:</strong> Müşteri güvenini kırar; açık matriks gösterilmelidir</li>
<li><strong>Aşırı agresif iskonto:</strong> Rakipler de aynısını yapar, fiyat savaşı başlar</li>
<li><strong>İskonto yoktan stok aşımı:</strong> Stok devir hızı düşer</li>
</ol>',                'category_id' => $catMap['b2b-bayi'],
                'tags' => ['iskonto', 'bayi', 'fiyatlandırma', 'b2b', 'marj'],
                'meta_title' => 'Kademeli Bayi İskontosu: 10+ %5, 50+ %10, 100+ %15',
                'meta_description' => 'B2B hırdavatta toplu alım iskonto matriksi, marj koruma hesabı ve müşteri segmenti bazlı fiyatlandırma stratejisi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(4),
                'is_featured' => false,
            ],

            [
                'title' => 'PPR-C ve PVC Boru Farkı: Hangisi Nerede Kullanılır?',
                'slug' => 'ppr-c-ve-pvc-boru-farki-hangisi-nerede-kullanilir',
                'excerpt' => 'Tesisat sektöründe PPR-C, PVC ve PE boruların farkları, basınç sınıfları ve uygulama alanları.',
                'content' => '<h2>Boru Kısaltmalarını Anlamak</h2>
<p>Tesisat tedarikçileri için müşteriye doğru boruyu satmak, malzeme bilgisi gerektiren bir konudur. Yanlış boru seçimi 1-2 yıl sonra patlama, sızıntı veya kimyasal degradasyona yol açar.</p>

<h2>PVC (Polivinil Klorür)</h2>
<p>Sert, kırılgan, ucuz. Yalnızca yağmur suyu, atık su ve havalandırma hatlarında kullanılır. Soğuk içme suyu için kullanım Türkiye\'de yasaktır (sağlık riski). Ana avantajı ucuzluğu ve kolay kesim/montajıdır. Solvent yapıştırıcı ile bağlanır.</p>

<h3>Tipik Kullanım</h3>
<ul>
<li>Bina iç atık su (ø75-100mm)</li>
<li>Yağmur olukları ve dış mekan drenaj</li>
<li>Havalandırma kanal donanımı</li>
</ul>

<h2>PPR-C (Polipropilen Random Copolymer)</h2>
<p>Modern içme suyu tesisatının standartı. -10°C ile +95°C arası çalışır, basınç sınıfları (PN10, PN16, PN20, PN25) vardır. Termal füzyon (kaynak makinesi) ile birleştirilir; bu yöntem boru ile fittingi tek molekül haline getirir, sızıntı riski sıfıra yakındır.</p>

<h3>PPR-C Basınç Sınıfları</h3>
<ul>
<li><strong>PN10:</strong> Soğuk su, 10 bar basınç. Bahçe sulama, soğuk su hattı.</li>
<li><strong>PN16:</strong> Genel kullanım, soğuk + ılık (60°C\'ye kadar). Sıhhi tesisat soğuk hat.</li>
<li><strong>PN20:</strong> Sıcak su (95°C, 20 bar). Sıhhi tesisat sıcak hat — en yaygın seçim.</li>
<li><strong>PN25:</strong> Endüstriyel basınçlı sıcak su, kalorifer dağıtım.</li>
</ul>

<h2>PE (Polietilen)</h2>
<p>Esnek, dayanıklı. Genellikle yer altı uygulamalarında kullanılır. PE100 standardı maviye boyalı içme suyu hatları için, sarı boya ise doğalgaz hatları içindir. Elektrofüzyon veya butt-welding ile birleştirilir.</p>

<h2>Çapraz Bağlı PEX</h2>
<p>Yerden ısıtma sistemlerinin standart borusu. Esnektir, dönüş yarıçapı küçüktür, sıcak suya karşı direnci yüksektir. Pres-fitting veya dişli geçme ile bağlanır.</p>

<h2>Kıyas Tablosu</h2>
<table>
<thead><tr><th>Boru</th><th>Sıcak Su</th><th>Basınç (max)</th><th>Birleşim</th><th>Tipik Fiyat</th></tr></thead>
<tbody>
<tr><td>PVC</td><td>HAYIR</td><td>10 bar (soğuk)</td><td>Solvent</td><td>Düşük</td></tr>
<tr><td>PPR-C PN20</td><td>EVET (95°C)</td><td>20 bar</td><td>Termal füzyon</td><td>Orta</td></tr>
<tr><td>PE100</td><td>HAYIR (yer altı)</td><td>10-16 bar</td><td>Elektrofüzyon</td><td>Orta-yüksek</td></tr>
<tr><td>PEX (Çapraz)</td><td>EVET (95°C)</td><td>10 bar</td><td>Pres-fitting</td><td>Yüksek</td></tr>
</tbody>
</table>

<h2>Kalite Sertifikası</h2>
<p>İçme suyu hatları için TSE EN ISO 15874-2 sertifikasını arayın. Markasız ucuz PPR-C boruları kullanmak hem yasal sorun hem de uzun vadede maliyet artışı doğurur (ortalama ömür 50 yıl yerine 5-8 yıl).</p>

<h2>Bayi Stok Tavsiyesi</h2>
<p>Tipik tesisat bayisi için minimum stok matriksi:</p>
<ul>
<li>PPR-C PN20: ø20, 25, 32, 40mm — her boyda 6m\'lik 50 adet</li>
<li>Fittings: T, dirsek, redüksiyon, vana — her ölçüde 50-100 adet</li>
<li>PVC: ø75, 100mm — her boyda 6m\'lik 30 adet</li>
<li>PE100 mavi: ø25, 32mm rulo — toplam 500m</li>
</ul>',                'category_id' => $catMap['baglanti-elemanlari'],
                'tags' => ['boru', 'ppr', 'pvc', 'pe', 'tesisat'],
                'meta_title' => 'PPR-C ve PVC Boru Farkı: Hangisi Nerede Kullanılır?',
                'meta_description' => 'PPR-C, PVC, PE ve PEX boruların basınç sınıfları, uygulama alanları, birleşim yöntemleri ve bayi stok matriksi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(2),
                'is_featured' => false,
            ],
        ];
    }
}
