@echo off
rem Uruchom w oknie, które zostanie otwarte po zakończeniu (żeby zobaczyć ewentualne błędy)
if not "%~1"==":keep" (
  cmd /k "%~f0" :keep %*
  exit /b 0
)

setlocal EnableDelayedExpansion
chcp 65001 >nul
echo.
echo === Budowanie aplikacji Notes do wdrożenia ===
echo.

set "SUBFOLDER="
set /p SUBFOLDER="Podaj ścieżkę podfolderu (np. app/notes lub /app/notes): "

if "%SUBFOLDER%"=="" (
  echo Błąd: Nie podano ścieżki.
  pause
  exit /b 1
)

rem Wlacz delayed expansion dopiero po wczytaniu sciezki (unikamy znakow ! w inpucie)
setlocal EnableDelayedExpansion
set "SUBFOLDER=!SUBFOLDER: =!"
set "SUBFOLDER=!SUBFOLDER:\=/!"

rem Jesli nie zaczyna sie od /, dopisz
set "FIRST=!SUBFOLDER:~0,1!"
if not "!FIRST!"=="/" set "SUBFOLDER=/!SUBFOLDER!"

rem Bez koncowego slash do zlozenia base
set "BASE_PATH=!SUBFOLDER!"
if "!BASE_PATH:~-1!"=="/" set "BASE_PATH=!BASE_PATH:~0,-1!"

rem Base dla Vite i API
set "VITE_BASE=!BASE_PATH!/"
set "VITE_API_BASE=!BASE_PATH!/backend/public"
set "VITE_OUT_DIR=../build"
endlocal & set "VITE_BASE=%VITE_BASE%" & set "VITE_API_BASE=%VITE_API_BASE%" & set "VITE_OUT_DIR=%VITE_OUT_DIR%" & set "BASE_PATH=%BASE_PATH%"

echo.
echo Ustawienia:
echo   Frontend (base): %VITE_BASE%
echo   API (backend):   %VITE_API_BASE%
echo   Katalog buildu:  build\
echo.

cd /d "%~dp0"

if not exist "frontend\package.json" (
  echo Błąd: Nie znaleziono frontend\package.json. Uruchom skrypt z katalogu głównego projektu.
  pause
  exit /b 1
)

echo [1/3] Instalacja zależności frontendu - jeśli potrzeba...
cd frontend
if not exist "node_modules" (
  call npm ci
  if errorlevel 1 (
    echo Błąd npm install.
    cd ..
    pause
    exit /b 1
  )
) else (
  echo Pomijam - node_modules istnieje.
)
cd ..

echo
echo [2/3] Budowanie frontendu...
cd frontend
call npm run build
if errorlevel 1 (
  echo Błąd budowania frontendu.
  cd ..
  pause
  exit /b 1
)
cd ..

echo.
echo [3/3] Kopiowanie backendu do build\backend...
if exist "build\backend" rmdir /s /q "build\backend"
echo .db> "%TEMP%\notes_xcopy_exclude.txt"
xcopy /E /I /Y /Q /EXCLUDE:%TEMP%\notes_xcopy_exclude.txt "backend" "build\backend" >nul
del "%TEMP%\notes_xcopy_exclude.txt" 2>nul
if errorlevel 1 (
  echo Błąd kopiowania backendu.
  pause
  exit /b 1
)
if not exist "build\backend\data" mkdir "build\backend\data"

echo.
echo Generowanie .htaccess dla SPA w build\...
(
  echo RewriteEngine On
  echo RewriteBase %BASE_PATH%/
  echo RewriteRule ^index\.html$ - [L]
  echo RewriteCond %%{REQUEST_FILENAME} !-f
  echo RewriteCond %%{REQUEST_FILENAME} !-d
  echo RewriteRule . %BASE_PATH%/index.html [L]
) > "build\.htaccess"

echo.
echo === Gotowe ===
echo.
echo Struktura w folderze build\:
echo   build\
echo   ^|-- index.html, assets\   (frontend)
echo   ^|-- backend\              (Fat Free PHP)
echo   ^|      ^|-- public\       (index.php + .htaccess - tu trafiaja zapytania API)
echo   ^|      ^|-- data\         (baza SQLite)
echo.
echo API celuje w: %VITE_API_BASE%/api/...
echo Wgraj zawartosc folderu build\ na serwer i upewnij sie, ze folder
echo backend\data ma uprawnienia do zapisu.
echo.

pause
endlocal
