/* ============================================================
   شاشات الأعمال — المطاعم + الزبائن + المالية + التقارير
   ============================================================ */

/* ===================== المطاعم ===================== */
function RestaurantDrawer({ rest, orders, onClose, onAction }){
  if (!rest) return null;
  const r = rest;
  const est = A.restStatus(r, orders);
  const foot = [];
  if (r.status === "suspended") {
    foot.push(<button key="a" className="btn btn-green btn-block" onClick={() => onAction("activate-rest", r)}><Ic.refresh s={17} /> إعادة التفعيل</button>);
    foot.push(<button key="e" className="btn btn-line" onClick={() => onAction("edit-rest", r)}><Ic.pencil s={16} /> تعديل</button>);
  } else {
    foot.push(<button key="e" className="btn btn-ink btn-block" onClick={() => onAction("edit-rest", r)}><Ic.pencil s={16} /> تعديل المطعم والمنيو</button>);
    foot.push(<button key="s" className="btn btn-red-line" onClick={() => onAction("suspend-rest", r)}><Ic.ban s={17} /> إيقاف</button>);
  }
  return (
    <Drawer title={r.name} badge={<span style={{ marginInlineStart: "auto" }}><Badge meta={REST_STATUS[est]} /></span>} onClose={onClose} foot={foot}>
      <div style={r.cover ? { height: 130, borderRadius: "var(--r)", backgroundImage: "url(" + r.cover + ")", backgroundSize: "cover", backgroundPosition: "center", marginBottom: 18, boxShadow: "var(--sh-sm)" } : { height: 120, borderRadius: "var(--r)", background: r.grad, display: "grid", placeItems: "center", color: "#fff", marginBottom: 18, boxShadow: "var(--sh-sm)" }}>
        {!r.cover ? <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, letterSpacing: .5 }}>{r.name}</div><div style={{ fontSize: 13, opacity: .85, fontWeight: 700, marginTop: 3 }}>{r.cuisine}</div></div> : null}
      </div>
      {r.desc ? <div style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 600, lineHeight: 1.6, marginBottom: 16 }}>{r.desc}</div> : null}
      {r.status === "suspended" && r.suspendReason ? <div className="notice danger" style={{ marginBottom: 16 }}><Ic.ban s={18} /> سبب الإيقاف: {r.suspendReason}</div> : null}

      <div className="grid-2" style={{ marginBottom: 6 }}>
        <div className="kpi" style={{ padding: 15 }}><div className="kl">طلبات اليوم</div><div className="kv tnum" style={{ fontSize: 24 }}>{r.ordersToday}</div></div>
        <div className="kpi" style={{ padding: 15 }}><div className="kl">مبيعات اليوم</div><div className="kv tnum" style={{ fontSize: 24 }}>{A.money(r.revenueToday)}</div></div>
      </div>

      <div className="sec-l">المعلومات</div>
      <div className="kv-row"><span className="k"><Ic.store s={17} /> النوع</span><span className="v">{r.cuisine}</span></div>
      <div className="kv-row"><span className="k"><Ic.pin s={17} /> المنطقة</span><span className="v">{r.area}</span></div>
      <div className="kv-row"><span className="k"><Ic.wallet s={17} /> نسبة العمولة</span><span className="v tnum" style={{ color: "var(--accent-deep)" }}>{r.commission}%</span></div>
      <div className="kv-row"><span className="k"><Ic.clock s={17} /> متوسط التحضير</span><span className="v tnum">{r.prep} دقيقة</span></div>
      {r.rating > 0 ? <div className="kv-row"><span className="k"><Ic.star s={17} /> التقييم</span><span className="v tnum">★ {r.rating}</span></div> : null}
      <div className="kv-row"><span className="k"><Ic.checkCircle s={17} /> إجمالي الطلبات</span><span className="v tnum">{r.ordersTotal.toLocaleString("en-US")}</span></div>
      <div className="kv-row"><span className="k"><Ic.calendar s={17} /> {r.status === "pending" ? "تاريخ الطلب" : "انضم"}</span><span className="v ltr">{r.joined}</span></div>

      {r.rating > 0 ? (
        <>
          <div className="sec-l">التقييم والمراجعات</div>
          <Ratings avg={r.rating} total={Math.max(12, Math.round(r.ordersTotal * 0.5))} reviews={A.REST_REVIEWS} />
        </>
      ) : null}

      <div className="sec-l">ساعات العمل</div>
      <div className="hours-list">
        {A.restHours(r).map((h) => (
          <div className={"hrow" + (h.on ? "" : " off")} key={h.d}>
            <span className="hd">{h.d}</span>
            {h.on ? <span className="ht ltr tnum">{h.open} – {h.close}</span> : <span className="ht closed">مغلق</span>}
          </div>
        ))}
      </div>

      <div className="sec-l">المنيو</div>
      <div className="menu-list">
        {A.restMenu(r.id).map((sec, si) => (
          <div className="menu-sec" key={si}>
            <div className="menu-cat">{sec.cat} <span className="menu-cat-c">{sec.items.length}</span></div>
            {sec.items.map((it, ii) => {
              const name = it[0], price = it[1], img = it[2];
              return (
                <div className="menu-item" key={ii}>
                  {img ? <span className="mi-thumb" style={{ backgroundImage: "url(" + img + ")" }}></span> : null}
                  <span className="mi-n">{name}</span>
                  <span className="mi-dots"></span>
                  <span className="mi-p tnum">{A.money(price)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Drawer>
  );
}

const REST_FILTERS = [{ k: "all", l: "الكل" }, { k: "active", l: "نشط" }, { k: "busy", l: "مزدحم" }, { k: "closed", l: "مغلق" }, { k: "suspended", l: "موقوف" }];
function RestaurantsScreen({ restaurants, orders, search, onOpen, onAdd }){
  const [filter, setFilter] = useState("all");
  const est = (r) => A.restStatus(r, orders);
  const counts = { all: restaurants.length };
  REST_FILTERS.forEach((f) => { if (f.k !== "all") counts[f.k] = restaurants.filter((r) => est(r) === f.k).length; });
  let list = restaurants.filter((r) => filter === "all" ? true : est(r) === filter);
  const q = (search || "").trim();
  if (q) list = list.filter((r) => r.name.includes(q) || (r.ar || "").includes(q) || r.cuisine.includes(q) || r.area.includes(q));

  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">المطاعم</div><div className="page-sub">{counts.active + (counts.busy || 0)} مطعم نشط · {restaurants.length} إجمالاً</div></div>
        <div className="head-actions"><button className="btn btn-gold" onClick={onAdd}><Ic.plus s={18} /> إضافة مطعم</button></div>
      </div>
      <div className="filterbar">
        {REST_FILTERS.map((f) => (
          <button key={f.k} className={"ftab" + (filter === f.k ? " active" : "") + (f.alert && counts[f.k] > 0 && filter !== f.k ? " alert" : "")} onClick={() => setFilter(f.k)}>{f.l}<span className="fp tnum">{f.k === "all" ? counts.all : counts[f.k]}</span></button>
        ))}
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>المطعم</th><th>المنطقة</th><th>الحالة</th><th>العمولة</th><th>طلبات اليوم</th><th>التقييم</th><th>مبيعات اليوم</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} onClick={() => onOpen(r)}>
                  <td><div className="cell-main"><RestLogo r={r} s={42} /><div className="cell-tt"><b>{r.name}</b><small>{r.cuisine}</small></div></div></td>
                  <td>{r.area}</td>
                  <td><Badge meta={REST_STATUS[est(r)]} /></td>
                  <td className="strong tnum">{r.commission}%</td>
                  <td className="tnum">{r.ordersToday}</td>
                  <td className="tnum">{r.rating > 0 ? "★ " + r.rating : "—"}</td>
                  <td className="strong tnum">{A.money(r.revenueToday)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== الزبائن ===================== */
function CustomerDrawer({ cust, orders, onClose, onAction }){
  if (!cust) return null;
  const u = cust;
  const recent = orders.filter((o) => o.uid === u.id).slice(0, 5);
  const foot = [
    <button key="c" className="btn btn-ink btn-block" onClick={() => onAction("contact-cust", u)}><Ic.phone s={17} /> تواصل</button>,
    u.status === "flagged"
      ? <button key="u" className="btn btn-green" onClick={() => onAction("unflag-cust", u)}><Ic.check s={17} /> رفع المراقبة</button>
      : <button key="f" className="btn btn-red-line" onClick={() => onAction("flag-cust", u)}><Ic.alert s={16} /> مراقبة</button>,
  ];
  return (
    <Drawer title={u.name} badge={<span style={{ marginInlineStart: "auto" }}><Badge meta={CUST_STATUS[u.status]} /></span>} onClose={onClose} foot={foot}>
      {u.status === "flagged" && u.flag ? <div className="notice danger" style={{ marginBottom: 16 }}><Ic.alert s={18} /> {u.flag}</div> : null}
      {u.status === "atrisk" ? <div className="notice warn" style={{ marginBottom: 16 }}><Ic.alert s={18} style={{ color: "var(--orange)" }} /> لم يطلب منذ {Math.round((Date.now() - u.last) / (24 * 60 * 60000))} يوماً — مرشّح لكود «اشتقنالك» لاستعادته.</div> : null}
      {u.status === "vip" ? <div className="notice warn" style={{ marginBottom: 16, background: "var(--gold-tint)" }}><Ic.star s={18} style={{ color: "var(--gold-deep)" }} /> زبون مميّز — إنفاق وتكرار عاليان. يستحق أولوية دعم ومكافآت ولاء.</div> : null}
      <div className="grid-2" style={{ marginBottom: 6 }}>
        <div className="kpi" style={{ padding: 15 }}><div className="kl">إجمالي الطلبات</div><div className="kv tnum" style={{ fontSize: 24 }}>{u.orders}</div></div>
        <div className="kpi" style={{ padding: 15 }}><div className="kl">إجمالي الإنفاق</div><div className="kv tnum" style={{ fontSize: 24 }}>{A.money(u.spent)}</div></div>
      </div>
      <div className="sec-l">المعلومات</div>
      <div className="kv-row"><span className="k"><Ic.phone s={17} /> الهاتف</span><span className="v ltr">{u.phone}</span></div>
      <div className="kv-row"><span className="k"><Ic.pin s={17} /> المنطقة</span><span className="v">{u.area}</span></div>
      <div className="kv-row"><span className="k"><Ic.clock s={17} /> آخر طلب</span><span className="v">{A.ago(u.last)}</span></div>
      <div className="kv-row"><span className="k"><Ic.calendar s={17} /> انضم</span><span className="v ltr">{u.joined}</span></div>
      <div className="kv-row"><span className="k"><Ic.wallet s={17} /> متوسط الطلب</span><span className="v tnum">{A.money(u.spent / u.orders)}</span></div>

      <div className="sec-l">آخر الطلبات</div>
      {recent.length === 0 ? <div style={{ color: "var(--text-faint)", fontWeight: 700, fontSize: 14 }}>لا طلبات حديثة في السجل المعروض</div> : recent.map((o) => (
        <div key={o.id} className="kv-row"><span className="k tnum" style={{ fontWeight: 900, color: "var(--text)" }}>#{o.number}</span><span className="v" style={{ fontWeight: 700 }}>{o.restaurant}</span><span style={{ color: "var(--text-faint)", fontSize: 13, fontWeight: 700 }}>{A.ago(o.createdAt)}</span></div>
      ))}
    </Drawer>
  );
}

const CUST_FILTERS = [{ k: "all", l: "الكل" }, { k: "vip", l: "مميّز VIP" }, { k: "regular", l: "منتظم" }, { k: "new", l: "جديد" }, { k: "atrisk", l: "معرّض للفقدان", alert: true }, { k: "flagged", l: "تحت المراقبة", alert: true }];
function CustomersScreen({ customers, orders, search, onOpen }){
  const [filter, setFilter] = useState("all");
  const counts = { all: customers.length, vip: 0, regular: 0, new: 0, atrisk: 0, flagged: 0 };
  customers.forEach((c) => { if (counts[c.status] != null) counts[c.status]++; });
  let list = customers.filter((c) => filter === "all" ? true : c.status === filter);
  const q = (search || "").trim();
  if (q) list = list.filter((c) => c.name.includes(q) || c.phone.includes(q) || c.area.includes(q));
  list = [...list].sort((a, b) => b.spent - a.spent);
  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">الزبائن</div><div className="page-sub">{A.KPIS.customers.toLocaleString("en-US")} زبون مسجّل · {counts.vip} VIP</div></div>
      </div>
      <div className="filterbar">
        {CUST_FILTERS.map((f) => (
          <button key={f.k} className={"ftab" + (filter === f.k ? " active" : "") + (f.alert && counts[f.k] > 0 && filter !== f.k ? " alert" : "")} onClick={() => setFilter(f.k)}>{f.l}<span className="fp tnum">{counts[f.k]}</span></button>
        ))}
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>الزبون</th><th>الهاتف</th><th>المنطقة</th><th>الطلبات</th><th>الإنفاق</th><th>الحالة</th><th>آخر طلب</th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} onClick={() => onOpen(u)}>
                  <td><div className="cell-main"><Avatar name={u.name} gold={u.status === "vip"} /><div className="cell-tt"><b>{u.name}</b><small>{u.orders} طلب</small></div></div></td>
                  <td className="num" style={{ fontWeight: 700, color: "var(--text-soft)" }}>{u.phone}</td>
                  <td>{u.area}</td>
                  <td className="strong tnum">{u.orders}</td>
                  <td className="strong tnum">{A.money(u.spent)}</td>
                  <td><Badge meta={CUST_STATUS[u.status]} /></td>
                  <td style={{ color: "var(--text-faint)", fontWeight: 700, whiteSpace: "nowrap" }}>{A.ago(u.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== المالية ===================== */
const SETTLE_STATUS = {
  due:       { label: "مستحق الآن",   cls: "b-gold" },
  scheduled: { label: "مجدول",         cls: "b-blue" },
  paid:      { label: "مدفوع",         cls: "b-green" },
};
const PAYOUT_STATUS = {
  requested: { label: "طلب سحب",       cls: "b-gold" },
  accruing:  { label: "يتراكم",        cls: "b-gray" },
  paid:      { label: "تم الصرف",      cls: "b-green" },
};

/* بطاقة تدفّق الأموال — سنبل كوسيط مالي */
function MoneyFlow(){
  const f = A.MONEY_FLOW;
  const step = (ic, tone, t, v, sub) => (
    <div style={{ flex: 1, minWidth: 150, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "15px 16px", boxShadow: "var(--sh-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}><span className={"ki " + tone} style={{ width: 36, height: 36 }}><Ic2 name={ic} /></span><span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-soft)" }}>{t}</span></div>
      <div style={{ fontSize: 22, fontWeight: 900 }} className="tnum">{A.money(v)}</div>
      <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 700, marginTop: 3 }}>{sub}</div>
    </div>
  );
  const arrow = <div style={{ flex: "0 0 auto", display: "grid", placeItems: "center", color: "var(--text-faint)" }}><Ic.arrow s={22} /></div>;
  return (
    <Panel title="تدفّق الأموال — سنبل وسيط مالي" sub="كل المبالغ تُحصَّل عند المنصّة ثم تُسوَّى مع المطاعم والكباتن">
      <div style={{ display: "flex", alignItems: "stretch", gap: 11, flexWrap: "wrap" }}>
        {step("money", "g2", "المحصّل من الزبائن", f.collectedToday, "أصناف " + A.moneyK(f.foodSales) + " + توصيل " + A.moneyK(f.deliveryFees))}
        {arrow}
        {step("store", "g5", "إلى المطاعم", f.foodSales - f.restaurantCommission, "بعد خصم العمولة")}
        {step("bike", "g4", "إلى الكباتن", f.captainPayout, "أجور وحوافز اليوم")}
        {arrow}
        {step("shield", "g1", "صافي ربح سنبل", f.netProfit, "عمولة + هامش التوصيل")}
      </div>
    </Panel>
  );
}

const FIN_TABS = [{ k: "overview", l: "نظرة مالية" }, { k: "restaurants", l: "المطاعم" }, { k: "captains", l: "الكباتن" }, { k: "transfers", l: "التحويلات البنكية" }];
function FinanceScreen({ transfers, settlements, payouts, search, onAction }){
  const [tab, setTab] = useState("overview");
  const [viewT, setViewT] = useState(null);
  const [period, setPeriod] = useState("today");
  const [fq, setFq] = useState("");
  const f = A.MONEY_FLOW;
  const mult = period === "week" ? 7 : period === "month" ? 30 : 1;
  const periodLabel = period === "today" ? "اليوم" : period === "week" ? "الأسبوع" : "الشهر";
  const matchQ = (name) => !fq.trim() || name.includes(fq.trim());
  const fSettlements = settlements.filter((s) => matchQ(s.name));
  const fPayouts = payouts.filter((p) => matchQ(p.name));
  const fTransfers = transfers.filter((t) => matchQ(t.customer));
  const restPayable = fSettlements.filter((s) => s.status !== "paid").reduce((a, s) => a + s.net, 0);
  const capPayable = fPayouts.filter((p) => p.status !== "paid").reduce((a, p) => a + p.due, 0);
  const reqCount = fPayouts.filter((p) => p.status === "requested").length;
  const pendingT = fTransfers.filter((t) => t.status === "pending" || t.status === "flagged");
  const weekEnd = A.prettyDay(A.weekEndThursday());

  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">المالية</div><div className="page-sub">سنبل وسيط مالي — التحصيل والتسويات مع المطاعم والكباتن</div></div>
        <div className="head-actions">
          <div className="seg">
            <button className={period === "today" ? "on" : ""} onClick={() => setPeriod("today")}>اليوم</button>
            <button className={period === "week" ? "on" : ""} onClick={() => setPeriod("week")}>الأسبوع</button>
            <button className={period === "month" ? "on" : ""} onClick={() => setPeriod("month")}>الشهر</button>
          </div>
          <button className="btn btn-line"><Ic.download s={17} /> كشف حساب</button>
        </div>
      </div>

      <div className="kpi-grid">
        <KPI icon="money" tone="g2" label={"إجمالي المحصّل — " + periodLabel} value={A.money(f.collectedToday * mult)} sub="محتجز كوسيط" />
        <KPI icon="store" tone="g5" label="مستحقات المطاعم" value={A.money(restPayable)} sub="بانتظار التسوية" />
        <KPI icon="bike" tone="g4" label="مستحقات الكباتن (الأسبوع)" value={A.money(capPayable)} sub={reqCount + " طلب سحب"} />
        <KPI icon="shield" tone="g1" label={"صافي ربح سنبل — " + periodLabel} value={A.money(f.netProfit * mult)} delta={k_delta()} deltaMeta="عن الفترة السابقة" />
      </div>

      {tab !== "overview" ? (
        <div className="tb-search" style={{ width: "100%", maxWidth: 340, marginBottom: 14, cursor: "text" }}>
          <Ic.search s={18} style={{ color: "var(--text-faint)" }} />
          <input value={fq} onChange={(e) => setFq(e.target.value)} placeholder={tab === "captains" ? "ابحث باسم الكابتن…" : tab === "restaurants" ? "ابحث باسم المطعم…" : "ابحث باسم الزبون…"} style={{ border: "none", outline: "none", background: "none", fontSize: 14.5, fontWeight: 600, width: "100%", color: "var(--text)" }} />
        </div>
      ) : null}

      <div className="filterbar">
        {FIN_TABS.map((ft) => (
          <button key={ft.k} className={"ftab" + (tab === ft.k ? " active" : "") + (ft.k === "transfers" && pendingT.length > 0 && tab !== ft.k ? " alert" : "")} onClick={() => setTab(ft.k)}>
            {ft.l}{ft.k === "captains" && reqCount > 0 ? <span className="fp tnum">{reqCount}</span> : null}{ft.k === "transfers" && pendingT.length > 0 ? <span className="fp tnum">{pendingT.length}</span> : null}
          </button>
        ))}
      </div>

      {tab === "overview" ? <MoneyFlow /> : null}

      {(tab === "overview" || tab === "transfers") && pendingT.length > 0 ? (
        <div className="card" style={{ marginTop: 15 }}>
          <div className="card-h"><div><div className="ct">تحويلات بنكية بانتظار التحقق اليدوي</div><div className="cs">راجِع الوصل المرفق وتأكّد من وصول المبلغ لحسابك قبل الاعتماد</div></div><span className="badge b-gold"><span className="bd"></span> {pendingT.length} معلّق</span></div>
          <div className="card-b" style={{ paddingTop: 6 }}>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>الزبون</th><th>الطلب</th><th>المبلغ</th><th>الطريقة</th><th>المرجع</th><th>الوقت</th><th>إجراء</th></tr></thead>
                <tbody>
                  {pendingT.map((t) => (
                    <tr key={t.id} onClick={() => setViewT(t)}>
                      <td><div className="cell-main"><Avatar name={t.customer} /><div className="cell-tt"><b>{t.customer}</b>{t.status === "flagged" ? <small style={{ color: "var(--red)" }}>⚠ {t.note}</small> : <small>وصل مرفق</small>}</div></div></td>
                      <td className="strong tnum">#{t.order}</td>
                      <td className="strong tnum">{A.money(t.amount)}</td>
                      <td>{t.bank}</td>
                      <td className="num" style={{ fontWeight: 700, color: "var(--text-soft)" }}>{t.ref}</td>
                      <td style={{ color: "var(--text-faint)", fontWeight: 700, whiteSpace: "nowrap" }}>{A.ago(t.at)}</td>
                      <td><button className="btn btn-sm btn-ink" onClick={(e) => { e.stopPropagation(); setViewT(t); }}><Ic.receipt s={15} /> مراجعة الوصل</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {(tab === "overview" || tab === "restaurants") ? (
        <div className="card" style={{ marginTop: 15 }}>
          <div className="card-h"><div><div className="ct">تسويات المطاعم</div><div className="cs">صافي المستحق = قيمة الأصناف − عمولة سنبل</div></div></div>
          <div className="card-b" style={{ paddingTop: 6 }}>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>المطعم</th><th>طلبات</th><th>قيمة الأصناف</th><th>عمولة سنبل</th><th>صافي المطعم</th><th>الحالة</th><th>إجراء</th></tr></thead>
                <tbody>
                  {fSettlements.map((s) => (
                    <tr key={s.rid} style={{ cursor: "default" }}>
                      <td className="strong">{s.name}</td>
                      <td className="tnum">{s.orders}</td>
                      <td className="tnum">{A.money(s.gross)}</td>
                      <td className="tnum" style={{ color: "var(--accent-deep)" }}>{A.money(s.commission)}</td>
                      <td className="strong tnum">{A.money(s.net)}</td>
                      <td><Badge meta={SETTLE_STATUS[s.status]} /></td>
                      <td>{s.status === "paid" ? <span style={{ color: "var(--green)", fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}><Ic.checkCircle s={16} /> تمّت</span> : <button className="btn btn-sm btn-ink" onClick={() => onAction("pay-settlement", s)}><Ic.send s={15} /> دفع الآن</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {(tab === "overview" || tab === "captains") ? (
        <div className="card" style={{ marginTop: 15 }}>
          <div className="card-h">
            <div><div className="ct">مستحقات الكباتن الأسبوعية</div><div className="cs">السحب نهاية كل أسبوع · ينتهي يوم {weekEnd}</div></div>
            <span className="badge b-gold"><Ic.calendar s={14} /> {reqCount} طلب سحب</span>
          </div>
          <div className="card-b" style={{ paddingTop: 6 }}>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>الكابتن</th><th>النظام</th><th>توصيلات الأسبوع</th><th>الأساس</th><th>الحوافز</th><th>المستحق</th><th>الحالة</th><th>إجراء</th></tr></thead>
                <tbody>
                  {fPayouts.map((p) => (
                    <tr key={p.id} style={{ cursor: "default" }}>
                      <td><div className="cell-main"><Avatar name={p.name} /><div className="cell-tt"><b>{p.name}</b><small>{p.vehicle}</small></div></div></td>
                      <td><Badge meta={CAP_PAY[p.payType]} /></td>
                      <td className="tnum">{p.trips}</td>
                      <td className="tnum">{A.money(p.base)}</td>
                      <td className="tnum" style={{ color: "var(--green)" }}>+ {A.money(p.incentives)}</td>
                      <td className="strong tnum">{A.money(p.due)}</td>
                      <td><Badge meta={PAYOUT_STATUS[p.status]} /></td>
                      <td>
                        {p.status === "paid" ? <span style={{ color: "var(--green)", fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}><Ic.checkCircle s={16} /> صُرف</span>
                          : p.status === "requested" ? <button className="btn btn-sm btn-ink" onClick={() => onAction("pay-payout", p)}><Ic.send s={15} /> صرف الآن</button>
                          : <button className="btn btn-sm btn-line" onClick={() => onAction("pay-payout", p)}>صرف مبكّر</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {viewT && <TransferReceiptModal t={viewT} onClose={() => setViewT(null)} onAction={onAction} />}
    </div>
  );
}
function k_delta(){ return 11; }

/* ===================== نافذة مراجعة وصل التحويل (تحقق يدوي) ===================== */
const TRANSFER_REJECT_REASONS = [
  "المبلغ لا يطابق قيمة الطلب",
  "المبلغ لم يصل إلى الحساب",
  "الوصل غير واضح أو غير مكتمل",
  "الوصل مكرّر أو يخصّ طلباً آخر",
];
function downloadReceipt(t){
  const m = A.PAY_METHODS[t.method] || { label: t.bank, color: "#2f74c0" };
  const c = document.createElement("canvas"); c.width = 480; c.height = 600;
  const x = c.getContext("2d");
  x.fillStyle = "#ffffff"; x.fillRect(0, 0, 480, 600);
  x.fillStyle = m.color; x.fillRect(0, 0, 480, 130);
  x.fillStyle = "#ffffff"; x.textAlign = "center";
  x.font = "900 30px Tajawal, sans-serif"; x.fillText(m.label, 240, 62);
  x.font = "700 18px Tajawal, sans-serif"; x.fillText("إشعار تحويل", 240, 94);
  x.beginPath(); x.arc(240, 200, 34, 0, 2 * Math.PI); x.fillStyle = "#e3f6ec"; x.fill();
  x.strokeStyle = "#1d9d63"; x.lineWidth = 5; x.lineCap = "round"; x.beginPath(); x.moveTo(226, 200); x.lineTo(236, 211); x.lineTo(256, 189); x.stroke();
  x.fillStyle = "#1d9d63"; x.font = "900 22px Tajawal, sans-serif"; x.fillText("تحويل ناجح", 240, 262);
  x.fillStyle = "#1c1a14"; x.font = "900 46px Tajawal, sans-serif"; x.fillText(A.money(t.amount), 240, 330);
  x.fillStyle = "#6f6857"; x.font = "700 18px Tajawal, sans-serif";
  const rows = [["المرجع", t.ref], ["الزبون", t.customer], ["رقم الطلب", "#" + t.order], ["التاريخ", new Date().toLocaleDateString("ar-EG-u-nu-latn")]];
  rows.forEach((r, i) => { const y = 400 + i * 38; x.textAlign = "left"; x.fillStyle = "#1c1a14"; x.font = "800 18px Tajawal"; x.fillText(r[1], 60, y); x.textAlign = "right"; x.fillStyle = "#9c9480"; x.font = "700 16px Tajawal"; x.fillText(r[0], 420, y); });
  const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = "receipt-" + t.order + ".png"; document.body.appendChild(a); a.click(); a.remove();
}
function TransferReceiptModal({ t, onClose, onAction }){
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const m = A.PAY_METHODS[t.method] || { label: t.bank, color: "var(--blue)" };
  const foot = rejecting
    ? [<button key="b" className="btn btn-line" onClick={() => { setRejecting(false); setReason(""); }}><Ic.arrowL s={16} /> رجوع</button>,
       <button key="c" className="btn btn-red btn-block" disabled={!reason.trim()} style={!reason.trim() ? { opacity: .5 } : null} onClick={() => { onAction("reject-transfer", t, reason.trim()); onClose(); }}><Ic.x s={16} /> تأكيد الرفض</button>]
    : [<button key="r" className="btn btn-red-line" onClick={() => setRejecting(true)}><Ic.x s={16} /> رفض الوصل</button>,
       <button key="v" className="btn btn-green btn-block" onClick={() => { onAction("verify-transfer", t); onClose(); }}><Ic.check s={17} /> تأكيد وصول المبلغ</button>];
  return (
    <Modal icon="receipt" iconTone="b-blue" title={"مراجعة وصل التحويل — طلب #" + t.order} onClose={onClose} wide foot={foot}>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 18, alignItems: "start" }}>
        <div>
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "var(--sh-sm)", background: "var(--surface-2)" }}>
            <div style={{ background: m.color, color: "#fff", padding: "14px 14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, opacity: .9 }}>{m.label}</div>
              <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>إشعار تحويل</div>
            </div>
            <div style={{ padding: "16px 14px", textAlign: "center", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 9px, rgba(23,21,15,.03) 9px, rgba(23,21,15,.03) 18px)" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--green-soft)", color: "var(--green)", display: "grid", placeItems: "center", margin: "0 auto 8px" }}><Ic.check s={24} /></div>
              <div style={{ fontWeight: 900, fontSize: 14, color: "var(--green)" }}>تحويل ناجح</div>
              <div style={{ fontWeight: 900, fontSize: 24, margin: "8px 0 2px" }} className="tnum">{A.money(t.amount)}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 700, direction: "ltr" }}>{t.ref}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 700, marginTop: 8, borderTop: "1px dashed var(--line)", paddingTop: 8 }}>صورة الوصل المرفقة من الزبون</div>
            </div>
          </div>
          <button className="btn btn-line btn-block btn-sm" style={{ marginTop: 10 }} onClick={() => downloadReceipt(t)}><Ic.download s={16} /> تحميل الوصل</button>
        </div>
        <div>
          <div className="kv-row"><span className="k"><Ic.user s={17} /> الزبون</span><span className="v">{t.customer}</span></div>
          <div className="kv-row"><span className="k"><Ic.hash s={17} /> الطلب</span><span className="v tnum">#{t.order}</span></div>
          <div className="kv-row"><span className="k"><Ic.wallet s={17} /> الطريقة</span><span className="v">{m.label}</span></div>
          <div className="kv-row"><span className="k"><Ic.money s={17} /> المبلغ</span><span className="v tnum">{A.money(t.amount)}</span></div>
          <div className="kv-row"><span className="k"><Ic.receipt s={17} /> رقم المرجع</span><span className="v ltr">{t.ref}</span></div>
          <div className="kv-row"><span className="k"><Ic.clock s={17} /> وقت الإرسال</span><span className="v">{A.ago(t.at)}</span></div>
          {t.status === "flagged" ? <div className="notice danger" style={{ margin: "12px 0 0" }}><Ic.alert s={18} /> {t.note}</div> : null}
          {rejecting ? (
            <div style={{ marginTop: 14 }}>
              <div className="field" style={{ marginBottom: 10 }}><label>سبب الرفض (إلزامي)</label></div>
              <div className="reasons">
                {TRANSFER_REJECT_REASONS.map((r) => (
                  <button key={r} className={"reason-opt" + (reason === r ? " sel" : "")} onClick={() => setReason(r)}>
                    <span className="rdot"></span><span style={{ flex: 1, textAlign: "right" }}>{r}</span>
                  </button>
                ))}
              </div>
              <div className="field" style={{ marginTop: 12, marginBottom: 0 }}>
                <textarea placeholder="أو اكتب سبباً آخر…" value={TRANSFER_REJECT_REASONS.includes(reason) ? "" : reason} onChange={(e) => setReason(e.target.value)} style={{ minHeight: 60, resize: "none" }} />
              </div>
            </div>
          ) : (
            <div className="notice warn" style={{ margin: "12px 0 0" }}><Ic.shield s={18} style={{ color: "var(--gold-deep)" }} /> <b>تأكّد من وصول المبلغ فعلياً إلى حسابك البنكي</b> قبل اعتماد الطلب — هذه الخطوة يدوية.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ===================== نموذج مطعم (إضافة/تعديل) ===================== */
function AddRestaurantModal({ initial, onClose, onSubmit }){
  const [f, setF] = useState(initial
    ? { name: initial.name, cuisine: initial.cuisine, area: initial.area, commission: initial.commission, prep: initial.prep || 30 }
    : { name: "", cuisine: "", area: A.AREAS[0], commission: 12, prep: 30 });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && f.cuisine.trim();
  const editing = !!initial;
  return (
    <Modal icon="store" iconTone="b-cyan" title={editing ? "تعديل بيانات المطعم" : "إضافة مطعم جديد"} onClose={onClose}
      foot={[<button key="x" className="btn btn-line" onClick={onClose}>إلغاء</button>, <button key="s" className="btn btn-gold" disabled={!valid} style={!valid ? { opacity: .5 } : null} onClick={() => valid && onSubmit(f)}>{editing ? "حفظ التعديلات" : "إضافة كطلب انضمام"}</button>]}>
      {!editing ? <div className="notice warn" style={{ marginTop: -4 }}><Ic.clock s={18} style={{ color: "var(--gold-deep)" }} /> يُضاف المطعم بحالة «بانتظار الموافقة» ثم يُفعّل من قسم المطاعم.</div> : null}
      <div className="grid-2">
        <div className="field"><label>اسم المطعم</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="مثال: مطعم الأصيل" /></div>
        <div className="field"><label>المنطقة</label><select value={f.area} onChange={(e) => set("area", e.target.value)}>{A.AREAS.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
      </div>
      <div className="grid-2">
        <div className="field"><label>نوع المأكولات</label><input value={f.cuisine} onChange={(e) => set("cuisine", e.target.value)} placeholder="مثال: مشاوي ووجبات" /></div>
        <div className="field"><label>متوسط التحضير (دقيقة)</label><input type="number" value={f.prep} min="5" max="90" onChange={(e) => set("prep", Number(e.target.value))} /></div>
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>نسبة عمولة سنبل (٠٪ – ٣٠٪)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <input type="range" className="twk-slider" style={{ flex: 1 }} min="0" max="30" step="1" value={f.commission} onChange={(e) => set("commission", Number(e.target.value))} />
          <span style={{ fontSize: 24, fontWeight: 900, minWidth: 58, textAlign: "center", color: "var(--gold-deep)" }} className="tnum">{f.commission}%</span>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { RestaurantDrawer, RestaurantsScreen, CustomerDrawer, CustomersScreen, FinanceScreen, AddRestaurantModal });
