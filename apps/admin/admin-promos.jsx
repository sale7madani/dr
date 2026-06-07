/* ============================================================
   البرومو كودز — لوحة تحكم سنبل
   ============================================================ */
const PROMO_STATUS = {
  active:    { label: "فعّال", cls: "b-green" },
  scheduled: { label: "مجدول", cls: "b-blue" },
  paused:    { label: "موقوف", cls: "b-gray" },
  expired:   { label: "منتهٍ", cls: "b-red" },
};
const PROMO_TYPE = {
  percent:      { label: "خصم نسبة", icon: "tag", tone: "b-purple" },
  fixed:        { label: "خصم ثابت", icon: "money", tone: "b-blue" },
  freedelivery: { label: "توصيل مجاني", icon: "truck", tone: "b-cyan" },
};
function promoValueText(p){
  if (p.type === "percent") return p.value + "٪" + (p.cap ? " (حتى " + A.money(p.cap) + ")" : "");
  if (p.type === "fixed") return "خصم " + A.money(p.value);
  return "توصيل مجاني";
}

function PromoCard({ p, restaurants, onToggle, onEdit }){
  const t = PROMO_TYPE[p.type];
  const rest = p.scope === "restaurant" ? (restaurants.find((r) => r.id === p.restId) || {}).name : "كل المطاعم";
  const pct = p.limit > 0 ? Math.min(100, Math.round(p.used / p.limit * 100)) : 0;
  return (
    <div className="card promo-card">
      <div className="promo-top">
        <span className={"promo-ic " + t.tone}><Ic2 name={t.icon} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="promo-code">{p.code} <button className="promo-copy" title="نسخ" onClick={() => navigator.clipboard && navigator.clipboard.writeText(p.code)}><Ic.copy s={14} /></button></div>
          <div className="promo-desc">{p.desc}</div>
        </div>
        <Badge meta={PROMO_STATUS[p.status]} />
      </div>
      <div className="promo-grid">
        <div><span className="pg-l">الخصم</span><span className="pg-v">{promoValueText(p)}</span></div>
        <div><span className="pg-l">حدّ أدنى</span><span className="pg-v tnum">{A.money(p.minOrder)}</span></div>
        <div><span className="pg-l">النطاق</span><span className="pg-v" style={{ fontSize: 13 }}>{rest}</span></div>
        <div><span className="pg-l">لكل زبون</span><span className="pg-v tnum">{p.perUser} مرّة</span></div>
      </div>
      <div className="promo-use">
        <div className="promo-use-top"><span>الاستخدام</span><span className="tnum">{p.used}{p.limit > 0 ? " / " + p.limit : " (غير محدود)"}</span></div>
        {p.limit > 0 ? <div className="hb-track"><div className="hb-fill" style={{ width: pct + "%", background: pct >= 100 ? "var(--red)" : "var(--accent)" }}></div></div> : null}
      </div>
      <div className="promo-foot">
        <span className="promo-dates"><Ic.calendar s={14} /> {p.start} → {p.end}</span>
        <div style={{ display: "flex", gap: 7 }}>
          <button className="btn btn-sm btn-line" onClick={() => onEdit(p)}><Ic.pencil s={14} /> تعديل</button>
          {p.status === "active" ? <button className="btn btn-sm btn-line" onClick={() => onToggle(p, "paused")}>إيقاف</button>
            : p.status === "paused" ? <button className="btn btn-sm btn-green" onClick={() => onToggle(p, "active")}>تفعيل</button>
            : null}
        </div>
      </div>
    </div>
  );
}

const PROMO_FILTERS = [{ k: "all", l: "الكل" }, { k: "active", l: "فعّال" }, { k: "scheduled", l: "مجدول" }, { k: "paused", l: "موقوف" }, { k: "expired", l: "منتهٍ" }];
function PromosScreen({ promos, restaurants, search, onToggle, onEdit, onAdd }){
  const [filter, setFilter] = useState("all");
  const counts = { all: promos.length };
  PROMO_FILTERS.forEach((f) => { if (f.k !== "all") counts[f.k] = promos.filter((p) => p.status === f.k).length; });
  let list = promos.filter((p) => filter === "all" ? true : p.status === filter);
  const q = (search || "").trim();
  if (q) list = list.filter((p) => p.code.includes(q.toUpperCase()) || p.desc.includes(q));

  const active = promos.filter((p) => p.status === "active").length;
  const totalUsed = promos.reduce((a, p) => a + p.used, 0);

  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">البرومو كودز</div><div className="page-sub">أكواد الخصم والعروض الترويجية للزبائن</div></div>
        <div className="head-actions"><button className="btn btn-gold" onClick={onAdd}><Ic.plus s={18} /> كود جديد</button></div>
      </div>
      <div className="kpi-grid cols-3">
        <KPI icon="ticket" tone="g1" label="أكواد فعّالة الآن" value={active} sub={promos.length + " إجمالاً"} />
        <KPI icon="tag" tone="g4" label="مرّات الاستخدام" value={totalUsed.toLocaleString("en-US")} sub="كل الأكواد" />
        <KPI icon="trend" tone="g2" label="متوسط الخصم" value="18٪" sub="على الطلبات المؤهّلة" />
      </div>
      <div className="filterbar">
        {PROMO_FILTERS.map((f) => (
          <button key={f.k} className={"ftab" + (filter === f.k ? " active" : "")} onClick={() => setFilter(f.k)}>{f.l}<span className="fp tnum">{f.k === "all" ? counts.all : counts[f.k]}</span></button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="card"><div className="empty-row"><div className="ei"><Ic.ticket s={30} /></div><p>لا توجد أكواد في هذا التصنيف</p></div></div>
      ) : (
        <div className="promo-list">
          {list.map((p) => <PromoCard key={p.id} p={p} restaurants={restaurants} onToggle={onToggle} onEdit={onEdit} />)}
        </div>
      )}
    </div>
  );
}

