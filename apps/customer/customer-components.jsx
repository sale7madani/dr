/* ============================================================
   مكوّنات مشتركة — واجهة الزبون (سُنبل)
   ============================================================ */
const { useState, useEffect, useRef, useCallback, useMemo } = React;
const SB = window.SB;

/* تطبيق لون المطعم على متغيّرات CSS داخل عنصر */
function rcVars(r){
  if (!r) return {};
  return {
    "--rc": r.color, "--rc-deep": r.colorDeep, "--rc-soft": r.colorSoft,
    "--rc-tint": r.colorTint, "--rc-on": "#fff",
  };
}

function initials(name){
  const p = (name || "").trim().split(/\s+/);
  return ((p[0] ? p[0][0] : "") + (p[1] ? p[1][0] : "")).toUpperCase();
}

/* غلاف نصّي يحاكي شعار المطعم */
function Cover({ r, sm }){
  return (
    <div className={"cover" + (sm ? " cover-sm" : "")} style={{ background: r.cover, color: r.coverInk }}>
      <div style={{ textAlign: "center" }}>
        <div className="cv-name">{r.name}</div>
        {!sm && <div className="cv-sub">{r.nameAr}</div>}
      </div>
    </div>
  );
}

/* صورة صنف (placeholder ملوّن) */
const ITEM_TONE = { default: ["#f3e7d3", "#b07d2e"] };
function FoodThumb({ r, it }){
  const bg = r ? r.colorSoft : "#f1f1f2";
  const fg = r ? r.colorDeep : "#999";
  const I = window.Ic.bag;
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: bg, color: fg }}>
      <I s={26} />
    </div>
  );
}

/* نجمة + رقم */
function Stars({ n, color }){
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ color: color || "var(--gold-deep)", display: "inline-flex" }}><Ic.star s={14} /></span>
      <b className="tnum">{Number(n).toFixed(1)}</b>
    </span>
  );
}

/* بطاقة مطعم */
function RestaurantCard({ r, onOpen }){
  return (
    <div className={"rcard" + (r.open ? "" : " closed")} style={rcVars(r)} onClick={() => onOpen(r)}>
      <div className="rcard-cover"><Cover r={r} /><span className="rc-open pill pill-green"><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }}></span> مفتوح الآن</span></div>
      <div className="rcard-in">
        <span className="rc-rate"><Ic.star s={13} /> <span className="tnum">{r.rating.toFixed(1)}</span></span>
        <div className="rc-l">
          <div className="rc-name">{r.name}</div>
          <div className="rc-cuis">{r.tagline}</div>
          <div className="rc-meta">
            <span className="m"><Ic.timer s={14} /> {r.hours}</span>
            <span className="m"><Ic.bike s={14} /> {SB.money(r.fee)}</span>
            <span className="m"><Ic.timer s={14} /> {r.etaMin}-{r.etaMax} د</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* صف صنف */
function FoodItem({ r, it, onOpen }){
  const sold = it.soldout;
  return (
    <div className={"fitem" + (sold ? " soldout" : "")} style={rcVars(r)} onClick={() => !sold && onOpen(it)}>
      <div className="fi-l">
        <div className="fi-name">{it.name}</div>
        {it.desc && <div className="fi-desc">{it.desc}</div>}
        <div className="fi-foot">
          <span className="fi-price tnum">{SB.money(it.price)}</span>
          {!sold && <button className="fi-add" onClick={(e) => { e.stopPropagation(); onOpen(it); }}><Ic.plus s={15} /> أضف</button>}
        </div>
      </div>
      <div className="fi-img"><FoodThumb r={r} it={it} /></div>
    </div>
  );
}

/* ستيبر */
function Stepper({ value, onDec, onInc, big, rc, showDelete }){
  return (
    <div className={"stepper" + (big ? " big" : "") + (rc ? " rc-step" : "")}>
      <button className="s-btn plus" onClick={onInc}><Ic.plus s={big ? 20 : 17} /></button>
      <span className="q tnum">{value}</span>
      {showDelete && value <= 1
        ? <button className="s-btn del" onClick={onDec}><Ic.trash s={big ? 19 : 16} /></button>
        : <button className="s-btn minus" onClick={onDec}><Ic.minus s={big ? 20 : 17} /></button>}
    </div>
  );
}

