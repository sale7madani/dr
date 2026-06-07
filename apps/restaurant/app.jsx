/* ============================================================
   التطبيق الرئيسي — سنبل | واجهة المطعم
   ============================================================ */
const A = window.SunbulAudio;
const LS_KEY = "sunbul_restaurant_v7";

/* ساعة الشريط العلوي */
function HeaderClock(){
  useNow(true);
  const d = new Date();
  let h = d.getHours(); const m = d.getMinutes();
  const ap = h >= 12 ? "م" : "ص"; h = h % 12 || 12;
  const days = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  return (
    <div className="clock">
      <div className="t tnum">{h}:{m < 10 ? "0" + m : m} {ap}</div>
      <div className="d">{days[d.getDay()]} · 6 حزيران 2026</div>
    </div>
  );
}

function loadState(){
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function cloneMenu(menu){
  return menu.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i })) }));
}

/* ===== جسر ناقل الأحداث (Hub) ===== */
function mapHubToRest(s){
  if (s === "processing" || s === "new") return "new";
  if (s === "preparing") return "preparing";
  if (s === "ready") return "ready";
  if (s === "onway" || s === "delivered") return "delivered";
  if (s === "rejected" || s === "canceled") return "rejected";
  return null; // unpaid → لا يظهر للمطعم
}
function restaurantFromHub(h){
  return {
    id: h.id, number: h.number || 0, status: mapHubToRest(h.status) || "new",
    customer: { name: h.customerName || "زبون", phone: h.customerPhone || "", address: h.customerArea || h.address || "" },
    items: (h.items || []).map((i, ix) => ({ id: i.id || ("hi" + ix), name: i.name, price: i.price || 0, qty: i.qty || 1, mods: i.mods || [] })),
    note: h.note || "",
    payment: (h.payMethod && /نقد|cash/i.test(h.payMethod)) ? "cash" : (h.paid ? "online" : "cash"),
    subtotal: h.subtotal || 0, delivery: h.deliveryFee || 0, grandTotal: h.total || ((h.subtotal || 0) + (h.deliveryFee || 0)),
    createdAt: h.createdAt || Date.now(), acceptedAt: null, prepTime: null, readyAt: null,
    _hub: true,
  };
}
function restaurantToHub(o, status, restName){
  return {
    id: o.id, number: o.number, status: status,
    restaurantName: o._hub ? undefined : (restName || "المطعم"),
    customerName: o.customer && o.customer.name, customerPhone: o.customer && o.customer.phone,
    customerArea: o.customer && o.customer.address, address: o.customer && o.customer.address,
    items: (o.items || []).map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    itemsCount: (o.items || []).reduce((s, i) => s + (i.qty || 0), 0),
    subtotal: o.subtotal, deliveryFee: o.delivery, total: o.grandTotal,
    payMethod: o.payment, paid: o.payment === "online",
    note: o.note, origin: o._hub ? undefined : "restaurant", createdAt: o.createdAt,
  };
}

