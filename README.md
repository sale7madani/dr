# سنبل — منصّة توصيل الطعام · Sonbol Food-Delivery Platform

منظومة متكاملة لتوصيل الطعام (عربي، RTL): أربع واجهات (الزبون/المطعم/الكابتن/الإدارة)
**مربوطة بباك-إند حقيقي** — قاعدة بيانات SQL، مصادقة وأدوار، API مؤمّن، وتحديثات حيّة
(SSE). الواجهات React عبر Babel Standalone (بدون خطوة بناء).

A full Arabic (RTL) food-delivery platform: four front-ends (customer, restaurant,
captain, admin) **wired to a real backend** — SQL database, auth + roles, a secured
API, and live updates (SSE). Front-ends are React via Babel Standalone (no build step).

## التشغيل · Running (الوضع الحقيقي · real mode)

يتطلّب **Node ≥ 22** (لأجل `node:sqlite`). أمر واحد يشغّل الباك-إند ويخدم كل الواجهات:

```bash
npm start            # = node backend/server.js  →  http://localhost:4000/
```

افتح الواجهات وسجّل الدخول بالحسابات التجريبية المزروعة:

| الواجهة | الرابط | الدخول (هاتف / كلمة مرور) |
| --- | --- | --- |
| الزبون | `/apps/customer/` | `3333` / `cust1234` (أو سجّل حساباً جديداً) |
| المطعم | `/apps/restaurant/` | `1111` / `rest1234` |
| الكابتن | `/apps/captain/` | `2222` / `cap1234` |
| الإدارة | `/apps/admin/` | `0000` / `admin1234` |

**التدفّق الكامل:** الزبون يطلب → يرنّ في المطعم → قبول/تحضير/جاهز → يصل للكابتن →
حجز/استلام/تسليم → الحالة تتحدّث لحظياً عند الزبون والإدارة. كل خطوة محكومة بالأدوار
والصلاحيات على الخادم، والتسعير يُحسب على الخادم.

> كل واجهة فيها زرّ **«الدخول بوضع العرض»** يشغّلها بدون خادم (نماذج فقط).
> الوضع التجريبي القديم بالكامل (ناقل أحداث في الذاكرة): `npm run demo` على المنفذ 5173.

## الفحوص · Tests

```bash
npm test             # 37 اختبار API (مصادقة/أدوار/تسعير/انتقالات/عزل/SSE)
npm run itest        # اختبار تكامل: رحلة طلب كاملة عبر الأدوار الأربعة + SSE
```

## الباك-إند · Backend

تفاصيل المعمارية والـAPI في **`backend/README.md`**. باختصار: `node:sqlite` (DB حقيقية)،
تشفير `scrypt` + توكنات JWT موقّعة، تسعير موثوق على الخادم، وقواعد انتقال محكومة بالأدوار
مع حارس ترتيب وسجلّ تدقيق. عميل المتصفح المشترك: `shared/api-client.js` (`window.SonbolAPI`).

## الربط الحيّ بين الواجهات · Live integration (the hub)

| الملف · File | الدور · Role |
| --- | --- |
| `server/server.js` | خادم Node بلا تبعيات: يخدم الملفات + ناقل أحداث SSE + حفظ الحالة · zero-dep Node server: static files + SSE event bus + state persistence |
| `shared/hub-client.js` | عميل المتصفح `window.SonbolHub` (connect/publish/on) · browser client |

**دورة حياة الطلب (موحّدة) · unified order lifecycle:**
`unpaid → processing → new → preparing → ready → onway → delivered` (+ `rejected`/`canceled`)

**من يملك كل انتقال · who owns each transition:**
- الزبون · Customer: إنشاء الطلب (`processing`/`unpaid`)
- المطعم · Restaurant: `preparing` · `ready` · `rejected`
- الكابتن · Captain: `onway` (استلمه) · `delivered`
- الإدارة · Admin: تأكيد الدفع · تعيين كابتن · إلغاء — وعرض كل شيء حيّاً

