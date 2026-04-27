// Header / Kategori Navbar / Footer — yeni tasarım varyasyonları
// Tek bir canvas üzerinde 3 alternatif sunulur

// =============================================
// HEADER VARIATIONS
// =============================================

// H1 — İki katlı, geniş arama, kategori dropdown'lı
const HeaderV1 = () => (
  <div>
    <div style={{background:"#0A1F44", color:"#C7D0E4", fontSize:11, padding:"6px 32px", display:"flex", justifyContent:"space-between"}}>
      <div className="row gap-16">
        <span><Icon name="truck" size={11}/> 16:00'a kadar siparişlerde aynı gün kargo</span>
        <span><Icon name="wallet" size={11}/> Vadeli ödemede %0 faiz</span>
        <span><Icon name="shield" size={11}/> 7/24 bayi destek</span>
      </div>
      <div className="row gap-12">
        <a>Bayi Ol</a>
        <span style={{color:"rgba(255,255,255,.2)"}}>|</span>
        <a>Yardım</a>
        <span style={{color:"rgba(255,255,255,.2)"}}>|</span>
        <a><Icon name="info" size={11}/> TR ▾</a>
      </div>
    </div>
    <div style={{background:"white", padding:"18px 32px", borderBottom:"1px solid var(--line)", display:"flex", gap:24, alignItems:"center"}}>
      <div className="ih-logo">
        <div className="ih-logo-mark">İ</div>
        <div>i-hirdavat<small>B2B PAZARYERİ</small></div>
      </div>
      <div style={{flex:1, display:"flex", border:"2px solid var(--brand-yellow)", borderRadius:10, overflow:"hidden", background:"white"}}>
        <button style={{background:"var(--bg-soft)", border:"none", padding:"0 14px", fontSize:13, fontWeight:600, color:"var(--brand-navy)", borderRight:"1px solid var(--line)", display:"flex", gap:6, alignItems:"center"}}>
          Tüm Kategoriler <Icon name="chevron-down" size={12}/>
        </button>
        <input placeholder="Bosch GSR 12V-30, eldiven, vida... ara" style={{flex:1, border:"none", padding:"0 16px", fontSize:14, outline:"none"}}/>
        <button style={{background:"var(--brand-navy)", color:"white", border:"none", padding:"0 28px", fontWeight:700, fontSize:14, display:"flex", gap:8, alignItems:"center"}}>
          <Icon name="search" size={16}/> Ara
        </button>
      </div>
      <div className="row gap-4">
        {[{i:"bolt", t:"Hızlı", s:"Sipariş"}, {i:"user", t:"Hesabım", s:"Giriş yap"}, {i:"heart", t:"Favori"}, {i:"cart", t:"Sepet", c:3}].map((a, i) => (
          <a key={i} style={{padding:"8px 14px", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative"}}>
            <div style={{position:"relative", color:"var(--ink-700)"}}>
              <Icon name={a.i} size={20}/>
              {a.c && <span style={{position:"absolute", top:-4, right:-8, background:"var(--danger)", color:"white", fontSize:9, fontWeight:700, borderRadius:99, padding:"1px 5px"}}>{a.c}</span>}
            </div>
            <div style={{fontSize:10, color:"var(--ink-700)", fontWeight:600}}>{a.t}</div>
            {a.s && <div style={{fontSize:9, color:"var(--ink-400)"}}>{a.s}</div>}
          </a>
        ))}
      </div>
    </div>
  </div>
);

// H2 — Tek katlı kompakt, sarı arama bar
const HeaderV2 = () => (
  <div style={{background:"#0A1F44", padding:"14px 32px", display:"flex", gap:20, alignItems:"center"}}>
    <div style={{display:"flex", alignItems:"center", gap:10, color:"white"}}>
      <div style={{width:38, height:38, borderRadius:8, background:"var(--brand-yellow)", color:"var(--brand-navy)", display:"grid", placeItems:"center", fontWeight:900, fontSize:18}}>İ</div>
      <div style={{fontWeight:800, fontSize:18, letterSpacing:"-0.02em"}}>i-hirdavat</div>
    </div>
    <div style={{flex:1, display:"flex", background:"white", borderRadius:99, overflow:"hidden", height:44}}>
      <select style={{background:"var(--bg-soft)", border:"none", padding:"0 16px", fontSize:13, fontWeight:600, color:"var(--brand-navy)", borderRight:"1px solid var(--line)"}}>
        <option>Tüm Kategoriler</option>
      </select>
      <input placeholder="Ürün, marka, SKU ara..." style={{flex:1, border:"none", padding:"0 16px", fontSize:14, outline:"none"}}/>
      <button style={{background:"var(--brand-yellow)", color:"var(--brand-navy)", border:"none", padding:"0 28px", fontWeight:800, display:"flex", gap:8, alignItems:"center"}}>
        <Icon name="search" size={16}/> ARA
      </button>
    </div>
    <div className="row gap-16" style={{color:"white"}}>
      <a className="row gap-6" style={{fontSize:13}}><Icon name="user" size={18}/> <div><div style={{fontSize:10, color:"#9AA5BF"}}>Giriş yap</div><div style={{fontWeight:700}}>Hesabım</div></div></a>
      <a className="row gap-6" style={{fontSize:13, position:"relative"}}>
        <div style={{position:"relative"}}>
          <Icon name="cart" size={18}/>
          <span style={{position:"absolute", top:-6, right:-8, background:"var(--brand-yellow)", color:"var(--brand-navy)", fontSize:9, fontWeight:800, borderRadius:99, padding:"1px 5px"}}>3</span>
        </div>
        <div><div style={{fontSize:10, color:"#9AA5BF"}}>Sepet</div><div style={{fontWeight:700}}>1.299 TL</div></div>
      </a>
    </div>
  </div>
);

// H3 — Beyaz tabanlı, minimal, geniş arama
const HeaderV3 = () => (
  <div style={{background:"white", padding:"20px 32px", borderBottom:"1px solid var(--line)", display:"grid", gridTemplateColumns:"auto 1fr auto", gap:32, alignItems:"center"}}>
    <div className="ih-logo">
      <div className="ih-logo-mark">İ</div>
      <div>i-hirdavat<small>B2B PAZARYERİ</small></div>
    </div>
    <div style={{display:"flex", flexDirection:"column", gap:6}}>
      <div style={{display:"flex", border:"1px solid var(--line)", borderRadius:10, overflow:"hidden", background:"var(--bg-soft)", height:48}}>
        <input placeholder="Aradığın ürünü, markayı veya SKU'yu yaz..." style={{flex:1, border:"none", padding:"0 18px", fontSize:14, outline:"none", background:"transparent"}}/>
        <button style={{background:"var(--brand-blue)", color:"white", border:"none", padding:"0 24px", fontWeight:700, display:"flex", gap:8, alignItems:"center"}}><Icon name="search" size={16}/></button>
      </div>
      <div className="row gap-12" style={{fontSize:11, color:"var(--ink-500)"}}>
        Popüler: <a style={{color:"var(--brand-blue)"}}>Bosch matkap</a>, <a style={{color:"var(--brand-blue)"}}>iş güvenliği eldiveni</a>, <a style={{color:"var(--brand-blue)"}}>Karcher yıkama</a>
      </div>
    </div>
    <div className="row gap-8">
      <button className="btn btn-yellow"><Icon name="bolt" size={14}/> Hızlı Sipariş</button>
      <a style={{padding:"10px", color:"var(--ink-700)"}}><Icon name="heart" size={20}/></a>
      <a style={{padding:"10px", color:"var(--ink-700)"}}><Icon name="user" size={20}/></a>
      <button style={{background:"var(--brand-navy)", color:"white", border:"none", borderRadius:8, padding:"10px 16px", display:"flex", gap:8, fontWeight:600, fontSize:13, alignItems:"center"}}>
        <Icon name="cart" size={16}/> Sepet (3) · 1.299 TL
      </button>
    </div>
  </div>
);

// =============================================
// CATEGORY NAVBAR VARIATIONS
// =============================================

const CATEGORIES = [
  { name: "El Aletleri", icon: "drill", count: 12400, hot: true },
  { name: "Elektrikli Aletler", icon: "bolt", count: 8200 },
  { name: "İş Güvenliği", icon: "shield", count: 5800 },
  { name: "Bağlantı Elemanları", icon: "package", count: 24000 },
  { name: "Ölçüm Aletleri", icon: "info", count: 1900 },
  { name: "Aydınlatma", icon: "sparkles", count: 3100 },
  { name: "Hidrolik & Pnömatik", icon: "wrench", count: 2200 },
  { name: "Kaynak", icon: "trophy", count: 1450 },
  { name: "Boya & Yapı Kimyası", icon: "tag", count: 4100 },
];

// N1 — Klasik lacivert şerit, sarı altçizgi
const NavbarV1 = () => {
  const [hover, setHover] = React.useState(null);
  return (
    <div style={{background:"var(--brand-navy)", borderBottom:"3px solid var(--brand-yellow)"}}>
      <div style={{display:"flex", padding:"0 32px"}}>
        <div style={{
          background:"var(--brand-yellow)", color:"var(--brand-navy)",
          padding:"14px 18px", fontWeight:800, fontSize:13,
          display:"flex", gap:8, alignItems:"center", marginBottom:-3
        }}>
          <Icon name="menu" size={16}/> TÜM KATEGORİLER <Icon name="chevron-down" size={12}/>
        </div>
        {CATEGORIES.slice(0, 7).map((c, i) => (
          <a key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              padding:"14px 16px", fontSize:13, color: hover===i ? "var(--brand-yellow)" : "#C7D0E4",
              fontWeight: hover===i ? 700 : 500, cursor:"pointer",
              borderBottom: hover===i ? "3px solid var(--brand-yellow)" : "3px solid transparent",
              marginBottom:-3,
              display:"flex", gap:6, alignItems:"center"
            }}>
            {c.name}
            {c.hot && <span style={{background:"var(--danger)", color:"white", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:3}}>HOT</span>}
          </a>
        ))}
        <div style={{flex:1}}/>
        <a style={{padding:"14px 16px", fontSize:13, color:"var(--brand-yellow)", fontWeight:700}}>🔥 Kampanyalar</a>
      </div>
    </div>
  );
};

