// V1 — Modernize Edilmiş Klasik
// Mevcut yapının cilalanmış hali: sol galeri, sağ bayi listesi, alt teknik özellikler.
// Eklenen: KDV/vade etiketleri, bayi puanı, kademeli fiyat hint'i, dökümanlar, sticky info bar.

const ProductGalleryV1 = ({ images }) => {
  const [active, setActive] = React.useState(0);
  const [fav, setFav] = React.useState(false);
  return (
    <div className="card" style={{padding: 20}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 14}}>
        <div>
          <div style={{fontSize:18, fontWeight:700, lineHeight:1.3, color:"var(--brand-navy)", letterSpacing:"-0.01em"}}>
            {PRODUCT.title}
          </div>
          <a style={{display:"inline-block", color:"var(--brand-blue)", fontSize:13, marginTop:6, fontWeight:500}}>{PRODUCT.brand}</a>
        </div>
        <button onClick={() => setFav(f => !f)} style={{
          background: fav ? "#FEECEC" : "white",
          border: "1px solid var(--line)", borderRadius: 8, width: 36, height: 36,
          display:"grid", placeItems:"center", color: fav ? "var(--danger)" : "var(--ink-500)"
        }}>
          <Icon name={fav ? "heart-fill" : "heart"} size={18} />
        </button>
      </div>

      <div className="ph" style={{aspectRatio: "1/1", marginBottom: 12, position:"relative"}}>
        product shot · {images[active]}
        <div style={{position:"absolute", bottom:12, right:12, background:"rgba(11,18,32,.7)", color:"white", padding:"4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600}}>
          {active+1} / {images.length}
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:8, marginBottom: 18}}>
        {images.map((im, i) => (
          <div key={i} onClick={() => setActive(i)} className="ph" style={{
            aspectRatio: "1/1", fontSize: 9, cursor: "pointer",
            border: i === active ? "2px solid var(--brand-blue)" : "1px solid var(--line)",
            borderRadius: 8
          }}>{im}</div>
        ))}
      </div>

      <div style={{borderTop:"1px solid var(--line-2)", paddingTop:14}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <div style={{fontSize:11, color:"var(--ink-400)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600}}>PSF (Piyasa Satış Fiyatı)</div>
          <div className="price-big" style={{color:"var(--ink-900)"}}>{fmtTRY(PRODUCT.psf)}<span className="price-currency">TL</span></div>
        </div>
        <div style={{fontSize:11, color:"var(--ink-500)", marginTop:6}}>
          KDV hariç · Bayi fiyatları için aşağıdaki ilanları inceleyin.
        </div>
      </div>

      <div style={{display:"flex", gap:8, marginTop:14, fontSize:11, color:"var(--ink-500)"}}>
        <span style={{display:"inline-flex", alignItems:"center", gap:4}}><Icon name="info" size={12}/> Hata Bildir</span>
        <span style={{margin:"0 6px", color:"var(--ink-300)"}}>·</span>
        <span>SKU: {PRODUCT.sku}</span>
      </div>
    </div>
  );
};

const SellerCardV1 = ({ s, isBest, qty, onQty, inCart, onAdd }) => (
  <div style={{
    display:"grid",
    gridTemplateColumns:"40px 1fr auto auto auto auto",
    gap: 16, alignItems:"center",
    padding: "16px 18px",
    borderTop: "1px solid var(--line-2)",
    background: isBest ? "linear-gradient(90deg, #FFFCEF, transparent 30%)" : "white"
  }}>
    <div className="ph" style={{width:40, height:40, fontSize:8, borderRadius: 6}}>logo</div>

    <div className="col gap-4">
      <div className="row gap-8" style={{flexWrap:"wrap"}}>
        {isBest && <span className="chip chip-best">EN UYGUN</span>}
        <a style={{fontWeight:700, fontSize:14, color:"var(--brand-navy)"}}>{s.name}</a>
        {s.badges.filter(b => b !== "EN UYGUN").map(b =>
          <span key={b} className="chip chip-info">{b}</span>
        )}
      </div>
      <div className="row gap-8" style={{fontSize:12, color:"var(--ink-500)"}}>
        <Stars value={s.rating}/>
        <span style={{fontWeight:600, color:"var(--ink-700)"}}>{s.rating}</span>
        <span>({s.ratingCount})</span>
        <span style={{color:"var(--ink-300)"}}>·</span>
        <span><Icon name="pin" size={11}/> {s.location}</span>
      </div>
    </div>

    <div className="col gap-4" style={{textAlign:"left", minWidth: 110}}>
      <div style={{fontSize:10, color:"var(--ink-400)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600}}>Teslimat</div>
      <div style={{fontSize:12, fontWeight:600, color:"var(--ink-900)"}}>{s.delivery}</div>
      <div style={{fontSize:11, color:"var(--success)"}}><Icon name="truck" size={11}/> {s.shipsIn}</div>
    </div>

    <div className="col gap-4" style={{textAlign:"left", minWidth: 80}}>
      <div style={{fontSize:10, color:"var(--ink-400)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600}}>Stok</div>
      <div style={{fontSize:12, fontWeight:600, color: s.stock < 10 ? "var(--warn)" : "var(--ink-900)"}}>{s.stock} adet</div>
      <div style={{fontSize:10, color:"var(--ink-400)"}}>min. {s.minQty}</div>
    </div>

    <div className="col gap-4" style={{textAlign:"right", minWidth: 130}}>
      <div className="price-big" style={{fontSize: isBest ? 22 : 18}}>
        {fmtTRY(s.price)} <span style={{fontSize: 12, color:"var(--ink-500)", fontWeight:600}}>TL</span>
      </div>
      <div style={{fontSize:10, color:"var(--ink-400)"}}>{s.vat} · Vadeli</div>
    </div>

    <div className="row gap-8">
      <div className="qty">
        <button onClick={() => onQty(Math.max(s.minQty, qty - 1))}>−</button>
        <input value={qty} onChange={e => onQty(Math.max(s.minQty, +e.target.value || s.minQty))}/>
        <button onClick={() => onQty(qty + 1)}>+</button>
      </div>
      <button className={inCart ? "btn btn-ghost" : "btn btn-primary"} onClick={onAdd}>
        <Icon name={inCart ? "check" : "cart"} size={14}/>
        {inCart ? "Eklendi" : "Ekle"}
      </button>
    </div>
  </div>
);

const SellersV1 = () => {
  const [qtys, setQtys] = React.useState({});
  const [inCart, setInCart] = React.useState({});
  const sellers = [...SELLERS_BASE].slice(0, 3).sort((a,b) => a.price - b.price);

  return (
    <div className="card">
      <div style={{padding: "16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom: "1px solid var(--line)"}}>
        <div className="row gap-8">
          <h3 style={{margin:0, fontSize: 16, fontWeight:700, color:"var(--brand-navy)"}}>Ürünün Tüm İlanları</h3>
          <span className="chip chip-neutral">{sellers.length} bayi</span>
        </div>
        <div className="row gap-12" style={{fontSize: 12, color:"var(--ink-500)"}}>
          <label className="row gap-6">
            Min. stok:
            <select style={{border:"1px solid var(--line)", borderRadius:6, padding:"4px 8px", fontSize:12}}>
              <option>—</option><option>10</option><option>50</option>
            </select>
          </label>
          <label className="row gap-6">
            Sırala:
            <select style={{border:"1px solid var(--line)", borderRadius:6, padding:"4px 8px", fontSize:12}}>
              <option>Fiyat (Artan)</option>
              <option>Teslimat süresi</option>
              <option>Bayi puanı</option>
            </select>
          </label>
        </div>
      </div>

      <div className="tabs" style={{padding:"0 20px"}}>
        <button className="tab active">Tüm İlanlar <span className="tab-count">{sellers.length}</span></button>
        <button className="tab">Hızlı Kargo <span className="tab-count">2</span></button>
        <button className="tab">Vadeli Ödeme <span className="tab-count">3</span></button>
      </div>

      <div>
        {sellers.map((s, i) => (
          <SellerCardV1
            key={s.id}
            s={s}
            isBest={i === 0}
            qty={qtys[s.id] || s.minQty}
            onQty={(q) => setQtys({...qtys, [s.id]: q})}
            inCart={inCart[s.id]}
            onAdd={() => setInCart({...inCart, [s.id]: !inCart[s.id]})}
          />
        ))}
      </div>

      <div style={{padding: "14px 20px", background:"var(--bg-soft)", borderTop:"1px solid var(--line)", fontSize: 12, color:"var(--ink-500)", display:"flex", justifyContent:"space-between"}}>
        <span><Icon name="info" size={12}/> Daha düşük fiyat almak için <a style={{color:"var(--brand-blue)", fontWeight:600}}>5+ adet</a> sipariş edin — kademeli fiyat aktif olur.</span>
        <a style={{color:"var(--brand-blue)", fontWeight:600}}>Tüm ilanları gör (12)</a>
      </div>
    </div>
  );
};

const SpecsV1 = () => {
  const [open, setOpen] = React.useState({"Performans": true, "Genel": true});
  const [tab, setTab] = React.useState("specs");

  return (
    <div className="card">
      <div className="tabs" style={{padding:"0 20px"}}>
        <button className={`tab ${tab==="specs"?"active":""}`} onClick={() => setTab("specs")}>
          Teknik Özellikler <span className="tab-count">14</span>
        </button>
        <button className={`tab ${tab==="docs"?"active":""}`} onClick={() => setTab("docs")}>
          Dökümanlar <span className="tab-count">{PRODUCT.documents.length}</span>
        </button>
        <button className={`tab ${tab==="reviews"?"active":""}`} onClick={() => setTab("reviews")}>
          Ürün Yorumları <span className="tab-count">0</span>
        </button>
        <button className={`tab ${tab==="qa"?"active":""}`} onClick={() => setTab("qa")}>
          Soru & Cevap <span className="tab-count">7</span>
        </button>
      </div>

      {tab === "specs" && (
        <div style={{padding: "8px 0"}}>
          {Object.entries(PRODUCT.specs).map(([cat, rows]) => (
            <div key={cat}>
              <button
                onClick={() => setOpen({...open, [cat]: !open[cat]})}
                style={{
                  width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"14px 20px", border:"none", background:"transparent",
                  fontSize: 14, fontWeight: 700, color:"var(--brand-navy)"
                }}>
                <span className="row gap-8">{cat} <span className="chip chip-neutral" style={{fontSize:10}}>{rows.length}</span></span>
                <Icon name={open[cat] ? "chevron-up" : "chevron-down"}/>
              </button>
              {open[cat] && (
                <div>
                  {rows.map(([k, v], i) => (
                    <div key={i} style={{
                      display:"grid", gridTemplateColumns:"260px 1fr",
                      padding:"12px 20px", fontSize: 13,
                      background: i%2===0 ? "var(--bg-soft)" : "white"
                    }}>
                      <span className="muted">{k}</span>
                      <span style={{fontWeight:500}}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "docs" && (
        <div style={{padding:18, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 12}}>
          {PRODUCT.documents.map((d, i) => (
            <div key={i} style={{border:"1px solid var(--line)", borderRadius:10, padding:16, display:"flex", gap:12, alignItems:"center"}}>
              <div style={{width:42, height:42, borderRadius:8, background:"var(--info-bg)", color:"var(--info)", display:"grid", placeItems:"center"}}>
                <Icon name="doc" size={20}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:600}}>{d.name}</div>
                <div style={{fontSize:11, color:"var(--ink-400)"}}>{d.type} · {d.size}</div>
              </div>
              <button className="btn btn-ghost btn-sm"><Icon name="download" size={14}/></button>
            </div>
          ))}
        </div>
      )}

      {tab === "reviews" && (
        <div style={{padding:"40px 20px", textAlign:"center", color:"var(--ink-500)"}}>
          <Icon name="chat" size={32}/>
          <div style={{fontSize:14, fontWeight:600, marginTop:12, color:"var(--ink-700)"}}>Henüz yorum yapılmamış</div>
          <div style={{fontSize:12, marginTop:6}}>Yorum yapmak için bu ürünü satın alıp teslim almanız gerekiyor.</div>
        </div>
      )}

      {tab === "qa" && (
        <div style={{padding:18}}>
          {[
            {q:"Akü tipi kaç volt? Eski 10.8V bataryalarım var, çalışır mı?", a:"12V Li-Ion. Eski 10.8V Bosch bataryalar uyumludur (firma onaylı).", who:"Mehmet T."},
            {q:"Kutudan tornavida ucu seti çıkıyor mu?", a:"Hayır, sadece cihaz, 2× akü ve şarj cihazı çıkar.", who:"Ayşe K."}
          ].map((qa, i) => (
            <div key={i} style={{padding:"14px 0", borderBottom:"1px solid var(--line-2)"}}>
              <div style={{fontSize:13, fontWeight:600, color:"var(--brand-navy)"}}>S: {qa.q}</div>
              <div style={{fontSize:13, color:"var(--ink-700)", marginTop:6}}>C: {qa.a}</div>
              <div style={{fontSize:11, color:"var(--ink-400)", marginTop:4}}>{qa.who} · 3 gün önce</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VariantV1 = () => (
  <Chrome>
    <div style={{padding:"0 32px 40px", maxWidth: 1320, margin:"0 auto"}}>
      <div style={{display:"grid", gridTemplateColumns:"380px 1fr", gap:20}}>
        <ProductGalleryV1 images={PRODUCT.images} />
        <div className="col gap-16">
          <SellersV1 />
          <SpecsV1 />
        </div>
      </div>
    </div>
  </Chrome>
);

window.VariantV1 = VariantV1;
