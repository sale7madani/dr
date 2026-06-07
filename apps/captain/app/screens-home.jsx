// screens-home.jsx — Home (online/offline + idle waiting) and the incoming-order popup
// Exports to window: HomeScreen, NewOrderSheet

function StatChip({ icon, value, label, color }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 4, padding: '10px 4px' }}>
      <Icon name={icon} size={t.fs(22)} color={color || t.c.primary} stroke={2.2} />
      <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(19), color: t.c.text }}>{value}</div>
      <div style={{ fontFamily: t.font, fontSize: t.fs(12.5), color: t.c.textMut }}>{label}</div>
    </div>
  );
}

function HomeScreen({ online, setOnline, onSimulate, mode, earnings, queueCount, photo,
  shiftStart, onStart, onStop }) {
  const t = useTheme();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const unread = NOTIFICATIONS.filter(n => n.unread).length;
  // live ticker while a shift is running (#2 + #7 base)
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    if (!shiftStart) return;
    const id = setInterval(() => tick(x => x + 1), 1000);
    return () => clearInterval(id);
  }, [shiftStart]);
  const shiftElapsed = shiftStart ? Date.now() - shiftStart : 0;
  return (
    <div style={{ padding: `${t.sp(8)}px ${t.sp(16)}px ${t.sp(24)}px` }}>
      {/* brand bar */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '4px 2px 12px', minHeight: t.sp(42) }}>
        <div style={{ display: 'flex', alignItems: 'center', height: t.sp(42), padding: '0 16px',
          background: t.c.ink, borderRadius: 14, boxShadow: t.c.shadow }}>
          <img src="assets/sonbol-gold.png" alt="Sonbol" style={{ height: t.fs(22), display: 'block' }} />
        </div>
        <div style={{ position: 'absolute', insetInlineStart: 2, top: '50%', transform: 'translateY(-50%)' }}>
          <button onClick={() => setNotifOpen(true)} style={{ width: t.sp(42), height: t.sp(42), borderRadius: 14, border: 'none',
            background: t.c.surface, boxShadow: t.c.shadow, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="bell" size={t.fs(21)} color={t.c.text} stroke={2.2} />
          </button>
          {unread > 0 && (
            <span style={{ position: 'absolute', top: -3, insetInlineEnd: -3, minWidth: t.sp(18),
              height: t.sp(18), padding: '0 4px', borderRadius: 999, background: t.c.danger,
              border: `2px solid ${t.c.surface}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: t.font, fontWeight: 800, fontSize: t.fs(10.5),
              color: '#fff' }}>{unread}</span>
          )}
        </div>
      </div>

      {/* greeting row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 2px 16px' }}>
        <Avatar name={CAPTAIN.name} size={t.sp(48)} photo={photo} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.font, fontSize: t.fs(14), color: t.c.textMut }}>أهلاً بك،</div>
          <div style={{ fontFamily: t.font, fontSize: t.fs(20), fontWeight: 800, color: t.c.text }}>
            الكابتن {CAPTAIN.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
          background: t.c.goldSoft, borderRadius: 999 }}>
          <Icon name="star" size={t.fs(15)} color={t.c.gold} fill={t.c.gold} stroke={0} />
          <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14), color: t.c.text }}>
            {CAPTAIN.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* ONLINE / OFFLINE hero */}
      {online ? (
        <div style={{
          background: t.c.ink, borderRadius: t.r.xl, padding: t.sp(22),
          color: t.c.onInk, boxShadow: '0 18px 38px rgba(20,17,8,0.30)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* radar pulse */}
          <div style={{ position: 'absolute', insetInlineEnd: -30, top: -30, width: 160, height: 160 }}>
            <div className="sb-radar" style={{ position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${withA(t.c.gold, 0.5)}` }} />
            <div className="sb-radar sb-radar2" style={{ position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${withA(t.c.gold, 0.5)}` }} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="sb-blink" style={{ width: 11, height: 11, borderRadius: '50%', background: t.c.gold }} />
              <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(20), color: t.c.gold }}>{t.labels.online}</span>
              {shiftStart && (
                <span style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.14)' }}>
                  <Icon name="clock" size={t.fs(14)} color="#fff" stroke={2.4} />
                  <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13.5), color: '#fff',
                    direction: 'ltr' }}>{fmtClock(shiftElapsed)}</span>
                </span>
              )}
            </div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(15), opacity: 0.9, marginBottom: 18 }}>
              {mode === 'employee'
                ? 'جاهز لاستقبال الطلبات الموجَّهة إليك'
                : 'بانتظار طلب جديد — كن سريعاً في القبول'}
            </div>
            {/* waiting indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div className="sb-dots" style={{ display: 'flex', gap: 5 }}>
                <span /><span /><span />
              </div>
              <span style={{ fontFamily: t.font, fontSize: t.fs(14), opacity: 0.95 }}>
                {queueCount} طلب نشط في منطقتك الآن</span>
            </div>
            <button onClick={onSimulate} style={{
              width: '100%', height: t.sp(52), borderRadius: t.r.lg, border: 'none',
              background: 'rgba(255,255,255,0.16)', color: '#fff', cursor: 'pointer',
              fontFamily: t.font, fontWeight: 800, fontSize: t.fs(16), display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              backdropFilter: 'blur(2px)' }}>
              <Icon name="bell" size={t.fs(19)} color="#fff" stroke={2.2} />
              محاكاة وصول طلب
            </button>
            <button onClick={onStop} style={{
              width: '100%', height: t.sp(46), marginTop: 8, borderRadius: t.r.lg,
              border: '1.5px solid rgba(255,255,255,0.35)', background: 'transparent',
              color: '#fff', cursor: 'pointer', fontFamily: t.font, fontWeight: 800,
              fontSize: t.fs(15), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="power" size={t.fs(18)} color="#fff" stroke={2.4} />
              إنهاء الوردية وإيقاف الاستلام
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          background: t.c.surface, borderRadius: t.r.xl, padding: t.sp(24),
          border: `1px solid ${t.c.line}`, boxShadow: t.c.shadow, textAlign: 'center',
        }}>
          <div style={{ width: t.sp(72), height: t.sp(72), borderRadius: '50%',
            background: t.c.surfaceAlt, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 14px' }}>
            <Icon name="power" size={t.fs(34)} color={t.c.textMut} stroke={2.4} />
          </div>
          <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(20), color: t.c.text }}>
            أنت مغلق الآن</div>
          <div style={{ fontFamily: t.font, fontSize: t.fs(15), color: t.c.textMut, margin: '6px 0 20px' }}>
            ابدأ ورديتك لاستقبال الطلبات وتتبّع ساعات عملك</div>
          <Btn kind="primary" icon="power" onClick={onStart}>ابدأ الاستلام</Btn>
        </div>
      )}

      {/* captain badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
        margin: '16px 0 4px' }}>
        <Pill icon={mode === 'employee' ? 'shield' : 'bike'}
          color={mode === 'employee' ? t.c.blue : t.c.gold}
          bg={mode === 'employee' ? withA(t.c.blue, 0.12) : t.c.goldSoft}>
          {mode === 'employee' ? 'كابتن موظّف' : 'كابتن حر'}</Pill>
      </div>

      {/* today summary */}
      <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(16), color: t.c.text,
        margin: '20px 4px 10px' }}>ملخّص اليوم</div>
      <Card pad={6}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <StatChip icon="money" value={mode === 'employee' ? EMP_WALLET.dailyRate.toFixed(2) : earnings.today.toFixed(2)}
            label={mode === 'employee' ? 'راتب اليوم' : 'شيكل'} color={t.c.goldText} />
          <div style={{ width: 1, background: t.c.line, margin: '8px 0' }} />
          <StatChip icon="bag" value={mode === 'employee' ? EMP_WALLET.todayTrips : earnings.todayTrips} label="رحلة" />
          <div style={{ width: 1, background: t.c.line, margin: '8px 0' }} />
          <StatChip icon="clock" value={earnings.todayHours} label="مدة العمل" color={t.c.blue} />
        </div>
      </Card>

      <NotificationsSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

// HH:MM:SS clock for the running shift timer
function fmtClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

// ── Notifications center ─────────────────────────────────────
function NotificationsSheet({ open, onClose }) {
  const t = useTheme();
  const toneColor = (tone) => ({ gold: t.c.goldText, danger: t.c.danger, blue: t.c.blue,
    primary: t.c.primary }[tone] || t.c.textMut);
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: `${t.sp(18)}px ${t.sp(18)}px calc(${t.sp(20)}px + env(safe-area-inset-bottom,0px))`,
        maxHeight: '80%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: t.c.line, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Icon name="bell" size={t.fs(22)} color={t.c.text} stroke={2.3} />
          <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(20), color: t.c.text }}>
            الإشعارات</span>
        </div>
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {NOTIFICATIONS.map(n => {
            const c = toneColor(n.tone);
            return (
              <div key={n.id} style={{ display: 'flex', gap: 12, padding: t.sp(13),
                borderRadius: t.r.lg, background: n.unread ? withA(c, 0.07) : t.c.surface,
                border: `1px solid ${n.unread ? withA(c, 0.3) : t.c.line}` }}>
                <div style={{ width: t.sp(40), height: t.sp(40), borderRadius: 11, flexShrink: 0,
                  background: withA(c, 0.14), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={n.icon} size={t.fs(20)} color={c} stroke={2.3} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15), color: t.c.text }}>
                      {n.title}</span>
                    {n.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />}
                  </div>
                  <div style={{ fontFamily: t.font, fontSize: t.fs(13.5), color: t.c.textMut, lineHeight: 1.5,
                    marginTop: 2 }}>{n.body}</div>
                  <div style={{ fontFamily: t.font, fontSize: t.fs(11.5), color: t.c.textFaint, marginTop: 4 }}>
                    {n.when}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
function NewOrderSheet({ open, order, mode, onAccept, onReject, onExpire }) {
  const t = useTheme();
  const TOTAL = mode === 'employee' ? 45 : 18;
  const [left, setLeft] = React.useState(TOTAL);
  const [taken, setTaken] = React.useState(false);
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState(null);
  const [otherText, setOtherText] = React.useState('');
  const ref = React.useRef();

  React.useEffect(() => {
    if (!open) return;
    setLeft(TOTAL); setTaken(false); setRejecting(false); setReason(null); setOtherText('');
    const start = Date.now();
    ref.current = setInterval(() => {
      const el = Math.max(0, TOTAL - (Date.now() - start) / 1000);
      setLeft(el);
      if (el <= 0) { clearInterval(ref.current); setTaken(true); }
    }, 100);
    return () => clearInterval(ref.current);
  }, [open, order && order.id]);

  // pause the countdown while choosing a rejection reason
  React.useEffect(() => {
    if (rejecting && ref.current) clearInterval(ref.current);
  }, [rejecting]);

  if (!open || !order) return null;
  const prog = left / TOTAL;
  const urgent = left <= 6;
  const ringColor = urgent ? t.c.danger : (mode === 'employee' ? t.c.blue : t.c.primary);

  const REASONS = [
    { k: 'far', label: 'الموقع بعيد عني', icon: 'pin' },
    { k: 'busy', label: 'مشغول بطلب آخر', icon: 'bike' },
    { k: 'wait', label: 'وقت انتظار المطعم طويل', icon: 'store' },
    { k: 'fee', label: 'الأجرة غير مناسبة', icon: 'money' },
    { k: 'vehicle', label: 'مشكلة بالمركبة', icon: 'truck' },
    { k: 'other', label: 'سبب آخر', icon: 'note' },
  ];
  const canConfirm = reason && (reason !== 'other' || otherText.trim().length > 0);
  const doReject = () => onReject(reason === 'other' ? otherText.trim() : (REASONS.find(r => r.k === reason) || {}).label);

  return (
    <Sheet open={open} dim>
      <div style={{ padding: `${t.sp(18)}px ${t.sp(18)}px calc(${t.sp(22)}px + env(safe-area-inset-bottom,0px))`, overflowY: 'auto' }}>
        {rejecting ? (
          <React.Fragment>
            <div style={{ width: 44, height: 5, borderRadius: 3, background: t.c.line,
              margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <button onClick={() => setRejecting(false)} style={{ width: t.sp(38), height: t.sp(38),
                borderRadius: 11, border: 'none', background: t.c.surfaceAlt, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="chevR" size={t.fs(22)} color={t.c.text} stroke={2.4} style={{ transform: 'scaleX(-1)' }} />
              </button>
              <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(20), color: t.c.text }}>
                سبب الرفض</div>
            </div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(14), color: t.c.textMut, margin: '0 2px 16px' }}>
              اختر السبب لمساعدتنا على تحسين التوزيع</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REASONS.map(r => {
                const on = reason === r.k;
                return (
                  <button key={r.k} onClick={() => setReason(r.k)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: `0 ${t.sp(14)}px`,
                    height: t.sp(58), borderRadius: t.r.lg, cursor: 'pointer', textAlign: 'start',
                    background: on ? t.c.primarySoft : t.c.surface,
                    border: `1.5px solid ${on ? t.c.primary : t.c.line}` }}>
                    <div style={{ width: t.sp(34), height: t.sp(34), borderRadius: 10, flexShrink: 0,
                      background: on ? t.c.primary : t.c.surfaceAlt, display: 'flex',
                      alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={r.icon} size={t.fs(18)} color={on ? t.c.onPrimary : t.c.textMut} stroke={2.2} />
                    </div>
                    <span style={{ flex: 1, fontFamily: t.font, fontWeight: 700, fontSize: t.fs(15.5),
                      color: t.c.text }}>{r.label}</span>
                    <div style={{ width: t.sp(22), height: t.sp(22), borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${on ? t.c.primary : t.c.line}`, background: on ? t.c.primary : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {on && <Icon name="check" size={t.fs(14)} color={t.c.onPrimary} stroke={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {reason === 'other' && (
              <textarea value={otherText} onChange={e => setOtherText(e.target.value)}
                placeholder="اكتب السبب هنا..." rows={3} autoFocus
                style={{ width: '100%', marginTop: 12, padding: t.sp(14), borderRadius: t.r.lg,
                  border: `1.5px solid ${t.c.line}`, background: t.c.surface, resize: 'none',
                  fontFamily: t.font, fontSize: t.fs(15.5), fontWeight: 600, color: t.c.text,
                  outline: 'none', boxSizing: 'border-box' }} />
            )}

            <div style={{ marginTop: 18 }}>
              <Btn kind="danger" icon="x" disabled={!canConfirm} onClick={doReject}>تأكيد الرفض</Btn>
            </div>
            <button onClick={() => setRejecting(false)} style={{
              width: '100%', height: t.sp(48), marginTop: 8, background: 'transparent',
              border: 'none', color: t.c.textMut, fontFamily: t.font, fontWeight: 800,
              fontSize: t.fs(15), cursor: 'pointer' }}>تراجع</button>
          </React.Fragment>
        ) : taken ? (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: t.c.dangerSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="clock" size={34} color={t.c.danger} stroke={2.4} />
            </div>
            <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(21), color: t.c.text }}>
              {mode === 'employee' ? 'انتهى وقت التأكيد' : 'أخذه كابتن آخر'}</div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(15), color: t.c.textMut, margin: '8px 0 22px' }}>
              {mode === 'employee'
                ? 'تمت إعادة توجيه الطلب. ابقَ جاهزاً للطلب القادم.'
                : 'كن أسرع في المرة القادمة — الطلبات تُحجز بسرعة.'}</div>
            <Btn kind="soft" onClick={onExpire}>حسناً</Btn>
          </div>
        ) : (
          <React.Fragment>
            {/* grabber */}
            <div style={{ width: 44, height: 5, borderRadius: 3, background: t.c.line,
              margin: '0 auto 14px' }} />

            {/* header: badge + countdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Ring size={t.sp(70)} stroke={7} progress={prog} color={ringColor}>
                <div style={{ textAlign: 'center', lineHeight: 1 }}>
                  <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(22),
                    color: ringColor }}>{Math.ceil(left)}</div>
                  <div style={{ fontFamily: t.font, fontSize: t.fs(10), color: t.c.textMut }}>ثانية</div>
                </div>
              </Ring>
              <div style={{ flex: 1 }}>
                {mode === 'employee' ? (
                  <Pill icon="shield" color={t.c.blue} bg={withA(t.c.blue, 0.12)}>موجَّه إليك من الإدارة</Pill>
                ) : (
                  <Pill icon="flame" color={t.c.danger} bg={t.c.dangerSoft}>
                    {order.rivals} كباتن — الأسرع يفوز</Pill>
                )}
                <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(20),
                  color: t.c.text, marginTop: 6 }}>طلب جديد</div>
              </div>
              {/* fee – the number drivers care about */}
              <div style={{ textAlign: 'center', background: t.c.goldSoft, borderRadius: t.r.md,
                padding: '8px 12px', minWidth: 78 }}>
                <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(24), color: t.c.text }}>
                  {order.fee.toFixed(2)}</div>
                <div style={{ fontFamily: t.font, fontSize: t.fs(11), fontWeight: 700, color: t.c.textMut }}>
                  شيكل أجرتك</div>
              </div>
            </div>

            {/* route: store -> customer */}
            <div style={{ background: t.c.surfaceAlt, borderRadius: t.r.lg, padding: t.sp(14),
              marginBottom: 14 }}>
              <RouteRow icon="store" color={t.c.gold} title={order.store} sub={order.storeArea} t={t} />
              <div style={{ height: 22, marginInlineStart: t.sp(17), borderInlineStart: `2px dashed ${t.c.line}` }} />
              <RouteRow icon="pin" color={t.c.ink} title={order.customer} sub={order.customerArea} t={t} />
            </div>

            {/* quick facts */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <Fact icon="clock" label="الوقت المتوقع" value={`${order.minutes} د`} t={t} />
              <Fact icon="shield" label="الدفع" value="مُحوّل" t={t} />
            </div>

            {/* what you'll deliver — items, shown before accepting */}
            <div style={{ marginBottom: 18, padding: t.sp(14), background: t.c.surfaceAlt,
              borderRadius: t.r.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Icon name="bag" size={t.fs(18)} color={t.c.text} stroke={2.3} />
                <span style={{ fontFamily: t.font, fontSize: t.fs(14), fontWeight: 800, color: t.c.text }}>
                  محتويات الطلب</span>
                <span style={{ fontFamily: t.font, fontSize: t.fs(12.5), fontWeight: 700, color: t.c.textMut,
                  marginInlineStart: 'auto' }}>
                  {order.items.reduce((a, it) => a + it.q, 0)} قطعة</span>
              </div>
              {order.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 0', borderTop: i ? `1px solid ${t.c.line}` : 'none' }}>
                  <span style={{ minWidth: t.sp(28), height: t.sp(28), borderRadius: 8, flexShrink: 0,
                    background: t.c.surface, border: `1px solid ${t.c.line}`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontFamily: t.font, fontWeight: 800,
                    fontSize: t.fs(13), color: t.c.text }}>×{it.q}</span>
                  <span style={{ flex: 1, fontFamily: t.font, fontSize: t.fs(14.5), fontWeight: 600,
                    color: t.c.text, lineHeight: 1.4 }}>{it.n}</span>
                </div>
              ))}
            </div>

            {/* customer note (if any) */}
            {order.note ? (
              <div style={{ marginBottom: 18, padding: t.sp(12), background: t.c.goldSoft,
                borderRadius: t.r.md }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <Icon name="note" size={t.fs(17)} color={t.c.goldText} stroke={2.3} />
                  <span style={{ fontFamily: t.font, fontSize: t.fs(13), fontWeight: 800, color: t.c.goldText }}>
                    ملاحظات من الزبون</span>
                </div>
                <span style={{ fontFamily: t.font, fontSize: t.fs(14.5), fontWeight: 600,
                  color: t.c.text, lineHeight: 1.6, textWrap: 'pretty' }}>{order.note}</span>
              </div>
            ) : null}

            {/* actions */}
            <Btn kind="primary" icon="check" size="lg"
              onClick={onAccept}
              style={urgent ? { animation: 'sb-pulse 0.7s ease-in-out infinite' } : null}>
              {t.labels.accept}
            </Btn>
            <button onClick={() => mode === 'employee' ? setRejecting(true) : onReject()} style={{
              width: '100%', height: t.sp(48), marginTop: 10, background: 'transparent',
              border: 'none', color: t.c.textMut, fontFamily: t.font, fontWeight: 800,
              fontSize: t.fs(15), cursor: 'pointer' }}>
              {mode === 'employee' ? t.labels.reject : 'تجاهل'}
            </button>
          </React.Fragment>
        )}
      </div>
    </Sheet>
  );
}

function RouteRow({ icon, color, title, sub, tag, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: t.sp(34), height: t.sp(34), borderRadius: 10, flexShrink: 0,
        background: t.c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${t.c.line}` }}>
        <Icon name={icon} size={t.fs(19)} color={color} stroke={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(16), color: t.c.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontFamily: t.font, fontSize: t.fs(13), color: t.c.textMut,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
      </div>
      <span style={{ fontFamily: t.font, fontSize: t.fs(12.5), fontWeight: 700, color: t.c.textMut,
        whiteSpace: 'nowrap' }}>{tag}</span>
    </div>
  );
}

function Fact({ icon, label, value, t }) {
  return (
    <div style={{ flex: 1, background: t.c.surfaceAlt, borderRadius: t.r.md, padding: '10px 8px',
      textAlign: 'center' }}>
      <Icon name={icon} size={t.fs(18)} color={t.c.textMut} stroke={2.2}
        style={{ margin: '0 auto 4px' }} />
      <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14.5), color: t.c.text }}>{value}</div>
      <div style={{ fontFamily: t.font, fontSize: t.fs(11), color: t.c.textMut }}>{label}</div>
    </div>
  );
}

Object.assign(window, { HomeScreen, NewOrderSheet });
