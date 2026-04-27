// Koçtaş-style canlı anasayfa
// Bol görsel, kampanya şeritleri, ürün rafları (PSF fiyatlı), video alanı, kategori grid, blog

const CAMPAIGN_CHIPS = [
  { label: "Kampanyalar", active: true, color: "#FF6B1A" },
  { label: "Sana Özel", color: "#1F4ED8" },
  { label: "Düzenle Yenile Tamamla", color: "#16A34A" },
  { label: "İlham & Öneri", color: "#7C3AED" },
];

const TINY_CAT_TILES = [
  { label: "Bahçe Sezonu Özel", bg: "linear-gradient(135deg, #16A34A, #22C55E)" },
  { label: "Yapı Market İndirimi", bg: "linear-gradient(135deg, #1F4ED8, #3B82F6)" },
  { label: "Bosch Fırsatı", bg: "linear-gradient(135deg, #B45309, #F59E0B)" },
  { label: "Ev Stilini Yenile", bg: "linear-gradient(135deg, #DC2626, #F87171)" },
  { label: "Marka Şenliği", bg: "linear-gradient(135deg, #7C3AED, #A78BFA)" },
  { label: "Haftanın Fırsatı", bg: "linear-gradient(135deg, #FFC72C, #FFD66B)", dark: true },
  { label: "Çizgi Yıldızları", bg: "linear-gradient(135deg, #0EA5E9, #38BDF8)" },
  { label: "Küçük Balkon", bg: "linear-gradient(135deg, #EC4899, #F472B6)" },
  { label: "Ofis Tarzı", bg: "linear-gradient(135deg, #475569, #64748B)" },
];

const PRODUCTS_HOT = [
  { brand: "Bosch", title: "GSR 12V-30 Akülü Vidalama (2×2.0Ah)", psf: 10314.64, sellers: 4, rating: 4.7, ratingCount: 248, badge: "Çok Satan", badgeColor: "#16A34A" },
  { brand: "Makita", title: "DDF485RFE 18V Akülü Matkap Set", psf: 14990, sellers: 3, rating: 4.9, ratingCount: 187, badge: "İndirimli", badgeColor: "#DC2626" },
  { brand: "DeWalt", title: "DCD796P2 18V XR Darbeli Matkap", psf: 13500, sellers: 2, rating: 4.6, ratingCount: 92, badge: "Yıldızlı Ürün", badgeColor: "#7C3AED" },
  { brand: "Stanley", title: "STMT0-74101 210 Parça Tornavida Seti", psf: 1890, sellers: 6, rating: 4.5, ratingCount: 320, badge: "Çok Satan", badgeColor: "#16A34A" },
  { brand: "Karcher", title: "K3 Premium Yüksek Basınçlı Yıkama", psf: 6890, sellers: 3, rating: 4.8, ratingCount: 156, badge: "Yeni Fiyat", badgeColor: "#FF6B1A" },
  { brand: "Knipex", title: "70 02 180 Yan Keski Profesyonel", psf: 2150, sellers: 2, rating: 4.9, ratingCount: 71, badge: "İndirimli", badgeColor: "#DC2626" },
];

const PRODUCTS_HEATING = [
  { brand: "Daikin", title: "Icon Premix 22/24 Kw Yoğuşmalı Kombi", psf: 17000, sellers: 4, rating: 4.4, ratingCount: 38, badge: "İndirimli", badgeColor: "#DC2626" },
  { brand: "Demirdöküm", title: "Plus 600x1000 Panel Radyatör", psf: 4250, sellers: 3, rating: 5.0, ratingCount: 12, badge: "Yıldızlı Ürün", badgeColor: "#7C3AED" },
  { brand: "Tek Tek", title: "Tek Tek Teknik 130cm Wifi Bluetooth Şömine", psf: 8990, sellers: 2, rating: 4.7, ratingCount: 22, badge: "Yeni Çıktı", badgeColor: "#FF6B1A" },
  { brand: "Iygo", title: "Iygo Isıtıcı Epk4590m23b Isıtıcı", psf: 3290, sellers: 3, rating: 4.3, ratingCount: 47, badge: "Çok Satan", badgeColor: "#16A34A" },
  { brand: "Vintage", title: "Tektaş Ayaklı Elektrikli Şömine 1800w", psf: 5490, sellers: 2, rating: 4.6, ratingCount: 28, badge: "İndirimli", badgeColor: "#DC2626" },
  { brand: "Demirdöküm", title: "Plus 685x800 Panel Radyatör", psf: 3850, sellers: 4, rating: 4.4, ratingCount: 19, badge: "İndirimli", badgeColor: "#DC2626" },
];

