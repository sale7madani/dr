/* ============================================================
   التطبيق الرئيسي — لوحة تحكم سنبل (Super Admin)
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "overviewLayout": "analytical",
  "accent": ["#ffb81c", "#d9920a", "#fff3d4", "#fffaef"],
  "density": "عادي"
}/*EDITMODE-END*/;

const SECTION_META = {
  overview:    { t: "النظرة العامة", s: "أهلاً بعودتك — هذا ملخّص منصّة سنبل اليوم" },
  orders:      { t: "الطلبات", s: "كل طلبات المنصّة بشكل مباشر" },
  captains:    { t: "الكباتن", s: "إدارة ومتابعة فريق التوصيل" },
  restaurants: { t: "المطاعم", s: "إدارة المطاعم الشريكة وطلبات الانضمام" },
  customers:   { t: "الزبائن", s: "حسابات الزبائن والشكاوى" },
  finance:     { t: "المالية", s: "العمولات والتسويات والتحويلات" },
  promos:      { t: "البرومو كودز", s: "أكواد الخصم والعروض الترويجية" },
  reports:     { t: "التقارير", s: "تحليلات أداء المنصّة" },
  settings:    { t: "الإعدادات", s: "إعدادات المنصّة المالية والتشغيلية" },
};

/* ===== جسر ناقل الأحداث (Hub) ===== */
function adminFromHub(h){
  return {
    id: h.id, number: h.number,
    status: h.status === "rejected" ? "canceled" : h.status,
    rid: h.restaurantId || "", restaurant: h.restaurantName || "—", restGrad: "linear-gradient(135deg,#b8742a,#8f561a)",
    uid: null, customer: h.customerName || "—", custPhone: h.customerPhone || "", area: h.customerArea || h.address || "—",
    captainId: h.captainId || null, captain: h.captainName || null,
    items: (h.items || []).map((i) => ({ name: i.name, price: i.price || 0, qty: i.qty || 1 })),
    itemCount: h.itemsCount || (h.items || []).reduce((s, i) => s + (i.qty || 0), 0),
    subtotal: h.subtotal || 0, delivery: h.deliveryFee || 0, total: h.total || 0,
    commission: Math.round((h.subtotal || 0) * 0.15), km: h.km || 0,
    payment: h.payMethod || "online", payStatus: h.paid ? "verified" : "unpaid", payRef: "HUB-" + (h.number || ""),
    createdAt: h.createdAt || Date.now(), note: h.note || "",
    rejectReason: h.status === "rejected" ? "رفض المطعم الطلب" : null, issue: null, _hub: true,
  };
}
function adminToHub(o, status){
  return {
    id: o.id, number: o.number, status: status || o.status,
    restaurantId: o.rid, restaurantName: o.restaurant, restaurantArea: o.area,
    customerName: o.customer, customerPhone: o.custPhone, customerArea: o.area, address: o.area,
    items: (o.items || []).map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    itemsCount: o.itemCount, subtotal: o.subtotal, deliveryFee: o.delivery, total: o.total,
    payMethod: o.payment, paid: o.payStatus === "verified" || o.payStatus === "cash",
    captainId: o.captainId, captainName: o.captain, km: o.km, note: o.note,
    origin: o._hub ? undefined : "admin", createdAt: o.createdAt,
  };
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useState("overview");
  const [search, setSearch] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  const [orders, setOrders] = useState(() => A.seedOrders());
  const [captains, setCaptains] = useState(() => A.CAPTAINS.map((c) => ({ ...c })));
  const [restaurants, setRestaurants] = useState(() => A.RESTAURANTS.map((r) => ({ ...r })));
  const [customers, setCustomers] = useState(() => A.CUSTOMERS.map((c) => ({ ...c })));
  const [transfers, setTransfers] = useState(() => A.seedTransfers());
  const [settlements, setSettlements] = useState(() => A.SETTLEMENTS.map((s) => ({ ...s })));
  const [payouts, setPayouts] = useState(() => A.seedPayouts());
  const [promos, setPromos] = useState(() => A.seedPromos());
  const [team, setTeam] = useState(() => A.seedTeam());
  const [teamEdit, setTeamEdit] = useState(null); // {member} | "new"
  const [settings, setSettings] = useState(() => JSON.parse(JSON.stringify(A.DEFAULT_SETTINGS)));
  const [activity] = useState(() => A.seedActivity());

  const [orderId, setOrderId] = useState(null);
  const [capId, setCapId] = useState(null);
  const [restId, setRestId] = useState(null);
  const [custId, setCustId] = useState(null);
  const [commissionRest, setCommissionRest] = useState(null);
  const [editCap, setEditCap] = useState(null);
  const [editRest, setEditRest] = useState(null);
  const [showAddCap, setShowAddCap] = useState(false);
  const [showAddRest, setShowAddRest] = useState(false);
  const [promoEdit, setPromoEdit] = useState(null); // {} = جديد أو كائن
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // ⌘K / Ctrl+K — بحث الأوامر السريع
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setCmdOpen((v) => !v); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);

  // تطبيق التمييز والكثافة
  useEffect(() => {
    const root = document.documentElement;
    const a = t.accent || TWEAK_DEFAULTS.accent;
    root.style.setProperty("--accent", a[0]);
    root.style.setProperty("--accent-deep", a[1]);
    root.style.setProperty("--accent-soft", a[2]);
    root.style.setProperty("--accent-tint", a[3]);
    const dens = t.density === "مريح" ? 1.25 : t.density === "مدمج" ? 0.78 : 1;
    root.style.setProperty("--dens", dens);
  }, [t.accent, t.density]);

  function flash(msg, tone){ setToast({ msg, tone: tone || "ink" }); }
  useEffect(() => { if (!toast) return; const x = setTimeout(() => setToast(null), 2600); return () => clearTimeout(x); }, [toast]);

  /* تدفّق الطلبات الحيّ من كل الواجهات → يظهر في لوحة الإدارة مباشرة */
  useEffect(() => {
    if (!window.SonbolHub) return;
    function apply(h){
      if (!h || !h.id) return;
      const ao = adminFromHub(h);
      setOrders((prev) => {
        const i = prev.findIndex((o) => o.id === h.id);
        if (i >= 0) { const c = prev.slice(); c[i] = { ...prev[i], ...ao }; return c; }
        return [ao, ...prev];
      });
    }
    const off1 = SonbolHub.on("order", apply);
    const off2 = SonbolHub.on("init", (list) => list.forEach(apply));
    SonbolHub.connect();
    return () => { off1 && off1(); off2 && off2(); };
  }, []);

  const orderDetail = orderId ? orders.find((o) => o.id === orderId) : null;
  const capDetail = capId ? captains.find((c) => c.id === capId) : null;
  const restDetail = restId ? restaurants.find((r) => r.id === restId) : null;
  const custDetail = custId ? customers.find((c) => c.id === custId) : null;

  const counts = {
    approvals: restaurants.filter((r) => r.status === "pending").length,
    transfers: transfers.filter((x) => x.status === "pending" || x.status === "flagged").length,
    unpaid: orders.filter((o) => o.status === "unpaid").length,
    processing: orders.filter((o) => o.status === "processing").length,
    live: orders.filter((o) => ["unpaid", "processing", "new", "preparing", "ready", "onway"].includes(o.status)).length,
  };

  function addCaptain(f){
    const id = "p" + Date.now();
    const nc = { id, name: f.name, phone: f.phone, phone2: f.phone2 || "", idNo: f.idNo, birth: f.birth || "—", address: f.address || (f.area + " — —"), area: f.area, status: "online", vehicle: f.vehicle,
      payType: f.payType, capCommission: f.payType === "commission" ? f.capCommission : 0, dailyWage: f.payType === "daily" ? f.dailyWage : 0, incentive: f.incentive,
      active: 0, todayTrips: 0, todayEarn: 0, rating: 5.0, totalTrips: 0, joined: "اليوم", x: 20 + Math.round(Math.random() * 60), y: 20 + Math.round(Math.random() * 55) };
    setCaptains((p) => [nc, ...p]); setShowAddCap(false); flash("تمت إضافة الكابتن " + f.name, "green");
  }
  function addRestaurant(f){
    const id = "r" + Date.now();
    const nr = { id, name: f.name, ar: f.name, cuisine: f.cuisine, area: f.area, status: "active", commission: f.commission,
      rating: 0, ordersToday: 0, ordersTotal: 0, revenueToday: 0, grad: f.grad || "linear-gradient(135deg,#b8742a,#8f561a)", joined: "اليوم", prep: f.prep || 30,
      desc: f.desc || "", cover: f.cover || null, hours: f.hours, menu: f.menu };
    setRestaurants((p) => [nr, ...p]); setShowAddRest(false); flash("تمت إضافة مطعم " + f.name, "green");
  }

  function updateCaptain(f){
    setCaptains((p) => p.map((c) => c.id === editCap.id ? { ...c, name: f.name, phone: f.phone, phone2: f.phone2 || "", idNo: f.idNo, birth: f.birth || c.birth, address: f.address || c.address, area: f.area, vehicle: f.vehicle, payType: f.payType, capCommission: f.payType === "commission" ? f.capCommission : 0, dailyWage: f.payType === "daily" ? f.dailyWage : 0, incentive: f.incentive } : c));
    setEditCap(null); flash("تم حفظ بيانات الكابتن " + f.name, "green");
  }
  function updateRestaurant(f){
    setRestaurants((p) => p.map((r) => r.id === editRest.id ? { ...r, name: f.name, ar: f.name, cuisine: f.cuisine, area: f.area, commission: f.commission, prep: f.prep, desc: f.desc, cover: f.cover, hours: f.hours, menu: f.menu } : r));
    setEditRest(null); flash("تم حفظ بيانات " + f.name, "green");
  }

  function handleAction(type, entity, extra){
    switch (type) {
      case "confirm-payment":
        setOrders((p) => p.map((o) => o.id === entity.id ? { ...o, status: "processing", payStatus: o.payment === "cash" ? "cash" : "verified" } : o));
        if (window.SonbolHub) SonbolHub.publish(Object.assign(adminToHub(entity, "processing"), { paid: true }));
        flash("تم تأكيد دفع الطلب #" + entity.number + " — انتقل لقيد المعالجة", "green"); break;
      case "approve-order-pay":
        setOrders((p) => p.map((o) => o.id === entity.id ? { ...o, payStatus: "verified", rejectReason: null } : o));
        flash("تم الاعتماد المالي للطلب #" + entity.number + " — يمكنك تحويله للمطعم", "green"); break;
      case "reject-order-pay":
        setOrders((p) => p.map((o) => o.id === entity.id ? { ...o, status: "unpaid", payStatus: "rejected", rejectReason: extra } : o));
        flash("تم رفض وصل الطلب #" + entity.number + ": " + extra, "red"); break;
      case "dispatch":
        setOrders((p) => p.map((o) => o.id === entity.id ? { ...o, status: "new", captainId: extra.id, captain: extra.name } : o));
        if (window.SonbolHub) SonbolHub.publish(Object.assign(adminToHub(entity, "new"), { captainId: extra.id, captainName: extra.name }));
        flash("تم تحويل الطلب #" + entity.number + " للمطعم وتعيين الكابتن " + extra.name, "green"); break;
      case "reassign":
        setOrders((p) => p.map((o) => o.id === entity.id ? { ...o, captainId: extra.id, captain: extra.name } : o));
        if (window.SonbolHub) SonbolHub.publish({ id: entity.id, number: entity.number, captainId: extra.id, captainName: extra.name });
        flash("تم تبديل كابتن الطلب #" + entity.number + " إلى " + extra.name, "green"); break;
      case "cancel":
        setOrders((p) => p.map((o) => o.id === entity.id ? { ...o, status: "canceled" } : o));
        if (window.SonbolHub) SonbolHub.publish(adminToHub(entity, "canceled"));
        setOrderId(null); flash("تم إلغاء الطلب #" + entity.number, "red"); break;
      case "contact":
        flash("جارٍ الاتصال بالكابتن " + (entity.captain || "")); break;
      case "contact-order-cust":
        flash("جارٍ الاتصال بالزبون " + entity.customer); break;
      case "pay-payout":
        setPayouts((p) => p.map((x) => x.id === entity.id ? { ...x, status: "paid" } : x));
        flash("تم صرف " + A.money(entity.due) + " للكابتن " + entity.name, "green"); break;
      case "approve-rest":
        setRestaurants((p) => p.map((r) => r.id === entity.id ? { ...r, status: "active", rating: 4.5 } : r));
        setRestId(null); flash("تم قبول انضمام " + entity.name, "green"); break;
      case "reject-rest":
        setRestaurants((p) => p.filter((r) => r.id !== entity.id));
        setRestId(null); flash("تم رفض طلب " + entity.name, "red"); break;
      case "activate-rest":
        setRestaurants((p) => p.map((r) => r.id === entity.id ? { ...r, status: "active", suspendReason: null } : r));
        setRestId(null); flash("تم إعادة تفعيل " + entity.name, "green"); break;
      case "suspend-rest":
        setRestaurants((p) => p.map((r) => r.id === entity.id ? { ...r, status: "suspended", suspendReason: "إيقاف يدوي من الإدارة" } : r));
        setRestId(null); flash("تم إيقاف " + entity.name, "red"); break;
      case "edit-rest":
        setEditRest(entity); break;
      case "edit-captain":
        setEditCap(entity); break;
      case "flag-cust":
        setCustomers((p) => p.map((c) => c.id === entity.id ? { ...c, status: "flagged", flag: "وضعت تحت المراقبة يدوياً من الإدارة" } : c));
        flash("تم وضع " + entity.name + " تحت المراقبة", "red"); break;
      case "unflag-cust":
        setCustomers((p) => p.map((c) => c.id === entity.id ? { ...c, status: "regular", flag: null } : c));
        flash("تم رفع المراقبة عن " + entity.name, "green"); break;
      case "contact-cust":
        flash("جارٍ الاتصال بـ " + entity.name); break;
      case "contact-cap":
        flash("جارٍ الاتصال بالكابتن " + entity.name); break;
      case "suspend-cap":
        flash("تم إيقاف الكابتن " + entity.name + " مؤقتاً", "red"); setCapId(null); break;
      case "verify-transfer":
        setTransfers((p) => p.map((x) => x.id === entity.id ? { ...x, status: "verified" } : x));
        flash("تم تأكيد تحويل " + entity.customer + " (" + A.money(entity.amount) + ")", "green"); break;
      case "reject-transfer":
        setTransfers((p) => p.map((x) => x.id === entity.id ? { ...x, status: "rejected" } : x));
        flash("تم رفض تحويل " + entity.customer, "red"); break;
      case "pay-settlement":
        setSettlements((p) => p.map((s) => s.rid === entity.rid ? { ...s, status: "paid" } : s));
        flash("تم تحويل " + A.money(entity.net) + " إلى " + entity.name, "green"); break;
      default: break;
    }
  }

  const meta = SECTION_META[active];

  return (
    <div className={"app" + (navOpen ? " nav-open" : "")}>
      <div className="scrim" onClick={() => setNavOpen(false)}></div>
      <Sidebar active={active} onNav={(k) => { setActive(k); setSearch(""); }} counts={counts} onClose={() => setNavOpen(false)} />
      <div className="main">
        <Topbar title={meta.t} sub={meta.s} onBurger={() => setNavOpen(true)} search={search} setSearch={setSearch} alerts={counts.approvals + counts.transfers + counts.unpaid > 0} onCmd={() => setCmdOpen(true)} />
        <div className="page">
          {active === "overview" && <Overview layout={t.overviewLayout} orders={orders} activity={activity} counts={counts} onNav={setActive} onOpenOrder={(o) => setOrderId(o.id)} />}
          {active === "orders" && <OrdersScreen orders={orders} search={search} onOpen={(o) => setOrderId(o.id)} onNewOrder={() => setShowNewOrder(true)} />}
          {active === "captains" && <CaptainsScreen captains={captains} orders={orders} search={search} onOpen={(c) => setCapId(c.id)} onAdd={() => setShowAddCap(true)} />}
          {active === "restaurants" && <RestaurantsScreen restaurants={restaurants} orders={orders} search={search} onOpen={(r) => setRestId(r.id)} onAdd={() => setShowAddRest(true)} />}
          {active === "customers" && <CustomersScreen customers={customers} orders={orders} search={search} onOpen={(c) => setCustId(c.id)} />}
          {active === "promos" && <PromosScreen promos={promos} restaurants={restaurants} search={search} onAdd={() => setShowAddPromo(true)} onEdit={(p) => setPromoEdit(p)} onToggle={(p, st) => { setPromos((prev) => prev.map((x) => x.id === p.id ? { ...x, status: st } : x)); flash(st === "active" ? "تم تفعيل " + p.code : "تم إيقاف " + p.code, st === "active" ? "green" : "red"); }} />}
          {active === "finance" && <FinanceScreen transfers={transfers} settlements={settlements} payouts={payouts} search={search} onAction={handleAction} />}
          {active === "reports" && <ReportsScreen restaurants={restaurants} captains={captains} />}
          {active === "settings" && <SettingsScreen settings={settings} restaurants={restaurants} team={team} onTeam={(mode, m) => setTeamEdit(mode === "add" ? "new" : m)} onChange={(patch) => setSettings((p) => ({ ...p, ...patch }))} onReset={() => { setSettings(JSON.parse(JSON.stringify(A.DEFAULT_SETTINGS))); flash("تمت إعادة ضبط الإعدادات", "green"); }} />}
        </div>
      </div>

      {orderDetail && <OrderDrawer order={orderDetail} captains={captains} onClose={() => setOrderId(null)} onAction={handleAction} />}
      {capDetail && <CaptainDrawer captain={capDetail} orders={orders} onClose={() => setCapId(null)} onAction={handleAction} onOpenOrder={(o) => { setCapId(null); setActive("orders"); setOrderId(o.id); }} />}
      {restDetail && <RestaurantDrawer rest={restDetail} orders={orders} onClose={() => setRestId(null)} onAction={handleAction} />}
      {custDetail && <CustomerDrawer cust={custDetail} orders={orders} onClose={() => setCustId(null)} onAction={handleAction} />}

      {commissionRest && <CommissionModal rest={commissionRest} onClose={() => setCommissionRest(null)} onSave={(v) => { setRestaurants((p) => p.map((r) => r.id === commissionRest.id ? { ...r, commission: v } : r)); setCommissionRest(null); flash("تم تحديث عمولة " + commissionRest.name + " إلى " + v + "%", "green"); }} />}
      {showAddCap && <AddCaptainModal onClose={() => setShowAddCap(false)} onSubmit={addCaptain} />}
      {editCap && <AddCaptainModal initial={editCap} onClose={() => setEditCap(null)} onSubmit={updateCaptain} />}
      {showAddRest && <RestaurantEditor onClose={() => setShowAddRest(false)} onSubmit={addRestaurant} />}
      {editRest && <RestaurantEditor initial={editRest} onClose={() => setEditRest(null)} onSubmit={updateRestaurant} />}
      {showNewOrder && <NewOrderModal restaurants={restaurants} customers={customers} settings={settings} onClose={() => setShowNewOrder(false)} onSubmit={(d) => {
        const rest = restaurants.find((r) => r.id === d.rid) || {};
        const items = (d.items && d.items.length) ? d.items : [{ name: "طلب يدوي", price: d.subtotal, qty: 1 }];
        const num = Math.max(...orders.map((o) => o.number)) + 1;
        const no = { id: "o-" + num, number: num, status: "unpaid", rid: d.rid, restaurant: rest.name, restGrad: rest.grad,
          uid: null, customer: d.custName, custPhone: d.custPhone, area: d.area, captainId: null, captain: null,
          items: items.length ? items : [{ name: "طلب يدوي", price: d.subtotal, qty: 1 }], itemCount: items.length || 1,
          subtotal: d.subtotal, delivery: d.delivery, total: d.total, commission: Math.round(d.subtotal * ((rest.commission || 15) / 100)),
          payment: d.payment, payStatus: "unpaid", payRef: "MAN-" + num, createdAt: Date.now(), note: d.note || "", rejectReason: null, issue: null };
        setOrders((p) => [no, ...p]); setShowNewOrder(false); setActive("orders"); flash("تم إدخال الطلب #" + num + " — بانتظار الاعتماد المالي", "green");
      }} />}

      {showAddPromo && <PromoModal restaurants={restaurants} onClose={() => setShowAddPromo(false)} onSubmit={(p) => { setPromos((prev) => [{ ...p, id: "pc" + Date.now(), used: 0 }, ...prev]); setShowAddPromo(false); flash("تم إنشاء الكود " + p.code, "green"); }} />}
      {promoEdit && <PromoModal initial={promoEdit} restaurants={restaurants} onClose={() => setPromoEdit(null)} onSubmit={(p) => { setPromos((prev) => prev.map((x) => x.id === promoEdit.id ? { ...x, ...p } : x)); setPromoEdit(null); flash("تم حفظ الكود " + p.code, "green"); }} />}
      {teamEdit && <TeamModal initial={teamEdit === "new" ? null : teamEdit}
        onClose={() => setTeamEdit(null)}
        onRemove={(m) => { setTeam((p) => p.filter((x) => x.id !== m.id)); setTeamEdit(null); flash("تمت إزالة " + m.name, "red"); }}
        onSubmit={(f) => {
          if (teamEdit === "new") { setTeam((p) => [...p, { ...f, id: "tm" + Date.now(), last: Date.now() }]); flash("تمت إضافة " + f.name + " للفريق", "green"); }
          else { setTeam((p) => p.map((x) => x.id === teamEdit.id ? { ...x, ...f } : x)); flash("تم حفظ أذونات " + f.name, "green"); }
          setTeamEdit(null);
        }} />}

      {cmdOpen && <CommandPalette orders={orders} captains={captains} restaurants={restaurants} customers={customers}
        onClose={() => setCmdOpen(false)}
        onPick={(kind, id) => {
          setCmdOpen(false);
          if (kind === "order") { setActive("orders"); setOrderId(id); }
          else if (kind === "captain") { setActive("captains"); setCapId(id); }
          else if (kind === "restaurant") { setActive("restaurants"); setRestId(id); }
          else if (kind === "customer") { setActive("customers"); setCustId(id); }
          else if (kind === "nav") { setActive(id); }
        }} />}

      {toast && (
        <div style={{ position: "fixed", insetInlineStart: "50%", transform: "translateX(-50%)", bottom: 24, zIndex: 90, background: "var(--ink)", color: "#fff", padding: "13px 20px", borderRadius: 14, fontWeight: 800, fontSize: 14.5, boxShadow: "var(--sh-lg)", display: "flex", alignItems: "center", gap: 10 }} className="flash-in">
          <span style={{ color: toast.tone === "green" ? "var(--green)" : toast.tone === "red" ? "#ff9b95" : "var(--gold)" }}>
            {toast.tone === "red" ? <Ic.alert s={18} /> : <Ic.checkCircle s={18} />}
          </span>
          {toast.msg}
        </div>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="النظرة العامة" />
        <TweakRadio label="التخطيط" value={t.overviewLayout}
          options={[{ value: "analytical", label: "تحليلي" }, { value: "operational", label: "تشغيلي" }, { value: "compact", label: "مدمج" }]}
          onChange={(v) => { setTweak("overviewLayout", v); setActive("overview"); }} />
        <TweakSection label="المظهر" />
        <TweakColor label="لون التمييز" value={t.accent}
          options={[["#ffb81c", "#d9920a", "#fff3d4", "#fffaef"], ["#1d9d63", "#157a41", "#e3f6ec", "#f1fbf5"], ["#2f74c0", "#235a96", "#e6f0fa", "#f2f7fc"], ["#7d3cc0", "#5e2a93", "#f1e9fb", "#f8f4fd"]]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="الكثافة" value={t.density}
          options={["مريح", "عادي", "مدمج"]} onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

function CommissionModal({ rest, onClose, onSave }){
  const [val, setVal] = useState(rest.commission);
  return (
    <Modal icon="wallet" title={"عمولة " + rest.name} onClose={onClose}
      foot={[<button key="c" className="btn btn-line" onClick={onClose}>إلغاء</button>, <button key="s" className="btn btn-gold" onClick={() => onSave(val)}>حفظ</button>]}>
      <div className="field">
        <label>نسبة عمولة سنبل من كل طلب (٠٪ – ٣٠٪)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <input type="range" className="twk-slider" style={{ flex: 1 }} min="0" max="30" step="1" value={val} onChange={(e) => setVal(Number(e.target.value))} />
          <span style={{ fontSize: 26, fontWeight: 900, minWidth: 64, textAlign: "center", color: "var(--gold-deep)" }} className="tnum">{val}%</span>
        </div>
      </div>
      <div className="notice warn" style={{ marginBottom: 0 }}><Ic.alert s={18} /> يُطبّق التغيير على الطلبات الجديدة فقط بعد الحفظ.</div>
    </Modal>
  );
}

/* ===================== بحث الأوامر السريع (⌘K) ===================== */
function Ic2({ name }){ const I = Ic[name]; return I ? <I s={19} /> : null; }
function CommandPalette({ orders, captains, restaurants, customers, onClose, onPick }){
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const query = q.trim();
  const results = [];
  const statusWords = { "متأخر": "late", "متاخر": "late", "غير مدفوع": "unpaid", "جاهز": "ready", "جديد": "new", "تحضير": "preparing", "توصيل": "onway" };
  if (query) {
    orders.filter((o) => {
      if (("#" + o.number).includes(query) || ("" + o.number).includes(query)) return true;
      if (o.customer.includes(query) || o.restaurant.includes(query) || (o.captain || "").includes(query) || o.area.includes(query)) return true;
      for (const w in statusWords) if (query.includes(w)) { if (statusWords[w] === "late") return A.orderSLA(o).level === "late"; return o.status === statusWords[w]; }
      return false;
    }).slice(0, 6).forEach((o) => results.push({ kind: "order", id: o.id, icon: "bag", title: "#" + o.number + " · " + o.restaurant, sub: o.customer + " · " + o.area, tag: ORDER_STATUS[o.status] }));
    captains.filter((c) => c.name.includes(query) || c.phone.includes(query) || c.area.includes(query)).slice(0, 4)
      .forEach((c) => results.push({ kind: "captain", id: c.id, icon: "bike", title: c.name, sub: c.area + " · ★ " + c.rating, tag: CAP_STATUS[c.status] }));
    restaurants.filter((r) => r.name.includes(query) || (r.ar || "").includes(query) || r.cuisine.includes(query)).slice(0, 4)
      .forEach((r) => results.push({ kind: "restaurant", id: r.id, icon: "store", title: r.name, sub: r.cuisine + " · " + r.area, tag: REST_STATUS[r.status] }));
    customers.filter((c) => c.name.includes(query) || c.phone.includes(query)).slice(0, 4)
      .forEach((c) => results.push({ kind: "customer", id: c.id, icon: "user", title: c.name, sub: c.area + " · " + c.orders + " طلب", tag: CUST_STATUS[c.status] }));
  }
  const navs = [
    { id: "orders", label: "الطلبات", icon: "bag" }, { id: "captains", label: "الكباتن", icon: "bike" },
    { id: "restaurants", label: "المطاعم", icon: "store" },
    { id: "finance", label: "المالية", icon: "wallet" }, { id: "settings", label: "الإعدادات", icon: "gear" },
  ].filter((n) => !query || n.label.includes(query));

  return (
    <div className="cmd-ov" onClick={onClose}>
      <div className="cmd" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-search">
          <Ic.search s={20} style={{ color: "var(--text-faint)", flex: "0 0 auto" }} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن طلب، كابتن، مطعم، زبون… أو اكتب «متأخر»" />
          <kbd className="cmd-kbd">ESC</kbd>
        </div>
        <div className="cmd-body">
          {results.length > 0 ? (
            <>
              <div className="cmd-sec">نتائج</div>
              {results.map((r, i) => (
                <button key={i} className="cmd-item" onClick={() => onPick(r.kind, r.id)}>
                  <span className="cmd-ic"><Ic2 name={r.icon} /></span>
                  <span className="cmd-l"><span className="cmd-t">{r.title}</span><span className="cmd-s">{r.sub}</span></span>
                  {r.tag ? <Badge meta={r.tag} /> : null}
                </button>
              ))}
            </>
          ) : null}
          {navs.length > 0 ? (
            <>
              <div className="cmd-sec">انتقال سريع</div>
              {navs.map((n) => (
                <button key={n.id} className="cmd-item" onClick={() => onPick("nav", n.id)}>
                  <span className="cmd-ic"><Ic2 name={n.icon} /></span>
                  <span className="cmd-l"><span className="cmd-t">{n.label}</span></span>
                  <Ic.arrow s={15} style={{ color: "var(--text-faint)" }} />
                </button>
              ))}
            </>
          ) : null}
          {query && results.length === 0 && navs.length === 0 ? <div className="cmd-empty">لا نتائج لـ «{query}»</div> : null}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
