// Service Worker personalizado para GestorAulas PWA
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `gestoraulas-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `gestoraulas-dynamic-${CACHE_VERSION}`;
const API_CACHE = `gestoraulas-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `gestoraulas-images-${CACHE_VERSION}`;

// Recursos críticos que siempre deben estar en cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest'  // ← Cambiado de manifest.json a manifest.webmanifest
];

// Recursos que pueden ser cacheados dinámicamente
const CACHEABLE_PATTERNS = [
  /\.(?:js|css|html|json)$/,
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\.(?:woff|woff2|ttf|eot)$/
];

// Estrategia de cache para diferentes tipos de recursos
const CACHE_STRATEGIES = {
  // Recursos críticos: Cache First con fallback a network
  critical: 'cache-first',

  // APIs: Network First con fallback a cache
  api: 'network-first',

  // Imágenes: Cache First con largo tiempo de vida
  images: 'cache-first-long',

  // Fuentes: Stale While Revalidate
  fonts: 'stale-while-revalidate'
};

// Tiempo de vida del cache según el tipo de recurso
const CACHE_EXPIRATION = {
  static: 60 * 60 * 24 * 7, // 7 días
  dynamic: 60 * 60 * 24,    // 1 día
  api: 60 * 60 * 2,         // 2 horas
  images: 60 * 60 * 24 * 30 // 30 días
};

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Recursos estáticos cacheados exitosamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error al cachear recursos estáticos:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activado');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Determinar la estrategia de cache según el tipo de recurso
  let strategy = 'network-first'; // Default

  if (isAPIRequest(request)) {
    strategy = CACHE_STRATEGIES.api;
  } else if (isImageRequest(request)) {
    strategy = CACHE_STRATEGIES.images;
  } else if (isFontRequest(request)) {
    strategy = CACHE_STRATEGIES.fonts;
  } else if (isStaticAsset(request)) {
    strategy = CACHE_STRATEGIES.critical;
  }

  // Aplicar la estrategia seleccionada
  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'cache-first-long':
      event.respondWith(cacheFirstLong(request));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Función auxiliar para determinar si es un request de API
function isAPIRequest(request) {
  return request.url.includes('/api/');
}

// Función auxiliar para determinar si es una imagen
function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname);
}

// Función auxiliar para determinar si es una fuente
function isFontRequest(request) {
  const url = new URL(request.url);
  return /\.(woff|woff2|ttf|eot)$/i.test(url.pathname);
}

// Función auxiliar para determinar si es un asset estático
function isStaticAsset(request) {
  return CACHEABLE_PATTERNS.some(pattern => pattern.test(request.url));
}

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache First falló, usando cache de respaldo');
    return caches.match('/offline.html') || new Response('Offline');
  }
}

// Estrategia Cache First con largo tiempo de vida (para imágenes)
async function cacheFirstLong(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Para imágenes, devolver un placeholder si está disponible
    return new Response('', { status: 404 });
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network First falló, usando cache');
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si es un request de API y no hay cache, devolver página offline
    if (isAPIRequest(request)) {
      return caches.match('/offline.html') || new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }

    return new Response('Offline');
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.log('[SW] Stale While Revalidate: Error de red');
      return cachedResponse;
    });

  return cachedResponse || networkPromise;
}

// Manejar mensajes del cliente (por ejemplo, para limpiar cache)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('[SW] Cache limpiado');
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Manejar sincronización en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Realizando sincronización en background');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Aquí puedes implementar lógica específica para sincronizar datos
    // Por ejemplo, subir cambios pendientes a la API
    console.log('[SW] Sincronización en background completada');
  } catch (error) {
    console.error('[SW] Error en sincronización en background:', error);
  }
}

// Manejar notificaciones push (si se implementan)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/pwa-192x192.svg',
      badge: '/pwa-192x192.svg',
      tag: data.tag || 'gestoraulas-notification',
      data: data.data || {},
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Manejar acciones específicas de la notificación
    console.log('[SW] Acción de notificación:', event.action);
  } else {
    // Abrir la aplicación cuando se hace click en la notificación
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

console.log('[SW] Service Worker cargado exitosamente');
