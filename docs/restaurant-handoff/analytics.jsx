/* ============================================================
   صفحة الإحصاءات + الشارتات — سنبل
   ============================================================ */

/* صيغة مختصرة للأرقام (للمحاور) */
function fmtK(n){
  return n.toLocaleString("en-US");
}

/* شارة التغيّر مقابل الفترة السابقة */
function DeltaChip({ value, goodIfDown, label }){
  const down = value < 0;
  const good = goodIfDown ? down : !down;
  return (
    <div className={"kd " + (good ? "up" : "down")}>
      {down ? <Ic.arrow s={13} style={{ transform: "rotate(-90deg)" }} />
            : <Ic.arrow s={13} style={{ transform: "rotate(90deg)" }} />}
      {Math.abs(value)}%
      <span className="km">{label || "مقابل أمس"}</span>
    </div>
  );
}

/* ===== مخطط أعمدة: مبيعات 7 أيام ===== */
/* ===== مخطط أعمدة: المبيعات عبر الأيام ===== */
function SalesBars({ data }){
  const max = Math.max(1, ...data.map((d) => d.sales));
  const compact = data.length > 10;
  const lastIdx = data.length - 1;
  return (
    <div className={"bars" + (compact ? " compact" : "")}>
      {data.map((d, i) => {
        const showLab = !compact || i === 0 || i === lastIdx || i % 5 === 0;
        return (
          <div className={"barcol" + (i === lastIdx ? " today" : "")} key={d.date || i}>
            {!compact && <div className="bval tnum">{fmtK(d.sales)}</div>}
            <div className="bcol" style={{ height: (d.sales / max * 100) + "%" }}
              title={(d.dayName || "") + " · " + S.money(d.sales)}></div>
            <div className="blab">{compact ? (showLab ? (d.date ? d.date.slice(8) : "") : "") : (i === lastIdx ? "اليوم" : (d.dayName || d.day))}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== مخطط مساحي: الطلبات حسب الساعة (RTL) ===== */
function HourlyArea({ data }){
  const W = 600, H = 210, padX = 26, padTop = 22, padBottom = 34;
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.v));
  const innerW = W - 2 * padX, innerH = H - padTop - padBottom;
  const base = H - padBottom;
  const x = (i) => padX + (n - 1 - i) * (innerW / (n - 1)); // الأقدم يميناً
  const y = (v) => padTop + (1 - v / max) * innerH;
  const pts = data.map((d, i) => [x(i), y(d.v)]);
  const line = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + " L " + pts[n - 1][0].toFixed(1) + " " + base + " L " + pts[0][0].toFixed(1) + " " + base + " Z";
  const peakIdx = data.reduce((m, d, i) => (d.v > data[m].v ? i : m), 0);
  const grid = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {grid.map((g, i) => {
        const gy = padTop + g * innerH;
        return <line key={i} x1={padX} y1={gy} x2={W - padX} y2={gy} stroke="var(--line-2)" strokeWidth="1" />;
      })}
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke="var(--gold-deep)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === peakIdx ? 5.5 : 3} fill={i === peakIdx ? "var(--gold-deep)" : "var(--surface)"} stroke="var(--gold-deep)" strokeWidth="2" />
      ))}
      <g>
        <rect x={pts[peakIdx][0] - 36} y={pts[peakIdx][1] - 34} width="72" height="23" rx="7" fill="var(--ink)" />
        <text x={pts[peakIdx][0]} y={pts[peakIdx][1] - 18} textAnchor="middle" fill="#fff" fontSize="12.5" fontWeight="800" fontFamily="Tajawal">الذروة · {data[peakIdx].v}</text>
      </g>
      {data.map((d, i) => (
        <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fill="var(--text-faint)" fontSize="12" fontWeight="700" fontFamily="Tajawal">{d.h}</text>
      ))}
    </svg>
  );
}

