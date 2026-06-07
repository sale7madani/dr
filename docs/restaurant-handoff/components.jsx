/* ============================================================
   مكوّنات مشتركة — سنبل
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;
const S = window.SUNBUL;

/* مؤقّت حي — يعيد التحديث كل ثانية */
function useNow(active){
  const [, force] = useState(0);
  useEffect(() => {
    if (active === false) return;
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  return Date.now();
}

function initials(name){
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[1] ? p[1][0] : "")).toUpperCase();
}

function Avatar({ name, size }){
  const sz = size || 34;
  return (
    <div className="av" style={{ width: sz, height: sz, fontSize: sz * 0.42 }}>
      {initials(name)}
    </div>
  );
}

/* وقت التحضير: يحسب الحالة (عادي / قارب / متأخر) */
function prepState(order){
  if (!order.acceptedAt || !order.prepTime) return { pct: 0, left: 0, state: "ok" };
  const elapsed = (Date.now() - order.acceptedAt) / 60000;
  const left = order.prepTime - elapsed;
  const pct = Math.min(100, (elapsed / order.prepTime) * 100);
  let state = "ok";
  if (left <= 0) state = "late";
  else if (left <= 5) state = "warn";
  return { pct, left: Math.round(left), state };
}

/* عدّاد منذ الإنشاء — للطلبات الجديدة */
function NewTimer({ order }){
  useNow(true);
  const mins = S.minsSince(order.createdAt);
  const cls = mins >= 4 ? "late" : mins >= 2 ? "warn" : "";
  return (
    <span className={"otimer " + cls}>
      <Ic.clock s={16} />
      <span className="tnum">{S.elapsedClock(order.createdAt)}</span>
    </span>
  );
}

/* عدّاد التحضير — يعرض الوقت المتبقّي */
function PrepTimer({ order }){
  useNow(true);
  const ps = prepState(order);
  const cls = ps.state === "late" ? "late" : ps.state === "warn" ? "warn" : "";
  const txt = ps.left <= 0 ? "تأخّر " + Math.abs(ps.left) + " د" : "باقي " + ps.left + " د";
  return (
    <span className={"otimer " + cls}>
      <Ic.flame s={16} />
      <span>{txt}</span>
    </span>
  );
}

/* عدّاد بسيط للجاهز — منذ متى جاهز */
function ReadyTimer({ order }){
  useNow(true);
  const mins = S.minsSince(order.readyAt || Date.now());
  const cls = mins >= 6 ? "late" : mins >= 3 ? "warn" : "";
  return (
    <span className={"otimer " + cls}>
      <Ic.truck s={16} />
      <span>{mins < 1 ? "الآن" : "جاهز منذ " + mins + " د"}</span>
    </span>
  );
}

/* عدّاد للطلب المُسلّم — وقت التسليم */
function DeliveredTag({ order }){
  const d = new Date(order.deliveredAt || Date.now());
  let h = d.getHours(); const m = d.getMinutes();
  const ap = h >= 12 ? "م" : "ص"; h = h % 12 || 12;
  return (
    <span className="otimer done">
      <Ic.checkCircle s={16} />
      <span className="tnum">{h}:{m < 10 ? "0" + m : m} {ap}</span>
    </span>
  );
}

/* شارة الطلب المرفوض */
function RejectedTag(){
  return (
    <span className="otimer rej">
      <Ic.x s={16} /> مرفوض
    </span>
  );
}

function PayTag({ payment }){
  return payment === "cash"
    ? <span className="pay-tag pay-cash">نقداً</span>
    : <span className="pay-tag pay-online">مدفوع أونلاين</span>;
}

/* ===== بطاقة الطلب ===== */
function OrderCard({ order, onOpen, onAction }){
  const st = order.status;
  let cls = "ocard is-" + st;
  let urgent = false;
  if (st === "new" && S.minsSince(order.createdAt) >= 4) { cls += " is-urgent"; urgent = true; }
  if (st === "preparing" && prepState(order).state === "late") { cls += " is-urgent"; urgent = true; }
  if (st === "new") cls += " is-new";

  const shown = order.items.slice(0, 3);
  const extra = order.items.length - shown.length;
  const count = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className={cls} onClick={() => onOpen(order)}>
      <div className="ocard-strip"></div>
      <div className="ocard-in">
        <div className="ocard-top">
          <div className="onum">#{order.number} <small>· {count} صنف</small></div>
          {st === "new" && <NewTimer order={order} />}
          {st === "preparing" && <PrepTimer order={order} />}
          {st === "ready" && <ReadyTimer order={order} />}
          {st === "delivered" && <DeliveredTag order={order} />}
          {st === "rejected" && <RejectedTag />}
        </div>

        <div className="ocust">
          <div className="nm">{order.customer.name}</div>
          <div className="meta">{order.customer.address.split("،")[0]}</div>
        </div>

        <div className="oitems">
          {shown.map((it, i) => (
            <div className="oitem" key={i}>
              <span className="q tnum">×{it.qty}</span>
              <span className="nm">
                {it.name}
                {it.mods && it.mods.length > 0 &&
                  <span className="mod"> — {it.mods.join("، ")}</span>}
              </span>
            </div>
          ))}
          {extra > 0 && <div className="omore">+ {extra} أصناف أخرى…</div>}
        </div>

        {order.note && st === "new" && (
          <div className="onote">
            <Ic.note s={16} style={{ flex: "0 0 auto", marginTop: 1 }} />
            <span>{order.note}</span>
          </div>
        )}

        {st === "rejected" && order.rejectReason && (
          <div className="oreason">
            <Ic.x s={15} style={{ flex: "0 0 auto", marginTop: 1 }} />
            <span><b>سبب الرفض:</b> {order.rejectReason}</span>
          </div>
        )}

        <div className="ocard-foot">
          <div className="ototal">
            <small>قيمة الطلب</small>
            <b className="tnum">{S.money(order.subtotal)}</b>
          </div>
          <PayTag payment={order.payment} />
        </div>

        <div className="card-action" onClick={(e) => e.stopPropagation()}>
          {st === "new" && (
            <button className="btn btn-gold btn-block btn-lg" onClick={() => onOpen(order)}>
              <Ic.bag s={20} /> عرض الطلب وقبوله
            </button>
          )}
          {st === "preparing" && (
            <button className="btn btn-green btn-block btn-lg" onClick={() => onAction(order, "ready")}>
              <Ic.check s={20} /> جاهز للاستلام
            </button>
          )}
          {st === "ready" && (
            <button className="btn btn-ink btn-block btn-lg" onClick={() => onAction(order, "delivered")}>
              <Ic.truck s={20} /> سلّمته للكابتن
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  useNow, initials, Avatar, prepState,
  NewTimer, PrepTimer, ReadyTimer, PayTag, DeliveredTag, RejectedTag, OrderCard,
});
