# 🚀 Inicio Rápido del Proyecto

## Backend (Django)

```bash
# 1. Crear entorno virtual (solo primera vez)
cd backend
python -m venv venv

# 2. Activar entorno virtual (siempre)
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Actualizar herramientas (si hay errores)
python.exe -m pip install --upgrade setuptools pip wheel

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Aplicar migraciones (IMPORTANTE - ejecutar siempre)
python manage.py migrate

# 6. Crear usuario administrador (solo primera vez)
python manage.py shell -c "
from users.models import User
User.objects.create_superuser(legajo='123456', password='admin123', rol='Admin')
print('Usuario administrador creado: 123456 / admin123')
"

# 7. Ejecutar servidor
python manage.py runserver
```

**URL:** http://localhost:8000

## Frontend (React)

```bash
# 1. Instalar dependencias principales
cd frontend
npm install

# 2. Instalar Material-UI y dependencias (ESENCIAL)
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# 3. Ejecutar servidor de desarrollo
npm run dev
```

**URL:** http://localhost:5173

## ⚡ Comandos Útiles

- **Crear superusuario adicional:** `python manage.py createsuperuser`
- **Ver logs del backend:** `python manage.py runserver`
- **Build frontend producción:** `npm run build`
- **Detener servidores:** `Ctrl+C` en cada terminal
- **Ver estado de migraciones:** `python manage.py showmigrations`

## 🔗 URLs Disponibles

**Backend Django:**
- **Página principal:** http://localhost:8000/
- **Estado de la API:** http://localhost:8000/api/status/
- **Panel de administración:** http://localhost:8000/admin/
- **APIs REST:** http://localhost:8000/api/*
- **Login API:** http://localhost:8000/api/users/login/

**Frontend React:**
- **Aplicación completa:** http://localhost:5173
- **Página de login:** http://localhost:5173/login

## 🔐 Usuario de Prueba (YA CREADO)

**✅ Usuario administrador creado automáticamente:**
- **Legajo:** `123456`
- **Contraseña:** `admin123`
- **Rol:** `Admin`
- **Estado:** Activo y listo para usar

**Para hacer login:**
```json
POST http://localhost:8000/api/users/login/
{
  "legajo": "123456",
  "password": "admin123"
}
```

## 🚨 Verificación y Creación de Usuario

**Verificar usuarios existentes:**
```bash
cd backend
python manage.py shell -c "
from users.models import User
users = User.objects.all()
print(f'Total: {users.count()}')
for u in users:
    print(f'Legajo: {u.legajo}, Rol: {u.rol}, Activo: {u.is_active}')
"
```

**Crear usuario manualmente (si no existe):**
```bash
cd backend
python manage.py shell -c "
from users.models import User
user = User.objects.create_user(
    legajo='123456',
    password='admin123',
    rol='Admin'
)
print(f'Usuario creado: {user.legajo}')
"
```

## 🚨 Solución de Problemas Comunes

**Error de entorno virtual (Windows):**
```bash
# Windows PowerShell:
.\venv\Scripts\activate

# Windows CMD:
venv\Scripts\activate.bat

# Si no funciona, usar ruta completa:
& '.\venv\Scripts\activate'
```

**Error de migraciones:**
```bash
# Eliminar base de datos y recrear desde cero:
rm db.sqlite3  # Linux/Mac
del db.sqlite3  # Windows

# Crear nuevas migraciones:
python manage.py makemigrations

# Aplicar migraciones:
python manage.py migrate
```

**Error de puerto ocupado:**
```bash
# Windows - encontrar proceso usando el puerto:
netstat -ano | findstr :8000
# Luego matar el proceso:
taskkill /PID <PID_NUMBER> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

**Error de Material-UI en frontend:**
```bash
# Desde el directorio raíz del proyecto:
cd frontend
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm run dev
```

**Error de autenticación (credenciales inválidas):**
- Verificar que el usuario existe: usar el comando de verificación arriba
- Crear usuario manualmente si no existe
- Usar exactamente: legajo `123456` y contraseña `admin123`

## 🔧 Configuración Adicional

**Variables de entorno (opcional):**
Crear archivo `.env` en el directorio `backend/`:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

**Para producción:**
```bash
# Frontend
npm run build
npm run preview

# Backend
python manage.py runserver 0.0.0.0:8000
```

---

## 🎉 **¡PROYECTO LISTO PARA USAR!**

**✅ Todo configurado y funcionando:**
- Backend Django ejecutándose en puerto 8000
- Frontend React con Material-UI en puerto 5173
- Sistema de autenticación completo con usuario administrador
- Base de datos con todas las tablas creadas
- Migraciones aplicadas correctamente

**🚀 ¡Ya puedes desarrollar!**

**Pasos rápidos para iniciar:**
1. Backend: `cd backend && .\venv\Scripts\activate && python manage.py runserver`
2. Frontend: `cd frontend && npm run dev`
3. Login con: legajo `123456`, contraseña `admin123`
