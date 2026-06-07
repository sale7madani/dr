// data.jsx — Sunbul Captain mock data
// Exports to window: CAPTAIN, ORDERS_QUEUE, makeIncomingOrder, HISTORY, EARNINGS, WEEK_BARS

const CAPTAIN = {
  name: 'محمود',
  fullName: 'محمود العلي',
  phone: '0790 000 111',
  vehicle: 'دراجة نارية',
  plate: '٢٢ - ٤٨٩١٩',
  rating: 4.9,
  trips: 1284,
  joined: 'عضو منذ ٢٠٢٤',
  zone: 'إربد - الحي الشرقي',
};

// company dispatch / support line
const SUPPORT = { phone: '0790 555 000', label: 'إدارة سنبل' };

// orders the captain can receive
const ORDER_POOL = [
  {
    id: '8842',
    store: 'مطعم بيت الشام',
    storeArea: 'شارع الجامعة',
    storePhone: '0791 234 567',
    customer: 'سيف',
    customerArea: 'حي الزهور - عمارة ١٢',
    customerPhone: '0788 765 432',
    items: [
      { n: 'شاورما عربي دجاج', q: 3 },
      { n: 'بطاطا مقلية وسط', q: 2 },
      { n: 'كولا ١ لتر', q: 1 },
    ],
    note: 'الجرس معطّل — رنّ على الموبايل عند الوصول',
    total: 12.50,
    fee: 1.80,
    pay: 'مدفوع إلكترونياً',
    distKm: 3.2,
    minutes: 14,
    distToStore: 1.1,
  },
  {
    id: '8851',
    store: 'دجاج المراعي المشوي',
    storeArea: 'دوار الشهداء',
    storePhone: '0790 111 222',
    customer: 'رهف',
    customerArea: 'شارع بغداد - بناية النور',
    customerPhone: '0789 333 221',
    items: [
      { n: 'نصف دجاجة مشوي', q: 2 },
      { n: 'حمص مع صنوبر', q: 1 },
      { n: 'سلطة فتوش', q: 1 },
    ],
    note: '',
    total: 9.75,
    fee: 1.50,
    pay: 'مدفوع إلكترونياً',
    distKm: 2.4,
    minutes: 11,
    distToStore: 0.7,
  },
  {
    id: '8860',
    store: 'بيتزا فورنو',
    storeArea: 'وسط البلد',
    storePhone: '0792 888 444',
    customer: 'عبدالله',
    customerArea: 'حي الأندلس - فيلا ٧',
    customerPhone: '0787 654 998',
    items: [
      { n: 'بيتزا خضار كبير', q: 1 },
      { n: 'بيتزا سجق وسط', q: 1 },
      { n: 'خبز بالثوم', q: 2 },
      { n: 'عصير برتقال', q: 2 },
    ],
    note: 'الطابق الثالث بدون مصعد',
    total: 18.00,
    fee: 2.20,
    pay: 'مدفوع إلكترونياً',
    distKm: 4.6,
    minutes: 19,
    distToStore: 1.6,
  },
];

let _poolIdx = 0;
function makeIncomingOrder() {
  const base = ORDER_POOL[_poolIdx % ORDER_POOL.length];
  _poolIdx++;
  // freelancer competition context
  return {
    ...base,
    rivals: 3 + Math.floor(Math.random() * 5),
  };
}

// today's queue preview (for online idle state count)
const ORDERS_QUEUE = ORDER_POOL;

const HISTORY = [
  { id: '8830', store: 'مطعم بيت الشام', storeArea: 'شارع الجامعة', customer: 'سيف', customerArea: 'حي الزهور - عمارة ١٢', when: 'اليوم ١:٤٠ م', fee: 1.80, dist: 3.2, mins: 14, status: 'تم التسليم', items: [{ n: 'شاورما عربي دجاج', q: 3 }, { n: 'بطاطا مقلية', q: 2 }, { n: 'كولا ١ لتر', q: 1 }] },
  { id: '8824', store: 'دجاج المراعي', storeArea: 'دوار الشهداء', customer: 'منى', customerArea: 'شارع بغداد - بناية النور', when: 'اليوم ١٢:١٥ م', fee: 1.50, dist: 2.1, mins: 11, status: 'تم التسليم', items: [{ n: 'نصف دجاجة مشوي', q: 1 }, { n: 'حمص مع صنوبر', q: 1 }] },
  { id: '8817', store: 'بيتزا فورنو', storeArea: 'وسط البلد', customer: 'خالد', customerArea: 'حي الأندلس - فيلا ٧', when: 'اليوم ١١:٠٢ ص', fee: 2.20, dist: 4.6, mins: 19, status: 'تم التسليم', items: [{ n: 'بيتزا خضار كبير', q: 1 }, { n: 'خبز بالثوم', q: 2 }] },
  { id: '8809', store: 'حلويات الصالحية', storeArea: 'شارع الهاشمي', customer: 'لينا', customerArea: 'حي الروضة', when: 'أمس ٨:٣٠ م', fee: 1.40, dist: 1.9, mins: 9, status: 'تم التسليم', items: [{ n: 'كنافة نابلسية', q: 2 }] },
  { id: '8795', store: 'شاورما الريم', storeArea: 'دوار الداخلية', customer: 'سارة', customerArea: 'حي البارحة', when: 'أمس ٥:٤٥ م', fee: 1.60, dist: 2.5, mins: 12, status: 'تم التسليم', items: [{ n: 'شاورما لحمة', q: 4 }] },
];

