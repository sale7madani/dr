// screens-delivery.jsx — active delivery takeover: stages, map, call, deliver
// Exports to window: DeliveryScreen, DeliveredScreen

const DELIVERY_STAGES = [
  { key: 'toStore', step: 0, target: 'store', action: 'وصلت إلى المطعم', icon: 'store' },
  { key: 'pickup', step: 1, target: 'store', action: 'استلمت الطلب', icon: 'bag', checklist: true },
  { key: 'toCustomer', step: 2, target: 'customer', action: 'وصلت إلى الزبون', icon: 'pin' },
  { key: 'deliver', step: 3, target: 'customer', action: 'تم التسليم', icon: 'check', collect: true },
];
const STEP_LABELS = ['للمطعم', 'استلام', 'للزبون', 'تسليم'];

function DeliveryScreen({ order, mode, stageIdx, onAdvance, onMinimize, onCall, onCancelOrder }) {
  const t = useTheme();
  const [showItems, setShowItems] = React.useState(false);
  const [checks, setChecks] = React.useState({});
  const [problemOpen, setProblemOpen] = React.useState(false);
  // #7 live elapsed timer for this delivery
  const startRef = React.useRef(Date.now());
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => tick(x => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Date.now() - startRef.current;
  const stage = DELIVERY_STAGES[stageIdx];
  const toStore = stage.target === 'store';
  const targetName = toStore ? order.store : order.customer;
  const targetArea = toStore ? order.storeArea : order.customerArea;
  const targetPhone = toStore ? order.storePhone : order.customerPhone;
  const cash = order.pay.includes('كاش');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: t.c.bg }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: `${t.sp(10)}px ${t.sp(14)}px`, background: t.c.surface,
        borderBottom: `1px solid ${t.c.line}` }}>
        <button onClick={onMinimize} style={iconBtn(t)}>
          <Icon name="chevD" size={t.fs(24)} color={t.c.text} stroke={2.4} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(17), color: t.c.text }}>
            طلب #{order.id}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
            <Icon name="clock" size={t.fs(13)} color={t.c.textMut} stroke={2.3} />
            <span style={{ fontFamily: t.font, fontSize: t.fs(12.5), fontWeight: 700, color: t.c.textMut,
              direction: 'ltr' }}>{fmtMMSS(elapsed)}</span>
            <span style={{ fontFamily: t.font, fontSize: t.fs(12.5), color: t.c.textFaint }}>·</span>
            <span style={{ fontFamily: t.font, fontSize: t.fs(12.5), color: t.c.textMut }}>
              {toStore ? 'في الطريق للمطعم' : 'في الطريق للزبون'}</span>
          </div>
        </div>
        <span style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(17), color: t.c.goldText }}>
          +{order.fee.toFixed(2)}</span>
        <button onClick={() => setProblemOpen(true)} aria-label="مساعدة" style={{
          width: t.sp(40), height: t.sp(40), borderRadius: 12, border: `1.5px solid ${t.c.line}`,
          background: t.c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, marginInlineStart: 4 }}>
          <Icon name="help" size={t.fs(22)} color={t.c.danger} stroke={2.3} />
        </button>
      </div>

      {/* stepper */}
      <div style={{ padding: `${t.sp(16)}px ${t.sp(18)}px ${t.sp(6)}px`, background: t.c.surface }}>
        <Stepper steps={STEP_LABELS} current={stage.step} />
      </div>

      {/* scroll body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: t.sp(14) }}>
        <MapView height={t.sp(190)}
          store={order.store} storeArea={order.storeArea}
          customer={order.customer} customerArea={order.customerArea}
          activeLeg={toStore ? 'toStore' : 'toCustomer'} />

        {/* current target card */}
        <Card style={{ marginTop: 14 }} pad={16}>
          {/* clear directive — no maps, just “go now to …” */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            background: toStore ? t.c.goldSoft : t.c.primarySoft, borderRadius: t.r.md, marginBottom: 14 }}>
            <Icon name="nav" size={t.fs(20)} color={toStore ? t.c.goldText : t.c.goldText} stroke={2.3} />
            <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15.5), color: t.c.text }}>
              {toStore ? 'توجّه الآن إلى المطعم' : 'توجّه الآن إلى الزبون'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name={toStore ? 'store' : 'pin'} size={t.fs(20)}
              color={toStore ? t.c.gold : t.c.ink} stroke={2.2} />
            <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13.5),
              color: t.c.textMut }}>{toStore ? 'استلام من المطعم' : 'التسليم إلى الزبون'}</span>
          </div>
          <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(21), color: t.c.text }}>
            {targetName}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
            <Icon name="pin" size={t.fs(16)} color={t.c.textMut} stroke={2.2} style={{ marginTop: 2 }} />
            <span style={{ fontFamily: t.font, fontSize: t.fs(15.5), fontWeight: 600, color: t.c.text,
              lineHeight: 1.5, textWrap: 'pretty' }}>{targetArea}</span>
          </div>

          {order.note ? (
            <div style={{ marginTop: 12, padding: t.sp(12),
              background: t.c.goldSoft, borderRadius: t.r.md }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <Icon name="note" size={t.fs(17)} color={t.c.goldText} stroke={2.3} />
                <span style={{ fontFamily: t.font, fontSize: t.fs(13), fontWeight: 800, color: t.c.goldText }}>
                  ملاحظات من الزبون</span>
              </div>
              <span style={{ fontFamily: t.font, fontSize: t.fs(15), fontWeight: 600,
                color: t.c.text, lineHeight: 1.6, textWrap: 'pretty' }}>{order.note}</span>
            </div>
          ) : null}

          {/* customer phone — clearly shown and tappable to call */}
          {!toStore && (
            <a href={`tel:${(targetPhone || '').replace(/\s/g, '')}`}
              onClick={() => onCall(targetName, targetPhone)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14,
                padding: `${t.sp(12)}px ${t.sp(14)}px`, borderRadius: t.r.lg, textDecoration: 'none',
                background: t.c.primary, boxShadow: `0 8px 20px ${withA(t.c.primary, 0.28)}` }}>
              <div style={{ width: t.sp(42), height: t.sp(42), borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center',
                justifyContent: 'center' }}>
                <Icon name="phone" size={t.fs(22)} color={t.c.onPrimary} stroke={2.4} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: t.font, fontSize: t.fs(12.5), fontWeight: 700,
                  color: withA(t.c.onPrimary, 0.85) }}>اتصل بالزبون</div>
                <div style={{ fontFamily: t.font, fontSize: t.fs(19), fontWeight: 900,
                  color: t.c.onPrimary, direction: 'ltr', textAlign: 'start', letterSpacing: 0.5 }}>
                  {targetPhone}</div>
              </div>
              <Icon name="chevL" size={t.fs(22)} color={withA(t.c.onPrimary, 0.7)} stroke={2.4} />
            </a>
          )}
        </Card>

        {/* order items (collapsible) */}
        <Card style={{ marginTop: 12 }} pad={0}>
          <button onClick={() => setShowItems(s => !s)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: t.sp(16),
            background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: t.sp(38), height: t.sp(38), borderRadius: 10, background: t.c.surfaceAlt,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bag" size={t.fs(20)} color={t.c.text} stroke={2.2} />
            </div>
            <div style={{ flex: 1, textAlign: 'start' }}>
              <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(16), color: t.c.text }}>
                محتويات الطلب</div>
              <div style={{ fontFamily: t.font, fontSize: t.fs(13), color: t.c.textMut }}>
                {order.items.reduce((a, i) => a + i.q, 0)} قطعة</div>
            </div>
            <Icon name="chevD" size={t.fs(22)} color={t.c.textMut} stroke={2.4}
              style={{ transform: showItems ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>
          {showItems && (
            <div style={{ padding: `0 ${t.sp(16)}px ${t.sp(14)}px` }}>
              <Divider />
              {order.items.map((it, i) => {
                const allowCheck = stage.checklist;
                const on = checks[i];
                return (
                  <div key={i} onClick={allowCheck ? () => setChecks(c => ({ ...c, [i]: !c[i] })) : undefined}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                      cursor: allowCheck ? 'pointer' : 'default',
                      borderBottom: i < order.items.length - 1 ? `1px solid ${t.c.line}` : 'none' }}>
                    {allowCheck && (
                      <div style={{ width: t.sp(26), height: t.sp(26), borderRadius: 8, flexShrink: 0,
                        border: `2px solid ${on ? t.c.primary : t.c.line}`,
                        background: on ? t.c.primary : 'transparent', display: 'flex',
                        alignItems: 'center', justifyContent: 'center' }}>
                        {on && <Icon name="check" size={t.fs(16)} color="#fff" stroke={3} />}
                      </div>
                    )}
                    <span style={{ width: t.sp(30), height: t.sp(30), borderRadius: 8, background: t.c.surfaceAlt,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14), color: t.c.text }}>
                      ×{it.q}</span>
                    <span style={{ flex: 1, fontFamily: t.font, fontSize: t.fs(15.5), fontWeight: 600,
                      color: t.c.text }}>{it.n}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* payment summary — captain only sees their own fee */}
        <Card style={{ marginTop: 12 }} pad={16}>
          <Row label="أجرة التوصيل" value={`${order.fee.toFixed(2)} ₪`} bold big t={t} color={t.c.goldText} />
          <div style={{ height: 1, background: t.c.line, margin: '8px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
            padding: '10px 12px', background: t.c.primarySoft, borderRadius: t.r.md }}>
            <Icon name="shield" size={t.fs(18)} color={t.c.goldText} stroke={2.2} />
            <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14.5), color: t.c.text }}>
              مدفوع إلكترونياً — لا تحصيل نقدي</span>
          </div>
        </Card>
        <div style={{ height: t.sp(16) }} />
      </div>

      {/* sticky action */}
      <div style={{ padding: `${t.sp(14)}px ${t.sp(14)}px calc(${t.sp(14)}px + env(safe-area-inset-bottom, 0px))`,
        background: t.c.surface, borderTop: `1px solid ${t.c.line}`,
        boxShadow: t.c.shadowUp }}>
        <Btn kind="primary" size="lg" icon={stage.icon} onClick={onAdvance}>{stage.action}</Btn>
      </div>

      <ProblemSheet open={problemOpen} order={order} onClose={() => setProblemOpen(false)}
        onCall={onCall} onCancelOrder={onCancelOrder} />
    </div>
  );
}

