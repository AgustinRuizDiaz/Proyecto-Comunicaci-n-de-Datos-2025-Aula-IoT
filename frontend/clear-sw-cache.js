// Script para limpiar service workers y cache
// Ejecutar esto en la consola del navegador (F12)

if ('serviceWorker' in navigator) {
  // Desregistrar service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Desregistrando service worker:', registration.scope);
      registration.unregister();
    }
  });

  // Limpiar caches
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('Eliminando cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('✅ Todos los caches eliminados');
    console.log('🔄 Recargando página...');
    window.location.reload();
  });
} else {
  console.log('Service Workers no soportados en este navegador');
  window.location.reload();
}
