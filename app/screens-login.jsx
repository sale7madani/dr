// screens-login.jsx — login by user account; account type drives the captain mode
// Exports to window: LoginScreen

// demo accounts the programmer can map to real auth later
const DEMO_ACCOUNTS = {
  'mahmoud': { type: 'employee', name: 'محمود', user: 'mahmoud' },
  'driver01': { type: 'employee', name: 'محمود', user: 'driver01' },
  'ali': { type: 'freelancer', name: 'علي', user: 'ali' },
  'free01': { type: 'freelancer', name: 'علي', user: 'free01' },
};

function LoginScreen({ onLogin }) {
  const t = useTheme();
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [err, setErr] = React.useState('');
  const [show, setShow] = React.useState(false);

  const submit = () => {
    const key = user.trim().toLowerCase();
    const acc = DEMO_ACCOUNTS[key];
    if (!acc || !pass) {
      setErr(acc ? 'أدخل كلمة المرور' : 'اسم المستخدم غير صحيح');
      return;
    }
    onLogin(acc);
  };

  const quick = (key) => onLogin(DEMO_ACCOUNTS[key]);

  const field = (icon, value, set, ph, type, extra) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: t.sp(58),
      padding: '0 16px', background: t.c.surface, borderRadius: t.r.lg,
      border: `1.5px solid ${t.c.line}`, marginBottom: 12 }}>
      <Icon name={icon} size={t.fs(20)} color={t.c.textMut} stroke={2.2} />
      <input value={value} onChange={e => { set(e.target.value); setErr(''); }}
        placeholder={ph} type={type}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: t.font, fontSize: t.fs(16), fontWeight: 600, color: t.c.text,
          direction: type === 'password' ? 'ltr' : 'ltr', textAlign: 'start' }} />
      {extra}
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: t.c.bg,
      overflowY: 'auto' }}>
      {/* brand header */}
      <div style={{ background: t.c.ink, padding: `calc(${t.sp(56)}px + env(safe-area-inset-top,0px)) ${t.sp(24)}px ${t.sp(44)}px`,
        borderRadius: `0 0 ${t.r.xl}px ${t.r.xl}px`, position: 'relative', overflow: 'hidden',
        flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ position: 'absolute', insetInlineStart: -40, bottom: -40, width: 180, height: 180,
          borderRadius: '50%', border: `2px solid ${withA(t.c.gold, 0.18)}` }} />
        <img src="assets/sonbol-gold.png" alt="Sonbol" style={{ height: t.fs(44), display: 'block', position: 'relative' }} />
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(22), color: t.c.onInk,
          marginTop: 18, position: 'relative' }}>تطبيق الكابتن</div>
        <div style={{ fontFamily: t.font, fontSize: t.fs(15), color: withA(t.c.gold, 0.95), marginTop: 4,
          position: 'relative' }}>
          سجّل دخولك للبدء باستقبال الطلبات</div>
      </div>

      {/* form */}
      <div style={{ padding: `${t.sp(28)}px ${t.sp(20)}px`, flex: 1 }}>
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15), color: t.c.text,
          margin: '0 2px 12px' }}>تسجيل الدخول</div>

        {field('user', user, setUser, 'اسم المستخدم', 'text')}
        {field('shield', pass, setPass, 'كلمة المرور', show ? 'text' : 'password',
          <button onClick={() => setShow(s => !s)} style={{ background: 'transparent', border: 'none',
            cursor: 'pointer', padding: 4, fontFamily: t.font, fontSize: t.fs(13), fontWeight: 700,
            color: t.c.goldText }}>{show ? 'إخفاء' : 'إظهار'}</button>)}

        {err && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 2px 12px' }}>
            <Icon name="x" size={t.fs(15)} color={t.c.danger} stroke={2.6} />
            <span style={{ fontFamily: t.font, fontSize: t.fs(13.5), fontWeight: 700, color: t.c.danger }}>{err}</span>
          </div>
        )}

        <Btn kind="primary" icon="arrowL" onClick={submit}>دخول</Btn>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: t.font, fontSize: t.fs(14), fontWeight: 700, color: t.c.textMut }}>
            نسيت كلمة المرور؟</button>
        </div>

        {/* demo quick-login — for preview only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 14px' }}>
          <div style={{ flex: 1, height: 1, background: t.c.line }} />
          <span style={{ fontFamily: t.font, fontSize: t.fs(12), fontWeight: 700, color: t.c.textFaint }}>
            دخول تجريبي سريع</span>
          <div style={{ flex: 1, height: 1, background: t.c.line }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <DemoCard icon="shield" title="الكابتن محمود" sub="موظّف" color={t.c.blue}
            onClick={() => quick('mahmoud')} t={t} />
          <DemoCard icon="bike" title="الكابتن علي" sub="كابتن حر" color={t.c.goldText}
            onClick={() => quick('ali')} t={t} />
        </div>
      </div>
    </div>
  );
}

function DemoCard({ icon, title, sub, color, onClick, t }) {
  return (
    <button onClick={onClick} style={{ flex: 1, background: t.c.surface, border: `1.5px solid ${t.c.line}`,
      borderRadius: t.r.lg, padding: `${t.sp(16)}px ${t.sp(12)}px`, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, textAlign: 'center' }}>
      <div style={{ width: t.sp(44), height: t.sp(44), borderRadius: 13, background: withA(color, 0.13),
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={t.fs(22)} color={color} stroke={2.2} />
      </div>
      <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14), color: t.c.text }}>{title}</span>
      <span style={{ fontFamily: t.font, fontSize: t.fs(12), color: t.c.textMut, direction: 'ltr' }}>{sub}</span>
    </button>
  );
}

Object.assign(window, { LoginScreen, DEMO_ACCOUNTS });
