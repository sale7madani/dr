/* ============================================================
   سنبل — واجهة المطعم | بيانات تجريبية + دوال مساعدة
   ============================================================ */
(function () {
  "use strict";

  // العملة (placeholder — غيّرها بسهولة من هنا)
  const CURRENCY = "₪";

  const RESTAURANT = {
    name: "مطعم بيت الشام",
    branch: "فرع المالكي",
  };

  // ---------- المنيو ----------
  const MENU = [
    {
      cat: "المشاوي",
      items: [
        { id: "m1", name: "مشاوي مشكّل", price: 65, available: true },
        { id: "m2", name: "شيش طاووق", price: 48, available: true },
        { id: "m3", name: "كباب حلبي", price: 52, available: true },
        { id: "m4", name: "ريش غنم", price: 78, available: false },
        { id: "m5", name: "فروج مشوي كامل", price: 55, available: true },
      ],
    },
    {
      cat: "الوجبات",
      items: [
        { id: "w1", name: "وجبة شاورما لحمة", price: 32, available: true },
        { id: "w2", name: "وجبة شاورما دجاج", price: 28, available: true },
        { id: "w3", name: "صحن حمص باللحمة", price: 26, available: true },
        { id: "w4", name: "فتة مكدوس", price: 30, available: true },
      ],
    },
    {
      cat: "المقبلات",
      items: [
        { id: "a1", name: "حمص", price: 12, available: true },
        { id: "a2", name: "متبل", price: 12, available: true },
        { id: "a3", name: "تبولة", price: 14, available: true },
        { id: "a4", name: "بطاطا مقلية", price: 13, available: true },
        { id: "a5", name: "كبة مقلية (٤ حبات)", price: 22, available: false },
      ],
    },
    {
      cat: "المشروبات",
      items: [
        { id: "d1", name: "كولا", price: 6, available: true },
        { id: "d2", name: "عصير ليمون نعنع", price: 9, available: true },
        { id: "d3", name: "عيران", price: 5, available: true },
        { id: "d4", name: "ماء", price: 3, available: true },
      ],
    },
    {
      cat: "الحلويات",
      items: [
        { id: "s1", name: "كنافة نابلسية", price: 24, available: true },
        { id: "s2", name: "بقلاوة (نص كيلو)", price: 35, available: true },
      ],
    },
  ];

  // ---------- دوال مساعدة ----------
  function money(n) {
    return n.toLocaleString("en-US") + " " + CURRENCY;
  }

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  // فرق الوقت بالدقائق منذ تاريخ
  function minsSince(ts) {
    return Math.max(0, Math.floor((Date.now() - ts) / 60000));
  }

  // صيغة "منذ ٥ د"
  function ago(ts) {
    const m = minsSince(ts);
    if (m < 1) return "الآن";
    if (m === 1) return "منذ دقيقة";
    if (m === 2) return "منذ دقيقتين";
    if (m < 11) return "منذ " + m + " دقائق";
    return "منذ " + m + " د";
  }

  // عدّاد mm:ss للوقت المنقضي
  function elapsedClock(ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    return pad(Math.floor(s / 60)) + ":" + pad(s % 60);
  }

  // ---------- مولّد الطلبات ----------
  const NAMES = [
    "أحمد العلي", "ريم حدّاد", "سامر خوري", "لانا مرعي", "فادي نصّار",
    "هبة الزين", "وسيم درويش", "نور قاسم", "جاد إبراهيم", "ميس الحلبي",
    "كرم سعادة", "تالا عيسى", "بشّار منصور", "دارين شاهين",
  ];
  const AREAS = [
    "المالكي، شارع ٢٩ أيار، بناء ٧، ط٣",
    "أبو رمانة، جانب صيدلية النور، ط٢",
    "المزة فيلات شرقية، فيلا ١٢",
    "الروضة، شارع المتنبي، بناء ٤، ط٥",
    "كفرسوسة، مقابل الجامع الكبير، ط١",
    "المهاجرين، طلعة الشيخ محي الدين، ط٤",
  ];
  const MODS_POOL = [
    ["بدون بصل"], ["حار إضافي"], ["بدون مخلل", "ثوم زيادة"],
    ["خبز إضافي"], ["بدون طحينة"], [], [], ["توابل خفيفة"],
  ];

  let counter = 1041;
  let uidSeq = 0;
  function uid() {
    uidSeq += 1;
    return "o" + Date.now().toString(36) + "-" + uidSeq + "-" + Math.floor(Math.random() * 1e6).toString(36);
  }

  function pickItems() {
    const flat = [];
    MENU.forEach((c) => c.items.forEach((i) => i.available && flat.push(i)));
    const n = 1 + Math.floor(Math.random() * 3); // 1..3 أصناف
    const chosen = [];
    const used = new Set();
    for (let k = 0; k < n; k++) {
      const it = flat[Math.floor(Math.random() * flat.length)];
      if (used.has(it.id)) continue;
      used.add(it.id);
      chosen.push({
        id: it.id,
        name: it.name,
        price: it.price,
        qty: 1 + Math.floor(Math.random() * 2),
        mods: MODS_POOL[Math.floor(Math.random() * MODS_POOL.length)],
      });
    }
    return chosen;
  }

  function total(items) {
    return items.reduce((s, i) => s + i.price * i.qty, 0);
  }

  // ينشئ كائن طلب جديد (لم يُقبل بعد)
  function makeOrder(opts) {
    opts = opts || {};
    counter += 1;
    const items = opts.items || pickItems();
    const sub = total(items);
    const delivery = 8;
    return {
      id: uid(),
      number: counter,
      status: "new", // new | preparing | ready | delivered | rejected
      customer: {
        name: opts.name || NAMES[Math.floor(Math.random() * NAMES.length)],
        phone: opts.phone || "09" + (10000000 + Math.floor(Math.random() * 89999999)),
        address: opts.address || AREAS[Math.floor(Math.random() * AREAS.length)],
      },
      items: items,
      note: opts.note !== undefined ? opts.note
        : (Math.random() < 0.35 ? "الرجاء الاتصال قبل الوصول، الجرس معطّل" : ""),
      payment: opts.payment || (Math.random() < 0.6 ? "cash" : "online"),
      subtotal: sub,
      delivery: delivery,
      grandTotal: sub + delivery,
      createdAt: opts.createdAt || Date.now(),
      acceptedAt: null,
      prepTime: null, // دقائق
      readyAt: null,
    };
  }

  // طلبات أولية موزّعة على الحالات (للعرض المبدئي)
  function seedOrders() {
    const now = Date.now();
    const list = [];

    // طلب جديد ينتظر (وصل قبل دقيقتين)
    const o1 = makeOrder({
      createdAt: now - 2 * 60000,
      name: "ريم حدّاد",
      address: "أبو رمانة، جانب صيدلية النور، ط٢",
      payment: "online",
      note: "بدون كزبرة بالسلطة لو سمحتم",
      items: [
        { id: "m2", name: "شيش طاووق", price: 48, qty: 1, mods: ["ثوم زيادة"] },
        { id: "a4", name: "بطاطا مقلية", price: 13, qty: 2, mods: [] },
        { id: "d2", name: "عصير ليمون نعنع", price: 9, qty: 2, mods: [] },
      ],
    });
    list.push(o1);

    // قيد التحضير (مقبول قبل ٧ دقائق، وقت تحضير ٢٠)
    const o2 = makeOrder({
      createdAt: now - 10 * 60000,
      name: "سامر خوري",
      address: "المزة فيلات شرقية، فيلا ١٢",
      payment: "cash",
      note: "",
      items: [
        { id: "m1", name: "مشاوي مشكّل", price: 65, qty: 1, mods: ["حار إضافي"] },
        { id: "a1", name: "حمص", price: 12, qty: 1, mods: [] },
        { id: "a2", name: "متبل", price: 12, qty: 1, mods: [] },
      ],
    });
    o2.status = "preparing";
    o2.acceptedAt = now - 7 * 60000;
    o2.prepTime = 20;
    list.push(o2);

    // قيد التحضير شبه متأخر (مقبول قبل ١٨ دقيقة، وقت ٢٠ — قارب ينتهي)
    const o3 = makeOrder({
      createdAt: now - 22 * 60000,
      name: "لانا مرعي",
      address: "الروضة، شارع المتنبي، بناء ٤، ط٥",
      payment: "online",
      note: "الطابق الخامس بدون مصعد، شكراً",
      items: [
        { id: "w1", name: "وجبة شاورما لحمة", price: 32, qty: 2, mods: ["بدون مخلل"] },
        { id: "d1", name: "كولا", price: 6, qty: 2, mods: [] },
      ],
    });
    o3.status = "preparing";
    o3.acceptedAt = now - 18 * 60000;
    o3.prepTime = 20;
    list.push(o3);

    // جاهز للاستلام (بانتظار الكابتن)
    const o4 = makeOrder({
      createdAt: now - 30 * 60000,
      name: "فادي نصّار",
      address: "كفرسوسة، مقابل الجامع الكبير، ط١",
      payment: "cash",
      note: "",
      items: [
        { id: "m3", name: "كباب حلبي", price: 52, qty: 1, mods: [] },
        { id: "s1", name: "كنافة نابلسية", price: 24, qty: 1, mods: [] },
      ],
    });
    o4.status = "ready";
    o4.acceptedAt = now - 27 * 60000;
    o4.prepTime = 25;
    o4.readyAt = now - 2 * 60000;
    list.push(o4);

    // تم التسليم (للأرشيف)
    const o5 = makeOrder({
      createdAt: now - 58 * 60000,
      name: "هبة الزين",
      address: "المهاجرين، طلعة الشيخ محي الدين، ط٤",
      payment: "online",
      note: "",
      items: [
        { id: "w2", name: "وجبة شاورما دجاج", price: 28, qty: 3, mods: [] },
        { id: "a4", name: "بطاطا مقلية", price: 13, qty: 1, mods: [] },
        { id: "d1", name: "كولا", price: 6, qty: 3, mods: [] },
      ],
    });
    o5.status = "delivered";
    o5.acceptedAt = now - 55 * 60000;
    o5.prepTime = 20;
    o5.readyAt = now - 38 * 60000;
    o5.deliveredAt = now - 33 * 60000;
    list.push(o5);

    const o6 = makeOrder({
      createdAt: now - 80 * 60000,
      name: "كرم سعادة",
      address: "الروضة، شارع المتنبي، بناء ٤، ط٥",
      payment: "cash",
      note: "",
      items: [
        { id: "m5", name: "فروج مشوي كامل", price: 55, qty: 1, mods: [] },
        { id: "a1", name: "حمص", price: 12, qty: 2, mods: [] },
        { id: "a3", name: "تبولة", price: 14, qty: 1, mods: [] },
      ],
    });
    o6.status = "delivered";
    o6.acceptedAt = now - 77 * 60000;
    o6.prepTime = 25;
    o6.readyAt = now - 60 * 60000;
    o6.deliveredAt = now - 54 * 60000;
    list.push(o6);

    // مرفوض (مشكلة دفع)
    const o7 = makeOrder({
      createdAt: now - 12 * 60000,
      name: "وسيم درويش",
      address: "كفرسوسة، مقابل الجامع الكبير، ط١",
      payment: "online",
      note: "",
      items: [
        { id: "m1", name: "مشاوي مشكّل", price: 65, qty: 1, mods: [] },
        { id: "d1", name: "كولا", price: 6, qty: 2, mods: [] },
      ],
    });
    o7.status = "rejected";
    o7.rejectReason = "صنف مطلوب غير متوفّر حالياً";
    o7.rejectedAt = now - 11 * 60000;
    list.push(o7);

    return list;
  }

  // قوالب طلبات واردة للمحاكاة (زر "محاكاة طلب جديد")
  function incomingOrder() {
    return makeOrder({ createdAt: Date.now() });
  }

  // إحصائيات اليوم (ثابتة كقاعدة + تُحدّث حسب الجلسة)
  const TODAY_BASE = {
    completed: 37,
    revenue: 1685,
    rejected: 3,
    avgPrep: 23, // دقيقة
  };

  // بيانات صفحة الإحصاءات (تجريبية)
  const ANALYTICS = {
    last7: [
      { day: "الأحد",    sales: 1180, orders: 26 },
      { day: "الإثنين",  sales: 960,  orders: 21 },
      { day: "الثلاثاء", sales: 1240, orders: 27 },
      { day: "الأربعاء", sales: 1090, orders: 24 },
      { day: "الخميس",   sales: 1520, orders: 33 },
      { day: "الجمعة",   sales: 1760, orders: 39 },
      { day: "السبت",    sales: 1685, orders: 37 },
    ],
    hourly: [
      { h: "11ص", v: 0 }, { h: "12م", v: 2 }, { h: "1م", v: 4 },
      { h: "2م", v: 5 },  { h: "3م", v: 2 }, { h: "4م", v: 1 },
      { h: "5م", v: 2 },  { h: "6م", v: 4 }, { h: "7م", v: 5 },
      { h: "8م", v: 6 },  { h: "9م", v: 4 }, { h: "10م", v: 2 },
    ],
    payment: { cash: 22, online: 15 },
    prepTrend: [24, 22, 25, 23, 21, 26, 23],
    topItems: [
      { name: "شيش طاووق", count: 28 },
      { name: "وجبة شاورما لحمة", count: 24 },
      { name: "مشاوي مشكّل", count: 19 },
      { name: "حمص", count: 17 },
      { name: "بطاطا مقلية", count: 14 },
    ],
    lowItems: [
      { name: "ماء", count: 3 },
      { name: "عيران", count: 4 },
      { name: "متبل", count: 5 },
      { name: "بقلاوة (نص كيلو)", count: 6 },
    ],
    deltas: { sales: -4, orders: -5, aov: 1, prep: -12 },
  };

  // ---------- بيانات يومية (٦٠ يوماً) لدعم الفلترة والتصدير ----------
  const ITEM_RATES_TOP = [
    { name: "شيش طاووق", r: 0.20 },
    { name: "وجبة شاورما لحمة", r: 0.17 },
    { name: "مشاوي مشكّل", r: 0.13 },
    { name: "حمص", r: 0.12 },
    { name: "بطاطا مقلية", r: 0.10 },
  ];
  const ITEM_RATES_LOW = [
    { name: "ماء", r: 0.022 },
    { name: "عيران", r: 0.028 },
    { name: "متبل", r: 0.036 },
    { name: "بقلاوة (نص كيلو)", r: 0.042 },
  ];

  function ymdOf(d) {
    const p = (n) => (n < 10 ? "0" + n : "" + n);
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  const DAY_NAMES = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const MONTHS_AR = ["كانون الثاني","شباط","آذار","نيسان","أيار","حزيران","تموز","آب","أيلول","تشرين الأول","تشرين الثاني","كانون الأول"];

  function prettyDate(str) {
    const [y, m, dd] = str.split("-").map(Number);
    return dd + " " + MONTHS_AR[m - 1] + " " + y;
  }

  // مولّد شبه عشوائي ثابت (لنفس النتائج كل مرة)
  function buildDaily(n, endDate) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      const wd = d.getDay();
      const weekend = (wd === 4 || wd === 5) ? 1.32 : (wd === 6 ? 1.12 : 1); // خميس/جمعة ذروة
      const seed = ((i * 9301 + 49297) % 233280) / 233280;
      let orders = Math.round(22 * weekend + seed * 9 - 3);
      orders = Math.max(12, orders);
      const aov = 44 + ((i * 7) % 16);
      const prep = 20 + ((i * 3) % 9);
      out.push({ date: ymdOf(d), dayName: DAY_NAMES[wd], orders, sales: orders * aov, prep });
    }
    return out;
  }

  // ٦٠ يوماً تنتهي اليوم (الأحدث = اليوم) — يسمح بحساب فترة سابقة للمقارنة
  const _today = new Date();
  const DAILY = buildDaily(60, _today);

  function sum(arr, key) { return arr.reduce((s, x) => s + x[key], 0); }
  function pct(cur, prev) {
    if (!prev) return 0;
    return Math.round(((cur - prev) / prev) * 100);
  }

  // يُرجع كائن إحصاءات محسوب لفترة معيّنة
  // period: "today" | "week" | "month" | "custom"
  function getAnalytics(period, fromStr, toStr) {
    const N = DAILY.length; // 60
    let cur, prev, label;
    if (period === "today") {
      cur = DAILY.slice(N - 1); prev = DAILY.slice(N - 2, N - 1);
      label = "اليوم";
    } else if (period === "month") {
      cur = DAILY.slice(N - 30); prev = DAILY.slice(N - 60, N - 30);
      label = "آخر ٣٠ يوم";
    } else if (period === "custom" && fromStr && toStr) {
      const lo = fromStr <= toStr ? fromStr : toStr;
      const hi = fromStr <= toStr ? toStr : fromStr;
      cur = DAILY.filter((d) => d.date >= lo && d.date <= hi);
      const len = cur.length || 1;
      const firstIdx = DAILY.findIndex((d) => d.date >= lo);
      const start = Math.max(0, (firstIdx < 0 ? N : firstIdx) - len);
      prev = DAILY.slice(start, Math.max(start, (firstIdx < 0 ? N : firstIdx)));
      label = prettyDate(lo) + " — " + prettyDate(hi);
    } else { // week
      cur = DAILY.slice(N - 7); prev = DAILY.slice(N - 14, N - 7);
      label = "آخر ٧ أيام";
    }
    if (cur.length === 0) cur = DAILY.slice(N - 1);

    const totalSales = sum(cur, "sales");
    const totalOrders = sum(cur, "orders");
    const aov = totalOrders ? Math.round(totalSales / totalOrders) : 0;
    const avgPrep = cur.length ? Math.round(sum(cur, "prep") / cur.length) : 0;

    const pSales = sum(prev, "sales");
    const pOrders = sum(prev, "orders");
    const pAov = pOrders ? Math.round(pSales / pOrders) : 0;
    const pPrep = prev.length ? Math.round(sum(prev, "prep") / prev.length) : 0;

    const topItems = ITEM_RATES_TOP.map((it) => ({ name: it.name, count: Math.round(totalOrders * it.r) }));
    const lowItems = ITEM_RATES_LOW.map((it) => ({ name: it.name, count: Math.max(1, Math.round(totalOrders * it.r)) }));
    const cash = Math.round(totalOrders * 0.6);
    const online = totalOrders - cash;

    const bestDay = cur.reduce((m, d) => (d.sales > m.sales ? d : m), cur[0]);

    return {
      period, label, days: cur,
      totalSales, totalOrders, aov, avgPrep,
      deltas: { sales: pct(totalSales, pSales), orders: pct(totalOrders, pOrders), aov: pct(aov, pAov), prep: pct(avgPrep, pPrep) },
      comparable: prev.length > 0,
      topItems, lowItems,
      payment: { cash, online },
      hourly: ANALYTICS.hourly,
      bestDay,
      multiDay: cur.length > 1,
    };
  }

  // حدود التواريخ المتاحة (لمنتقي الفترة المخصّصة)
  const DATE_RANGE = { min: DAILY[0].date, max: DAILY[DAILY.length - 1].date };

  // ---------- تصدير CSV ----------
  function downloadCSV(filename, rows) {
    const csv = rows.map((r) => r.map((cell) => {
      const s = ("" + (cell == null ? "" : cell)).replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? '"' + s + '"' : s;
    }).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }

  // الإعدادات الافتراضية
  const DEFAULT_SETTINGS = {
    name: "مطعم بيت الشام",
    branch: "فرع المالكي",
    phone: "011 234 5678",
    hours: {
      sat: { on: true,  open: "10:00", close: "23:30" },
      sun: { on: true,  open: "10:00", close: "23:30" },
      mon: { on: true,  open: "10:00", close: "23:30" },
      tue: { on: true,  open: "10:00", close: "23:30" },
      wed: { on: true,  open: "10:00", close: "23:30" },
      thu: { on: true,  open: "10:00", close: "00:30" },
      fri: { on: false, open: "13:00", close: "23:30" },
    },
    deliveryFee: 8,
    minOrder: 25,
    defaultPrep: 20,
    alertSound: true,
  };

  const DAYS = [
    { k: "sat", label: "السبت" },
    { k: "sun", label: "الأحد" },
    { k: "mon", label: "الإثنين" },
    { k: "tue", label: "الثلاثاء" },
    { k: "wed", label: "الأربعاء" },
    { k: "thu", label: "الخميس" },
    { k: "fri", label: "الجمعة" },
  ];

  const REJECT_REASONS = [
    "صنف مطلوب غير متوفّر حالياً",
    "المطبخ مزدحم — لا يمكن التحضير الآن",
    "نقص في المكوّنات اللازمة",
    "عطل في معدّات المطبخ",
    "المطعم على وشك الإغلاق",
    "حجم الطلب أكبر من طاقة التحضير الحالية",
  ];

  window.SUNBUL = {
    CURRENCY,
    RESTAURANT,
    MENU,
    money,
    ago,
    minsSince,
    elapsedClock,
    makeOrder,
    seedOrders,
    incomingOrder,
    total,
    TODAY_BASE,
    ANALYTICS,
    getAnalytics,
    DATE_RANGE,
    downloadCSV,
    prettyDate,
    DEFAULT_SETTINGS,
    DAYS,
    REJECT_REASONS,
  };
})();
