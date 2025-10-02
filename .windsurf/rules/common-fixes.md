---
trigger: always_on
---

```markdown
# Soluciones a Problemas Comunes

## Django Issues

### "No such table" error
```bash
python manage.py makemigrations
python manage.py migrate
CORS errors
python# settings.py
INSTALLED_APPS = [
    'corsheaders',  # Debe estar antes de CommonMiddleware
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]
WebSocket connection failed
python# settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'  # Para desarrollo
    }
}
React Issues
Estado no actualiza
typescript// MAL
const handleUpdate = () => {
  items.push(newItem);  // Mutación directa
  setItems(items);
}

// BIEN
const handleUpdate = () => {
  setItems([...items, newItem]);  // Nuevo array
}
useEffect loop infinito
typescript// MAL
useEffect(() => {
  fetchData();
}, [data]);  // data cambia en fetchData

// BIEN
useEffect(() => {
  fetchData();
}, []);  // Solo al montar
Memory leaks en WebSocket
typescriptuseEffect(() => {
  const ws = new WebSocket(url);
  
  return () => {
    ws.close();  // Cleanup obligatorio
  };
}, []);
SQLite Issues
Database is locked
python# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        'OPTIONS': {
            'timeout': 20,  # Aumentar timeout
        }
    }
}
Migraciones rotas
bash# Reset completo (SOLO desarrollo)
rm db.sqlite3
rm -rf */migrations/
python manage.py makemigrations
python manage.py migrate