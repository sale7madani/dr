// ds.jsx — Sunbul Captain design system: theme, icons, shared primitives
// Exports to window: ThemeCtx, useTheme, makeTheme, Icon, Btn, Card, Pill, Avatar,
//   Ring, Divider, Sheet, Stepper, SunbulMark

const ThemeCtx = React.createContext(null);
const useTheme = () => React.useContext(ThemeCtx);

// ── Theme builder ────────────────────────────────────────────
// reads tweak values and returns a flat token object the whole app uses.
function lum(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
  const r = parseInt(n.slice(0, 2), 16) / 255, g = parseInt(n.slice(2, 4), 16) / 255, b = parseInt(n.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function makeTheme(tw) {
  const dark = !!tw.dark;
  // Sonbol brand: gold accent on ink-black
  const accent = tw.primaryColor || '#f6c440';
  const onAccent = lum(accent) > 0.55 ? '#1d1a10' : '#ffffff';
  const density = tw.density || 'regular';
  const dens = { compact: 0.86, regular: 1, comfy: 1.14 }[density] || 1;

  const light = {
    bg: '#f7f5ee',
    surface: '#ffffff',
    surfaceAlt: '#f2efe4',
    line: '#e9e5d7',
    text: '#1c1a13',
    textMut: '#76736a',
    textFaint: '#a9a699',
    ink: '#1a1710',          // hero / brand-dark surfaces
    inkAlt: '#272318',
    onInk: '#ffffff',
    goldText: '#8a6d12',     // readable gold for text on light
    shadow: '0 2px 10px rgba(28,25,15,0.06), 0 8px 28px rgba(28,25,15,0.05)',
    shadowUp: '0 -2px 24px rgba(28,25,15,0.10)',
    overlay: 'rgba(18,16,10,0.55)',
  };
  const night = {
    bg: '#0f0e0a',
    surface: '#1a1812',
    surfaceAlt: '#23201708',
    line: '#2e2a1f',
    text: '#f3f1e7',
    textMut: '#9b988a',
    textFaint: '#62604f',
    ink: '#000000',
    inkAlt: '#16140d',
    onInk: '#ffffff',
    goldText: accent,
    shadow: '0 2px 12px rgba(0,0,0,0.45)',
    shadowUp: '0 -2px 28px rgba(0,0,0,0.55)',
    overlay: 'rgba(0,0,0,0.66)',
  };
  if (dark) night.surfaceAlt = '#231f15';
  const base = dark ? night : light;

  return {
    dark, density, dens,
    c: {
      ...base,
      primary: accent,
      onPrimary: onAccent,
      primarySoft: withA(accent, dark ? 0.2 : 0.16),
      gold: accent,
      goldSoft: withA(accent, dark ? 0.22 : 0.16),
      onGold: onAccent,
      inkSoft: dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,23,16,0.06)',
      danger: '#e0463c',
      dangerSoft: dark ? 'rgba(224,70,60,0.22)' : 'rgba(224,70,60,0.10)',
      blue: '#3b82d6',
    },
    font: tw.fontFamily || 'Tajawal',
    fs: (px) => Math.round(px * (tw.fontScale || 1)),
    sp: (px) => Math.round(px * dens),
    r: { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 },
    labels: {
      accept: tw.acceptLabel || 'قبول الطلب',
      reject: tw.rejectLabel || 'رفض',
      online: tw.onlineLabel || 'متّصل',
      offline: tw.offlineLabel || 'غير متّصل',
    },
  };
}

function withA(hex, a) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Icons (Lucide-style stroke paths) ────────────────────────
const ICONS = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5',
  wallet: 'M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v0H5.5M3 7.5V18a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3M3 7.5V9m17 4h-3.5a1.5 1.5 0 0 0 0 3H20',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
  store: 'M4 9V6.5L5.5 4h13L20 6.5V9M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M9 20v-5h5v5',
  pin: 'M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  phone: 'M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 6.6 1.5 1.5 0 0 1 5 4Z',
  nav: 'M3 11l18-8-8 18-2-8-8-2Z',
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12M18 6 6 18',
  chevL: 'M15 5l-7 7 7 7',
  chevR: 'M9 5l7 7-7 7',
  chevD: 'M6 9l6 6 6-6',
  power: 'M12 4v8M7.5 6.5a8 8 0 1 0 9 0',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17l-5.3 2.6 1-5.8-4.2-4.1 5.9-.9Z',
  bike: 'M5.5 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18.5 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.5 16h6l1.5-6h2M14 10l-2-4H9m7 4-1.5 6',
  money: 'M12 6v12M9 9.5C9 8 10.3 7 12 7s3 1 3 2.3c0 2.7-6 1.3-6 4.4 0 1.3 1.3 2.3 3 2.3s3-1 3-2.3M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
  bell: 'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10.5 20a1.8 1.8 0 0 0 3 0',
  bag: 'M6 8h12l-.8 11a1 1 0 0 1-1 .9H7.8a1 1 0 0 1-1-.9L6 8ZM9 8V6a3 3 0 0 1 6 0v2',
  receipt: 'M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3ZM9 8h6M9 12h6',
  cash: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 7h20v10H2zM6 7v.5M18 16.5V17',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1l-.4-2.5H10.6l-.4 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.5h3.8l.4-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6A7 7 0 0 0 19 12Z',
  logout: 'M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h10',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.5 9h17M3.5 15h17M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z',
  shield: 'M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z',
  doc: 'M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5',
  truck: 'M3 6h11v10H3zM14 9h4l3 3v4h-7M6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  flame: 'M12 3c1 3-1 4-1 6a3 3 0 0 0 5 1c1 2 1 3 1 4a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 1 3 .5.5-1.5-1-3 0-4.5Z',
  arrowR: 'M5 12h14M13 6l6 6-6 6',
  arrowL: 'M19 12H5M11 6l-6 6 6 6',
  trophy: 'M7 4h10v3a5 5 0 0 1-10 0V4ZM7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M9 14h6l-.5 4h-5L9 14ZM8 21h8',
  note: 'M5 4h14a1 1 0 0 1 1 1v10l-4 4H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM15 20v-4a1 1 0 0 1 1-1h4',
  plus: 'M12 5v14M5 12h14',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.2a2.5 2.5 0 0 1 4.6 1.3c0 1.7-2.1 2-2.1 3.5M12 17.5v.01',
  alert: 'M12 3 1.5 21h21L12 3ZM12 9.5v4.5M12 17.5v.01',
  headset: 'M5 13v-1a7 7 0 0 1 14 0v1M5 13a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v-5H5ZM19 13a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v-5h1M18 18v1a3 3 0 0 1-3 3h-3',
};

