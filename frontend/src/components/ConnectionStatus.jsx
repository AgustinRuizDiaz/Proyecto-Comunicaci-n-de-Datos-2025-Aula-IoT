import React from 'react';

// Íconos SVG básicos como alternativa a Heroicons
const WifiIconSolid = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const WifiOffIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const ExclamationTriangleIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ConnectionStatus = ({
  isConnected,
  connectionError,
  lastHeartbeat,
  onReconnect,
  className = ''
}) => {
  const getStatusColor = () => {
    if (connectionError) return 'bg-red-100 text-red-800 border-red-200';
    if (isConnected) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getStatusIcon = () => {
    if (connectionError) return <ExclamationTriangleIcon />;
    if (isConnected) return <WifiIconSolid />;
    return <WifiOffIcon />;
  };

  const getStatusText = () => {
    if (connectionError) return 'Error de conexión';
    if (isConnected) return 'Conectado';
    return 'Desconectado';
  };

  const formatLastHeartbeat = () => {
    if (!lastHeartbeat) return '';

    const now = new Date();
    const last = new Date(lastHeartbeat);
    const diffMs = now - last;
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) {
      return `Hace ${diffSeconds}s`;
    } else {
      const diffMinutes = Math.floor(diffSeconds / 60);
      return `Hace ${diffMinutes}m`;
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getStatusColor()} ${className}`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
      </div>

      {lastHeartbeat && isConnected && (
        <span className="text-xs opacity-75">
          {formatLastHeartbeat()}
        </span>
      )}

      {!isConnected && onReconnect && (
        <button
          onClick={onReconnect}
          className="text-xs underline hover:no-underline ml-2"
          title="Intentar reconectar"
        >
          Reconectar
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
