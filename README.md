# سنبل كابتن — Sonbul Captain

تطبيق توصيل للكباتن (واجهة عربية RTL) مبني بـ React بدون خطوة بناء — كل ملفات
JSX تُترجم في المتصفح عبر Babel Standalone.

A driver/courier delivery app (Arabic, right-to-left) built with React with **no
build step** — the JSX files are transpiled in the browser using Babel Standalone.

## التشغيل · Running

التطبيق صفحة ثابتة، فقط شغّل خادم ملفات بسيط من جذر المشروع:

The app is fully static. Serve the project root with any static file server:

```bash
python3 -m http.server 8000
# ثم افتح / then open http://localhost:8000/index.html
```

> ملاحظة: لا يعمل بفتح `index.html` مباشرةً عبر `file://` لأن المتصفح يمنع تحميل
> ملفات `.jsx` الخارجية؛ استخدم خادمًا محليًا.
>
> Note: opening `index.html` directly via `file://` will not work because the
> browser blocks loading the external `.jsx` files — use a local server.

## الملفات · Files

| المسار / Path | الوصف / Description |
| --- | --- |
| `index.html` | نقطة الدخول للتطوير، تحمّل ملفات `app/*.jsx` منفصلة · dev entry, loads `app/*.jsx` separately |
| `sonbol-captain.standalone.html` | نسخة مجمّعة في ملف واحد · single-file bundled build |
| `styles.css` | الأنماط العامة · global styles |
| `app/ds.jsx` | نظام التصميم: السمة، الألوان، الأيقونات، المكوّنات · design system: theme, colors, icons, components |
| `app/data.jsx` | بيانات تجريبية (طلبات، أرباح، سجل) · mock data (orders, earnings, history) |
| `app/sound.jsx` | تنبيهات الطلب الصوتية · order alert sounds |
| `app/map.jsx` | عرض الخريطة · map view |
| `app/screens-login.jsx` | شاشة تسجيل الدخول · login screen |
| `app/screens-home.jsx` | الرئيسية والأرباح · home & earnings screens |
| `app/screens-delivery.jsx` | تدفّق التوصيل · delivery flow screens |
| `app/screens-misc.jsx` | السجل، الحساب، شاشات أخرى · history, profile, misc screens |
| `app/app.jsx` | الجذر: آلة الحالة، التنقّل، لوحة التعديلات · root: state machine, nav, tweaks |
| `frames/tweaks-panel.jsx` | لوحة التعديلات الحيّة · live tweaks panel shell |
| `assets/`, `uploads/` | صور وأيقونات · images & icons |

## ملاحظات · Notes

- يعمل بحساب كابتن **موظّف** (راتب يومي ثابت) أو **مستقل** (أجر لكل طلب)؛ يحدّده نوع
  الحساب عند الدخول. Works in **employee** mode (fixed daily rate) or **freelancer**
  mode (per-trip), chosen by account type at login.
- الحالة تُحفظ محليًا عبر `localStorage` (الحساب، الوردية، الصورة). State persists in
  `localStorage` (account, shift, photo).
