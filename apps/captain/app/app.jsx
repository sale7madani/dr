// app.jsx — Sunbul Captain shell: state machine, bottom nav, tweaks
// Renders into #root. Depends on all other app/*.jsx + frames being loaded first.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#f6c440",
  "fontFamily": "Tajawal",
  "fontScale": 1,
  "density": "regular",
  "dark": false,
  "soundOn": true,
  "acceptLabel": "قبول الطلب",
  "rejectLabel": "رفض",
  "onlineLabel": "متّصل",
  "offlineLabel": "غير متّصل"
}/*EDITMODE-END*/;

const NAV = [
  { key: 'home', label: 'الرئيسية', icon: 'home' },
  { key: 'earnings', label: 'أرباحي', icon: 'wallet' },
  { key: 'history', label: 'السجل', icon: 'clock' },
  { key: 'profile', label: 'حسابي', icon: 'user' },
];

function BottomNav({ tab, setTab, t }) {
  return (
    <div style={{ display: 'flex', background: t.c.surface, borderTop: `1px solid ${t.c.line}`,
      padding: `${t.sp(8)}px ${t.sp(8)}px calc(${t.sp(6)}px + env(safe-area-inset-bottom, 0px))`,
      flexShrink: 0, boxShadow: t.c.shadowUp }}>
      {NAV.map(n => {
        const on = tab === n.key;
        return (
          <button key={n.key} onClick={() => setTab(n.key)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 0',
            WebkitTapHighlightColor: 'transparent' }}>
            <div style={{ width: t.sp(46), height: t.sp(30), borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? t.c.primarySoft : 'transparent', transition: 'background .2s' }}>
              <Icon name={n.icon} size={t.fs(23)} color={on ? t.c.primary : t.c.textMut}
                stroke={on ? 2.5 : 2} fill={on ? withA(t.c.primary, 0.12) : 'none'} />
            </div>
            <span style={{ fontFamily: t.font, fontSize: t.fs(11.5), fontWeight: on ? 800 : 600,
              color: on ? t.c.primary : t.c.textMut }}>{n.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function OfflineBanner({ t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '8px 12px', background: t.c.danger, color: '#fff', flexShrink: 0 }}>
      <span className="sb-blink" style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff' }} />
      <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13.5) }}>
        لا يوجد اتصال بالإنترنت — تتم إعادة المحاولة…</span>
    </div>
  );
}

function fmtDur(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h} س ${m} د` : `${m} د`;
}

function ShiftSummarySheet({ open, data, onClose }) {
  const t = useTheme();
  if (!open || !data) return null;
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: `${t.sp(22)}px ${t.sp(20)}px calc(${t.sp(24)}px + env(safe-area-inset-bottom,0px))`,
        textAlign: 'center' }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: t.c.line, margin: '0 auto 18px' }} />
        <div className="sb-pop" style={{ width: t.sp(72), height: t.sp(72), borderRadius: '50%',
          background: t.c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px' }}>
          <Icon name="check" size={t.fs(36)} color={t.c.gold} stroke={3} />
        </div>
        <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(22), color: t.c.text }}>
          انتهت ورديتك</div>
        <div style={{ fontFamily: t.font, fontSize: t.fs(15), color: t.c.textMut, margin: '6px 0 20px' }}>
          عمل رائع اليوم يا كابتن 👏</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <ShiftStat icon="clock" value={fmtDur(data.ms)} label="مدة الوردية" color={t.c.blue} t={t} />
          <ShiftStat icon="bike" value={data.trips} label="طلب" color={t.c.primary} t={t} />
          <ShiftStat icon="money" value={data.earned.toFixed(2)} label="شيكل" color={t.c.goldText} t={t} />
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn kind="primary" onClick={onClose}>تمام</Btn>
        </div>
      </div>
    </Sheet>
  );
}

function ShiftStat({ icon, value, label, color, t }) {
  return (
    <div style={{ flex: 1, background: t.c.surfaceAlt, borderRadius: t.r.lg, padding: `${t.sp(14)}px ${t.sp(6)}px` }}>
      <Icon name={icon} size={t.fs(22)} color={color} stroke={2.3} style={{ margin: '0 auto 6px' }} />
      <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(17), color: t.c.text }}>{value}</div>
      <div style={{ fontFamily: t.font, fontSize: t.fs(11.5), fontWeight: 600, color: t.c.textMut,
        marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ResumeBar({ order, onResume, t }) {
  return (
    <div onClick={onResume} style={{ display: 'flex', alignItems: 'center', gap: 12,
      padding: `${t.sp(10)}px ${t.sp(16)}px`, background: t.c.ink, cursor: 'pointer',
      flexShrink: 0 }}>
      <span className="sb-blink" style={{ width: 10, height: 10, borderRadius: '50%', background: t.c.gold }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15), color: '#fff' }}>
          طلب جارٍ #{order.id}</div>
        <div style={{ fontFamily: t.font, fontSize: t.fs(12.5), color: 'rgba(255,255,255,0.85)' }}>
          اضغط لمتابعة التوصيل</div>
      </div>
      <Icon name="chevR" size={t.fs(22)} color="#fff" stroke={2.6}
        style={{ transform: 'scaleX(-1)' }} />
    </div>
  );
}

/* ===== جسر ناقل الأحداث (Hub) ===== */
function captainFromHub(h) {
  return {
    id: h.id, number: h.number,
    store: h.restaurantName || 'مطعم', storeArea: h.restaurantArea || '', storePhone: h.restaurantPhone || '',
    customer: h.customerName || 'زبون', customerArea: h.customerArea || h.address || '', customerPhone: h.customerPhone || '',
    items: (h.items || []).map((i) => ({ n: i.name, q: i.qty })),
    note: h.note || '',
    total: h.subtotal || h.total || 0, fee: h.deliveryFee || 0,
    pay: h.paid ? 'مدفوع إلكترونياً' : 'نقداً عند التسليم',
    distKm: h.km || 2.5, minutes: h.etaMax || 15, distToStore: 1.0,
    rivals: 0, _hub: true,
  };
}
function captainStatusHub(o, status) {
  return { id: o.id, number: o.number, status: status, captainId: 'cap-self', captainName: (window.CAPTAIN && CAPTAIN.fullName) || 'الكابتن' };
}

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = React.useMemo(() => makeTheme(tw), [tw]);
  const t = theme;

  const [account, setAccount] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_account') || 'null'); } catch (e) { return null; }
  });
  const [tab, setTab] = React.useState('home');
  const [online, setOnline] = React.useState(() => {
    try { return !!localStorage.getItem('sb_shift'); } catch (e) { return false; }
  });
  const [incoming, setIncoming] = React.useState(null);
  const [active, setActive] = React.useState(null);
  const [stageIdx, setStageIdx] = React.useState(0);
  const [view, setView] = React.useState('tabs'); // tabs | delivery | delivered
  const [call, setCall] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null); // {title, body, confirmLabel, danger, onConfirm}
  const [photo, setPhoto] = React.useState(() => {
    try { return localStorage.getItem('sb_photo') || null; } catch (e) { return null; }
  });
  const setPhotoPersist = (data) => {
    setPhoto(data);
    try { data ? localStorage.setItem('sb_photo', data) : localStorage.removeItem('sb_photo'); } catch (e) {}
  };
  const autoRef = React.useRef(false);

  // #6 connectivity banner
  const [offlineNet, setOfflineNet] = React.useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);
  React.useEffect(() => {
    const on = () => setOfflineNet(false), off = () => setOfflineNet(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // #2 work shift
  const [shiftStart, setShiftStart] = React.useState(() => {
    try { const v = localStorage.getItem('sb_shift'); return v ? +v : null; } catch (e) { return null; }
  });
  const [shiftSummary, setShiftSummary] = React.useState(null);
  const startShift = () => {
    const now = Date.now(); setShiftStart(now); setOnline(true);
    try { localStorage.setItem('sb_shift', String(now)); } catch (e) {}
  };
  const endShift = () => {
    const ms = shiftStart ? Date.now() - shiftStart : 0;
    setShiftSummary({ ms, trips: mode === 'employee' ? EMP_WALLET.todayTrips : EARNINGS.todayTrips,
      earned: mode === 'employee' ? EMP_WALLET.dailyRate : EARNINGS.today });
    setShiftStart(null); setOnline(false);
    try { localStorage.removeItem('sb_shift'); } catch (e) {}
  };

  // captain mode is determined by the logged-in account type
  const mode = account?.type || 'employee';
  const login = (acc) => {
    setAccount(acc);
    try { localStorage.setItem('sb_account', JSON.stringify(acc)); } catch (e) {}
    setTab('home'); setView('tabs'); setOnline(true);
    setActive(null); setIncoming(null); autoRef.current = false;
  };
  const doLogout = () => {
    setAccount(null);
    try { localStorage.removeItem('sb_account'); } catch (e) {}
    setActive(null); setIncoming(null); setView('tabs'); setTab('home');
  };
  const logout = () => setConfirm({
    title: 'تسجيل الخروج؟', body: 'سيتم إنهاء جلستك وتحتاج لتسجيل الدخول مرة أخرى.',
    confirmLabel: 'تسجيل الخروج', icon: 'logout', danger: true, onConfirm: doLogout,
  });

  // keep browser chrome / overscroll colour in sync with the theme
  React.useEffect(() => {
    const root = document.getElementById('root');
    if (root) root.style.background = t.c.bg;
    document.documentElement.style.background = t.c.bg;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t.c.bg);
  }, [t.c.bg]);

  // play the alert sound whenever a new order pops up (respects the sound toggle)
  React.useEffect(() => {
    if (incoming && tw.soundOn !== false) playOrderChime();
    if (!incoming) stopOrderChime();
  }, [incoming]);

  // unlock audio on the first tap anywhere (browsers gate autoplay behind a gesture)
  React.useEffect(() => {
    const unlock = () => primeAudio();
    window.addEventListener('pointerdown', unlock, { once: false });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // auto-offer a demo order shortly after going online (once) — skipped when the live hub is connected
  React.useEffect(() => {
    if (online && !active && !incoming && !autoRef.current && !(window.SonbolHub && SonbolHub.connected)) {
      autoRef.current = true;
      const id = setTimeout(() => { if (!active) setIncoming(makeIncomingOrder()); }, 3500);
      return () => clearTimeout(id);
    }
    if (!online) autoRef.current = false;
  }, [online, active]);

  // استقبال الطلبات الجاهزة من المطعم عبر الـ hub
  const hubOffered = React.useRef({});
  React.useEffect(() => {
    if (!window.SonbolHub) return;
    function handle(h) {
      if (!h || !h.id) return;
      if (h.status === 'ready' && !h.captainId && online && !active && !incoming && !hubOffered.current[h.id]) {
        hubOffered.current[h.id] = true;
        setIncoming(captainFromHub(h)); // يشغّل التنبيه الصوتي عبر تأثير incoming
      }
    }
    const off1 = SonbolHub.on('order', handle);
    const off2 = SonbolHub.on('init', (list) => list.forEach(handle));
    SonbolHub.connect();
    return () => { off1 && off1(); off2 && off2(); };
  }, [online, active, incoming]);

  const simulate = () => { primeAudio(); if (!active) setIncoming(makeIncomingOrder()); };
  const accept = () => {
    const ord = incoming;
    setActive(ord); setIncoming(null); setStageIdx(0); setView('delivery'); setOnline(true);
    if (window.SonbolHub && ord) SonbolHub.publish(captainStatusHub(ord, 'onway')); // استلمه الكابتن → في الطريق
  };
  const advance = () => {
    setStageIdx(i => {
      if (i >= DELIVERY_STAGES.length - 1) { setView('delivered'); return i; }
      return i + 1;
    });
  };
  const finishDelivery = () => {
    if (window.SonbolHub && active) SonbolHub.publish(captainStatusHub(active, 'delivered')); // تم التسليم للزبون
    setActive(null); setStageIdx(0); setView('tabs'); setTab('home'); autoRef.current = false;
  };
  const cancelOrder = () => setConfirm({
    title: 'إلغاء الطلب؟',
    body: 'سيُعاد الطلب إلى الإدارة لإعادة توجيهه لكابتن آخر. قد يؤثر الإلغاء المتكرر على تقييمك.',
    confirmLabel: 'تأكيد الإلغاء', icon: 'alert', danger: true,
    onConfirm: () => { setActive(null); setStageIdx(0); setView('tabs'); setTab('home'); autoRef.current = false; },
  });

  let content;
  if (view === 'delivery' && active) {
    content = <DeliveryScreen order={active} mode={mode} stageIdx={stageIdx}
      onAdvance={advance} onMinimize={() => setView('tabs')}
      onCall={(n, p) => setCall({ name: n, phone: p })} onCancelOrder={cancelOrder} />;
  } else if (view === 'delivered' && active) {
    content = <DeliveredScreen order={active} onDone={finishDelivery} />;
  } else {
    const screen = tab === 'home'
      ? <HomeScreen online={online} onSimulate={simulate}
          mode={mode} earnings={EARNINGS} queueCount={ORDERS_QUEUE.length} photo={photo}
          shiftStart={shiftStart} onStart={startShift} onStop={endShift} />
      : tab === 'earnings' ? <EarningsScreen earnings={EARNINGS} mode={mode} />
      : tab === 'history' ? <HistoryScreen mode={mode} />
      : <ProfileScreen mode={mode} account={account} photo={photo} setPhoto={setPhotoPersist}
          dark={!!tw.dark} setDark={v => setTweak('dark', v)} onLogout={logout}
          soundOn={tw.soundOn !== false} setSound={v => { setTweak('soundOn', v); if (v) { primeAudio(); playOrderChime({ repeat: 1 }); } }} />;
    content = <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>{screen}</div>;
  }

  const showTabsChrome = view === 'tabs';

  // not logged in → login screen (account type decides the mode)
  if (!account) {
    return (
      <ThemeCtx.Provider value={theme}>
        <div dir="rtl" className="sb-app" style={{ height: '100%', overflow: 'hidden',
          background: t.c.bg, color: t.c.text, fontFamily: t.font }}>
          <LoginScreen onLogin={login} />
        </div>
        <TweaksPanel>
          <TweakSection label="الهوية" />
          <TweakColor label="اللون الأساسي" value={tw.primaryColor}
            options={['#f6c440', '#f3a52e', '#e8b400', '#36b37e', '#3b82d6']}
            onChange={v => setTweak('primaryColor', v)} />
          <TweakToggle label="الوضع الليلي" value={!!tw.dark} onChange={v => setTweak('dark', v)} />
          <TweakSelect label="نوع الخط" value={tw.fontFamily}
            options={['Tajawal', 'Cairo', 'IBM Plex Sans Arabic', 'Almarai']}
            onChange={v => setTweak('fontFamily', v)} />
        </TweaksPanel>
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={theme}>
      <div dir="rtl" className="sb-app" style={{ height: '100%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', background: t.c.bg, color: t.c.text, fontFamily: t.font }}>
        {offlineNet && <OfflineBanner t={t} />}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{content}</div>

        {showTabsChrome && active && (
          <ResumeBar order={active} onResume={() => setView('delivery')} t={t} />
        )}
        {showTabsChrome && <BottomNav tab={tab} setTab={setTab} t={t} />}

        {/* overlays anchored to app viewport */}
        <NewOrderSheet open={!!incoming} order={incoming} mode={mode}
          onAccept={accept} onReject={() => setIncoming(null)} onExpire={() => setIncoming(null)} />
        <CallSheet open={!!call} name={call?.name} phone={call?.phone} onClose={() => setCall(null)} />
        <ConfirmDialog open={!!confirm} title={confirm?.title} body={confirm?.body}
          confirmLabel={confirm?.confirmLabel} icon={confirm?.icon || 'alert'} danger={confirm?.danger}
          onConfirm={() => { const c = confirm; setConfirm(null); c && c.onConfirm && c.onConfirm(); }}
          onClose={() => setConfirm(null)} />
        <ShiftSummarySheet open={!!shiftSummary} data={shiftSummary} onClose={() => setShiftSummary(null)} />
      </div>

      <TweaksPanel>
        <TweakSection label="الحساب" />
        <div style={{ fontSize: 12.5, opacity: 0.7, lineHeight: 1.5, marginBottom: 8 }}>
          سجّل خروجك للدخول بحساب آخر.
        </div>
        <TweakButton label="تسجيل الخروج" onClick={logout} />

        <TweakSection label="الوضع" />
        <TweakToggle label="الوضع الليلي" value={!!tw.dark} onChange={v => setTweak('dark', v)} />

        <TweakSection label="الهوية" />
        <TweakColor label="اللون الأساسي" value={tw.primaryColor}
          options={['#f6c440', '#f3a52e', '#e8b400', '#36b37e', '#3b82d6']}
          onChange={v => setTweak('primaryColor', v)} />

        <TweakSection label="الخط والكثافة" />
        <TweakSelect label="نوع الخط" value={tw.fontFamily}
          options={['Tajawal', 'Cairo', 'IBM Plex Sans Arabic', 'Almarai']}
          onChange={v => setTweak('fontFamily', v)} />
        <TweakSlider label="حجم الخط" value={tw.fontScale} min={0.9} max={1.3} step={0.05}
          onChange={v => setTweak('fontScale', v)} />
        <TweakRadio label="كثافة المعلومات" value={tw.density}
          options={[{ value: 'compact', label: 'مدمج' }, { value: 'regular', label: 'عادي' }, { value: 'comfy', label: 'مريح' }]}
          onChange={v => setTweak('density', v)} />

        <TweakSection label="نصوص الأزرار" />
        <TweakText label="زر القبول" value={tw.acceptLabel} onChange={v => setTweak('acceptLabel', v)} />
        <TweakText label="زر الرفض" value={tw.rejectLabel} onChange={v => setTweak('rejectLabel', v)} />
        <TweakText label="حالة الاتصال" value={tw.onlineLabel} onChange={v => setTweak('onlineLabel', v)} />
      </TweaksPanel>
    </ThemeCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
