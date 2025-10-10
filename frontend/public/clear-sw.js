// Script para limpiar service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(success) {
        console.log('Service Worker desregistrado:', success);
      });
    }
  });
}

// Limpiar caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('Limpiando cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(function() {
    console.log('✅ Caches limpiados');
    alert('Service Workers y caches limpiados. Recarga la página.');
  });
}
