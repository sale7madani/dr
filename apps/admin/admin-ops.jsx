/* ============================================================
   شاشات العمليات — الطلبات + الكباتن + الخريطة الحيّة
   ============================================================ */

/* ---------- شارة الدفع (بنك فلسطين / جوال باي / بال باي) ---------- */
function payBadge(o){
  const m = A.PAY_METHODS[o.payment] || { short: o.payment };
  if (o.payStatus === "unpaid") return { label: "لم يُدفع", cls: "b-red" };
  if (o.payStatus === "pending") return { label: m.short + " ⏳", cls: "b-gold" };
  if (o.payStatus === "rejected") return { label: m.short + " ✕", cls: "b-red" };
  return { label: m.short, cls: "b-blue" };
}
function payFull(o){
  const m = A.PAY_METHODS[o.payment] || { label: o.payment };
  if (o.payStatus === "unpaid") return { label: m.label + " — لم يُرفع الوصل", cls: "b-red" };
  if (o.payStatus === "pending") return { label: m.label + " — بانتظار التحقق", cls: "b-gold" };
  if (o.payStatus === "rejected") return { label: m.label + " — مرفوض", cls: "b-red" };
  return { label: m.label + " — مؤكّد", cls: "b-green" };
}

/* ===================== لوحة تفاصيل الطلب ===================== */
const STATUS_ORDER = { unpaid: 0, processing: 1, new: 2, preparing: 3, ready: 4, onway: 5, delivered: 6 };
function orderTimeline(o){
  const stages = [
    { k: "الدفع والتحقق", s: "unpaid" },
    { k: "قيد المعالجة لدى الإدارة", s: "processing" },
    { k: "حُوِّل إلى المطعم", s: "new" },
    { k: "المطعم يحضّر الطلب", s: "preparing" },
    { k: "جاهز ومُغلّف", s: "ready" },
    { k: "جاري التوصيل للزبون", s: "onway" },
    { k: "تم التسليم", s: "delivered" },
  ];
  if (o.status === "canceled") return [{ k: "تم استلام الطلب", done: true }, { k: "أُلغي الطلب", cur: true }];
  const eff = STATUS_ORDER[o.status];
  return stages.map((st, i) => ({ k: st.k, done: i < eff, cur: i === eff, idle: i > eff }));
}