const VIDEOS = [
  { title: "Hızlı Sipariş Sırrı", caption: "10 dakikada 20 ürün sepete", color: "linear-gradient(135deg, #475569, #94A3B8)" },
  { title: "Bayi Karşılaştırma", caption: "En uygun fiyatı bul", color: "linear-gradient(135deg, #15803D, #65A30D)" },
  { title: "Excel ile Toplu Sipariş", caption: "1000 satıra kadar", color: "linear-gradient(135deg, #B91C1C, #F97316)" },
  { title: "Sözleşmeli Fiyat", caption: "Kurumsal avantaj", color: "linear-gradient(135deg, #6D28D9, #A855F7)" },
];

const ICON_CATEGORIES = [
  { name: "Termosifonlar", icon: "package" },
  { name: "Salon ve Oturma Odası", icon: "store" },
  { name: "Yatak Odası", icon: "package" },
  { name: "Bahçe Mobilyaları", icon: "sparkles" },
  { name: "Antre ve Hol", icon: "package" },
  { name: "Kasalar ve Deliciler", icon: "drill" },
  { name: "Banyo Dolapları", icon: "package" },
  { name: "Mutfak Mobilyaları", icon: "store" },
  { name: "Aydınlatma", icon: "bolt" },
  { name: "Dış Mekan", icon: "shield" },
];

const CATEGORY_BANNERS_TOP = [
  { title: "Işıl Işıl 🌟 : Dış Mekan Aydınlatmalar", img: "lighting", price: "1.599 TL", productName: "Vendense Aşağı Bakan Aplik Siyah" },
  { title: "Modern ve Dekoratif 🪞 : Aynalar", img: "mirror", price: "1.580 TL", productName: "Ayaklı Metal Boy Ayna 180x60 SİYA..." },
  { title: "Kullanışlı ve Pratik 🪟 : Ahşap-Bambu Stor", img: "blinds", price: "549,90 TL", productName: "Cips Ahşap Stor Perde 80x180 Bej" },
  { title: "Düzenli Alanlar 🛁 : Banyo Aksesuarları", img: "bath", price: "799 TL", productName: "Üç Katlı Köşeli Banyo Rafı Krom Eski..." },
];

const CAMPAIGN_FEATURED = [
  { title: "Ustabilir'i Keşfet, Güvenli Hizmet Almaya Başla!", sub: "Ustabilir'i Keşfet, Güvenli Hizmet Almaya Başla!", cta: "Hemen Keşfet", bg: "linear-gradient(135deg, #FF6B1A, #C2410C)" },
  { title: "Mağaza Teslim Seçeneğinde Özel Fırsat!", sub: "Mağaza Teslim Seçeneğinde Özel Fırsat!", cta: "Alışverişe Başla", bg: "linear-gradient(135deg, #FFC72C, #F59E0B)", dark: true },
  { title: "Uygulamayı İndir, İndirimli Kap!", sub: "%10 İNDİRİM Sepetine Yansısın", cta: "Alışverişe Başla", bg: "linear-gradient(135deg, #FF6B1A, #FB923C)" },
  { title: "İyi ki Almışım Diyeceğin Ürünler", sub: "İyi ki Almışım Diyeceğin Ürünler", cta: "Alışverişe Başla", bg: "linear-gradient(135deg, #1F4ED8, #3B82F6)" },
];

