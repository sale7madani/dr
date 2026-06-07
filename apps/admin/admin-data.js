/* ============================================================
   سُنبل — لوحة تحكم الإدارة (Super Admin) | بيانات تجريبية + دوال
   منصّة توصيل غزة — تتحكم بالزبائن والكباتن والمطاعم
   ============================================================ */
(function () {
  "use strict";

  const CURRENCY = "₪";

  /* ---------- طرق الدفع (3 طرق) ---------- */
  const PAY_METHODS = {
    bankPalestine: { label: "بنك فلسطين", short: "بنك فلسطين", color: "#2f74c0" },
    jawwalPay:     { label: "جوال باي",   short: "جوال باي",   color: "#1d9d63" },
    palPay:        { label: "بال باي",     short: "بال باي",     color: "#7d3cc0" },
  };
  const PAY_KEYS = Object.keys(PAY_METHODS);

  /* ---------- دوال مساعدة ---------- */
  function money(n) {
    return Math.round(n).toLocaleString("en-US") + " " + CURRENCY;
  }
  function moneyK(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k " + CURRENCY;
    return Math.round(n) + " " + CURRENCY;
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function minsSince(ts) { return Math.max(0, Math.floor((Date.now() - ts) / 60000)); }
  function ago(ts) {
    const m = minsSince(ts);
    if (m < 1) return "الآن";
    if (m === 1) return "منذ دقيقة";
    if (m === 2) return "منذ دقيقتين";
    if (m < 11) return "منذ " + m + " دقائق";
    if (m < 60) return "منذ " + m + " د";
    const h = Math.floor(m / 60);
    if (h === 1) return "منذ ساعة";
    if (h === 2) return "منذ ساعتين";
    if (h < 11) return "منذ " + h + " ساعات";
    return "منذ " + h + " س";
  }
  function elapsedClock(ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    return pad(Math.floor(s / 60)) + ":" + pad(s % 60);
  }
  /* ---------- تقادُم الطلب + SLA (مركز العمليات) ---------- */
  // هدف المنصّة: تسليم خلال ~45 دقيقة. مراقبة عند 30، تأخّر عند 45.
  const SLA_WATCH = 30, SLA_LATE = 45;
  function orderSLA(o) {
    const mins = Math.max(0, Math.floor((Date.now() - o.createdAt) / 60000));
    if (o.status === "delivered" || o.status === "canceled") return { mins, level: "done" };
    if (o.status === "unpaid") return { mins, level: "hold" };
    if (mins >= SLA_LATE) return { mins, level: "late" };
    if (mins >= SLA_WATCH) return { mins, level: "watch" };
    return { mins, level: "ok" };
  }
  function fmtAge(mins) {
    if (mins < 60) return mins + " د";
    const h = Math.floor(mins / 60), m = mins % 60;
    return h + ":" + pad(m) + " س";
  }
  const now = Date.now();
  const MIN = 60000;

  /* ---------- المناطق (أحياء غزة) ---------- */
  const AREAS = ["الرمال", "تل الهوا", "النصر", "الشيخ رضوان", "الزيتون", "الصبرة", "الدرج", "التفاح", "الشجاعية"];

  /* ---------- وجهات التوصيل (١٤ وجهة) + السعر الافتراضي ---------- */
  const DESTINATIONS = [
    "الرمال", "تل الهوا", "النصر", "الشيخ رضوان", "الزيتون", "الصبرة", "الدرج",
    "التفاح", "الشجاعية", "الشاطئ", "الزهراء", "النصيرات", "جباليا", "بيت لاهيا",
  ];
  const DELIVERY_DEFAULTS = {
    "الرمال": 8, "تل الهوا": 8, "النصر": 10, "الشيخ رضوان": 10, "الزيتون": 10,
    "الصبرة": 10, "الدرج": 12, "التفاح": 12, "الشجاعية": 14, "الشاطئ": 10,
    "الزهراء": 18, "النصيرات": 20, "جباليا": 16, "بيت لاهيا": 18,
  };
  /* مواقع تقريبية للمناطق على شبكة الخريطة (0-100) لحساب المسافات بالكيلومتر */
  const ZONE_POS = {
    "الرمال": { x: 28, y: 30 }, "تل الهوا": { x: 44, y: 56 }, "النصر": { x: 60, y: 26 },
    "الشيخ رضوان": { x: 38, y: 18 }, "الزيتون": { x: 52, y: 74 }, "الصبرة": { x: 72, y: 60 },
    "الدرج": { x: 64, y: 46 }, "التفاح": { x: 84, y: 36 }, "الشجاعية": { x: 86, y: 70 },
    "الشاطئ": { x: 16, y: 40 }, "الزهراء": { x: 55, y: 92 }, "النصيرات": { x: 70, y: 96 },
    "جباليا": { x: 50, y: 8 }, "بيت لاهيا": { x: 40, y: 5 },
  };
  function zoneKm(a, b) {
    const A = ZONE_POS[a] || { x: 50, y: 50 }, B = ZONE_POS[b] || { x: 50, y: 50 };
    return Math.max(0.8, Math.round(Math.hypot(A.x - B.x, A.y - B.y) / 7 * 10) / 10);
  }
  function pointKm(x, y, area) {
    const B = ZONE_POS[area] || { x: 50, y: 50 };
    return Math.max(0.5, Math.round(Math.hypot(x - B.x, y - B.y) / 7 * 10) / 10);
  }

  /* ---------- المطاعم ---------- */
  // status: active | busy | closed | pending | suspended
  const RESTAURANTS = [
    { id: "r1", name: "PIZZA ROOM", ar: "بيتزا روم", cuisine: "بيتزا وباستا وكاليزوني", area: "الرمال", status: "active", commission: 15, rating: 4.9, ordersToday: 34, ordersTotal: 1820, revenueToday: 1560, grad: "linear-gradient(135deg,#c0392b,#8e2820)", joined: "2025-09-12", prep: 32 },
    { id: "r2", name: "SANDWICH HUB", ar: "ساندويتش هَب", cuisine: "ساندويتشات ووجبات دجاج", area: "النصر", status: "busy", commission: 15, rating: 4.8, ordersToday: 41, ordersTotal: 2140, revenueToday: 1890, grad: "linear-gradient(135deg,#fbc52a,#f3a712)", joined: "2025-08-30", prep: 28 },
    { id: "r3", name: "BIRDS & BUNS", ar: "بيردز آند بَنز", cuisine: "برجر ودجاج مقرمش", area: "تل الهوا", status: "active", commission: 18, rating: 4.9, ordersToday: 38, ordersTotal: 1960, revenueToday: 2010, grad: "linear-gradient(135deg,#7d3cc0,#5e2a93)", joined: "2025-09-02", prep: 30 },
    { id: "r4", name: "مشاوي الشام", ar: "مشاوي الشام", cuisine: "مشاوي على الفحم وفطائر", area: "الزيتون", status: "active", commission: 14, rating: 4.7, ordersToday: 22, ordersTotal: 1340, revenueToday: 1420, grad: "linear-gradient(135deg,#1f9d55,#157a41)", joined: "2025-10-18", prep: 40 },
    { id: "r5", name: "حلا وكيك", ar: "حلا وكيك", cuisine: "حلويات شرقية وكيك", area: "الرمال", status: "closed", commission: 16, rating: 4.8, ordersToday: 0, ordersTotal: 760, revenueToday: 0, grad: "linear-gradient(135deg,#d6457e,#a82a5b)", joined: "2025-11-05", prep: 25 },
    { id: "r6", name: "فريش جوس", ar: "فريش جوس", cuisine: "عصائر طازة ومشروبات", area: "الصبرة", status: "active", commission: 12, rating: 4.6, ordersToday: 19, ordersTotal: 980, revenueToday: 540, grad: "linear-gradient(135deg,#2f74c0,#235a96)", joined: "2025-12-01", prep: 15 },
    { id: "r7", name: "مطعم بيت الشام", ar: "بيت الشام", cuisine: "مشاوي ووجبات شامية", area: "النصر", status: "active", commission: 15, rating: 4.7, ordersToday: 29, ordersTotal: 1510, revenueToday: 1685, grad: "linear-gradient(135deg,#b8742a,#8f561a)", joined: "2025-07-22", prep: 23 },
    // قيد المراجعة (طلبات انضمام)
    { id: "r8", name: "مندي الخليج", ar: "مندي الخليج", cuisine: "مندي وكبسة ومظبي", area: "الشيخ رضوان", status: "active", commission: 15, rating: 4.6, ordersToday: 18, ordersTotal: 320, revenueToday: 980, grad: "linear-gradient(135deg,#3a2f6b,#2a2150)", joined: "2026-03-04", prep: 45 },
    { id: "r9", name: "كرسبي تشيكن", ar: "كرسبي تشيكن", cuisine: "دجاج مقلي وبروست", area: "التفاح", status: "active", commission: 15, rating: 4.5, ordersToday: 15, ordersTotal: 240, revenueToday: 760, grad: "linear-gradient(135deg,#c79a1e,#9c7510)", joined: "2026-03-15", prep: 25 },
    // موقوف
    { id: "r10", name: "أطايب البحر", ar: "أطايب البحر", cuisine: "أسماك ومأكولات بحرية", area: "الشجاعية", status: "suspended", commission: 16, rating: 4.2, ordersToday: 0, ordersTotal: 420, revenueToday: 0, grad: "linear-gradient(135deg,#2a2722,#454039)", joined: "2026-01-14", prep: 38, suspendReason: "شكاوى متكرّرة حول جودة الطلبات" },
  ];

  /* ---------- الكباتن ---------- */
  // status: online (متاح) | busy (بتوصيلة) | offline (غير متصل)
  // payType: "daily" (موظف بيومية) | "commission" (بالنسبة، 0 = بدون عمولة) | incentive: حافز/طلب
  // ملف الكابتن: name اسم · birth تاريخ ميلاد · address عنوان سكن · vehicle نوع دراجة · idNo رقم الهوية
  const CAPTAINS = [
    { id: "p1", username: "mahmoud.nada", password: "snbl5821", name: "محمود أبو ندى", phone: "0599-201-145", phone2: "0567-880-114", area: "الرمال", address: "الرمال — شارع الجلاء، بناية النور", birth: "1996-04-12", idNo: "900345128", payMethod: "jawwalPay", payAccount: "0567-880-114", status: "busy", vehicle: "سكوتر", payType: "commission", capCommission: 10, dailyWage: 0, incentive: 1, active: 1, todayTrips: 9, todayEarn: 108, rating: 4.9, totalTrips: 842, joined: "2025-09-01", x: 28, y: 34 },
    { id: "p2", username: "anas.shawa", password: "snbl7340", name: "أنس الشوّا", phone: "0598-330-712", area: "تل الهوا", address: "تل الهوا — شارع الصناعة", birth: "1994-11-03", idNo: "902118734", payMethod: "bankPalestine", payAccount: "PAL-0042-118734", status: "busy", vehicle: "دراجة كهربائية", payType: "daily", capCommission: 0, dailyWage: 80, incentive: 1, active: 1, todayTrips: 7, todayEarn: 87, rating: 4.8, totalTrips: 651, joined: "2025-09-20", x: 42, y: 58 },
    { id: "p3", username: "kareem.m", password: "snbl1190", name: "كريم مقداد", phone: "0597-118-904", area: "النصر", address: "النصر — دوار العودة", birth: "1999-02-21", idNo: "903887401", payMethod: "palPay", payAccount: "0597-118-904", status: "online", vehicle: "دراجة هوائية", payType: "daily", capCommission: 0, dailyWage: 70, incentive: 0, active: 0, todayTrips: 5, todayEarn: 70, rating: 4.7, totalTrips: 388, joined: "2025-10-11", x: 60, y: 30 },
    { id: "p4", username: "yousef.h", password: "snbl4470", name: "يوسف حمدان", phone: "0599-447-238", phone2: "0566-204-913", area: "الزيتون", address: "الزيتون — شارع صلاح الدين", birth: "1992-07-30", idNo: "901024556", payMethod: "bankPalestine", payAccount: "PAL-0091-447238", status: "busy", vehicle: "سكوتر", payType: "commission", capCommission: 12, dailyWage: 0, incentive: 1, active: 2, todayTrips: 11, todayEarn: 142, rating: 4.9, totalTrips: 1024, joined: "2025-08-14", x: 52, y: 74 },
    { id: "p5", username: "rami.saqqa", password: "snbl6620", name: "رامي السقّا", phone: "0598-662-501", area: "الصبرة", address: "الصبرة — شارع الوحدة", birth: "1997-09-18", idNo: "904550312", payMethod: "jawwalPay", payAccount: "0598-662-501", status: "online", vehicle: "دراجة كهربائية", payType: "commission", capCommission: 0, dailyWage: 0, incentive: 2, active: 0, todayTrips: 6, todayEarn: 84, rating: 4.6, totalTrips: 503, joined: "2025-11-02", x: 70, y: 62 },
    { id: "p6", username: "abdullah.m", password: "snbl9050", name: "عبدالله مطر", phone: "0597-905-330", area: "الشيخ رضوان", address: "الشيخ رضوان — شارع الثورة", birth: "2000-01-25", idNo: "940112889", payMethod: "jawwalPay", payAccount: "0597-905-330", status: "online", vehicle: "دراجة هوائية", payType: "daily", capCommission: 0, dailyWage: 60, incentive: 1, active: 0, todayTrips: 4, todayEarn: 64, rating: 4.5, totalTrips: 277, joined: "2025-12-19", x: 38, y: 18 },
    { id: "p7", username: "tamer.a", password: "snbl7710", name: "تامر العبادلة", phone: "0599-771-088", area: "الدرج", address: "الدرج — حي التركمان", birth: "1998-06-09", idNo: "905330217", payMethod: "palPay", payAccount: "0599-771-088", status: "offline", vehicle: "دراجة هوائية", payType: "daily", capCommission: 0, dailyWage: 60, incentive: 0, active: 0, todayTrips: 3, todayEarn: 60, rating: 4.4, totalTrips: 190, joined: "2026-01-08", x: 64, y: 46 },
    { id: "p8", username: "sami.r", password: "snbl2040", name: "سامي أبو رمضان", phone: "0598-204-619", phone2: "0569-771-330", area: "التفاح", address: "التفاح — شارع بغداد", birth: "1995-12-14", idNo: "906120945", payMethod: "bankPalestine", payAccount: "PAL-0063-204619", status: "busy", vehicle: "دراجة كهربائية", payType: "commission", capCommission: 10, dailyWage: 0, incentive: 1, active: 1, todayTrips: 8, todayEarn: 96, rating: 4.8, totalTrips: 612, joined: "2025-10-29", x: 80, y: 38 },
    { id: "p9", username: "khaled.n", password: "snbl5530", name: "خالد النجّار", phone: "0597-553-410", area: "الشجاعية", address: "الشجاعية — شارع المنطار", birth: "1993-03-02", idNo: "901445670", payMethod: "bankPalestine", payAccount: "PAL-0024-553410", status: "offline", vehicle: "سكوتر", payType: "daily", capCommission: 0, dailyWage: 70, incentive: 0, active: 0, todayTrips: 0, todayEarn: 0, rating: 4.3, totalTrips: 145, joined: "2026-02-21", x: 86, y: 70 },
    { id: "p10", username: "wael.s", password: "snbl3180", name: "وائل صيام", phone: "0599-318-927", area: "الرمال", address: "الرمال — شارع الشهداء", birth: "1996-08-27", idNo: "904591203", payMethod: "palPay", payAccount: "0599-318-927", status: "online", vehicle: "دراجة كهربائية", payType: "commission", capCommission: 8, dailyWage: 0, incentive: 1, active: 0, todayTrips: 7, todayEarn: 84, rating: 4.7, totalTrips: 459, joined: "2025-11-25", x: 22, y: 50 },
  ];
  const VEHICLES = ["دراجة هوائية", "دراجة كهربائية", "سكوتر"];
  // الحالة الفعلية للكابتن: من عنده طلب نشط = بتوصيلة (busy)، وإلا حالته الأساسية (متاح/غير متصل)
  const CAP_ACTIVE_ST = ["onway", "new", "preparing", "ready"];
  function capStatus(c, orders) {
    const hasActive = orders && orders.some((o) => o.captainId === c.id && CAP_ACTIVE_ST.includes(o.status));
    if (hasActive) return "busy";
    return c.status === "busy" ? "online" : c.status;
  }
  function capActiveCount(c, orders) {
    return orders ? orders.filter((o) => o.captainId === c.id && CAP_ACTIVE_ST.includes(o.status)).length : 0;
  }

  /* ---------- الزبائن ---------- */
  // status: active | vip | flagged
  const CUSTOMERS = [
    { id: "u1", name: "ريم حدّاد", phone: "0599-104-552", area: "الرمال", orders: 47, spent: 2340, status: "vip", joined: "2025-09-15", last: now - 22 * MIN },
    { id: "u2", name: "سامر خوري", phone: "0598-771-203", area: "تل الهوا", orders: 31, spent: 1620, status: "regular", joined: "2025-10-02", last: now - 3 * 60 * MIN },
    { id: "u3", name: "لانا مرعي", phone: "0597-330-118", area: "النصر", orders: 28, spent: 1410, status: "regular", joined: "2025-10-20", last: now - 40 * MIN },
    { id: "u4", name: "فادي نصّار", phone: "0599-218-740", area: "الزيتون", orders: 12, spent: 580, status: "atrisk", joined: "2025-12-11", last: now - 19 * 24 * 60 * MIN },
    { id: "u5", name: "هبة الزين", phone: "0598-905-661", area: "الصبرة", orders: 53, spent: 2780, status: "vip", joined: "2025-08-28", last: now - 75 * MIN },
    { id: "u6", name: "وسيم درويش", phone: "0597-447-902", area: "الشيخ رضوان", orders: 9, spent: 410, status: "flagged", joined: "2026-01-19", last: now - 12 * MIN, flag: "بلاغات إلغاء متكررة بعد التأكيد" },
    { id: "u7", name: "نور قاسم", phone: "0599-662-318", area: "الدرج", orders: 22, spent: 1080, status: "regular", joined: "2025-11-08", last: now - 2 * 60 * MIN },
    { id: "u8", name: "جاد إبراهيم", phone: "0598-118-507", area: "التفاح", orders: 18, spent: 870, status: "regular", joined: "2025-12-30", last: now - 90 * MIN },
    { id: "u9", name: "ميس الحلبي", phone: "0597-204-883", area: "الشجاعية", orders: 6, spent: 290, status: "new", joined: "2026-02-14", last: now - 6 * 60 * MIN },
    { id: "u10", name: "كرم سعادة", phone: "0599-553-271", area: "الرمال", orders: 39, spent: 1950, status: "regular", joined: "2025-09-25", last: now - 18 * MIN },
  ];

  /* ---------- الطلبات (على مستوى المنصّة) ---------- */
  // دورة الحياة الكاملة:
  // unpaid     → غير مدفوع (الزبون فعّل مشكلة رفع الوصل ولم يرفعه — يحتاج متابعة الدعم)
  // processing → قيد المعالجة (مدفوع/مؤكد، لدى الإدارة فقط، لم يُحوّل للمطعم بعد)
  // new        → طلب جديد (حوّلته الإدارة للمطعم + عيّنت كابتن، بانتظار قبول المطعم)
  // preparing  → قيد التحضير (المطعم وافق ويحضّر)
  // ready      → جاهز (المطعم جهّز وغلّف)
  // onway      → جاري التوصيل (الكابتن استلم وانطلق)
  // delivered  → تم التسليم / مكتمل
  // canceled   → ملغى (رفض المطعم / إلغاء)
  const MENU_SAMPLES = {
    r1: [["بيتزا مارغريتا وسط", 32], ["بيتزا خضار", 36], ["كاليزوني لحمة", 40], ["باستا ألفريدو", 34]],
    r2: [["ساندويتش دجاج مشوي", 22], ["شاورما عربي", 18], ["كومبو دجاج كرسبي", 30], ["بطاطا ودجز", 14]],
    r3: [["برجر دبل تشيكن", 38], ["برجر لحمة كلاسيك", 34], ["دجاج مقرمش ٦ قطع", 32], ["أصابع موزاريلا", 18]],
    r4: [["مشاوي مشكّل", 65], ["شيش طاووق", 48], ["كباب حلبي", 52], ["فروج مشوي", 55]],
    r6: [["عصير برتقال طازة", 12], ["كوكتيل فواكه", 16], ["ليمون نعنع", 9], ["سموثي مانجو", 18]],
    r7: [["وجبة شاورما لحمة", 32], ["صحن حمص باللحمة", 26], ["فتة مكدوس", 30], ["كولا", 6]],
  };
  function pickOrderItems(rid) {
    const pool = MENU_SAMPLES[rid] || MENU_SAMPLES.r7;
    const n = 1 + Math.floor(Math.random() * 3);
    const out = [];
    const used = new Set();
    for (let k = 0; k < n; k++) {
      const idx = Math.floor(Math.random() * pool.length);
      if (used.has(idx)) continue;
      used.add(idx);
      out.push({ name: pool[idx][0], price: pool[idx][1], qty: 1 + Math.floor(Math.random() * 2) });
    }
    return out;
  }
  function itemsTotal(items) { return items.reduce((s, i) => s + i.price * i.qty, 0); }

  /* ---------- منيو كل مطعم (فئات + أصناف) ---------- */
  const MENUS = {
    r1: [
      { cat: "بيتزا", items: [["مارغريتا وسط", 32], ["بيتزا خضار", 36], ["بيتزا دجاج", 42], ["بيتزا مشكّل لحوم", 46]] },
      { cat: "باستا وكاليزوني", items: [["باستا ألفريدو", 34], ["باستا بولونيز", 36], ["كاليزوني لحمة", 40]] },
      { cat: "إضافات ومشروبات", items: [["خبز بالثوم", 14], ["كولا", 6], ["مياه", 3]] },
    ],
    r2: [
      { cat: "ساندويتشات", items: [["دجاج مشوي", 22], ["شاورما عربي", 18], ["فاهيتا دجاج", 24]] },
      { cat: "وجبات دجاج", items: [["كومبو كرسبي", 30], ["بروست ٤ قطع", 28], ["زنجر ميل", 26]] },
      { cat: "جانبية", items: [["بطاطا ودجز", 14], ["سلطة كول سلو", 8]] },
    ],
    r3: [
      { cat: "برجر", items: [["دبل تشيكن", 38], ["لحمة كلاسيك", 34], ["سمش برجر", 36]] },
      { cat: "دجاج مقرمش", items: [["٦ قطع", 32], ["٩ قطع", 44], ["تندرز", 28]] },
      { cat: "مقبّلات", items: [["أصابع موزاريلا", 18], ["حلقات بصل", 14]] },
    ],
    r4: [
      { cat: "مشاوي", items: [["مشاوي مشكّل", 65], ["شيش طاووق", 48], ["كباب حلبي", 52], ["فروج مشوي", 55]] },
      { cat: "فطائر", items: [["لحم بعجين", 12], ["فطيرة جبنة", 10]] },
    ],
    r5: [
      { cat: "حلويات شرقية", items: [["كنافة نابلسية", 22], ["بقلاوة", 18], ["وربات قشطة", 16]] },
      { cat: "كيك", items: [["تشيز كيك", 20], ["كيك شوكولاتة", 18]] },
    ],
    r6: [
      { cat: "عصائر طازة", items: [["برتقال", 12], ["ليمون نعنع", 9], ["مانجو", 14]] },
      { cat: "مشروبات", items: [["كوكتيل فواكه", 16], ["سموثي مانجو", 18], ["ميلك شيك", 17]] },
    ],
    r7: [
      { cat: "وجبات شامية", items: [["وجبة شاورما لحمة", 32], ["فتة مكدوس", 30], ["صحن حمص باللحمة", 26]] },
      { cat: "مشاوي", items: [["شيش طاووق", 46], ["مشاوي مشكّل", 60]] },
      { cat: "مشروبات", items: [["كولا", 6], ["عيران", 7]] },
    ],
  };
  function restMenu(rid) { return MENUS[rid] || MENUS.r7; }

  /* ---------- ساعات العمل الافتراضية ---------- */
  const DEFAULT_HOURS = [
    { d: "السبت", open: "10:00", close: "23:30", on: true },
    { d: "الأحد", open: "10:00", close: "23:30", on: true },
    { d: "الإثنين", open: "10:00", close: "23:30", on: true },
    { d: "الثلاثاء", open: "10:00", close: "23:30", on: true },
    { d: "الأربعاء", open: "10:00", close: "23:30", on: true },
    { d: "الخميس", open: "10:00", close: "00:30", on: true },
    { d: "الجمعة", open: "13:00", close: "00:30", on: true },
  ];
  function restHours(r) { return r.hours || DEFAULT_HOURS; }
  // الحالة الفعلية للمطعم: موقوف (إداري) > مغلق > مزدحم (حمل عالٍ مُشتقّ) > نشط
  function restStatus(r, orders) {
    if (r.status === "suspended") return "suspended";
    if (r.status === "closed") return "closed";
    const load = orders ? orders.filter((o) => o.rid === r.id && ["new", "preparing", "ready"].includes(o.status)).length : 0;
    return load >= 3 ? "busy" : "active";
  }
  function restLoad(r, orders) {
    return orders ? orders.filter((o) => o.rid === r.id && ["new", "preparing", "ready"].includes(o.status)).length : 0;
  }

  /* ---------- الأشخاص والأذونات (فريق لوحة التحكم) ---------- */
  const PERMISSIONS = [
    { k: "orders", label: "الطلبات" },
    { k: "captains", label: "الكباتن" },
    { k: "restaurants", label: "المطاعم" },
    { k: "customers", label: "الزبائن" },
    { k: "finance", label: "المالية" },
    { k: "promos", label: "البرومو كودز" },
    { k: "reports", label: "التقارير" },
    { k: "settings", label: "الإعدادات" },
  ];
  const ROLES = {
    owner:   { label: "المالك", desc: "صلاحية كاملة على كل شيء", cls: "b-gold" },
    ops:     { label: "مشرف عمليات", desc: "الطلبات والكباتن والمطاعم", cls: "b-purple" },
    finance: { label: "محاسب", desc: "المالية والتقارير", cls: "b-blue" },
    support: { label: "دعم فني", desc: "الطلبات والزبائن", cls: "b-cyan" },
    custom:  { label: "مخصّص", desc: "أذونات مخصّصة", cls: "b-gray" },
  };
  function rolePerms(role) {
    const all = (lvl) => PERMISSIONS.reduce((o, p) => (o[p.k] = lvl, o), {});
    if (role === "owner") return all("edit");
    if (role === "ops") return { ...all("none"), orders: "edit", captains: "edit", restaurants: "edit", customers: "edit", reports: "view", promos: "view" };
    if (role === "finance") return { ...all("none"), finance: "edit", reports: "edit", orders: "view", restaurants: "view" };
    if (role === "support") return { ...all("none"), orders: "edit", customers: "edit", captains: "view" };
    return all("none");
  }
  function seedTeam() {
    return [
      { id: "tm1", name: "سنبل غزة", role: "owner", phone: "0599-700-100", email: "admin@sonbol.ps", active: true, you: true, perms: rolePerms("owner"), last: now - 2 * MIN },
      { id: "tm2", name: "أحمد المصري", role: "ops", phone: "0598-201-440", email: "ahmad@sonbol.ps", active: true, perms: rolePerms("ops"), last: now - 35 * MIN },
      { id: "tm3", name: "ليان حمد", role: "finance", phone: "0597-330-810", email: "layan@sonbol.ps", active: true, perms: rolePerms("finance"), last: now - 3 * 60 * MIN },
      { id: "tm4", name: "خالد يوسف", role: "support", phone: "0599-118-272", email: "khaled@sonbol.ps", active: true, perms: rolePerms("support"), last: now - 20 * MIN },
      { id: "tm5", name: "رنا سالم", role: "support", phone: "0598-905-117", email: "rana@sonbol.ps", active: false, perms: rolePerms("support"), last: now - 5 * 24 * 60 * MIN },
    ];
  }

  let onum = 5180;
  function mkOrder(o) {
    onum += 1;
    const rest = RESTAURANTS.find((r) => r.id === o.rid);
    const cust = CUSTOMERS.find((c) => c.id === o.uid);
    const items = o.items || pickOrderItems(o.rid);
    const sub = itemsTotal(items);
    const delivery = 8;
    const method = o.payment || PAY_KEYS[Math.floor(Math.random() * 3)];
    const prefix = { bankPalestine: "PB", jawwalPay: "JP", palPay: "PP" }[method] || "TX";
    const payRef = o.payRef || (prefix + "-" + (90000 + onum));
    return {
      id: "o-" + onum, number: onum,
      status: o.status, rid: o.rid, restaurant: rest.name, restGrad: rest.grad,
      uid: o.uid, customer: cust.name, custPhone: cust.phone,
      area: o.area || cust.area,
      captainId: o.captainId || null,
      captain: o.captainId ? (CAPTAINS.find((c) => c.id === o.captainId) || {}).name : null,
      items, itemCount: items.reduce((s, i) => s + i.qty, 0),
      subtotal: sub, delivery, total: sub + delivery,
      commission: Math.round(sub * (rest.commission / 100)),
      km: o.km != null ? o.km : zoneKm(rest.area, o.area || cust.area),
      payment: method,
      payStatus: o.payStatus || "verified",
      payRef,
      createdAt: o.createdAt, note: o.note || "",
      rejectReason: o.rejectReason || null,
      issue: o.issue || null,
    };
  }

  function seedOrders() {
    const list = [];
    // — مرحلة الدفع (لدى الإدارة) —
    // غير مدفوع: الزبون فعّل «مشكلة في رفع الوصل» ولم يرفعه — يحتاج اتصال الدعم
    list.push(mkOrder({ rid: "r2", uid: "u6", status: "unpaid", createdAt: now - 3 * MIN, payment: "bankPalestine", payStatus: "unpaid", note: "ما قدرت أرفع صورة الوصل، حوّلت على بنك فلسطين — اتصلوا فيّ لو سمحتم" }));
    list.push(mkOrder({ rid: "r1", uid: "u4", status: "unpaid", createdAt: now - 9 * MIN, payment: "bankPalestine", payStatus: "unpaid", note: "مشكلة في رفع الإيصال" }));
    // قيد المعالجة: مدفوع/مؤكد، لدى الإدارة — جاهز للتحويل للمطعم (بلا كابتن بعد)
    list.push(mkOrder({ rid: "r3", uid: "u1", status: "processing", createdAt: now - 1 * MIN, payment: "bankPalestine", payStatus: "pending" }));
    list.push(mkOrder({ rid: "r7", uid: "u10", status: "processing", createdAt: now - 4 * MIN, payment: "jawwalPay", payStatus: "pending" }));
    list.push(mkOrder({ rid: "r4", uid: "u2", status: "processing", createdAt: now - 6 * MIN, payment: "bankPalestine", payStatus: "verified", note: "الطابق الثالث، بجانب الصيدلية" }));
    // — مرحلة المطعم والكابتن —
    // طلب جديد: حوّلته الإدارة للمطعم وعيّنت كابتن — بانتظار قبول المطعم
    list.push(mkOrder({ rid: "r2", uid: "u8", status: "new", createdAt: now - 8 * MIN, captainId: "p3", payment: "jawwalPay", payStatus: "verified" }));
    list.push(mkOrder({ rid: "r1", uid: "u3", status: "new", createdAt: now - 10 * MIN, captainId: "p6", payment: "bankPalestine", payStatus: "verified" }));
    // قيد التحضير
    list.push(mkOrder({ rid: "r3", uid: "u5", status: "preparing", createdAt: now - 14 * MIN, captainId: "p2", payment: "bankPalestine", payStatus: "verified" }));
    list.push(mkOrder({ rid: "r4", uid: "u7", status: "preparing", createdAt: now - 18 * MIN, captainId: "p4", payment: "jawwalPay", payStatus: "verified" }));
    // جاهز (المطعم جهّز، الكابتن في الطريق للاستلام)
    list.push(mkOrder({ rid: "r7", uid: "u9", status: "ready", createdAt: now - 22 * MIN, captainId: "p5", payment: "jawwalPay", payStatus: "verified", note: "الطابق الخامس بدون مصعد" }));
    // جاري التوصيل
    list.push(mkOrder({ rid: "r2", uid: "u8", status: "onway", createdAt: now - 26 * MIN, captainId: "p1", payment: "bankPalestine", payStatus: "verified" }));
    list.push(mkOrder({ rid: "r1", uid: "u4", status: "onway", createdAt: now - 31 * MIN, captainId: "p8", payment: "jawwalPay", payStatus: "verified" }));
    // مُسلّمة (سجل اليوم)
    const delivered = [
      { rid: "r1", uid: "u1", cap: "p1", m: 48 }, { rid: "r2", uid: "u2", cap: "p2", m: 55 },
      { rid: "r3", uid: "u3", cap: "p3", m: 62 }, { rid: "r7", uid: "u5", cap: "p4", m: 70 },
      { rid: "r4", uid: "u7", cap: "p5", m: 80 }, { rid: "r2", uid: "u10", cap: "p8", m: 95 },
      { rid: "r3", uid: "u8", cap: "p10", m: 110 }, { rid: "r6", uid: "u4", cap: "p1", m: 130 },
      { rid: "r1", uid: "u5", cap: "p2", m: 145 }, { rid: "r7", uid: "u3", cap: "p4", m: 160 },
    ];
    delivered.forEach((d) => list.push(mkOrder({ rid: d.rid, uid: d.uid, status: "delivered", captainId: d.cap, createdAt: now - d.m * MIN, payment: ["bankPalestine","jawwalPay","palPay"][Math.floor(Math.random()*3)], payStatus: "verified" })));
    // ملغاة
    list.push(mkOrder({ rid: "r2", uid: "u6", status: "canceled", createdAt: now - 52 * MIN, payment: "palPay", payStatus: "rejected", note: "إلغاء من الزبون بعد التأكيد" }));
    list.push(mkOrder({ rid: "r4", uid: "u9", status: "canceled", createdAt: now - 88 * MIN, payment: "jawwalPay", payStatus: "verified", note: "المطعم رفض — صنف غير متوفّر" }));
    return list;
  }

  /* ---------- تحويلات بنكية بانتظار التحقق ---------- */
  function seedTransfers() {
    return [
      { id: "t1", customer: "ريم حدّاد", order: 5183, amount: 64, method: "bankPalestine", bank: "بنك فلسطين", ref: "PB-99381", at: now - 4 * MIN, status: "pending" },
      { id: "t2", customer: "جاد إبراهيم", order: 5186, amount: 96, method: "jawwalPay", bank: "جوال باي", ref: "JP-21744", at: now - 12 * MIN, status: "pending" },
      { id: "t3", customer: "هبة الزين", order: 5189, amount: 58, method: "palPay", bank: "بال باي", ref: "PP-55012", at: now - 28 * MIN, status: "pending" },
      { id: "t4", customer: "وسيم درويش", order: 5191, amount: 42, method: "bankPalestine", bank: "بنك فلسطين", ref: "PB-77260", at: now - 41 * MIN, status: "flagged", note: "مبلغ التحويل لا يطابق الطلب" },
    ];
  }

  /* ---------- تسويات المطاعم (مستحقات) ---------- */
  const SETTLEMENTS = [
    { rid: "r1", name: "PIZZA ROOM", orders: 34, gross: 1560, commission: 234, net: 1326, status: "due" },
    { rid: "r2", name: "SANDWICH HUB", orders: 41, gross: 1890, commission: 284, net: 1606, status: "due" },
    { rid: "r3", name: "BIRDS & BUNS", orders: 38, gross: 2010, commission: 362, net: 1648, status: "scheduled" },
    { rid: "r4", name: "مشاوي الشام", orders: 22, gross: 1420, commission: 199, net: 1221, status: "due" },
    { rid: "r7", name: "بيت الشام", orders: 29, gross: 1685, commission: 253, net: 1432, status: "paid" },
    { rid: "r6", name: "فريش جوس", orders: 19, gross: 540, commission: 65, net: 475, status: "paid" },
  ];

  /* ---------- الأسبوع ينتهي يوم الخميس ---------- */
  function weekEndThursday() {
    const d = new Date();
    const day = d.getDay();              // 0=الأحد … 4=الخميس
    const add = (4 - day + 7) % 7;        // أقرب خميس (اليوم لو كان خميساً)
    const t = new Date(d); t.setDate(d.getDate() + add);
    return t;
  }
  function prettyDay(d) {
    return d.toLocaleDateString("ar-EG-u-nu-latn", { weekday: "long", day: "numeric", month: "long" });
  }

  /* ---------- مستحقات الكباتن الأسبوعية ---------- */
  // status: requested (طلب السحب — بانتظار الصرف) | accruing (يتراكم — لم يُطلب) | paid (صُرف هذا الأسبوع)
  const PAYOUT_STATE = ["requested", "accruing", "requested", "paid", "accruing", "requested", "accruing", "paid", "accruing", "requested"];
  function seedPayouts() {
    return CAPTAINS.map((c, i) => {
      const trips = c.status === "offline" && c.totalTrips < 200 ? 18 + (i * 5) % 14 : 34 + (i * 7) % 28; // توصيلات الأسبوع
      const incentives = c.incentive * trips;
      let base;
      if (c.payType === "daily") base = c.dailyWage * 6;                       // 6 أيام عمل
      else base = Math.round(8 * (1 - c.capCommission / 100) * trips);          // حصة التوصيل بعد عمولة المنصّة
      const due = base + incentives;
      return { id: "pay-" + c.id, capId: c.id, name: c.name, payType: c.payType, vehicle: c.vehicle, payMethod: c.payMethod, payAccount: c.payAccount, trips, base, incentives, due, status: PAYOUT_STATE[i] || "accruing", reqAt: now - (i * 37 + 5) * MIN };
    });
  }

  /* ---------- التقييمات والمراجعات ---------- */
  function ratingDist(avg, total){
    total = total || 100;
    let w;
    if (avg >= 4.8) w = [0.86, 0.10, 0.03, 0.007, 0.003];
    else if (avg >= 4.5) w = [0.74, 0.18, 0.05, 0.02, 0.01];
    else if (avg >= 4.2) w = [0.62, 0.22, 0.10, 0.04, 0.02];
    else w = [0.50, 0.25, 0.13, 0.08, 0.04];
    return [5, 4, 3, 2, 1].map((star, i) => ({ star, count: Math.round(w[i] * total) }));
  }
  const CAP_REVIEWS = [
    { by: "ريم حدّاد", stars: 5, text: "كابتن محترم ووصل بسرعة، الله يعطيه العافية", at: now - 2 * 60 * MIN },
    { by: "كرم سعادة", stars: 5, text: "الطلب وصل ساخن وبالوقت المحدّد تماماً", at: now - 5 * 60 * MIN },
    { by: "نور قاسم", stars: 4, text: "متعاون ولطيف، بس تأخّر شوي بسبب الزحمة", at: now - 26 * 60 * MIN },
    { by: "جاد إبراهيم", stars: 5, text: "أمين وملتزم، اتصل قبل ما يوصل", at: now - 50 * 60 * MIN },
  ];
  const REST_REVIEWS = [
    { by: "هبة الزين", stars: 5, text: "الأكل ممتاز والتغليف نظيف ومرتّب", at: now - 3 * 60 * MIN },
    { by: "لانا مرعي", stars: 5, text: "من أفضل المطاعم بغزة، طعم رائع", at: now - 8 * 60 * MIN },
    { by: "سامر خوري", stars: 4, text: "طيب بس الكمية أقل من المتوقّع شوي", at: now - 30 * 60 * MIN },
    { by: "فادي نصّار", stars: 5, text: "سرعة في التحضير وجودة ثابتة دائماً", at: now - 70 * 60 * MIN },
  ];

  /* ---------- تدفّق الأموال (سنبل وسيط) ---------- */
  const MONEY_FLOW = {
    collectedToday: 11004,   // إجمالي المحصّل (قيمة الطلبات + التوصيل)
    foodSales: 9540,         // قيمة الأصناف (GMV)
    deliveryFees: 1464,      // رسوم التوصيل المحصّلة
    restaurantCommission: 1431, // عمولة المطاعم
    captainPayout: 980,      // مستحقات الكباتن اليومية
    netProfit: 1915,         // صافي ربح المنصّة
  };

  /* ---------- سجلّ تفصيلي للتقارير (٣٠ يوماً، قابل للفلترة) ---------- */
  function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function buildReportRecords(){
    const rnd = mulberry32(20260607);
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const rests = RESTAURANTS.filter((r) => ["active", "busy", "closed"].includes(r.status));
    const caps = CAPTAINS;
    const recs = [];
    const DAY = 24 * 60 * 60000;
    // توزيع يومي يحاكي اتجاه آخر ٣٠ يوم (نهايات الأسبوع أعلى)
    for (let d = 29; d >= 0; d--) {
      const dow = (new Date(now - d * DAY)).getDay(); // 0 أحد .. 6 سبت
      const weekendBoost = (dow === 4 || dow === 5) ? 1.35 : (dow === 6 ? 1.15 : 1); // خميس/جمعة ذروة
      const dayCount = Math.round((34 + rnd() * 14) * weekendBoost);
      for (let i = 0; i < dayCount; i++) {
        const rest = pick(rests);
        const cap = pick(caps);
        const area = pick(DESTINATIONS);
        const payment = pick(PAY_KEYS);
        const hour = 11 + Math.floor(rnd() * 12); // 11ص - 10م
        const t = now - d * DAY - (23 - hour) * 3600000 - Math.floor(rnd() * 3600000);
        const subtotal = 25 + Math.round(rnd() * 95);
        const delivery = DELIVERY_DEFAULTS[area] || 10;
        const canceled = rnd() < 0.07;
        const commission = Math.round(subtotal * (rest.commission / 100));
        const deliverMins = 18 + Math.round(rnd() * 34);
        const prepMins = 12 + Math.round(rnd() * 28);
        const rating = canceled ? 0 : (rnd() < 0.7 ? 5 : rnd() < 0.7 ? 4 : 3);
        recs.push({
          t, dayOffset: d, hour, restId: rest.id, restName: rest.name,
          capId: cap.id, capName: cap.name, area, payment,
          status: canceled ? "canceled" : "delivered",
          subtotal, delivery, total: subtotal + delivery, commission,
          deliverMins, prepMins, rating, onTime: !canceled && deliverMins <= 45,
        });
      }
    }
    return recs;
  }
  let REPORT_RECORDS = null;
  function getReportRecords(){ if (!REPORT_RECORDS) REPORT_RECORDS = buildReportRecords(); return REPORT_RECORDS; }

  /* ---------- KPIs النظرة العامة ---------- */
  const KPIS = {
    ordersToday: 183, ordersDelta: 12,
    gmvToday: 9540, gmvDelta: 8,
    commissionToday: 1431, commissionDelta: 9,
    activeNow: 12, // طلبات نشطة الآن
    captainsOnline: 6, captainsTotal: 10,
    restaurantsActive: 6, restaurantsTotal: 10,
    customers: 1240, customersDelta: 4,
    avgDelivery: 34, // دقيقة
    rating: 4.8,
    commissionRange: [5, 20], // نطاق عمولة المطعم %
  };

  /* ---------- التحليلات (المنصّة، آخر ٧ أيام) ---------- */
  const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const ANALYTICS = {
    last7: [
      { day: "الأحد", gmv: 7200, orders: 142 },
      { day: "الإثنين", gmv: 6100, orders: 121 },
      { day: "الثلاثاء", gmv: 7800, orders: 154 },
      { day: "الأربعاء", gmv: 6900, orders: 138 },
      { day: "الخميس", gmv: 9800, orders: 192 },
      { day: "الجمعة", gmv: 11200, orders: 221 },
      { day: "السبت", gmv: 9540, orders: 183 },
    ],
    hourly: [
      { h: "11ص", v: 4 }, { h: "12م", v: 9 }, { h: "1م", v: 14 }, { h: "2م", v: 18 },
      { h: "3م", v: 11 }, { h: "4م", v: 7 }, { h: "5م", v: 9 }, { h: "6م", v: 16 },
      { h: "7م", v: 22 }, { h: "8م", v: 25 }, { h: "9م", v: 17 }, { h: "10م", v: 8 },
    ],
    payment: { bankPalestine: 78, jawwalPay: 64, palPay: 41 },
    topRestaurants: [
      { name: "SANDWICH HUB", orders: 41, gmv: 1890 },
      { name: "BIRDS & BUNS", orders: 38, gmv: 2010 },
      { name: "PIZZA ROOM", orders: 34, gmv: 1560 },
      { name: "بيت الشام", orders: 29, gmv: 1685 },
      { name: "مشاوي الشام", orders: 22, gmv: 1420 },
    ],
    topAreas: [
      { name: "الرمال", orders: 52 }, { name: "النصر", orders: 38 },
      { name: "تل الهوا", orders: 31 }, { name: "الزيتون", orders: 24 },
      { name: "الصبرة", orders: 19 }, { name: "الشيخ رضوان", orders: 11 },
    ],
    deltas: { gmv: 8, orders: 12, aov: -3, delivery: -6 },
  };

  /* ---------- النشاط الحي (live feed) ---------- */
  function seedActivity() {
    return [
      { t: now - 1 * MIN, kind: "order", text: "طلب جديد قيد المعالجة — ريم حدّاد إلى BIRDS & BUNS" },
      { t: now - 2 * MIN, kind: "issue", text: "طلب غير مدفوع #5181 — الزبون لم يرفع وصل التحويل" },
      { t: now - 3 * MIN, kind: "transfer", text: "تحويل بنكي بانتظار التحقق — جاد إبراهيم (96 ₪)" },
      { t: now - 5 * MIN, kind: "order", text: "تم تحويل الطلب #5187 إلى المطعم وتعيين الكابتن كريم مقداد" },
      { t: now - 8 * MIN, kind: "captain", text: "الكابتن محمود أبو ندى انطلق بالطلب #5191" },
      { t: now - 12 * MIN, kind: "delivered", text: "تم تسليم الطلب #5180 في تل الهوا — 31 دقيقة" },
      { t: now - 16 * MIN, kind: "restaurant", text: "مندي الخليج قدّم طلب انضمام للمنصّة" },
      { t: now - 21 * MIN, kind: "captain", text: "الكابتن وائل صيام أصبح متاحاً" },
    ];
  }

  /* ---------- التنقّل (أقسام اللوحة) ---------- */
  const NAV = [
    { k: "overview", label: "النظرة العامة", icon: "grid" },
    { k: "orders", label: "الطلبات", icon: "bag", badge: "live" },
    { k: "captains", label: "الكباتن", icon: "bike" },
    { k: "restaurants", label: "المطاعم", icon: "store" },
    { k: "customers", label: "الزبائن", icon: "users" },
    { k: "promos", label: "البرومو كودز", icon: "ticket" },
    { k: "finance", label: "المالية", icon: "wallet" },
    { k: "reports", label: "التقارير", icon: "chart" },
  ];

  /* ---------- البرومو كودز ---------- */
  // type: percent (خصم %) | fixed (خصم ثابت ₪) | freedelivery (توصيل مجاني)
  // scope: all (كل المطاعم) | restaurant (مطعم محدد) | status: active | scheduled | expired | paused
  function seedPromos() {
    return [
      { id: "pc1", code: "SUNBUL20", type: "percent", value: 20, cap: 15, minOrder: 40, scope: "all", restId: null, used: 142, limit: 500, perUser: 1, start: "2026-06-01", end: "2026-06-30", status: "active", desc: "خصم ٢٠٪ على أول طلب" },
      { id: "pc2", code: "WELCOME10", type: "fixed", value: 10, cap: 0, minOrder: 30, scope: "all", restId: null, used: 388, limit: 1000, perUser: 1, start: "2026-05-15", end: "2026-07-15", status: "active", desc: "خصم ١٠ ₪ للزبائن الجدد" },
      { id: "pc3", code: "FREESHIP", type: "freedelivery", value: 0, cap: 0, minOrder: 50, scope: "all", restId: null, used: 256, limit: 0, perUser: 3, start: "2026-06-01", end: "2026-06-15", status: "active", desc: "توصيل مجاني فوق ٥٠ ₪" },
      { id: "pc4", code: "PIZZA15", type: "percent", value: 15, cap: 20, minOrder: 35, scope: "restaurant", restId: "r1", used: 73, limit: 300, perUser: 2, start: "2026-06-05", end: "2026-06-20", status: "active", desc: "خصم ١٥٪ على PIZZA ROOM" },
      { id: "pc5", code: "EID2026", type: "percent", value: 25, cap: 25, minOrder: 60, scope: "all", restId: null, used: 500, limit: 500, perUser: 1, start: "2026-04-01", end: "2026-04-15", status: "expired", desc: "عرض العيد — انتهى" },
      { id: "pc6", code: "BIRDS30", type: "fixed", value: 30, cap: 0, minOrder: 80, scope: "restaurant", restId: "r3", used: 0, limit: 200, perUser: 1, start: "2026-06-10", end: "2026-06-25", status: "scheduled", desc: "خصم ٣٠ ₪ — يبدأ قريباً" },
    ];
  }

  /* ---------- إعدادات المنصّة الافتراضية ---------- */
  const DEFAULT_SETTINGS = {
    name: "سنبل", city: "غزة", support: "0599-700-100", currency: "₪ شيكل",
    defaultCommission: 15, deliveryFee: 8, minOrder: 20, weekEnd: "الخميس",
    deliveryMode: "flat", deliveryMatrix: {}, deliveryBase: 5, deliveryPerKm: 2,
    defaultIncentive: 1, defaultDailyWage: 70, assignRadius: 5,
    accounts: {
      bankPalestine: { on: true, holder: "شركة سنبل للتوصيل", num: "PAL-5500-882104" },
      jawwalPay: { on: true, holder: "سنبل غزة", num: "0599-700-100" },
      palPay: { on: true, holder: "سنبل غزة", num: "0567-880-100" },
    },
    notif: { newOrder: true, transfer: true, joinReq: true, payout: true },
  };

  window.ADMIN = {
    CURRENCY, AREAS, DAY_NAMES, VEHICLES, PAY_METHODS, DESTINATIONS, DELIVERY_DEFAULTS, ZONE_POS,
    money, moneyK, ago, minsSince, elapsedClock, zoneKm, pointKm, capStatus, capActiveCount,
    orderSLA, fmtAge, SLA_WATCH, SLA_LATE,
    weekEndThursday, prettyDay,
    RESTAURANTS, CAPTAINS, CUSTOMERS,
    seedOrders, seedTransfers, seedActivity, seedPayouts, seedPromos,
    getReportRecords, restMenu, restHours, DEFAULT_HOURS, restStatus, restLoad,
    SETTLEMENTS, MONEY_FLOW, KPIS, ANALYTICS, NAV, DEFAULT_SETTINGS,
    PERMISSIONS, ROLES, rolePerms, seedTeam,
    ratingDist, CAP_REVIEWS, REST_REVIEWS,
  };
})();
