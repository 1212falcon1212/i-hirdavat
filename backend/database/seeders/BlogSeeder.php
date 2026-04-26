<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        // 5 Kategori
        $categories = [
            ['name' => 'Eczane Yonetimi', 'slug' => 'eczane-yonetimi', 'description' => 'Eczane isletmeciligi ve yonetim stratejileri', 'sort_order' => 1],
            ['name' => 'Saglik ve Bakim', 'slug' => 'saglik-ve-bakim', 'description' => 'Saglikli yasam ve kisisel bakim onerileri', 'sort_order' => 2],
            ['name' => 'B2B Ticaret', 'slug' => 'b2b-ticaret', 'description' => 'B2B eczane ticareti ve dijital donusum', 'sort_order' => 3],
            ['name' => 'Sektor Haberleri', 'slug' => 'sektor-haberleri', 'description' => 'Eczane sektoru guncel haberleri ve trendler', 'sort_order' => 4],
            ['name' => 'Urun Rehberleri', 'slug' => 'urun-rehberleri', 'description' => 'Urun incelemeleri ve secim rehberleri', 'sort_order' => 5],
        ];

        $catMap = [];
        foreach ($categories as $cat) {
            $catMap[$cat['slug']] = BlogCategory::create($cat)->id;
        }

        // 10 Blog Yazisi
        $posts = $this->getPosts($catMap);

        foreach ($posts as $post) {
            BlogPost::create($post);
        }
    }

    private function getPosts(array $catMap): array
    {
        $now = now();

        return [
            // 1. Eczanelerde Stok Yonetimi Rehberi
            [
                'title' => 'Eczanelerde Stok Yonetimi Rehberi',
                'slug' => 'eczanelerde-stok-yonetimi-rehberi',
                'excerpt' => 'Eczanelerde etkin stok yonetimi, karlilik ve musteri memnuniyetinin temel tasidir. Bu rehberde stok takibinden siparis optimizasyonuna tum detaylari bulabilirsiniz.',
                'content' => '<h2>Stok Yonetimi Neden Onemlidir?</h2>
<p>Eczane isletmeciligi, dogru urunlerin dogru zamanda rafta bulunmasiyla dogrudan iliskilidir. Yetersiz stok musteri kaybina, asiri stok ise nakit akisi sorunlarina yol acar. Modern eczanecilik anlayisinda stok yonetimi, rekabet avantaji saglayan stratejik bir unsur haline gelmistir.</p>

<h2>Etkin Stok Takibi Icin Temel Adimlar</h2>
<p>Basarili bir stok yonetimi icin oncelikle mevcut envanterin detayli bir analizini yapmak gerekir. Her urun kategorisi icin minimum ve maksimum stok seviyeleri belirlenmeli, mevsimsel talep degisiklikleri goz onunde bulundurulmalidir.</p>

<h3>1. ABC Analizi Uygulama</h3>
<p>Urunlerinizi satis hizina gore siniflandirin. A grubu urunler yuksek satis hacmine sahip olup surekli stoklarda bulunmalidir. B grubu orta seviyede, C grubu ise dusuk satis hizina sahip urunlerdir. Bu siniflandirma, sermaye dagilimini optimize etmenize yardimci olur.</p>

<h3>2. Dijital Stok Takip Sistemleri</h3>
<p>Manuel stok sayimlari yerine dijital sistemlere gecis yapmak hem zaman kazandirir hem de hata oranini minimuma indirir. Barkod okuyucular ve entegre yazilimlar sayesinde anlik stok durumunu takip edebilirsiniz.</p>

<h3>3. Tedarikci Iliskileri</h3>
<p>Guvenilir tedarikci agiyla calismak, acil siparis durumlarinda hizli teslimat almanizi saglar. B2B platformlar uzerinden birden fazla tedarikciyle baglanti kurarak fiyat karsilastirmasi yapabilir, en uygun kosullari elde edebilirsiniz.</p>

<h2>Son Kullanma Tarihi Yonetimi</h2>
<p>Eczanelerde en kritik konulardan biri son kullanma tarihi yaklasmis urunlerin yonetimidir. FIFO (ilk giren ilk cikar) prensibini uygulayarak raf duzenlemesi yapin. Son kullanma tarihi 3 aydan kisa urunler icin kampanya ve indirim stratejileri gelistirin.</p>

<h2>Sonuc</h2>
<p>Etkin stok yonetimi, eczanenizin karliligini artirirken musteri memnuniyetini de yukseltir. Dijital araclardan faydalanarak sureci otomatiklestirin ve veriye dayali kararlar alin.</p>',
                'featured_image' => 'blog/stok-yonetimi.jpg',
                'category_id' => $catMap['eczane-yonetimi'],
                'tags' => ['stok yonetimi', 'eczane', 'envanter', 'dijital donusum'],
                'meta_title' => 'Eczanelerde Stok Yonetimi Rehberi | B2B Eczane',
                'meta_description' => 'Eczanelerde etkin stok yonetimi stratejileri, ABC analizi, dijital stok takibi ve tedarikci yonetimi hakkinda kapsamli rehber.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(30),
                'is_featured' => true,
            ],

            // 2. Kis Mevsiminde Bagisiklik Guclendiren Vitaminler
            [
                'title' => 'Kis Mevsiminde Bagisiklik Guclendiren Vitaminler',
                'slug' => 'kis-mevsiminde-bagisiklik-guclendiren-vitaminler',
                'excerpt' => 'Soguk havalarda bagisiklik sistemini destekleyen vitaminler ve takviyeler hakkinda bilmeniz gereken her sey.',
                'content' => '<h2>Kis Aylari ve Bagisiklik Sistemi</h2>
<p>Soguk hava kosullari, kapali ortamlarda gecirilen uzun saatler ve gunes isiginin azalmasi bagisiklik sisteminin zayiflamasina neden olabilir. Bu donemde dogru vitamin ve mineral takviyesi almak, saglikli kalmanin en onemli adimlarindan biridir.</p>

<h2>C Vitamini: Bagisikligin Temel Tasi</h2>
<p>C vitamini, beyaz kan hucrelerinin uretimini destekleyerek vucudun enfeksiyonlara karsi savunmasini guclendirir. Gunluk 500-1000 mg arasinda C vitamini takviyesi, ozellikle kis aylarinda onerilen miktardir. Portakal, limon, kivi ve brokoli gibi dogal kaynaklarla birlikte tuketilmesi emilimi artirir.</p>

<h2>D Vitamini: Gunes Isigi Eksikligi</h2>
<p>Turkiye\'nin cogu bolgesinde kis aylarinda gunes isigina maruz kalma suresi azalir. D vitamini eksikligi bagisiklik sisteminin zayiflamasina ve kemik sagliginin bozulmasina yol acar. Kan tahlili ile D vitamini seviyenizi kontrol ettirmeniz ve gerekirse takviye kullanmaniz onerilir.</p>

<h2>Cinko ve Selenyum</h2>
<p>Cinko minerali, bagisiklik hucrelerinin saglikli calismasi icin vazgecilmezdir. Gunluk 15-25 mg cinko takviyesi, ust solunum yolu enfeksiyonlarinin suresi ve siddetini azaltabilir. Selenyum ise guclu bir antioksidan olup hucreleri serbest radikal hasarina karsi korur.</p>

<h2>Probiyotikler ve Bagirsak Sagligi</h2>
<p>Bagisiklik sisteminin yaklasik yuzde yetmisi bagirsak bolgesinde yer alir. Probiyotik takviyeler, bagirsak florasini dengeleyerek bagisiklik yanitini guclendirir. Yogurt, kefir ve tursu gibi fermente gidalar dogal probiyotik kaynaklaridir.</p>

<h2>Eczacilarin Rolu</h2>
<p>Eczacilar, musterilerine dogru takviye secimi konusunda rehberlik edebilir. Her bireyin ihtiyaclari farkli oldugundan, kisisellestirilmis oneriler sunmak musteri guvenini artirmanin en etkili yoludur.</p>',
                'featured_image' => 'blog/bagisiklik-vitaminler.jpg',
                'category_id' => $catMap['saglik-ve-bakim'],
                'tags' => ['vitamin', 'bagisiklik', 'kis', 'takviye'],
                'meta_title' => 'Kis Mevsiminde Bagisiklik Guclendiren Vitaminler',
                'meta_description' => 'Kis aylarinda bagisiklik sistemini destekleyen C vitamini, D vitamini, cinko ve probiyotik takviyeler hakkinda detayli bilgi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(25),
                'is_featured' => false,
            ],

            // 3. B2B Eczane Ticaretinde Dijital Donusum
            [
                'title' => 'B2B Eczane Ticaretinde Dijital Donusum',
                'slug' => 'b2b-eczane-ticaretinde-dijital-donusum',
                'excerpt' => 'Eczane sektorunde B2B dijital ticaretin yukselisi ve geleneksel tedarik zincirindeki degisim.',
                'content' => '<h2>Geleneksel Tedarik Zincirinden Dijital Platforma</h2>
<p>Eczane sektoru, uzun yillar boyunca geleneksel tedarik yontemleriyle calismistir. Telefon siparisleri, faks bildirimleri ve yuz yuze gorusmeler tedarik surecinin temelini olusturuyordu. Ancak dijitallesmenin hiz kazanmasiyla birlikte B2B eczane ticareti de buyuk bir donusum gecirmektedir.</p>

<h2>Dijital B2B Platformlarin Avantajlari</h2>
<h3>Fiyat Seffafligi</h3>
<p>Dijital platformlar, farkli tedarikci ve saticilardan gelen fiyatlari anlik olarak karsilastirma imkani sunar. Bu seffaflik, eczanelerin en uygun fiyata ulasmalarini kolaylastirir ve pazarlik surecini hizlandirir.</p>

<h3>7/24 Siparis Imkani</h3>
<p>Geleneksel yontemlerle siparis vermek mesai saatleriyle sinirlidir. B2B platformlar sayesinde gece yarisi bile siparis olusturabilir, stok durumunu kontrol edebilir ve teslimat takibi yapabilirsiniz.</p>

<h3>Genis Urun Yelpazesi</h3>
<p>Tek bir platform uzerinden yuzlerce tedariciye erisim saglanmasi, urun cesitliligini artirirken tedarikte surekliligi garanti eder. Ozellikle nihai urunlerde alternatif kaynak bulmak kolaylasir.</p>

<h2>Dijital Donusum Icin Ipuclari</h2>
<p>Dijital donusum surecinde eczanelerin dikkat etmesi gereken noktalar sunlardir:</p>
<ul>
<li>Guvenilir ve sertifikali platformlari tercih edin</li>
<li>Entegre edilen sistemlerin mevcut isleyisinizle uyumlu oldugundan emin olun</li>
<li>Personel egitimini ihmal etmeyin</li>
<li>Veri guvenligi ve gizlilik politikalarini inceleyin</li>
<li>Kucuk adimlarla baslayip zamanla kapsamini genisletin</li>
</ul>

<h2>Gelecek Perspektifi</h2>
<p>Yapay zeka destekli talep tahmini, otomatik yeniden siparis sistemleri ve blok zinciri tabanli urun takibi gibi teknolojiler yakin gelecekte B2B eczane ticaretini daha da ileri tasiyacaktir.</p>',
                'featured_image' => 'blog/dijital-donusum.jpg',
                'category_id' => $catMap['b2b-ticaret'],
                'tags' => ['dijital donusum', 'B2B', 'eczane ticareti', 'teknoloji'],
                'meta_title' => 'B2B Eczane Ticaretinde Dijital Donusum',
                'meta_description' => 'B2B eczane ticaretinde dijital platformlarin avantajlari, fiyat seffafligi ve gelecek perspektifi hakkinda kapsamli analiz.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(22),
                'is_featured' => true,
            ],

            // 4. Cilt Bakimi: Eczacilarin Onerecegi Urunler
            [
                'title' => 'Cilt Bakimi: Eczacilarin Onerecegi Urunler',
                'slug' => 'cilt-bakimi-eczacilarin-onerecegi-urunler',
                'excerpt' => 'Eczane raflarinda yer alan etkili cilt bakim urunleri ve dogru urun secimi icin eczaci onerileri.',
                'content' => '<h2>Dermokozmetik Urunlerin Onemi</h2>
<p>Cilt bakimi, saglikli bir gorunumun yaninda genel sagligin da bir gostergesidir. Eczanelerde satilan dermokozmetik urunler, kozmetik marketlerdeki urunlere kiyasla daha yuksek konsantrasyonda aktif madde icerir ve klinik calismalara dayali formulasyonlara sahiptir.</p>

<h2>Cilt Tipine Gore Urun Secimi</h2>
<h3>Kuru Cilt</h3>
<p>Kuru ciltler icin hyaluronik asit, seramid ve shea yagi iceren nemlendiriciler onerilir. Cildin nem bariyerini onaran ve uzun sureli nemlendirme saglayan urunler tercih edilmelidir. Temizleme asamasinda kopu icermeyen, sutumsu formullerin kullanimi onemlidir.</p>

<h3>Yagli ve Karma Cilt</h3>
<p>Yagli ciltlerde gozenek tikanikligini onleyen, matlasmis gorunum saglayan urunler kullanilmalidir. Salisilat asit ve niasinamid iceren formulleri tercih edin. Jel bazli nemlendiriciler yagli ciltler icin idealdir.</p>

<h3>Hassas Cilt</h3>
<p>Hassas ciltlerde parfumsuz, hipoalerjenik ve minimal icerikli urunler tercih edilmelidir. Termal su iceren mist spreyleri, cilt tahrislerde rahatlatici etki saglar. Panthenol ve allantoin gibi yatistirici bilesenleri iceren urunler onerilir.</p>

<h2>Gunes Koruyucu Kullanimi</h2>
<p>SPF 30 ve uzerinde gunes koruyucu kullanimi yilin her gunu onerilir. UVA ve UVB isinlarina karsi genis spektrumlu koruma saglayan formulleri tercih edin. Hassas ciltler icin mineral filtre iceren (cinko oksit, titanyum dioksit) urunler daha az tahris edicidir.</p>

<h2>Eczacinin Rolu</h2>
<p>Musteri cilt tipini analiz etmesine yardimci olun, alerjik reaksiyon riskini degerlendirin ve dogru urun kombinasyonunu onerin. Dermatoloji konsultasyonu gerektiginde yonlendirme yapin.</p>',
                'featured_image' => 'blog/cilt-bakimi.jpg',
                'category_id' => $catMap['urun-rehberleri'],
                'tags' => ['cilt bakimi', 'dermokozmetik', 'gunes koruyucu', 'nemlendirici'],
                'meta_title' => 'Cilt Bakimi: Eczacilarin Onerecegi Urunler',
                'meta_description' => 'Cilt tipine gore dermokozmetik urun secimi, nemlendirici ve gunes koruyucu onerileri. Eczaci perspektifinden cilt bakim rehberi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(18),
                'is_featured' => false,
            ],

            // 5. 2026 Eczane Sektoru Trendleri
            [
                'title' => '2026 Eczane Sektoru Trendleri',
                'slug' => '2026-eczane-sektoru-trendleri',
                'excerpt' => '2026 yilinda eczane sektorunu sekillendiren onemli trendler ve gelecege yonelik beklentiler.',
                'content' => '<h2>Sektorde Yeni Donem</h2>
<p>2026 yili, eczane sektoru icin onemli degisim ve donusumlerin yasandigi bir donem olmaktadir. Teknolojik gelismeler, tuketici beklentilerindeki degisimler ve regulasyon guncellemeleri sektore yon vermektedir.</p>

<h2>Kisisellestirilmis Saglik Hizmetleri</h2>
<p>Eczaneler artik sadece urun satan yerler degil, kisisellestirilmis saglik danismanligi sunan merkezler haline geliyor. Genetik testler ve dijital saglik verileri sayesinde bireye ozel vitamin ve takviye programlari sunmak mumkun hale gelmistir.</p>

<h2>Dijital Eczane Deneyimi</h2>
<p>Online siparis, hizli teslimat ve dijital danismanlik hizmetleri artik standart beklentiler arasinda. Mobil uygulamalar uzerinden recete yenileme, urun hatirlatma ve saglik takibi gibi hizmetler sunulmaktadir.</p>

<h2>Surdurulebilirlik ve Yesil Eczanecilik</h2>
<p>Cevre bilinci yukselen tuketiciler, eczanelerden de surdurulebilir pratikler bekliyor. Geri donusturulabilir ambalajlar, eko-sertifikali urunler ve enerji verimli magaza tasarimlari on plana cikmaktadir. Kullanilmis urun toplama programlari hem cevre duyarliligi gosterir hem de musteri sadakatini arttirir.</p>

<h2>Yapay Zeka ve Otomasyon</h2>
<p>Yapay zeka destekli stok yonetimi, talep tahmini ve musteri segmentasyonu eczane operasyonlarini optimize etmektedir. Robotik dagitim sistemleri ise hata oranini dusurup verimlilik artirmaktadir.</p>

<h2>B2B Platformlarin Yukselisi</h2>
<p>Eczaneler arasi ticaret dijital platformlar sayesinde buyuk bir ivme kazanmistir. Fazla stoklarini diger eczanelere uygun fiyatlarla sunabilen saticilar, hem kayiplarini azaltmakta hem de sektore deger katmaktadir.</p>

<h2>Ozetile</h2>
<p>2026 yilinda basarili eczaneler, teknolojiyi benimseyen, musteri odakli hizmet sunan ve surdurulebilirlik ilkelerini is modellerine entegre eden isletmeler olacaktir.</p>',
                'featured_image' => 'blog/sektor-trendleri.jpg',
                'category_id' => $catMap['sektor-haberleri'],
                'tags' => ['trendler', '2026', 'dijitallesme', 'surdurulebilirlik'],
                'meta_title' => '2026 Eczane Sektoru Trendleri ve Gelecek Beklentileri',
                'meta_description' => '2026 yilinda eczane sektorunu sekillendiren trendler: dijital donusum, kisisellestirilmis saglik ve surdurulebilirlik.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(15),
                'is_featured' => true,
            ],

            // 6. Anne ve Bebek Bakimi Urun Rehberi
            [
                'title' => 'Anne ve Bebek Bakimi Urun Rehberi',
                'slug' => 'anne-ve-bebek-bakimi-urun-rehberi',
                'excerpt' => 'Hamilelik doneminden bebek bakimina kadar eczane raflarindaki en iyi urunleri kesfetmenize yardimci olacak kapsamli rehber.',
                'content' => '<h2>Hamilelik Doneminde Takviye Secimi</h2>
<p>Hamilelik donemi, annnenin besin ihtiyaclarinin artigi ozel bir surectir. Folik asit takviyesi hamilelikin ilk uc ayinda ozellikle onemlidir ve norol tup defektlerinin onlenmesinde kritik role sahiptir. Demir, kalsiyum ve omega-3 yag asitleri de bu donemde duzeli alinmasi gereken diger onemli besinlerdir.</p>

<h2>Bebek Cilt Bakimi</h2>
<p>Yeni dogan bebeklerin cildi son derece hassas ve ince bir yapiya sahiptir. Bebek bakim urunlerinde dikkat edilmesi gereken en onemli kriter, parfumsuz ve hipoalerjenik formullerin tercih edilmesidir.</p>

<h3>Bebek Sampuani</h3>
<p>Goz yasartmayan, pH dengeli formulleri tercih edin. Sulfat icermeyen sampuanlar bebek sac derisini kurutmadan nazikce temizler.</p>

<h3>Pisikolojik Krem</h3>
<p>Cinko oksit iceren koruyucu kremler bebek bezi bolgesesindeki tahrisleri onler ve tedavi eder. Her bez degisiminde ince bir tabaka halinde uygulanmalidir.</p>

<h3>Nemlendirici</h3>
<p>Bebek cildini nemlendirmek icin dogal icerikli, parabensiz ve renklendirici icermeyen losyonlari tercih edin. Banyodan sonra hafifce nemli cilde uygulamak emilimi artirir.</p>

<h2>Emzirme Donemi Destekleri</h2>
<p>Emziren anneler icin laktasyon destekleyicileri, meme ucukusu bakimi icin lanolin bazli kremler ve emzirme yastiklari eczanelerde en cok sorulan urunler arasindadir.</p>

<h2>Dis Cikarma Donemi</h2>
<p>Bebeklerde dis cikarma sureci genellikle 6. aydan itibaren baslar. Bu donemde jel formundaki dogal dis cikarma urunleri, sogutulmus dis kasiklari ve ozel dis macunlari eczane raflarinda yer almalidir.</p>

<h2>Eczaci Olarak Ne Yapmalisiniz?</h2>
<p>Anne ve bebek urunlerinde ozel bir raf dizayn edin, urun bilgi kartlari hazirlatin ve yeni annelere ozel indirim programlari olusturun. Bu segment yuksek sadakat potansiyeline sahiptir.</p>',
                'featured_image' => 'blog/anne-bebek.jpg',
                'category_id' => $catMap['urun-rehberleri'],
                'tags' => ['anne bebek', 'hamilelik', 'bebek bakimi', 'vitamin'],
                'meta_title' => 'Anne ve Bebek Bakimi Urun Rehberi | Eczane',
                'meta_description' => 'Hamilelik takviyelerinden bebek cilt bakimina, emzirme desteklerinden dis cikarma urunlerine kapsamli anne-bebek rehberi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(12),
                'is_featured' => false,
            ],

            // 7. Eczanede Musteri Deneyimini Gelistirmenin 7 Yolu
            [
                'title' => 'Eczanede Musteri Deneyimini Gelistirmenin 7 Yolu',
                'slug' => 'eczanede-musteri-deneyimini-gelistirmenin-7-yolu',
                'excerpt' => 'Eczanenizdeki musteri deneyimini iyilestirmek ve sadik musteriler kazanmak icin uygulanabilir 7 strateji.',
                'content' => '<h2>Musteri Deneyimi Neden Onemlidir?</h2>
<p>Rekabet ortaminda farklilasmak isteyen eczaneler icin musteri deneyimi en guclu silahlardan biridir. Arastirmalar gosteriyor ki, olumlu bir deneyim yasayan musterilerin yuzde sekseni tekrar ayni eczaneye donmektedir.</p>

<h2>1. Kisisel Ilgi ve Danismanlik</h2>
<p>Her musteriyi adiyla karsilamak ve onceki ziyaretlerini hatirlamak guven oluturur. Kisisellestirilmis saglik danismanligi sunarak eczanenizi bir bilgi merkezi konumuna yukseltebilirsiniz.</p>

<h2>2. Bekleme Suresini Azaltma</h2>
<p>Uzun kuyruklar musteri memnuniyetini olumsuz etkiler. Dijital siralama sistemleri, online randevu ve hizli odeme secenekleri bekleme suresini minimuma indirir.</p>

<h2>3. Magaza Duzenlemesi</h2>
<p>Urunlerin kategori bazinda duzenlenmesi, okuakli raf etiketleri ve temiz bir ortam musteri deneyiminin fiziksel boyutunu olusturur. Kolay gezinebilir bir magaza tasarimi musterilerin aradiklari urunu hizla bulmalarini saglar.</p>

<h2>4. Dijital Iletisim Kanallari</h2>
<p>WhatsApp Business, sosyal medya ve web sitesi uzerinden musterilerinize ulasabilir durumda olun. Kampanya bildirimleri, stok bilgilendirmeleri ve saglik ipuclari paylasmak etkilesimi artirir.</p>

<h2>5. Sadakat Programi</h2>
<p>Puan toplama ve odul sistemi, musterilerin tekrar eczanenizi tercih etmesini tesvik eder. Dijital sadakat kartlari fiziksel kartlara gore daha pratik ve takibi kolaydir.</p>

<h2>6. Personel Egitimleri</h2>
<p>Guleryuzlu, bilgili ve cozum odakli personel, musteri deneyiminin en onemli belirleyicisidir. Duzeni egitim programlariyla ekibinizin hem urun bilgisini hem de iletisim becerilerini gelistirin.</p>

<h2>7. Geri Bildirim Toplama</h2>
<p>Musteri memnuniyet anketleri, oneri kutusu veya dijital geri bildirim formlari araciligiyla musterilerinizin sesini dinleyin. Alinan geri bildirimler dogrultusunda surekli iyilestirme yapin.</p>

<h2>Sonuc</h2>
<p>Bu yedi stratejiyi uygulamak, eczanenizin musteri sadakatini artirmasina ve rakiplerinden farklilamasina yardimci olacaktir.</p>',
                'featured_image' => 'blog/musteri-deneyimi.jpg',
                'category_id' => $catMap['eczane-yonetimi'],
                'tags' => ['musteri deneyimi', 'sadakat', 'eczane yonetimi', 'strateji'],
                'meta_title' => 'Eczanede Musteri Deneyimini Gelistirmenin 7 Yolu',
                'meta_description' => 'Eczanenizdeki musteri deneyimini iyilestirmek icin uygulanabilir 7 strateji: danismanlik, dijital iletisim, sadakat programi ve daha fazlasi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(10),
                'is_featured' => false,
            ],

            // 8. Besin Takviyeleri: Dogru Secim Rehberi
            [
                'title' => 'Besin Takviyeleri: Dogru Secim Rehberi',
                'slug' => 'besin-takviyeleri-dogru-secim-rehberi',
                'excerpt' => 'Multivitaminlerden probiyotiklere, besin takviyelerinde dogru secim yapmak icin bilmeniz gereken her sey.',
                'content' => '<h2>Besin Takviyesi Pazari</h2>
<p>Besin takviyesi pazari son yillarda buyuk bir buyume gostermistir. Tuketicilerin saglik bilincinin artmasi ve koruyucu saglik anlayisinin yayginlasmasi bu buyumenin temel nedenleridir. Ancak piyasada yuzlerce marka ve binlerce urun varken, dogru secimi yapmak zorlasmaktadir.</p>

<h2>Multivitaminler</h2>
<p>Genel saglik destegi icin multivitamin takviyeleri en cok tercih edilen urunler arasindadir. Secim yaparken vitamin ve mineral dozlarinin gunluk onerlien degerlere yakin olmasina dikkat edin. Asiri yuksek dozlar faydadan cok zarar verebilir.</p>

<h2>Omega-3 Yag Asitleri</h2>
<p>EPA ve DHA iceren omega-3 takviyeleri kalp sagligi, beyin fonksiyonlari ve eklem sagligi icin onemlidir. Balik yagli kaynaklardan elde edilen takviyelerde agir metal testi yapilmis olmasina dikkat edin. Bitkisel kaynaklardan elde edilenler icin yosun bazli formulleri tercih edin.</p>

<h2>Probiyotikler</h2>
<p>Probiyotik takviyelerinde suf (colony forming unit) sayisi onemlidir. En az 10 milyar CFU iceren ve farkli bakteri suslari barindiran urunleri tercih edin. Sogutulan saklanmasi gereken urunlerin tedarikte soguk zincire uygunlugunu kontrol edin.</p>

<h2>Bitkisel Takviyeler</h2>
<p>Zerdeçal, zencefil, ekinezya ve ginkgo biloba gibi bitkisel takviyeler artan bir taleple karsi karsiya. Standardize edilmis ekstreleri iceren ve GMP sertifikali urunleri onerin. Potansiyel etkilesimler konusunda musterileri bilgilendirin.</p>

<h2>Dogru Secim Icin Kontrol Listesi</h2>
<ul>
<li>Uretim tesisinin GMP sertifikasi var mi?</li>
<li>Bagimsiz laboratuvar test sonuclari mevcut mu?</li>
<li>Aktif madde miktari etikette acikca belirtilmis mi?</li>
<li>Urun allerjen bilgileri acik mi?</li>
<li>Son kullanma tarihi ve saklama kosullari uygun mu?</li>
</ul>

<h2>Eczacinin Sorumlulugu</h2>
<p>Musteri takviye seciminde en cok eczacisina guvenirmektedir. Bu guveni hak etmek icin guncel bilimsel verileri takip edin ve kanitlanmamis iddialari iceren urunlere mesafeli durun.</p>',
                'featured_image' => 'blog/besin-takviyeleri.jpg',
                'category_id' => $catMap['saglik-ve-bakim'],
                'tags' => ['besin takviyesi', 'vitamin', 'probiyotik', 'omega-3'],
                'meta_title' => 'Besin Takviyeleri: Dogru Secim Rehberi',
                'meta_description' => 'Multivitamin, omega-3, probiyotik ve bitkisel takviyelerde dogru secim yapmak icin kapsamli rehber ve kontrol listesi.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(7),
                'is_featured' => false,
            ],

            // 9. B2B Platformlarda Guvenli Alisveris
            [
                'title' => 'B2B Platformlarda Guvenli Alisveris',
                'slug' => 'b2b-platformlarda-guvenli-alisveris',
                'excerpt' => 'B2B eczane platformlarinda guvenli alisveris yapmanin ipuclari ve dikkat edilmesi gereken guvenlik onlemleri.',
                'content' => '<h2>Dijital Ticarette Guvenlik</h2>
<p>B2B platformlar uzerinden yapilan ticaretin artmasiyla birlikte guvenlik konusu da on plana cikmistir. Ozellikle saglik sektoru gibi hassas alanlarda guvenli alisveris yapmak hem yasal zorunluluk hem de mesleki sorumluluktur.</p>

<h2>Platform Seciminde Dikkat Edilecekler</h2>
<h3>Sertifikasyon ve Lisans</h3>
<p>Kullandiginiz B2B platformun resmi lisans ve sertifikalara sahip oldugunu dogrulayin. Saglik Bakanligi onayi, ticaret sicil kaydi ve veri koruma sertifikalari guvenilirlik gostergeleridir.</p>

<h3>SSL ve Veri Guvenligi</h3>
<p>Platformun HTTPS protokolu kullandigini ve SSL sertifikasina sahip oldugunu kontrol edin. Kisisel ve finansal bilgileriniz sifreli baglanti uzerinden iletilmelidir.</p>

<h3>Odeme Guvenligi</h3>
<p>Guvenli odeme sistemleri (3D Secure, PCI DSS uyumlu odeme altyapisi) kullanan platformlari tercih edin. Kredi karti bilgilerinizi kaydetmek yerine her islemde tekrar girmeyi tercih edebilirsiniz.</p>

<h2>Satis Yapan Taraf Icin Guvenlik</h2>
<p>B2B platformlarda urun satan eczaneler de guvenlik onlemleri almalidir. Alici dogrulamasi yapan, odeme garanti sistemi sunan ve anlasmazlik cozum mekanizmasi bulunan platformlar satici haklarini korur.</p>

<h2>Urun Dogrulama</h2>
<p>Satin aldiginiz urunlerin orijinal oldugundan emin olun. Barkod dogrulama, seri numarasi kontrolu ve uretici tarafindan yetkilendirilmis satis kanali kullanimi sahte urunlere karsi korunmanizi saglar. ITS (urun Takip Sistemi) entegrasyonu olan platformlar ek guvenlik katmani sunar.</p>

<h2>Dijital Kayit Tutma</h2>
<p>Tum alisverislerinizin dijital kayitlarini saklayin. Faturalar, siparis onaylari ve teslimat makbuzlari olasi anlasmazliklarda kanit niteligindedir. Platform uzerinden yapilan yazismalar da bu kayitlarin bir parcasidir.</p>

<h2>Sonuc</h2>
<p>Guvenli B2B ticaret, dogru platform secimi ve bilingli kullanim ile mumkundur. Bu kurallara uyarak hem isletmenizi hem de musterilerinizi koruma altina alirsiniz.</p>',
                'featured_image' => 'blog/guvenli-alisveris.jpg',
                'category_id' => $catMap['b2b-ticaret'],
                'tags' => ['guvenlik', 'B2B', 'dijital ticaret', 'odeme'],
                'meta_title' => 'B2B Platformlarda Guvenli Alisveris Rehberi',
                'meta_description' => 'B2B eczane platformlarinda guvenli alisveris ipuclari: platform secimi, odeme guvenligi, urun dogrulama ve dijital kayit tutma.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(4),
                'is_featured' => false,
            ],

            // 10. Sac Bakimi ve Dokulme Onleme Cozumleri
            [
                'title' => 'Sac Bakimi ve Dokulme Onleme Cozumleri',
                'slug' => 'sac-bakimi-ve-dokulme-onleme-cozumleri',
                'excerpt' => 'Sac dokulme nedenleri, etkili bakim rutinleri ve eczanede bulabileceginiz kanitlanmis cozumler.',
                'content' => '<h2>Sac Dokulmesinin Nedenleri</h2>
<p>Sac dokulmesi erkek ve kadinlarin ortak sorunlarindan biridir. Genetik yatkinlik, hormonal degisimler, stres, beslenme eksiklikleri ve cevre faktorleri sac dokulmesine yol acan baslica nedenlerdir. Dogru tedalivi baslatmak icin oncelikle dokulmenin nedenini tespit etmek onemlidir.</p>

<h2>Eczanede Bulunan Cozumler</h2>
<h3>Minoksidil Iceren Urunler</h3>
<p>Minoksidil, sac dokulmesinde en yaygin kullanilan topikal cozumlerden biridir. Erkeklerde yuzde 5, kadinlarda yuzde 2 konsantrasyonlu formulleri mevcuttur. Duzeli kullanildiginda 3-6 ay icerisinde sonuc vermeye baslar.</p>

<h3>Biyotin Takviyeleri</h3>
<p>Biyotin (B7 vitamini), sac, tirnak ve cilt sagligi icin onemli bir besindir. Gunluk 2500-5000 mcg biyotin takviyesi sac guclendirilmesine destek olabilir. Ancak etkisi genetik dokulmelerde sinirlidir.</p>

<h3>Kepek Onleyici Sampuanlar</h3>
<p>Kepek kaynaklı sac dokulmesinde ketokonazol veya cinko pirityon iceren sampuanlar etkilidir. Haftada 2-3 kez kullanim onerilir ve sac derisinde en az 3 dakika bekletilmelidir.</p>

<h2>Saglikli Sac Icin Bakim Rutini</h2>
<ul>
<li>Ilk yikama icin ilik su kullanin, durulama icin serin suyu tercih edin</li>
<li>Islak saca tarak yerine genis disli tarak kullanin</li>
<li>Sac kurutma makinesini dusuk isida ve mesafeli kullanin</li>
<li>Haftada bir kez sac maskesi veya bakim yagi uygulayin</li>
<li>Protein ve demir acisidan zengin beslenin</li>
</ul>

<h2>Ne Zaman Uzmana Basvurmali?</h2>
<p>Ani ve yogun dokulme, yama seklinde sacsiz bolgeler, sac derisinde kizariklik veya kasinti varsa dermatologa yonlendirme yapin. Bu belirtiler altta yatan farkli bir saglik sorununun gostergesi olabilir.</p>

<h2>Eczaci Olarak Yapabilecekleriniz</h2>
<p>Sac bakimi rafini gorse hitap edecek sekilde duzenleyin. Urun seciminde musteriye sac tipi ve dokulme seviyesine gore rehberlik edin. Takviye ve topikal urunlerin dogru kullanimi konusunda bilgilendirme yapin.</p>',
                'featured_image' => 'blog/sac-bakimi.jpg',
                'category_id' => $catMap['saglik-ve-bakim'],
                'tags' => ['sac bakimi', 'sac dokulmesi', 'biyotin', 'minoksidil'],
                'meta_title' => 'Sac Bakimi ve Dokulme Onleme Cozumleri',
                'meta_description' => 'Sac dokulmesi nedenleri, minoksidil ve biyotin cozumleri, saglikli sac bakim rutini ve eczanede bulunan etkili urunler.',
                'status' => 'published',
                'published_at' => $now->copy()->subDays(2),
                'is_featured' => false,
            ],
        ];
    }
}
