/* ============================================================
   النظرة العامة — مع تنويعات التخطيط (تحليلي/تشغيلي/مدمج)
   ============================================================ */
function AlertsStrip({ counts, onNav }){
  const items = [];
  if (counts.unpaid > 0) items.push({ t: counts.unpaid + " طلب غير مدفوع بحاجة متابعة", go: "orders" });
  if (counts.processing > 0) items.push({ t: counts.processing + " طلب قيد المعالجة جاهز للتحويل", go: "orders" });
  if (counts.transfers > 0) items.push({ t: counts.transfers + " تحويل بنكي بانتظار التحقق", go: "finance" });
  if (items.length === 0) return null;
  return (
    <div className="notice warn" style={{ gap: 16, flexWrap: "wrap" }}>
      <Ic.alert s={20} style={{ color: "var(--gold-deep)", flex: "0 0 auto" }} />
      <b>يحتاج انتباهك:</b>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <span className="nsep"></span> : null}
          <button onClick={() => onNav(it.go)} style={{ fontWeight: 800, color: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {it.t} <Ic.arrow s={14} />
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

function OverviewKPIs({ k, activeNow }){
  return (
    <div className="kpi-grid">
      <KPI icon="bag" tone="g1" label="طلبات اليوم" value={k.ordersToday} delta={k.ordersDelta} deltaMeta="عن أمس" />
      <KPI icon="trend" tone="g2" label="إجمالي المبيعات (GMV)" value={A.money(k.gmvToday)} delta={k.gmvDelta} deltaMeta="عن أمس" />
      <KPI icon="wallet" tone="g4" label="عمولة سنبل اليوم" value={A.money(k.commissionToday)} delta={k.commissionDelta} deltaMeta="عن أمس" />
      <KPI icon="navigation" tone="g5" label="طلبات نشطة الآن" value={activeNow != null ? activeNow : k.activeNow} sub={k.captainsOnline + " كابتن متاح"} />
    </div>
  );
}

function StatusCards({ k, onNav }){
  const cards = [
    { ic: "bike", tone: "g4", v: k.captainsOnline + " / " + k.captainsTotal, l: "كباتن متصلون", go: "captains" },
    { ic: "store", tone: "g5", v: k.restaurantsActive + " / " + k.restaurantsTotal, l: "مطاعم نشطة", go: "restaurants" },
    { ic: "clock", tone: "g3", v: k.avgDelivery + " د", l: "متوسط زمن التوصيل", go: "reports" },
    { ic: "star", tone: "g1", v: k.rating, l: "تقييم المنصّة", go: "reports" },
  ];
  return (
    <div className="kpi-grid">
      {cards.map((c, i) => (
        <button key={i} className="kpi" style={{ textAlign: "right", cursor: "pointer" }} onClick={() => onNav(c.go)}>
          <div className="kh"><span className={"ki " + c.tone}><Ic2 name={c.ic} /></span><span className="kl">{c.l}</span></div>
          <div className="kv tnum">{c.v}</div>
        </button>
      ))}
    </div>
  );
}
function Ic2({ name }){ const I = Ic[name]; return I ? <I s={22} /> : null; }

function GmvChart({ big }){
  const a = A.ANALYTICS;
  return (
    <Panel title="المبيعات والطلبات — آخر ٧ أيام" sub={"اليوم: " + A.money(a.last7[6].gmv) + " · " + a.last7[6].orders + " طلب"}>
      <Bars data={a.last7} valueKey="gmv" labelKey="day" fmt={(v) => A.moneyK(v)} todayIdx={6} />
    </Panel>
  );
}

function TopRestaurantsPanel({ onNav }){
  const data = A.ANALYTICS.topRestaurants.map((r) => ({ name: r.name, value: r.gmv }));
  return (
    <Panel title="أعلى المطاعم اليوم" more="كل المطاعم" onMore={() => onNav("restaurants")}>
      <HBars data={data} fmt={(v) => A.money(v)} color="var(--accent)" />
    </Panel>
  );
}

function TopAreasPanel(){
  const data = A.ANALYTICS.topAreas.slice(0, 6).map((r) => ({ name: r.name, value: r.orders }));
  return (
    <Panel title="أكثر المناطق طلباً" sub="عدد الطلبات اليوم">
      <HBars data={data} fmt={(v) => v + " طلب"} color="var(--blue)" />
    </Panel>
  );
}

function PaymentDonut(){
  const p = A.ANALYTICS.payment;
  const m = A.PAY_METHODS;
  return (
    <Panel title="طرق الدفع اليوم">
      <Donut
        segments={[
          { label: m.bankPalestine.label, value: p.bankPalestine, color: m.bankPalestine.color },
          { label: m.jawwalPay.label, value: p.jawwalPay, color: m.jawwalPay.color },
          { label: m.palPay.label, value: p.palPay, color: m.palPay.color },
        ]}
        centerVal={p.bankPalestine + p.jawwalPay + p.palPay} centerLabel="طلب"
      />
    </Panel>
  );
}

function HourlyPanel(){
  return (
    <Panel title="توزيع الطلبات على الساعة" sub="ذروة المساء ٧–٩م">
      <Bars data={A.ANALYTICS.hourly} valueKey="v" labelKey="h" todayIdx={7} />
    </Panel>
  );
}

function LiveFeedPanel({ activity, onNav }){
  return (
    <Panel title="النشاط الحيّ" sub="آخر التحديثات على المنصّة" more="كل الطلبات" onMore={() => onNav("orders")}>
      <Feed items={activity} />
    </Panel>
  );
}

function ActiveOrdersPanel({ orders, onOpen, onNav }){
  const active = orders.filter((o) => ["unpaid", "processing", "new", "preparing", "ready", "onway"].includes(o.status)).slice(0, 6);
  return (
    <Panel title="طلبات نشطة الآن" sub={active.length + " طلب قيد التنفيذ"} more="إدارة الطلبات" onMore={() => onNav("orders")}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {active.map((o) => {
          const m = ORDER_STATUS[o.status];
          return (
            <div key={o.id} className="kv-row" style={{ cursor: "pointer" }} onClick={() => onOpen(o)}>
              <span className="k" style={{ gap: 11 }}>
                <b style={{ fontWeight: 900, color: "var(--text)", minWidth: 52 }} className="tnum">#{o.number}</b>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{o.restaurant}</span>
                <span style={{ color: "var(--text-faint)", fontSize: 13 }}>{o.area}</span>
              </span>
              <span className="v"><Badge meta={m} dot /></span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function MiniMapPanel({ onNav }){
  const caps = A.CAPTAINS.filter((c) => c.status !== "offline").slice(0, 5);
  return (
    <Panel title="الكباتن النشطون" sub={caps.length + " كابتن متاح الآن"} more="كل الكباتن" onMore={() => onNav("captains")}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {caps.map((c) => (
          <div key={c.id} className="kv-row">
            <span className="k" style={{ gap: 10 }}><span className="cell-logo" style={{ width: 34, height: 34, background: CAP_STATUS[c.status].dot, color: "#fff" }}><Ic.bike s={16} /></span>
              <span><b style={{ fontWeight: 800, color: "var(--text)", display: "block", fontSize: 14 }}>{c.name}</b><small style={{ color: "var(--text-faint)", fontWeight: 700, fontSize: 12 }}>{c.area} · {c.vehicle}</small></span>
            </span>
            <span className="v"><Badge meta={CAP_STATUS[c.status]} dot /></span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ===================== الشاشة الرئيسية ===================== */
function Overview({ layout, orders, activity, counts, onNav, onOpenOrder }){
  const k = A.KPIS;

  if (layout === "operational") {
    return (
      <div className="page-in">
        <div className="page-head">
          <div><div className="page-title">النظرة العامة</div><div className="page-sub">غرفة العمليات — متابعة مباشرة لكل المنصّة</div></div>
        </div>
        <AlertsStrip counts={counts} onNav={onNav} />
        <div className="kpi-grid cols-3">
          <KPI icon="navigation" tone="g5" label="طلبات نشطة الآن" value={counts.live} sub={k.captainsOnline + " كابتن متاح"} />
          <KPI icon="bag" tone="g1" label="طلبات اليوم" value={k.ordersToday} delta={k.ordersDelta} deltaMeta="عن أمس" />
          <KPI icon="clock" tone="g3" label="متوسط التوصيل" value={k.avgDelivery + " د"} delta={-A.ANALYTICS.deltas.delivery} deltaMeta="أسرع" />
        </div>
        <div className="row-2">
          <ActiveOrdersPanel orders={orders} onOpen={onOpenOrder} onNav={onNav} />
          <LiveFeedPanel activity={activity} onNav={onNav} />
        </div>
        <div className="row-2">
          <MiniMapPanel onNav={onNav} />
          <TopRestaurantsPanel onNav={onNav} />
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="page-in">
        <div className="page-head">
          <div><div className="page-title">النظرة العامة</div><div className="page-sub">ملخّص مكثّف لكل المؤشرات</div></div>
        </div>
        <AlertsStrip counts={counts} onNav={onNav} />
        <OverviewKPIs k={k} activeNow={counts.live} />
        <StatusCards k={k} onNav={onNav} />
        <div className="row-12">
          <GmvChart />
          <PaymentDonut />
        </div>
        <div className="grid-3">
          <TopRestaurantsPanel onNav={onNav} />
          <TopAreasPanel />
          <LiveFeedPanel activity={activity.slice(0, 5)} onNav={onNav} />
        </div>
      </div>
    );
  }

  // analytical (افتراضي)
  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">النظرة العامة</div><div className="page-sub">أداء منصّة سنبل اليوم</div></div>
        <div className="head-actions">
          <button className="btn btn-line"><Ic.download s={17} /> تصدير تقرير</button>
        </div>
      </div>
      <AlertsStrip counts={counts} onNav={onNav} />
      <OverviewKPIs k={k} activeNow={counts.live} />
      <div className="row-2">
        <GmvChart big />
        <PaymentDonut />
      </div>
      <div className="row-2">
        <LiveFeedPanel activity={activity} onNav={onNav} />
        <div className="stack">
          <TopRestaurantsPanel onNav={onNav} />
          <TopAreasPanel />
        </div>
      </div>
      <div className="row-2">
        <HourlyPanel />
        <MiniMapPanel onNav={onNav} />
      </div>
    </div>
  );
}

window.Overview = Overview;
