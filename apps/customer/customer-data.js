/* ============================================================
   سُنبل — واجهة الزبون (غزة) | بيانات السوق + الدفع + حالات الطلب
   ============================================================ */
(function () {
  "use strict";

  const CURRENCY = "₪";
  const EXTRA_REST_FEE = 5; // رسوم توصيل لكل مطعم إضافي

  /* ---------- بيانات الدفع ---------- */
  const PAYMENT = {
    bank: {
      id: "bank", name: "تحويل بنكي", bankName: "بنك فلسطين",
      fields: [
        { k: "رقم الحساب", v: "412-300-1985", ltr: true },
        { k: "رقم الجوال", v: "0597 796 100", ltr: true },
        { k: "رقم الآيبان (IBAN)", v: "PS92 PALS 0000 0000 4123 0019 85", ltr: true, small: true },
      ],
      holder: "شركة سُنبل للتوصيل",
    },
    wallets: [
      { id: "jawwalpay", name: "جوال باي", sub: "تحويل عبر رقم الجوال",
        fields: [{ k: "رقم الجوال", v: "0597 796 100", ltr: true }], holder: "سُنبل" },
      { id: "palpay", name: "بال باي", sub: "تحويل عبر رقم الجوال",
        fields: [{ k: "رقم الجوال", v: "0599 123 456", ltr: true }], holder: "سُنبل" },
    ],
    note: "حوّل قيمة الطلب على إحدى الطرق أعلاه، ثم ارفع صورة وصل التحويل. تُراجَع التحويلات من قبل الإدارة قبل تحويل الطلب للمطعم.",
  };

  /* ---------- مناطق غزة ---------- */
  const AREAS = ["النصر", "تل الهوا", "الرمال", "الشيخ رضوان", "الزيتون", "الصبرة", "الدرج", "التفاح", "الشجاعية"];

  /* ---------- المطاعم — لكل مطعم لونه ---------- */
  const RESTAURANTS = [
    {
      id: "pizza", name: "PIZZA ROOM", nameAr: "بيتزا روم", tagline: "بيتزا وباستا وكاليزوني",
      color: "#1f9d55", colorDeep: "#157a41", colorSoft: "#e4f6ec", colorTint: "#f1fbf5",
      cover: "#b5261f", coverInk: "#fff",
      rating: 5.0, etaMin: 30, etaMax: 45, fee: 8, minOrder: 25, hours: "11:00 - 23:59", open: true,
      menu: [
        { cat: "كاليزوني", key: "calz", items: [
          { id: "p1", name: "كاليزوني كلاسيك", price: 38, desc: "صدر دجاج، صوص مارينارا، بصل، مشروم، فلفل حلو، زيتون، جبنة – يقدم مع البطاطا والصوص", mods: ["psize", "extras", "remove"] },
          { id: "p2", name: "كاليزوني مكسيكان", price: 45, desc: "صدر دجاج، ذرة، بصل، فلفل حلو مشوي، فلفل هالبينو، صوص مكسيكي، جبنة – يقدم مع البطاطا", mods: ["psize", "extras", "remove"] },
        ]},
        { cat: "بيتزا", key: "pizza", items: [
          { id: "p3", name: "بيتزا مارجريتا - صغير", price: 18, desc: "صوص البيتزا، جبنة موزاريلا.", mods: ["extras"] },
          { id: "p4", name: "بيتزا مارجريتا - وسط", price: 32, desc: "صوص البيتزا، جبنة موزاريلا.", mods: ["extras"] },
          { id: "p5", name: "بيتزا خضار - صغير", price: 18, desc: "مشروم، فلفل حلو، بصل، زيتون، صوص البيتزا، جبنة.", mods: ["extras", "remove"] },
          { id: "p6", name: "بيتزا خضار - وسط", price: 28, desc: "مشروم، فلفل حلو، بصل، زيتون، صوص البيتزا، جبنة.", mods: ["extras", "remove"] },
          { id: "p7", name: "بيتزا سلامي - وسط", price: 36, desc: "سلامي، صوص البيتزا، جبنة موزاريلا.", mods: ["extras", "remove"] },
          { id: "p8", name: "بيتزا دجاج رانش - وسط", price: 40, desc: "دجاج مشوي، صوص رانش، ذرة، جبنة.", mods: ["extras", "remove"] },
        ]},
        { cat: "الباستا", key: "pasta", items: [
          { id: "p9", name: "باستا ألفريدو دجاج", price: 35, desc: "باستا بصوص الألفريدو الكريمي مع دجاج مشوي.", mods: ["extras"] },
          { id: "p10", name: "باستا نابوليتانا", price: 30, desc: "باستا بصوص الطماطم والريحان.", soldout: true, mods: [] },
        ]},
        { cat: "أصناف جانبية", key: "sides", items: [
          { id: "p11", name: "خبز بالثوم والجبنة", price: 14, desc: "خبز إيطالي بالثوم مغطى بالجبنة.", mods: [] },
          { id: "p12", name: "بطاطا ودجز", price: 12, desc: "بطاطا مقرمشة بالتوابل.", mods: ["extras"] },
        ]},
      ],
    },
    {
      id: "birds", name: "BIRDS & BUNS", nameAr: "بيردز آند بنز", tagline: "برجر ودجاج مقرمش",
      color: "#d6342c", colorDeep: "#ab241d", colorSoft: "#fbe5e3", colorTint: "#fef3f2",
      cover: "#c0282a", coverInk: "#fff",
      rating: 5.0, etaMin: 25, etaMax: 40, fee: 8, minOrder: 20, hours: "12:00 - 23:59", open: true,
      menu: [
        { cat: "الأكثر طلباً", key: "top", items: [
          { id: "b1", name: "فرنشي ستربس 5 قطع", price: 40, desc: "ستربس دجاج مقرمش مع صوص خاص وبطاطا.", mods: ["bsauce", "extras"] },
          { id: "b2", name: "بطاطا فرنش فرايز", price: 10, desc: "بطاطا ذهبية مقرمشة.", mods: ["extras"] },
        ]},
        { cat: "برجر", key: "burger", items: [
          { id: "b3", name: "تشيكن برجر كلاسيك", price: 28, desc: "صدر دجاج مقرمش، خس، طماطم، صوص خاص.", mods: ["bsauce", "extras", "remove"] },
          { id: "b4", name: "زنجر برجر حار", price: 30, desc: "دجاج حار مقرمش مع مايونيز وخس.", mods: ["bsauce", "extras", "remove"] },
          { id: "b5", name: "دبل بيف برجر", price: 42, desc: "قطعتا لحم بقري، جبنة شيدر، مخلل، صوص.", mods: ["extras", "remove"] },
        ]},
        { cat: "وجبات", key: "meals", items: [
          { id: "b6", name: "وجبة تشيكن برجر", price: 40, desc: "برجر + بطاطا + مشروب.", mods: ["bsauce", "extras"] },
          { id: "b7", name: "وجبة ستربس 8 قطع", price: 55, desc: "8 قطع ستربس + بطاطا + صوصات + مشروب.", mods: ["bsauce"] },
          { id: "b8", name: "بوكس عائلي", price: 95, desc: "16 قطعة دجاج + بطاطا كبير + 4 خبزات + صوصات.", soldout: true, mods: [] },
        ]},
        { cat: "مشروبات", key: "drinks", items: [
          { id: "b9", name: "كولا", price: 6, desc: "عبوة 330 مل.", mods: [] },
          { id: "b10", name: "عصير برتقال طازج", price: 10, desc: "كوب عصير طبيعي.", mods: [] },
        ]},
      ],
    },
    {
      id: "mazaj", name: "MAZAJ EXPRESS", nameAr: "مزاج إكسبرس", tagline: "مشروبات وحلى وكريب",
      color: "#7d3cc0", colorDeep: "#622f97", colorSoft: "#f0e7fb", colorTint: "#f8f3fd",
      cover: "#e9e0f6", coverInk: "#5a2a8c",
      rating: 5.0, etaMin: 20, etaMax: 35, fee: 8, minOrder: 15, hours: "10:00 - 23:59", open: true,
      menu: [
        { cat: "المشروبات الباردة", key: "cold", items: [
          { id: "m1", name: "آيس موكا", price: 20, desc: "إسبريسو، حليب، شوكولاتة، ثلج.", mods: ["msize", "mextra"] },
          { id: "m2", name: "آيس كراميل", price: 20, desc: "إسبريسو، حليب، كراميل، ثلج.", mods: ["msize", "mextra"] },
          { id: "m3", name: "آيس كوفي", price: 20, desc: "قهوة مثلجة مع حليب.", mods: ["msize", "mextra"] },
          { id: "m4", name: "آيس سبانش لاتيه", price: 22, desc: "إسبريسو، حليب مكثف محلى، ثلج.", mods: ["msize", "mextra"] },
          { id: "m5", name: "سموذي فراولة", price: 24, desc: "فراولة طازجة مخفوقة.", mods: ["msize"] },
        ]},
        { cat: "المشروبات الساخنة", key: "hot", items: [
          { id: "m6", name: "كابتشينو", price: 16, desc: "إسبريسو مع رغوة الحليب.", mods: ["msize", "mextra"] },
          { id: "m7", name: "لاتيه", price: 16, desc: "إسبريسو مع حليب مبخّر.", mods: ["msize", "mextra"] },
          { id: "m8", name: "هوت شوكليت", price: 18, desc: "شوكولاتة ساخنة كريمية.", mods: ["msize"] },
        ]},
        { cat: "كريب وحلى", key: "sweet", items: [
          { id: "m9", name: "كريب نوتيلا", price: 25, desc: "كريب محشو نوتيلا مع موز.", mods: ["mextra"] },
          { id: "m10", name: "كريب لوتس", price: 28, desc: "كريب بكريمة اللوتس وبسكويت.", mods: ["mextra"] },
          { id: "m11", name: "وافل بلجيكي", price: 26, desc: "وافل مع شوكولاتة وآيس كريم.", soldout: true, mods: [] },
        ]},
        { cat: "قهوة", key: "coffee", items: [
          { id: "m12", name: "إسبريسو", price: 10, desc: "شوت إسبريسو مركّز.", mods: [] },
          { id: "m13", name: "قهوة عربية", price: 8, desc: "قهوة عربية بالهيل.", mods: [] },
        ]},
      ],
    },
    {
      id: "sandwich", name: "SANDWICH HUB", nameAr: "ساندويتش هَب", tagline: "ساندويتشات ووجبات دجاج",
      color: "#0f9d8e", colorDeep: "#0b7d72", colorSoft: "#e0f5f2", colorTint: "#f0fbf9",
      cover: "#f6c324", coverInk: "#1a1a1a",
      rating: 5.0, etaMin: 25, etaMax: 40, fee: 8, minOrder: 18, hours: "11:00 - 23:59", open: true,
      menu: [
        { cat: "الأكثر طلباً", key: "top", items: [
          { id: "h1", name: "ساندويتش شاورما دجاج", price: 16, desc: "دجاج متبّل، ثومية، مخلل، بطاطا.", mods: ["hsize", "extras", "remove"] },
          { id: "h2", name: "ساندويتش كرسبي", price: 18, desc: "دجاج مقرمش، خس، مايونيز، صوص.", mods: ["extras", "remove"] },
        ]},
        { cat: "ساندويتشات", key: "subs", items: [
          { id: "h3", name: "فيلي ستيك", price: 24, desc: "شرائح لحم، جبنة، فطر، فلفل.", mods: ["extras", "remove"] },
          { id: "h4", name: "ساندويتش فاهيتا", price: 22, desc: "دجاج فاهيتا، فلفل ملون، صوص.", mods: ["extras", "remove"] },
        ]},
        { cat: "وجبات دجاج", key: "meals", items: [
          { id: "h5", name: "ربع دجاج مشوي", price: 26, desc: "ربع دجاج مع بطاطا وسلطة وخبز.", mods: ["extras"] },
          { id: "h6", name: "نص دجاج مشوي", price: 45, desc: "نص دجاجة مع بطاطا وسلطة وثومية.", mods: ["extras"] },
        ]},
        { cat: "مقبلات", key: "sides", items: [
          { id: "h7", name: "بطاطا مقلية", price: 10, desc: "بطاطا ذهبية مقرمشة.", mods: ["extras"] },
          { id: "h8", name: "سلطة كول سلو", price: 8, desc: "ملفوف وجزر بصوص كريمي.", mods: [] },
        ]},
      ],
    },
  ];

  /* ---------- مجموعات التعديلات ---------- */
  const MOD_GROUPS = {
    psize: { id: "psize", label: "الحجم", type: "single", required: true, options: [
      { id: "reg", name: "عادي", price: 0, def: true }, { id: "lg", name: "كبير", price: 10 } ] },
    msize: { id: "msize", label: "الحجم", type: "single", required: true, options: [
      { id: "md", name: "وسط", price: 0, def: true }, { id: "lg", name: "كبير", price: 5 } ] },
    hsize: { id: "hsize", label: "الحجم", type: "single", required: true, options: [
      { id: "reg", name: "عادي", price: 0, def: true }, { id: "sup", name: "سوبر", price: 6 } ] },
    extras: { id: "extras", label: "إضافات", type: "multi", required: false, options: [
      { id: "cheese", name: "جبنة زيادة", price: 5 }, { id: "fries", name: "بطاطا جانبية", price: 8 },
      { id: "spicy", name: "حار إضافي", price: 0 }, { id: "sauce", name: "صوص إضافي", price: 2 } ] },
    mextra: { id: "mextra", label: "إضافات", type: "multi", required: false, options: [
      { id: "shot", name: "شوت إسبريسو", price: 4 }, { id: "cream", name: "كريمة", price: 3 },
      { id: "vanilla", name: "نكهة فانيلا", price: 2 } ] },
    bsauce: { id: "bsauce", label: "الصوصات", type: "multi", required: false, options: [
      { id: "ranch", name: "رانش", price: 2 }, { id: "bbq", name: "باربكيو", price: 2 },
      { id: "garlic", name: "ثومية", price: 2 }, { id: "buffalo", name: "بفلو حار", price: 2 } ] },
    remove: { id: "remove", label: "بدون", type: "multi", required: false, options: [
      { id: "onion", name: "بصل", price: 0 }, { id: "pickle", name: "مخلل", price: 0 },
      { id: "olive", name: "زيتون", price: 0 }, { id: "tomato", name: "طماطم", price: 0 } ] },
  };

  /* ---------- المستخدم والعناوين ---------- */
  const USER = { name: "محمود الدوس", phone: "0597796100" };
  const ADDRESSES = [
    { id: "ad1", name: "عنوان من المطعم", area: "تل الهوا", street: "مجلس الوزراء", building: "", floor: "", note: "", def: true },
  ];

  /* ---------- حالات الطلب ---------- */
  // unpaid حالة خاصة (خارج الخط الزمني). الخط الزمني يبدأ من processing بعد الدفع.
  const STATUS = {
    unpaid:     { k: "unpaid",     label: "غير مدفوع",        sub: "بانتظار تأكيد الدفع — سيتواصل معك الدعم", icon: "alert",       tone: "red" },
    processing: { k: "processing", label: "قيد المعالجة",     sub: "طلبك عند إدارة سُنبل",                    icon: "shield",      tone: "gold" },
    new:        { k: "new",        label: "طلب جديد",          sub: "تم تحويل طلبك إلى المطعم",                icon: "receipt",     tone: "blue" },
    preparing:  { k: "preparing",  label: "قيد التحضير",       sub: "المطعم يحضّر طلبك الآن",                  icon: "flame",       tone: "gold" },
    ready:      { k: "ready",      label: "طلب جاهز",          sub: "جاهز بانتظار الكابتن",                    icon: "bag",         tone: "purple" },
    onway:      { k: "onway",      label: "المندوب في الطريق", sub: "الطلب بطريقه إليك",                       icon: "bike",        tone: "gold" },
    delivered:  { k: "delivered",  label: "تم توصيل الطلب",    sub: "صحتين وعافية 🌿",                         icon: "checkCircle", tone: "green" },
  };
  // الخط الزمني المعروض للزبون (بعد الدفع)
  const TIMELINE = ["processing", "new", "preparing", "ready", "onway", "delivered"];

  const CAPTAIN = { name: "أحمد سمور", phone: "0599 870 540", plate: "غزة · 41-237", rating: 4.9 };

  /* ---------- دوال مساعدة ---------- */
  function money(n) { return Math.round(n).toLocaleString("en-US") + " " + CURRENCY; }
  function findRestaurant(id) { return RESTAURANTS.find((r) => r.id === id) || null; }
  function findItem(rid, iid) {
    const r = findRestaurant(rid); if (!r) return null;
    for (const c of r.menu) { const it = c.items.find((i) => i.id === iid); if (it) return it; }
    return null;
  }
  function unitPrice(line) {
    let unit = line.price; const it = findItem(line.restaurantId, line.id);
    if (it && it.mods) it.mods.forEach((gid) => {
      const g = MOD_GROUPS[gid]; if (!g) return;
      const sel = (line.mods && line.mods[gid]) || [];
      g.options.forEach((o) => { if (sel.includes(o.id)) unit += o.price; });
    });
    return unit;
  }
  function linePrice(line) { return unitPrice(line) * line.qty; }
  function modText(line) {
    const it = findItem(line.restaurantId, line.id);
    if (!it || !it.mods || !line.mods) return "";
    const parts = [];
    it.mods.forEach((gid) => {
      const g = MOD_GROUPS[gid]; if (!g) return;
      (line.mods[gid] || []).forEach((oid) => {
        const o = g.options.find((x) => x.id === oid); if (!o) return;
        parts.push(g.id === "remove" ? "بدون " + o.name : o.name);
      });
    });
    return parts.join("، ");
  }
  function addrText(a) {
    if (!a) return "";
    return [a.area, a.street, a.building && ("عمارة " + a.building), a.floor && ("ط" + a.floor)].filter(Boolean).join("، ");
  }

  // رقم طلب ORD-XXXXXX-AAA
  function newOrderNumber() {
    const n = Math.floor(100000 + Math.random() * 899999);
    const L = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    let s = ""; for (let i = 0; i < 3; i++) s += L[Math.floor(Math.random() * L.length)];
    return "ORD-" + n + "-" + s;
  }

  function sampleOrders() {
    const now = Date.now();
    return [
      { id: "s721914", number: "ORD-721914-SHS", restaurants: ["birds"], restaurantNames: ["BIRDS & BUNS"],
        status: "delivered", placedAt: now - 3 * 86400000,
        groups: [{ restaurantId: "birds", items: [
          { id: "b3", name: "تشيكن برجر كلاسيك", qty: 1, unit: 28 },
          { id: "b9", name: "كولا", qty: 2, unit: 6 } ], subtotal: 40 }],
        itemsCount: 2, fee: 8, total: 58, rated: 5, payMethod: "تحويل بنكي" },
    ];
  }

  window.SB = {
    CURRENCY, EXTRA_REST_FEE, PAYMENT, AREAS, RESTAURANTS, MOD_GROUPS, USER, ADDRESSES,
    STATUS, TIMELINE, CAPTAIN,
    money, findRestaurant, findItem, unitPrice, linePrice, modText, addrText, newOrderNumber, sampleOrders,
  };
})();
