/* ============================================================
   شاشات (أ) — الدخول، الرئيسية، البحث، المطعم، الصنف
   ============================================================ */

/* ===================== تسجيل الدخول ===================== */
function AuthScreen({ onDone }){
  const [mode, setMode] = useState("login");   // login | register
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const hasAPI = !!window.SonbolAPI;
  const phoneOk = phone.replace(/\D/g, "").length >= 4;
  const ok = phoneOk && password.length >= 6 && (mode === "login" || name.trim().length >= 2);

  async function submit(){
    if (!ok || busy || !hasAPI) return;
    setBusy(true); setErr("");
    try {
      if (mode === "login") await SonbolAPI.login(phone.trim(), password);
      else await SonbolAPI.register({ role: "customer", name: name.trim(), phone: phone.trim(), password });
      onDone(true);
    } catch (e) {
      setErr(e && e.offline ? "تعذّر الاتصال بالخادم — جرّب الدخول التجريبي" :
        (e && e.status === 401 ? "رقم الجوال أو كلمة المرور غير صحيحة" :
        (e && e.status === 409 ? "رقم الجوال مسجّل مسبقاً" : (e && e.message) || "حدث خطأ، حاول مجدداً")));
    } finally { setBusy(false); }
  }

  return (
    <div className="screen">
      <div className="auth">
        <div className="a-top">
          <div className="a-splash"><img src="assets/sonbol-logo.png" alt="Sonbol" /></div>
          <div className="a-tag">اطلب وجبتك المفضلة من أفضل مطاعم غزة وتابع توصيلها لحظة بلحظة.</div>
        </div>
        <div className="a-form">
          {mode === "register" && (
            <div>
              <div className="field-l">الاسم</div>
              <div className="inp">
                <span className="i-ic"><Ic.user s={20} /></span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل" />
              </div>
            </div>
          )}
          <div>
            <div className="field-l">رقم الجوال</div>
            <div className="inp ltr">
              <span className="i-ic"><Ic.phone s={20} /></span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx xxx xxx" inputMode="tel" />
            </div>
          </div>
          <div>
            <div className="field-l">كلمة المرور</div>
            <div className="inp">
              <span className="i-ic"><Ic.lock s={20} /></span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="٦ أحرف على الأقل" onKeyDown={(e) => e.key === "Enter" && submit()} />
            </div>
          </div>
          {err && <div style={{ color: "#d6342c", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{err}</div>}
          <button className="btn btn-gold btn-block btn-lg"
            style={{ opacity: ok && !busy ? 1 : .5, pointerEvents: ok && !busy ? "auto" : "none", marginTop: 2 }}
            onClick={submit}>
            {busy ? "جارٍ…" : (mode === "login" ? "تسجيل الدخول" : "إنشاء حساب")} <Ic.chevL s={20} />
          </button>
          <div className="a-alt" style={{ cursor: "pointer" }} onClick={() => { setErr(""); setMode(mode === "login" ? "register" : "login"); }}>
            {mode === "login" ? <>ليس لديك حساب؟ <b>أنشئ حساباً</b></> : <>لديك حساب؟ <b>تسجيل الدخول</b></>}
          </div>
          <button className="btn btn-line btn-block" onClick={() => onDone(false)}>الدخول بحساب تجريبي (بدون خادم)</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== الرئيسية ===================== */
function HomeScreen({ restaurants, onOpenRest, onGoSearch, activeOrders, onGoTrack }){
  return (
    <div className="screen">
      <div className="home-top">
        <button className="h-search" onClick={onGoSearch}><Ic.search s={20} /></button>
        <div className="logo"><img src="assets/sonbol-logo-ink.png" alt="Sonbol" className="logo-img" /></div>
        <span style={{ width: 44, flex: "0 0 auto" }}></span>
      </div>
      <div className="scroll pad pb-tab">
        {/* طلب نشط */}
        {activeOrders.length > 0 && activeOrders.map((o) => (
          <button key={o.id} className="block" style={{ width: "100%", marginTop: 16, marginBottom: 0, display: "flex", alignItems: "center", gap: 12, textAlign: "right", borderColor: "var(--gold-soft)", background: "var(--gold-tint)" }} onClick={() => onGoTrack(o.id)}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--gold)", color: "var(--ink)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Ic.bike s={22} /></span>
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
              <b style={{ fontSize: 14.5, fontWeight: 900, display: "block" }}>طلبك قيد التنفيذ</b>
              <small style={{ fontSize: 12.5, color: "var(--text-soft)", fontWeight: 700 }}>{SB.STATUS[o.status].label} · اضغط للتتبّع</small>
            </span>
            <Ic.chevL s={20} style={{ color: "var(--gold-deep)" }} />
          </button>
        ))}

        {/* العنوان */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.4px", display: "flex", alignItems: "center", gap: 8 }}>شو جاي عبالك اليوم؟ <span>🍴</span></div>
          <div style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 600, marginTop: 4 }}>مطاعمك المفضلة بين إيديك</div>
        </div>

        <div className="sec-h"><div className="t" style={{ fontSize: 17 }}>المطاعم <span style={{ color: "var(--text-faint)", fontWeight: 800, fontSize: 14 }}>({restaurants.length})</span></div></div>
        {restaurants.map((r) => <RestaurantCard r={r} key={r.id} onOpen={onOpenRest} />)}
      </div>
    </div>
  );
}

/* ===================== البحث ===================== */
function SearchScreen({ restaurants, onOpenRest, back, onOpenItem }){
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);
  const ql = q.trim();
  const rMatches = ql ? restaurants.filter((r) => r.name.includes(ql) || r.nameAr.includes(ql) || r.tagline.includes(ql)) : restaurants;
  const iMatches = [];
  if (ql) restaurants.forEach((r) => r.menu.forEach((c) => c.items.forEach((it) => { if (it.name.includes(ql)) iMatches.push({ it, r }); })));
  const popular = ["بيتزا", "برجر", "شاورما", "كاليزوني", "آيس كوفي", "كريب"];

  return (
    <div className="screen">
      <div className="appbar line" style={{ paddingTop: 10 }}>
        <button className="ic-btn plain" onClick={back}><Ic.chevR s={24} /></button>
        <div className="inp" style={{ flex: 1, padding: "11px 14px" }}>
          <span className="i-ic"><Ic.search s={20} /></span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن مطعم أو صنف…" />
          {q && <button onClick={() => setQ("")} className="i-ic"><Ic.close s={18} /></button>}
        </div>
      </div>
      <div className="scroll pad pb-tab">
        {!ql && (
          <>
            <div className="sec-h"><div className="t" style={{ fontSize: 16 }}>الأكثر بحثاً</div></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {popular.map((p) => <button className="chip" key={p} style={{ padding: "9px 15px" }} onClick={() => setQ(p)}>{p}</button>)}
            </div>
            <div className="sec-h"><div className="t" style={{ fontSize: 16 }}>كل المطاعم</div></div>
            {restaurants.map((r) => <RestaurantCard r={r} key={r.id} onOpen={onOpenRest} />)}
          </>
        )}
        {ql && rMatches.length > 0 && (<>
          <div className="sec-h"><div className="t" style={{ fontSize: 16 }}>مطاعم</div></div>
          {rMatches.map((r) => <RestaurantCard r={r} key={r.id} onOpen={onOpenRest} />)}
        </>)}
        {ql && iMatches.length > 0 && (<>
          <div className="sec-h"><div className="t" style={{ fontSize: 16 }}>أصناف</div></div>
          {iMatches.slice(0, 10).map(({ it, r }, i) => (
            <div className="fitem" key={it.id + i} style={rcVars(r)} onClick={() => onOpenItem(it, r)}>
              <div className="fi-l">
                <div className="fi-name">{it.name}</div>
                <div className="fi-desc">{r.name}</div>
                <div className="fi-foot"><span className="fi-price tnum">{SB.money(it.price)}</span></div>
              </div>
              <div className="fi-img"><FoodThumb r={r} it={it} /></div>
            </div>
          ))}
        </>)}
        {ql && rMatches.length === 0 && iMatches.length === 0 && (
          <div className="empty" style={{ paddingTop: 70 }}>
            <div className="e-ic"><Ic.search s={34} /></div>
            <div className="e-t">لا نتائج</div>
            <div className="e-s">جرّب كلمة أخرى مثل «بيتزا» أو «برجر».</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== صفحة المطعم ===================== */
function RestaurantScreen({ r, onOpenItem, back, goCart, cartCount, cartTotal, cartRestCount }){
  const [activeCat, setActiveCat] = useState(r.menu[0].key);
  const scrollRef = useRef(null);
  const tabsRef = useRef(null);
  const activeRef = useRef(r.menu[0].key);
  const lockRef = useRef(0); // قفل مؤقت أثناء النقر على تاب

  // تمرير شريط التابات أفقياً ليظهر التاب النشط
  function revealTab(key){
    const tabs = tabsRef.current; if (!tabs) return;
    const el = tabs.querySelector('[data-cat="' + key + '"]');
    if (!el) return;
    const target = el.offsetLeft - (tabs.clientWidth - el.clientWidth) / 2;
    tabs.scrollTo({ left: target, behavior: "smooth" });
  }
  function setActive(key){
    if (key === activeRef.current) return;
    activeRef.current = key; setActiveCat(key); revealTab(key);
  }

  function jump(key){
    setActive(key);
    lockRef.current = Date.now() + 650; // تجاهل scrollspy أثناء التمرير البرمجي
    const el = document.getElementById("mc-" + key);
    if (el && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop - 58, behavior: "smooth" });
  }

  // scrollspy: تحديد التاب حسب القسم الظاهر حالياً
  function onScroll(){
    if (Date.now() < lockRef.current) return;
    const sc = scrollRef.current; if (!sc) return;
    const y = sc.scrollTop + 96;
    let cur = r.menu[0].key;
    for (const c of r.menu){
      const el = document.getElementById("mc-" + c.key);
      if (el && el.offsetTop <= y) cur = c.key;
    }
    setActive(cur);
  }

  return (
    <div className="screen" style={rcVars(r)}>
      <div className="scroll" ref={scrollRef} onScroll={onScroll}>
        <div className="rhead">
          <Cover r={r} />
          <button className="ic-btn rh-back" onClick={back}><Ic.chevR s={22} /></button>
          <span className="rh-open pill pill-green" style={{ position: "absolute", top: 14, insetInlineStart: 14, zIndex: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }}></span> مفتوح الآن</span>
          <div className="rh-info" style={{ color: r.coverInk }}>
            <div>
              <div className="rh-name">{r.name}</div>
              <div className="rh-cuis">{r.tagline}</div>
            </div>
            <div className="rh-pills">
              <span className="rh-pill"><Ic.bike s={13} /> {SB.money(r.fee)}</span>
              <span className="rh-pill"><Ic.timer s={13} /> {r.etaMin}-{r.etaMax} د</span>
              <span className="rh-pill rh-star"><Ic.star s={13} /> {r.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="rinfo">
          <span className="ri-hours tnum">{r.hours}</span>
          <span className="ri-min"><Ic.info s={15} /> الحد الأدنى للطلب: <b className="tnum">{SB.money(r.minOrder)}</b></span>
        </div>

        <div className="menutabs" ref={tabsRef}>
          {r.menu.map((c) => (
            <button className={"mtab" + (activeCat === c.key ? " on" : "")} data-cat={c.key} key={c.key} onClick={() => jump(c.key)}>
              {c.cat} <span className="mt-n">({c.items.length})</span>
            </button>
          ))}
        </div>

        <div className="pad pb-bar">
          {r.menu.map((c) => (
            <div key={c.key} id={"mc-" + c.key}>
              <div className="mcat">{c.cat} <span className="mc-n">({c.items.length})</span></div>
              {c.items.map((it) => <FoodItem r={r} it={it} key={it.id} onOpen={(x) => onOpenItem(x)} />)}
            </div>
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="actionbar">
          <button className="btn btn-rc btn-block btn-lg" onClick={goCart} style={{ justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
              <Ic.bag s={20} /> سلتك ({cartRestCount} {cartRestCount === 1 ? "مطعم" : "مطاعم"})
            </span>
            <span className="tnum">{SB.money(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ===================== لوح الصنف ===================== */
function ItemSheet({ it, r, onClose, onAdd, initial }){
  const [qty, setQty] = useState(initial ? initial.qty : 1);
  const [fav, setFav] = useState(false);
  const total = it.price * qty;

  return (
    <div className="isheet-ov" onClick={onClose} style={rcVars(r)}>
      <div className="isheet" onClick={(e) => e.stopPropagation()}>
        <div className="isheet-hero">
          <FoodThumb r={r} it={it} />
          <button className="ic-btn ih-close" onClick={onClose}><Ic.close s={20} /></button>
          <button className="ic-btn ih-fav" style={{ color: fav ? "var(--red)" : "var(--text)" }} onClick={() => setFav(!fav)}>{fav ? <Ic.heartFill s={20} /> : <Ic.heart s={20} />}</button>
          <span className="ih-badge">{r.name} <Ic.store s={14} style={{ color: "var(--rc-deep)" }} /></span>
        </div>
        <div className="isheet-body">
          <div className="i-name">{it.name}</div>
          {it.desc && <div className="i-desc">{it.desc}</div>}
          <div className="i-price tnum">{SB.money(it.price)}</div>

          <div className="i-qtyrow">
            <div className="i-qty-l">
              <small>الكمية</small>
              <b>المجموع <span className="tnum" style={{ color: "var(--rc-deep)" }}>{SB.money(total)}</span></b>
            </div>
            <Stepper big rc value={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => q + 1)} />
          </div>
        </div>
        <div className="isheet-foot">
          <button className="btn btn-rc btn-block btn-lg" style={{ justifyContent: "space-between" }}
            onClick={() => onAdd({ restaurantId: r.id, id: it.id, name: it.name, price: it.price, qty, mods: {}, note: "" })}>
            <span>{initial ? "تحديث السلة" : "أضف للسلة"}</span>
            <span className="tnum">{SB.money(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen, HomeScreen, SearchScreen, RestaurantScreen, ItemSheet });
