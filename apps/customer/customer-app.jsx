/* ============================================================
   التطبيق الرئيسي — سُنبل | واجهة الزبون
   ============================================================ */
const LS = "sonbol_customer_v2";

let uidc = 1;
function makeLine(p){ return { uid: "L" + (uidc++) + "-" + Date.now(), ...p }; }
function sameLine(a, b){ return a.id === b.id && (a.note || "") === (b.note || "") && JSON.stringify(a.mods || {}) === JSON.stringify(b.mods || {}); }
function defaultMods(it){
  const s = {};
  (it.mods || []).forEach((gid) => { const g = SB.MOD_GROUPS[gid]; if (!g) return;
    if (g.type === "single") { const d = g.options.find((o) => o.def) || g.options[0]; s[gid] = [d.id]; } else s[gid] = []; });
  return s;
}
function loadState(){ try { const r = localStorage.getItem(LS); if (r) return JSON.parse(r); } catch (e) {} return null; }

const FONT_STACK = {
  "Tajawal": '"Tajawal", system-ui, sans-serif',
  "Cairo": '"Cairo", system-ui, sans-serif',
  "Almarai": '"Almarai", system-ui, sans-serif',
  "IBM Plex Arabic": '"IBM Plex Sans Arabic", system-ui, sans-serif',
  "Rubik": '"Rubik", "Tajawal", system-ui, sans-serif',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "font": "Tajawal"
}/*EDITMODE-END*/;

/* ===== جسر ناقل الأحداث (Hub) — يحوّل طلب الزبون لصيغة المنصّة المشتركة ===== */
function customerToHub(o){
  const r = SB.findRestaurant(o.restaurants[0]) || {};
  const items = [];
  o.groups.forEach((g) => g.items.forEach((it) => items.push({ name: it.name, qty: it.qty, price: it.unit })));
  return {
    id: o.id, number: o.number, status: o.status,
    restaurantId: o.restaurants[0], restaurantName: o.restaurantNames.join("، "),
    restaurantArea: r.area || "", restaurantPhone: r.phone || "",
    customerName: SB.USER.name, customerPhone: SB.USER.phone,
    customerArea: SB.addrText(o.address), address: SB.addrText(o.address),
    items, itemsCount: o.itemsCount, subtotal: o.subtotal, deliveryFee: o.fee, total: o.total,
    payMethod: o.payMethod, paid: o.paid, note: o.restNote || "",
    km: r.km || null, etaMin: o.etaMin, etaMax: o.etaMax,
    origin: "customer", createdAt: o.placedAt,
  };
}

