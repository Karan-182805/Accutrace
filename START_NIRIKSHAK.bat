@echo off
title Nirikshak AI server
cd /d "%~dp0backend"

REM Set before Python imports PaddleOCR/PaddleX. This avoids the Paddle 3 PIR
REM initialisation error ("PDX has already been initialized") on CPU systems.
set "FLAGS_enable_pir_api=0"

if not exist "api.py" (
  echo ERROR: api.py was not found next to this file's backend folder.
  echo Extract the whole zip first, then double-click START_NIRIKSHAK.bat again.
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo Creating Python virtual environment...
  py -3 -m venv .venv 2>nul
  if not exist ".venv\Scripts\python.exe" python -m venv .venv
)

if not exist ".venv\Scripts\python.exe" (
  echo ERROR: Python was not found.
  echo Install Python 3.10, 3.11 or 3.12 from python.org and tick "Add python.exe to PATH".
  pause
  exit /b 1
)

if not exist ".venv\installed.ok" (
  echo Installing requirements. The first run can take 5-10 minutes...
  ".venv\Scripts\python.exe" -m pip install --upgrade pip
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 (
    echo.
    echo ERROR: Installing requirements failed. Read the message above.
    pause
    exit /b 1
  )
  echo ok> ".venv\installed.ok"
)

echo.
echo Starting server. Keep this window open while you use the app.
echo The browser will open at http://127.0.0.1:8000
echo.
start "" cmd /c "timeout /t 10 /nobreak >nul & start http://127.0.0.1:8000"
".venv\Scripts\python.exe" -m uvicorn api:app --host 127.0.0.1 --port 8000

echo.
echo The server stopped. If there is an error above, copy it and share it.
pause
