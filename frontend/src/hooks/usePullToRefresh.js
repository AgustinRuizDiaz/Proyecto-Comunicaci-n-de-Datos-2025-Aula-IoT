import { useState, useRef, useEffect } from 'react';

/**
 * Hook personalizado para implementar funcionalidad de pull-to-refresh
 * @param {Function} onRefresh - Función que se ejecuta cuando se hace pull-to-refresh
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Objeto con propiedades y métodos para el componente
 */
export const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    threshold = 80, // Distancia mínima para activar el refresh
    maxPullDistance = 120, // Distancia máxima de arrastre
    refreshThreshold = 60, // Umbral para mostrar el indicador de refresh
    disabled = false
  } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const scrollElement = useRef(null);

  // Configurar el elemento scrollable
  const setScrollElement = (element) => {
    scrollElement.current = element;
  };

  // Manejar el inicio del toque/arrastre
  const handleTouchStart = (e) => {
    if (disabled || isRefreshing) return;

    // Solo activar si estamos en la parte superior del scroll
    if (scrollElement.current && scrollElement.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  // Manejar el movimiento del toque/arrastre
  const handleTouchMove = (e) => {
    if (!isPulling || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;

    if (deltaY > 0) { // Solo permitir arrastre hacia abajo
      const distance = Math.min(deltaY * 0.5, maxPullDistance); // Reducir la sensibilidad
      setPullDistance(distance);

      // Prevenir el scroll normal mientras se arrastra
      e.preventDefault();
    }
  };

  // Manejar el final del toque/arrastre
  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      // Activar refresh
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error durante el refresh:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  // Efecto para agregar/quitar event listeners
  useEffect(() => {
    const element = scrollElement.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, disabled, pullDistance, threshold]);

  // Calcular el progreso del pull (0-1)
  const pullProgress = Math.min(pullDistance / threshold, 1);

  // Determinar si mostrar el indicador de refresh
  const showRefreshIndicator = pullDistance >= refreshThreshold;

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress,
    showRefreshIndicator,
    setScrollElement,
    // Métodos adicionales para control programático
    refresh: async () => {
      if (disabled || isRefreshing) return;
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };
};

/**
 * Componente visual para mostrar el indicador de pull-to-refresh
 */
export const PullToRefreshIndicator = ({
  isRefreshing,
  pullProgress,
  showRefreshIndicator,
  className = ''
}) => {
  if (!showRefreshIndicator && !isRefreshing) return null;

  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className="flex flex-col items-center">
        {isRefreshing ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mb-2"></div>
            <span className="text-sm text-gray-600">Actualizando...</span>
          </>
        ) : (
          <>
            <div
              className="mb-2 transition-transform duration-200"
              style={{
                transform: `rotate(${pullProgress * 180}deg)`
              }}
            >
              ⬇️
            </div>
            <span className="text-sm text-gray-600">
              {pullProgress > 0.7 ? 'Soltar para actualizar' : 'Deslizar hacia abajo'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Componente wrapper que implementa pull-to-refresh en un listado
 */
export const PullToRefresh = ({
  children,
  onRefresh,
  disabled = false,
  className = '',
  ...options
}) => {
  const {
    isRefreshing,
    pullProgress,
    showRefreshIndicator,
    setScrollElement
  } = usePullToRefresh(onRefresh, { disabled, ...options });

  return (
    <div className={`relative ${className}`}>
      {/* Indicador de pull-to-refresh en la parte superior */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white">
        <PullToRefreshIndicator
          isRefreshing={isRefreshing}
          pullProgress={pullProgress}
          showRefreshIndicator={showRefreshIndicator}
        />
      </div>

      {/* Contenido scrollable */}
      <div
        ref={setScrollElement}
        className="overflow-auto h-full"
        style={{
          paddingTop: showRefreshIndicator || isRefreshing ? '60px' : '0px',
          transition: 'padding-top 0.2s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default usePullToRefresh;