function App(){
  const saved = useRef(loadState()).current;

  const [orders, setOrders]       = useState(() => saved ? saved.orders : S.seedOrders());
  const [menu, setMenu]           = useState(() => saved ? saved.menu : cloneMenu(S.MENU));
  const [view, setView]           = useState(() => (saved && saved.view) || "orders");
  const [accepting, setAccepting] = useState(() => saved ? saved.accepting : true);
  const [session, setSession]     = useState(() => saved ? saved.session : { delivered: 0, revenue: 0, rejected: 0 });
  const [settings, setSettings]   = useState(() => (saved && saved.settings) ? saved.settings : S.DEFAULT_SETTINGS);

  const [alertQueue, setAlertQueue]   = useState([]);
  const [manualNewId, setManualNewId] = useState(null);
  const [drawerId, setDrawerId]       = useState(null);
  const [rejecting, setRejecting]     = useState(null); // الطلب قيد الرفض
  const [editor, setEditor]           = useState(null); // { isNew, cat, id, name, price, available }
  const [catEditor, setCatEditor]     = useState(null); // { isNew, name }
  const [catDelete, setCatDelete]     = useState(null); // { cat, items }

  const muted = !settings.alertSound;

  /* حفظ الحالة */
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ orders, menu, view, accepting, session, settings }));
  }, [orders, menu, view, accepting, session, settings]);

  /* تهيئة الصوت عند أول نقرة */
  useEffect(() => {
    const f = () => { A.prime(); window.removeEventListener("pointerdown", f); };
    window.addEventListener("pointerdown", f);
    return () => window.removeEventListener("pointerdown", f);
  }, []);

  /* صوت التنبيه */
  useEffect(() => {
    A.setMuted(muted);
    if (alertQueue.length > 0 && !muted) A.startAlert();
    else A.stopAlert();
  }, [alertQueue.length, muted]);

  /* استقبال الطلبات الحيّة من الزبون/الإدارة عبر الـ hub */
  const hubSeen = useRef({});
  useEffect(() => {
    if (!window.SonbolHub) return;
    function applyHubOrder(h){
      if (!h || !h.id) return;
      const rstatus = mapHubToRest(h.status);
      if (rstatus === null) return; // طلب غير مدفوع — لا يظهر بعد
      setOrders((prev) => {
        const ex = prev.find((o) => o.id === h.id);
        if (ex) return prev.map((o) => o.id === h.id ? { ...o, status: rstatus } : o);
        return [...prev, restaurantFromHub(h)];
      });
      const firstTime = !hubSeen.current[h.id];
      hubSeen.current[h.id] = h.status;
      if (firstTime && (h.status === "processing" || h.status === "new") && h.origin !== "restaurant") {
        setAlertQueue((q) => q.includes(h.id) ? q : [...q, h.id]); // طلب جديد → صوت + منبثقة
      }
    }
    const off1 = SonbolHub.on("order", applyHubOrder);
    const off2 = SonbolHub.on("init", (list) => list.forEach(applyHubOrder));
    SonbolHub.connect();
    return () => { off1 && off1(); off2 && off2(); };
  }, []);

  const newCount   = orders.filter((o) => o.status === "new").length;
  const prepCount  = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;

  const modalOrderId = alertQueue[0] || manualNewId;
  const modalOrder   = orders.find((o) => o.id === modalOrderId) || null;
  const drawerOrder  = orders.find((o) => o.id === drawerId) || null;

  /* ===== الطلبات ===== */
  const pushOrder = useCallback(() => {
    const o = S.incomingOrder();
    setOrders((prev) => [...prev, o]);
    setAlertQueue((prev) => [...prev, o.id]);
  }, []);

  function clearFromQueue(id){
    setAlertQueue((prev) => prev.filter((x) => x !== id));
    setManualNewId((m) => (m === id ? null : m));
  }
  function accept(order, prep){
    setOrders((prev) => prev.map((o) => o.id === order.id
      ? { ...o, status: "preparing", acceptedAt: Date.now(), prepTime: prep } : o));
    clearFromQueue(order.id);
    A.blip(true);
    if (window.SonbolHub) SonbolHub.publish(restaurantToHub(order, "preparing", settings.name));
  }
  function reject(order, reason){
    setOrders((prev) => prev.map((o) => o.id === order.id
      ? { ...o, status: "rejected", rejectReason: reason || "", rejectedAt: Date.now() } : o));
    setSession((s) => ({ ...s, rejected: s.rejected + 1 }));
    clearFromQueue(order.id);
    setRejecting(null);
    A.blip(false);
    if (window.SonbolHub) SonbolHub.publish(restaurantToHub(order, "rejected", settings.name));
  }
  function action(order, type){
    if (type === "open-accept"){ setDrawerId(null); setManualNewId(order.id); return; }
    if (type === "ready"){
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "ready", readyAt: Date.now() } : o));
      A.blip(true);
      if (window.SonbolHub) SonbolHub.publish(restaurantToHub(order, "ready", settings.name));
    }
    if (type === "delivered"){
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "delivered", deliveredAt: Date.now() } : o));
      setSession((s) => ({ ...s, delivered: s.delivered + 1, revenue: s.revenue + order.subtotal }));
      setDrawerId(null);
      A.blip(true);
      if (window.SonbolHub) SonbolHub.publish(restaurantToHub(order, "onway", settings.name)); // سُلّم للكابتن → في الطريق
    }
  }
  function openOrder(order){
    if (order.status === "new") setManualNewId(order.id);
    else setDrawerId(order.id);
  }

  /* ===== المنيو ===== */
  function toggleMenuItem(catName, itemId){
    setMenu((prev) => prev.map((c) => c.cat !== catName ? c
      : { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, available: !i.available } : i) }));
  }
  function openEdit(cat, item){ setEditor({ isNew: false, cat, id: item.id, name: item.name, price: item.price, available: item.available, image: item.image || "", desc: item.desc || "", optionGroups: item.optionGroups || [] }); }
  function openAdd(cat){ setEditor({ isNew: true, cat, id: null, name: "", price: "", available: true, image: "", desc: "", optionGroups: [] }); }
  function saveItem(data){
    setMenu((prev) => {
      const m = cloneMenu(prev);
      const fields = { name: data.name, price: data.price, available: data.available, image: data.image, desc: data.desc, optionGroups: data.optionGroups };
      if (editor.isNew){
        const tgt = m.find((c) => c.cat === data.cat);
        tgt.items.push({ id: "x" + Date.now(), ...fields });
      } else if (data.cat === editor.cat){
        const c = m.find((x) => x.cat === editor.cat);
        c.items = c.items.map((i) => i.id === editor.id ? { ...i, ...fields } : i);
      } else {
        const oldC = m.find((x) => x.cat === editor.cat);
        const idx = oldC.items.findIndex((i) => i.id === editor.id);
        const ex = oldC.items[idx]; oldC.items.splice(idx, 1);
        const tgt = m.find((x) => x.cat === data.cat);
        tgt.items.push({ ...ex, ...fields });
      }
      return m;
    });
    setEditor(null);
  }
  function deleteItem(){
    setMenu((prev) => prev.map((c) => c.cat !== editor.cat ? c
      : { ...c, items: c.items.filter((i) => i.id !== editor.id) }));
    setEditor(null);
  }

  /* ===== التصنيفات ===== */
  function openAddCategory(){ setCatEditor({ isNew: true, name: "" }); }
  function openEditCategory(cat){ setCatEditor({ isNew: false, name: cat }); }
  function saveCategory(name){
    setMenu((prev) => {
      if (catEditor.isNew){
        if (prev.some((c) => c.cat === name)) return prev;
        return [...cloneMenu(prev), { cat: name, items: [] }];
      }
      return prev.map((c) => c.cat === catEditor.name ? { ...c, cat: name } : c);
    });
    setCatEditor(null);
  }
  function confirmDeleteCategory(){
    setMenu((prev) => prev.filter((c) => c.cat !== catDelete.cat));
    setCatDelete(null);
  }

  /* ===== الإعدادات ===== */
  function updateSettings(patch){ setSettings((s) => ({ ...s, ...patch })); }

  function resetDemo(){
    localStorage.removeItem(LS_KEY);
    setOrders(S.seedOrders());
    setMenu(cloneMenu(S.MENU));
    setAccepting(true);
    setSession({ delivered: 0, revenue: 0, rejected: 0 });
    setSettings(S.DEFAULT_SETTINGS);
    setAlertQueue([]); setManualNewId(null); setDrawerId(null); setEditor(null);
    setCatEditor(null); setCatDelete(null); setRejecting(null);
    setView("orders");
  }

  const mainNav = [
    { k: "orders", label: "الطلبات", ico: <Ic.grid s={20} />, count: newCount + prepCount + readyCount, hasNew: newCount > 0 },
    { k: "menu", label: "المنيو", ico: <Ic.list s={20} /> },
    { k: "summary", label: "ملخص اليوم", ico: <Ic.bag s={20} /> },
    { k: "analytics", label: "الإحصاءات", ico: <Ic.chart s={20} /> },
  ];
  const categories = menu.map((c) => c.cat);

  return (
    <div className="app">
      {/* القائمة الجانبية */}
      <div className="sidebar">
        <div className="side-brand">
          <div className="brand-mark"><span>س</span></div>
          <div className="brand-text">
            <div className="brand-name">سنبل</div>
            <div className="brand-sub">{settings.name} · {settings.branch}</div>
          </div>
        </div>

        <div className="side-nav">
          {mainNav.map((n) => (
            <button key={n.k} className={(view === n.k ? "active " : "") + (n.hasNew ? "has-new" : "")}
              onClick={() => setView(n.k)}>
              {n.ico}{n.label}
              {n.count !== undefined && n.count > 0 && <span className="pill tnum">{n.count}</span>}
            </button>
          ))}
        </div>

        <div className="side-sp"></div>

        <div className="side-nav">
          <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>
            <Ic.gear s={20} />الإعدادات
          </button>
        </div>

        <div className="side-foot">
          <button className={"side-acc " + (accepting ? "on" : "off")} onClick={() => setAccepting((a) => !a)}>
            <div className="sa-l">
              <b>{accepting ? "مفتوح" : "مشغول"}</b>
              <small>{accepting ? "نستقبل الطلبات" : "متوقف مؤقتاً"}</small>
            </div>
            <div className="switch"></div>
          </button>
        </div>
      </div>

      {/* المنطقة الرئيسية */}
      <div className="main">
        <div className="topbar">
          <HeaderClock />
          <div className="tbar-tools">
            <div className={"tstat " + (accepting ? "on" : "off")}>
              <span className="d"></span>
              {accepting ? "مفتوح · نستقبل الطلبات" : "مشغول · متوقف"}
            </div>
            <button className={"tbtn" + (muted ? " muted" : "")} onClick={() => updateSettings({ alertSound: muted })}
              title={muted ? "تشغيل صوت التنبيه" : "كتم صوت التنبيه"}>
              {muted ? <Ic.bellOff s={21} /> : <Ic.bell s={21} />}
            </button>
          </div>
        </div>

        {!accepting && (
          <div className="busy-banner">
            <span className="dot"></span>
            المطعم في وضع «مشغول» — لا يتم استقبال طلبات جديدة. اضغط المفتاح في الأسفل للعودة لاستقبال الطلبات.
          </div>
        )}

        {view === "orders"   && <OrdersView orders={orders} onOpen={openOrder} onAction={action} />}
        {view === "menu"     && <MenuScreen menu={menu} onToggle={toggleMenuItem} onEdit={openEdit} onAdd={openAdd} onAddCategory={openAddCategory} onEditCategory={openEditCategory} onDeleteCategory={(cat) => { const c = menu.find((x) => x.cat === cat); setCatDelete({ cat, items: c ? c.items : [] }); }} />}
        {view === "summary"  && <SummaryScreen session={session} menu={menu} />}
        {view === "analytics" && <AnalyticsScreen />}
        {view === "settings" && <SettingsScreen settings={settings} onChange={updateSettings} />}
      </div>

      {/* المنبثقة: طلب جديد */}
      {modalOrder && !rejecting && (
        <NewOrderModal
          order={modalOrder}
          muted={muted}
          defaultPrep={settings.defaultPrep}
          onToggleMute={() => updateSettings({ alertSound: muted })}
          onAccept={accept}
          onReject={(o) => setRejecting(o)}
          onDismiss={() => clearFromQueue(modalOrder.id)}
        />
      )}

      {/* حوار رفض الطلب */}
      {rejecting && (
        <RejectDialog
          order={rejecting}
          onConfirm={reject}
          onClose={() => setRejecting(null)}
        />
      )}

      {/* لوحة التفاصيل */}
      {drawerOrder && <OrderDrawer order={drawerOrder} onClose={() => setDrawerId(null)} onAction={action} />}

      {/* محرّر صنف المنيو */}
      {editor && (
        <ItemEditorModal
          draft={editor}
          categories={categories}
          onSave={saveItem}
          onDelete={deleteItem}
          onClose={() => setEditor(null)}
        />
      )}

      {/* محرّر التصنيف */}
      {catEditor && (
        <CategoryEditorModal
          draft={catEditor}
          existing={categories}
          onSave={saveCategory}
          onClose={() => setCatEditor(null)}
        />
      )}

      {/* حوار حذف التصنيف */}
      {catDelete && (
        <DeleteCategoryDialog
          cat={catDelete.cat}
          count={catDelete.items.length}
          items={catDelete.items}
          onConfirm={confirmDeleteCategory}
          onClose={() => setCatDelete(null)}
        />
      )}

      {/* شريط المحاكاة التجريبي */}
      <div className="demobar">
        <span className="dl">للتجربة: <b>محاكاة</b></span>
        <button className="btn btn-gold btn-sm" onClick={pushOrder} disabled={!accepting}
          style={{ opacity: accepting ? 1 : 0.5 }}>
          <Ic.plus s={17} /> طلب جديد وارد
        </button>
        <button className="btn btn-line btn-sm" onClick={resetDemo} style={{ color: "rgba(255,255,255,.7)", borderColor: "rgba(255,255,255,.2)" }}>
          إعادة ضبط
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
