/* ============================================================
   مكوّنات مشتركة — لوحة تحكم سنبل
   ============================================================ */
const { useState, useEffect, useRef } = React;
const A = window.ADMIN;

/* ---------- خرائط الحالات ---------- */
const ORDER_STATUS = {
  unpaid:    { label: "غير مدفوع",    cls: "b-red",    dot: "var(--red)" },
  processing:{ label: "قيد المعالجة", cls: "b-gold",   dot: "var(--gold-deep)" },
  new:       { label: "طلب جديد",      cls: "b-blue",   dot: "var(--blue)" },
  preparing: { label: "قيد التحضير",  cls: "b-cyan",   dot: "var(--cyan)" },
  ready:     { label: "جاهز للاستلام", cls: "b-purple", dot: "var(--purple)" },
  onway:     { label: "جاري التوصيل", cls: "b-orange", dot: "var(--orange)" },
  delivered: { label: "تم التسليم",     cls: "b-green",  dot: "var(--green)" },
  canceled:  { label: "ملغى",           cls: "b-gray",   dot: "#b3ab97" },
};
// تصنيف المراحل للعرض
const PHASE = {
  payment: ["unpaid", "processing"],   // لدى الإدارة قبل التحويل
  restaurant: ["new", "preparing", "ready"],
  delivery: ["onway"],
  done: ["delivered"],
};
const CAP_PAY = {
  daily:      { label: "موظف", cls: "b-blue" },
  commission: { label: "بالنسبة", cls: "b-purple" },
};
function capPayDesc(c){
  if (c.payType === "daily") return "يومية " + A.money(c.dailyWage) + (c.incentive ? " + " + A.money(c.incentive) + "/طلب" : "");
  if (c.capCommission > 0) return "عمولة " + c.capCommission + "%" + (c.incentive ? " + " + A.money(c.incentive) + "/طلب" : "");
  return "بدون عمولة" + (c.incentive ? " + " + A.money(c.incentive) + "/طلب" : "");
}
const REST_STATUS = {
  active:    { label: "نشط",              cls: "b-green" },
  busy:      { label: "مزدحم",            cls: "b-gold" },
  closed:    { label: "مغلق الآن",        cls: "b-gray" },
  pending:   { label: "بانتظار الموافقة", cls: "b-blue" },
  suspended: { label: "موقوف",            cls: "b-red" },
};
const CAP_STATUS = {
  online:  { label: "متاح",       cls: "b-green",  dot: "var(--green)" },
  busy:    { label: "بتوصيلة",    cls: "b-purple", dot: "var(--purple)" },
  offline: { label: "غير متصل",   cls: "b-gray",   dot: "#b3ab97" },
};
const CUST_STATUS = {
  vip:     { label: "مميّز VIP",        cls: "b-gold" },
  regular: { label: "منتظم",            cls: "b-green" },
  new:     { label: "جديد",             cls: "b-blue" },
  atrisk:  { label: "معرّض للفقدان",    cls: "b-orange" },
  flagged: { label: "تحت المراقبة",     cls: "b-red" },
};
function Badge({ meta, dot }){
  if(!meta) return null;
  return <span className={"badge " + meta.cls}>{dot && <span className="bd" style={{ background: meta.dot }}></span>}{meta.label}</span>;
}

/* ---------- مؤشّر تقادُم الطلب (SLA) ---------- */
function AgePill({ order, withClock }){
  const sla = A.orderSLA(order);
  if (sla.level === "done") return <span style={{ color: "var(--text-faint)", fontWeight: 700, whiteSpace: "nowrap" }} className="tnum">{A.ago(order.createdAt)}</span>;
  if (sla.level === "hold") return <span className="age-pill age-hold tnum"><Ic.clock s={13} /> معلّق</span>;
  return (
    <span className={"age-pill age-" + sla.level + (sla.level === "late" ? " pulse-late" : "")}>
      <Ic.clock s={13} />
      <span className="tnum">{A.fmtAge(sla.mins)}</span>
      {sla.level === "late" ? <span className="age-tag">متأخر</span> : null}
    </span>
  );
}

