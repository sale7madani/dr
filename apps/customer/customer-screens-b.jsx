/* ============================================================
   شاشات (ب) — السلة، تأكيد الطلب، الدفع، تم الطلب، التتبّع، طلباتي، حسابي، العناوين
   ============================================================ */

/* ===================== السلة ===================== */
function CartScreen({ groups, setQty, removeLine, subtotal, deliveryFee, total, onCheckout, back, goHome, onAddFrom }){
  if (groups.length === 0){
    return (
      <div className="screen">
        <SubHead title="السلة" onBack={back} />
        <div className="empty">
          <div className="e-logo"><b style={{ fontSize: 34, fontWeight: 900, color: "#fff" }}>س</b></div>
          <div className="e-t">سلتك فاضية</div>
          <div className="e-s">اختر مطعم وابدأ بإضافة أصنافك المفضلة</div>
          <button className="btn btn-gold btn-lg btn-pill" onClick={goHome} style={{ marginTop: 6, padding: "14px 34px" }}>تصفّح المطاعم</button>
        </div>
      </div>
    );
  }
  return (
    <div className="screen">
      <SubHead title="السلة" onBack={back} />
      <div className="scroll pad pb-bar" style={{ paddingTop: 14 }}>
        {groups.length > 1 && (
          <div className="cart-info"><span className="ci-ic"><Ic.info s={17} /></span><span>طلبك من {groups.length} مطاعم — بإضافة {SB.money(SB.EXTRA_REST_FEE)} لرسوم التوصيل لكل مطعم إضافي.</span></div>
        )}
        {groups.map((g) => {
          const r = SB.findRestaurant(g.restaurantId);
          return (
            <div className="cart-group" key={g.restaurantId} style={rcVars(r)}>
              <div className="cg-head">
                <div className="cg-logo"><Cover r={r} sm /></div>
                <div className="cg-l"><div className="cg-from">من</div><div className="cg-name">{r.name}</div></div>
                <button className="cg-add" onClick={() => onAddFrom(r)}><Ic.plus s={14} /> إضافة</button>
              </div>
              {g.lines.map((line) => {
                const mt = SB.modText(line);
                return (
                  <div className="cline" key={line.uid}>
                    <Stepper rc showDelete value={line.qty}
                      onDec={() => line.qty <= 1 ? removeLine(line.uid) : setQty(line.uid, line.qty - 1)}
                      onInc={() => setQty(line.uid, line.qty + 1)} />
                    <div className="cl-l">
                      <div className="cl-name">{line.name}</div>
                      <div className="cl-price tnum">{SB.money(SB.linePrice(line))}</div>
                      {mt && <div className="cl-mod">{mt}</div>}
                      {line.note && <div className="cl-mod">“{line.note}”</div>}
                    </div>
                    <div className="cl-img"><FoodThumb r={r} it={SB.findItem(line.restaurantId, line.id) || {}} /></div>
                  </div>
                );
              })}
              <div className="cg-sub">مجموع هذا المطعم: <b className="tnum">{SB.money(g.subtotal)}</b></div>
            </div>
          );
        })}

        <button className="add-rest" onClick={goHome}><Ic.store s={18} /> أضف من مطعم آخر</button>

        <div className="summary">
          <div className="sumrow">مجموع الطلبات <b className="tnum">{SB.money(subtotal)}</b></div>
          <div className="sumrow">رسوم التوصيل <b className="tnum">{SB.money(deliveryFee)}</b></div>
          <div className="sumrow tot">الإجمالي <b className="tnum">{SB.money(total)}</b></div>
        </div>
      </div>

      <div className="actionbar">
        <button className="btn btn-gold btn-block btn-lg" onClick={onCheckout} style={{ justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ic.chevR s={20} /> متابعة للدفع</span>
          <span className="tnum">{SB.money(total)}</span>
        </button>
      </div>
    </div>
  );
}

/* ===================== تأكيد الطلب ===================== */
function ConfirmScreen({ groups, address, addresses, onPickAddress, onEditDelivery, subtotal, deliveryFee, total, restNote, setRestNote, onNext, back }){
  const [showAddr, setShowAddr] = useState(false);
  return (
    <div className="screen">
      <SubHead title="تأكيد الطلب" onBack={back} />
      <div className="scroll pad pb-bar" style={{ paddingTop: 14 }}>
        {/* تواصل */}
        <div className="block">
          <div className="block-h"><span className="b-ic"><Ic.user s={19} /></span><span className="b-t">معلومات التواصل</span></div>
          <div className="contact-row">
            <span className="cr-av"><Ic.user s={20} /></span>
            <div className="cr-l"><b>{SB.USER.name}</b><small className="tnum">{SB.USER.phone}</small></div>
          </div>
        </div>

        {/* العنوان */}
        <div className="block">
          <div className="block-h"><span className="b-ic"><Ic.pin s={19} /></span><span className="b-t">عنوان التوصيل</span><button className="b-edit" onClick={() => setShowAddr(true)}>تغيير</button></div>
          <div className="addr-card sel">
            <span className="ac-ic"><Ic.home s={20} /></span>
            <div className="ac-l">
              <div className="ac-top"><span className="ac-name">{address.name}</span>{address.def && <span className="pill pill-gold" style={{ fontSize: 10.5 }}><Ic.star s={11} /> الافتراضي</span>}</div>
              <div className="ac-sel"><Ic.check2 s={12} /> محدد للطلب</div>
              <div className="ac-text">{SB.addrText(address)}{address.note ? " — " + address.note : ""}</div>
            </div>
            <span className="ac-check"><Ic.check2 s={15} /></span>
          </div>
          <button className="b-edit" style={{ marginTop: 11, fontSize: 13 }} onClick={onEditDelivery}>تعديل تفاصيل التوصيل ←</button>
        </div>

        {/* ملخص */}
        <div className="block">
          <div className="block-h"><span className="b-ic"><Ic.bag s={19} /></span><span className="b-t">ملخص الطلب</span></div>
          {groups.map((g) => {
            const r = SB.findRestaurant(g.restaurantId);
            return (
              <div key={g.restaurantId} style={rcVars(r)}>
                <div className="osum-rest"><Ic.store s={15} style={{ color: "var(--rc-deep)" }} /> {r.name}</div>
                {g.lines.map((line) => (
                  <div className="osum-line" key={line.uid}>
                    <span><span className="ol-q tnum">×{line.qty}</span> &nbsp;{line.name}</span>
                    <span className="tnum" style={{ fontWeight: 800 }}>{SB.money(SB.linePrice(line))}</span>
                  </div>
                ))}
              </div>
            );
          })}
          <div className="notefield" style={{ marginTop: 16 }}>
            <label>ملاحظة عامة (اختياري)</label>
            <textarea value={restNote} onChange={(e) => setRestNote(e.target.value)} placeholder="مثلاً: بدون بصل، الكاتشب على جنب، حار قليل…" style={{ background: "var(--surface-2)" }}></textarea>
          </div>
        </div>

        <div className="summary">
          <div className="sumrow">المجموع <b className="tnum">{SB.money(subtotal)}</b></div>
          <div className="sumrow">التوصيل {groups.length > 1 && <span style={{ fontSize: 11.5 }}>(شامل {groups.length - 1} مطعم إضافي)</span>} <b className="tnum">{SB.money(deliveryFee)}</b></div>
          <div className="sumrow tot">الإجمالي <b className="tnum">{SB.money(total)}</b></div>
        </div>
      </div>

      <div className="actionbar">
        <button className="btn btn-gold btn-block btn-lg" onClick={onNext} style={{ justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ic.card s={19} /> متابعة لطريقة الدفع</span>
          <span className="tnum">{SB.money(total)}</span>
        </button>
      </div>

      {showAddr && (
        <Sheet title="اختر العنوان" onClose={() => setShowAddr(false)}>
          {addresses.map((a) => (
            <div className={"addr-card" + (a.id === address.id ? " sel" : "")} key={a.id} style={{ marginBottom: 11 }} onClick={() => { onPickAddress(a.id); setShowAddr(false); }}>
              <span className="ac-ic"><Ic.home s={20} /></span>
              <div className="ac-l"><div className="ac-name">{a.name}</div><div className="ac-text">{SB.addrText(a)}</div></div>
              {a.id === address.id && <span className="ac-check"><Ic.check2 s={15} /></span>}
            </div>
          ))}
        </Sheet>
      )}
    </div>
  );
}

/* ===================== الدفع ===================== */
function PaymentScreen({ total, onPlace, back }){
  const P = SB.PAYMENT;
  const methods = [
    { id: "bank", name: P.bank.name, sub: P.bank.bankName, icon: "bank", fields: P.bank.fields, holder: P.bank.holder, head: P.bank.bankName },
    ...P.wallets.map((w) => ({ id: w.id, name: w.name, sub: w.sub, icon: "wallet", fields: w.fields, holder: w.holder, head: w.name })),
  ];
  const [method, setMethod] = useState("bank");
  const [receipt, setReceipt] = useState(null);
  const [problem, setProblem] = useState(false);
  const [pnote, setPnote] = useState("");
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);
  const active = methods.find((m) => m.id === method);

  function pickFile(e){
    const f = e.target.files && e.target.files[0]; if (!f) return;
    setReceipt({ name: f.name, url: URL.createObjectURL(f) });
    setProblem(false);
  }
  function copy(txt){
    try { navigator.clipboard && navigator.clipboard.writeText(txt.replace(/\s/g, "")); } catch (e) {}
    setToast("تم نسخ الرقم"); setTimeout(() => setToast(null), 1500);
  }
  // يكتمل الطلب إمّا برفع الوصل، أو بتفعيل "مشكلة" مع كتابة ملاحظة
  const paid = !!receipt;
  const ready = paid || (problem && pnote.trim().length > 0);

  return (
    <div className="screen">
      <SubHead title="الدفع" onBack={back} />
      <div className="scroll pad pb-bar" style={{ paddingTop: 14 }}>
        <div className="block-h" style={{ marginBottom: 12 }}><span className="b-ic"><Ic.card s={19} /></span><span className="b-t">اختر طريقة الدفع</span></div>

        {methods.map((m) => {
          const I = window.Ic[m.icon] || Ic.card;
          const sel = method === m.id;
          return (
            <div className={"pay-method" + (sel ? " sel" : "")} key={m.id}>
              <div className="pm-head" onClick={() => setMethod(m.id)}>
                <span className="pm-ic"><I s={21} /></span>
                <span className="pm-l"><b>{m.name}</b><small>{m.sub}</small></span>
                <span className="pm-dot"></span>
              </div>
              {sel && (
                <div className="pm-body">
                  <div className="bankcard">
                    <div className="bk-name"><I s={15} /> {m.head}</div>
                    {m.fields.map((f) => (
                      <div className="copyrow" key={f.k}>
                        <div>
                          <div className="cp-k">{f.k}</div>
                          <div className={"cp-v tnum" + (f.ltr ? " ltr" : "") + (f.small ? " sm" : "")}>{f.v}</div>
                        </div>
                        <button className="cp-btn" onClick={() => copy(f.v)}><Ic.copy s={17} /></button>
                      </div>
                    ))}
                    <div className="bk-holder">باسم: {m.holder}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* رفع الوصل */}
        <div style={{ marginTop: 20 }}>
          <div className="field-l">صورة وصل التحويل {!problem && <span className="req">*</span>}</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={pickFile} />
          <div className={"uploadbox" + (receipt ? " has" : "")} onClick={() => fileRef.current && fileRef.current.click()}>
            {receipt ? (
              <div className="u-pre">
                <span className="up-img">{receipt.url ? <img src={receipt.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Ic.check2 s={22} />}</span>
                <span className="up-l"><b>تم إرفاق الوصل</b><small>{receipt.name}</small></span>
                <button className="ic-btn plain" onClick={(e) => { e.stopPropagation(); setReceipt(null); }}><Ic.close s={20} /></button>
              </div>
            ) : (
              <>
                <span className="u-ic"><Ic.upload s={25} /></span>
                <span className="u-t">ارفع صورة وصل التحويل</span>
                <span className="u-s">لقطة شاشة من تطبيق البنك أو المحفظة</span>
              </>
            )}
          </div>
        </div>

        {/* مشكلة في رفع الوصل */}
        <div className={"problembox" + (problem ? " on" : "")}>
          <div className="pb-head" onClick={() => setProblem(!problem)}>
            <span className={"checkbox" + (problem ? " on" : "")}>{problem && <Ic.check2 s={15} />}</span>
            <span className="pb-l">هل تواجه مشكلة في رفع الوصل؟</span>
          </div>
          {problem && (
            <div className="pb-note">
              <textarea value={pnote} onChange={(e) => setPnote(e.target.value)} placeholder="اكتب ملاحظاتك هنا — مثلاً: حوّلت المبلغ ولا أملك صورة الوصل، أو واجهت مشكلة في التطبيق…"></textarea>
            </div>
          )}
        </div>

        {problem
          ? <div className="infonote warn"><span className="in-ic"><Ic.alert s={17} /></span><span>سيصل طلبك بحالة <b>«غير مدفوع»</b> وسيتواصل معك فريق الدعم لإتمام الدفع قبل تحويله للمطعم.</span></div>
          : <div className="infonote"><span className="in-ic"><Ic.shield s={17} /></span><span>{P.note}</span></div>}
      </div>

      <div className="actionbar">
        <button className="btn btn-gold btn-block btn-lg" disabled={!ready} style={{ opacity: ready ? 1 : .5, justifyContent: "center" }}
          onClick={() => onPlace({ method: active.name, receipt, problem, pnote, paid })}>
          {ready ? "تأكيد الطلب • " + SB.money(total) : (problem ? "اكتب ملاحظتك للمتابعة" : "ارفع الوصل للمتابعة")}
        </button>
      </div>

      {toast && <Toast msg={toast} />}
    </div>
  );
}

/* ===================== مودال الإرسال + شاشة تم الطلب ===================== */
function PlacedScreen({ order, onTrack, onHome }){
  const unpaid = order.status === "unpaid";
  return (
    <div className="screen">
      <div className="confirm">
        <div className={"c-burst " + (unpaid ? "red" : "gold")}>{unpaid ? <Ic.alert s={48} /> : <Ic.shield s={48} />}</div>
        <div className="c-t">{unpaid ? "تم استلام طلبك" : "تم استلام طلبك!"}</div>
        <div className="c-s">
          {unpaid
            ? <>طلبك الآن بحالة <b>غير مدفوع</b> — سيتواصل معك فريق الدعم لإتمام الدفع، وبعدها يُحوَّل طلبك للمطعم.</>
            : <>طلبك الآن <b>قيد المعالجة</b> لدى إدارة سُنبل — نتأكد من التحويل ثم نحوّله للمطعم خلال دقائق.</>}
        </div>
        <div className="c-order">
          <small>رقم الطلب</small>
          <b className="tnum">{order.number}</b>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, width: "100%", marginTop: 22 }}>
          <button className="btn btn-gold btn-block btn-lg" onClick={onTrack}><Ic.bike s={20} /> تتبّع الطلب</button>
          <button className="btn btn-line btn-block" onClick={onHome}>العودة للرئيسية</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== تتبّع الطلب ===================== */
function TrackScreen({ order, onHome, back, onRate }){
  const unpaid = order.status === "unpaid";
  const ended = order.status === "rejected" || order.status === "canceled";
  const restNames = order.restaurantNames;
  const idx = SB.TIMELINE.indexOf(order.status);
  const hasCaptain = idx >= SB.TIMELINE.indexOf("onway");
  const delivered = order.status === "delivered";

  return (
    <div className="screen">
      <SubHead title="تتبّع الطلب" onBack={back} />
      <div className="scroll pad pb-tab" style={{ paddingTop: 14 }}>
        {/* بطاقة الطلب */}
        <div className="track-card">
          <div className="track-rests">
            <div className="tr-logos">
              {order.restaurants.map((rid) => { const r = SB.findRestaurant(rid); return <div className="tl" key={rid}><Cover r={r} sm /></div>; })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{restNames.join(" و ")}</div>
              <div className="oc-num tnum" style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 700, marginTop: 2 }}>{order.number}</div>
            </div>
          </div>
          {!unpaid && !delivered && !ended && <div className="track-eta"><Ic.timer s={16} /> الوقت المتوقّع {order.etaMin}-{order.etaMax} دقيقة</div>}
        </div>

        {/* بانر غير مدفوع */}
        {unpaid && (
          <div className="infonote warn" style={{ marginTop: 14, alignItems: "center" }}>
            <span className="in-ic"><Ic.alert s={18} /></span>
            <span>طلبك بحالة <b>غير مدفوع</b>. سيتصل بك فريق الدعم على رقمك لإتمام الدفع، ثم نحوّله للمطعم.</span>
          </div>
        )}

        {/* بانر الرفض / الإلغاء */}
        {ended && (
          <div className="infonote warn" style={{ marginTop: 14, alignItems: "center" }}>
            <span className="in-ic"><Ic.alert s={18} /></span>
            <span>
              {order.status === "rejected" ? <>اعتذر المطعم عن تنفيذ طلبك.</> : <>تم إلغاء هذا الطلب.</>}
              {order.rejectReason ? <> السبب: <b>{order.rejectReason}</b>.</> : null} سيتواصل معك الدعم إذا لزم.
            </span>
          </div>
        )}

        {/* الحالة الكبيرة */}
        <div className="statusbig">
          {(() => { const st = SB.STATUS[order.status]; const I = window.Ic[st.icon] || Ic.check; const tone = st.tone;
            return <span className="sb-ic" style={{ background: `var(--${tone}-soft)`, color: `var(--${tone === "gold" ? "gold-deep" : tone})` }}><I s={26} /></span>; })()}
          <div className="sb-l"><b>{SB.STATUS[order.status].label}</b><small>{SB.STATUS[order.status].sub}</small></div>
        </div>

        {/* الخط الزمني */}
        <div className="block" style={{ marginTop: 16, paddingBottom: 4 }}>
          <div className="block-h"><span className="b-ic"><Ic.list s={18} /></span><span className="b-t">حالة الطلب</span></div>
          <VTimeline currentKey={unpaid || ended ? "_none" : order.status} />
        </div>

        {/* الكابتن */}
        {hasCaptain && !delivered && (
          <div className="block"><div className="block-h"><span className="b-ic"><Ic.bike s={18} /></span><span className="b-t">الكابتن في الطريق</span></div><CaptainCard cap={SB.CAPTAIN} /></div>
        )}

        {/* تقييم */}
        {delivered && (
          <div className="block" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>كيف كانت تجربتك؟</div>
            <div style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600, marginBottom: 13 }}>تقييمك يساعدنا على التحسّن</div>
            <RateRow onRate={onRate} />
          </div>
        )}

        {/* العنوان وطريقة الدفع */}
        <div className="block">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "var(--text-soft)" }}><Ic.pin s={16} style={{ color: "var(--gold-deep)" }} /> {SB.addrText(order.address)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "var(--text-soft)", marginTop: 10 }}><Ic.card s={16} style={{ color: "var(--gold-deep)" }} /> {order.payMethod} · {order.paid ? "وصل مُرفق" : "غير مدفوع"}</div>
          <div className="sumrow tot" style={{ fontSize: 17, marginTop: 8 }}>الإجمالي <b className="tnum">{SB.money(order.total)}</b></div>
        </div>
      </div>
    </div>
  );
}

function RateRow({ onRate }){
  const [r, setR] = useState(0);
  const [done, setDone] = useState(false);
  if (done) return <div style={{ color: "var(--green)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Ic.checkCircle s={20} /> شكراً لتقييمك!</div>;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setR(n)} style={{ color: n <= r ? "var(--gold-deep)" : "var(--line)" }}>
            {n <= r ? <Ic.star s={34} /> : <Ic.starline s={34} />}
          </button>
        ))}
      </div>
      {r > 0 && <button className="btn btn-gold btn-block" style={{ marginTop: 15 }} onClick={() => { setDone(true); onRate && onRate(r); }}>إرسال التقييم</button>}
    </div>
  );
}

/* ===================== طلباتي ===================== */
function OrdersScreen({ orders, onTrack, onReorder, onRate }){
  const [tab, setTab] = useState("all");
  const isActive = (o) => o.status !== "delivered" && o.status !== "cancelled";
  const counts = {
    all: orders.length,
    active: orders.filter(isActive).length,
    done: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };
  const filtered = orders.filter((o) =>
    tab === "all" ? true : tab === "active" ? isActive(o) : tab === "done" ? o.status === "delivered" : o.status === "cancelled");
  const tabs = [{ k: "all", l: "الكل" }, { k: "active", l: "نشط" }, { k: "done", l: "مكتمل" }, { k: "cancelled", l: "ملغي" }];

  return (
    <div className="screen">
      <div className="appbar"><div className="ttl">طلباتي</div></div>
      <div className="segtabs">
        {tabs.map((t) => (
          <button className={"segtab" + (tab === t.k ? " on" : "")} key={t.k} onClick={() => setTab(t.k)}>
            {t.l} {counts[t.k] > 0 && <span className="st-n tnum">{counts[t.k]}</span>}
          </button>
        ))}
      </div>
      <div className="scroll pad pb-tab" style={{ paddingTop: 14 }}>
        {filtered.length === 0 && (
          <div className="empty" style={{ paddingTop: 50 }}>
            <div className="e-ic"><Ic.receipt s={34} /></div>
            <div className="e-t" style={{ fontSize: 17 }}>{tab === "cancelled" ? "ما عندك طلبات ملغية" : "ما عندك طلبات"}</div>
          </div>
        )}
        {filtered.map((o) => {
          const active = isActive(o);
          const delivered = o.status === "delivered";
          return (
            <div className="ordcard" key={o.id}>
              <div className="oc-top">
                <div className="oc-l">
                  <div className="oc-status"><StatusPill status={o.status} /></div>
                  <div className="oc-name">{o.restaurantNames[0]}{o.restaurantNames.length > 1 ? " + " + (o.restaurantNames.length - 1) : ""}</div>
                  <div className="oc-num tnum">{o.number}</div>
                  <div className="oc-meta tnum">{o.itemsCount} أصناف · {SB.money(o.total)}</div>
                </div>
                <div className="oc-logos">
                  {o.restaurants.slice(0, 2).map((rid) => { const r = SB.findRestaurant(rid); return <div className="ol" key={rid}><Cover r={r} sm /></div>; })}
                </div>
              </div>
              {active && <button className="btn btn-gold btn-block btn-sm" style={{ marginTop: 13, padding: "11px" }} onClick={() => onTrack(o.id)}>تتبّع الطلب</button>}
              {delivered && (
                <>
                  <div className="oc-act">
                    <button className="btn btn-gold btn-sm" style={{ flex: 1, padding: 11 }} onClick={() => onRate(o.id)}><Ic.star s={15} /> {o.rated ? "تقييمك " + o.rated : "قيّم"}</button>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1, padding: 11 }} onClick={() => onReorder(o)}><Ic.refresh s={15} /> أعد الطلب</button>
                  </div>
                  <div className="oc-problem">تواجه مشكلة في هذا الطلب؟</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== حسابي ===================== */
function AccountScreen({ stats, onOrders, onAddresses, onSettings, onLogout, onSupport }){
  return (
    <div className="screen">
      <div className="appbar"><div className="ttl">حسابي</div></div>
      <div className="scroll pad pb-tab" style={{ paddingTop: 6 }}>
        <div className="profile-card">
          <div className="pc-top">
            <div className="pc-l">
              <div className="pc-hi">أهلاً بك 👋</div>
              <div className="pc-name">{SB.USER.name}</div>
              <div className="pc-phone tnum">{SB.USER.phone}</div>
            </div>
            <div className="pc-av">{SB.USER.name.trim()[0]}</div>
          </div>
          <div className="pc-stats">
            <div className="pc-stat"><b className="tnum">{stats.orders}</b><small>الطلبات</small></div>
            <div className="pc-stat"><b className="tnum">{stats.favs}</b><small>المفضلة</small></div>
          </div>
        </div>

        <div className="menu-list">
          <button className="menu-li" onClick={onOrders}><span className="ml-ic"><Ic.receipt s={20} /></span><span className="ml-l">طلباتي السابقة</span><Ic.chevL s={18} style={{ color: "var(--text-faint)" }} /></button>
          <button className="menu-li" onClick={onAddresses}><span className="ml-ic"><Ic.pin s={20} /></span><span className="ml-l">عناويني المحفوظة</span><span className="ml-badge tnum">{SB.ADDRESSES.length}</span><Ic.chevL s={18} style={{ color: "var(--text-faint)" }} /></button>
          <button className="menu-li" onClick={onSettings}><span className="ml-ic"><Ic.gear s={20} /></span><span className="ml-l">الإعدادات</span><Ic.chevL s={18} style={{ color: "var(--text-faint)" }} /></button>
          <button className="menu-li" onClick={onSupport}><span className="ml-ic"><Ic.chat s={20} /></span><span className="ml-l">تواصل مع الدعم</span><Ic.chevL s={18} style={{ color: "var(--text-faint)" }} /></button>
          <button className="menu-li" onClick={onSupport}><span className="ml-ic"><Ic.info s={20} /></span><span className="ml-l">عن التطبيق</span><Ic.chevL s={18} style={{ color: "var(--text-faint)" }} /></button>
        </div>

        <button className="logout" onClick={onLogout}><Ic.logout s={20} /> تسجيل الخروج</button>
      </div>
    </div>
  );
}

/* ===================== عناويني ===================== */
function AddressesScreen({ addresses, onAdd, onSetDefault, onDelete, back }){
  return (
    <div className="screen">
      <SubHead title="عناويني" onBack={back} />
      <div className="scroll pad pb-bar" style={{ paddingTop: 14 }}>
        {addresses.map((a) => (
          <div className="addr-saved" key={a.id} style={{ marginBottom: 14, borderColor: a.def ? "var(--gold)" : "var(--line)", borderWidth: a.def ? 2 : 1 }}>
            <div className="as-top">
              <span className="as-ic"><Ic.home s={22} /></span>
              <div className="as-l">
                <div className="as-name"><span>{a.name}</span>{a.def && <span className="pill pill-gold" style={{ fontSize: 10.5 }}><Ic.star s={11} /> الافتراضي</span>}</div>
                {a.def && <div className="ac-sel" style={{ marginTop: 6 }}><Ic.check2 s={12} /> محدد للطلب</div>}
                <div className="ac-text" style={{ marginTop: 6 }}>{SB.addrText(a)}{a.note ? " — " + a.note : ""}</div>
              </div>
            </div>
            <div className="as-act">
              <button className="a-del" onClick={() => onDelete(a.id)}><Ic.trash s={15} /> حذف</button>
              <button className="a-edit" onClick={() => onAdd(a)}><Ic.edit s={15} /> تعديل</button>
              <button className="a-cur" onClick={() => onSetDefault(a.id)} style={{ opacity: a.def ? .6 : 1 }}>{a.def ? "محدد" : "تحديد"}</button>
            </div>
          </div>
        ))}
      </div>
      <div className="actionbar"><button className="btn btn-gold btn-block btn-lg" onClick={() => onAdd(null)}><Ic.plus s={20} /> إضافة عنوان جديد</button></div>
    </div>
  );
}

/* ===================== إضافة/تعديل عنوان ===================== */
function AddAddressScreen({ initial, onSave, back }){
  const [name, setName] = useState(initial ? initial.name : "");
  const [area, setArea] = useState(initial ? initial.area : "");
  const [street, setStreet] = useState(initial ? initial.street : "");
  const [building, setBuilding] = useState(initial ? initial.building : "");
  const [floor, setFloor] = useState(initial ? initial.floor : "");
  const [note, setNote] = useState(initial ? initial.note : "");
  const [def, setDef] = useState(initial ? !!initial.def : false);
  const ok = area && street.trim();
  return (
    <div className="screen">
      <SubHead title={initial ? "تعديل العنوان" : "إضافة عنوان جديد"} onBack={back} />
      <div className="scroll pad pb-bar" style={{ paddingTop: 16 }}>
        <div className="block">
          <div className="field-l">اسم العنوان (اختياري)</div>
          <div className="inp" style={{ marginBottom: 16 }}><input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: البيت، الشغل، بيت الأهل" /></div>

          <div className="field-l">المنطقة <span className="req">*</span></div>
          <div className="areas-grid">
            {SB.AREAS.map((a) => <button className={"chip" + (area === a ? " on" : "")} key={a} onClick={() => setArea(a)}>{a}</button>)}
          </div>

          <div className="field-l">الشارع <span className="req">*</span></div>
          <div className="inp" style={{ marginBottom: 16 }}><input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="مثلاً: شارع عمر المختار" /></div>

          <div className="two-col" style={{ marginBottom: 16 }}>
            <div><div className="field-l">العمارة</div><div className="inp"><input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="مثلاً: 5" inputMode="numeric" /></div></div>
            <div><div className="field-l">الطابق</div><div className="inp"><input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="مثلاً: 3" inputMode="numeric" /></div></div>
          </div>

          <div className="field-l">ملاحظات (اختياري)</div>
          <div className="inp" style={{ alignItems: "flex-start" }}><textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثلاً: بجانب صيدلية النور، اتصل قبل الوصول"></textarea></div>

          <div className="checkrow" style={{ marginTop: 16 }} onClick={() => setDef(!def)}>
            <span className={"checkbox" + (def ? " on" : "")}>{def && <Ic.check2 s={15} />}</span>
            <span className="ck-l">اجعل هذا عنواني الافتراضي</span>
          </div>
        </div>
      </div>
      <div className="actionbar">
        <button className="btn btn-gold btn-block btn-lg" disabled={!ok} style={{ opacity: ok ? 1 : .5 }}
          onClick={() => onSave({ id: initial ? initial.id : "ad" + Date.now(), name: name.trim() || "عنوان", area, street: street.trim(), building: building.trim(), floor: floor.trim(), note: note.trim(), def })}>
          حفظ العنوان
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  CartScreen, ConfirmScreen, PaymentScreen, PlacedScreen, TrackScreen, RateRow,
  OrdersScreen, AccountScreen, AddressesScreen, AddAddressScreen,
});