// ── Problem / support sheet (failure states during delivery) ────────
function ProblemSheet({ open, order, onClose, onCall, onCancelOrder }) {
  const t = useTheme();
  const [reported, setReported] = React.useState(null);
  React.useEffect(() => { if (open) setReported(null); }, [open]);
  const supPhone = (SUPPORT.phone || '').replace(/\s/g, '');

  const PROBLEMS = [
    { k: 'closed', icon: 'store', label: 'المطعم مغلق أو رفض الطلب' },
    { k: 'noreply', icon: 'phone', label: 'الزبون لا يرد على الهاتف' },
    { k: 'address', icon: 'pin', label: 'لا أجد العنوان / الموقع غلط' },
    { k: 'vehicle', icon: 'truck', label: 'مشكلة بالمركبة' },
    { k: 'wait', icon: 'clock', label: 'انتظار طويل بالمطعم' },
  ];

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: `${t.sp(20)}px ${t.sp(18)}px calc(${t.sp(24)}px + env(safe-area-inset-bottom,0px))`,
        overflowY: 'auto' }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: t.c.line, margin: '0 auto 16px' }} />
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(21), color: t.c.text }}>
          تواجه مشكلة؟</div>
        <div style={{ fontFamily: t.font, fontSize: t.fs(14.5), color: t.c.textMut, margin: '4px 0 16px' }}>
          طلب #{order.id} — اختر المشكلة أو اتصل بالإدارة مباشرة</div>

        {/* always-available: call dispatch */}
        <a href={`tel:${supPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 12,
          padding: `${t.sp(12)}px ${t.sp(14)}px`, borderRadius: t.r.lg, textDecoration: 'none',
          background: t.c.primary, boxShadow: `0 8px 20px ${withA(t.c.primary, 0.28)}`, marginBottom: 16 }}>
          <div style={{ width: t.sp(42), height: t.sp(42), borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center',
            justifyContent: 'center' }}>
            <Icon name="headset" size={t.fs(22)} color={t.c.onPrimary} stroke={2.3} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: t.font, fontSize: t.fs(12.5), fontWeight: 700,
              color: withA(t.c.onPrimary, 0.85) }}>{SUPPORT.label}</div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(18), fontWeight: 900, color: t.c.onPrimary,
              direction: 'ltr', textAlign: 'start' }}>{SUPPORT.phone}</div>
          </div>
          <Icon name="phone" size={t.fs(22)} color={t.c.onPrimary} stroke={2.4} />
        </a>

        {reported ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: t.sp(14),
            background: t.c.primarySoft, borderRadius: t.r.lg, marginBottom: 16 }}>
            <Icon name="check" size={t.fs(22)} color={t.c.primary} stroke={2.6} />
            <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: t.fs(14.5), color: t.c.text,
              lineHeight: 1.5 }}>تم إبلاغ الإدارة: {reported}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {PROBLEMS.map(p => (
              <button key={p.k} onClick={() => setReported(p.label)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: `0 ${t.sp(14)}px`,
                height: t.sp(56), borderRadius: t.r.lg, cursor: 'pointer', textAlign: 'start',
                background: t.c.surface, border: `1.5px solid ${t.c.line}` }}>
                <Icon name={p.icon} size={t.fs(20)} color={t.c.textMut} stroke={2.2} />
                <span style={{ flex: 1, fontFamily: t.font, fontWeight: 700, fontSize: t.fs(15.5),
                  color: t.c.text }}>{p.label}</span>
                <Icon name="chevL" size={t.fs(20)} color={t.c.textFaint} stroke={2.4} />
              </button>
            ))}
          </div>
        )}

        <button onClick={() => { onClose(); onCancelOrder && onCancelOrder(order); }} style={{
          width: '100%', height: t.sp(52), borderRadius: t.r.lg, cursor: 'pointer',
          background: t.c.dangerSoft, border: 'none', color: t.c.danger,
          fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15.5), display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="x" size={t.fs(20)} color={t.c.danger} stroke={2.6} />
          إلغاء الطلب وإعادته للإدارة
        </button>
      </div>
    </Sheet>
  );
}

function Row({ label, value, bold, big, color, t }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
      <span style={{ fontFamily: t.font, fontSize: t.fs(bold ? 15.5 : 14.5),
        fontWeight: bold ? 800 : 600, color: bold ? t.c.text : t.c.textMut }}>{label}</span>
      <span style={{ fontFamily: t.font, fontSize: t.fs(big ? 20 : 15), fontWeight: 800,
        color: color || t.c.text }}>{value}</span>
    </div>
  );
}

// mm:ss for the live delivery timer
function fmtMMSS(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ── Delivered success ────────────────────────────────────────
function DeliveredScreen({ order, onDone }) {
  const t = useTheme();
  const [rating, setRating] = React.useState(0);
  const [tag, setTag] = React.useState(null);
  const [issueText, setIssueText] = React.useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: t.c.bg,
      overflowY: 'auto', alignItems: 'center', padding: `${t.sp(28)}px ${t.sp(24)}px ${t.sp(20)}px`,
      textAlign: 'center' }}>
      <div className="sb-pop" style={{ width: t.sp(96), height: t.sp(96), borderRadius: '50%',
        background: t.c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 18px 44px ${withA(t.c.primary, 0.4)}`, marginBottom: 20, flexShrink: 0 }}>
        <Icon name="check" size={t.fs(50)} color={t.c.onPrimary} stroke={3} />
      </div>
      <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(25), color: t.c.text }}>
        تم تسليم الطلب!</div>
      <div style={{ fontFamily: t.font, fontSize: t.fs(17), color: t.c.textMut, margin: '8px 0 2px' }}>
        عمل رائع يا كابتن <span style={{ fontWeight: 900, fontSize: t.fs(20),
          color: t.c.text }}>{CAPTAIN.name}</span> 👏</div>
      <div style={{ fontFamily: t.font, fontSize: t.fs(13), color: t.c.textFaint, margin: '2px 0 22px' }}>
        طلب #{order.id}</div>

      <Card style={{ width: '100%' }} pad={18}>
        <span style={{ fontFamily: t.font, fontSize: t.fs(15), color: t.c.textMut }}>أضيفت إلى أرباحك</span>
        <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(38), color: t.c.goldText,
          margin: '4px 0 2px' }}>+{order.fee.toFixed(2)} <span style={{ fontSize: t.fs(19) }}>شيكل</span></div>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14 }}>
          <MiniStat icon="receipt" value={new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
            label="وقت التسليم" t={t} />
          <MiniStat icon="clock" value={`${order.minutes} د`} label="المدة" t={t} />
          <MiniStat icon="bag" value={`${order.items.reduce((a, i) => a + i.q, 0)}`} label="قطعة" t={t} />
        </div>
      </Card>

      {/* #3 rate the trip */}
      <Card style={{ width: '100%', marginTop: 12 }} pad={18}>
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(16), color: t.c.text }}>
          كيف كانت الرحلة؟</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '14px 0 4px' }}>
          {[1, 2, 3, 4, 5].map(n => {
            const on = n <= rating;
            return (
              <button key={n} onClick={() => setRating(n)} style={{ background: 'transparent',
                border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0 }}>
                <Icon name="star" size={t.fs(36)} color={on ? t.c.gold : t.c.line}
                  fill={on ? t.c.gold : 'none'} stroke={on ? 0 : 2} />
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[['smooth', 'تمت بسلاسة', 'check'], ['issue', 'واجهت مشكلة', 'alert']].map(([k, lbl, ic]) => {
            const on = tag === k;
            const c = k === 'issue' ? t.c.danger : t.c.primary;
            return (
              <button key={k} onClick={() => { setTag(on ? null : k); if (on && k === 'issue') setIssueText(''); }} style={{ flex: 1, height: t.sp(44),
                borderRadius: t.r.md, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6, fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13.5),
                background: on ? withA(c, 0.12) : t.c.surfaceAlt,
                border: `1.5px solid ${on ? c : 'transparent'}`, color: on ? c : t.c.textMut }}>
                <Icon name={ic} size={t.fs(17)} color={on ? c : t.c.textMut} stroke={2.4} />{lbl}
              </button>
            );
          })}
        </div>
        {tag === 'issue' && (
          <div style={{ marginTop: 12, textAlign: 'start' }}>
            <div style={{ fontFamily: t.font, fontWeight: 700, fontSize: t.fs(13.5), color: t.c.text,
              marginBottom: 7 }}>صف المشكلة التي واجهتها</div>
            <textarea value={issueText} onChange={e => setIssueText(e.target.value)}
              placeholder="اكتب تفاصيل المشكلة هنا..." rows={3} autoFocus
              style={{ width: '100%', padding: t.sp(13), borderRadius: t.r.lg, boxSizing: 'border-box',
                border: `1.5px solid ${t.c.danger}`, background: t.c.surface, resize: 'none',
                fontFamily: t.font, fontSize: t.fs(15), fontWeight: 600, color: t.c.text, outline: 'none' }} />
            <div style={{ fontFamily: t.font, fontSize: t.fs(11.5), color: t.c.textMut, marginTop: 6,
              lineHeight: 1.5 }}>سيتم إرسال المشكلة إلى الإدارة مع تفاصيل الطلب.</div>
          </div>
        )}
      </Card>

      <div style={{ width: '100%', marginTop: 18 }}>
        <Btn kind="primary" icon="check" onClick={onDone}>جاهز للطلب التالي</Btn>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label, t }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Icon name={icon} size={t.fs(20)} color={t.c.textMut} stroke={2.2} style={{ margin: '0 auto 4px' }} />
      <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(16), color: t.c.text }}>{value}</div>
      <div style={{ fontFamily: t.font, fontSize: t.fs(12), color: t.c.textMut }}>{label}</div>
    </div>
  );
}

function iconBtn(t) {
  return { width: t.sp(40), height: t.sp(40), borderRadius: 12, border: 'none',
    background: t.c.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0 };
}

Object.assign(window, { DeliveryScreen, DeliveredScreen, iconBtn });