// employee-only: orders the captain rejected, with the reason given
const REJECTED = [
  { id: '8839', store: 'مطعم بيت الشام', storeArea: 'شارع الجامعة', customer: 'سيف', customerArea: 'حي الزهور', when: 'اليوم ٢:٢٠ م', reason: 'الموقع بعيد عني', dist: 5.4, cancelled: true },
  { id: '8833', store: 'بيتزا فورنو', storeArea: 'وسط البلد', customer: 'خالد', customerArea: 'حي الأندلس', when: 'اليوم ١٠:٤٥ ص', reason: 'مشغول بطلب آخر', dist: 3.1, cancelled: true },
  { id: '8821', store: 'دجاج المراعي', storeArea: 'دوار الشهداء', customer: 'منى', customerArea: 'شارع بغداد', when: 'أمس ٩:١٠ م', reason: 'وقت انتظار المطعم طويل', dist: 2.8, cancelled: true },
  { id: '8806', store: 'شاورما الريم', storeArea: 'دوار الداخلية', customer: 'رهف', customerArea: 'حي البارحة', when: 'أمس ٤:١٥ م', reason: 'سبب آخر: المركبة بحاجة صيانة', dist: 2.2, cancelled: true },
];

const EARNINGS = {
  today: 18.40,
  todayTrips: 11,
  todayHours: '٦ س ١٠ د',
  week: 112.70,
  walletBalance: 112.70,   // المبلغ المحصّل الكلي (per-trip)
  available: 78.50,        // matured ≥ 1 week — withdrawable now
  maturingDays: 3,         // the rest matures within this many days
};

// employee compensation: fixed daily allowance + weekly withdrawal lock
const EMP_WALLET = {
  dailyRate: 50,            // shekel added every day
  balance: 320.00,         // المبلغ المحصّل الكلي
  available: 220.00,       // matured ≥ 1 week — withdrawable now
  maturingDays: 4,         // the rest matures within this many days
  addedToday: true,        // today's 50 already credited
  todayTrips: 7,
  todayHours: '٦ س ١٠ د',
  weekDays: 7,
};

// bars for the week chart (value in JD)
const WEEK_BARS = [
  { d: 'سبت', v: 14 },
  { d: 'أحد', v: 19 },
  { d: 'إثن', v: 11 },
  { d: 'ثلا', v: 22 },
  { d: 'أرب', v: 16 },
  { d: 'خمس', v: 12 },
  { d: 'اليوم', v: 18.4, now: true },
];

// in-app notifications (bell)
const NOTIFICATIONS = [
  { id: 1, icon: 'wallet', tone: 'gold', title: 'تم تأكيد طلب السحب', body: 'حوّلنا ٥٠ شيكل إلى حسابك.', when: 'قبل ٥ دقائق', unread: true },
  { id: 2, icon: 'flame', tone: 'danger', title: 'طلب الطلب مرتفع الآن', body: 'منطقة وسط البلد — فرصة لطلبات أكثر.', when: 'قبل ٢٠ دقيقة', unread: true },
  { id: 3, icon: 'shield', tone: 'blue', title: 'تحديث من الإدارة', body: 'تم تحديث سياسة إلغاء الطلبات.', when: 'اليوم ١٠:٠٠ ص', unread: false },
  { id: 4, icon: 'trophy', tone: 'gold', title: 'إنجاز جديد! 🎉', body: 'أكملت ١٢٠٠ توصيلة. استمر!', when: 'أمس', unread: false },
];

// motivational achievement badges
const BADGES = [
  { id: 'trips1000', icon: 'trophy', title: '١٢٠٠ توصيلة', sub: 'كابتن مخضرم', earned: true },
  { id: 'rating', icon: 'star', title: 'تقييم ٤.٩', sub: 'خدمة ممتازة', earned: true },
  { id: 'speed', icon: 'flame', title: 'الأسرع', sub: '١٠ قبول سريع', earned: true },
  { id: 'streak', icon: 'check', title: '٧ أيام متتالية', sub: 'بدون إلغاء', earned: true },
  { id: 'trips2000', icon: 'bike', title: '٢٠٠٠ توصيلة', sub: 'باقي ٧١٦', earned: false },
  { id: 'night', icon: 'globe', title: 'فارس الليل', sub: '٥٠ توصيلة ليلية', earned: false },
];

Object.assign(window, {
  CAPTAIN, SUPPORT, ORDERS_QUEUE, makeIncomingOrder, HISTORY, REJECTED, EARNINGS, EMP_WALLET, WEEK_BARS,
  NOTIFICATIONS, BADGES,
});