// N2 — Tüm kategoriler ikonlu, açık zemin
const NavbarV2 = () => (
  <div style={{background:"white", borderBottom:"1px solid var(--line)", padding:"10px 32px"}}>
    <div className="row" style={{justifyContent:"space-between"}}>
      <div className="row gap-2" style={{flex:1, overflowX:"auto"}}>
        {CATEGORIES.map((c, i) => (
          <a key={i} className="row gap-8" style={{
            padding:"10px 14px", fontSize:13, color:"var(--ink-700)",
            fontWeight:500, cursor:"pointer", borderRadius:8, whiteSpace:"nowrap",
            transition:"all .15s"
          }}
          onMouseEnter={e => {e.currentTarget.style.background="var(--bg)"; e.currentTarget.style.color="var(--brand-navy)";}}
          onMouseLeave={e => {e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--ink-700)";}}>
            <Icon name={c.icon} size={16}/> {c.name}
            {c.hot && <span style={{background:"#FFE3E3", color:"var(--danger)", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:3}}>YENİ</span>}
          </a>
        ))}
      </div>
      <a style={{padding:"10px 14px", fontSize:13, color:"var(--brand-blue)", fontWeight:700, whiteSpace:"nowrap"}}>
        Tüm Kategoriler →
      </a>
    </div>
  </div>
);

// N3 — Mega menu hint'i ile lacivert
const NavbarV3 = () => (
  <div>
    <div style={{background:"#0F2552", padding:"0 32px", display:"flex"}}>
      {CATEGORIES.slice(0, 8).map((c, i) => (
        <a key={i} style={{
          padding:"12px 18px", fontSize:13, color:"white",
          fontWeight:500, cursor:"pointer", display:"flex", gap:8, alignItems:"center",
          borderRight: i===0 ? "1px solid rgba(255,255,255,.08)" : "none",
          background: i===0 ? "rgba(255,199,44,.1)" : "transparent"
        }}>
          {i===0 && <Icon name="menu" size={14}/>}
          <Icon name={c.icon} size={14}/>
          {c.name}
        </a>
      ))}
    </div>
    {/* mega menu preview */}
    <div style={{background:"white", border:"1px solid var(--line)", borderTop:"none", padding:"20px 32px", display:"grid", gridTemplateColumns:"200px 1fr 220px", gap:24, boxShadow:"var(--shadow)"}}>
      <div>
        <div style={{fontSize:11, fontWeight:800, color:"var(--brand-navy)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10}}>El Aletleri</div>
        <div style={{display:"flex", flexDirection:"column", gap:8, fontSize:13}}>
          <a style={{color:"var(--ink-700)", fontWeight:500}}>Pense & Yan Keski</a>
          <a style={{color:"var(--ink-700)", fontWeight:500}}>Tornavida Setleri</a>
          <a style={{color:"var(--ink-700)", fontWeight:500}}>İngiliz Anahtarları</a>
          <a style={{color:"var(--ink-700)", fontWeight:500}}>Çekiç & Balyoz</a>
          <a style={{color:"var(--brand-blue)", fontWeight:600}}>Tümünü Gör →</a>
        </div>
      </div>
      <div>
        <div style={{fontSize:11, fontWeight:800, color:"var(--brand-navy)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10}}>Popüler Markalar</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8}}>
          {["Bosch", "Makita", "DeWalt", "Stanley", "İzeltaş", "Bahco", "Knipex", "Hilti"].map(b => (
            <div key={b} style={{padding:"10px 12px", border:"1px solid var(--line)", borderRadius:6, fontSize:12, fontWeight:600, textAlign:"center", color:"var(--ink-700)"}}>{b}</div>
          ))}
        </div>
      </div>
      <div style={{background:"linear-gradient(135deg, #FFC72C, #FFD66B)", borderRadius:8, padding:16, color:"var(--brand-navy)"}}>
        <div style={{fontSize:10, fontWeight:800, letterSpacing:"0.1em"}}>HAFTANIN FIRSATI</div>
        <div style={{fontSize:14, fontWeight:800, marginTop:6, lineHeight:1.2}}>Bosch Profesyonel'de %20'ye varan indirim</div>
        <button className="btn btn-navy btn-sm" style={{marginTop:10}}>Keşfet →</button>
      </div>
    </div>
  </div>
);

// =============================================
// FOOTER VARIATIONS
// =============================================

// F1 — Klasik 5 kolonlu, lacivert
const FooterV1 = () => (
  <div style={{background:"var(--brand-navy)", color:"#C7D0E4", padding:"40px 32px 0"}}>
    {/* CTA strip */}
    <div style={{padding:"20px 24px", background:"#0F2552", borderRadius:14, marginBottom:32, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
      <div>
        <div style={{fontSize:18, fontWeight:800, color:"white"}}>Bayi olmak ister misin?</div>
        <div style={{fontSize:12, marginTop:4}}>4.200+ bayi gibi sen de katıl, %0 komisyon ile başla</div>
      </div>
      <button className="btn btn-yellow btn-lg">Bayi Başvurusu →</button>
    </div>

    <div style={{display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 1fr 1fr", gap:32, paddingBottom:32, borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <div>
        <div className="ih-logo" style={{color:"white"}}>
          <div className="ih-logo-mark">İ</div>
          <div style={{color:"white"}}>i-hirdavat<small style={{color:"#7A87A8"}}>B2B HIRDAVAT PAZARYERİ</small></div>
        </div>
        <p style={{marginTop:14, color:"#9AA5BF", fontSize:12, lineHeight:1.6}}>
          Türkiye'nin profesyonel hırdavat ve iş güvenliği pazaryeri. 4.200+ bayi · 280.000+ ürün · Tek sözleşme.
        </p>
        <div style={{marginTop:16, display:"flex", gap:8}}>
          {["X", "in", "ig", "fb", "yt"].map(s => (
            <a key={s} style={{width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,.08)", display:"grid", placeItems:"center", fontSize:11, fontWeight:700, color:"white"}}>{s}</a>
          ))}
        </div>
      </div>
      <div><h4 style={{color:"white", fontSize:13, fontWeight:700, marginBottom:14, letterSpacing:"0.04em"}}>KURUMSAL</h4>
        <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8, fontSize:12}}>
          <li><a>Hakkımızda</a></li><li><a>Kariyer</a></li><li><a>Bayi Ol</a></li><li><a>Basın Odası</a></li><li><a>İletişim</a></li>
        </ul>
      </div>
      <div><h4 style={{color:"white", fontSize:13, fontWeight:700, marginBottom:14, letterSpacing:"0.04em"}}>YARDIM</h4>
        <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8, fontSize:12}}>
          <li><a>Sipariş Takibi</a></li><li><a>İade & İptal</a></li><li><a>Kargo</a></li><li><a>SSS</a></li><li><a>Canlı Destek</a></li>
        </ul>
      </div>
      <div><h4 style={{color:"white", fontSize:13, fontWeight:700, marginBottom:14, letterSpacing:"0.04em"}}>YASAL</h4>
        <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8, fontSize:12}}>
          <li><a>KVKK Aydınlatma</a></li><li><a>Çerez Politikası</a></li><li><a>Mesafeli Satış</a></li><li><a>Üyelik Sözleşmesi</a></li>
        </ul>
      </div>
      <div>
        <h4 style={{color:"white", fontSize:13, fontWeight:700, marginBottom:14, letterSpacing:"0.04em"}}>BÜLTEN</h4>
        <p style={{fontSize:11, color:"#9AA5BF", marginBottom:10}}>Yeni ürün ve kampanyalardan haberdar ol</p>
        <div style={{display:"flex", gap:6}}>
          <input placeholder="E-posta adresin" style={{flex:1, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:6, padding:"8px 12px", color:"white", fontSize:12, outline:"none"}}/>
          <button className="btn btn-yellow btn-sm" style={{padding:"8px 12px"}}>OK</button>
        </div>
        <div style={{marginTop:18}}>
          <h4 style={{color:"white", fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:"0.04em"}}>UYGULAMA</h4>
          <div className="row gap-6">
            <div style={{padding:"6px 10px", background:"rgba(255,255,255,.06)", borderRadius:6, fontSize:10, fontWeight:600, color:"white"}}>App Store</div>
            <div style={{padding:"6px 10px", background:"rgba(255,255,255,.06)", borderRadius:6, fontSize:10, fontWeight:600, color:"white"}}>Google Play</div>
          </div>
        </div>
      </div>
    </div>

    {/* trust strip */}
    <div style={{padding:"20px 0", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", gap:32, justifyContent:"center", flexWrap:"wrap"}}>
      {["VISA", "MasterCard", "Troy", "Havale", "Vadeli", "DBS"].map(p => (
        <div key={p} style={{padding:"6px 14px", background:"rgba(255,255,255,.06)", borderRadius:6, fontSize:11, fontWeight:700, color:"white"}}>{p}</div>
      ))}
    </div>

    <div style={{padding:"18px 0", display:"flex", justifyContent:"space-between", fontSize:11, color:"#7A87A8"}}>
      <span>© 2026 i-hirdavat A.Ş. Tüm hakları saklıdır.</span>
      <span>VKN: 1234567890 · MERSIS: 0123-4567-8901-2345 · ETBIS Onaylı</span>
    </div>
  </div>
);

// F2 — Açık zemin, modern, kart tabanlı
const FooterV2 = () => (
  <div style={{background:"#F0F2F7", padding:"40px 32px"}}>
    <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginBottom:32}}>
      {[
        {i:"truck", t:"Aynı Gün Kargo", s:"16:00'a kadar siparişlerde"},
        {i:"wallet", t:"Vadeli Ödeme", s:"60 güne kadar %0 faiz"},
        {i:"shield", t:"Güvenli Alışveriş", s:"Bayi onayı + iade garanti"},
        {i:"chat", t:"7/24 Destek", s:"Telefon, mail, canlı destek"},
      ].map((x, i) => (
        <div key={i} className="card" style={{padding:18, display:"flex", gap:14, alignItems:"center"}}>
          <div style={{width:42, height:42, borderRadius:10, background:"var(--brand-yellow)", color:"var(--brand-navy)", display:"grid", placeItems:"center"}}>
            <Icon name={x.i} size={20}/>
          </div>
          <div>
            <div style={{fontSize:14, fontWeight:700, color:"var(--brand-navy)"}}>{x.t}</div>
            <div style={{fontSize:11, color:"var(--ink-500)"}}>{x.s}</div>
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
        <p style={{marginTop:14, fontSize:12, color:"var(--ink-500)", lineHeight:1.6}}>
          Türkiye'nin profesyonel hırdavat ve iş güvenliği pazaryeri. 4.200+ bayi · 280.000+ ürün.
        </p>
      </div>
      {[
        {h:"KURUMSAL", l:["Hakkımızda","Kariyer","Bayi Ol","İletişim"]},
        {h:"YARDIM", l:["Sipariş Takibi","İade & İptal","Kargo","SSS"]},
        {h:"YASAL", l:["KVKK","Çerez","Mesafeli Satış","Üyelik"]},
        {h:"KATEGORİLER", l:["El Aletleri","Elektrikli","İş Güvenliği","Bağlantı"]},
      ].map((c, i) => (
        <div key={i}>
          <h4 style={{fontSize:12, fontWeight:800, color:"var(--brand-navy)", letterSpacing:"0.06em", marginBottom:14}}>{c.h}</h4>
          <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8}}>
            {c.l.map(li => <li key={li}><a style={{fontSize:12, color:"var(--ink-700)"}}>{li}</a></li>)}
          </ul>
        </div>
      ))}
    </div>
    <div style={{paddingTop:18, display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--ink-500)"}}>
      <span>© 2026 i-hirdavat A.Ş.</span>
      <div className="row gap-8">
        {["VISA","MasterCard","Troy","Havale","Vadeli"].map(p => (
          <div key={p} style={{padding:"4px 10px", background:"white", border:"1px solid var(--line)", borderRadius:4, fontSize:10, fontWeight:700}}>{p}</div>
        ))}
      </div>
    </div>
  </div>
);

// F3 — Sade, lacivert, sıcak — bültene odak
const FooterV3 = () => (
  <div>
    <div style={{background:"linear-gradient(135deg, #FFC72C, #FFD66B)", padding:"32px", textAlign:"center", color:"var(--brand-navy)"}}>
      <div style={{fontSize:24, fontWeight:900, letterSpacing:"-0.02em"}}>Yeni kampanyaları kaçırma</div>
      <div style={{fontSize:13, marginTop:6, opacity:.85}}>Haftalık bülten, sadece üyelere özel fiyatlar</div>
      <div style={{display:"flex", gap:8, maxWidth:480, margin:"18px auto 0"}}>
        <input placeholder="E-posta adresin" style={{flex:1, background:"white", border:"none", borderRadius:8, padding:"12px 16px", fontSize:14, outline:"none"}}/>
        <button className="btn btn-navy btn-lg">Abone Ol</button>
      </div>
    </div>
    <div style={{background:"#0A1F44", padding:"36px 32px", color:"#C7D0E4"}}>
      <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:24, marginBottom:24}}>
        <div>
          <div className="ih-logo" style={{color:"white"}}>
            <div className="ih-logo-mark">İ</div>
            <div style={{color:"white"}}>i-hirdavat<small style={{color:"#7A87A8"}}>B2B PAZARYERİ</small></div>
          </div>
        </div>
        {[
          {h:"KURUMSAL", l:["Hakkımızda","Bayi Ol","İletişim"]},
          {h:"YARDIM", l:["SSS","İade","Kargo"]},
          {h:"YASAL", l:["KVKK","Çerez","Mesafeli Satış"]},
          {h:"İLETİŞİM", l:["📞 0850 222 33 44","✉ destek@i-hirdavat.com","🕒 7/24"]},
        ].map((c, i) => (
          <div key={i}>
            <h4 style={{color:"white", fontSize:11, fontWeight:800, letterSpacing:"0.06em", marginBottom:10}}>{c.h}</h4>
            <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:6, fontSize:12}}>
              {c.l.map(li => <li key={li}><a>{li}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{paddingTop:18, borderTop:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"space-between", fontSize:11, color:"#7A87A8"}}>
        <span>© 2026 i-hirdavat A.Ş. Tüm hakları saklıdır.</span>
        <div className="row gap-12">
          {["X","in","ig","fb","yt"].map(s => <a key={s} style={{color:"#9AA5BF", fontWeight:700}}>{s}</a>)}
        </div>
      </div>
    </div>
  </div>
);

// =============================================
// CONTAINERS
// =============================================

const SectionLabel = ({ label, sub }) => (
  <div style={{padding:"14px 32px", background:"white", borderBottom:"1px solid var(--line)", borderTop:"1px solid var(--line)"}}>
    <div style={{fontSize:11, fontWeight:800, color:"var(--ink-400)", letterSpacing:"0.1em"}}>{label}</div>
    {sub && <div style={{fontSize:11, color:"var(--ink-500)", marginTop:2}}>{sub}</div>}
  </div>
);

const PreviewWrap = ({ children }) => (
  <div style={{background:"var(--bg)"}}>{children}</div>
);

window.HeaderV1 = HeaderV1;
window.HeaderV2 = HeaderV2;
window.HeaderV3 = HeaderV3;
window.NavbarV1 = NavbarV1;
window.NavbarV2 = NavbarV2;
window.NavbarV3 = NavbarV3;
window.FooterV1 = FooterV1;
window.FooterV2 = FooterV2;
window.FooterV3 = FooterV3;
window.SectionLabel = SectionLabel;
window.PreviewWrap = PreviewWrap;