/* ---------- لُقَيمات ---------- */
function initials(name){
  const p = (name || "").trim().split(/\s+/);
  return ((p[0]||"")[0]||"") + ((p[1]||"")[0]||"");
}
function Avatar({ name, gold }){
  return <span className="cell-av" style={gold ? { background:"var(--gold-soft)", color:"var(--gold-deep)" } : null}>{initials(name)}</span>;
}
function RestLogo({ r, s }){
  const size = s || 40;
  const short = (r.name||"").replace(/[^A-Za-z& ]/g,"").split(" ").map(w=>w[0]).join("").slice(0,3) || (r.ar||"")[0];
  return <span className="cell-logo" style={{ width:size, height:size, background:r.grad, fontSize: size>34?13:11 }}>{short}</span>;
}

/* ---------- الشريط الجانبي ---------- */
function Sidebar({ active, onNav, counts, onClose }){
  return (
    <aside className="sidebar">
      <div className="side-brand">
        <img src="sonbol-logo.png" alt="Sonbol" className="brand-logo" />
      </div>
      <nav className="side-scroll">
        <div className="side-lbl">التشغيل</div>
        {A.NAV.map((n) => {
          const I = Ic[n.icon];
          const badgeVal = n.badge === "approvals" ? counts.approvals : (n.badge === "live" ? null : 0);
          return (
            <button key={n.k} className={"side-nav-btn" + (active === n.k ? " active" : "")} onClick={() => { onNav(n.k); onClose && onClose(); }}>
              <span className="sn-ic">{I ? <I s={21} /> : null}</span>
              <span className="sn-l">{n.label}</span>
              {n.badge === "live" && active !== n.k && counts.live > 0 ? <span className="sn-live" title="نشط"></span> : null}
              {n.badge === "approvals" && counts.approvals > 0 ? <span className="sn-badge">{counts.approvals}</span> : null}
            </button>
          );
        })}
        <div className="side-lbl">النظام</div>
        <button className={"side-nav-btn" + (active === "settings" ? " active" : "")} onClick={() => { onNav("settings"); onClose && onClose(); }}>
          <span className="sn-ic"><Ic.gear s={21} /></span>
          <span className="sn-l">الإعدادات</span>
        </button>
      </nav>
      <div className="side-foot">
        <button className="side-acc">
          <span className="sa-av">سـ</span>
          <span className="sa-l"><b>سنبل غزة</b><small>مدير المنصّة</small></span>
          <span className="sa-ic"><Ic.logout s={18} /></span>
        </button>
      </div>
    </aside>
  );
}

/* ---------- الشريط العلوي ---------- */
function Topbar({ title, sub, onBurger, search, setSearch, alerts, onCmd }){
  const [clock, setClock] = useState("");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const h = d.getHours(), m = d.getMinutes();
      const ap = h < 12 ? "ص" : "م";
      const hh = ((h % 12) || 12);
      setClock((hh < 10 ? "0" + hh : hh) + ":" + (m < 10 ? "0" + m : m) + " " + ap);
    };
    fmt(); const t = setInterval(fmt, 10000); return () => clearInterval(t);
  }, []);
  const today = new Date().toLocaleDateString("ar-EG-u-nu-latn", { weekday: "long", day: "numeric", month: "long" });
  return (
    <header className="topbar">
      <button className="tb-burger" onClick={onBurger} aria-label="القائمة"><Ic.list s={22} /></button>
      <div className="tb-title">
        <div className="t">{title}</div>
        {sub ? <div className="s">{sub}</div> : null}
      </div>
      <div className="tb-tools">
        <button className="tb-search" onClick={onCmd} title="بحث سريع (⌘K)">
          <Ic.search s={18} style={{ color: "var(--text-faint)" }} />
          <span className="tb-search-ph">ابحث عن طلب، كابتن، مطعم…</span>
          <kbd className="tb-kbd">⌘K</kbd>
        </button>
        <button className="tbtn" aria-label="تنبيهات">{alerts ? <span className="dot"></span> : null}<Ic.bell s={20} /></button>
        <div className="tb-clock"><div className="t tnum">{clock}</div><div className="d">{today}</div></div>
      </div>
    </header>
  );
}