function Icon({ name, size = 24, color = 'currentColor', stroke = 2, fill = 'none', style }) {
  const d = ICONS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}>
      <path d={d} />
    </svg>
  );
}

// ── Sunbul wheat mark (simple emblem) ────────────────────────
function SunbulMark({ size = 28, color }) {
  const c = color || '#e6a417';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M12 21V8" />
      <path d="M12 8c0-2.2 1.4-3.6 3-4-.2 2-1 3.4-3 4Z" fill={c} />
      <path d="M12 8c0-2.2-1.4-3.6-3-4 .2 2 1 3.4 3 4Z" fill={c} />
      <path d="M12 12.5c0-2 1.3-3.2 2.8-3.6-.2 1.9-.9 3-2.8 3.6Z" fill={c} />
      <path d="M12 12.5c0-2-1.3-3.2-2.8-3.6.2 1.9.9 3 2.8 3.6Z" fill={c} />
      <path d="M12 16.5c0-1.8 1.2-2.9 2.6-3.3-.2 1.7-.8 2.8-2.6 3.3Z" fill={c} />
      <path d="M12 16.5c0-1.8-1.2-2.9-2.6-3.3.2 1.7.8 2.8 2.6 3.3Z" fill={c} />
    </svg>
  );
}

// ── Button ───────────────────────────────────────────────────
function Btn({ children, onClick, kind = 'primary', size = 'lg', icon, iconAfter,
  disabled, full = true, style }) {
  const t = useTheme();
  const H = { lg: t.sp(60), md: t.sp(50), sm: t.sp(42) }[size];
  const fs = { lg: t.fs(20), md: t.fs(17), sm: t.fs(15) }[size];
  const map = {
    primary: { bg: t.c.primary, fg: t.c.onPrimary, bd: 'transparent' },
    gold: { bg: t.c.gold, fg: '#231a02', bd: 'transparent' },
    danger: { bg: t.c.dangerSoft, fg: t.c.danger, bd: 'transparent' },
    ghost: { bg: 'transparent', fg: t.c.text, bd: t.c.line },
    soft: { bg: t.c.surfaceAlt, fg: t.c.text, bd: 'transparent' },
  }[kind];
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{
        height: H, width: full ? '100%' : 'auto', padding: full ? 0 : '0 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        background: map.bg, color: map.fg,
        border: `1.5px solid ${map.bd}`, borderRadius: t.r.lg,
        fontFamily: t.font, fontSize: fs, fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1,
        boxShadow: kind === 'primary' ? `0 8px 20px ${withA(t.c.primary, 0.28)}`
          : kind === 'gold' ? `0 8px 20px ${withA(t.c.gold, 0.3)}` : 'none',
        transition: 'transform .12s ease, opacity .15s', userSelect: 'none',
        WebkitTapHighlightColor: 'transparent', ...style,
      }}
      onPointerDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.975)')}
      onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onPointerLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
      {icon && <Icon name={icon} size={fs + 4} color={map.fg} stroke={2.4} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={fs + 4} color={map.fg} stroke={2.4} />}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────
