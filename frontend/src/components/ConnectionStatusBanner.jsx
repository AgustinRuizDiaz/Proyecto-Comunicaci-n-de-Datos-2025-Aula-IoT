import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ConnectionStatusBanner = () => {
  const { connectionError } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  if (!connectionError || !isVisible) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong>Problema de conexión:</strong> {connectionError}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={() => {
                // Limpiar service workers y cache
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                      registration.unregister();
                    });
                  });
                }
                caches.keys().then(names => {
                  names.forEach(name => caches.delete(name));
                }).then(() => window.location.reload());
              }}
              className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded text-sm font-medium"
            >
              🗑️ Limpiar Cache
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-yellow-700 hover:text-yellow-900 text-sm"
            >
              ❌ Ocultar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusBanner;