/* ===================== نموذج برومو (إضافة/تعديل) ===================== */
function PromoModal({ initial, restaurants, onClose, onSubmit }){
  const [f, setF] = useState(initial ? { ...initial } : {
    code: "", type: "percent", value: 20, cap: 15, minOrder: 30, scope: "all", restId: null,
    limit: 500, perUser: 1, start: "2026-06-07", end: "2026-06-30", desc: "", status: "active",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.code.trim().length >= 3;
  const editing = !!initial;
  const activeRests = restaurants.filter((r) => ["active", "busy", "closed"].includes(r.status));
  return (
    <Modal icon="ticket" iconTone="b-purple" title={editing ? "تعديل الكود" : "كود خصم جديد"} onClose={onClose} wide
      foot={[<button key="x" className="btn btn-line" onClick={onClose}>إلغاء</button>, <button key="s" className="btn btn-gold" disabled={!valid} style={!valid ? { opacity: .5 } : null} onClick={() => valid && onSubmit({ ...f, code: f.code.toUpperCase().trim() })}>{editing ? "حفظ" : "إنشاء الكود"}</button>]}>
      <div className="grid-2">
        <div className="field"><label>الكود</label><input value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="SUNBUL20" style={{ direction: "ltr", textAlign: "right", fontWeight: 900, letterSpacing: 1 }} /></div>
        <div className="field"><label>الوصف</label><input value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="خصم ٢٠٪ على أول طلب" /></div>
      </div>
      <div className="field"><label>نوع الخصم</label>
        <div style={{ display: "flex", gap: 9 }}>
          {Object.keys(PROMO_TYPE).map((k) => <button key={k} className={"reason-opt" + (f.type === k ? " sel" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => set("type", k)}>{PROMO_TYPE[k].label}</button>)}
        </div>
      </div>
      <div className="grid-2">
        {f.type === "percent" ? <>
          <div className="field"><label>نسبة الخصم (٪)</label><input type="number" min="1" max="100" value={f.value} onChange={(e) => set("value", Number(e.target.value))} /></div>
          <div className="field"><label>سقف الخصم (₪) — 0 = بلا سقف</label><input type="number" min="0" value={f.cap} onChange={(e) => set("cap", Number(e.target.value))} /></div>
        </> : f.type === "fixed" ? <>
          <div className="field"><label>قيمة الخصم (₪)</label><input type="number" min="1" value={f.value} onChange={(e) => set("value", Number(e.target.value))} /></div>
          <div className="field"><label>حدّ أدنى للطلب (₪)</label><input type="number" min="0" value={f.minOrder} onChange={(e) => set("minOrder", Number(e.target.value))} /></div>
        </> : <div className="field"><label>حدّ أدنى للطلب (₪)</label><input type="number" min="0" value={f.minOrder} onChange={(e) => set("minOrder", Number(e.target.value))} /></div>}
        {f.type === "percent" ? <div className="field"><label>حدّ أدنى للطلب (₪)</label><input type="number" min="0" value={f.minOrder} onChange={(e) => set("minOrder", Number(e.target.value))} /></div> : null}
      </div>
      <div className="field"><label>النطاق</label>
        <div style={{ display: "flex", gap: 9, marginBottom: f.scope === "restaurant" ? 12 : 0 }}>
          <button className={"reason-opt" + (f.scope === "all" ? " sel" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => set("scope", "all")}>كل المطاعم</button>
          <button className={"reason-opt" + (f.scope === "restaurant" ? " sel" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => set("scope", "restaurant")}>مطعم محدّد</button>
        </div>
        {f.scope === "restaurant" ? <select value={f.restId || ""} onChange={(e) => set("restId", e.target.value)}><option value="">اختر المطعم</option>{activeRests.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select> : null}
      </div>
      <div className="grid-2">
        <div className="field"><label>حدّ الاستخدام الكلّي — 0 = غير محدود</label><input type="number" min="0" value={f.limit} onChange={(e) => set("limit", Number(e.target.value))} /></div>
        <div className="field"><label>مرّات لكل زبون</label><input type="number" min="1" value={f.perUser} onChange={(e) => set("perUser", Number(e.target.value))} /></div>
        <div className="field" style={{ marginBottom: 0 }}><label>تاريخ البدء</label><input type="date" value={f.start} onChange={(e) => set("start", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>
        <div className="field" style={{ marginBottom: 0 }}><label>تاريخ الانتهاء</label><input type="date" value={f.end} onChange={(e) => set("end", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>
      </div>
    </Modal>
  );
}

Object.assign(window, { PromosScreen, PromoModal });
