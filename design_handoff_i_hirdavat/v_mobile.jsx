// V4 — Mobil ürün detay (375px iPhone style)
const VariantMobile = () => {
  const [tab, setTab] = React.useState("ilanlar");
  const sellers = [...SELLERS_BASE].slice(0,3).sort((a,b) => a.price - b.price);

  return (
    <div style={{width:"100%", height:"100%", background:"var(--bg)", overflow:"hidden", display:"flex", flexDirection:"column", fontSize:13}}>
      {/* status bar */}
      <div style={{height:36, background:"white", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 16px", fontSize:12, fontWeight:600}}>
        <span>9:41</span>
        <span>5G •••</span>
      </div>
      {/* header */}
      <div style={{padding:"10px 12px", background:"white", borderBottom:"1px solid var(--line)", display:"flex", gap:10, alignItems:"center"}}>
        <button className="btn btn-ghost btn-sm" style={{padding:"6px 8px"}}><Icon name="chevron-left" size={16}/></button>
        <div className="ih-search" style={{flex:1, height:36}}>
          <input placeholder="Ara…" style={{fontSize:12}}/>
        </div>
        <button style={{background:"transparent", border:"none", color:"var(--ink-700)"}}><Icon name="heart" size={20}/></button>
        <button style={{background:"transparent", border:"none", color:"var(--ink-700)"}}><Icon name="cart" size={20}/></button>
      </div>

      <div style={{flex:1, overflowY:"auto"}}>
        <div style={{background:"white", padding:"14px 16px"}}>
          <div className="ph" style={{aspectRatio:"1/1", borderRadius:10, marginBottom:12, position:"relative"}}>
            product shot
            <div style={{position:"absolute", bottom:10, right:10, background:"rgba(11,18,32,.7)", color:"white", padding:"3px 8px", borderRadius:99, fontSize:10}}>1 / 5</div>
          </div>
          <div style={{fontSize:11, color:"var(--brand-blue)", fontWeight:600}}>{PRODUCT.brand}</div>
          <div style={{fontSize:16, fontWeight:700, lineHeight:1.3, color:"var(--brand-navy)", marginTop:4}}>{PRODUCT.title}</div>
          <div className="row gap-8" style={{marginTop:8, fontSize:11, color:"var(--ink-500)"}}>
            <Stars value={PRODUCT.rating} size={11}/>
            <b style={{color:"var(--ink-900)"}}>{PRODUCT.rating}</b>
            <span>({PRODUCT.ratingCount})</span>
            <span style={{color:"var(--ink-300)"}}>·</span>
            <span>{PRODUCT.totalSold} satıldı</span>
          </div>
          <div style={{marginTop:14, padding:12, borderRadius:10, background:"var(--bg-soft)", border:"1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontSize:10, color:"var(--ink-400)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600}}>EN UYGUN FİYAT</div>
              <div style={{fontSize:22, fontWeight:800, color:"var(--brand-navy)"}}>{fmtTRY(8973.74)} <span style={{fontSize:11, color:"var(--ink-500)", fontWeight:600}}>TL</span></div>
              <div style={{fontSize:10, color:"var(--ink-400)", textDecoration:"line-through"}}>PSF: {fmtTRY(PRODUCT.psf)} TL</div>
            </div>
            <span className="chip chip-success">%13 ind.</span>
          </div>
        </div>

        <div style={{background:"white", marginTop:8}}>
          <div className="tabs" style={{padding:"0 12px"}}>
            <button className={`tab ${tab==="ilanlar"?"active":""}`} onClick={()=>setTab("ilanlar")} style={{padding:"10px 8px", fontSize:12}}>İlanlar <span className="tab-count">{sellers.length}</span></button>
            <button className={`tab ${tab==="ozellik"?"active":""}`} onClick={()=>setTab("ozellik")} style={{padding:"10px 8px", fontSize:12}}>Özellikler</button>
            <button className={`tab ${tab==="dok"?"active":""}`} onClick={()=>setTab("dok")} style={{padding:"10px 8px", fontSize:12}}>Döküman</button>
          </div>

          {tab==="ilanlar" && (
            <div>
              {sellers.map((s, i) => (
                <div key={s.id} style={{padding:"14px 16px", borderTop: i===0?"none":"1px solid var(--line-2)", background: i===0?"linear-gradient(180deg, #FFFCEF, white)":"white"}}>
                  <div className="row" style={{justifyContent:"space-between", marginBottom:6}}>
                    <div className="row gap-8">
                      {i===0 && <span className="chip chip-best" style={{fontSize:9}}>EN UYGUN</span>}
                      <span style={{fontWeight:700, color:"var(--brand-navy)", fontSize:13}}>{s.name}</span>
                    </div>
                    <Stars value={s.rating} size={10}/>
                  </div>
                  <div className="row" style={{justifyContent:"space-between", fontSize:11, color:"var(--ink-500)", marginBottom:10}}>
                    <span><Icon name="truck" size={10}/> {s.delivery}</span>
                    <span>Stok: {s.stock}</span>
                  </div>
                  <div className="row" style={{justifyContent:"space-between"}}>
                    <div className="price-big" style={{fontSize:18}}>{fmtTRY(s.price)} <span style={{fontSize:11, fontWeight:600, color:"var(--ink-500)"}}>TL</span></div>
                    <button className="btn btn-primary btn-sm"><Icon name="cart" size={12}/> Ekle</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==="ozellik" && (
            <div style={{padding:"6px 16px 16px"}}>
              {PRODUCT.specs["Performans"].map(([k,v], i) => (
                <div key={i} style={{padding:"10px 0", borderTop: i===0?"none":"1px solid var(--line-2)", display:"flex", justifyContent:"space-between", gap:12, fontSize:12}}>
                  <span className="muted" style={{flex:1}}>{k}</span>
                  <span style={{fontWeight:600, textAlign:"right"}}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {tab==="dok" && (
            <div style={{padding:16, display:"flex", flexDirection:"column", gap:8}}>
              {PRODUCT.documents.map((d,i) => (
                <div key={i} style={{padding:12, border:"1px solid var(--line)", borderRadius:8, display:"flex", gap:10, alignItems:"center"}}>
                  <div style={{width:32, height:32, borderRadius:6, background:"var(--info-bg)", color:"var(--info)", display:"grid", placeItems:"center"}}><Icon name="doc" size={16}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12, fontWeight:600}}>{d.name}</div>
                    <div style={{fontSize:10, color:"var(--ink-400)"}}>{d.type} · {d.size}</div>
                  </div>
                  <Icon name="download" size={14}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* sticky bottom */}
      <div style={{background:"white", borderTop:"1px solid var(--line)", padding:"10px 12px", display:"flex", gap:8, alignItems:"center"}}>
        <div className="qty"><button>−</button><input value="1" onChange={()=>{}}/><button>+</button></div>
        <button className="btn btn-yellow" style={{flex:1}}><Icon name="cart" size={14}/> Sepete Ekle</button>
      </div>
    </div>
  );
};

window.VariantMobile = VariantMobile;
