# أرشفة صور أصناف الكتالوج

جلب صور الأصناف بالباركود من قواعد Open Food Facts (وشقيقتيها) وأرشفتها محلياً.

## الملفات
- `manifest.json` — البيانات النظيفة المستخرجة من ملف `.XLS`:
  5,753 صنف، كل صنف له `item` (رقم الصنف) و`desc` (الوصف) وقائمة `barcodes`.
- `fetch_images.py` — سكربت الجلب والتنزيل والأرشفة.
- `results.csv` — فهرس النتائج (يُولَّد عند التشغيل):
  `item, desc, barcode, source, image_url, status, file`.
- `images/<رقم الصنف>/<الباركود>.jpg` — الصور المنزّلة (**لا تُرفع للريبو** — مُستثناة في `.gitignore`).

## المتطلّبات
وصول شبكة (network egress allowlist) إلى مضيفات Open Food Facts:
- `world.openfoodfacts.org`, `world.openproductsfacts.org`, `world.openbeautyfacts.org` (الـAPI)
- `images.openfoodfacts.org`, `static.openfoodfacts.org` (صور المنتجات)

## التشغيل
```bash
cd catalog-images
python3 fetch_images.py --limit 50   # عيّنة أولاً للتحقّق
python3 fetch_images.py              # كل الأصناف (يستأنف تلقائياً)
```

## ملاحظات التغطية
الباركودات بمعظمها إقليمية (مصر 622، تركيا 868/869، إسرائيل 729، الأردن 625،
السعودية 628)، وفيها ~408 باركود داخلي (200-299) لن يوجد في أي قاعدة عامة.
لذلك التغطية المتوقّعة جزئية؛ الأصناف غير المغطّاة تُسجَّل بحالة `no-image`/`not-found`
في `results.csv` لمعالجتها لاحقاً بمصدر آخر.
