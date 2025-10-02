// Utilidades para optimizaciones de performance

/**
 * Hook personalizado para debounce
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook personalizado para throttle
 */
export const useThrottle = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
};

/**
 * Hook para cache con TTL (Time To Live)
 */
export const useCache = (key, initialValue = null, ttl = 5 * 60 * 1000) => { // 5 minutos por defecto
  const [cachedValue, setCachedValue] = useState(() => {
    const stored = localStorage.getItem(`cache_${key}`);
    if (stored) {
      const { value, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < ttl) {
        return value;
      }
    }
    return initialValue;
  });

  const setCache = useCallback((value) => {
    setCachedValue(value);
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      value,
      timestamp: Date.now()
    }));
  }, [key]);

  const clearCache = useCallback(() => {
    setCachedValue(initialValue);
    localStorage.removeItem(`cache_${key}`);
  }, [key, initialValue]);

  return [cachedValue, setCache, clearCache];
};

/**
 * Hook para batch updates
 */
export const useBatchUpdate = (callback, delay = 100) => {
  const timeoutRef = useRef(null);
  const pendingUpdates = useRef([]);

  const batchUpdate = useCallback((update) => {
    pendingUpdates.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(pendingUpdates.current);
      pendingUpdates.current = [];
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

/**
 * Utilidad para optimizar consultas de API con cache
 */
export const cachedApiCall = async (url, options = {}, cacheTime = 5 * 60 * 1000) => {
  const cacheKey = `api_${url}_${JSON.stringify(options)}`;

  // Verificar cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheTime) {
      return data;
    }
  }

  // Hacer llamada API
  const response = await fetch(url, options);
  const data = await response.json();

  // Guardar en cache
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));

  return data;
};

/**
 * Hook para manejo eficiente de estado de sensores
 */
export const useSensorState = (initialSensors = []) => {
  const [sensors, setSensors] = useState(initialSensors);
  const [loading, setLoading] = useState(false);

  const updateSensor = useBatchUpdate((updates) => {
    setSensors(prev => {
      const updated = { ...prev };
      updates.forEach(update => {
        if (updated[update.sensorId]) {
          updated[update.sensorId] = {
            ...updated[update.sensorId],
            ...update.data
          };
        }
      });
      return updated;
    });
  }, 50);

  const bulkUpdateSensors = useCallback((sensorUpdates) => {
    setSensors(prev => {
      const updated = { ...prev };
      sensorUpdates.forEach(({ sensorId, ...data }) => {
        if (updated[sensorId]) {
          updated[sensorId] = { ...updated[sensorId], ...data };
        }
      });
      return updated;
    });
  }, []);

  return {
    sensors,
    loading,
    setLoading,
    updateSensor,
    bulkUpdateSensors
  };
};
