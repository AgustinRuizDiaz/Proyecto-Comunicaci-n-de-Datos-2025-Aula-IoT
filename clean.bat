@echo off
REM Script de limpieza - Detiene todos los servicios

echo === Limpiando procesos del Gestor de Aulas IoT ===

echo Deteniendo servidores Django...
taskkill /IM python.exe /F 2>nul
echo ✓ Servidores Django detenidos

echo Deteniendo servidores Node.js...
taskkill /IM node.exe /F 2>nul
echo ✓ Servidores Node.js detenidos

echo Deteniendo MongoDB...
taskkill /IM mongod.exe /F 2>nul
echo ✓ MongoDB detenido

echo Deteniendo Redis...
taskkill /IM redis-server.exe /F 2>nul
echo ✓ Redis detenido

echo.
echo === Limpieza completada ===
echo Todos los procesos han sido detenidos.
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
