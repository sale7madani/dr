// screens-misc.jsx — Earnings/wallet, History, Profile/settings, Call sheet
// Exports to window: EarningsScreen, HistoryScreen, ProfileScreen, CallSheet

function ScreenTitle({ children, icon, subtitle, action }) {
  const t = useTheme();
  return (
    <div style={{ padding: `${t.sp(14)}px ${t.sp(18)}px ${t.sp(10)}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && (
          <div style={{ width: t.sp(42), height: t.sp(42), borderRadius: 13, flexShrink: 0,
            background: t.c.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={t.fs(22)} color={t.c.goldText} stroke={2.3} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(24), color: t.c.text,
            lineHeight: 1.15 }}>{children}</div>
          {subtitle && (
            <div style={{ fontFamily: t.font, fontSize: t.fs(13), fontWeight: 600, color: t.c.textMut,
              marginTop: 1 }}>{subtitle}</div>
          )}
        </div>
        {action}
      </div>
      <div style={{ height: 3, width: t.sp(40), borderRadius: 3, marginTop: 12,
        marginInlineStart: icon ? t.sp(54) : 0,
        background: `linear-gradient(90deg, ${t.c.gold}, ${withA(t.c.gold, 0.15)})` }} />
    </div>
  );
}

// ── Earnings / wallet ────────────────────────────────────────
function EarningsScreen({ earnings, mode }) {
  const t = useTheme();
  const max = Math.max(...WEEK_BARS.map(b => b.v));
  const isEmp = mode === 'employee';
  const W = isEmp ? EMP_WALLET : earnings;
  const balance = isEmp ? EMP_WALLET.balance : earnings.walletBalance;   // المبلغ المحصّل الكلي
  const available = W.available;                // متاح للسحب الآن
  const pending = Math.max(0, balance - available);
  const maturingDays = W.maturingDays;
  const canWithdraw = available > 0;
  const todayAmount = isEmp ? EMP_WALLET.dailyRate : earnings.today;
  const weekAmount = isEmp ? EMP_WALLET.dailyRate * 7 : earnings.week;
  const trips = isEmp ? EMP_WALLET.todayTrips : earnings.todayTrips;
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);

  return (
    <div style={{ padding: `0 0 ${t.sp(24)}px` }}>
      <ScreenTitle icon="wallet" subtitle="محفظتك وسحب أرباحك">أرباحي</ScreenTitle>
      <div style={{ padding: `0 ${t.sp(16)}px` }}>

        {/* hero — wallet balance */}
        <div style={{ borderRadius: t.r.xl, padding: t.sp(24), color: t.c.onInk,
          background: t.c.ink,
          backgroundImage: `radial-gradient(130% 90% at 88% -10%, ${withA(t.c.gold, 0.22)}, transparent 55%)`,
          boxShadow: '0 20px 44px rgba(20,17,8,0.34)', position: 'relative', overflow: 'hidden' }}>
          {/* decorative rings */}
          <div style={{ position: 'absolute', insetInlineStart: -50, bottom: -60, width: 170, height: 170,
            borderRadius: '50%', border: `1.5px solid ${withA(t.c.gold, 0.14)}` }} />
          <div style={{ position: 'absolute', insetInlineStart: -20, bottom: -30, width: 110, height: 110,
            borderRadius: '50%', border: `1.5px solid ${withA(t.c.gold, 0.1)}` }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <Icon name="wallet" size={t.fs(18)} color={t.c.gold} stroke={2.3} />
            <span style={{ fontFamily: t.font, fontSize: t.fs(14.5), fontWeight: 700,
              color: withA(t.c.onInk, 0.85) }}>المبلغ المحصّل</span>
            <img src="assets/sonbol-gold.png" alt="" style={{ height: t.fs(16), opacity: 0.85,
              marginInlineStart: 'auto' }} />
          </div>

          <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(44), lineHeight: 1.1,
            margin: '8px 0 16px', color: t.c.gold, position: 'relative' }}>
            {balance.toFixed(2)} <span style={{ fontSize: t.fs(19), fontWeight: 700, color: t.c.onInk }}>شيكل</span></div>

          {/* available vs maturing split */}
          <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
            <div style={{ flex: 1, padding: `${t.sp(12)}px ${t.sp(13)}px`, borderRadius: t.r.md,
              background: withA(t.c.gold, 0.16) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="check" size={t.fs(14)} color={t.c.gold} stroke={3} />
                <span style={{ fontFamily: t.font, fontSize: t.fs(11.5), fontWeight: 700,
                  color: withA(t.c.onInk, 0.85) }}>متاح للسحب</span>
              </div>
              <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(20), color: t.c.gold,
                marginTop: 3 }}>{available.toFixed(2)} <span style={{ fontSize: t.fs(12), color: t.c.onInk }}>₪</span></div>
            </div>
            <div style={{ flex: 1, padding: `${t.sp(12)}px ${t.sp(13)}px`, borderRadius: t.r.md,
              background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="clock" size={t.fs(14)} color={withA(t.c.onInk, 0.8)} stroke={2.5} />
                <span style={{ fontFamily: t.font, fontSize: t.fs(11.5), fontWeight: 700,
                  color: withA(t.c.onInk, 0.85) }}>قيد النضج</span>
              </div>
              <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(20), color: t.c.onInk,
                marginTop: 3 }}>{pending.toFixed(2)} <span style={{ fontSize: t.fs(12), opacity: 0.7 }}>₪</span></div>
            </div>
          </div>
          {pending > 0 && (
            <div style={{ fontFamily: t.font, fontSize: t.fs(12), color: withA(t.c.onInk, 0.7),
              marginTop: 10, position: 'relative', lineHeight: 1.5 }}>
              يُضاف المبلغ قيد النضج للمتاح خلال {maturingDays} {maturingDays === 1 ? 'يوم' : 'أيام'} (بعد مرور أسبوع عليه)</div>
          )}

          {/* withdraw CTA */}
          <button onClick={canWithdraw ? () => setWithdrawOpen(true) : undefined} disabled={!canWithdraw}
            style={{ position: 'relative', width: '100%', height: t.sp(54), marginTop: 16,
              borderRadius: t.r.lg, border: 'none', cursor: canWithdraw ? 'pointer' : 'default',
              background: canWithdraw ? t.c.gold : 'rgba(255,255,255,0.12)',
              color: canWithdraw ? t.c.onGold : withA(t.c.onInk, 0.5),
              fontFamily: t.font, fontWeight: 800, fontSize: t.fs(17), display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 9,
              boxShadow: canWithdraw ? `0 10px 24px ${withA(t.c.gold, 0.34)}` : 'none' }}>
            <Icon name={canWithdraw ? 'wallet' : 'clock'} size={t.fs(20)}
              color={canWithdraw ? t.c.onGold : withA(t.c.onInk, 0.5)} stroke={2.4} />
            {canWithdraw ? `سحب المتاح (${available.toFixed(0)} ₪)` : 'لا يوجد رصيد متاح بعد'}
          </button>
        </div>

        {/* stat cards */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <MiniEarn icon={isEmp ? 'money' : 'bag'} accent={t.c.goldText}
            label={isEmp ? 'راتب اليوم' : 'أرباح اليوم'} value={todayAmount.toFixed(2)} unit="₪" t={t} />
          <MiniEarn icon="receipt" accent={t.c.blue}
            label="هذا الأسبوع" value={weekAmount.toFixed(0)} unit="₪" t={t} />
          <MiniEarn icon="bike" accent={t.c.primary}
            label="رحلات اليوم" value={trips} t={t} />
        </div>

        {/* week chart */}
        <Card style={{ marginTop: 12 }} pad={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(16), color: t.c.text }}>
              {isEmp ? 'رصيدك آخر ٧ أيام' : 'أرباح الأسبوع'}</span>
            <Pill icon="receipt" color={t.c.goldText} bg={t.c.goldSoft}>{weekAmount.toFixed(0)} ₪</Pill>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height: t.sp(128) }}>
            {WEEK_BARS.map((b, i) => {
              const v = isEmp ? EMP_WALLET.dailyRate : b.v;
              const vmax = isEmp ? EMP_WALLET.dailyRate : max;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 7, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontFamily: t.font, fontSize: t.fs(10.5), fontWeight: 800,
                    color: b.now ? t.c.goldText : t.c.textFaint }}>{v}</span>
                  {/* track + fill */}
                  <div style={{ width: '70%', flex: 1, display: 'flex', alignItems: 'flex-end',
                    background: t.c.surfaceAlt, borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: `${(v / vmax) * 100}%`, minHeight: 6,
                      borderRadius: 8,
                      background: b.now
                        ? `linear-gradient(180deg, ${t.c.gold}, ${withA(t.c.gold, 0.75)})`
                        : withA(t.c.primary, t.dark ? 0.5 : 0.32) }} />
                  </div>
                  <span style={{ fontFamily: t.font, fontSize: t.fs(11), fontWeight: 700,
                    color: b.now ? t.c.text : t.c.textMut }}>{b.d}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* security note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          marginTop: 12, padding: '11px 12px', background: t.c.surfaceAlt, borderRadius: t.r.md }}>
          <Icon name="shield" size={t.fs(17)} color={t.c.textMut} stroke={2.2} />
          <span style={{ fontFamily: t.font, fontSize: t.fs(12.5), fontWeight: 600, color: t.c.textMut,
            lineHeight: 1.5, textAlign: 'center' }}>
            كل الطلبات مدفوعة إلكترونياً — لا تستلم نقداً من الزبون</span>
        </div>
      </div>
      <WithdrawSheet open={withdrawOpen} balance={available} onClose={() => setWithdrawOpen(false)} />
    </div>
  );
}

function MiniEarn({ icon, accent, label, value, unit, t }) {
  return (
    <div style={{ flex: 1, background: t.c.surface, borderRadius: t.r.lg, padding: `${t.sp(14)}px ${t.sp(8)}px`,
      border: `1px solid ${t.c.line}`, boxShadow: t.c.shadow, textAlign: 'center' }}>
      <div style={{ width: t.sp(34), height: t.sp(34), borderRadius: 10, margin: '0 auto 8px',
        background: withA(accent, 0.13), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={t.fs(18)} color={accent} stroke={2.3} />
      </div>
      <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(18), color: t.c.text }}>
        {value}{unit ? <span style={{ fontSize: t.fs(12), fontWeight: 700, color: t.c.textMut }}> {unit}</span> : null}</div>
      <div style={{ fontFamily: t.font, fontSize: t.fs(11.5), fontWeight: 600, color: t.c.textMut,
        marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Withdraw bottom sheet ────────────────────────────────────
function WithdrawSheet({ open, balance, onClose }) {
  const t = useTheme();
  const [amount, setAmount] = React.useState('');
  const [done, setDone] = React.useState(false);
  React.useEffect(() => { if (open) { setAmount(''); setDone(false); } }, [open]);
  const num = parseFloat(amount) || 0;
  const valid = num > 0 && num <= balance;
  const chips = [50, 100, Math.floor(balance)];
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: `${t.sp(22)}px ${t.sp(20)}px calc(${t.sp(24)}px + env(safe-area-inset-bottom,0px))` }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: t.c.line, margin: '0 auto 18px' }} />
        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: t.sp(80), height: t.sp(80), borderRadius: '50%', background: t.c.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="check" size={t.fs(40)} color={t.c.onPrimary} stroke={3} />
            </div>
            <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(22), color: t.c.text }}>
              تم إرسال طلب السحب</div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(15), color: t.c.textMut, margin: '8px 0 22px' }}>
              سيتم تحويل {num.toFixed(2)} شيكل إلى حسابك خلال ٢٤ ساعة</div>
            <Btn kind="primary" onClick={onClose}>تمام</Btn>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(21), color: t.c.text }}>
              سحب من المحفظة</div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(14), color: t.c.textMut, marginTop: 4 }}>
              الرصيد المتاح: <span style={{ fontWeight: 800, color: t.c.goldText }}>{balance.toFixed(2)} شيكل</span></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, padding: '0 16px',
              height: t.sp(64), background: t.c.surfaceAlt, borderRadius: t.r.lg,
              border: `1.5px solid ${num > balance ? t.c.danger : t.c.line}` }}>
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                inputMode="decimal" placeholder="0"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: t.font, fontWeight: 900, fontSize: t.fs(28), color: t.c.text, minWidth: 0 }} />
              <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(18), color: t.c.textMut }}>شيكل</span>
            </div>
            {num > balance && (
              <div style={{ fontFamily: t.font, fontSize: t.fs(13), fontWeight: 700, color: t.c.danger,
                marginTop: 8 }}>المبلغ أكبر من رصيدك</div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {chips.filter((v, i, a) => v > 0 && a.indexOf(v) === i).map(v => (
                <button key={v} onClick={() => setAmount(String(v))} style={{
                  flex: 1, height: t.sp(44), borderRadius: t.r.md, border: `1px solid ${t.c.line}`,
                  background: t.c.surface, cursor: 'pointer', fontFamily: t.font, fontWeight: 800,
                  fontSize: t.fs(14), color: t.c.text }}>
                  {v === Math.floor(balance) ? 'الكل' : v}</button>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <Btn kind="gold" icon="wallet" disabled={!valid} onClick={() => setDone(true)}>تأكيد السحب</Btn>
            </div>
          </React.Fragment>
        )}
      </div>
    </Sheet>
  );
}

function HeroPill({ icon, label }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px',
      background: 'rgba(255,255,255,0.16)', borderRadius: 999 }}>
      <Icon name={icon} size={t.fs(15)} color="#fff" stroke={2.2} />
      <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: t.fs(13), color: '#fff' }}>{label}</span>
    </div>
  );
}

function WalletRow({ icon, color, label, value, note, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: t.sp(14) }}>
      <div style={{ width: t.sp(42), height: t.sp(42), borderRadius: 12, flexShrink: 0,
        background: withA(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={t.fs(21)} color={color} stroke={2.2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15.5), color: t.c.text }}>{label}</div>
        {note && <div style={{ fontFamily: t.font, fontSize: t.fs(12.5), color: t.c.textMut }}>{note}</div>}
      </div>
      <span style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(18), color: t.c.text }}>
        {value.toFixed(2)} <span style={{ fontSize: t.fs(13), fontWeight: 700, color: t.c.textMut }}>₪</span></span>
    </div>
  );
}

// ── History ──────────────────────────────────────────────────
function HistoryScreen({ mode }) {
  const t = useTheme();
  const isEmp = mode === 'employee';
  const [filter, setFilter] = React.useState('all'); // all | done | rejected
  const [time, setTime] = React.useState('all');     // all | today | yesterday
  const [detail, setDetail] = React.useState(null);

  const byTime = (it) => time === 'all'
    || (time === 'today' && (it.when || '').includes('اليوم'))
    || (time === 'yesterday' && (it.when || '').includes('أمس'));

  const completedAll = HISTORY.filter(h => !h.cancelled).filter(byTime);
  const rejectedAll = (isEmp ? REJECTED : []).filter(byTime);
  const done = HISTORY.filter(h => !h.cancelled).length;

  const tabs = isEmp
    ? [['all', `الكل (${completedAll.length + rejectedAll.length})`],
       ['done', `مكتملة (${completedAll.length})`],
       ['rejected', `مرفوضة (${rejectedAll.length})`]]
    : [['all', `الكل (${completedAll.length})`], ['done', `مكتملة (${completedAll.length})`]];

  const TIME = [['all', 'كل الأوقات'], ['today', 'اليوم'], ['yesterday', 'أمس']];
  const showRejected = isEmp && (filter === 'rejected' || filter === 'all');
  const showCompleted = filter === 'all' || filter === 'done';

  return (
    <div style={{ padding: `0 0 ${t.sp(20)}px` }}>
      <ScreenTitle icon="clock" subtitle="طلباتك المكتملة والمرفوضة">سجل الطلبات</ScreenTitle>
      <div style={{ padding: `0 ${t.sp(16)}px` }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <Card pad={14} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(24), color: t.c.primary }}>{done}</div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(13), color: t.c.textMut }}>طلب مكتمل</div>
          </Card>
          <Card pad={14} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: t.font, fontWeight: 900, fontSize: t.fs(24),
              color: isEmp ? t.c.danger : t.c.goldText }}>
              {isEmp ? REJECTED.length : EARNINGS.week.toFixed(0)}</div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(13), color: t.c.textMut }}>
              {isEmp ? 'طلب مرفوض' : '₪ هذا الأسبوع'}</div>
          </Card>
        </div>

        {/* time filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {TIME.map(([k, lbl]) => {
            const on = time === k;
            return (
              <button key={k} onClick={() => setTime(k)} style={{
                flex: 1, height: t.sp(38), borderRadius: t.r.pill, cursor: 'pointer',
                border: `1.5px solid ${on ? t.c.gold : t.c.line}`,
                background: on ? t.c.goldSoft : t.c.surface,
                color: on ? t.c.goldText : t.c.textMut,
                fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13), display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                {k !== 'all' && <Icon name="clock" size={t.fs(14)} color={on ? t.c.goldText : t.c.textFaint} stroke={2.3} />}
                {lbl}
              </button>
            );
          })}
        </div>

        {/* filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {tabs.map(([k, lbl]) => {
            const on = filter === k;
            return (
              <button key={k} onClick={() => setFilter(k)} style={{
                flex: 1, height: t.sp(40), borderRadius: t.r.pill, cursor: 'pointer',
                border: `1.5px solid ${on ? t.c.primary : t.c.line}`,
                background: on ? t.c.primary : t.c.surface,
                color: on ? t.c.onPrimary : t.c.textMut,
                fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13.5) }}>
                {lbl}
              </button>
            );
          })}
        </div>

        {/* rejected group */}
        {showRejected && filter !== 'done' && rejectedAll.length > 0 && (
          <HistGroup label="الطلبات المرفوضة" count={rejectedAll.length} color={t.c.danger} t={t}>
            {rejectedAll.map((r, i) => (
              <HistRow key={'r' + i} item={r} rejected onClick={() => setDetail({ ...r, rejected: true })} t={t} />
            ))}
          </HistGroup>
        )}

        {/* completed group */}
        {showCompleted && completedAll.length > 0 && (
          <HistGroup label="الطلبات المكتملة" count={completedAll.length} color={t.c.primary} t={t}>
            {completedAll.map((h, i) => (
              <HistRow key={'h' + i} item={h} onClick={() => setDetail(h)} t={t} />
            ))}
          </HistGroup>
        )}
      </div>

      <OrderDetailSheet order={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function HistGroup({ label, count, color, t, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 2px 10px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14.5), color: t.c.text }}>{label}</span>
        <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: t.fs(12.5), color: t.c.textMut }}>
          {count}</span>
      </div>
      <Card pad={0}>{children}</Card>
    </div>
  );
}

function HistRow({ item, rejected, onClick, t }) {
  const c = rejected || item.cancelled ? t.c.danger : t.c.primary;
  const soft = rejected || item.cancelled ? t.c.dangerSoft : t.c.primarySoft;
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12,
      padding: t.sp(14), cursor: 'pointer', borderBottom: `1px solid ${t.c.line}`,
      WebkitTapHighlightColor: 'transparent' }}
      className="sb-hist-row">
      <div style={{ width: t.sp(42), height: t.sp(42), borderRadius: 12, flexShrink: 0,
        background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={rejected || item.cancelled ? 'x' : 'check'} size={t.fs(21)} color={c} stroke={2.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15.5), color: t.c.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.store}</div>
        <div style={{ fontFamily: t.font, fontSize: t.fs(12.5), color: t.c.textMut,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          #{item.id} · {item.customer} · {item.when}</div>
      </div>
      <Icon name="chevL" size={t.fs(20)} color={t.c.textFaint} stroke={2.4} />
    </div>
  );
}

// ── Order detail sheet (from history) ────────────────────────
function OrderDetailSheet({ order, onClose }) {
  const t = useTheme();
  if (!order) return null;
  const bad = order.rejected || order.cancelled;
  const c = bad ? t.c.danger : t.c.primary;
  const statusLabel = order.rejected ? 'مرفوض' : (order.cancelled ? 'ملغى' : 'تم التسليم');
  return (
    <Sheet open={!!order} onClose={onClose}>
      <div style={{ padding: `${t.sp(18)}px ${t.sp(18)}px calc(${t.sp(22)}px + env(safe-area-inset-bottom,0px))`,
        maxHeight: '88%', overflowY: 'auto' }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: t.c.line, margin: '0 auto 16px' }} />

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: t.sp(48), height: t.sp(48), borderRadius: 14, flexShrink: 0,
            background: bad ? t.c.dangerSoft : t.c.primarySoft, display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={bad ? 'x' : 'check'} size={t.fs(26)} color={c} stroke={2.6} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(20), color: t.c.text }}>
              طلب #{order.id}</div>
            <div style={{ fontFamily: t.font, fontSize: t.fs(13.5), color: t.c.textMut }}>{order.when}</div>
          </div>
          <Pill color={c} bg={bad ? t.c.dangerSoft : t.c.primarySoft} icon={bad ? 'x' : 'check'}>
            {statusLabel}</Pill>
        </div>

        {/* route */}
        <div style={{ background: t.c.surfaceAlt, borderRadius: t.r.lg, padding: t.sp(14), marginBottom: 12 }}>
          <DetailRoute icon="store" color={t.c.gold} title={order.store} sub={order.storeArea} t={t} />
          <div style={{ height: 18, marginInlineStart: t.sp(17), borderInlineStart: `2px dashed ${t.c.line}` }} />
          <DetailRoute icon="pin" color={t.c.ink} title={order.customer} sub={order.customerArea} t={t} />
        </div>

        {/* facts */}
        <div style={{ display: 'flex', gap: 10, marginBottom: order.items || order.reason ? 12 : 0 }}>
          {order.mins != null && <DetailFact icon="clock" label="المدة" value={`${order.mins} د`} t={t} />}
          <DetailFact icon="receipt" label="رقم الطلب" value={`#${order.id}`} t={t} />
          {order.fee != null && !bad && <DetailFact icon="money" label="أجرتك" value={`${order.fee.toFixed(2)} ₪`} accent={t.c.goldText} t={t} />}
        </div>

        {/* rejection reason */}
        {order.reason && (
          <div style={{ padding: t.sp(13), background: t.c.dangerSoft, borderRadius: t.r.lg, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <Icon name="note" size={t.fs(16)} color={t.c.danger} stroke={2.3} />
              <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13), color: t.c.danger }}>
                سبب الرفض</span>
            </div>
            <span style={{ fontFamily: t.font, fontSize: t.fs(14.5), fontWeight: 600, color: t.c.text,
              lineHeight: 1.5 }}>{order.reason}</span>
          </div>
        )}

        {/* items */}
        {order.items && (
          <Card pad={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Icon name="bag" size={t.fs(18)} color={t.c.text} stroke={2.3} />
              <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14.5), color: t.c.text }}>
                محتويات الطلب</span>
              <span style={{ fontFamily: t.font, fontSize: t.fs(12.5), fontWeight: 700, color: t.c.textMut,
                marginInlineStart: 'auto' }}>{order.items.reduce((a, i) => a + i.q, 0)} قطعة</span>
            </div>
            {order.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
                borderTop: i ? `1px solid ${t.c.line}` : 'none' }}>
                <span style={{ minWidth: t.sp(28), height: t.sp(28), borderRadius: 8, flexShrink: 0,
                  background: t.c.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13), color: t.c.text }}>×{it.q}</span>
                <span style={{ flex: 1, fontFamily: t.font, fontSize: t.fs(14.5), fontWeight: 600,
                  color: t.c.text }}>{it.n}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </Sheet>
  );
}

