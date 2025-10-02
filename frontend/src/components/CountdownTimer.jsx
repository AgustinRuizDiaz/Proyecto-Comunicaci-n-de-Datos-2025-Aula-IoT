import React, { useState, useEffect } from 'react';

const CountdownTimer = ({
  initialTime,
  isActive = true,
  onComplete,
  aulaNombre = '',
  onCancel,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete && onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  const getUrgencyColor = () => {
    if (timeLeft <= 60) return 'text-red-600'; // Último minuto
    if (timeLeft <= 300) return 'text-orange-600'; // Últimos 5 minutos
    return 'text-blue-600'; // Tiempo normal
  };

  const getProgressColor = () => {
    if (timeLeft <= 60) return 'bg-red-500';
    if (timeLeft <= 300) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const handleCancel = () => {
    setIsVisible(false);
    onCancel && onCancel();
  };

  if (!isVisible || timeLeft <= 0) return null;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          <h3 className="font-medium text-gray-900">
            Apagado Automático Inminente
          </h3>
        </div>
        {onCancel && (
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {aulaNombre && `Aula: ${aulaNombre}`}
          </span>
          <span className={`font-mono text-lg font-bold ${getUrgencyColor()}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
            style={{ width: `${Math.max(0, getProgressPercentage())}%` }}
          ></div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Las luces se apagarán automáticamente cuando llegue a cero
      </div>
    </div>
  );
};

// Hook personalizado para gestionar múltiples contadores
export const useCountdownManager = () => {
  const [countdowns, setCountdowns] = useState({});

  const addCountdown = (id, initialTime, options = {}) => {
    setCountdowns(prev => ({
      ...prev,
      [id]: {
        timeLeft: initialTime,
        initialTime,
        isActive: true,
        ...options
      }
    }));
  };

  const removeCountdown = (id) => {
    setCountdowns(prev => {
      const newCountdowns = { ...prev };
      delete newCountdowns[id];
      return newCountdowns;
    });
  };

  const updateCountdown = (id, updates) => {
    setCountdowns(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const cancelCountdown = (id) => {
    updateCountdown(id, { isActive: false });
    setTimeout(() => removeCountdown(id), 1000); // Remover después de animación
  };

  const getCountdown = (id) => {
    return countdowns[id];
  };

  const getAllCountdowns = () => {
    return Object.entries(countdowns).map(([id, countdown]) => ({
      id,
      ...countdown
    }));
  };

  return {
    addCountdown,
    removeCountdown,
    updateCountdown,
    cancelCountdown,
    getCountdown,
    getAllCountdowns,
    countdowns
  };
};

export default CountdownTimer;
