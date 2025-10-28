# 🚀 Guía Rápida de Deployment

## Opción Recomendada: Railway + Vercel

### ⚡ Quick Start (15 minutos)

#### 1. Deploy Backend en Railway (5 min)

```bash
# Paso 1: Instalar Railway CLI
npm i -g @railway/cli

# Paso 2: Login
railway login

# Paso 3: Desde la carpeta raíz del proyecto
cd backend
railway init
railway up

# Paso 4: Configurar root directory en Railway dashboard
# Settings → Root Directory → "backend"

# Paso 5: Agregar variables de entorno
# Variables → Add Variable:
#   PORT = 3003
#   NODE_ENV = production
```

Tu backend estará en: `https://tu-app.up.railway.app`

---

#### 2. Deploy Frontend en Vercel (5 min)

```bash
# Paso 1: Instalar Vercel CLI
npm i -g vercel

# Paso 2: Desde la carpeta frontend
cd frontend

# Paso 3: Crear .env.production
echo "VITE_API_URL=https://tu-backend.railway.app" > .env.production
echo "VITE_WS_URL=https://tu-backend.railway.app" >> .env.production

# Paso 4: Deploy
vercel login
vercel --prod

# Paso 5: Configurar variables en Vercel dashboard
# Settings → Environment Variables:
#   VITE_API_URL = https://tu-backend.railway.app
#   VITE_WS_URL = https://tu-backend.railway.app
```

Tu frontend estará en: `https://tu-app.vercel.app`

---

#### 3. Actualizar ESP32 (5 min)

Edita `esp32_real.ino`:

```cpp
// Cambiar de:
const char* serverIP = "192.168.0.11";
String backendURL = "http://192.168.0.11:3003";

// A:
const char* serverURL = "tu-backend.railway.app";
String backendURL = "https://tu-backend.railway.app";
```

**Importante:** Para HTTPS en ESP32:
```cpp
#include <WiFiClientSecure.h>

// En sendDataToBackend():
WiFiClientSecure client;
client.setInsecure(); // Para desarrollo (acepta cualquier certificado)
```

---

## 📊 Costos

- **Railway**: Gratis (500 horas/mes)
- **Vercel**: Gratis (ilimitado)
- **Total**: **$0/mes**

---

## ✅ Checklist de Deployment

### Backend
- [ ] Commit y push a GitHub
- [ ] Deploy en Railway
- [ ] Configurar root directory: `backend`
- [ ] Agregar variables de entorno
- [ ] Probar endpoint: `curl https://tu-backend.railway.app/`
- [ ] Verificar WebSocket funciona

### Frontend
- [ ] Crear `.env.production` con URLs del backend
- [ ] Deploy en Vercel
- [ ] Configurar variables de entorno
- [ ] Probar login en la web
- [ ] Verificar conexión WebSocket

### ESP32
- [ ] Actualizar URL del servidor
- [ ] Agregar soporte HTTPS (WiFiClientSecure)
- [ ] Subir código a la placa
- [ ] Verificar conexión en Serial Monitor
- [ ] Probar cambios de sensores

---

## 🆘 Troubleshooting Rápido

### Backend no responde
```bash
# Ver logs en Railway
railway logs

# Verificar health
curl https://tu-backend.railway.app/
```

### WebSocket no funciona
- Verifica que uses `wss://` en vez de `ws://` (HTTPS)
- Railway soporta WebSockets por defecto

### ESP32 no se conecta
- Usa `WiFiClientSecure` para HTTPS
- Verifica que el servidor esté accesible: `ping tu-backend.railway.app`

### CORS errors en frontend
- Actualiza CORS en backend para incluir dominio de Vercel
- Verifica variables de entorno en Vercel

---

## 📞 Soporte

Lee la guía completa en `DEPLOYMENT.md` para más detalles.