function DetailRoute({ icon, color, title, sub, t }) {
  const onColor = lum(color) > 0.55 ? '#1d1a10' : '#fff';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: t.sp(34), height: t.sp(34), borderRadius: 10, flexShrink: 0, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={t.fs(18)} color={onColor} stroke={2.3} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15.5), color: t.c.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub ? (
          <div style={{ fontFamily: t.font, fontSize: t.fs(13), color: t.c.textMut,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
        ) : null}
      </div>
    </div>
  );
}

function DetailFact({ icon, label, value, accent, t }) {
  return (
    <div style={{ flex: 1, background: t.c.surfaceAlt, borderRadius: t.r.md, padding: '11px 8px',
      textAlign: 'center' }}>
      <Icon name={icon} size={t.fs(18)} color={accent || t.c.textMut} stroke={2.2} style={{ margin: '0 auto 4px' }} />
      <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(14.5), color: accent || t.c.text }}>{value}</div>
      <div style={{ fontFamily: t.font, fontSize: t.fs(11), color: t.c.textMut }}>{label}</div>
    </div>
  );
}

// ── Profile / settings ───────────────────────────────────────
function ProfileScreen({ mode, account, photo, setPhoto, dark, setDark, onLogout, soundOn, setSound }) {
  const t = useTheme();
  const isEmp = mode === 'employee';
  const fileRef = React.useRef();
  const pickPhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(f);
  };
  return (
    <div style={{ padding: `0 0 ${t.sp(20)}px` }}>
      <ScreenTitle icon="user" subtitle="ملفك وإعداداتك وإنجازاتك">حسابي</ScreenTitle>
      <div style={{ padding: `0 ${t.sp(16)}px` }}>
        {/* profile card */}
        <Card pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}
              onClick={() => fileRef.current && fileRef.current.click()}>
              <Avatar name={CAPTAIN.name} size={t.sp(64)} photo={photo} />
              <div style={{ position: 'absolute', insetInlineEnd: -2, bottom: -2, width: t.sp(26),
                height: t.sp(26), borderRadius: '50%', background: t.c.gold, border: `2px solid ${t.c.surface}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="plus" size={t.fs(15)} color={t.c.onGold} stroke={2.8} />
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto}
                style={{ display: 'none' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(20), color: t.c.text }}>
                {CAPTAIN.fullName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <Icon name="user" size={t.fs(14)} color={t.c.textMut} stroke={2.2} />
                <span style={{ fontFamily: t.font, fontSize: t.fs(13.5), color: t.c.textMut, direction: 'ltr' }}>
                  @{account?.user || 'captain'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Pill icon="star" color={t.c.gold} bg={t.c.goldSoft}>{CAPTAIN.rating.toFixed(1)}</Pill>
                <Pill icon="bike">{CAPTAIN.trips} رحلة</Pill>
              </div>
            </div>
          </div>
          {photo && (
            <button onClick={() => setPhoto(null)} style={{ marginTop: 14, width: '100%', height: t.sp(42),
              borderRadius: t.r.md, border: `1px solid ${t.c.line}`, background: 'transparent',
              cursor: 'pointer', fontFamily: t.font, fontWeight: 700, fontSize: t.fs(13.5),
              color: t.c.textMut, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="x" size={t.fs(16)} color={t.c.textMut} stroke={2.4} />إزالة الصورة</button>
          )}
        </Card>

        {/* account type (read-only — set by login) */}
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15), color: t.c.text,
          margin: '20px 4px 10px' }}>نوع الحساب</div>
        <Card pad={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: t.sp(46), height: t.sp(46), borderRadius: 13, flexShrink: 0,
              background: isEmp ? withA(t.c.blue, 0.14) : t.c.goldSoft, display: 'flex',
              alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={isEmp ? 'shield' : 'bike'} size={t.fs(24)}
                color={isEmp ? t.c.blue : t.c.goldText} stroke={2.2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(16.5), color: t.c.text }}>
                {isEmp ? 'كابتن موظّف' : 'كابتن حر'}</div>
              <div style={{ fontFamily: t.font, fontSize: t.fs(13), color: t.c.textMut, lineHeight: 1.5,
                marginTop: 2 }}>
                {isEmp
                  ? 'الطلبات تُوجَّه إليك مباشرة من الإدارة'
                  : 'الطلبات تُعرض على عدة كباتن — الأسرع يفوز'}</div>
            </div>
          </div>
        </Card>

        {/* #9 achievements */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '20px 4px 10px' }}>
          <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15), color: t.c.text }}>
            إنجازاتك</span>
          <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: t.fs(12.5), color: t.c.textMut }}>
            {BADGES.filter(b => b.earned).length}/{BADGES.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, margin: '0 -2px' }}>
          {BADGES.map(b => (
            <div key={b.id} style={{ flexShrink: 0, width: t.sp(108), padding: `${t.sp(14)}px ${t.sp(8)}px`,
              borderRadius: t.r.lg, textAlign: 'center', background: t.c.surface,
              border: `1px solid ${b.earned ? t.c.goldSoft : t.c.line}`, boxShadow: t.c.shadow,
              opacity: b.earned ? 1 : 0.55 }}>
              <div style={{ width: t.sp(44), height: t.sp(44), borderRadius: '50%', margin: '0 auto 8px',
                background: b.earned ? t.c.goldSoft : t.c.surfaceAlt, display: 'flex',
                alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Icon name={b.earned ? b.icon : 'shield'} size={t.fs(22)}
                  color={b.earned ? t.c.gold : t.c.textFaint} stroke={2.3}
                  fill={b.earned && b.icon === 'star' ? t.c.gold : 'none'} />
              </div>
              <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(13), color: t.c.text,
                lineHeight: 1.3 }}>{b.title}</div>
              <div style={{ fontFamily: t.font, fontSize: t.fs(11), color: t.c.textMut, marginTop: 2,
                lineHeight: 1.3 }}>{b.sub}</div>
            </div>
          ))}
        </div>

        {/* vehicle */}
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15), color: t.c.text,
          margin: '20px 4px 10px' }}>المركبة والمنطقة</div>
        <Card pad={6}>
          <SettingRow icon="bike" label="المركبة" value={CAPTAIN.vehicle} t={t} />
          <Divider />
          <SettingRow icon="doc" label="رقم اللوحة" value={CAPTAIN.plate} t={t} />
          <Divider />
          <SettingRow icon="pin" label="منطقة العمل" value={CAPTAIN.zone} t={t} />
        </Card>

        {/* settings */}
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(15), color: t.c.text,
          margin: '20px 4px 10px' }}>الإعدادات</div>
        <Card pad={6}>
          <ToggleRow icon="globe" label="الوضع الليلي" on={dark} onToggle={() => setDark(!dark)} t={t} />
          <Divider />
          <ToggleRow icon="bell" label="صوت الطلب الجديد" on={soundOn} onToggle={() => setSound(!soundOn)} t={t} />
          <Divider />
          <SettingRow icon="phone" label="الدعم والمساعدة" chevron t={t} />
          <Divider />
          <div onClick={onLogout} style={{ cursor: 'pointer' }}>
            <SettingRow icon="logout" label="تسجيل الخروج" danger t={t} />
          </div>
        </Card>
        <div style={{ textAlign: 'center', marginTop: 18, fontFamily: t.font, fontSize: t.fs(12),
          color: t.c.textFaint }}>سنبل كابتن · الإصدار ١.٠</div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, value, chevron, danger, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: t.sp(14), cursor: 'pointer' }}>
      <div style={{ width: t.sp(38), height: t.sp(38), borderRadius: 11, flexShrink: 0,
        background: danger ? t.c.dangerSoft : t.c.surfaceAlt, display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={t.fs(20)} color={danger ? t.c.danger : t.c.textMut} stroke={2.2} />
      </div>
      <span style={{ flex: 1, fontFamily: t.font, fontWeight: 700, fontSize: t.fs(15.5),
        color: danger ? t.c.danger : t.c.text }}>{label}</span>
      {value && <span style={{ fontFamily: t.font, fontSize: t.fs(14), color: t.c.textMut }}>{value}</span>}
      {chevron && <Icon name="chevL" size={t.fs(20)} color={t.c.textFaint} stroke={2.4} />}
    </div>
  );
}

function ToggleRow({ icon, label, on, onToggle, t }) {
  return (
    <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12,
      padding: t.sp(14), cursor: 'pointer' }}>
      <div style={{ width: t.sp(38), height: t.sp(38), borderRadius: 11, flexShrink: 0,
        background: t.c.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={t.fs(20)} color={t.c.textMut} stroke={2.2} />
      </div>
      <span style={{ flex: 1, fontFamily: t.font, fontWeight: 700, fontSize: t.fs(15.5), color: t.c.text }}>{label}</span>
      <div style={{ width: t.sp(50), height: t.sp(30), borderRadius: 999, padding: 3,
        background: on ? t.c.primary : t.c.line, transition: 'background .2s',
        display: 'flex', justifyContent: on ? 'flex-start' : 'flex-end' }}>
        <div style={{ width: t.sp(24), height: t.sp(24), borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
}

// ── Call sheet ───────────────────────────────────────────────
function CallSheet({ open, name, phone, onClose }) {
  const t = useTheme();
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: `${t.sp(24)}px ${t.sp(20)}px ${t.sp(26)}px`, textAlign: 'center' }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: t.c.line, margin: '0 auto 18px' }} />
        <Avatar name={name} size={t.sp(80)} color={t.c.primary} />
        <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: t.fs(22), color: t.c.text, marginTop: 14 }}>
          {name}</div>
        <div style={{ fontFamily: t.font, fontSize: t.fs(17), color: t.c.textMut, direction: 'ltr', marginTop: 4 }}>
          {phone}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Btn kind="soft" size="md" icon="note" onClick={onClose}>رسالة</Btn>
          <Btn kind="primary" size="md" icon="phone" onClick={onClose}>اتصال الآن</Btn>
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { EarningsScreen, HistoryScreen, ProfileScreen, CallSheet });
