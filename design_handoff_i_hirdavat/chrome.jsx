// Shared chrome — H3 header + N3 navbar + F2 footer
const Chrome = ({ children, label, badge, breadcrumbs }) => (
  <div className="ih-frame">
    {/* ===== H3 — top promo strip + minimal white header ===== */}
    <div style={{background:"#0A1F44", color:"#C7D0E4", fontSize:11, padding:"6px 32px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
      <div style={{display:"flex", gap:18}}>
        <span><Icon name="truck" size={11}/> 16:00'a kadar siparişlerde aynı gün kargo</span>
        <span><Icon name="wallet" size={11}/> Vadeli ödemede %0 faiz</span>
        <span><Icon name="shield" size={11}/> 7/24 bayi destek</span>
      </div>
      <div style={{display:"flex", gap:14}}>
        <a>Bayi Ol</a>
        <span style={{color:"rgba(255,255,255,.2)"}}>|</span>
        <a>Yardım</a>
        <span style={{color:"rgba(255,255,255,.2)"}}>|</span>
        <a>TR ▾</a>
      </div>
    </div>

    <div style={{background:"white", padding:"20px 32px", borderBottom:"1px solid var(--line)", display:"grid", gridTemplateColumns:"auto 1fr auto", gap:32, alignItems:"center"}}>
      <a href="Anasayfa.html" className="ih-logo">
        <div className="ih-logo-mark">İ</div>
        <div>i-hirdavat<small>B2B PAZARYERİ</small></div>
      </a>
      <div style={{display:"flex", flexDirection:"column", gap:6}}>
        <div style={{display:"flex", border:"1px solid var(--line)", borderRadius:10, overflow:"hidden", background:"var(--bg-soft)", height:48}}>
          <input placeholder="Aradığın ürünü, markayı veya SKU'yu yaz..." style={{flex:1, border:"none", padding:"0 18px", fontSize:14, outline:"none", background:"transparent"}}/>
          <button style={{background:"var(--brand-blue)", color:"white", border:"none", padding:"0 24px", fontWeight:700, display:"flex", gap:8, alignItems:"center"}}>
            <Icon name="search" size={16}/>
          </button>
        </div>
        <div style={{display:"flex", gap:10, fontSize:11, color:"var(--ink-500)"}}>
          Popüler:
          <a style={{color:"var(--brand-blue)"}}>Bosch matkap</a>
          <a style={{color:"var(--brand-blue)"}}>iş güvenliği eldiveni</a>
          <a style={{color:"var(--brand-blue)"}}>Karcher yıkama</a>
          <a style={{color:"var(--brand-blue)"}}>İzeltaş pense</a>
        </div>
      </div>
      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <button className="btn btn-yellow"><Icon name="bolt" size={14}/> Hızlı Sipariş</button>
        <a style={{padding:10, color:"var(--ink-700)", cursor:"pointer"}}><Icon name="heart" size={20}/></a>
        <a style={{padding:10, color:"var(--ink-700)", cursor:"pointer"}}><Icon name="user" size={20}/></a>
        <button style={{background:"var(--brand-navy)", color:"white", border:"none", borderRadius:8, padding:"10px 16px", display:"flex", gap:8, fontWeight:600, fontSize:13, alignItems:"center", cursor:"pointer"}}>
          <Icon name="cart" size={16}/> Sepet (3) · 1.299 TL
        </button>
      </div>
    </div>

    {/* ===== N3 — category bar with mega menu hover ===== */}
    <ChromeNavbar />

    <div className="ih-breadcrumbs" style={{display: breadcrumbs === false ? "none" : "flex"}}>
      {breadcrumbs ? breadcrumbs : (
        <>
          <a>Anasayfa</a>
          <span className="sep">/</span>
          <a>Matkap</a>
          <span className="sep">/</span>
          <a>Akülü</a>
          <span className="sep">/</span>
          <span className="current">{PRODUCT.title}</span>
        </>
      )}
    </div>

    {children}

    <Footer />
  </div>
);

// N3 — category navbar with mega menu (hover to open)
const NAV_CATEGORIES = [
  { name: "Tüm Kategoriler", icon: "menu", primary: true },
  { name: "El Aletleri", icon: "drill", hot: true },
  { name: "Elektrikli Aletler", icon: "bolt" },
  { name: "İş Güvenliği", icon: "shield" },
  { name: "Bağlantı Elemanları", icon: "package" },
  { name: "Ölçüm Aletleri", icon: "info" },
  { name: "Aydınlatma", icon: "sparkles" },
  { name: "Hidrolik & Pnömatik", icon: "wrench" },
];

const MEGA_SUBCATS = {
  "Tüm Kategoriler": ["El Aletleri", "Elektrikli Aletler", "İş Güvenliği", "Bağlantı Elemanları", "Ölçüm Aletleri", "Aydınlatma", "Hidrolik & Pnömatik", "Kaynak", "Boya & Yapı Kimyası"],
  "El Aletleri": ["Pense & Yan Keski", "Tornavida Setleri", "İngiliz Anahtarları", "Çekiç & Balyoz", "Mengene", "Testere"],
  "Elektrikli Aletler": ["Matkap & Vidalama", "Taşlama", "Kırıcı & Delici", "Hava Üfleyici", "Profil Kesme", "Spiral Makinaları"],
  "İş Güvenliği": ["İş Eldiveni", "Baret & Kask", "Koruyucu Gözlük", "İş Ayakkabısı", "Maske & Filtre", "Kulaklık"],
  "Bağlantı Elemanları": ["Cıvata & Somun", "Vida & Çivi", "Pul & Rondela", "Kelepçe & Hortum", "Saplama"],
  "Ölçüm Aletleri": ["Şerit Metre", "Lazer Metre", "Su Terazisi", "Kumpas", "Termal Kamera"],
  "Aydınlatma": ["LED Projektör", "El Feneri", "Kafa Lambası", "Atölye Lambası"],
  "Hidrolik & Pnömatik": ["Hortum & Rakor", "Kompresör", "Pnömatik Tabanca", "Hidrolik Pompa"],
};

const MEGA_BRANDS = ["Bosch", "Makita", "DeWalt", "Stanley", "İzeltaş", "Bahco", "Knipex", "Hilti"];

const ChromeNavbar = () => {
  const [hover, setHover] = React.useState(null);
  return (
    <div style={{position:"relative", zIndex:50}} onMouseLeave={() => setHover(null)}>
      <div style={{background:"#0F2552", padding:"0 32px", display:"flex"}}>
        {NAV_CATEGORIES.map((c, i) => {
          const isHover = hover === i;
          return (
            <div key={i}
              onMouseEnter={() => setHover(i)}
              style={{
                padding:"12px 18px", fontSize:13, color:"white",
                fontWeight: c.primary ? 700 : 500,
                cursor:"pointer", display:"flex", gap:8, alignItems:"center",
                background: c.primary ? "rgba(255,199,44,.12)" : (isHover ? "rgba(255,255,255,.06)" : "transparent"),
                borderBottom: isHover ? "2px solid var(--brand-yellow)" : "2px solid transparent",
                marginBottom: -2,
                position:"relative"
              }}>
              <Icon name={c.icon} size={14}/>
              {c.name}
              {c.hot && <span style={{background:"var(--danger)", color:"white", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:3, marginLeft:4}}>HOT</span>}
              {c.primary && <Icon name="chevron-down" size={11}/>}
            </div>
          );
        })}
        <div style={{flex:1}}/>
        <a style={{padding:"12px 18px", fontSize:13, color:"var(--brand-yellow)", fontWeight:700, display:"flex", gap:6, alignItems:"center", cursor:"pointer"}}>
          🔥 Kampanyalar
        </a>
      </div>

      {/* mega menu panel */}
      {hover !== null && MEGA_SUBCATS[NAV_CATEGORIES[hover].name] && (
        <div style={{
          position:"absolute", left:0, right:0, top:"100%",
          background:"white", borderBottom:"1px solid var(--line)",
          boxShadow:"var(--shadow-lg)", padding:"24px 32px",
          display:"grid", gridTemplateColumns:"220px 1fr 240px", gap:32
        }}>
          <div>
            <div style={{fontSize:11, fontWeight:800, color:"var(--brand-navy)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12}}>
              {NAV_CATEGORIES[hover].name}
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:8, fontSize:13}}>
              {MEGA_SUBCATS[NAV_CATEGORIES[hover].name].map(s => (
                <a key={s} style={{color:"var(--ink-700)", fontWeight:500, cursor:"pointer"}}>{s}</a>
              ))}
              <a style={{color:"var(--brand-blue)", fontWeight:600, marginTop:4, cursor:"pointer"}}>Tümünü Gör →</a>
            </div>
          </div>
          <div>
            <div style={{fontSize:11, fontWeight:800, color:"var(--brand-navy)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12}}>Popüler Markalar</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8}}>
              {MEGA_BRANDS.map(b => (
                <div key={b} style={{padding:"10px 12px", border:"1px solid var(--line)", borderRadius:6, fontSize:12, fontWeight:600, textAlign:"center", color:"var(--ink-700)", cursor:"pointer"}}>{b}</div>
              ))}
            </div>
          </div>
          <div style={{background:"linear-gradient(135deg, #FFC72C, #FFD66B)", borderRadius:8, padding:18, color:"var(--brand-navy)"}}>
            <div style={{fontSize:10, fontWeight:800, letterSpacing:"0.1em"}}>HAFTANIN FIRSATI</div>
            <div style={{fontSize:14, fontWeight:800, marginTop:6, lineHeight:1.25}}>Bosch Profesyonel'de %20'ye varan indirim</div>
            <button className="btn btn-navy btn-sm" style={{marginTop:12}}>Keşfet →</button>
          </div>
        </div>
      )}
    </div>
  );
};

// F2 — açık zemin, kart tabanlı footer
const Footer = () => (
  <div style={{background:"#F0F2F7", padding:"40px 32px"}}>
    <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginBottom:32}}>
      {[
        {i:"truck", t:"Aynı Gün Kargo", s:"16:00'a kadar siparişlerde"},
        {i:"wallet", t:"Vadeli Ödeme", s:"60 güne kadar %0 faiz"},
        {i:"shield", t:"Güvenli Alışveriş", s:"Bayi onayı + iade garanti"},
        {i:"chat", t:"7/24 Destek", s:"Telefon, mail, canlı destek"},
      ].map((x, i) => (
        <div key={i} className="card" style={{padding:18, display:"flex", gap:14, alignItems:"center", background:"white"}}>
          <div style={{width:44, height:44, borderRadius:10, background:"var(--brand-yellow)", color:"var(--brand-navy)", display:"grid", placeItems:"center", flexShrink:0}}>
            <Icon name={x.i} size={20}/>
          </div>
          <div>
            <div style={{fontSize:14, fontWeight:700, color:"var(--brand-navy)"}}>{x.t}</div>
            <div style={{fontSize:11, color:"var(--ink-500)", marginTop:2}}>{x.s}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr", gap:32, paddingBottom:24, borderBottom:"1px solid var(--line)"}}>
      <div>
        <div className="ih-logo">
          <div className="ih-logo-mark">İ</div>
          <div>i-hirdavat<small>B2B PAZARYERİ</small></div>
        </div>
        <p style={{marginTop:14, fontSize:12, color:"var(--ink-500)", lineHeight:1.6, maxWidth:280}}>
          Türkiye'nin profesyonel hırdavat ve iş güvenliği pazaryeri. 4.200+ bayi · 280.000+ ürün.
        </p>
        <div style={{marginTop:16, display:"flex", gap:8}}>
          {["X", "in", "ig", "fb", "yt"].map(s => (
            <a key={s} style={{width:32, height:32, borderRadius:"50%", background:"white", border:"1px solid var(--line)", display:"grid", placeItems:"center", fontSize:11, fontWeight:700, color:"var(--ink-700)", cursor:"pointer"}}>{s}</a>
          ))}
        </div>
      </div>
      {[
        {h:"KURUMSAL", l:["Hakkımızda","Kariyer","Bayi Ol","Basın Odası","İletişim"]},
        {h:"YARDIM", l:["Sipariş Takibi","İade & İptal","Kargo","SSS","Canlı Destek"]},
        {h:"YASAL", l:["KVKK Aydınlatma","Çerez Politikası","Mesafeli Satış","Üyelik Sözleşmesi"]},
        {h:"KATEGORİLER", l:["El Aletleri","Elektrikli Aletler","İş Güvenliği","Bağlantı Elemanları","Aydınlatma"]},
      ].map((c, i) => (
        <div key={i}>
          <h4 style={{fontSize:12, fontWeight:800, color:"var(--brand-navy)", letterSpacing:"0.06em", marginBottom:14, marginTop:0}}>{c.h}</h4>
          <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8}}>
            {c.l.map(li => <li key={li}><a style={{fontSize:12, color:"var(--ink-700)", cursor:"pointer"}}>{li}</a></li>)}
          </ul>
        </div>
      ))}
    </div>
    <div style={{paddingTop:18, display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, color:"var(--ink-500)", flexWrap:"wrap", gap:12}}>
      <span>© 2026 i-hirdavat A.Ş. · VKN: 1234567890 · MERSIS: 0123-4567-8901-2345 · ETBIS Onaylı</span>
      <div style={{display:"flex", gap:8}}>
        {["VISA","MasterCard","Troy","Havale","Vadeli","DBS"].map(p => (
          <div key={p} style={{padding:"4px 10px", background:"white", border:"1px solid var(--line)", borderRadius:4, fontSize:10, fontWeight:700, color:"var(--ink-700)"}}>{p}</div>
        ))}
      </div>
    </div>
  </div>
);

window.Chrome = Chrome;
