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

# 5. Aplicar migraciones
python manage.py migrate

python manage.py makemigrations

# 6. Ejecutar servidor
python manage.py runserver 0.0.0.0:8000
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

- **Crear superusuario:** `python manage.py createsuperuser`
- **Ver logs del backend:** `python manage.py runserver`
- **Build frontend producción:** `npm run build`
- **Detener servidores:** `Ctrl+C` en cada terminal

## 🔗 URLs Disponibles

**Backend Django:**
- **Página principal:** http://localhost:8000/
- **Estado de la API:** http://localhost:8000/api/status/
- **Panel de administración:** http://localhost:8000/admin/
- **APIs REST:** http://localhost:8000/api/*

**Frontend React:**
- **Aplicación completa:** http://localhost:5173
- **Página de login:** http://localhost:5173/login

## 🔐 Usuario de Prueba (YA CREADO)

**✅ Usuario administrador creado automáticamente:**
- **Legajo:** `12345`
- **Contraseña:** `test123`
- **Email:** `admin@university.edu`
- **Rol:** `Admin`
- **Estado:** Activo y listo para usar

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
    legajo='12345',
    password='test123',
    email='admin@university.edu',
    first_name='Admin',
    last_name='University',
    rol='Admin'
)
print(f'Usuario creado: {user.legajo}')
"
```

## 🚨 Solución de Problemas Rápida

**Error de Material-UI:**
```bash
# Desde el directorio raíz del proyecto:
cd frontend
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm run dev
```

**Error de entorno virtual:**
```bash
# Windows PowerShell:
.\venv\Scripts\activate

# Windows CMD:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate
```

**Error de accesores inversos:**
```python
# Ya solucionado en el código - no requiere acción
```

---

## 🎉 **¡PROYECTO LISTO PARA USAR!**

**✅ Todo configurado y funcionando:**
- Backend Django ejecutándose en puerto 8000
- Frontend React con Material-UI en puerto 5173
- Sistema de autenticación completo
- Datos de prueba incluidos

**🚀 ¡Ya puedes desarrollar!**