function Card({ children, onClick, pad = 16, style }) {
  const t = useTheme();
  return (
    <div onClick={onClick} style={{
      background: t.c.surface, borderRadius: t.r.lg, padding: t.sp(pad),
      border: `1px solid ${t.c.line}`, boxShadow: t.c.shadow,
      cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</div>
  );
}

// ── Pill / Tag ───────────────────────────────────────────────
function Pill({ children, color, bg, icon, style }) {
  const t = useTheme();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: t.r.pill,
      background: bg || t.c.surfaceAlt, color: color || t.c.textMut,
      fontFamily: t.font, fontSize: t.fs(13.5), fontWeight: 700,
      lineHeight: 1, whiteSpace: 'nowrap', ...style,
    }}>
      {icon && <Icon name={icon} size={t.fs(15)} color={color || t.c.textMut} stroke={2.4} />}
      {children}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────
function Avatar({ name, size = 44, color, photo }) {
  const t = useTheme();
  const initials = (name || '؟').trim().charAt(0);
  const bg = color || t.c.ink;
  const fg = color ? (lum(color) > 0.55 ? '#1d1a10' : '#fff') : t.c.gold;
  if (photo) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
        overflow: 'hidden', background: t.c.surfaceAlt }}>
        <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover',
          display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: t.font, fontWeight: 800, fontSize: size * 0.4,
    }}>{initials}</div>
  );
}

// ── Countdown ring ───────────────────────────────────────────
function Ring({ size = 72, stroke = 7, progress = 1, color, track, children }) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={track || t.c.surfaceAlt} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color || t.c.primary} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
          style={{ transition: 'stroke-dashoffset .95s linear, stroke .3s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  );
}

// ── Confirm dialog (centered) ────────────────────────────────
function ConfirmDialog({ open, title, body, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء',
  danger = false, icon = 'alert', onConfirm, onClose }) {
  const t = useTheme();
  if (!open) return null;
  const accent = danger ? t.c.danger : t.c.primary;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      background: t.c.overlay, animation: 'sb-fade .18s ease' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 360,
        background: t.c.surface, borderRadius: t.r.xl, padding: t.sp(22), textAlign: 'center',
        boxShadow: t.c.shadow, animation: 'sb-pop .24s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ width: t.sp(60), height: t.sp(60), borderRadius: '50%', margin: '0 auto 14px',
          background: danger ? t.c.dangerSoft : t.c.primarySoft, display: 'flex',
          alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={t.fs(30)} color={accent} stroke={2.3} />
        </div>
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(20), color: t.c.text }}>{title}</div>
        {body ? (
          <div style={{ fontFamily: t.font, fontSize: t.fs(15), color: t.c.textMut, margin: '8px 0 0',
            lineHeight: 1.6 }}>{body}</div>
        ) : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Btn kind="soft" size="md" onClick={onClose}>{cancelLabel}</Btn>
          <Btn kind={danger ? 'danger' : 'primary'} size="md" onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  const t = useTheme();
  return <div style={{ height: 1, background: t.c.line, margin: '0' }} />;
}

// ── Bottom sheet / full overlay ──────────────────────────────
function Sheet({ open, onClose, children, full = false, dim = true }) {
  const t = useTheme();
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      display: 'flex', alignItems: full ? 'stretch' : 'flex-end',
      background: dim ? t.c.overlay : 'transparent',
      animation: 'sb-fade .2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%',
        background: t.c.surface,
        borderRadius: full ? 0 : `${t.r.xl}px ${t.r.xl}px 0 0`,
        boxShadow: t.c.shadowUp,
        animation: full ? 'sb-rise-full .28s cubic-bezier(.2,.8,.2,1)' : 'sb-rise .3s cubic-bezier(.2,.8,.2,1)',
        display: 'flex', flexDirection: 'column', maxHeight: '100%',
      }}>{children}</div>
    </div>
  );
}

// ── Stage stepper (horizontal) ───────────────────────────────
function Stepper({ steps, current }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {steps.map((s, i) => {
        const done = i < current, active = i === current;
        const on = done || active;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                width: t.sp(34), height: t.sp(34), borderRadius: '50%',
                background: on ? t.c.primary : t.c.surfaceAlt,
                color: on ? '#fff' : t.c.textFaint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: active ? `3px solid ${t.c.primarySoft}` : 'none',
                boxShadow: active ? `0 0 0 3px ${withA(t.c.primary, 0.18)}` : 'none',
              }}>
                {done ? <Icon name="check" size={t.fs(18)} color={t.c.onPrimary} stroke={3} />
                  : <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14), color: on ? t.c.onPrimary : t.c.textFaint }}>{i + 1}</span>}
              </div>
              <span style={{ fontFamily: t.font, fontSize: t.fs(11), fontWeight: 700,
                color: on ? t.c.text : t.c.textFaint, textAlign: 'center', width: 56 }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 3, borderRadius: 2, marginBottom: 22,
                background: i < current ? t.c.primary : t.c.line }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  ThemeCtx, useTheme, makeTheme, withA, lum, Icon, SunbulMark,
  Btn, Card, Pill, Avatar, Ring, Divider, Sheet, Stepper, ConfirmDialog,
});
