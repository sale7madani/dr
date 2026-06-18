#!/usr/bin/env python3
"""
جلب صور الأصناف بالباركود من Open Food Facts وأرشفتها.

التشغيل:
    python3 fetch_images.py            # كل الأصناف
    python3 fetch_images.py --limit 50 # عيّنة
    python3 fetch_images.py --resume   # يتخطّى ما نُزّل سابقاً (افتراضي)

يتطلّب وصول شبكة (egress) إلى:
    world.openfoodfacts.org, images.openfoodfacts.org, static.openfoodfacts.org

الأرشفة:
    images/<item>/<barcode>.jpg     ← الصور
    results.csv                      ← فهرس: item, desc, barcode, source, status, file
"""
import os, json, csv, time, argparse, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "manifest.json")
IMG_DIR = os.path.join(HERE, "images")
RESULTS = os.path.join(HERE, "results.csv")
UA = "SonbolCatalog/1.0 (image archival; contact: sale7madani@gmail.com)"
FIELDS = "fields=product_name,image_url,image_front_url,brands"
# تُجرّب بالتسلسل: غذائية ← منتجات عامة ← مستحضرات
DATABASES = [
    ("openfoodfacts", "https://world.openfoodfacts.org/api/v2/product/{bc}.json?" + FIELDS),
    ("openproductsfacts", "https://world.openproductsfacts.org/api/v2/product/{bc}.json?" + FIELDS),
    ("openbeautyfacts", "https://world.openbeautyfacts.org/api/v2/product/{bc}.json?" + FIELDS),
]


def get(url, binary=False, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read() if binary else json.loads(r.read())


def lookup(bc):
    """يبحث في قواعد OFF الثلاث ويرجّع (image_url, source, name) أول نتيجة فيها صورة."""
    for src, api in DATABASES:
        try:
            d = get(api.format(bc=bc))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                continue
            raise
        if d.get("status") == 1:
            p = d.get("product", {})
            img = p.get("image_front_url") or p.get("image_url")
            if img:
                return img, src, p.get("product_name")
    return None, None, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--sleep", type=float, default=0.4, help="تأخير بين الطلبات (احترام حدود المعدل)")
    ap.add_argument("--no-resume", action="store_true")
    args = ap.parse_args()

    data = json.load(open(MANIFEST, encoding="utf-8"))
    os.makedirs(IMG_DIR, exist_ok=True)

    done = set()
    if not args.no_resume and os.path.exists(RESULTS):
        for row in csv.DictReader(open(RESULTS, encoding="utf-8")):
            if row["status"] in ("downloaded", "no-image", "not-found"):
                done.add((row["item"], row["barcode"]))

    new = not os.path.exists(RESULTS)
    f = open(RESULTS, "a", newline="", encoding="utf-8")
    w = csv.writer(f)
    if new:
        w.writerow(["item", "desc", "barcode", "source", "image_url", "status", "file"])

    n = found = 0
    for it in data:
        item, desc = it["item"], it["desc"]
        for bc in it["barcodes"]:
            if (item, bc) in done:
                continue
            if args.limit and n >= args.limit:
                f.close(); print(f"\nتوقّف عند الحدّ {args.limit}. تم: {found} صورة."); return
            n += 1
            status = "error"; img_url = ""; path = ""; src = ""
            try:
                img_url, src, pname = lookup(bc)
                if not img_url:
                    status = "no-image"
                else:
                    d = os.path.join(IMG_DIR, item)
                    os.makedirs(d, exist_ok=True)
                    ext = ".jpg"
                    path = os.path.join(d, bc + ext)
                    raw = get(img_url, binary=True)
                    open(path, "wb").write(raw)
                    status = "downloaded"; found += 1
                    path = os.path.relpath(path, HERE)
            except urllib.error.HTTPError as e:
                status = "not-found" if e.code == 404 else f"http-{e.code}"
            except Exception as e:
                status = f"err-{type(e).__name__}"
            w.writerow([item, desc, bc, src, img_url, status, path])
            f.flush()
            if n % 25 == 0:
                print(f"  عولج {n} | نُزّل {found}", flush=True)
            time.sleep(args.sleep)
    f.close()
    print(f"\nانتهى. معالج: {n} | صور منزّلة: {found}")


if __name__ == "__main__":
    main()
