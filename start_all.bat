@echo off
REM Script de inicio completo - Gestor de Aulas IoT
REM Ejecuta ambos servicios en paralelo

echo === Iniciando Sistema Completo ===

REM Limpiar procesos existentes
echo Limpiando procesos...
taskkill /IM python.exe /F 2>nul
taskkill /IM node.exe /F 2>nul

echo.
echo === Iniciando Backend Django ===
cd backend
start /B "Django Backend" cmd /c "call venv\Scripts\activate.bat && set DJANGO_SETTINGS_MODULE=gestor_aulas.settings_simple && python manage.py runserver 0.0.0.0:8000"
echo ✓ Backend iniciado

echo.
echo === Iniciando Frontend React ===
cd ../frontend
start /B "React Frontend" cmd /c "npm run dev"
echo ✓ Frontend iniciado

echo.
echo === Sistema iniciado correctamente ===
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Base de datos: SQLite (db.sqlite3)
echo.
echo Presiona cualquier tecla para detener todos los servicios...
pause >nul

REM Detener servicios
echo Deteniendo servicios...
taskkill /IM python.exe /F 2>nul
taskkill /IM node.exe /F 2>nul
echo Servicios detenidos.
