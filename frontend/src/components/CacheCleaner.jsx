import React from 'react';

const CacheCleaner = () => {
  const clearAllCaches = async () => {
    if ('serviceWorker' in navigator) {
      // Desregistrar service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker desregistrado:', registration.scope);
      }
    }

    // Limpiar caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log('Eliminando cache:', cacheName);
        return caches.delete(cacheName);
      })
    );

    console.log('✅ Caches limpiados. Recargando...');
    window.location.reload();
  };

  return (
    <button
      onClick={clearAllCaches}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
      title="Limpiar service workers y cache"
    >
      🔄 Limpiar Cache
    </button>
  );
};

export default CacheCleaner;
