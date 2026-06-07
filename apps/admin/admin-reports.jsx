/* ============================================================
   التقارير الاحترافية — لوحة تحكم سنبل
   فلترة متعددة الأبعاد + مؤشّرات قرار
   ============================================================ */
const RANGE_PRESETS = [
  { k: "today", l: "اليوم", days: 1, from: 0 },
  { k: "yesterday", l: "أمس", days: 1, from: 1 },
  { k: "7", l: "آخر ٧ أيام", days: 7, from: 0 },
  { k: "14", l: "آخر ١٤ يوم", days: 14, from: 0 },
  { k: "30", l: "آخر ٣٠ يوم", days: 30, from: 0 },
];

function MultiSelect({ label, options, selected, onChange, allLabel }){
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const toggle = (v) => selected.includes(v) ? onChange(selected.filter((x) => x !== v)) : onChange([...selected, v]);
  const summary = selected.length === 0 ? (allLabel || "الكل") : selected.length === 1 ? (options.find((o) => o.v === selected[0]) || {}).l : selected.length + " مختار";
  return (
    <div className="ms" ref={ref}>
      <label>{label}</label>
      <button className={"ms-btn" + (selected.length ? " has" : "")} onClick={() => setOpen((v) => !v)}>
        <span>{summary}</span><Ic.arrow s={15} style={{ transform: open ? "rotate(-90deg)" : "rotate(90deg)", transition: ".15s", color: "var(--text-faint)" }} />
      </button>
      {open ? (
        <div className="ms-pop">
          <button className="ms-opt" onClick={() => onChange([])}><span className={"ms-check" + (selected.length === 0 ? " on" : "")}></span>{allLabel || "الكل"}</button>
          {options.map((o) => (
            <button key={o.v} className="ms-opt" onClick={() => toggle(o.v)}><span className={"ms-check" + (selected.includes(o.v) ? " on" : "")}>{selected.includes(o.v) ? <Ic.check s={12} /> : null}</span>{o.l}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReportsScreen({ restaurants, captains }){
  const records = A.getReportRecords();
  const [preset, setPreset] = useState("7");
  const [restF, setRestF] = useState([]);
  const [capF, setCapF] = useState([]);
  const [areaF, setAreaF] = useState([]);
  const [payF, setPayF] = useState([]);
  const [statusF, setStatusF] = useState("all");

  const presetObj = RANGE_PRESETS.find((p) => p.k === preset) || RANGE_PRESETS[2];
  const filtered = records.filter((r) => {
    if (r.dayOffset < presetObj.from || r.dayOffset >= presetObj.from + presetObj.days) return false;
    if (restF.length && !restF.includes(r.restId)) return false;
    if (capF.length && !capF.includes(r.capId)) return false;
    if (areaF.length && !areaF.includes(r.area)) return false;
    if (payF.length && !payF.includes(r.payment)) return false;
    if (statusF !== "all" && r.status !== statusF) return false;
    return true;
  });

  // مؤشّرات
  const delivered = filtered.filter((r) => r.status === "delivered");
  const canceled = filtered.filter((r) => r.status === "canceled");
  const gmv = delivered.reduce((a, r) => a + r.subtotal, 0);
  const deliveryFees = delivered.reduce((a, r) => a + r.delivery, 0);
  const commission = delivered.reduce((a, r) => a + r.commission, 0);
  const orders = filtered.length;
  const aov = delivered.length ? Math.round(gmv / delivered.length) : 0;
  const avgDeliver = delivered.length ? Math.round(delivered.reduce((a, r) => a + r.deliverMins, 0) / delivered.length) : 0;
  const cancelRate = orders ? Math.round(canceled.length / orders * 100) : 0;
  const onTimeRate = delivered.length ? Math.round(delivered.filter((r) => r.onTime).length / delivered.length * 100) : 0;
  const ratedDel = delivered.filter((r) => r.rating > 0);
  const avgRating = ratedDel.length ? (ratedDel.reduce((a, r) => a + r.rating, 0) / ratedDel.length) : 0;
  const netProfit = commission + Math.round(deliveryFees * 0.25);
  // عدد المستخدمين الفريدين (تقدير من توزيع الطلبات على الزبائن: ~1.8 طلب/زبون بالفترة)
  const uniqueUsers = Math.max(delivered.length ? 1 : 0, Math.round(filtered.length / 1.8));

  // سلاسل
  const byDay = {};
  delivered.forEach((r) => { byDay[r.dayOffset] = byDay[r.dayOffset] || { gmv: 0, orders: 0 }; byDay[r.dayOffset].gmv += r.subtotal; byDay[r.dayOffset].orders++; });
  const dayKeys = Object.keys(byDay).map(Number).sort((a, b) => b - a);
  const daySeries = dayKeys.map((d) => {
    const dt = new Date(A_now() - d * 864e5);
    return { day: dt.toLocaleDateString("ar-EG-u-nu-latn", { day: "numeric", month: "numeric" }), gmv: byDay[d].gmv, orders: byDay[d].orders };
  }).reverse();

  const agg = (key, nameKey) => {
    const m = {};
    delivered.forEach((r) => { const k = r[key]; m[k] = m[k] || { name: r[nameKey], orders: 0, gmv: 0 }; m[k].orders++; m[k].gmv += r.subtotal; });
    return Object.values(m).sort((a, b) => b.gmv - a.gmv);
  };
  const topRests = agg("restId", "restName").slice(0, 6);
  const topCaps = agg("capId", "capName").sort((a, b) => b.orders - a.orders).slice(0, 6);
  const byArea = agg("area", "area").slice(0, 8);
  const byPay = {};
  delivered.forEach((r) => { byPay[r.payment] = (byPay[r.payment] || 0) + 1; });
  const hourly = {};
  delivered.forEach((r) => { hourly[r.hour] = (hourly[r.hour] || 0) + 1; });
  const hourSeries = [];
  for (let h = 11; h <= 22; h++) { const lbl = h <= 11 ? "11ص" : h === 12 ? "12م" : (h - 12) + "م"; hourSeries.push({ h: lbl, v: hourly[h] || 0 }); }

  const restOpts = restaurants.filter((r) => ["active", "busy", "closed"].includes(r.status)).map((r) => ({ v: r.id, l: r.name }));
  const capOpts = captains.map((c) => ({ v: c.id, l: c.name }));
  const areaOpts = A.DESTINATIONS.map((a) => ({ v: a, l: a }));
  const payOpts = Object.keys(A.PAY_METHODS).map((k) => ({ v: k, l: A.PAY_METHODS[k].label }));
  const anyFilter = restF.length || capF.length || areaF.length || payF.length || statusF !== "all";
  const clearAll = () => { setRestF([]); setCapF([]); setAreaF([]); setPayF([]); setStatusF("all"); };

  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">التقارير والإحصاءات</div><div className="page-sub">حلّل أداء المنصّة بدقّة عبر أي فترة وأي فلتر</div></div>
        <div className="head-actions">
          <button className="btn btn-line"><Ic.download s={17} /> تصدير CSV</button>
          <button className="btn btn-gold"><Ic.download s={17} /> تقرير PDF</button>
        </div>
      </div>

      {/* شريط الفلترة */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-b" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-soft)", display: "inline-flex", alignItems: "center", gap: 6 }}><Ic.calendar s={16} /> الفترة:</span>
            <div className="seg">
              {RANGE_PRESETS.map((p) => <button key={p.k} className={preset === p.k ? "on" : ""} onClick={() => setPreset(p.k)}>{p.l}</button>)}
            </div>
            {anyFilter ? <button className="btn btn-sm btn-line" style={{ marginInlineStart: "auto" }} onClick={clearAll}><Ic.x s={15} /> مسح الفلاتر</button> : null}
          </div>
          <div className="filters-grid">
            <MultiSelect label="المطعم" options={restOpts} selected={restF} onChange={setRestF} allLabel="كل المطاعم" />
            <MultiSelect label="الكابتن" options={capOpts} selected={capF} onChange={setCapF} allLabel="كل الكباتن" />
            <MultiSelect label="المنطقة" options={areaOpts} selected={areaF} onChange={setAreaF} allLabel="كل المناطق" />
            <MultiSelect label="طريقة الدفع" options={payOpts} selected={payF} onChange={setPayF} allLabel="كل الطرق" />
            <div className="ms">
              <label>الحالة</label>
              <select className="ms-btn" value={statusF} onChange={(e) => setStatusF(e.target.value)} style={{ fontWeight: 700 }}>
                <option value="all">الكل</option><option value="delivered">مُسلّمة</option><option value="canceled">ملغاة</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* المؤشّرات الأساسية */}
      <div className="kpi-grid">
        <KPI icon="bag" tone="g1" label="عدد الطلبات" value={orders.toLocaleString("en-US")} sub={delivered.length + " مُسلّم · " + canceled.length + " ملغى"} />
        <KPI icon="trend" tone="g2" label="إجمالي قيمة الطلبات" value={A.money(gmv)} sub={"متوسط الطلب " + A.money(aov)} />
        <KPI icon="truck" tone="g5" label="إجمالي قيمة التوصيل" value={A.money(deliveryFees)} sub={delivered.length + " توصيلة"} />
        <KPI icon="wallet" tone="g4" label="عمولة سنبل من الإيرادات" value={A.money(commission)} sub="صافي عمولة المنصّة" />
      </div>
      <div className="kpi-grid">
        <KPI icon="ban" tone="g6" label="نسبة الإلغاء" value={cancelRate + "٪"} sub={canceled.length + " طلب ملغى"} />
        <KPI icon="star" tone="g1" label="متوسط التقييم" value={avgRating ? avgRating.toFixed(2) : "—"} sub={ratedDel.length + " تقييم"} />
        <KPI icon="clock" tone="g3" label="متوسط زمن التوصيل" value={avgDeliver + " د"} sub={onTimeRate + "٪ ضمن ٤٥ د"} />
        <KPI icon="users" tone="g2" label="عدد المستخدمين" value={uniqueUsers.toLocaleString("en-US")} sub="زبائن نشطون بالفترة" />
      </div>

      {orders === 0 ? (
        <div className="card"><div className="empty-row"><div className="ei"><Ic.chart s={30} /></div><p>لا توجد بيانات ضمن هذه الفلاتر — جرّب توسيع الفترة</p></div></div>
      ) : (
        <>
          <Panel title="المبيعات والطلبات عبر الفترة" sub={A.money(gmv) + " · " + delivered.length + " طلب مُسلّم"}>
            {daySeries.length > 1
              ? <Bars data={daySeries} valueKey="gmv" labelKey="day" fmt={(v) => A.moneyK(v)} todayIdx={daySeries.length - 1} />
              : <div style={{ display: "flex", gap: 30, padding: "10px 4px" }}><div><div style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 700 }}>المبيعات</div><div style={{ fontSize: 28, fontWeight: 900 }} className="tnum">{A.money(gmv)}</div></div><div><div style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 700 }}>الطلبات</div><div style={{ fontSize: 28, fontWeight: 900 }} className="tnum">{delivered.length}</div></div></div>}
          </Panel>
          <div className="row-2" style={{ marginTop: 15 }}>
            <Panel title="أعلى المطاعم" sub="حسب المبيعات"><HBars data={topRests.map((r) => ({ name: r.name, value: r.gmv }))} fmt={(v) => A.money(v)} color="var(--accent)" /></Panel>
            <Panel title="أداء الكباتن" sub="حسب عدد التوصيلات"><HBars data={topCaps.map((r) => ({ name: r.name, value: r.orders }))} fmt={(v) => v + " توصيلة"} color="var(--purple)" /></Panel>
          </div>
          <div className="row-2" style={{ marginTop: 15 }}>
            <Panel title="الطلبات حسب المنطقة"><HBars data={byArea.map((r) => ({ name: r.name, value: r.orders }))} fmt={(v) => v + " طلب"} color="var(--blue)" /></Panel>
            <Panel title="طرق الدفع">
              <Donut segments={Object.keys(A.PAY_METHODS).map((k) => ({ label: A.PAY_METHODS[k].label, value: byPay[k] || 0, color: A.PAY_METHODS[k].color }))} centerVal={delivered.length} centerLabel="طلب" />
            </Panel>
          </div>
          <Panel title="توزيع الطلبات على الساعة" sub="ساعات الذروة"><Bars data={hourSeries} valueKey="v" labelKey="h" todayIdx={hourSeries.reduce((mi, x, i, a) => x.v > a[mi].v ? i : mi, 0)} /></Panel>
        </>
      )}
    </div>
  );
}
function A_now(){ return Date.now(); }

window.ReportsScreen = ReportsScreen;
