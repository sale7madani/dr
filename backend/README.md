# باك-إند سنبل · Sonbol backend (production foundation)

باك-إند حقيقي **بصفر تبعيات خارجية** — يعتمد فقط على وحدات Node المدمجة:
قاعدة بيانات SQL حقيقية (`node:sqlite`)، تشفير كلمات المرور (`scrypt`) وتوكنات
موقّعة (`HMAC`/JWT) عبر `crypto`، وخادم `http`.

A real backend with **zero external dependencies** — built only on Node's
built-ins: a real SQL database (`node:sqlite`), `scrypt` password hashing and
signed `HMAC`/JWT tokens via `crypto`, and the `http` server.

> هذا هو **أساس الإنتاج** الذي يجعل المنصّة تستقبل طلبات فعلاً: تسجيل دخول حقيقي،
> صلاحيات حسب الدور، تسعير موثوق على الخادم، وقواعد عمل مفروضة لا يتحكّم بها العميل.

## التشغيل · Run

```bash
npm run backend        # يشغّل API + يخدم الواجهات على http://localhost:4000
npm test               # يشغّل 35 اختباراً تثبت السلوك (قاعدة بيانات مؤقتة)
```

تتطلّب **Node ≥ 22** (لأجل `node:sqlite`). قاعدة البيانات تُحفظ في `backend/sonbol.db`،
وسرّ التوقيع في `backend/.secret` — كلاهما **مستثنى من Git**.

## حسابات تجريبية (تُزرع تلقائياً) · Seeded accounts

| الدور | الهاتف | كلمة المرور |
| --- | --- | --- |
| admin | `0000` | `admin1234` |
| restaurant | `1111` | `rest1234` |
| captain | `2222` | `cap1234` |
| customer | `3333` | `cust1234` |

## البنية · Structure

| الملف | الدور |
| --- | --- |
| `db.js` | الاتصال بـ SQLite + المخطّط (users, restaurants, menu_items, orders, order_events) |
| `auth.js` | scrypt للكلمات + توقيع/تحقّق JWT + إدارة المستخدمين |
| `catalog.js` | المطاعم والمنيو ومصدر الأسعار الموثوق |
| `orders.js` | إنشاء الطلب (تسعير على الخادم) + قواعد الانتقال والصلاحيات + العزل |
| `server.js` | التوجيه (REST) + SSE مصادق + خدمة الملفات الثابتة |
| `test.js` | حزمة اختبارات الـ API |

## الـ API

كل المسارات تحت `/api`. المصادقة عبر `Authorization: Bearer <token>` (وللـ SSE
عبر `?token=`).

**المصادقة**
- `POST /api/auth/register` — `{name, phone, password, role?}` (العام: customer/captain فقط) → `{token, user}`
- `POST /api/auth/login` — `{phone, password}` → `{token, user}`
- `GET /api/me` — المستخدم الحالي

**الكتالوج**
- `GET /api/catalog/restaurants`
- `GET /api/catalog/restaurants/:id/menu`

**الطلبات**
- `POST /api/orders` — (زبون فقط) `{restaurantId, items:[{itemId, qty}], payMethod:'cash'|'online', address?, area?, note?}` — **الأسعار والإجمالي يحسبها الخادم**
- `GET /api/orders` — قائمة محصورة حسب الدور
- `GET /api/orders/:id`
- `POST /api/orders/:id/transition` — `{action, ...}`

**Realtime**
- `GET /api/stream?token=...` — بثّ أحداث الطلبات المسموح برؤيتها فقط (SSE)

**الإدارة**
- `GET /api/captains` — (admin) لتعيين الكباتن

## دورة حياة الطلب ومن يملك كل انتقال

`unpaid → processing → new → preparing → ready → onway → delivered` (+ `rejected`/`canceled`)

| `action` | الأدوار المسموحة | من → إلى |
| --- | --- | --- |
| `confirm-payment` | admin | unpaid → processing (paid) |
| `accept` | restaurant (صاحب الطلب) | processing/new → preparing |
| `ready` | restaurant | preparing → ready |
| `reject` | restaurant | (قبل التحضير) → rejected (+سبب) |
| `claim` | captain | ready غير مُعيَّن → يحجزه الكابتن |
| `pickup` | captain (المعيَّن) | ready → onway |
| `deliver` | captain (المعيَّن) | onway → delivered (paid) |
| `dispatch` | admin | تعيين كابتن للطلب |
| `cancel` | admin أو الزبون (طلبه) | → canceled |

**حارس الترتيب** يمنع رجوع الحالة للخلف. كل تغيير يُسجَّل في `order_events` (سجلّ تدقيق).

## ما يفرضه الخادم (الأمان الحقيقي)
- كلمات مرور مشفّرة بـ scrypt + ملح لكل مستخدم، ومقارنة بزمن ثابت.
- توكنات موقّعة بسرّ خادم + انتهاء صلاحية.
- التسعير من الكتالوج فقط (محاولات تزوير السعر تُتجاهَل).
- عزل صارم: كل دور يرى ويغيّر ما يخصّه فقط.
- تحقّق من المدخلات + حدّ معدّل على نقاط المصادقة.

## الخطوة التالية
ربط الواجهات (الزبون/المطعم/الكابتن/الإدارة) بهذا الـ API: شاشات دخول حقيقية، استبدال
`SonbolHub` التجريبي بعميل مصادق يستهلك `/api` و`/api/stream`. ثم: بوابة دفع، خرائط/تتبّع
فعلي، إشعارات، ونشر مع HTTPS.
