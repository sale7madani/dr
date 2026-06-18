#!/bin/bash
cd "$(dirname "$0")"
echo "============================================"
echo "  تنزيل صور أصناف الكتالوج"
echo "============================================"
if ! command -v python3 >/dev/null 2>&1; then
  echo "[خطأ] بايثون 3 غير مثبّت. ثبّته من https://www.python.org/downloads/"
  read -p "اضغط Enter للخروج"; exit 1
fi
python3 fetch_images.py
echo ""
echo "انتهى. الصور داخل مجلد images"
read -p "اضغط Enter للخروج"