function App(){
  const saved = useRef(loadState()).current;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authed, setAuthed] = useState(() => saved ? !!saved.authed : false);
  const [stack, setStack] = useState(() => (saved && saved.stack && saved.stack.length) ? saved.stack : [{ name: "home" }]);
  const [cart, setCart] = useState(() => saved ? (saved.cart || []) : []);
  const [orders, setOrders] = useState(() => saved ? (saved.orders || SB.sampleOrders()) : SB.sampleOrders());
  const [addrList, setAddrList] = useState(() => saved ? (saved.addrList || SB.ADDRESSES) : SB.ADDRESSES);
  const [addrId, setAddrId] = useState(() => saved ? (saved.addrId || SB.ADDRESSES[0].id) : SB.ADDRESSES[0].id);
  const [restNote, setRestNote] = useState("");
  const [itemSheet, setItemSheet] = useState(null);   // {it, r, editUid}
  const [toast, setToast] = useState(null);
  const [scale, setScale] = useState(1);
  const toastTimer = useRef(null);

  const cur = stack[stack.length - 1];

  useEffect(() => {
    const fam = FONT_STACK[t.font] || FONT_STACK.Tajawal;
    document.documentElement.style.setProperty("--fontbody", fam);
    document.body.style.fontFamily = fam;
  }, [t.font]);

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify({ authed, stack, cart, orders, addrList, addrId }));
  }, [authed, stack, cart, orders, addrList, addrId]);

  /* استقبال تحديثات حالة الطلب الحيّة من باقي الواجهات (المطعم/الكابتن/الإدارة) */
  useEffect(() => {
    if (!window.SonbolHub) return;
    function apply(h){
      if (!h || !h.id) return;
      setOrders((prev) => {
        if (!prev.some((o) => o.id === h.id)) return prev; // فقط طلباتي
        return prev.map((o) => {
          if (o.id !== h.id) return o;
          let st = h.status;
          if (!SB.STATUS[st]) st = o.status; // أمان: تجاهل أي حالة غير معروفة
          return { ...o, status: st, captainName: h.captainName || o.captainName, rejectReason: h.rejectReason || o.rejectReason };
        });
      });
    }
    const off1 = SonbolHub.on("order", apply);
    const off2 = SonbolHub.on("init", (list) => list.forEach(apply));
    const off3 = SonbolHub.on("reset", () => resetDemo()); // إعادة ضبط موحّدة من أي واجهة
    SonbolHub.connect();
    return () => { off1 && off1(); off2 && off2(); off3 && off3(); };
  }, []);

  useEffect(() => {
    function fit(){ setScale(Math.min((window.innerHeight - 24) / 858, (window.innerWidth - 24) / 402, 1.05)); }
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, []);

  function showToast(msg){ setToast(msg); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 1800); }

  /* تنقّل */
  const go = useCallback((frame) => setStack((s) => [...s, frame]), []);
  const back = useCallback(() => setStack((s) => s.length > 1 ? s.slice(0, -1) : s), []);
  const resetTo = useCallback((name) => setStack([{ name }]), []);
  function tab(name){ if (cur.name !== name) resetTo(name); }

  /* السلة (متعددة المطاعم) */
  function addLine(payload){
    setCart((prev) => {
      const idx = prev.findIndex((l) => sameLine(l, payload));
      if (idx >= 0) { const c = prev.slice(); c[idx] = { ...c[idx], qty: c[idx].qty + payload.qty }; return c; }
      return [...prev, makeLine(payload)];
    });
  }
  function setQty(uid, q){ setCart((prev) => prev.map((l) => l.uid === uid ? { ...l, qty: q } : l)); }
  function removeLine(uid){ setCart((prev) => prev.filter((l) => l.uid !== uid)); }
  function updateLine(uid, payload){ setCart((prev) => prev.map((l) => l.uid === uid ? { ...l, ...payload } : l)); }

  // تجميع السلة حسب المطعم (بترتيب أول ظهور)
  const groups = useMemo(() => {
    const order = []; const map = {};
    cart.forEach((l) => { if (!map[l.restaurantId]) { map[l.restaurantId] = { restaurantId: l.restaurantId, lines: [], subtotal: 0 }; order.push(l.restaurantId); } map[l.restaurantId].lines.push(l); map[l.restaurantId].subtotal += SB.linePrice(l); });
    return order.map((id) => map[id]);
  }, [cart]);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const subtotal = groups.reduce((s, g) => s + g.subtotal, 0);
  const deliveryFee = groups.length === 0 ? 0 : (SB.findRestaurant(groups[0].restaurantId).fee + (groups.length - 1) * SB.EXTRA_REST_FEE);
  const total = subtotal + deliveryFee;

  function openItem(it, r, editUid){ setItemSheet({ it, r, editUid }); }
  function onItemAdd(payload){
    if (itemSheet && itemSheet.editUid) updateLine(itemSheet.editUid, payload);
    else { addLine(payload); showToast("أُضيف " + payload.name); }
    setItemSheet(null);
  }

  const address = addrList.find((a) => a.id === addrId) || addrList[0];
  const activeOrders = orders.filter((o) => !["delivered", "cancelled", "canceled", "rejected"].includes(o.status));

  /* وضع الطلب */
  function placeOrder(pay){
    const status = pay.paid ? "processing" : "unpaid";
    const order = {
      id: "o" + Date.now(), number: SB.newOrderNumber(),
      restaurants: groups.map((g) => g.restaurantId),
      restaurantNames: groups.map((g) => SB.findRestaurant(g.restaurantId).name),
      groups: groups.map((g) => ({ restaurantId: g.restaurantId, items: g.lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty, unit: SB.unitPrice(l) })), subtotal: g.subtotal })),
      itemsCount: cartCount, subtotal, fee: deliveryFee, total,
      status, payMethod: pay.method, paid: pay.paid, problemNote: pay.pnote || "",
      address, restNote, etaMin: Math.min.apply(null, groups.map((g) => SB.findRestaurant(g.restaurantId).etaMin)),
      etaMax: Math.max.apply(null, groups.map((g) => SB.findRestaurant(g.restaurantId).etaMax)),
      placedAt: Date.now(), rated: 0,
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]); setRestNote("");
    setStack([{ name: "home" }, { name: "placed", oid: order.id }]);
    if (window.SonbolHub) SonbolHub.publish(customerToHub(order)); // أرسل الطلب للمطعم/الإدارة فوراً
  }

  function advanceOrder(oid){
    setOrders((prev) => prev.map((o) => {
      if (o.id !== oid) return o;
      if (o.status === "unpaid") return { ...o, status: "processing", paid: true };
      const i = SB.TIMELINE.indexOf(o.status);
      if (i < 0 || i >= SB.TIMELINE.length - 1) return o;
      return { ...o, status: SB.TIMELINE[i + 1] };
    }));
  }
  function rateOrder(oid, n){ setOrders((prev) => prev.map((o) => o.id === oid ? { ...o, rated: n } : o)); }
  function reorder(o){ const r = SB.findRestaurant(o.restaurants[0]); if (r) go({ name: "restaurant", rid: r.id }); showToast("اختر أصنافك من جديد"); }

  /* عناوين */
  function saveAddress(a){
    setAddrList((prev) => {
      let next = prev.some((x) => x.id === a.id) ? prev.map((x) => x.id === a.id ? a : x) : [...prev, a];
      if (a.def) next = next.map((x) => ({ ...x, def: x.id === a.id }));
      if (!next.some((x) => x.def) && next.length) next[0].def = true;
      return next;
    });
    if (a.def) setAddrId(a.id);
    back(); showToast("تم حفظ العنوان");
  }
  function setDefaultAddr(id){ setAddrList((prev) => prev.map((x) => ({ ...x, def: x.id === id }))); setAddrId(id); showToast("تم تحديد العنوان"); }
  function deleteAddr(id){ setAddrList((prev) => { const n = prev.filter((x) => x.id !== id); if (n.length && !n.some((x) => x.def)) n[0].def = true; return n; }); }

  function resetDemo(){
    localStorage.removeItem(LS);
    setAuthed(false); setStack([{ name: "home" }]); setCart([]); setOrders(SB.sampleOrders());
    setAddrList(SB.ADDRESSES); setAddrId(SB.ADDRESSES[0].id); setRestNote(""); setItemSheet(null);
  }

  function getOrder(oid){ return orders.find((o) => o.id === oid); }

  /* عرض الشاشة */
  function render(){
    if (!authed) return <AuthScreen onDone={() => { setAuthed(true); resetTo("home"); }} />;
    switch (cur.name){
      case "home":
        return <HomeScreen restaurants={SB.RESTAURANTS} onOpenRest={(r) => go({ name: "restaurant", rid: r.id })}
          onGoSearch={() => go({ name: "search" })} activeOrders={activeOrders} onGoTrack={(oid) => go({ name: "track", oid })} />;
      case "search":
        return <SearchScreen restaurants={SB.RESTAURANTS} back={back}
          onOpenRest={(r) => go({ name: "restaurant", rid: r.id })} onOpenItem={(it, r) => openItem(it, r)} />;
      case "restaurant": {
        const r = SB.findRestaurant(cur.rid);
        return <RestaurantScreen r={r} back={back} onOpenItem={(it) => openItem(it, r)}
          goCart={() => go({ name: "cart" })} cartCount={cartCount} cartTotal={total} cartRestCount={groups.length} />;
      }
      case "cart":
        return <CartScreen groups={groups} setQty={setQty} removeLine={removeLine}
          subtotal={subtotal} deliveryFee={deliveryFee} total={total}
          onCheckout={() => go({ name: "confirm" })} back={back} goHome={() => resetTo("home")}
          onAddFrom={(r) => go({ name: "restaurant", rid: r.id })} />;
      case "confirm":
        return <ConfirmScreen groups={groups} address={address} addresses={addrList} onPickAddress={setAddrId}
          onEditDelivery={() => go({ name: "addaddr", edit: address })} subtotal={subtotal} deliveryFee={deliveryFee} total={total}
          restNote={restNote} setRestNote={setRestNote} onNext={() => go({ name: "payment" })} back={back} />;
      case "payment":
        return <PaymentScreen total={total} back={back} onPlace={placeOrder} />;
      case "placed":
        return <PlacedScreen order={getOrder(cur.oid)} onTrack={() => setStack([{ name: "home" }, { name: "track", oid: cur.oid }])} onHome={() => resetTo("home")} />;
      case "track": {
        const o = getOrder(cur.oid);
        if (!o) return <OrdersScreen orders={orders} onTrack={(oid) => go({ name: "track", oid })} onReorder={reorder} onRate={(oid) => go({ name: "track", oid })} />;
        return <TrackScreen order={o} back={() => stack.length > 1 ? back() : resetTo("home")} onHome={() => resetTo("home")} onRate={(n) => rateOrder(o.id, n)} />;
      }
      case "orders":
        return <OrdersScreen orders={orders} onTrack={(oid) => go({ name: "track", oid })} onReorder={reorder} onRate={(oid) => go({ name: "track", oid })} />;
      case "account":
        return <AccountScreen stats={{ orders: orders.length, favs: 0 }} onOrders={() => resetTo("orders")}
          onAddresses={() => go({ name: "addresses" })} onSettings={() => go({ name: "addresses" })}
          onSupport={() => showToast("تواصل مع الدعم — قريباً")} onLogout={resetDemo} />;
      case "addresses":
        return <AddressesScreen addresses={addrList} onAdd={(a) => go({ name: "addaddr", edit: a })}
          onSetDefault={setDefaultAddr} onDelete={deleteAddr} back={back} />;
      case "addaddr":
        return <AddAddressScreen initial={cur.edit} onSave={saveAddress} back={back} />;
      default:
        return <HomeScreen restaurants={SB.RESTAURANTS} onOpenRest={() => {}} onGoSearch={() => {}} activeOrders={[]} onGoTrack={() => {}} />;
    }
  }

  const showTab = authed && ["home", "orders", "account"].includes(cur.name);
  const tabs = [
    { k: "home", l: "الرئيسية", ic: "home" },
    { k: "cart", l: "السلة", ic: "bag", badge: cartCount, push: true },
    { k: "orders", l: "طلباتي", ic: "receipt", badge: activeOrders.length },
    { k: "account", l: "حسابي", ic: "user" },
  ];

  const trackOrder = cur.name === "track" ? getOrder(cur.oid) : null;

  return (
    <div className="stage">
      <div className="phone-scale" style={{ transform: `scale(${scale})` }}>
        <div className="phone">
          <div className="phone-screen">
            <div className="notch"></div>
            <StatusBar />
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", position: "relative" }}>
              {render()}
              {itemSheet && <ItemSheet it={itemSheet.it} r={itemSheet.r} initial={itemSheet.editUid ? cart.find((l) => l.uid === itemSheet.editUid) : null} onClose={() => setItemSheet(null)} onAdd={onItemAdd} />}
            </div>

            {showTab && (
              <div className="tabbar">
                {tabs.map((tb) => {
                  const I = window.Ic[tb.ic] || Ic.home;
                  const on = cur.name === tb.k;
                  return (
                    <button className={"tab" + (on ? " on" : "")} key={tb.k} onClick={() => tb.push ? go({ name: "cart" }) : tab(tb.k)}>
                      <span className="tb-ic"><I s={23} />{tb.badge > 0 && <span className="tb-badge tnum">{tb.badge}</span>}</span>
                      <span>{tb.l}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {toast && <Toast msg={toast} />}
          </div>
        </div>
      </div>

      {/* شريط المحاكاة (يحاكي لوحة التحكم) */}
      <div className="demobar">
        <span className="dl">محاكاة لوحة التحكم:<br /><b>{trackOrder ? SB.STATUS[trackOrder.status].label : (activeOrders[0] ? SB.STATUS[activeOrders[0].status].label : "لا طلب نشط")}</b></span>
        {(() => {
          const o = trackOrder || activeOrders[0];
          if (!o) return <span className="dl" style={{ opacity: .6 }}>أنشئ طلباً</span>;
          const label = o.status === "unpaid" ? "تأكيد الدفع" : o.status === "ready" ? "تعيين كابتن" : o.status === "delivered" ? "تم" : "تقديم الحالة";
          if (o.status === "delivered") return <span className="dl" style={{ opacity: .6 }}>اكتمل</span>;
          return <button className="demo-adv" onClick={() => advanceOrder(o.id)}>{label} <Ic.chevL s={14} style={{ verticalAlign: "-2px" }} /></button>;
        })()}
        <button className="demo-reset" onClick={() => { resetDemo(); if (window.SonbolHub) SonbolHub.reset(); }}>إعادة ضبط</button>
      </div>

      <TweaksPanel title="التحكم">
        <TweakSection label="الخط" />
        <TweakSelect label="نوع الخط" value={t.font}
          options={[
            { value: "Tajawal", label: "Tajawal — طجوال" },
            { value: "Cairo", label: "Cairo — القاهرة" },
            { value: "Almarai", label: "Almarai — المراعي" },
            { value: "IBM Plex Arabic", label: "IBM Plex Arabic" },
            { value: "Rubik", label: "Rubik — روبيك" },
          ]}
          onChange={(v) => setTweak("font", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