const ORDER_REJECT_REASONS = [
  "المبلغ لا يطابق قيمة الطلب",
  "المبلغ لم يصل إلى الحساب",
  "الوصل غير واضح أو غير مكتمل",
  "الوصل مكرّر أو يخصّ طلباً آخر",
];
function OrderDrawer({ order, captains, onClose, onAction }){
  const [picking, setPicking] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [rejectingPay, setRejectingPay] = useState(false);
  if (!order) return null;
  const o = order;
  const m = ORDER_STATUS[o.status];
  const tl = orderTimeline(o);
  const available = captains.filter((c) => c.status !== "offline");
  const dispatchMode = o.status === "processing"; // تحويل للمطعم + تعيين كابتن معاً

  const foot = [];
  if (o.status === "unpaid") {
    foot.push(<button key="p" className="btn btn-green btn-block" onClick={() => onAction("confirm-payment", o)}><Ic.check s={18} /> تأكيد الدفع يدوياً</button>);
    foot.push(<button key="c" className="btn btn-line" onClick={() => onAction("contact-order-cust", o)}><Ic.phone s={16} /> اتصال بالزبون</button>);
    foot.push(<button key="x" className="btn btn-red-line" onClick={() => onAction("cancel", o)}><Ic.ban s={16} /> إلغاء</button>);
  } else if (o.status === "processing") {
    if (o.payStatus === "verified") {
      foot.push(<button key="d" className="btn btn-gold btn-block" onClick={() => setPicking(true)}><Ic.send s={17} /> تحويل للمطعم وتعيين كابتن</button>);
      foot.push(<button key="x" className="btn btn-red-line" onClick={() => onAction("cancel", o)}><Ic.ban s={16} /> إلغاء</button>);
    } else {
      foot.push(<button key="a" className="btn btn-green btn-block" onClick={() => onAction("approve-order-pay", o)}><Ic.shield s={16} /> اعتماد الطلب مالياً</button>);
      foot.push(<button key="rp" className="btn btn-red-line" onClick={() => setRejectingPay(true)}><Ic.x s={16} /> رفض الوصل</button>);
    }
  } else if (o.status === "new" || o.status === "preparing" || o.status === "ready") {
    foot.push(<button key="r" className="btn btn-line btn-block" onClick={() => setPicking(true)}><Ic.refresh s={16} /> تبديل الكابتن</button>);
    foot.push(<button key="x" className="btn btn-red-line" onClick={() => onAction("cancel", o)}><Ic.ban s={16} /> إلغاء</button>);
  } else if (o.status === "onway") {
    foot.push(<button key="t" className="btn btn-ink btn-block" onClick={() => onAction("contact", o)}><Ic.phone s={16} /> تواصل مع الكابتن</button>);
    foot.push(<button key="r" className="btn btn-line" onClick={() => setPicking(true)}><Ic.refresh s={16} /> تبديل</button>);
  } else {
    foot.push(<button key="x" className="btn btn-line btn-block" onClick={onClose}>إغلاق</button>);
  }

  return (
    <Drawer title={<span className="tnum">طلب #{o.number}</span>} badge={<span style={{ marginInlineStart: "auto" }}><Badge meta={m} dot /></span>} onClose={onClose} foot={foot}>
      {o.status === "unpaid" ? <div className="notice danger" style={{ marginBottom: 18 }}><Ic.alert s={19} /> طلب غير مدفوع — الزبون لم يستطع إرفاق الوصل. تواصل معه، وبعد تأكّد وصول المبلغ إلى حسابك البنكي اعتمده يدوياً.</div> : null}
      {o.status === "processing" && o.payStatus === "verified" ? <div className="notice warn" style={{ marginBottom: 18 }}><Ic.check s={19} style={{ color: "var(--green)" }} /> تمّ الاعتماد المالي — جاهز للتحويل للمطعم وتعيين كابتن.</div> : null}
      {o.status === "processing" && o.payStatus !== "verified" ? <div className="notice warn" style={{ marginBottom: 18 }}><Ic.shield s={19} style={{ color: "var(--gold-deep)" }} /> بانتظار <b style={{ margin: "0 4px" }}>الاعتماد المالي</b> — راجِع الوصل وتأكّد من وصول المبلغ، ولن يُحوّل للمطعم إلا بعد الاعتماد.</div> : null}

      <div className="sec-l">مسار الطلب</div>
      <div className="timeline">
        {tl.map((tt, i) => (
          <div className={"tl" + (tt.done ? " done" : "") + (tt.cur ? " cur" : "") + (tt.idle ? " idle" : "")} key={i}>
            <div className="tl-mk"><div className="tl-dot"></div>{i < tl.length - 1 ? <div className="tl-line"></div> : null}</div>
            <div className="tl-c"><div className="tl-k">{tt.k}</div></div>
          </div>
        ))}
      </div>

      <div className="sec-l">المطعم</div>
      <div className="kv-row"><span className="k"><RestLogo r={{ name: o.restaurant, grad: o.restGrad }} s={32} /> {o.restaurant}</span><span className="v">{o.area}</span></div>
      <div className="kv-row"><span className="k"><Ic.route s={17} /> مسافة التوصيل</span><span className="v tnum">{o.km != null ? o.km + " كم" : "—"}</span></div>

      <div className="sec-l">الزبون</div>
      <div className="kv-row"><span className="k"><Ic.user s={17} /> {o.customer}</span><span className="v ltr">{o.custPhone}</span></div>
      <div className="kv-row"><span className="k"><Ic.pin s={17} /> العنوان</span><span className="v">{o.area}</span></div>
      {o.note ? <div className="notice warn" style={{ margin: "11px 0 0" }}><Ic.note s={18} /> {o.note}</div> : null}

      <div className="sec-l">الكابتن</div>
      {o.captain ? (
        <div className="kv-row"><span className="k"><Ic.bike s={17} /> {o.captain}</span><span className="v">{["onway", "new", "preparing", "ready"].includes(o.status) ? <button className="btn btn-sm btn-line" onClick={() => setPicking(true)}>تبديل</button> : null}</span></div>
      ) : (
        <div className="kv-row"><span className="k" style={{ color: "var(--text-faint)" }}><Ic.bike s={17} /> لم يُعيَّن بعد</span><span className="v">{o.status === "processing" && o.payStatus === "verified" ? <button className="btn btn-sm btn-gold" onClick={() => setPicking(true)}>تحويل وتعيين</button> : <span style={{ color: "var(--text-faint)", fontSize: 13, fontWeight: 700 }}>{o.status === "processing" ? "بعد الاعتماد المالي" : "بعد إتمام الدفع"}</span>}</span></div>
      )}

      <div className="sec-l">الأصناف</div>
      <table className="dtable">
        <tbody>
          {o.items.map((it, i) => (
            <tr key={i}><td className="q tnum">{it.qty}×</td><td>{it.name}</td><td className="pr tnum">{A.money(it.price * it.qty)}</td></tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 14 }}>
        <div className="sumrow"><span className="muted">المجموع</span><span className="tnum">{A.money(o.subtotal)}</span></div>
        <div className="sumrow"><span className="muted">التوصيل</span><span className="tnum">{A.money(o.delivery)}</span></div>
        <div className="sumrow"><span className="muted">عمولة سنبل</span><span className="tnum" style={{ color: "var(--accent-deep)" }}>{A.money(o.commission)}</span></div>
        <div className="sumrow tot"><span>الإجمالي</span><span className="tnum">{A.money(o.total)}</span></div>
      </div>
      <div className="sec-l">الدفع والوصل</div>
      <div className="kv-row"><span className="k"><Ic.wallet s={17} /> طريقة الدفع</span><span className="v"><Badge meta={payFull(o)} /></span></div>
      {o.payStatus !== "unpaid" ? (
        <div className="kv-row"><span className="k"><Ic.receipt s={17} /> وصل التحويل</span><span className="v" style={{ display: "flex", gap: 7 }}>
          <button className="btn btn-sm btn-line" onClick={() => setShowReceipt(true)}><Ic.eye s={15} /> عرض</button>
          <button className="btn btn-sm btn-line" onClick={() => downloadReceipt({ method: o.payment, amount: o.total, reference: o.payRef, customer: o.customer, order: o.number })}><Ic.download s={15} /> تحميل</button>
        </span></div>
      ) : null}
      {o.rejectReason ? <div className="notice danger" style={{ margin: "11px 0 0" }}><Ic.x s={18} /> سبب رفض الوصل: {o.rejectReason}</div> : null}

      {showReceipt ? (
        <Modal icon="receipt" iconTone="b-blue" title={"وصل تحويل — طلب #" + o.number} onClose={() => setShowReceipt(false)}
          foot={[<button key="d" className="btn btn-ink btn-block" onClick={() => downloadReceipt({ method: o.payment, amount: o.total, reference: o.payRef, customer: o.customer, order: o.number })}><Ic.download s={16} /> تحميل الوصل</button>, <button key="x" className="btn btn-line" onClick={() => setShowReceipt(false)}>إغلاق</button>]}>
          <div style={{ maxWidth: 230, margin: "0 auto" }}><ReceiptCard method={o.payment} amount={o.total} reference={o.payRef} /></div>
          <div style={{ marginTop: 14 }}>
            <div className="kv-row"><span className="k">الزبون</span><span className="v">{o.customer}</span></div>
            <div className="kv-row"><span className="k">المبلغ</span><span className="v tnum">{A.money(o.total)}</span></div>
            <div className="kv-row"><span className="k">رقم المرجع</span><span className="v ltr">{o.payRef}</span></div>
          </div>
        </Modal>
      ) : null}
      {rejectingPay ? <ReasonModal title={"رفض وصل الطلب #" + o.number} reasons={ORDER_REJECT_REASONS} onClose={() => setRejectingPay(false)} onConfirm={(reason) => { onAction("reject-order-pay", o, reason); setRejectingPay(false); }} /> : null}

      {picking ? (
        <Modal icon={dispatchMode ? "send" : "bike"} iconTone={dispatchMode ? "b-gold" : "b-purple"}
          title={dispatchMode ? "تحويل الطلب للمطعم وتعيين كابتن" : "تبديل الكابتن"} onClose={() => setPicking(false)}
          foot={[<button key="x" className="btn btn-line btn-block" onClick={() => setPicking(false)}>إلغاء</button>]}>
          {dispatchMode ? <div className="notice warn" style={{ marginTop: -4 }}><Ic.store s={18} style={{ color: "var(--gold-deep)" }} /> سيُرسَل الطلب إلى <b>{o.restaurant}</b> فور اختيار الكابتن.</div> : null}
          <div className="reasons">
            {(() => {
              const rest = A.RESTAURANTS.find((r) => r.id === o.rid) || {};
              const ranked = available.map((c) => ({ c, dist: A.pointKm(c.x, c.y, rest.area || o.area) })).sort((a, b) => a.dist - b.dist);
              return ranked.map(({ c, dist }, i) => {
                const ld = c.active;
                return (
                  <button key={c.id} className="reason-opt" onClick={() => { onAction(dispatchMode ? "dispatch" : "reassign", o, c); setPicking(false); }}>
                    <Avatar name={c.name} />
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>{c.name} {i === 0 ? <span className="badge b-green" style={{ padding: "1px 8px", fontSize: 11 }}>الأقرب</span> : null}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 700 }}>{c.area} · {ld} طلب نشط · ★ {c.rating}</div>
                    </div>
                    <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                      <div style={{ fontWeight: 900, fontSize: 14 }} className="tnum">{dist} كم</div>
                      <Badge meta={CAP_STATUS[c.status]} dot />
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </Modal>
      ) : null}
    </Drawer>
  );
}

/* ===================== شاشة الطلبات ===================== */
const ORDER_ACTIVE = ["unpaid", "processing", "new", "preparing", "ready", "onway"];
const ORDER_FILTERS = [
  { k: "active", label: "النشطة", dot: "var(--orange)" },
  { k: "unpaid", label: "غير مدفوع", dot: "var(--red)", alert: true },
  { k: "processing", label: "قيد المعالجة", dot: "var(--gold-deep)" },
  { k: "new", label: "جديدة", dot: "var(--blue)" },
  { k: "preparing", label: "قيد التحضير", dot: "var(--cyan)" },
  { k: "ready", label: "جاهزة", dot: "var(--purple)" },
  { k: "onway", label: "جاري التوصيل", dot: "var(--orange)" },
  { k: "delivered", label: "مُسلّمة", dot: "var(--green)" },
  { k: "canceled", label: "ملغاة", dot: "#b3ab97" },
  { k: "all", label: "الكل", dot: "var(--text-faint)" },
];
function OrdersScreen({ orders, search, onOpen, onNewOrder }){
  const [filter, setFilter] = useState("active");
  const [view, setView] = useState("board");
  const counts = {};
  ORDER_FILTERS.forEach((f) => {
    counts[f.k] = f.k === "all" ? orders.length
      : f.k === "active" ? orders.filter((o) => ORDER_ACTIVE.includes(o.status)).length
      : orders.filter((o) => o.status === f.k).length;
  });
  let list = orders.filter((o) =>
    filter === "all" ? true
    : filter === "active" ? ORDER_ACTIVE.includes(o.status)
    : o.status === filter);
  const q = (search || "").trim();
  if (q) list = list.filter((o) => ("#" + o.number).includes(q) || o.customer.includes(q) || o.restaurant.includes(q) || (o.captain || "").includes(q) || o.area.includes(q));
  list = [...list].sort((a, b) => b.createdAt - a.createdAt);

  const lateCount = orders.filter((o) => A.orderSLA(o).level === "late").length;

  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">الطلبات</div><div className="page-sub">مركز العمليات — متابعة مباشرة وتدخّل على كل الطلبات</div></div>
        <div className="head-actions">
          {lateCount > 0 ? <span className="badge b-red"><span className="bd pulse-dot"></span> {lateCount} طلب متأخر</span> : <span className="badge b-green"><span className="bd" style={{ animation: "pulse 1.8s infinite" }}></span> ضمن الوقت</span>}
          <button className="btn btn-gold" onClick={onNewOrder}><Ic.plus s={18} /> إدخال طلب</button>
          <div className="seg">
            <button className={view === "board" ? "on" : ""} onClick={() => setView("board")} title="لوحة"><Ic.cols s={16} /></button>
            <button className={view === "table" ? "on" : ""} onClick={() => setView("table")} title="جدول"><Ic.list s={16} /></button>
          </div>
        </div>
      </div>
      <div className="filterbar">
        {ORDER_FILTERS.map((f) => (
          <button key={f.k} className={"ftab" + (filter === f.k ? " active" : "") + (f.alert && counts[f.k] > 0 && filter !== f.k ? " alert" : "")} onClick={() => setFilter(f.k)}>
            <span className="fdot" style={{ background: f.dot }}></span>{f.label}<span className="fp tnum">{counts[f.k]}</span>
          </button>
        ))}
      </div>

      {view === "board" ? (
        <OrdersBoard orders={q ? list : orders} onOpen={onOpen} />
      ) : (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>الطلب</th><th>المطعم</th><th>الزبون / المنطقة</th><th>الكابتن</th><th>الحالة</th><th>الدفع</th><th>الإجمالي</th><th>التقادُم</th></tr></thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan="8"><div className="empty-row"><div className="ei"><Ic.bag s={30} /></div><p>لا توجد طلبات في هذا التصنيف</p></div></td></tr>
                ) : list.map((o) => (
                  <tr key={o.id} onClick={() => onOpen(o)}>
                    <td className="strong tnum">#{o.number}</td>
                    <td><div className="cell-main"><RestLogo r={{ name: o.restaurant, grad: o.restGrad }} s={36} /><div className="cell-tt"><b>{o.restaurant}</b><small>{o.itemCount} صنف</small></div></div></td>
                    <td><div className="cell-tt"><b>{o.customer}</b><small>{o.area}</small></div></td>
                    <td>{o.captain ? o.captain : <span style={{ color: "var(--text-faint)", fontWeight: 700 }}>—</span>}</td>
                    <td><Badge meta={ORDER_STATUS[o.status]} dot /></td>
                    <td><Badge meta={payBadge(o)} /></td>
                    <td className="strong tnum">{A.money(o.total)}</td>
                    <td><AgePill order={o} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== لوحة Kanban التشغيلية ===================== */
const BOARD_COLS = [
  { k: "processing", label: "قيد المعالجة", dot: "var(--gold-deep)", hint: "اعتماد مالي + تحويل" },
  { k: "new", label: "طلب جديد", dot: "var(--blue)", hint: "بانتظار قبول المطعم" },
  { k: "preparing", label: "قيد التحضير", dot: "var(--cyan)", hint: "المطبخ يجهّز" },
  { k: "ready", label: "جاهز", dot: "var(--purple)", hint: "بانتظار الاستلام" },
  { k: "onway", label: "جاري التوصيل", dot: "var(--orange)", hint: "مع الكابتن" },
];
function BoardCard({ o, onOpen }){
  const sla = A.orderSLA(o);
  return (
    <div className={"bcard" + (sla.level === "late" ? " late" : "")} onClick={() => onOpen(o)}>
      <div className="bcard-top">
        <span className="bcard-num tnum">#{o.number}</span>
        <AgePill order={o} />
      </div>
      <div className="bcard-rest">
        <span className="o-logo" style={{ width: 26, height: 26, borderRadius: 7, background: o.restGrad, display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: 9, flex: "0 0 auto" }}>{(o.restaurant || "").replace(/[^A-Za-z& ]/g, "").split(" ").map((w) => w[0]).join("").slice(0, 2) || "م"}</span>
        <span className="bcard-rn">{o.restaurant}</span>
      </div>
      <div className="bcard-meta">
        <span><Ic.pin s={12} /> {o.area}{o.km != null ? " · " + o.km + " كم" : ""}</span>
        <span className="strong tnum">{A.money(o.total)}</span>
      </div>
      <div className="bcard-foot">
        {o.captain
          ? <span className="bcard-cap"><Ic.bike s={12} /> {o.captain.split(" ")[0]}</span>
          : o.status === "processing"
            ? <span className="bcard-cap need" style={{ color: o.payStatus === "verified" ? "var(--gold-deep)" : "var(--text-faint)" }}>{o.payStatus === "verified" ? "جاهز للتحويل" : "بانتظار الاعتماد"}</span>
            : <span className="bcard-cap need">— بلا كابتن</span>}
        <Badge meta={payBadge(o)} />
      </div>
    </div>
  );
}
function OrdersBoard({ orders, onOpen }){
  return (
    <div className="board">
      {BOARD_COLS.map((col) => {
        const items = orders.filter((o) => o.status === col.k).sort((a, b) => A.orderSLA(b).mins - A.orderSLA(a).mins);
        const late = items.filter((o) => A.orderSLA(o).level === "late").length;
        return (
          <div className="bcol" key={col.k}>
            <div className="bcol-h">
              <span className="bcol-dot" style={{ background: col.dot }}></span>
              <span className="bcol-l">{col.label}</span>
              <span className="bcol-c tnum">{items.length}</span>
            </div>
            <div className="bcol-hint">{late > 0 ? <span style={{ color: "var(--red)", fontWeight: 800 }}>{late} متأخر</span> : col.hint}</div>
            <div className="bcol-body">
              {items.length === 0 ? <div className="bcol-empty">لا طلبات</div> : items.map((o) => <BoardCard key={o.id} o={o} onOpen={onOpen} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===================== إدخال طلب يدوي (الأدمن) ===================== */
function NewOrderModal({ restaurants, customers, settings, onClose, onSubmit }){
  const activeRests = restaurants.filter((r) => ["active", "busy"].includes(r.status));
  const [f, setF] = useState({
    rid: activeRests[0] ? activeRests[0].id : "", custName: "", custPhone: "", area: A.AREAS[0],
    cart: {}, payment: "bankPalestine", note: "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const rest = restaurants.find((r) => r.id === f.rid) || {};
  const menu = (rest.menu) || A.restMenu(f.rid);
  const setQty = (name, price, delta) => setF((p) => {
    const cart = { ...p.cart };
    const cur = cart[name] || { price, qty: 0 };
    const qty = Math.max(0, cur.qty + delta);
    if (qty === 0) delete cart[name]; else cart[name] = { price, qty };
    return { ...p, cart };
  });
  const cartItems = Object.entries(f.cart).map(([name, v]) => ({ name, price: v.price, qty: v.qty }));
  const km = A.zoneKm(rest.area || f.area, f.area);
  const delivery = !settings ? 8
    : settings.deliveryMode === "km" ? Math.round(settings.deliveryBase + km * settings.deliveryPerKm)
    : settings.deliveryMode === "matrix" ? ((settings.deliveryMatrix[f.rid] || {})[f.area] != null ? settings.deliveryMatrix[f.rid][f.area] : A.DELIVERY_DEFAULTS[f.area])
    : settings.deliveryFee;
  const sub = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const total = sub + delivery;
  const valid = f.rid && f.custName.trim() && f.custPhone.trim() && sub > 0;
  // إعادة ضبط السلة عند تبديل المطعم
  const onRest = (rid) => setF((p) => ({ ...p, rid, cart: {} }));
  return (
    <Modal icon="plus" iconTone="b-gold" title="إدخال طلب يدوي" onClose={onClose} wide
      foot={[<button key="x" className="btn btn-line" onClick={onClose}>إلغاء</button>, <button key="s" className="btn btn-gold" disabled={!valid} style={!valid ? { opacity: .5 } : null} onClick={() => valid && onSubmit({ ...f, items: cartItems, subtotal: sub, delivery, total })}>إنشاء الطلب{sub > 0 ? " · " + A.money(total) : ""}</button>]}>
      <div className="notice warn" style={{ marginTop: -4 }}><Ic.note s={18} style={{ color: "var(--gold-deep)" }} /> يُدخَل الطلب بحالة «غير مدفوع» بانتظار الاعتماد المالي ثم التحويل للمطعم.</div>
      <div className="grid-2">
        <div className="field"><label>المطعم</label><select value={f.rid} onChange={(e) => onRest(e.target.value)}>{activeRests.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
        <div className="field"><label>وجهة التوصيل</label><select value={f.area} onChange={(e) => set("area", e.target.value)}>{A.DESTINATIONS.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
        <div className="field"><label>اسم الزبون</label><input value={f.custName} onChange={(e) => set("custName", e.target.value)} placeholder="الاسم" /></div>
        <div className="field"><label>جوال الزبون</label><input value={f.custPhone} onChange={(e) => set("custPhone", e.target.value)} placeholder="05XX-XXX-XXX" style={{ direction: "ltr", textAlign: "right" }} /></div>
      </div>

      <div className="field" style={{ marginBottom: 12 }}><label>منيو {rest.name} — اختر الأصناف</label></div>
      <div className="no-menu">
        {menu.map((sec, si) => (
          <div className="no-cat" key={si}>
            <div className="no-cat-h">{sec.cat}</div>
            {sec.items.map(([name, price], ii) => {
              const qty = f.cart[name] ? f.cart[name].qty : 0;
              return (
                <div className={"no-item" + (qty > 0 ? " on" : "")} key={ii}>
                  <span className="no-n">{name}</span>
                  <span className="no-p tnum">{A.money(price)}</span>
                  {qty > 0 ? (
                    <div className="qstep">
                      <button onClick={() => setQty(name, price, -1)}><Ic.x s={13} /></button>
                      <span className="tnum">{qty}</span>
                      <button onClick={() => setQty(name, price, 1)}><Ic.plus s={13} /></button>
                    </div>
                  ) : <button className="no-add" onClick={() => setQty(name, price, 1)}><Ic.plus s={15} /></button>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="field" style={{ marginBottom: 0 }}><label>طريقة الدفع</label><select value={f.payment} onChange={(e) => set("payment", e.target.value)}>{Object.keys(A.PAY_METHODS).map((k) => <option key={k} value={k}>{A.PAY_METHODS[k].label}</option>)}</select></div>
        <div className="field" style={{ marginBottom: 0 }}><label>ملاحظة (اختياري)</label><input value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="تفاصيل العنوان…" /></div>
      </div>
      <div style={{ marginTop: 16, padding: "13px 16px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 13 }}>
        <div className="sumrow"><span className="muted">قيمة الأصناف ({cartItems.reduce((a, i) => a + i.qty, 0)} صنف)</span><span className="tnum">{A.money(sub)}</span></div>
        <div className="sumrow"><span className="muted">التوصيل ({f.area} · {km} كم)</span><span className="tnum">{A.money(delivery)}</span></div>
        <div className="sumrow tot" style={{ fontSize: 17 }}><span>الإجمالي</span><span className="tnum">{A.money(total)}</span></div>
      </div>
    </Modal>
  );
}

/* ===================== شاشة الكباتن ===================== */
function PwField({ value }){
  const [show, setShow] = useState(false);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="tnum">{show ? (value || "—") : "••••••••"}</span>
      <button onClick={() => setShow((v) => !v)} style={{ color: "var(--text-faint)", display: "inline-grid", placeItems: "center" }} title={show ? "إخفاء" : "إظهار"}><Ic.eye s={16} /></button>
    </span>
  );
}
function CaptainDrawer({ captain, orders, onClose, onAction, onOpenOrder }){
  if (!captain) return null;
  const c = captain;
  const active = orders.filter((o) => o.captainId === c.id && ["onway", "new", "preparing", "ready"].includes(o.status));
  const delivered = orders.filter((o) => o.captainId === c.id && o.status === "delivered");
  const incToday = c.incentive * c.todayTrips;
  const foot = [
    <button key="e" className="btn btn-ink btn-block" onClick={() => onAction("edit-captain", c)}><Ic.pencil s={16} /> تعديل البيانات</button>,
    <button key="m" className="btn btn-line" onClick={() => onAction("contact-cap", c)}><Ic.phone s={16} /> اتصال</button>,
    c.status === "offline"
      ? <button key="p" className="btn btn-line" onClick={onClose}>إغلاق</button>
      : <button key="s" className="btn btn-red-line" onClick={() => onAction("suspend-cap", c)}><Ic.power s={16} /> إيقاف</button>,
  ];
  return (
    <Drawer title={c.name} badge={<span style={{ marginInlineStart: "auto" }}><Badge meta={CAP_STATUS[A.capStatus(c, orders)]} dot /></span>} onClose={onClose} foot={foot}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--surface-3)", border: "2px solid var(--line)", display: "grid", placeItems: "center", color: "var(--text-faint)", fontWeight: 900, fontSize: 21, flex: "0 0 auto", position: "relative" }}>
          {initials(c.name)}
          <span style={{ position: "absolute", bottom: -2, insetInlineEnd: -2, width: 22, height: 22, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--text-faint)" }}><Ic.user s={12} /></span>
        </div>
        <div><div style={{ fontWeight: 900, fontSize: 17 }}>{c.name}</div><div style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 700, marginTop: 2 }}>هوية {c.idNo} · {c.vehicle}</div></div>
      </div>
      <div className="grid-2" style={{ marginBottom: 6 }}>
        <div className="kpi" style={{ padding: 15 }}><div className="kl">توصيلات اليوم</div><div className="kv tnum" style={{ fontSize: 24 }}>{c.todayTrips}</div></div>
        <div className="kpi" style={{ padding: 15 }}><div className="kl">مستحقّات اليوم</div><div className="kv tnum" style={{ fontSize: 24 }}>{A.money(c.todayEarn)}</div></div>
      </div>

      <div className="sec-l">حساب دخول الكابتن</div>
      <div className="kv-row"><span className="k"><Ic.user s={17} /> اسم المستخدم</span><span className="v ltr">{c.username || "—"}</span></div>
      <div className="kv-row"><span className="k"><Ic.shield s={17} /> كلمة المرور</span><span className="v ltr"><PwField value={c.password} /></span></div>

      <div className="sec-l">نظام التوظيف والأجر</div>
      <div className="kv-row"><span className="k"><Ic.wallet s={17} /> نوع التوظيف</span><span className="v"><Badge meta={CAP_PAY[c.payType]} /></span></div>
      {c.payType === "daily"
        ? <div className="kv-row"><span className="k"><Ic.money s={17} /> اليومية</span><span className="v tnum">{A.money(c.dailyWage)} / يوم</span></div>
        : <div className="kv-row"><span className="k"><Ic.money s={17} /> عمولة المنصّة منه</span><span className="v tnum">{c.capCommission > 0 ? c.capCommission + "%" : "بدون عمولة"}</span></div>}
      <div className="kv-row"><span className="k"><Ic.flame s={17} /> حافز لكل طلب</span><span className="v tnum">{c.incentive > 0 ? A.money(c.incentive) : "—"}</span></div>
      {c.incentive > 0 ? <div className="kv-row"><span className="k"><Ic.trend s={17} /> حوافز اليوم</span><span className="v tnum" style={{ color: "var(--green)" }}>+ {A.money(incToday)} ({c.todayTrips} طلب)</span></div> : null}

      <div className="sec-l">حساب استلام المستحقات</div>
      <div className="kv-row"><span className="k"><Ic.wallet s={17} /> الوسيلة</span><span className="v">{A.PAY_METHODS[c.payMethod] ? (c.payMethod === "bankPalestine" ? "حساب " : "محفظة ") + A.PAY_METHODS[c.payMethod].label : "—"}</span></div>
      <div className="kv-row"><span className="k"><Ic.card s={17} /> {c.payMethod === "bankPalestine" ? "رقم الحساب" : "رقم المحفظة"}</span><span className="v ltr">{c.payAccount || "—"}</span></div>

      <div className="sec-l">المعلومات الشخصية</div>
      <div className="kv-row"><span className="k"><Ic.phone s={17} /> الجوال {c.phone2 ? "١" : ""}</span><span className="v ltr">{c.phone}</span></div>
      {c.phone2 ? <div className="kv-row"><span className="k"><Ic.phone s={17} /> الجوال ٢</span><span className="v ltr">{c.phone2}</span></div> : null}
      <div className="kv-row"><span className="k"><Ic.shield s={17} /> رقم الهوية</span><span className="v ltr">{c.idNo}</span></div>
      <div className="kv-row"><span className="k"><Ic.calendar s={17} /> تاريخ الميلاد</span><span className="v ltr">{c.birth}</span></div>
      <div className="kv-row"><span className="k"><Ic.pin s={17} /> عنوان السكن</span><span className="v">{c.address}</span></div>
      <div className="kv-row"><span className="k"><Ic.bike s={17} /> نوع الدراجة</span><span className="v">{c.vehicle}</span></div>
      <div className="kv-row"><span className="k"><Ic.checkCircle s={17} /> إجمالي التوصيلات</span><span className="v tnum">{c.totalTrips.toLocaleString("en-US")}</span></div>

      <div className="sec-l">التقييم والمراجعات</div>
      <Ratings avg={c.rating} total={Math.max(8, Math.round(c.totalTrips * 0.6))} reviews={A.CAP_REVIEWS} onReview={onOpenOrder && delivered.length ? (i) => { const o = delivered[i % delivered.length]; return () => onOpenOrder(o); } : null} />

      <div className="sec-l">الطلبات الحالية ({active.length})</div>
      {active.length === 0 ? (
        <div style={{ color: "var(--text-faint)", fontWeight: 700, fontSize: 14, padding: "4px 0 8px" }}>لا يوجد طلب نشط الآن</div>
      ) : active.map((o) => (
        <div key={o.id} className="kv-row feed-clickable" onClick={onOpenOrder ? () => onOpenOrder(o) : undefined}><span className="k tnum" style={{ fontWeight: 900, color: "var(--text)" }}>#{o.number}</span><span className="v" style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>{o.restaurant} → {o.area} <Ic.arrow s={14} style={{ color: "var(--accent-deep)" }} /></span></div>
      ))}
    </Drawer>
  );
}

const CAP_FILTERS = [{ k: "all", l: "الكل" }, { k: "online", l: "متاح" }, { k: "busy", l: "بتوصيلة" }, { k: "offline", l: "غير متصل" }];
const CAP_PAY_FILTERS = [{ k: "all", l: "كل الأنظمة" }, { k: "daily", l: "موظف" }, { k: "commission", l: "بالنسبة" }];
function CaptainsScreen({ captains, orders, search, onOpen, onAdd }){
  const [payFilter, setPayFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  // أولاً: تصنيف النظام (موظف/بالنسبة). تصنيفات النشاط تُحسب على هذه المجموعة فقط.
  const payCounts = { all: captains.length, daily: captains.filter((c) => c.payType === "daily").length, commission: captains.filter((c) => c.payType === "commission").length };
  const base = captains.filter((c) => payFilter === "all" ? true : c.payType === payFilter);
  const eff = (c) => A.capStatus(c, orders);
  const counts = { all: base.length, online: 0, busy: 0, offline: 0 };
  base.forEach((c) => counts[eff(c)]++);
  let list = base.filter((c) => filter === "all" ? true : eff(c) === filter);
  const q = (search || "").trim();
  if (q) list = list.filter((c) => c.name.includes(q) || c.area.includes(q) || c.phone.includes(q));
  const setPay = (k) => { setPayFilter(k); setFilter("all"); };

  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">الكباتن</div><div className="page-sub">{base.filter((c) => c.status !== "offline").length} نشط الآن · {payCounts.daily} موظف · {payCounts.commission} بالنسبة</div></div>
        <div className="head-actions">
          <div className="seg">
            {CAP_PAY_FILTERS.map((f) => <button key={f.k} className={payFilter === f.k ? "on" : ""} onClick={() => setPay(f.k)}>{f.l}{f.k !== "all" ? " " + payCounts[f.k] : ""}</button>)}
          </div>
          <button className="btn btn-gold" onClick={onAdd}><Ic.plus s={18} /> إضافة كابتن</button>
        </div>
      </div>
      <div className="filterbar">
        {CAP_FILTERS.map((f) => (
          <button key={f.k} className={"ftab" + (filter === f.k ? " active" : "")} onClick={() => setFilter(f.k)}>{f.l}<span className="fp tnum">{counts[f.k]}</span></button>
        ))}
      </div>
      <div className="live-grid">
        {list.map((c) => {
          const st = eff(c);
          const ld = A.capActiveCount(c, orders);
          return (
            <div key={c.id} className="ocard" onClick={() => onOpen(c)}>
              <div className="ocard-strip" style={{ background: CAP_STATUS[st].dot }}></div>
              <div className="ocard-in">
                <div className="orow" style={{ marginBottom: 11 }}>
                  <Avatar name={c.name} />
                  <div className="o-l"><b>{c.name}</b><small>{c.area} · {c.vehicle}</small></div>
                  <Badge meta={CAP_STATUS[st]} dot />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                  <Badge meta={CAP_PAY[c.payType]} />
                  <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 700 }}>{capPayDesc(c)}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center", borderTop: "1px solid var(--line-2)", paddingTop: 11 }}>
                  <div><div style={{ fontSize: 17, fontWeight: 900 }} className="tnum">{c.todayTrips}</div><div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 700 }}>توصيلة</div></div>
                  <div><div style={{ fontSize: 17, fontWeight: 900 }} className="tnum">{A.money(c.todayEarn)}</div><div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 700 }}>اليوم</div></div>
                  <div><div style={{ fontSize: 17, fontWeight: 900, color: "var(--gold-deep)" }} className="tnum">★{c.rating}</div><div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 700 }}>تقييم</div></div>
                </div>
                {ld > 0 ? <div className="o-issue" style={{ background: "var(--orange-soft)", borderColor: "transparent", color: "var(--orange)" }}><Ic.navigation s={15} /> {ld} طلب نشط الآن</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== نموذج كابتن (إضافة/تعديل) ===================== */
function AddCaptainModal({ initial, onClose, onSubmit }){
  const [f, setF] = useState(initial ? {
    name: initial.name, phone: initial.phone, phone2: initial.phone2 || "", idNo: initial.idNo || "", birth: initial.birth && initial.birth !== "—" ? initial.birth : "", address: initial.address || "", area: initial.area, vehicle: initial.vehicle, payType: initial.payType, dailyWage: initial.dailyWage || 70, capCommission: initial.capCommission || 10, incentive: initial.incentive || 0, username: initial.username || "", password: initial.password || "",
  } : { name: "", phone: "", phone2: "", idNo: "", birth: "", address: "", area: A.AREAS[0], vehicle: A.VEHICLES[0], payType: "commission", dailyWage: 70, capCommission: 10, incentive: 1, username: "", password: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && f.phone.trim() && f.idNo.trim();
  const editing = !!initial;
  return (
    <Modal icon="bike" iconTone="b-purple" title={editing ? "تعديل بيانات الكابتن" : "إضافة كابتن جديد"} onClose={onClose} wide
      foot={[<button key="x" className="btn btn-line" onClick={onClose}>إلغاء</button>, <button key="s" className="btn btn-gold" disabled={!valid} style={!valid ? { opacity: .5 } : null} onClick={() => valid && onSubmit(f)}>{editing ? "حفظ التعديلات" : "إضافة الكابتن"}</button>]}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-2)", border: "2px dashed var(--line)", display: "grid", placeItems: "center", color: "var(--text-faint)", flex: "0 0 auto" }}><Ic.user s={26} /></div>
        <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>صورة الكابتن</div><div style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 700 }}>اسحب صورة أو اضغط للرفع (اختياري)</div></div>
      </div>
      <div className="grid-2">
        <div className="field"><label>الاسم الكامل</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="مثال: محمد أحمد" /></div>
        <div className="field"><label>رقم الهوية</label><input value={f.idNo} onChange={(e) => set("idNo", e.target.value)} placeholder="9XXXXXXXX" style={{ direction: "ltr", textAlign: "right" }} /></div>
        <div className="field"><label>الجوال الأول</label><input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0599-000-000" style={{ direction: "ltr", textAlign: "right" }} /></div>
        <div className="field"><label>الجوال الثاني (اختياري)</label><input value={f.phone2} onChange={(e) => set("phone2", e.target.value)} placeholder="05XX-XXX-XXX" style={{ direction: "ltr", textAlign: "right" }} /></div>
        <div className="field"><label>تاريخ الميلاد</label><input type="date" value={f.birth} onChange={(e) => set("birth", e.target.value)} style={{ direction: "ltr", textAlign: "right" }} /></div>
        <div className="field"><label>المنطقة</label><select value={f.area} onChange={(e) => set("area", e.target.value)}>{A.AREAS.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
      </div>
      <div className="field"><label>عنوان السكن</label><input value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="الحي — الشارع، أقرب معلم" /></div>
      <div className="sec-l" style={{ margin: "4px 0 11px" }}>حساب دخول الكابتن (تطبيق الكابتن)</div>
      <div className="grid-2">
        <div className="field"><label>اسم المستخدم</label><input value={f.username} onChange={(e) => set("username", e.target.value)} placeholder="captain.name" style={{ direction: "ltr", textAlign: "right" }} /></div>
        <div className="field"><label>كلمة المرور</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={f.password} onChange={(e) => set("password", e.target.value)} placeholder="كلمة مرور" style={{ direction: "ltr", textAlign: "right", flex: 1 }} />
            <button type="button" className="btn btn-line btn-sm" onClick={() => set("password", "snbl" + Math.floor(1000 + Math.random() * 9000))} title="توليد"><Ic.refresh s={15} /></button>
          </div>
        </div>
      </div>
      <div className="field"><label>نوع الدراجة</label>
        <div style={{ display: "flex", gap: 9 }}>
          {A.VEHICLES.map((v) => <button key={v} className={"reason-opt" + (f.vehicle === v ? " sel" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => set("vehicle", v)}>{v}</button>)}
        </div>
      </div>
      <div className="field">
        <label>نظام الأجر</label>
        <div style={{ display: "flex", gap: 9 }}>
          <button className={"reason-opt" + (f.payType === "commission" ? " sel" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => set("payType", "commission")}>كابتن بالنسبة</button>
          <button className={"reason-opt" + (f.payType === "daily" ? " sel" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => set("payType", "daily")}>كابتن موظف</button>
        </div>
      </div>
      <div className="grid-2">
        {f.payType === "daily"
          ? <div className="field"><label>اليومية (₪)</label><input type="number" value={f.dailyWage} min="0" onChange={(e) => set("dailyWage", Number(e.target.value))} /></div>
          : <div className="field"><label>عمولة المنصّة (٪) — 0 = بدون</label><input type="number" value={f.capCommission} min="0" max="30" onChange={(e) => set("capCommission", Number(e.target.value))} /></div>}
        <div className="field"><label>حافز لكل طلب (₪)</label><input type="number" value={f.incentive} min="0" step="0.5" onChange={(e) => set("incentive", Number(e.target.value))} /></div>
      </div>
    </Modal>
  );
}

/* ===================== الخريطة الحيّة ===================== */
function MapScreen({ captains, orders, onOpenCaptain }){
  const [sel, setSel] = useState(null);
  const activeOrders = orders.filter((o) => ["ready", "onway"].includes(o.status));
  const visible = captains.filter((c) => c.status !== "offline");
  const orderPins = activeOrders.map((o, i) => ({ ...o, x: 18 + ((i * 27) % 64), y: 22 + ((i * 19) % 60) }));
  return (
    <div className="page-in">
      <div className="page-head">
        <div><div className="page-title">الخريطة الحيّة</div><div className="page-sub">مواقع الكباتن والطلبات النشطة — غزة</div></div>
        <div className="head-actions"><span className="badge b-green"><span className="bd" style={{ animation: "pulse 1.8s infinite" }}></span> {visible.length} كابتن متصل</span></div>
      </div>
      <div className="mapwrap">
        <div className="mapview">
          <div className="map-grid"></div>
          <div className="map-roads"></div>
          <div className="map-sea"><span>البحر المتوسط</span></div>
          <span className="map-zone" style={{ insetInlineEnd: "26%", top: "30%" }}>الرمال</span>
          <span className="map-zone" style={{ insetInlineEnd: "44%", top: "56%" }}>تل الهوا</span>
          <span className="map-zone" style={{ insetInlineEnd: "60%", top: "26%" }}>النصر</span>
          <span className="map-zone" style={{ insetInlineEnd: "72%", top: "60%" }}>الصبرة</span>
          <span className="map-zone" style={{ insetInlineEnd: "84%", top: "36%" }}>التفاح</span>
          {orderPins.map((o) => (
            <div key={o.id} className="pin ord" style={{ insetInlineEnd: o.x + "%", top: o.y + "%" }} title={"#" + o.number}>
              <span className="pdot"><Ic.bag s={12} /></span>
              <span className="plab tnum">#{o.number}</span>
            </div>
          ))}
          {visible.map((c) => (
            <div key={c.id} className={"pin cap " + c.status + (sel === c.id ? " sel" : "")} style={{ insetInlineEnd: c.x + "%", top: c.y + "%" }} onClick={() => setSel(c.id)}>
              {c.status === "busy" ? <span className="pulse"></span> : null}
              <span className="pdot" style={sel === c.id ? { outline: "3px solid var(--gold)", outlineOffset: 2 } : null}><Ic.bike s={14} /></span>
              <span className="plab" style={{ opacity: sel === c.id ? 1 : undefined }}>{c.name.split(" ")[0]}</span>
            </div>
          ))}
          <div className="map-legend">
            <div className="mlg"><i style={{ background: "var(--green)" }}></i> كابتن متاح</div>
            <div className="mlg"><i style={{ background: "var(--purple)" }}></i> كابتن بتوصيلة</div>
            <div className="mlg"><i style={{ background: "var(--gold)" }}></i> طلب نشط</div>
          </div>
        </div>
        <div className="map-side">
          {visible.map((c) => {
            const ld = orders.filter((o) => o.captainId === c.id && ["onway", "new", "preparing", "ready"].includes(o.status)).length;
            return (
              <div key={c.id} className={"mside-cap" + (sel === c.id ? " act" : "")} onClick={() => setSel(c.id)} onDoubleClick={() => onOpenCaptain(c)}>
                <span className="cell-logo" style={{ width: 40, height: 40, background: CAP_STATUS[A.capStatus(c, orders)].dot, color: "#fff" }}><Ic.bike s={18} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{c.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 700 }}>{c.area} · {ld > 0 ? ld + " طلب نشط" : "متاح"}</div>
                </div>
                <Badge meta={CAP_STATUS[A.capStatus(c, orders)]} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OrderDrawer, OrdersScreen, OrdersBoard, NewOrderModal, CaptainsScreen, CaptainDrawer, AddCaptainModal, MapScreen });