/* ---------- KPI ---------- */
function KPI({ icon, tone, label, value, delta, deltaMeta, sub }){
  const I = Ic[icon];
  return (
    <div className="kpi">
      <div className="kh">
        <span className={"ki " + (tone || "g1")}>{I ? <I s={22} /> : null}</span>
        <span className="kl">{label}</span>
      </div>
      <div className="kv tnum">{value}</div>
      <div className="kfoot">
        {delta != null ? (
          <span className={"kd " + (delta >= 0 ? "up" : "down")}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        ) : null}
        {deltaMeta ? <span className="km">{deltaMeta}</span> : null}
        {sub ? <span className="km">{sub}</span> : null}
      </div>
    </div>
  );
}

/* ---------- رسم أعمدة ---------- */
function Bars({ data, valueKey, labelKey, fmt, todayIdx, tone }){
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="bars">
      {data.map((d, i) => (
        <div className={"barcol" + (i === todayIdx ? " today" : "")} key={i}>
          <span className="bval">{fmt ? fmt(d[valueKey]) : d[valueKey]}</span>
          <div className="bcol" style={{ height: (d[valueKey] / max * 100) + "%", background: tone || undefined }}></div>
          <span className="blab">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- دونات ---------- */
function Donut({ segments, centerVal, centerLabel, size }){
  const sz = size || 150, r = sz / 2 - 14, c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let off = 0;
  return (
    <div className="donut-wrap">
      <div className="donut-c" style={{ width: sz, height: sz }}>
        <svg width={sz} height={sz} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="16" />
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            const el = <circle key={i} cx={sz/2} cy={sz/2} r={r} fill="none" stroke={s.color} strokeWidth="16" strokeDasharray={len + " " + (c - len)} strokeDashoffset={-off} strokeLinecap="butt" />;
            off += len; return el;
          })}
        </svg>
        <div className="dc-mid"><b className="tnum">{centerVal}</b><small>{centerLabel}</small></div>
      </div>
      <div className="legend">
        {segments.map((s, i) => (
          <div className="lg" key={i}>
            <span className="ld" style={{ background: s.color }}></span>
            <div><div className="lt">{s.label}</div><div className="ls tnum">{s.value}{s.suffix || ""}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- أعمدة أفقية ---------- */
function HBars({ data, max, fmt, color }){
  const mx = max || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="hbars">
      {data.map((d, i) => (
        <div key={i}>
          <div className="hb-top"><span className="hb-n">{d.name}</span><span className="hb-c tnum">{fmt ? fmt(d.value) : d.value}</span></div>
          <div className="hb-track"><div className="hb-fill" style={{ width: (d.value / mx * 100) + "%", background: d.color || color || undefined }}></div></div>
        </div>
      ))}
    </div>
  );
}

/* ---------- النشاط الحي ---------- */
const FEED_META = {
  order:      { ic: "bag",        cls: "b-gold" },
  transfer:   { ic: "wallet",     cls: "b-blue" },
  captain:    { ic: "bike",       cls: "b-purple" },
  delivered:  { ic: "checkCircle",cls: "b-green" },
  issue:      { ic: "alert",      cls: "b-red" },
  restaurant: { ic: "store",      cls: "b-cyan" },
};
function Feed({ items }){
  return (
    <div className="feed">
      {items.map((it, i) => {
        const m = FEED_META[it.kind] || FEED_META.order;
        const I = Ic[m.ic];
        return (
          <div className="feed-it" key={i}>
            <span className={"feed-ic " + m.cls}>{I ? <I s={18} /> : null}</span>
            <div className="feed-l"><div className="ft">{it.text}</div><div className="fa tnum">{A.ago(it.t)}</div></div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- لوحة جانبية ---------- */
function Drawer({ title, badge, onClose, children, foot }){
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  return (
    <>
      <div className="drawer-ov" onClick={onClose}></div>
      <div className="drawer" role="dialog">
        <div className="drawer-head">
          <button className="tbtn" onClick={onClose} aria-label="إغلاق"><Ic.arrowL s={20} /></button>
          <div className="dn">{title}</div>
          {badge}
        </div>
        <div className="drawer-body">{children}</div>
        {foot ? <div className="drawer-foot">{foot}</div> : null}
      </div>
    </>
  );
}

/* ---------- منبثقة ---------- */
function Modal({ icon, iconTone, title, onClose, children, foot, wide }){
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const I = icon ? Ic[icon] : null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={wide ? { width: "min(640px,94vw)" } : null} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          {I ? <span className={"mi " + (iconTone || "b-gold")}><I s={22} /></span> : null}
          <div className="mt">{title}</div>
          <button className="tbtn" style={{ marginInlineStart: "auto" }} onClick={onClose} aria-label="إغلاق"><Ic.x s={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {foot ? <div className="modal-foot">{foot}</div> : null}
      </div>
    </div>
  );
}

/* ---------- بطاقة لوحة ---------- */
function Panel({ title, sub, more, onMore, children, pad }){
  return (
    <div className="card">
      {(title || more) ? (
        <div className="card-h">
          <div><div className="ct">{title}</div>{sub ? <div className="cs">{sub}</div> : null}</div>
          {more ? <button className="link-more" onClick={onMore}>{more} <Ic.arrow s={15} /></button> : null}
        </div>
      ) : null}
      <div className="card-b" style={pad === false ? { padding: 0 } : null}>{children}</div>
    </div>
  );
}

/* ---------- التقييمات والمراجعات ---------- */
function StarIcon({ filled, s }){
  const sz = s || 15;
  return <svg width={sz} height={sz} viewBox="0 0 24 24" fill={filled ? "var(--gold-deep)" : "var(--line)"} aria-hidden="true"><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" /></svg>;
}
function Stars({ n, s }){
  return <span style={{ display: "inline-flex", gap: 1 }}>{[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= Math.round(n)} s={s} />)}</span>;
}
function Ratings({ avg, total, reviews, onReview }){
  const dist = A.ratingDist(avg, total);
  const max = Math.max(...dist.map((d) => d.count), 1);
  return (
    <>
      <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 14 }}>
        <div style={{ textAlign: "center", flex: "0 0 auto" }}>
          <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }} className="tnum">{avg.toFixed(1)}</div>
          <div style={{ margin: "5px 0 4px" }}><Stars n={avg} s={14} /></div>
          <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 700 }}>{total.toLocaleString("en-US")} تقييم</div>
        </div>
        <div style={{ flex: 1 }}>
          {dist.map((d) => (
            <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-soft)", width: 10 }}>{d.star}</span>
              <StarIcon filled s={11} />
              <div className="hb-track" style={{ flex: 1 }}><div className="hb-fill" style={{ width: (d.count / max * 100) + "%", background: "var(--gold)" }}></div></div>
            </div>
          ))}
        </div>
      </div>
      {reviews.map((r, i) => {
        const target = onReview ? onReview(i) : null;
        return (
          <div key={i} className={"feed-it" + (target ? " feed-clickable" : "")} onClick={target ? () => target() : undefined}>
            <Avatar name={r.by} />
            <div className="feed-l">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><b style={{ fontSize: 13.5 }}>{r.by}</b><Stars n={r.stars} s={11} />{target ? <span style={{ marginInlineStart: "auto", color: "var(--accent-deep)", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 800 }}>الطلب <Ic.arrow s={13} /></span> : null}</div>
              <div style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600, marginTop: 3, lineHeight: 1.5 }}>{r.text}</div>
              <div className="fa tnum">{A.ago(r.at)}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ---------- وصل التحويل (عرض + تحميل) — مشترك ---------- */
function ReceiptCard({ method, amount, reference }){
  const m = A.PAY_METHODS[method] || { label: method, color: "var(--blue)" };
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "var(--sh-sm)", background: "var(--surface-2)" }}>
      <div style={{ background: m.color, color: "#fff", padding: "14px 14px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, opacity: .9 }}>{m.label}</div>
        <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>إشعار تحويل</div>
      </div>
      <div style={{ padding: "16px 14px", textAlign: "center", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 9px, rgba(23,21,15,.03) 9px, rgba(23,21,15,.03) 18px)" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--green-soft)", color: "var(--green)", display: "grid", placeItems: "center", margin: "0 auto 8px" }}><Ic.check s={24} /></div>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--green)" }}>تحويل ناجح</div>
        <div style={{ fontWeight: 900, fontSize: 24, margin: "8px 0 2px" }} className="tnum">{A.money(amount)}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 700, direction: "ltr" }}>{reference}</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 700, marginTop: 8, borderTop: "1px dashed var(--line)", paddingTop: 8 }}>صورة الوصل المرفقة من الزبون</div>
      </div>
    </div>
  );
}
function downloadReceipt(r){
  const m = A.PAY_METHODS[r.method] || { label: r.method || "تحويل", color: "#2f74c0" };
  const ref = r.reference || r.ref || "";
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
  x.fillStyle = "#1c1a14"; x.font = "900 46px Tajawal, sans-serif"; x.fillText(A.money(r.amount), 240, 330);
  const rows = [["المرجع", ref], ["الزبون", r.customer || ""], ["رقم الطلب", "#" + r.order], ["التاريخ", new Date().toLocaleDateString("ar-EG-u-nu-latn")]];
  rows.forEach((row, i) => { const y = 400 + i * 38; x.textAlign = "left"; x.fillStyle = "#1c1a14"; x.font = "800 18px Tajawal"; x.fillText(row[1], 60, y); x.textAlign = "right"; x.fillStyle = "#9c9480"; x.font = "700 16px Tajawal"; x.fillText(row[0], 420, y); });
  const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = "receipt-" + r.order + ".png"; document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- نافذة سبب الرفض (مشتركة) ---------- */
function ReasonModal({ title, reasons, onClose, onConfirm }){
  const [reason, setReason] = useState("");
  return (
    <Modal icon="x" iconTone="b-red" title={title} onClose={onClose}
      foot={[<button key="b" className="btn btn-line" onClick={onClose}>إلغاء</button>,
        <button key="c" className="btn btn-red btn-block" disabled={!reason.trim()} style={!reason.trim() ? { opacity: .5 } : null} onClick={() => onConfirm(reason.trim())}>تأكيد الرفض</button>]}>
      <div className="field" style={{ marginBottom: 10 }}><label>سبب الرفض (إلزامي)</label></div>
      <div className="reasons">
        {reasons.map((r) => (
          <button key={r} className={"reason-opt" + (reason === r ? " sel" : "")} onClick={() => setReason(r)}>
            <span className="rdot"></span><span style={{ flex: 1, textAlign: "right" }}>{r}</span>
          </button>
        ))}
      </div>
      <div className="field" style={{ marginTop: 12, marginBottom: 0 }}>
        <textarea placeholder="أو اكتب سبباً آخر…" value={reasons.includes(reason) ? "" : reason} onChange={(e) => setReason(e.target.value)} style={{ minHeight: 60, resize: "none" }} />
      </div>
    </Modal>
  );
}

Object.assign(window, {
  ORDER_STATUS, REST_STATUS, CAP_STATUS, CUST_STATUS, CAP_PAY, PHASE, capPayDesc,
  Badge, Avatar, RestLogo, initials, StarIcon, Stars, Ratings, AgePill,
  ReceiptCard, downloadReceipt, ReasonModal,
  Sidebar, Topbar, KPI, Bars, Donut, HBars, Feed, Drawer, Modal, Panel,
});
