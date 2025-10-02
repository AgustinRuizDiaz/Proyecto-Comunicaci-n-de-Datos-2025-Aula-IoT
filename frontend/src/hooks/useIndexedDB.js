/**
 * Hook personalizado para manejar IndexedDB
 * Proporciona funcionalidades de cache local y sincronización offline
 */

// Configuración de la base de datos
const DB_NAME = 'GestorAulasDB';
const DB_VERSION = 1;

// Estructura de las stores de IndexedDB
const STORES = {
  AULAS: 'aulas',
  SENSORES: 'sensores',
  HISTORIAL: 'historial',
  SYNC_QUEUE: 'sync_queue'
};

// Estado inicial del hook
const initialState = {
  db: null,
  isLoading: true,
  error: null,
  isOnline: navigator.onLine
};

export const useIndexedDB = () => {
  const [state, setState] = useState(initialState);

  // Inicializar la base de datos
  const initDB = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Error al abrir IndexedDB:', event.target.error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'No se pudo abrir la base de datos local'
        }));
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        console.log('IndexedDB inicializada exitosamente');

        setState(prev => ({
          ...prev,
          db,
          isLoading: false,
          error: null
        }));
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Crear stores si no existen
        if (!db.objectStoreNames.contains(STORES.AULAS)) {
          const aulasStore = db.createObjectStore(STORES.AULAS, { keyPath: 'id' });
          aulasStore.createIndex('nombre', 'nombre', { unique: false });
          aulasStore.createIndex('ip_esp32', 'ip_esp32', { unique: true });
        }

        if (!db.objectStoreNames.contains(STORES.SENSORES)) {
          const sensoresStore = db.createObjectStore(STORES.SENSORES, { keyPath: 'id' });
          sensoresStore.createIndex('aula_id', 'aula_id', { unique: false });
          sensoresStore.createIndex('tipo', 'tipo', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.HISTORIAL)) {
          const historialStore = db.createObjectStore(STORES.HISTORIAL, { keyPath: 'id', autoIncrement: true });
          historialStore.createIndex('fecha', 'fecha', { unique: false });
          historialStore.createIndex('sensor_id', 'sensor_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('tipo', 'tipo', { unique: false });
        }
      };
    } catch (error) {
      console.error('Error inicializando IndexedDB:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, []);

  // Función para almacenar datos en una store específica
  const storeData = useCallback(async (storeName, data, key = null) => {
    if (!state.db) {
      throw new Error('Base de datos no inicializada');
    }

    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      let request;

      if (key !== null && data.id) {
        // Actualizar registro existente
        request = store.put({ ...data, id: key });
      } else if (Array.isArray(data)) {
        // Almacenar múltiples registros
        data.forEach(item => {
          store.put(item);
        });
        resolve();
        return;
      } else {
        // Crear nuevo registro
        request = store.put(data);
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => {
        console.log(`Datos almacenados en ${storeName}:`, data);
      };
    });
  }, [state.db]);

  // Función para obtener datos de una store específica
  const getData = useCallback(async (storeName, key = null, indexName = null, indexValue = null) => {
    if (!state.db) {
      throw new Error('Base de datos no inicializada');
    }

    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      let request;

      if (key !== null) {
        request = store.get(key);
      } else if (indexName && indexValue !== null) {
        request = store.index(indexName).getAll(indexValue);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [state.db]);

  // Función para eliminar datos de una store específica
  const deleteData = useCallback(async (storeName, key) => {
    if (!state.db) {
      throw new Error('Base de datos no inicializada');
    }

    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [state.db]);

  // Función para limpiar una store completa
  const clearStore = useCallback(async (storeName) => {
    if (!state.db) {
      throw new Error('Base de datos no inicializada');
    }

    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [state.db]);

  // Funciones específicas para cada tipo de datos

  // Gestión de aulas
  const cacheAulas = useCallback(async (aulas) => {
    return await storeData(STORES.AULAS, aulas);
  }, [storeData]);

  const getCachedAulas = useCallback(async () => {
    return await getData(STORES.AULAS);
  }, [getData]);

  // Gestión de sensores
  const cacheSensores = useCallback(async (sensores) => {
    return await storeData(STORES.SENSORES, sensores);
  }, [storeData]);

  const getCachedSensores = useCallback(async (aulaId = null) => {
    if (aulaId) {
      return await getData(STORES.SENSORES, null, 'aula_id', aulaId);
    }
    return await getData(STORES.SENSORES);
  }, [getData]);

  // Gestión de historial
  const cacheHistorial = useCallback(async (registros) => {
    return await storeData(STORES.HISTORIAL, registros);
  }, [storeData]);

  const getCachedHistorial = useCallback(async (sensorId = null, fecha = null) => {
    let results = await getData(STORES.HISTORIAL);

    if (sensorId) {
      results = results.filter(registro => registro.sensor_id === sensorId);
    }

    if (fecha) {
      results = results.filter(registro => registro.fecha === fecha);
    }

    return results.sort((a, b) => new Date(b.fecha + ' ' + b.hora) - new Date(a.fecha + ' ' + a.hora));
  }, [getData]);

  // Gestión de cola de sincronización
  const addToSyncQueue = useCallback(async (tipo, accion, datos) => {
    const syncItem = {
      tipo,
      accion,
      datos,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    return await storeData(STORES.SYNC_QUEUE, syncItem);
  }, [storeData]);

  const getSyncQueue = useCallback(async () => {
    return await getData(STORES.SYNC_QUEUE);
  }, [getData]);

  const removeFromSyncQueue = useCallback(async (id) => {
    return await deleteData(STORES.SYNC_QUEUE, id);
  }, [deleteData]);

  // Sincronización automática cuando hay conexión
  useEffect(() => {
    const handleOnline = async () => {
      setState(prev => ({ ...prev, isOnline: true }));
      await performBackgroundSync();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función de sincronización en background
  const performBackgroundSync = useCallback(async () => {
    if (!state.isOnline || !state.db) return;

    try {
      const syncQueue = await getSyncQueue();

      for (const item of syncQueue) {
        try {
          await syncItem(item);
          await removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Error sincronizando item:', item, error);
          // Incrementar contador de reintentos
          item.retryCount += 1;

          // Si ha fallado demasiadas veces, eliminar de la cola
          if (item.retryCount >= 5) {
            await removeFromSyncQueue(item.id);
          } else {
            await storeData(STORES.SYNC_QUEUE, item);
          }
        }
      }
    } catch (error) {
      console.error('Error en sincronización background:', error);
    }
  }, [state.isOnline, state.db, getSyncQueue, removeFromSyncQueue, storeData]);

  // Función auxiliar para sincronizar un item específico
  const syncItem = async (item) => {
    // Aquí implementarías la lógica específica para sincronizar cada tipo de acción
    // Por ejemplo, subir cambios a la API cuando hay conexión

    switch (item.tipo) {
      case 'aula':
        if (item.accion === 'create') {
          // await apiService.createAula(item.datos);
        } else if (item.accion === 'update') {
          // await apiService.updateAula(item.datos.id, item.datos);
        }
        break;
      case 'sensor':
        if (item.accion === 'toggle') {
          // await apiService.toggleSensor(item.datos.id);
        }
        break;
      default:
        console.warn('Tipo de sincronización no reconocido:', item.tipo);
    }
  };

  // Inicializar la base de datos al montar el componente
  useEffect(() => {
    initDB();
  }, [initDB]);

  return {
    // Estado
    isLoading: state.isLoading,
    error: state.error,
    isOnline: state.isOnline,
    db: state.db,

    // Funciones generales
    storeData,
    getData,
    deleteData,
    clearStore,

    // Funciones específicas
    cacheAulas,
    getCachedAulas,
    cacheSensores,
    getCachedSensores,
    cacheHistorial,
    getCachedHistorial,
    addToSyncQueue,
    getSyncQueue,
    removeFromSyncQueue,
    performBackgroundSync
  };
};

export default useIndexedDB;
