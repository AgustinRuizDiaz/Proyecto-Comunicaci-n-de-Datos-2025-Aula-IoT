#Requires -Version 5.1

<#
.SYNOPSIS
    Script de configuración para el Sistema Gestor de Aulas IoT

.DESCRIPTION
    Este script configura automáticamente MongoDB, Redis, variables de entorno
    y dependencias para el proyecto Gestor de Aulas IoT.

.NOTES
    Ejecutar como Administrador: PowerShell -ExecutionPolicy Bypass -File setup.ps1
#>

param(
    [switch]$SkipMongoDB,
    [switch]$SkipRedis,
    [switch]$SkipDependencies
)

Write-Host "=== Configuración del Sistema Gestor de Aulas IoT ===" -ForegroundColor Green
Write-Host "Ejecutando como: $(whoami)" -ForegroundColor Cyan

# Verificar permisos de administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  ADVERTENCIA: Este script debe ejecutarse como Administrador" -ForegroundColor Yellow
    Write-Host "Ejecuta: PowerShell -ExecutionPolicy Bypass -File setup.ps1" -ForegroundColor Yellow
    exit 1
}

# 1. Verificar si MongoDB está instalado
if (-not $SkipMongoDB) {
    Write-Host "`n1. Verificando MongoDB..." -ForegroundColor Yellow

    try {
        $mongoVersion = & mongod --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ MongoDB ya está instalado" -ForegroundColor Green
            Write-Host $mongoVersion[0]
        } else {
            throw "MongoDB no encontrado"
        }
    } catch {
        Write-Host "✗ MongoDB no está instalado" -ForegroundColor Red
        Write-Host "Descargando MongoDB Community Edition..." -ForegroundColor Yellow

        # Descargar MongoDB
        $mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi"
        $outputPath = "$env:TEMP\mongodb.msi"

        try {
            Write-Host "Descargando desde: $mongoUrl" -ForegroundColor Gray
            Invoke-WebRequest -Uri $mongoUrl -OutFile $outputPath -UseBasicParsing

            Write-Host "✓ MongoDB descargado correctamente" -ForegroundColor Green

            Write-Host "Instalando MongoDB..." -ForegroundColor Yellow
            $installArgs = "/i", $outputPath, "/quiet", "/norestart"
            Start-Process msiexec -ArgumentList $installArgs -Wait

            Write-Host "✓ MongoDB instalado correctamente" -ForegroundColor Green
        } catch {
            Write-Host "✗ Error al descargar/instalar MongoDB: $_" -ForegroundColor Red
            Write-Host "Por favor, descarga e instala manualmente desde:" -ForegroundColor Yellow
            Write-Host "https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
        }
    }
}

# 2. Verificar si Redis está instalado
if (-not $SkipRedis) {
    Write-Host "`n2. Verificando Redis..." -ForegroundColor Yellow

    try {
        $redisVersion = & redis-cli --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Redis ya está instalado" -ForegroundColor Green
            Write-Host $redisVersion
        } else {
            throw "Redis no encontrado"
        }
    } catch {
        Write-Host "✗ Redis no está instalado" -ForegroundColor Red
        Write-Host "Descargando Redis..." -ForegroundColor Yellow

        # Descargar Redis
        $redisUrl = "https://github.com/microsoftarchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.zip"
        $outputPath = "$env:TEMP\redis.zip"

        try {
            Write-Host "Descargando desde: $redisUrl" -ForegroundColor Gray
            Invoke-WebRequest -Uri $redisUrl -OutFile $outputPath -UseBasicParsing
            Expand-Archive -Path $outputPath -DestinationPath "C:\Redis" -Force

            Write-Host "✓ Redis descargado y extraído correctamente" -ForegroundColor Green
        } catch {
            Write-Host "✗ Error al descargar Redis: $_" -ForegroundColor Red
            Write-Host "Por favor, descarga manualmente desde:" -ForegroundColor Yellow
            Write-Host "https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
        }
    }
}

# 3. Configurar variables de entorno del backend
Write-Host "`n3. Configurando variables de entorno..." -ForegroundColor Yellow

$envFile = "backend\.env"
if (Test-Path $envFile) {
    Write-Host "✓ Archivo .env ya existe" -ForegroundColor Green
} else {
    Copy-Item "backend\.env.example" -Destination $envFile
    Write-Host "✓ Archivo .env creado desde .env.example" -ForegroundColor Green
}

# Generar clave secreta para Django
$secretKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 50 | ForEach-Object {[char]$_})
$envContent = Get-Content $envFile -Raw
$envContent = $envContent -replace "your-secret-key-here", $secretKey
Set-Content -Path $envFile -Value $envContent

Write-Host "✓ Clave secreta generada y configurada" -ForegroundColor Green

# 4. Configurar MongoDB
Write-Host "`n4. Configurando MongoDB..." -ForegroundColor Yellow

# Crear directorio de datos
$dataPath = "C:\data\db"
if (!(Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force
    Write-Host "✓ Directorio de datos MongoDB creado" -ForegroundColor Green
}

# Crear directorio de logs
$logPath = "C:\data\log"
if (!(Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force
    Write-Host "✓ Directorio de logs MongoDB creado" -ForegroundColor Green
}

# 5. Instalar dependencias
if (-not $SkipDependencies) {
    Write-Host "`n5. Instalando dependencias..." -ForegroundColor Yellow

    # Backend
    Write-Host "Instalando dependencias Python..." -ForegroundColor Cyan
    try {
        Set-Location backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        Set-Location ..
        Write-Host "✓ Dependencias Python instaladas" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error al instalar dependencias Python: $_" -ForegroundColor Red
    }

    # Frontend
    Write-Host "Instalando dependencias Node.js..." -ForegroundColor Cyan
    try {
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Host "✓ Dependencias Node.js instaladas" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error al instalar dependencias Node.js: $_" -ForegroundColor Red
    }
}

# 6. Mostrar información final
Write-Host "`n=== Configuración Completada ===" -ForegroundColor Green
Write-Host "MongoDB ejecutándose en: localhost:27017" -ForegroundColor Cyan
Write-Host "Redis ejecutándose en: localhost:6379" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan

Write-Host "`nPara ejecutar el proyecto:" -ForegroundColor Yellow
Write-Host "1. Backend: cd backend && python manage.py runserver" -ForegroundColor White
Write-Host "2. Frontend: cd frontend && npm run dev" -ForegroundColor White

Write-Host "`nScripts de inicio rápido disponibles:" -ForegroundColor Yellow
Write-Host "- Windows: .\start.bat" -ForegroundColor White
Write-Host "- Linux/Mac: ./start.sh" -ForegroundColor White

Write-Host "`n=== ¡Sistema listo para usar! ===" -ForegroundColor Green