/* شارة الحالة */
function StatusPill({ status }){
  const st = SB.STATUS[status]; if (!st) return null;
  const I = (window.Ic && window.Ic[st.icon]) || Ic.check;
  return <span className={"pill pill-" + st.tone}><I s={13} /> {st.label}</span>;
}

/* خط زمني عمودي */
function VTimeline({ currentKey }){
  const stages = SB.TIMELINE.map((k) => SB.STATUS[k]);
  const idx = SB.TIMELINE.indexOf(currentKey);
  return (
    <div className="vtl-wrap">
      {stages.map((s, i) => {
        const cls = i < idx ? "done" : i === idx ? "cur" : "idle";
        const I = (window.Ic && window.Ic[s.icon]) || Ic.check;
        const last = i === stages.length - 1;
        return (
          <div className={"vtl " + cls} key={s.k}>
            <div className="vtl-mk">
              <div className="vtl-dot">{i < idx ? <Ic.check2 s={16} /> : <I s={16} />}</div>
              {!last && <div className="vtl-line"></div>}
            </div>
            <div className="vtl-c">
              <div className="vtl-k">{s.label}</div>
              <div className="vtl-s">{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CaptainCard({ cap }){
  return (
    <div className="captain">
      <div className="cap-av">{initials(cap.name)}</div>
      <div className="cap-l">
        <div className="cap-name">{cap.name}</div>
        <div className="cap-meta"><span className="star"><Ic.star s={12} /></span> {cap.rating} · {cap.plate}</div>
      </div>
      <div className="cap-act">
        <button className="msg"><Ic.chat s={19} /></button>
        <button className="call"><Ic.phone s={19} /></button>
      </div>
    </div>
  );
}

function Toast({ msg }){
  if (!msg) return null;
  return <div className="toast"><span className="tc"><Ic.checkCircle s={19} /></span><span>{msg}</span></div>;
}

function Sheet({ title, onClose, children, foot }){
  return (
    <div className="sheet-ov" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab"></div>
        <div className="sheet-head"><div className="sh-t">{title}</div><button className="ic-btn plain" onClick={onClose}><Ic.close s={22} /></button></div>
        <div className="sheet-body">{children}</div>
        {foot && <div className="sheet-foot">{foot}</div>}
      </div>
    </div>
  );
}

/* رأس صفحة داخلية: عنوان يمين + رجوع */
function SubHead({ title, onBack }){
  return (
    <div className="subhead">
      <div className="sh-t">{title}</div>
      <button className="sh-back" onClick={onBack}><Ic.chevR s={24} /></button>
    </div>
  );
}

function StatusBar(){
  const [t, setT] = useState(() => clockStr());
  useEffect(() => { const id = setInterval(() => setT(clockStr()), 20000); return () => clearInterval(id); }, []);
  return (
    <div className="statusbar">
      <div className="tnum">{t}</div>
      <div className="sb-dots">
        <span className="sb-bars"><i style={{ height: 4 }}></i><i style={{ height: 6 }}></i><i style={{ height: 8 }}></i><i style={{ height: 11 }}></i></span>
        <span style={{ fontSize: 12, fontWeight: 800 }}>5G</span>
        <span className="sb-batt"></span>
      </div>
    </div>
  );
}
function clockStr(){
  const d = new Date(); let h = d.getHours(); const m = d.getMinutes();
  const ap = h >= 12 ? "م" : "ص"; h = h % 12 || 12;
  return h + ":" + (m < 10 ? "0" + m : m) + " " + ap;
}

Object.assign(window, {
  rcVars, initials, Cover, FoodThumb, Stars, RestaurantCard, FoodItem, Stepper,
  StatusPill, VTimeline, CaptainCard, Toast, Sheet, SubHead, StatusBar, clockStr,
});