const BLOG_POSTS = [
  { tag: "MUTFAK", title: "2026 Yılında En Çok Tercih Edilen Mutfak Dolabı Renkleri", img: "kitchen" },
  { tag: "DEKORASYON", title: "Monokrom Tarz ile Dekorasyon Fikirleri", img: "decor" },
  { tag: "LİFESTYLE", title: "Çay ve Kahve Köşesi Fikirleri", img: "coffee" },
];

// ===== HERO =====
const HeroV2 = () => {
  const [active, setActive] = React.useState(0);
  return (
    <div style={{padding:"20px 32px 0"}}>
      <div style={{maxWidth: 1320, margin:"0 auto"}}>
        <div className="row" style={{justifyContent:"center", gap: 6, marginBottom: 16}}>
          {CAMPAIGN_CHIPS.map((c, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              padding:"10px 20px", borderRadius: 999,
              border:"none", cursor:"pointer",
              background: active === i ? c.color : "white",
              color: active === i ? "white" : "var(--ink-700)",
              fontWeight: 700, fontSize: 13,
              boxShadow: active === i ? "0 4px 10px rgba(0,0,0,.08)" : "none",
              border: active === i ? "none" : "1px solid var(--line)"
            }}>{c.label} {i === 0 ? "🔥" : i === 1 ? "✨" : i === 3 ? "💡" : ""}</button>
          ))}
        </div>

        <div className="card" style={{padding: 0, overflow:"hidden", display:"grid", gridTemplateColumns:"360px 1fr", minHeight: 320}}>
          <div style={{padding:"40px 32px", display:"flex", flexDirection:"column", justifyContent:"center", background:"white"}}>
            <div style={{fontSize: 32, fontWeight: 800, lineHeight: 1.15, color:"var(--brand-navy)", letterSpacing:"-0.02em"}}>
              Sezonun Yıldızı<br/>Profesyonel Hırdavat 🌿
            </div>
            <div style={{marginTop: 14, color:"var(--ink-500)", fontSize: 13, lineHeight: 1.5}}>
              Bosch, Makita, DeWalt — 22-30 Nisan'a özel %20'ye varan bayi indirimi
            </div>
            <button className="btn" style={{
              background:"#FF6B1A", color:"white", marginTop: 24, padding:"14px 24px",
              fontSize: 14, alignSelf:"flex-start"
            }}>ALIŞVERİŞE BAŞLA</button>
          </div>
          <div style={{
            background:"linear-gradient(135deg, #5EAEC9, #7BC8DC, #4A95B0)",
            position:"relative", display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr", gap: 4, padding: 4
          }}>
            <div style={{
              background:"linear-gradient(135deg, #4A95B0, #5EAEC9)",
              borderRadius: 8, display:"flex", alignItems:"center", justifyContent:"center",
              position:"relative", padding: 24, color:"white", textAlign:"center"
            }}>
              <div>
                <div style={{fontSize:14, fontWeight:800, letterSpacing:"0.06em"}}>BU AVANTAJLAR</div>
                <div style={{fontSize:42, fontWeight:900, color:"#FFF7B0", lineHeight:1, margin:"6px 0", letterSpacing:"-0.02em", textShadow:"0 2px 0 #2C5A6E"}}>HIRDAVAT</div>
                <div style={{fontSize:24, fontWeight:900, color:"#FFE066", lineHeight:1, letterSpacing:"-0.01em"}}>FIRSATLARI</div>
                <div style={{
                  display:"inline-block", marginTop:14, padding:"6px 14px",
                  background:"#FFE066", color:"#2C5A6E", borderRadius: 4,
                  fontWeight: 800, fontSize: 13, letterSpacing:"0.04em"
                }}>22-30 NİSAN</div>
              </div>
            </div>
            <div className="ph" style={{borderRadius: 8, fontSize: 10}}>tools shot</div>
            <div style={{display:"grid", gridTemplateRows:"1fr 1fr", gap: 4}}>
              <div className="ph" style={{borderRadius: 8, fontSize: 10}}>workshop</div>
              <div className="ph" style={{borderRadius: 8, fontSize: 10}}>balcony</div>
            </div>
          </div>
        </div>

        {/* tiny tile strip */}
        <div className="row gap-8" style={{marginTop: 14, justifyContent:"center", flexWrap:"nowrap", overflowX:"auto"}}>
          <button style={{width:32, height:32, borderRadius:"50%", background:"#FF6B1A", color:"white", border:"none", display:"grid", placeItems:"center", flexShrink:0}}>
            <Icon name="chevron-left" size={14}/>
          </button>
          {TINY_CAT_TILES.map((t, i) => (
            <div key={i} style={{
              padding:"10px 14px", borderRadius: 8,
              background: t.bg, color: t.dark ? "var(--brand-navy)" : "white",
              fontSize: 11, fontWeight: 800, whiteSpace:"nowrap",
              cursor:"pointer", flexShrink: 0,
              boxShadow:"0 2px 6px rgba(0,0,0,.08)"
            }}>{t.label}</div>
          ))}
          <button style={{width:32, height:32, borderRadius:"50%", background:"#FF6B1A", color:"white", border:"none", display:"grid", placeItems:"center", flexShrink:0}}>
            <Icon name="chevron-right" size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== TWO BIG ATTENTION BANNERS =====
