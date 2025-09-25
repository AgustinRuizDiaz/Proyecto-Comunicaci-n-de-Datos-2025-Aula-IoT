@echo off
REM Script de inicio simplificado para Windows - Gestor de Aulas IoT
REM Este script inicia solo los servicios básicos con SQLite (sin MongoDB/Redis)

echo === Iniciando Gestor de Aulas IoT (Modo SQLite) ===

echo.
echo === Iniciando Backend (Django) ===
cd backend
echo Activando entorno virtual...
call venv\Scripts\activate.bat
echo Usando configuración SQLite para desarrollo...
set DJANGO_SETTINGS_MODULE=gestor_aulas.settings_simple
echo Iniciando servidor Django...
start /B python manage.py runserver 0.0.0.0:8000
echo ✓ Backend iniciado (SQLite)

echo.
echo === Iniciando Frontend (React) ===
cd ../frontend
echo Iniciando servidor de desarrollo...
start /B npm run dev
echo ✓ Frontend iniciado

echo.
echo === Sistema Iniciado (Modo SQLite) ===
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Base de datos: SQLite (db.sqlite3)
echo.
echo NOTA: Usando SQLite para desarrollo. Para MongoDB completo:
echo PowerShell -ExecutionPolicy Bypass -File setup.ps1
echo.
echo Presiona cualquier tecla para detener todos los servicios...
pause >nul

REM Detener servicios
echo Deteniendo servicios...
taskkill /IM python.exe /F 2>nul
taskkill /IM node.exe /F 2>nul
echo Servicios detenidos.
