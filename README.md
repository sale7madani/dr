# سنبل — منصّة توصيل الطعام · Sonbol Food-Delivery Platform

منظومة متكاملة لتوصيل الطعام (عربي، RTL) مكوّنة من عدّة واجهات. كل الواجهات
نماذج أوّلية عالية الدقّة (Hi-Fi prototypes) مبنية بـ **React عبر Babel Standalone
بدون خطوة بناء** — يكفي تشغيل خادم ملفات ثابت وفتح الصفحة.

A full Arabic (RTL) food-delivery platform made of several front-ends. Every
app is a hi-fi prototype built with **React via Babel Standalone — no build
step**; just serve the folder statically and open it.

## التشغيل · Running

شغّل المنصّة كلها بأمر واحد (يحتاج Node ≥ 16). الخادم يخدم كل الواجهات **ويربطها حيّاً**
عبر ناقل أحداث (SSE)، فالطلب الذي ينشئه الزبون يصل فوراً للمطعم والكابتن والإدارة.

Run the whole platform with one command (needs Node ≥ 16). The server hosts every
app **and wires them together live** via an SSE event bus — an order placed by the
customer instantly reaches the restaurant, captain and admin.

```bash
# من جذر المشروع · from the repo root
npm start            # = node server/server.js
# ثم افتح · then open  http://localhost:5173/   (لوحة التشغيل · launcher)
```

**جرّب التدفّق الكامل · try the full flow:** افتح كل واجهة في تبويب: الزبون والمطعم
والكابتن والإدارة. أنشئ طلباً من الزبون → سيرنّ صوت في المطعم → اقبله وحضّره وعلّمه
«جاهز» → سيصل للكابتن → اقبله وسلّمه → الحالة تتحدّث عند الزبون والإدارة لحظياً.

> لا يعمل عبر `file://` (المتصفح يمنع `.jsx` و`EventSource`). التشغيل عبر خادم Node
> أعلاه هو الطريقة الصحيحة. تشغيل ساكن بسيط (بدون الربط الحيّ) ممكن بـ
> `python3 -m http.server` لكن لن تتواصل الواجهات.

`index.html` في الجذر هو **لوحة تشغيل موحّدة** فيها روابط لكل الواجهات والتوثيق.
The root `index.html` is a **launcher** linking to every app and doc.

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
