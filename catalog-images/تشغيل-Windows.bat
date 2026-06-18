@echo off
chcp 65001 >nul
echo ============================================
echo   تنزيل صور أصناف الكتالوج
echo ============================================
echo.
where python >nul 2>nul
if errorlevel 1 (
  echo [خطأ] بايثون غير مثبّت. ثبّته من: https://www.python.org/downloads/
  echo اثناء التثبيت فعّل الخيار: Add Python to PATH
  pause
  exit /b 1
)
python "%~dp0fetch_images.py"
echo.
echo انتهى. الصور موجودة داخل مجلد images
pause