/* ===== دونات: توزيع طريقة الدفع ===== */
function PayDonut({ cash, online }){
  const total = cash + online;
  const r = 52, sw = 18, C = 2 * Math.PI * r, cx = 70, cy = 70;
  const cashLen = (cash / total) * C;
  const onlineLen = (online / total) * C;
  const pc = Math.round(cash / total * 100);
  const po = 100 - pc;
  return (
    <div className="donut-wrap">
      <div className="donut-c" style={{ width: 140, height: 140 }}>
        <svg viewBox="0 0 140 140" width="140" height="140">
          <g transform="rotate(-90 70 70)">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line-2)" strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--green)" strokeWidth={sw}
              strokeDasharray={cashLen + " " + (C - cashLen)} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--blue)" strokeWidth={sw}
              strokeDasharray={onlineLen + " " + (C - onlineLen)} strokeDashoffset={-cashLen} strokeLinecap="round" />
          </g>
        </svg>
        <div className="dc-mid"><div><b className="tnum">{total}</b><small>طلب</small></div></div>
      </div>
      <div className="legend">
        <div className="lg">
          <span className="ld" style={{ background: "var(--green)" }}></span>
          <div>
            <div className="lt">نقداً</div>
            <div className="ls tnum">{cash} طلب · {pc}%</div>
          </div>
        </div>
        <div className="lg">
          <span className="ld" style={{ background: "var(--blue)" }}></span>
          <div>
            <div className="lt">مدفوع أونلاين</div>
            <div className="ls tnum">{online} طلب · {po}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== أعمدة أفقية (الأصناف) ===== */
