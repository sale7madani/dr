// map.jsx — dead-simple trip illustration: just two labelled pins.
// Restaurant pin (name above it) and customer pin (first name above it),
// connected by a dotted path. Everything stays inside the phone frame.
// Exports to window: MapView

function MapView({ height = 224, store = 'المطعم', customer = 'الزبون',
  activeLeg = 'toCustomer', style }) {
  const t = useTheme();
  const land = t.dark ? '#14180f' : '#eef1e6';
  const blob = t.dark ? '#1c2415' : '#e3ead4';
  const blob2 = t.dark ? '#19231a' : '#dce7d8';
  const headingToStore = activeLeg === 'toStore';
  const firstName = (customer || '').trim().split(' ')[0];

  // pin anchor points (in the 360×200 viewBox) kept well inside the edges
  const STORE = { x: 252, y: 150 };
  const CUST = { x: 116, y: 104 };
  const pct = (p, axis) => axis === 'x' ? (p / 360) * 100 : (p / 200) * 100;

  return (
    <div style={{
      position: 'relative', width: '100%', height, overflow: 'hidden',
      borderRadius: t.r.lg, background: land, border: `1px solid ${t.c.line}`,
      boxShadow: t.c.shadow, ...style,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, display: 'block' }}>
        {/* very soft, abstract ground — just hints of a city */}
        <circle cx="60" cy="160" r="60" fill={blob} />
        <circle cx="320" cy="40" r="54" fill={blob2} />
        <rect x="150" y="120" width="120" height="80" rx="20" fill={blob} opacity="0.7" />
        {/* the trip path */}
        <path d={`M ${STORE.x} ${STORE.y} C 210 150 200 104 ${CUST.x} ${CUST.y}`}
          fill="none" stroke={t.c.gold} strokeWidth="5" strokeLinecap="round"
          strokeDasharray="2 11" />
      </svg>

      {/* the two pins, each with its name above */}
      <MapPin leftPct={pct(STORE.x, 'x')} topPct={pct(STORE.y, 'y')}
        color={t.c.gold} glyph="store" kicker="المطعم" name={store}
        t={t} active={headingToStore} />
      <MapPin leftPct={pct(CUST.x, 'x')} topPct={pct(CUST.y, 'y')}
        color={t.c.ink} glyph="pin" kicker="الزبون" name={firstName}
        t={t} active={!headingToStore} />
    </div>
  );
}

function MapPin({ leftPct, topPct, color, glyph, kicker, name, t, active }) {
  const onColor = lum(color) > 0.55 ? '#1d1a10' : '#fff';
  return (
    <div style={{ position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`,
      transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', width: 'max-content', maxWidth: 150, pointerEvents: 'none' }}>
      {/* name label */}
      <div style={{ padding: '5px 11px', background: t.c.surface, borderRadius: 12,
        boxShadow: t.c.shadow, border: `1.5px solid ${active ? color : t.c.line}`,
        marginBottom: 6, textAlign: 'center', maxWidth: 150 }}>
        <div style={{ fontFamily: t.font, fontSize: t.fs(10.5), fontWeight: 700, color: t.c.textMut,
          lineHeight: 1.2 }}>{kicker}</div>
        <div style={{ fontFamily: t.font, fontSize: t.fs(14), fontWeight: 800, color: t.c.text,
          lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: 130 }}>{name}</div>
      </div>
      {/* teardrop pin */}
      <div style={{ position: 'relative', width: 34, height: 34 }}>
        {active && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 40, height: 40,
            transform: 'translate(-50%,-50%)', borderRadius: '50%', background: withA(color, 0.28),
            animation: 'sb-radar-a 2s ease-out infinite' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50% 50% 50% 0',
          transform: 'rotate(45deg)', background: color, border: `3px solid ${t.c.surface}`,
          boxShadow: t.c.shadow }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center' }}>
          <Icon name={glyph} size={17} color={onColor} stroke={2.4} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MapView });