const AttentionBanners = () => (
  <div style={{padding:"32px 32px 0"}}>
    <div style={{maxWidth: 1320, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14}}>
      <div style={{
        background:"linear-gradient(90deg, #FFE9C4, #FFF7E0)",
        borderRadius: 12, padding:"18px 22px",
        display:"flex", alignItems:"center", gap: 16,
        position:"relative", overflow:"hidden"
      }}>
        <div className="ph" style={{width: 70, height: 70, borderRadius: 8, fontSize: 8}}>magazine</div>
        <div>
          <div style={{fontSize: 22, fontWeight: 900, color:"#B45309", letterSpacing:"-0.01em"}}>
            VİTRİN NİSAN <span style={{color:"#9A3412"}}>SAYISI ÇIKTI!</span>
          </div>
          <div style={{fontSize: 11, color:"#7C2D12", marginTop: 2}}>
            En öne çıkan kampanyaları ve yeni gelen ürünleri tek bir yerde derledik.
          </div>
        </div>
      </div>
      <div style={{
        background:"linear-gradient(90deg, #FF6B1A, #C2410C)",
        borderRadius: 12, padding:"18px 22px", color:"white",
        display:"flex", alignItems:"center", gap: 16, position:"relative", overflow:"hidden"
      }}>
        <div style={{width:70, height:70, borderRadius:10, background:"rgba(255,255,255,.2)", display:"grid", placeItems:"center"}}>
          <span style={{fontSize: 11, fontWeight:800, letterSpacing:"0.05em"}}>ihirdavatLIVE</span>
        </div>
        <div>
          <div style={{fontSize: 24, fontWeight: 900, letterSpacing:"-0.01em"}}>İZLE, KEŞFET, İLHAM AL!</div>
          <div style={{fontSize: 12, marginTop: 4, opacity:.95}}>Profesyonel ustaların kullandığı ürünleri canlı yayında görün.</div>
        </div>
      </div>
    </div>
  </div>
);