function HBars({ items, color }){
  const max = Math.max(...items.map((i) => i.count));
  return (
    <div className="hbars">
      {items.map((it, i) => (
        <div key={i}>
          <div className="hb-top">
            <span className="hb-n">{it.name}</span>
            <span className="hb-c tnum">{it.count} طلب</span>
          </div>
          <div className="hb-track">
            <div className="hb-fill" style={{ width: (it.count / max * 100) + "%", background: color }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== مودال التصدير ===== */
function ExportModal({ data, onClose }){
  const [done, setDone] = useState({});
  const stamp = (data.days[0] ? data.days[0].date : "") + "_" + (data.days[data.days.length - 1] ? data.days[data.days.length - 1].date : "");

  function mark(k){ setDone((d) => ({ ...d, [k]: true })); setTimeout(() => setDone((d) => ({ ...d, [k]: false })), 2000); }

  function expDaily(){
    const rows = [["التاريخ", "اليوم", "عدد الطلبات", "المبيعات (₪)", "متوسط التحضير (د)"]];
    data.days.forEach((d) => rows.push([d.date, d.dayName, d.orders, d.sales, d.prep]));
    rows.push([]);
    rows.push(["الإجمالي", "", data.totalOrders, data.totalSales, data.avgPrep]);
    S.downloadCSV("سنبل_الملخص_اليومي_" + stamp + ".csv", rows);
    mark("daily");
  }
  function expItems(){
    const rows = [["التصنيف", "الصنف", "عدد الطلبات"]];
    data.topItems.forEach((it) => rows.push(["الأكثر مبيعاً", it.name, it.count]));
    data.lowItems.forEach((it) => rows.push(["الأقل مبيعاً", it.name, it.count]));
    S.downloadCSV("سنبل_الأصناف_" + stamp + ".csv", rows);
    mark("items");
  }
  function expKpis(){
    const rows = [
      ["المؤشر", "القيمة"],
      ["الفترة", data.label],
      ["إجمالي المبيعات (₪)", data.totalSales],
      ["عدد الطلبات", data.totalOrders],
      ["متوسط قيمة الطلب (₪)", data.aov],
      ["متوسط وقت التحضير (د)", data.avgPrep],
      ["طلبات نقدية", data.payment.cash],
      ["طلبات مدفوعة أونلاين", data.payment.online],
    ];
    S.downloadCSV("سنبل_المؤشرات_" + stamp + ".csv", rows);
    mark("kpis");
  }

  const opts = [
    { k: "daily", ico: <Ic.table s={20} />, n: "الملخص اليومي", s: data.days.length + " يوم · الطلبات والمبيعات لكل يوم", fn: expDaily },
    { k: "items", ico: <Ic.list s={20} />, n: "الأصناف", s: "الأكثر والأقل مبيعاً خلال الفترة", fn: expItems },
    { k: "kpis", ico: <Ic.chart s={20} />, n: "المؤشرات العامة", s: "ملخّص الأرقام الرئيسية", fn: expKpis },
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ width: "min(500px,94vw)" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="newbell" style={{ animation: "none" }}><Ic.download s={26} /></div>
          <div>
            <div className="h-t">تصدير البيانات</div>
            <div className="h-n" style={{ fontSize: 21 }}>اختر ما تريد تنزيله</div>
          </div>
        </div>
        <div className="modal-body">
          <div className="exp-period">
            <Ic.clock s={17} style={{ color: "var(--text-faint)" }} />
            <span className="ep-l">الفترة:</span>
            <span>{data.label}</span>
          </div>
          <div className="exp-list">
            {opts.map((o) => (
              <div className="exp-opt" key={o.k}>
                <div className="eo-ic">{o.ico}</div>
                <div className="eo-t">
                  <div className="eo-n">{o.n}</div>
                  <div className="eo-s">{o.s}</div>
                </div>
                <button className={"exp-dl" + (done[o.k] ? " done" : "")} onClick={o.fn}>
                  {done[o.k] ? <><Ic.check s={16} /> تم</> : <><Ic.download s={16} /> CSV</>}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-line btn-block" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}

/* ===== الصفحة ===== */
function AnalyticsScreen(){
  const [period, setPeriod] = useState("week");
  const [from, setFrom] = useState(S.DATE_RANGE.min);
  const [to, setTo] = useState(S.DATE_RANGE.max);
  const [exporting, setExporting] = useState(false);

  const a = S.getAnalytics(period, from, to);
  const peak = a.hourly.reduce((m, d) => (d.v > m.v ? d : m), a.hourly[0]);

  const periods = [
    { k: "today", l: "اليوم" },
    { k: "week", l: "آخر ٧ أيام" },
    { k: "month", l: "آخر ٣٠ يوم" },
    { k: "custom", l: "مخصّص" },
  ];

  const isToday = period === "today";
  const salesTitle = isToday ? "المبيعات حسب ساعات اليوم"
    : period === "month" ? "المبيعات خلال الشهر"
    : period === "custom" ? "المبيعات خلال الفترة" : "المبيعات خلال الأسبوع";

  const kpis = [
    { ico: <Ic.money s={20} />, g: "g2", l: "إجمالي المبيعات", v: S.money(a.totalSales), d: a.deltas.sales, gd: false },
    { ico: <Ic.bag s={20} />, g: "g1", l: "عدد الطلبات", v: a.totalOrders, d: a.deltas.orders, gd: false },
    { ico: <Ic.card s={20} />, g: "g3", l: "متوسط قيمة الطلب", v: S.money(a.aov), d: a.deltas.aov, gd: false },
    { ico: <Ic.clock s={20} />, g: "g1", l: "متوسط وقت التحضير", v: a.avgPrep + " د", d: a.deltas.prep, gd: true },
  ];

  return (
    <div className="page">
      <div className="page-in" style={{ maxWidth: 1140 }}>
        <div className="page-head">
          <div>
            <div className="page-title">الإحصاءات والمؤشرات</div>
            <div className="page-sub">أداء المطعم — {a.label}</div>
          </div>
        </div>

        <div className="an-toolbar">
          <div className="seg">
            {periods.map((p) => (
              <button key={p.k} className={period === p.k ? "on" : ""} onClick={() => setPeriod(p.k)}>{p.l}</button>
            ))}
          </div>
          {period === "custom" && (
            <div className="an-range">
              <span className="rl">من</span>
              <input type="date" value={from} min={S.DATE_RANGE.min} max={S.DATE_RANGE.max} onChange={(e) => setFrom(e.target.value)} />
              <span className="rl">إلى</span>
              <input type="date" value={to} min={S.DATE_RANGE.min} max={S.DATE_RANGE.max} onChange={(e) => setTo(e.target.value)} />
            </div>
          )}
          <button className="btn-export" onClick={() => setExporting(true)}>
            <Ic.download s={18} /> تصدير البيانات
          </button>
        </div>

        <div className="insight">
          <Ic.chart s={18} style={{ color: "var(--gold-deep)", flex: "0 0 auto" }} />
          {isToday
            ? <><span>ساعة الذروة عندك الساعة <b>{peak.h}</b></span><span className="sep"></span><span>متوسط التحضير <b>{a.avgPrep} دقيقة</b></span></>
            : <><span>أعلى مبيعات كانت يوم <b>{S.prettyDate(a.bestDay.date)}</b> ({S.money(a.bestDay.sales)})</span><span className="sep"></span><span>متوسط <b>{Math.round(a.totalOrders / a.days.length)} طلب/يوم</b></span></>}
        </div>

        <div className="an-kpis">
          {kpis.map((k, i) => (
            <div className="kpi" key={i}>
              <div className="kh">
                <div className={"ki si " + k.g}>{k.ico}</div>
                <div className="kl">{k.l}</div>
              </div>
              <div className="kv tnum">{k.v}</div>
              {a.comparable && <DeltaChip value={k.d} goodIfDown={k.gd} label={period === "today" ? "مقابل أمس" : "مقابل الفترة السابقة"} />}
            </div>
          ))}
        </div>

        <div className="an-row">
          <div className="chartcard">
            <div className="ct-h">
              <span className="ct-t">{salesTitle}</span>
              <span className="ct-s">{isToday ? "متى يكثر الضغط" : "بالشيكل (₪)"}</span>
            </div>
            {isToday ? <HourlyArea data={a.hourly} /> : <SalesBars data={a.days} />}
          </div>
        </div>

        {isToday ? (
          <div className="an-row">
            <div className="chartcard">
              <div className="ct-h"><span className="ct-t">طريقة الدفع</span><span className="ct-s">{a.label}</span></div>
              <PayDonut cash={a.payment.cash} online={a.payment.online} />
            </div>
          </div>
        ) : (
          <div className="an-row r-2">
            <div className="chartcard">
              <div className="ct-h">
                <span className="ct-t">الطلبات حسب ساعات اليوم</span>
                <span className="ct-s">نمط يوم نموذجي</span>
              </div>
              <HourlyArea data={a.hourly} />
            </div>
            <div className="chartcard">
              <div className="ct-h"><span className="ct-t">طريقة الدفع</span><span className="ct-s">{a.label}</span></div>
              <PayDonut cash={a.payment.cash} online={a.payment.online} />
            </div>
          </div>
        )}

        <div className="an-row r-11">
          <div className="chartcard">
            <div className="ct-h">
              <span className="ct-t">الأكثر مبيعاً</span>
              <span className="ct-s">{a.label}</span>
            </div>
            <HBars items={a.topItems} color="var(--gold)" />
          </div>
          <div className="chartcard">
            <div className="ct-h">
              <span className="ct-t">الأقل مبيعاً</span>
              <span className="ct-s">راقب هالأصناف</span>
            </div>
            <HBars items={a.lowItems} color="#c9c2b1" />
          </div>
        </div>
      </div>

      {exporting && <ExportModal data={a} onClose={() => setExporting(false)} />}
    </div>
  );
}

Object.assign(window, { AnalyticsScreen });