كل تطبيق يحوّل بين «الطلب المشترك» وشكله الداخلي عبر دوال محوّل (adapters) داخل ملفه.
الخادم يحفظ حالة الطلبات في `server/hub-state.json` (مُستثنى من Git) مع **حارس ترتيب**
يمنع رجوع الحالة للخلف.

**حدود حالية · current limitations:** واجهة الزبون لا تعرض حالتي `rejected`/`canceled`
(غير موجودتين في خريطة حالاتها) فتتجاهلهما؛ تبقى مرئية في المطعم والإدارة. الطلب متعدّد
المطاعم يُرسَل كطلب واحد مُجمّع في العرض الحيّ.

## الهيكل · Layout

```
apps/
  captain/      🛵 تطبيق الكابتن (السائق) — موبايل · driver app (mobile)
  customer/     📱 واجهة الزبون — موبايل · customer app (mobile)
  restaurant/   🧾 واجهة المطعم (الكاشير) — سطح مكتب · merchant/cashier (desktop)
  admin/        🛠️ لوحة الإدارة (Super Admin) — سطح مكتب · admin dashboard (desktop)
landing/        🌐 صفحة الهبوط التعريفية · marketing landing page
docs/
  restaurant-handoff/   📄 حزمة تسليم المطعم (نظام التصميم + الشاشات) · restaurant handoff package
  new-screens-guide/    🧭 دليل شاشات الدفع/التتبّع الجديدة · new payment/tracking screens guide
  reference/            🖼️ لقطات ومواد مرجعية من مراحل التصميم · design-iteration reference shots
index.html      لوحة التشغيل الموحّدة · unified launcher
```

كل تطبيق داخل `apps/` مستقل وقابل للتشغيل وحده عبر `apps/<name>/index.html`.
Each app under `apps/` is self-contained and runnable on its own via `apps/<name>/index.html`.

## الواجهات · The apps

| الواجهة | الجهاز | أبرز الوظائف |
| --- | --- | --- |
| **كابتن · Captain** | موبايل | استقبال/قبول الطلب، مراحل التوصيل، الأرباح، السجل، وضع موظّف/مستقل |
| **الزبون · Customer** | موبايل | تصفّح المطاعم، السلّة والإضافات، الدفع (تحويل بنكي + رفع وصل)، تتبّع الطلب والكابتن، التقييم |
| **المطعم · Restaurant** | سطح مكتب | شاشة كاشير: استقبال الطلبات وتحضيرها وتسليمها للكابتن، إدارة المنيو، إحصاءات |
| **الإدارة · Admin** | سطح مكتب | نظرة عامة، كل الطلبات، العمليات، الأعمال، محرّر المطاعم، التقارير، العروض، الإعدادات |

## نظام التصميم (مشترك) · Design system (shared)

- **اللون الأساسي (البراند):** ذهبي `#ffb81c` (سنبلة القمح) — يُرجى تأكيد الدرجة الرسمية مع العميل.
- **الخط:** `Tajawal` (والزبون يستخدم أيضًا Cairo/Almarai/IBM Plex/Rubik كخيارات).
- **العملة:** `₪` شيكل — معرّفة من مكان واحد في بيانات كل تطبيق.
- **الاتجاه:** `dir="rtl"` عربي بالكامل.

تفاصيل الـ tokens الكاملة (ألوان، ظلال، زوايا، مسافات) في
`docs/restaurant-handoff/README.md`.

## ملاحظات · Notes

- **هذه نماذج تصميمية مرجعية** (حسب حزمة التسليم) — مقصودة لإعادة بنائها في بيئة إنتاج
  حقيقية لاحقًا، وليست كوداً جاهزاً للإنتاج المباشر. *These are design-reference
  prototypes intended to be rebuilt in a real production stack later.*
- الحالة تُحفظ محليًا عبر `localStorage` في كل تطبيق (حساب، سلّة، وردية…).
- **فيديو عرض** (`IMG_7857.MP4`, ~16MB) كان ضمن المواد لكنه مستثنى من Git لكبر حجمه
  (انظر `.gitignore`). احتفظ به خارجيًا أو استخدم git-lfs إن لزم. *A ~16MB demo video
  was excluded from git due to size.*
