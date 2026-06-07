/* ============================================================
   الشاشات — سنبل
   ============================================================ */

/* ===================== لوحة الطلبات (3 أعمدة) ===================== */
function OrdersBoard({ orders, onOpen, onAction }){
  const cols = [
    { k: "new", title: "طلبات جديدة", dot: "var(--gold)", empty: "ما في طلبات جديدة حالياً", ico: <Ic.bell s={28} /> },
    { k: "preparing", title: "قيد التحضير", dot: "var(--blue)", empty: "لا يوجد طلبات تحت التحضير", ico: <Ic.coffee s={28} /> },
    { k: "ready", title: "جاهزة للاستلام", dot: "var(--green)", empty: "لا يوجد طلبات جاهزة", ico: <Ic.truck s={28} /> },
  ];
  return (
    <div className="board">
      {cols.map((c) => {
        const list = orders
          .filter((o) => o.status === c.k)
          .sort((a, b) => a.createdAt - b.createdAt);
        return (
          <div className="col" data-k={c.k} key={c.k}>
            <div className="col-head">
              <span className="col-dot" style={{ background: c.dot }}></span>
              <span className="col-title">{c.title}</span>
              <span className="col-count tnum">{list.length}</span>
            </div>
            <div className="col-body">
              {list.length === 0 ? (
                <div className="col-empty">
                  <div className="ico">{c.ico}</div>
                  <p>{c.empty}</p>
                </div>
              ) : (
                list.map((o) => (
                  <OrderCard key={o.id} order={o} onOpen={onOpen} onAction={onAction} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===================== شبكة طلبات بحالة واحدة ===================== */
function OrderGrid({ orders, status, onOpen, onAction }){
  const empties = {
    new: { ico: <Ic.bell s={30} />, t: "ما في طلبات جديدة" },
    preparing: { ico: <Ic.coffee s={30} />, t: "لا يوجد طلبات قيد التحضير" },
    ready: { ico: <Ic.truck s={30} />, t: "لا يوجد طلبات جاهزة" },
    delivered: { ico: <Ic.checkCircle s={30} />, t: "لا يوجد طلبات مُسلّمة بعد" },
    rejected: { ico: <Ic.x s={30} />, t: "لا يوجد طلبات مرفوضة" },
  };
  const sorted = [...orders].sort((a, b) =>
    status === "delivered" ? (b.deliveredAt || 0) - (a.deliveredAt || 0)
    : status === "rejected" ? (b.rejectedAt || 0) - (a.rejectedAt || 0)
    : a.createdAt - b.createdAt);
  const e = empties[status] || empties.new;
  return (
    <div className="ogrid">
      {sorted.length === 0 ? (
        <div className="col-empty"><div className="ico">{e.ico}</div><p>{e.t}</p></div>
      ) : sorted.map((o) => (
        <OrderCard key={o.id} order={o} onOpen={onOpen} onAction={onAction} />
      ))}
    </div>
  );
}

/* ===================== عرض الطلبات (بحث + تاريخ + تبويبات) ===================== */
function ymd(ts){
  const d = new Date(ts);
  const p = (n) => (n < 10 ? "0" + n : "" + n);
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}
function prettyDate(str){
  const [y, m, dd] = str.split("-").map(Number);
  const months = ["كانون الثاني","شباط","آذار","نيسان","أيار","حزيران","تموز","آب","أيلول","تشرين الأول","تشرين الثاني","كانون الأول"];
  return dd + " " + months[m - 1] + " " + y;
}

function OrdersView({ orders, onOpen, onAction }){
  const [f, setF] = useState("all");
  const [q, setQ] = useState("");

  const query = q.trim();
  const filtered = orders.filter((o) => {
    if (query){
      const inName = o.customer.name.includes(query);
      const inNum = ("" + o.number).includes(query);
      const inItem = o.items.some((it) => it.name.includes(query));
      if (!inName && !inNum && !inItem) return false;
    }
    return true;
  });

  const c = {
    all: filtered.filter((o) => ["new", "preparing", "ready"].includes(o.status)).length,
    new: filtered.filter((o) => o.status === "new").length,
    preparing: filtered.filter((o) => o.status === "preparing").length,
    ready: filtered.filter((o) => o.status === "ready").length,
    delivered: filtered.filter((o) => o.status === "delivered").length,
    rejected: filtered.filter((o) => o.status === "rejected").length,
  };
  const tabs = [
    { k: "all", label: "الكل", dot: null },
    { k: "new", label: "جديد", dot: "var(--gold)" },
    { k: "preparing", label: "قيد التحضير", dot: "var(--blue)" },
    { k: "ready", label: "جاهز للاستلام", dot: "var(--green)" },
    { k: "delivered", label: "تم التسليم", dot: "#bcb4a2" },
    { k: "rejected", label: "مرفوض", dot: "var(--red)" },
  ];

  const active = query;
  const shownCount = f === "all" ? c.all : c[f];

  return (
    <div className="ordersview">
      <div className="ordertools">
        <div className="ot-search">
          <Ic.search s={19} style={{ color: "var(--text-faint)", flex: "0 0 auto" }} />
          <input placeholder="ابحث باسم الزبون أو الوجبة أو رقم الطلب…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button className="clr" onClick={() => setQ("")} title="مسح"><Ic.x s={15} /></button>}
        </div>
        <span className="ot-count tnum">{shownCount} {shownCount === 1 ? "طلب" : "طلب"}{active ? " · نتيجة البحث" : ""}</span>
      </div>

      <div className="filterbar">
        {tabs.map((t) => (
          <button key={t.k}
            className={"ftab" + (f === t.k ? " active" : "") + (t.k === "new" && c.new > 0 ? " has-alert" : "")}
            data-k={t.k}
            onClick={() => setF(t.k)}>
            {t.dot ? <span className="fdot" style={{ background: t.dot }}></span> : <Ic.grid s={17} />}
            {t.label}
            <span className="fp tnum">{c[t.k]}</span>
          </button>
        ))}
      </div>

      {f === "all"
        ? <OrdersBoard orders={filtered} onOpen={onOpen} onAction={onAction} />
        : <OrderGrid orders={filtered.filter((o) => o.status === f)} status={f} onOpen={onOpen} onAction={onAction} />}
    </div>
  );
}

/* ===================== المنبثقة: طلب جديد ===================== */
const PREP_OPTS = [
  { v: 10, l: "سريع" },
  { v: 15, l: "" },
  { v: 20, l: "عادي" },
  { v: 30, l: "مزدحم" },
];

function NewOrderModal({ order, onAccept, onReject, muted, onToggleMute, defaultPrep, onDismiss }){
  const [prep, setPrep] = useState(defaultPrep || 20);
  useNow(true);
  const count = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="overlay" onClick={onDismiss}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="newbell"><Ic.bell s={28} /></div>
          <div>
            <div className="h-t">طلب جديد وارد</div>
            <div className="h-n">#{order.number}</div>
          </div>
          <button className={"icon-btn modal-mute" + (muted ? " muted" : "")} onClick={onToggleMute}
            title={muted ? "تشغيل الصوت" : "كتم الصوت"}>
            {muted ? <Ic.bellOff s={20} /> : <Ic.bell s={20} />}
          </button>
        </div>

        <div className="modal-body">
          <div className="mrow">
            <div className="mi"><Ic.user s={19} /></div>
            <div className="ml">
              <div className="k">الزبون</div>
              <div className="v">{order.customer.name} <span style={{ color: "var(--text-faint)", fontWeight: 700, fontSize: 14 }} className="tnum">· {order.customer.phone}</span></div>
            </div>
          </div>
          <div className="mrow">
            <div className="mi"><Ic.pin s={19} /></div>
            <div className="ml">
              <div className="k">عنوان التوصيل</div>
              <div className="v" style={{ fontSize: 15.5, fontWeight: 700 }}>{order.customer.address}</div>
            </div>
          </div>

          <div className="mitems">
            {order.items.map((it, i) => (
              <div className="oitem" key={i}>
                <span className="q tnum">×{it.qty}</span>
                <span className="nm" style={{ flex: 1 }}>
                  {it.name}
                  {it.mods && it.mods.length > 0 && <span className="mod"> — {it.mods.join("، ")}</span>}
                </span>
                <span className="tnum" style={{ fontWeight: 800, color: "var(--text-soft)" }}>{S.money(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          {order.note && (
            <div className="onote" style={{ marginTop: 12 }}>
              <Ic.note s={16} style={{ flex: "0 0 auto", marginTop: 1 }} />
              <span><b>ملاحظة الزبون:</b> {order.note}</span>
            </div>
          )}

          <div className="ocard-foot" style={{ marginTop: 16 }}>
            <div className="ototal">
              <small style={{ fontSize: 12 }}>{count} صنف</small>
              <b className="tnum" style={{ fontSize: 22 }}>{S.money(order.subtotal)}</b>
            </div>
            <PayTag payment={order.payment} />
          </div>

          <div className="prep-pick">
            <div className="lbl"><Ic.clock s={17} /> وقت التحضير التقديري</div>
            <div className="prep-opts">
              {PREP_OPTS.map((p) => (
                <button key={p.v} className={"prep-opt" + (prep === p.v ? " sel" : "")}
                  onClick={() => setPrep(p.v)}>
                  <span className="tnum">{p.v}</span>
                  <small>{p.l || "دقيقة"}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-red-line" onClick={() => onReject(order)}>
            <Ic.x s={20} /> رفض
          </button>
          <button className="btn btn-gold btn-accept" onClick={() => onAccept(order, prep)}>
            <Ic.check s={21} /> قبول الطلب · {prep} دقيقة
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== لوحة تفاصيل الطلب ===================== */
function OrderDrawer({ order, onClose, onAction }){
  useNow(true);
  if (!order) return null;
  const count = order.items.reduce((s, i) => s + i.qty, 0);

  const rejected = order.status === "rejected";
  const steps = rejected ? [
    { k: "new", label: "وصل الطلب", time: order.createdAt },
    { k: "rejected", label: "تم رفض الطلب", time: order.rejectedAt },
  ] : [
    { k: "new", label: "وصل الطلب", time: order.createdAt },
    { k: "preparing", label: "قيد التحضير", time: order.acceptedAt },
    { k: "ready", label: "جاهز للاستلام", time: order.readyAt },
    { k: "delivered", label: "تسليم للكابتن", time: order.status === "delivered" ? order.deliveredAt : null },
  ];
  const order_rank = { new: 0, preparing: 1, ready: 2, delivered: 3 };
  // أي مرحلة لها وقت مسجّل = مكتملة (خضراء)؛ والذهبي للمرحلة التالية المنتظرة فقط.
  const goldIdx = rejected ? -1 : steps.findIndex((s) => !s.time);

  function fmtTime(ts){
    if (!ts) return "—";
    const d = new Date(ts);
    let h = d.getHours(); const m = d.getMinutes();
    const ap = h >= 12 ? "م" : "ص"; h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }
  function fmtDur(a, b){
    if (!a || !b) return null;
    const mins = Math.round((b - a) / 60000);
    if (mins < 1) return "أقل من دقيقة";
    if (mins === 1) return "دقيقة";
    if (mins === 2) return "دقيقتين";
    if (mins < 11) return mins + " دقائق";
    return mins + " دقيقة";
  }
  const durLabels = [null, "استغرق قبوله", "مدة التحضير", "انتظار الكابتن"];

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className="drawer">
        <div className="drawer-head">
          <Avatar name={order.customer.name} size={48} />
          <div style={{ flex: 1 }}>
            <div className="dn">#{order.number}</div>
            <div style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 700 }}>{order.customer.name}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Ic.x s={18} /></button>
        </div>

        <div className="drawer-body">
          {rejected && order.rejectReason && (
            <div className="oreason" style={{ marginTop: 0, marginBottom: 18, fontSize: 14.5, padding: "12px 14px" }}>
              <Ic.x s={16} style={{ flex: "0 0 auto", marginTop: 1 }} />
              <span><b>سبب الرفض:</b> {order.rejectReason}</span>
            </div>
          )}
          <div className="sec-l">معلومات الزبون</div>
          <div className="mrow" style={{ paddingTop: 0 }}>
            <div className="mi"><Ic.phone s={18} /></div>
            <div className="ml"><div className="k">رقم الهاتف</div><div className="v tnum" style={{ fontSize: 16 }}>{order.customer.phone}</div></div>
          </div>
          <div className="mrow">
            <div className="mi"><Ic.pin s={18} /></div>
            <div className="ml"><div className="k">العنوان</div><div className="v" style={{ fontSize: 15.5, fontWeight: 700 }}>{order.customer.address}</div></div>
          </div>

          {order.note && (
            <div className="onote" style={{ marginTop: 4 }}>
              <Ic.note s={16} style={{ flex: "0 0 auto", marginTop: 1 }} />
              <span>{order.note}</span>
            </div>
          )}

          <div className="sec-l">الأصناف ({count})</div>
          <div className="ditems">
            {order.items.map((it, i) => (
              <div className="ditem" key={i}>
                <span className="q tnum">{it.qty}×</span>
                <div className="ditem-main">
                  <span className="nm">{it.name}</span>
                  {it.mods && it.mods.length > 0 && <span className="mod">{it.mods.join("، ")}</span>}
                </div>
                <span className="pr tnum">{S.money(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="sumrow tot"><span>إجمالي الأصناف</span><span className="tnum">{S.money(order.subtotal)}</span></div>
            <div style={{ marginTop: 10 }}><PayTag payment={order.payment} /></div>
          </div>

          <div className="sec-l">تفاصيل أوقات الطلب</div>
          <div className="timeline">
            {steps.map((s2, i) => {
              const hasTime = !!s2.time;
              const isRej = s2.k === "rejected";
              const done = hasTime && !isRej;
              const isCur = (i === goldIdx) || (isRej && hasTime);
              const prevTime = i > 0 ? steps[i - 1].time : null;
              const dur = hasTime && prevTime && durLabels[i] ? fmtDur(prevTime, s2.time) : null;
              return (
                <div className={"tl " + (done ? "done" : isCur ? "cur" : "") + (isRej ? " tl-rej" : "")} key={s2.k}>
                  <div className="tl-mk">
                    <div className="tl-dot"></div>
                    {i < steps.length - 1 && <div className="tl-line"></div>}
                  </div>
                  <div className="tl-c">
                    <div className="tl-k">{s2.label}</div>
                    <div className="tl-t tnum">{hasTime ? fmtTime(s2.time) : (i === goldIdx ? "بانتظار" : "—")}</div>
                    {dur && <div className="tl-dur"><Ic.clock s={12} /> {durLabels[i]} · {dur}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="drawer-foot">
          {order.status === "new" && (
            <button className="btn btn-gold btn-block btn-lg" onClick={() => onAction(order, "open-accept")}>
              <Ic.check s={20} /> قبول الطلب
            </button>
          )}
          {order.status === "preparing" && (
            <button className="btn btn-green btn-block btn-lg" onClick={() => onAction(order, "ready")}>
              <Ic.check s={20} /> جاهز للاستلام
            </button>
          )}
          {order.status === "ready" && (
            <button className="btn btn-ink btn-block btn-lg" onClick={() => onAction(order, "delivered")}>
              <Ic.truck s={20} /> سلّمته للكابتن
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ===================== شاشة المنيو ===================== */
function MenuScreen({ menu, onToggle, onEdit, onAdd, onAddCategory, onEditCategory, onDeleteCategory }){
  const [q, setQ] = useState("");
  const totalItems = menu.reduce((s, c) => s + c.items.length, 0);
  const offCount = menu.reduce((s, c) => s + c.items.filter((i) => !i.available).length, 0);
  const query = q.trim();

  return (
    <div className="page">
      <div className="page-in">
        <div className="page-head">
          <div>
            <div className="page-title">إدارة المنيو</div>
            <div className="page-sub">
              {menu.length} تصنيف · {totalItems} صنف · {offCount > 0
                ? <b style={{ color: "var(--red)" }}>{offCount} صنف نافذ حالياً</b>
                : "كل الأصناف متوفّرة"}
            </div>
          </div>
          <div className="menu-head-actions">
            <div className="search">
              <Ic.search s={19} style={{ color: "var(--text-faint)" }} />
              <input placeholder="ابحث عن صنف…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <button className="btn-addcat" onClick={onAddCategory}>
              <Ic.plus s={17} /> تصنيف جديد
            </button>
          </div>
        </div>

        {menu.map((cat) => {
          const items = cat.items.filter((i) => i.name.includes(query));
          if (query && items.length === 0) return null;
          return (
            <div className="mcat" key={cat.cat}>
              <div className="mcat-h">
                <span className="t">{cat.cat}</span>
                <span className="c tnum">{cat.items.length}</span>
                <div className="cat-acts">
                  <button className="mcat-add" onClick={() => onAdd(cat.cat)}>
                    <Ic.plus s={15} /> إضافة صنف
                  </button>
                  <button className="cat-ibtn" onClick={() => onEditCategory(cat.cat)} title="تعديل اسم التصنيف">
                    <Ic.pencil s={16} />
                  </button>
                  <button className="cat-ibtn danger" onClick={() => onDeleteCategory(cat.cat)} title="حذف التصنيف">
                    <Ic.trash s={16} />
                  </button>
                </div>
              </div>
              {items.length === 0 ? (
                <div className="col-empty" style={{ margin: "4px 0" }}>
                  <p>لا يوجد أصناف في هذا التصنيف — اضغط «إضافة صنف»</p>
                </div>
              ) : (
                <div className="mlist">
                  {items.map((it) => (
                    <div className={"mitem" + (it.available ? "" : " off")} key={it.id}>
                      <div className="mi-thumb">
                        {it.image ? <img src={it.image} alt="" /> : <Ic.image s={18} />}
                      </div>
                      <div className="mi-main">
                        <span className="mi-name">{it.name}</span>
                        {(it.desc || (it.optionGroups && it.optionGroups.length > 0)) && (
                          <span className="mi-meta">
                            {it.optionGroups && it.optionGroups.length > 0 && <span className="mi-badge"><Ic.list s={12} /> {it.optionGroups.length} مجموعة خيارات</span>}
                            {it.desc && <span className="mi-desc">{it.desc}</span>}
                          </span>
                        )}
                      </div>
                      <span className="mi-price tnum">{S.money(it.price)}</span>
                      <button className="mi-edit" onClick={() => onEdit(cat.cat, it)} title="تعديل">
                        <Ic.pencil s={17} />
                      </button>
                      <button className={"av-toggle" + (it.available ? " on" : "")}
                        onClick={() => onToggle(cat.cat, it.id)}>
                        <span className={"av-state " + (it.available ? "on" : "offc")}>
                          {it.available ? "متوفر" : "نفذ"}
                        </span>
                        <span className="sw2"></span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== شاشة ملخص اليوم ===================== */
function SummaryScreen({ session, menu }){
  const base = S.TODAY_BASE;
  const completed = base.completed + session.delivered;
  const revenue = base.revenue + session.revenue;
  const rejected = base.rejected + session.rejected;

  const stats = [
    { ico: <Ic.bag s={22} />, g: "g1", v: completed, k: "طلب مكتمل اليوم" },
    { ico: <Ic.money s={22} />, g: "g2", v: S.money(revenue), k: "إجمالي المبيعات", small: true },
    { ico: <Ic.clock s={22} />, g: "g3", v: base.avgPrep + " د", k: "متوسط وقت التحضير" },
    { ico: <Ic.x s={22} />, g: "g4", v: rejected, k: "طلبات مرفوضة" },
  ];

  const topItems = [
    { name: "شيش طاووق", count: 28 },
    { name: "وجبة شاورما لحمة", count: 24 },
    { name: "مشاوي مشكّل", count: 19 },
    { name: "حمص", count: 17 },
    { name: "بطاطا مقلية", count: 14 },
  ];
  const max = topItems[0].count;

  return (
    <div className="page">
      <div className="page-in">
        <div className="page-head">
          <div>
            <div className="page-title">ملخص اليوم</div>
            <div className="page-sub">الخميس · 6 حزيران 2026</div>
          </div>
        </div>

        <div className="stats">
          {stats.map((s2, i) => (
            <div className="stat" key={i}>
              <div className={"si " + s2.g}>{s2.ico}</div>
              <div className={"sv tnum" + (s2.small ? "" : "")} style={{ fontSize: s2.small ? 22 : 32 }}>{s2.v}</div>
              <div className="sk">{s2.k}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div className="panel">
            <h3 className="panel-t">الأصناف الأكثر طلباً</h3>
            <div className="toplist">
              {topItems.map((t, i) => (
                <div className="tr" key={i}>
                  <span className="rk tnum">{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="nm">{t.name}</span>
                      <span className="ct tnum">{t.count} طلب</span>
                    </div>
                    <div className="bar" style={{ width: (t.count / max * 100) + "%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-t">نظرة سريعة</h3>
            <div className="sumrow"><span className="muted">طلبات نقدية</span><span className="tnum" style={{ fontWeight: 800 }}>{Math.round(completed * 0.6)}</span></div>
            <div className="sumrow"><span className="muted">طلبات مدفوعة أونلاين</span><span className="tnum" style={{ fontWeight: 800 }}>{Math.round(completed * 0.4)}</span></div>
            <div className="sumrow"><span className="muted">متوسط قيمة الطلب</span><span className="tnum" style={{ fontWeight: 800 }}>{S.money(Math.round(revenue / completed))}</span></div>
            <div className="sumrow"><span className="muted">أصناف نافذة حالياً</span><span className="tnum" style={{ fontWeight: 800, color: "var(--red)" }}>{menu.reduce((s, c) => s + c.items.filter((i) => !i.available).length, 0)}</span></div>
            <div className="sumrow tot"><span>صافي اليوم</span><span className="tnum">{S.money(revenue)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== محرّر صنف المنيو ===================== */
function ItemEditorModal({ draft, categories, onSave, onDelete, onClose }){
  const isNew = draft.isNew;
  const [name, setName] = useState(draft.name || "");
  const [price, setPrice] = useState(draft.price || "");
  const [cat, setCat] = useState(draft.cat);
  const [available, setAvailable] = useState(draft.available !== false);
  const [image, setImage] = useState(draft.image || "");
  const [desc, setDesc] = useState(draft.desc || "");
  const [groups, setGroups] = useState(() =>
    (draft.optionGroups || []).map((g) => ({
      id: g.id || ("g" + Math.random().toString(36).slice(2, 8)),
      name: g.name || "",
      type: g.type || "single",
      choices: (g.choices || []).map((c) => ({
        id: c.id || ("c" + Math.random().toString(36).slice(2, 8)),
        name: c.name || "", price: c.price || 0,
      })),
    })));
  const fileRef = useRef(null);
  const valid = name.trim().length > 0 && Number(price) > 0;
  const suffixStyle = { insetInlineEnd: 15, insetInlineStart: "auto" };
  const gid = () => "g" + Math.random().toString(36).slice(2, 8);
  const cid = () => "c" + Math.random().toString(36).slice(2, 8);

  function pickImage(e){
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(f);
  }
  function addGroup(){
    setGroups((g) => [...g, { id: gid(), name: "", type: "single", choices: [{ id: cid(), name: "", price: 0 }] }]);
  }
  function updGroup(id, patch){ setGroups((g) => g.map((x) => x.id === id ? { ...x, ...patch } : x)); }
  function delGroup(id){ setGroups((g) => g.filter((x) => x.id !== id)); }
  function addChoice(gId){ setGroups((g) => g.map((x) => x.id === gId ? { ...x, choices: [...x.choices, { id: cid(), name: "", price: 0 }] } : x)); }
  function updChoice(gId, cId, patch){ setGroups((g) => g.map((x) => x.id !== gId ? x : { ...x, choices: x.choices.map((c) => c.id === cId ? { ...c, ...patch } : c) })); }
  function delChoice(gId, cId){ setGroups((g) => g.map((x) => x.id !== gId ? x : { ...x, choices: x.choices.filter((c) => c.id !== cId) })); }

  function handleSave(){
    if (!valid) return;
    const cleanGroups = groups
      .map((g) => ({
        id: g.id, name: g.name.trim(), type: g.type,
        choices: g.choices.filter((c) => c.name.trim()).map((c) => ({ id: c.id, name: c.name.trim(), price: Number(c.price) || 0 })),
      }))
      .filter((g) => g.name && g.choices.length > 0);
    onSave({ name: name.trim(), price: Number(price), cat, available, image, desc: desc.trim(), optionGroups: cleanGroups });
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ width: "min(540px,94vw)" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="newbell" style={{ animation: "none" }}><Ic.list s={26} /></div>
          <div>
            <div className="h-t">{isNew ? "إضافة صنف" : "تعديل صنف"}</div>
            <div className="h-n" style={{ fontSize: 22 }}>{isNew ? "صنف جديد" : (name || "—")}</div>
          </div>
        </div>
        <div className="modal-body">
          {/* الصورة */}
          <div className="field">
            <label>صورة المنتج</label>
            <div className="img-upload">
              <div className="img-drop" onClick={() => fileRef.current && fileRef.current.click()}>
                {image
                  ? <img src={image} alt="" />
                  : <div className="ph"><div className="pi"><Ic.image s={26} /></div><span>اضغط للرفع</span></div>}
              </div>
              <div className="img-side">
                <div className="hint">تظهر هذه الصورة للزبون في التطبيق. يُفضّل صورة واضحة ومربّعة.</div>
                <div className="img-btns">
                  <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current && fileRef.current.click()}>
                    <Ic.image s={16} /> {image ? "تغيير" : "رفع صورة"}
                  </button>
                  {image && <button className="btn btn-red-line btn-sm" onClick={() => setImage("")}><Ic.trash s={15} /> إزالة</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} style={{ display: "none" }} />
              </div>
            </div>
          </div>

          <div className="field">
            <label>اسم الصنف</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: شيش طاووق" autoFocus />
          </div>

          <div className="field">
            <label>الوصف</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="وصف مختصر يظهر للزبون — مثال: صدر دجاج متبّل بالثوم والليمون، يُقدّم مع خبز وثوم وبطاطا." />
          </div>

          <div className="field">
            <label>السعر الأساسي</label>
            <div className="suffix-wrap">
              <input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" style={{ paddingInlineEnd: 54 }} />
              <span className="suffix" style={suffixStyle}>{S.CURRENCY}</span>
            </div>
          </div>

          <div className="field">
            <label>التصنيف</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="field">
            <label>الحالة</label>
            <div className="av-pick">
              <button className={available ? "sel-on" : ""} onClick={() => setAvailable(true)}>متوفر</button>
              <button className={!available ? "sel-off" : ""} onClick={() => setAvailable(false)}>نفذ</button>
            </div>
          </div>

          {/* مجموعات الخيارات */}
          <div className="field">
            <label>خيارات الصنف</label>
            <div className="field-sub">مثل: الحجم، الإضافات، درجة الاستواء… تظهر للزبون عند الطلب. اترك السعر صفراً إن كان الخيار مجانياً.</div>
            <div className="opt-groups">
              {groups.map((g) => (
                <div className="opt-group" key={g.id}>
                  <div className="opt-group-head">
                    <input value={g.name} onChange={(e) => updGroup(g.id, { name: e.target.value })} placeholder="اسم المجموعة (مثال: الحجم)" />
                    <div className="opt-type">
                      <button className={g.type === "single" ? "on" : ""} onClick={() => updGroup(g.id, { type: "single" })}>اختيار واحد</button>
                      <button className={g.type === "multi" ? "on" : ""} onClick={() => updGroup(g.id, { type: "multi" })}>متعدد</button>
                    </div>
                    <button className="opt-del" onClick={() => delGroup(g.id)} title="حذف المجموعة"><Ic.trash s={16} /></button>
                  </div>
                  {g.choices.map((c) => (
                    <div className="opt-choice" key={c.id}>
                      <input className="oc-name" value={c.name} onChange={(e) => updChoice(g.id, c.id, { name: e.target.value })} placeholder="اسم الخيار" />
                      <div className="oc-price-wrap">
                        <input className="oc-price" type="number" inputMode="numeric" value={c.price} onChange={(e) => updChoice(g.id, c.id, { price: e.target.value })} placeholder="0" />
                        <span className="oc-suffix">+{S.CURRENCY}</span>
                      </div>
                      <button className="oc-del" onClick={() => delChoice(g.id, c.id)} title="حذف الخيار"><Ic.x s={15} /></button>
                    </div>
                  ))}
                  <button className="opt-add-choice" onClick={() => addChoice(g.id)}><Ic.plus s={14} /> إضافة خيار</button>
                </div>
              ))}
              <button className="opt-add-group" onClick={addGroup}><Ic.plus s={16} /> إضافة مجموعة خيارات</button>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          {!isNew && <button className="btn btn-red-line" onClick={onDelete}><Ic.trash s={18} /> حذف</button>}
          <button className="btn btn-line" onClick={onClose}>إلغاء</button>
          <button className="btn btn-gold btn-accept" disabled={!valid} style={{ opacity: valid ? 1 : 0.5 }}
            onClick={handleSave}>
            <Ic.check s={19} /> حفظ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== الإعدادات ===================== */
function SettingsScreen({ settings, onChange }){
  const set = (patch) => onChange(patch);
  const setHour = (day, field, val) =>
    onChange({ hours: { ...settings.hours, [day]: { ...settings.hours[day], [field]: val } } });
  const suffixStyle = { insetInlineEnd: 15, insetInlineStart: "auto" };

  return (
    <div className="page">
      <div className="page-in" style={{ maxWidth: 840 }}>
        <div className="page-head">
          <div>
            <div className="page-title">الإعدادات</div>
            <div className="page-sub">معلومات المطعم ومواعيد العمل</div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 18 }}>
          <h3 className="panel-t"><Ic.store s={20} style={{ verticalAlign: -4, marginInlineEnd: 8 }} /> معلومات المطعم</h3>
          <div className="set-grid">
            <div className="field"><label>اسم المطعم</label>
              <input value={settings.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div className="field"><label>الفرع</label>
              <input value={settings.branch} onChange={(e) => set({ branch: e.target.value })} /></div>
            <div className="field"><label>رقم الهاتف</label>
              <input value={settings.phone} onChange={(e) => set({ phone: e.target.value })} /></div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 18 }}>
          <h3 className="panel-t"><Ic.clock s={20} style={{ verticalAlign: -4, marginInlineEnd: 8 }} /> مواعيد العمل</h3>
          <div className="hours">
            {S.DAYS.map((d) => {
              const h = settings.hours[d.k];
              return (
                <div className={"hours-row" + (h.on ? "" : " closed")} key={d.k}>
                  <span className="hd">{d.label}</span>
                  <button className={"av-toggle" + (h.on ? " on" : "")} onClick={() => setHour(d.k, "on", !h.on)}>
                    <span className={"av-state " + (h.on ? "on" : "offc")}>{h.on ? "مفتوح" : "مغلق"}</span>
                    <span className="sw2"></span>
                  </button>
                  <div className="htimes">
                    <span className="ht-l">من</span>
                    <input type="time" value={h.open} onChange={(e) => setHour(d.k, "open", e.target.value)} />
                    <span className="ht-l">إلى</span>
                    <input type="time" value={h.close} onChange={(e) => setHour(d.k, "close", e.target.value)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-t"><Ic.bag s={20} style={{ verticalAlign: -4, marginInlineEnd: 8 }} /> إعدادات الطلبات</h3>
          <div className="set-grid">
            <div className="field"><label>الحد الأدنى للطلب</label>
              <div className="suffix-wrap">
                <input type="number" value={settings.minOrder} onChange={(e) => set({ minOrder: Number(e.target.value) })} style={{ paddingInlineEnd: 54 }} />
                <span className="suffix" style={suffixStyle}>{S.CURRENCY}</span>
              </div></div>
            <div className="field"><label>وقت التحضير الافتراضي</label>
              <div className="suffix-wrap">
                <input type="number" value={settings.defaultPrep} onChange={(e) => set({ defaultPrep: Number(e.target.value) })} style={{ paddingInlineEnd: 54 }} />
                <span className="suffix" style={suffixStyle}>دقيقة</span>
              </div></div>
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>صوت التنبيه للطلبات الجديدة</label>
            <div className="av-pick">
              <button className={settings.alertSound ? "sel-on" : ""} onClick={() => set({ alertSound: true })}>مُفعّل</button>
              <button className={!settings.alertSound ? "sel-off" : ""} onClick={() => set({ alertSound: false })}>مكتوم</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== محرّر التصنيف (إضافة/تعديل) ===================== */
function CategoryEditorModal({ draft, existing, onSave, onClose }){
  const isNew = draft.isNew;
  const [name, setName] = useState(draft.name || "");
  const trimmed = name.trim();
  const dupe = existing.some((c) => c !== draft.name && c === trimmed);
  const valid = trimmed.length > 0 && !dupe;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ width: "min(420px,94vw)" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="newbell" style={{ animation: "none" }}><Ic.list s={26} /></div>
          <div>
            <div className="h-t">{isNew ? "تصنيف جديد" : "تعديل التصنيف"}</div>
            <div className="h-n" style={{ fontSize: 22 }}>{isNew ? "إضافة قسم للمنيو" : draft.name}</div>
          </div>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>اسم التصنيف</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: المشاوي" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && valid) onSave(trimmed); }} />
            {dupe && <div className="confirm-hint" style={{ color: "var(--red)" }}>يوجد تصنيف بنفس الاسم</div>}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-line" onClick={onClose}>إلغاء</button>
          <button className="btn btn-gold btn-accept" disabled={!valid} style={{ opacity: valid ? 1 : 0.5 }}
            onClick={() => valid && onSave(trimmed)}>
            <Ic.check s={19} /> حفظ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== حوار حذف التصنيف (تأكيد بالكتابة) ===================== */
function DeleteCategoryDialog({ cat, count, items, onConfirm, onClose }){
  const [text, setText] = useState("");
  const match = text.trim() === cat;
  const sample = items.slice(0, 8);
  const extra = items.length - sample.length;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ width: "min(460px,94vw)" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head danger-head">
          <div className="newbell danger-bell"><Ic.trash s={26} /></div>
          <div>
            <div className="h-t" style={{ color: "#ffb3ad" }}>حذف تصنيف</div>
            <div className="h-n" style={{ fontSize: 23 }}>{cat}</div>
          </div>
        </div>
        <div className="modal-body">
          <div className="warn-box">
            <div className="wt">
              <Ic.flame s={18} style={{ flex: "0 0 auto", marginTop: 2, color: "var(--red)" }} />
              <span>سيتم حذف هذا التصنيف <b>وجميع أصنافه ({count} صنف)</b> نهائياً. لا يمكن التراجع عن هذا الإجراء.</span>
            </div>
            {sample.length > 0 && (
              <ul className="warn-list">
                {sample.map((it) => <li key={it.id}>{it.name}</li>)}
                {extra > 0 && <li>+ {extra} صنف آخر</li>}
              </ul>
            )}
          </div>
          <div className={"field confirm-input" + (match ? " match" : "")}>
            <label>للتأكيد، اكتب اسم التصنيف «<b style={{ color: "var(--text)" }}>{cat}</b>» بالأسفل</label>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={cat} autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && match) onConfirm(); }} />
            <div className="confirm-hint">{match ? "✓ مطابق — يمكنك الحذف الآن" : "اكتب الاسم تماماً كما هو"}</div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-line" onClick={onClose} style={{ flex: 1 }}>إلغاء</button>
          <button className="btn btn-danger btn-accept" disabled={!match} onClick={() => match && onConfirm()}>
            <Ic.trash s={18} /> حذف نهائي
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== حوار رفض الطلب (سبب الرفض) ===================== */
function RejectDialog({ order, onConfirm, onClose }){
  const [reason, setReason] = useState(null);
  const [other, setOther] = useState("");
  const isOther = reason === "__other";
  const finalReason = isOther ? other.trim() : reason;
  const valid = isOther ? other.trim().length > 0 : reason !== null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ width: "min(480px,94vw)" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head danger-head">
          <div className="newbell danger-bell"><Ic.x s={26} /></div>
          <div>
            <div className="h-t" style={{ color: "#ffb3ad" }}>رفض الطلب #{order.number}</div>
            <div className="h-n" style={{ fontSize: 21 }}>{order.customer.name}</div>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-soft)", marginBottom: 12 }}>اختر سبب الرفض:</div>
          <div className="reasons">
            {S.REJECT_REASONS.map((r) => (
              <button key={r} className={"reason-opt" + (reason === r ? " sel" : "")} onClick={() => setReason(r)}>
                <span className="rdot"></span>
                <span>{r}</span>
              </button>
            ))}
            <button className={"reason-opt" + (isOther ? " sel" : "")} onClick={() => setReason("__other")}>
              <span className="rdot"></span>
              <span>سبب آخر…</span>
            </button>
          </div>
          {isOther && (
            <div className="field reason-other">
              <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="اكتب سبب الرفض" autoFocus />
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-line" onClick={onClose} style={{ flex: 1 }}>تراجع</button>
          <button className="btn btn-danger btn-accept" disabled={!valid} onClick={() => valid && onConfirm(order, finalReason)}>
            <Ic.x s={18} /> تأكيد الرفض
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  OrdersBoard, OrderGrid, OrdersView, NewOrderModal, OrderDrawer,
  MenuScreen, SummaryScreen, ItemEditorModal, SettingsScreen,
  CategoryEditorModal, DeleteCategoryDialog, RejectDialog,
});
