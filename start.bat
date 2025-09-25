@echo off
REM Script de inicio para Windows - Gestor de Aulas IoT

echo === Iniciando Gestor de Aulas IoT ===

REM Verificar si MongoDB está ejecutándose
echo Verificando MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ MongoDB ya está ejecutándose
) else (
    echo Iniciando MongoDB...
    start /B mongod --dbpath C:\data\db --logpath C:\data\log\mongod.log
    echo ✓ MongoDB iniciado
)

REM Verificar si Redis está ejecutándose
echo Verificando Redis...
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ Redis ya está ejecutándose
) else (
    echo Iniciando Redis...
    start /B "C:\Redis\redis-server.exe"
    echo ✓ Redis iniciado
)

echo.
echo === Iniciando Backend (Django) ===
cd backend
echo Activando entorno virtual...
call venv\Scripts\activate.bat
echo Iniciando servidor Django...
start /B python manage.py runserver 0.0.0.0:8000
echo ✓ Backend iniciado

echo.
echo === Iniciando Frontend (React) ===
cd ../frontend
echo Iniciando servidor de desarrollo...
start /B npm run dev
echo ✓ Frontend iniciado

echo.
echo === Sistema Iniciado ===
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Documentación API: http://localhost:8000/api/schema/swagger-ui/
echo.
echo Presiona cualquier tecla para detener todos los servicios...
pause >nul

REM Detener servicios
echo Deteniendo servicios...
taskkill /IM mongod.exe /F 2>nul
taskkill /IM redis-server.exe /F 2>nul
taskkill /IM python.exe /F 2>nul
taskkill /IM node.exe /F 2>nul
echo Servicios detenidos.