// ===== 3 ZONE BANNER ROW (juzdan/yatak/bahçe) =====
const ZoneBanners = () => (
  <div style={{padding:"14px 32px 0"}}>
    <div style={{maxWidth: 1320, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1.4fr 1fr", gap: 12}}>
      <div style={{
        background:"linear-gradient(135deg, #FCE7F3, #F5D0FE)",
        borderRadius: 12, padding: 18, position:"relative", overflow:"hidden", minHeight: 180,
        display:"flex", flexDirection:"column"
      }}>
        <div style={{fontSize: 20, fontWeight: 900, color:"#7C3AED", lineHeight: 1.1, letterSpacing:"-0.01em"}}>Cüzdan'ı doldurma vakti</div>
        <div style={{fontSize: 11, color:"#86198F", marginTop: 6, lineHeight: 1.5}}>
          Tüm sarf malzemelerini tek yerden topla,<br/>bir cüzdan'a doldur.
        </div>
        <div className="ph" style={{position:"absolute", bottom: -10, right: -10, width: 130, height: 130, borderRadius:"50%", fontSize: 9}}>person</div>
      </div>
      <div style={{
        background:"linear-gradient(120deg, #1E293B, #334155)",
        borderRadius: 12, padding: 18, color:"white",
        position:"relative", overflow:"hidden", minHeight: 180
      }}>
        <div style={{fontSize: 11, fontWeight: 800, letterSpacing:"0.1em", color:"#FFC72C"}}>KONFORLU UYKULARIN SIRRI</div>
        <div style={{fontSize: 22, fontWeight: 900, marginTop: 6}}>
          YATAK & BAZALARDA İNDİRİM
        </div>
        <div className="row gap-8" style={{marginTop: 12}}>
          <div className="ph" style={{flex:1, height: 100, borderRadius: 8, fontSize: 9}}>bedroom</div>
          <div className="ph" style={{flex:1, height: 100, borderRadius: 8, fontSize: 9}}>bedroom</div>
          <div className="ph" style={{flex:1, height: 100, borderRadius: 8, fontSize: 9}}>nirox</div>
        </div>
      </div>
      <div style={{
        background:"linear-gradient(135deg, #FFFFFF, #FFF7E0)",
        borderRadius: 12, padding: 18, position:"relative", overflow:"hidden", minHeight: 180,
        border:"1px solid var(--line)"
      }}>
        <div style={{fontSize: 11, fontWeight: 700, color:"#FF6B1A"}}>Erinöz</div>
        <div style={{fontSize: 18, fontWeight: 900, color:"var(--brand-navy)", marginTop: 4, lineHeight: 1.1}}>
          Kış Bahçesi
        </div>
        <div style={{fontSize: 11, color:"var(--ink-500)", marginTop: 4}}>Sayıf Kalacak Mobilyalarında</div>
        <div style={{
          display:"inline-block", marginTop: 10, padding:"6px 12px",
          background:"#16A34A", color:"white", borderRadius: 4,
          fontWeight: 800, fontSize: 11
        }}>İNDİRİMLİ FİYATLAR</div>
        <div style={{
          display:"inline-block", marginTop: 8, padding:"4px 10px",
          background:"#FF6B1A", color:"white", borderRadius: 99,
          fontWeight: 700, fontSize: 10, marginLeft: 6
        }}>HEMEN İNCELE</div>
        <div className="ph" style={{position:"absolute", bottom:0, right:-10, width:130, height: 130, borderRadius: 12, fontSize:9}}>furniture</div>
      </div>
    </div>
  </div>
);

// ===== CATEGORY MINI CARDS WITH FEATURED PRODUCT =====
const CategoryMiniCards = ({ items }) => (
  <div style={{padding:"24px 32px 0"}}>
    <div style={{maxWidth: 1320, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 14}}>
      {items.map((c, i) => (
        <div key={i} className="card" style={{padding: 14, cursor:"pointer"}}>
          <div className="row" style={{justifyContent:"space-between", alignItems:"center", marginBottom: 10}}>
            <div style={{fontSize: 13, fontWeight: 700, color:"var(--brand-navy)", lineHeight:1.3}}>{c.title}</div>
            <div style={{width: 28, height: 28, borderRadius:"50%", background:"#FF6B1A", color:"white", display:"grid", placeItems:"center", flexShrink: 0}}>
              <Icon name="chevron-right" size={14}/>
            </div>
          </div>
          <div className="ph" style={{aspectRatio:"4/3", borderRadius: 8, position:"relative"}}>
            shot · {c.img}
            <div style={{
              position:"absolute", top: 8, left: 8,
              background:"#DC2626", color:"white",
              padding:"3px 10px", borderRadius: 99,
              fontSize: 10, fontWeight: 800, letterSpacing:"0.04em"
            }}>EV STİLİNİ DEĞİŞTİRME ZAMANI! 🔥</div>
            <div style={{
              position:"absolute", bottom: 0, left: 0, right: 0,
              background:"rgba(255,255,255,.95)",
              padding:"8px 10px",
              display:"flex", justifyContent:"space-between", alignItems:"center", gap: 6
            }}>
              <div style={{fontSize: 10, color:"var(--ink-700)", fontWeight: 600, lineHeight: 1.2, flex: 1}}>{c.productName}</div>
              <div style={{fontSize: 13, fontWeight: 800, color:"var(--brand-navy)", whiteSpace:"nowrap"}}>{c.price}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ===== PRODUCT CARD (PSF only) =====
const ProductCardK = ({ p }) => {
  const [fav, setFav] = React.useState(false);
  return (
    <div className="card" style={{display:"flex", flexDirection:"column"}}>
      <div className="ph" style={{aspectRatio:"1/1", borderRadius:"14px 14px 0 0", position:"relative"}}>
        product · {p.brand}
        {p.badge && (
          <div style={{
            position:"absolute", top: 10, left: 10,
            background: p.badgeColor, color:"white",
            padding:"5px 10px 5px 8px", borderRadius: 99,
            fontSize: 10, fontWeight: 800, letterSpacing:"0.02em",
            display:"inline-flex", alignItems:"center", gap: 4
          }}>
            <Icon name={p.badge === "İndirimli" ? "tag" : p.badge === "Yıldızlı Ürün" ? "star" : p.badge === "Çok Satan" ? "trending" : "sparkles"} size={11}/>
            {p.badge}
          </div>
        )}
        <button onClick={() => setFav(f => !f)} style={{
          position:"absolute", top: 10, right: 10,
          width: 30, height: 30, borderRadius: 8,
          background: fav ? "#FEECEC" : "rgba(255,255,255,.9)",
          border:"none",
          color: fav ? "var(--danger)" : "var(--ink-500)",
          display:"grid", placeItems:"center", cursor:"pointer"
        }}>
          <Icon name={fav ? "heart-fill" : "heart"} size={14}/>
        </button>
      </div>
      <div style={{padding: 12, display:"flex", flexDirection:"column", gap: 6, flex:1}}>
        <div className="row gap-4" style={{fontSize: 11}}>
          <Stars value={p.rating} size={11}/>
          <span style={{color:"var(--ink-500)"}}>({p.ratingCount})</span>
        </div>
        <div style={{fontSize: 12, color:"var(--ink-700)", lineHeight: 1.35, minHeight: 32}}>
          <b style={{color:"var(--brand-navy)"}}>{p.brand}</b> {p.title}
        </div>
        <div style={{flex:1}}/>
        <div>
          <div style={{fontSize: 10, color:"var(--ink-400)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700}}>PSF</div>
          <div style={{fontSize: 17, fontWeight: 800, color:"var(--brand-navy)", letterSpacing:"-0.01em"}}>
            {fmtTRY(p.psf)} <span style={{fontSize: 11, color:"var(--ink-500)", fontWeight: 600}}>TL</span>
          </div>
        </div>
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          paddingTop: 8, borderTop:"1px solid var(--line-2)", marginTop: 4
        }}>
          <a style={{fontSize: 11, color:"var(--brand-blue)", fontWeight: 600}}>
            {p.sellers} bayi ilanı →
          </a>
          <button style={{
            background:"transparent", border:"1px solid var(--line)", borderRadius: 6,
            padding:"5px 8px", color:"var(--ink-700)", cursor:"pointer", fontSize: 11
          }}>
            <Icon name="cart" size={11}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductRailK = ({ title, products, accentColor }) => (
  <div style={{padding:"32px 32px 0"}}>
    <div style={{maxWidth: 1320, margin:"0 auto"}}>
      <div className="row" style={{justifyContent:"space-between", alignItems:"center", marginBottom: 14}}>
        <h2 style={{margin: 0, fontSize: 20, fontWeight: 800, letterSpacing:"-0.02em", color:"var(--brand-navy)"}}>{title}</h2>
        <a style={{fontSize: 12, color:"#FF6B1A", fontWeight: 700}}>Tümünü Keşfet ›</a>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap: 12, position:"relative"}}>
        {products.map((p, i) => <ProductCardK key={i} p={p}/>)}
      </div>
    </div>
  </div>
);

// ===== VIDEO SECTION =====
const VideoSection = () => (
  <div style={{padding:"32px 32px 0"}}>
    <div style={{maxWidth: 1320, margin:"0 auto"}}>
      <h2 style={{margin: "0 0 14px", fontSize: 20, fontWeight: 800, letterSpacing:"-0.02em", color:"var(--brand-navy)"}}>İyi ki Almışım Diyeceğiniz Ürünler</h2>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 12}}>
        {VIDEOS.map((v, i) => (
          <div key={i} style={{
            aspectRatio:"3/4", borderRadius: 12,
            background: v.color, position:"relative", overflow:"hidden",
            cursor:"pointer", color:"white"
          }}>
            <div style={{position:"absolute", top: 12, left: 12, fontSize: 11, fontWeight: 800, letterSpacing:"0.05em", textShadow:"0 1px 2px rgba(0,0,0,.4)"}}>
              İYİ Kİ ALMIŞIM
            </div>
            <div style={{position:"absolute", bottom: 12, left: 12, right: 12}}>
              <div style={{fontSize: 12, fontWeight:700}}>@ihirdavat</div>
              <div className="row" style={{justifyContent:"space-between", marginTop: 8}}>
                <div style={{
                  width: 30, height: 30, borderRadius:"50%", background:"rgba(255,255,255,.25)",
                  display:"grid", placeItems:"center"
                }}>▶</div>
                <div style={{fontSize: 10, fontWeight:600, opacity:.9}}>{v.caption}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ===== ICON CATEGORY SCROLLER =====
const IconCategoryScroller = () => (
  <div style={{padding:"32px 32px 0"}}>
    <div style={{maxWidth: 1320, margin:"0 auto"}}>
      <h2 style={{margin: "0 0 14px", fontSize: 20, fontWeight: 800, letterSpacing:"-0.02em", color:"var(--brand-navy)"}}>İlgini Çekebilecek Kategoriler 😊</h2>
      <div className="row" style={{gap: 6, position:"relative"}}>
        <button style={{width: 30, height: 30, borderRadius:"50%", background:"white", border:"1px solid var(--line)", display:"grid", placeItems:"center", color:"var(--ink-700)", flexShrink: 0}}>
          <Icon name="chevron-left" size={14}/>
        </button>
        <div style={{display:"grid", gridTemplateColumns:"repeat(10, 1fr)", gap: 12, flex: 1}}>
          {ICON_CATEGORIES.map((c, i) => (
            <div key={i} style={{textAlign:"center", cursor:"pointer"}}>
              <div className="ph" style={{
                aspectRatio:"1/1", borderRadius:"50%",
                marginBottom: 8, fontSize: 9
              }}>{c.name.slice(0, 4)}</div>
              <div style={{fontSize: 11, color:"var(--ink-700)", fontWeight: 500, lineHeight: 1.25}}>
                {c.name}
              </div>
            </div>
          ))}
        </div>
        <button style={{width: 30, height: 30, borderRadius:"50%", background:"white", border:"1px solid var(--line)", display:"grid", placeItems:"center", color:"var(--ink-700)", flexShrink:0}}>
          <Icon name="chevron-right" size={14}/>
        </button>
      </div>
    </div>
  </div>
);

// ===== FEATURED CAMPAIGN GRID =====
const FeaturedCampaigns = () => (
  <div style={{padding:"32px 32px 0"}}>
    <div style={{maxWidth: 1320, margin:"0 auto"}}>
      <div className="row" style={{justifyContent:"space-between", alignItems:"center", marginBottom: 14}}>
        <h2 style={{margin: 0, fontSize: 20, fontWeight: 800, letterSpacing:"-0.02em", color:"var(--brand-navy)"}}>Öne Çıkan Kampanyalar</h2>
        <a style={{fontSize: 12, color:"#FF6B1A", fontWeight: 700}}>Tümünü Keşfet ›</a>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 14}}>
        {CAMPAIGN_FEATURED.map((c, i) => (
          <div key={i} style={{cursor:"pointer"}}>
            <div style={{
              background: c.bg,
              aspectRatio:"4/5",
              borderRadius: 12,
              padding: 18,
              color: c.dark ? "var(--brand-navy)" : "white",
              display:"flex", flexDirection:"column", justifyContent:"space-between",
              position:"relative", overflow:"hidden"
            }}>
              <div style={{fontSize: 18, fontWeight: 900, lineHeight: 1.15, letterSpacing:"-0.01em", maxWidth: 200}}>
                {c.title}
              </div>
              <div style={{
                display:"inline-flex", alignSelf:"flex-start",
                padding:"8px 14px", background:"white", color:"var(--brand-navy)",
                fontSize: 12, fontWeight: 800, borderRadius: 4
              }}>{c.cta}</div>
            </div>
            <div style={{fontSize: 12, fontWeight: 600, color:"var(--ink-700)", marginTop: 8, lineHeight: 1.3}}>{c.sub}</div>
            <a style={{fontSize: 11, color:"var(--brand-blue)", fontWeight: 600, marginTop: 4, display:"block", textDecoration:"underline"}}>Alışverişe Başla</a>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ===== BLOG =====
const BlogSection = () => (
  <div style={{padding:"32px 32px 0"}}>
    <div style={{maxWidth: 1320, margin:"0 auto"}}>
      <div style={{marginBottom: 14}}>
        <span style={{fontSize: 22, fontWeight: 900, color:"#FF6B1A", letterSpacing:"-0.01em"}}>YAŞAYAN</span><br/>
        <span style={{fontSize: 28, fontWeight: 900, color:"#0A1F44", letterSpacing:"-0.02em"}}>EVLER </span>
        <span style={{fontSize: 22, fontWeight: 600, color:"#7C3AED", fontStyle:"italic"}}>Blog</span>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 14}}>
        {BLOG_POSTS.map((b, i) => (
          <div key={i} className="card" style={{cursor:"pointer", overflow:"hidden"}}>
            <div className="ph" style={{aspectRatio:"16/10", borderRadius: 0, fontSize: 10}}>{b.img}</div>
            <div style={{padding: 16}}>
              <div style={{fontSize: 10, fontWeight:800, color:"#FF6B1A", letterSpacing:"0.06em"}}>{b.tag}</div>
              <div style={{fontSize: 14, fontWeight: 700, color:"var(--brand-navy)", marginTop: 6, lineHeight: 1.3}}>
                {b.title}
              </div>
              <a style={{fontSize: 12, color:"var(--brand-blue)", fontWeight: 600, marginTop: 8, display:"inline-block"}}>
                Blog'da İncele ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Anasayfa = () => (
  <Chrome breadcrumbs={false}>
    <div style={{paddingBottom: 40, background:"var(--bg)"}}>
      <HeroV2 />
      <AttentionBanners />
      <ZoneBanners />
      <CategoryMiniCards items={CATEGORY_BANNERS_TOP}/>
      <ProductRailK title="Yakın Zamanda İncelediklerin 🔍😍" products={PRODUCTS_HOT}/>
      <ProductRailK title="Isıtma & Soğutma Kategorisinin Yıldızları ⭐" products={PRODUCTS_HEATING}/>
      <ProductRailK title="i-hirdavat'ın Çok Satan Ürünleri 🚀" products={PRODUCTS_HOT}/>
      <FeaturedCampaigns />
      <VideoSection />
      <IconCategoryScroller />
      <BlogSection />
    </div>
  </Chrome>
);

window.Anasayfa = Anasayfa;
