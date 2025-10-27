/**
 * Módulo para rastrear cambios recientes desde la app
 * Evita registros duplicados cuando el ESP32 confirma un cambio iniciado por usuario
 */

class RecentChanges {
  constructor() {
    // Map de sensor_id -> { estado, timestamp, userId }
    this.changes = new Map();
    // Map de sensor_id -> { estado, timestamp } para registros externos
    this.externalChanges = new Map();
    // Ventana de tiempo: 10 segundos para cambios de usuario
    this.WINDOW_MS = 10000;
    // Ventana de tiempo: 3 segundos para evitar duplicados externos
    this.EXTERNAL_WINDOW_MS = 3000;
  }

  /**
   * Registrar un cambio iniciado desde la app
   * @param {number} sensorId 
   * @param {number} estado 
   * @param {number} userId 
   */
  recordUserChange(sensorId, estado, userId) {
    this.changes.set(sensorId, {
      estado,
      timestamp: Date.now(),
      userId
    });
    
    console.log(`  🕒 Cambio de usuario registrado: Sensor ${sensorId} → Estado ${estado} (ventana de 10s)`);
    
    // Auto-limpiar después de la ventana de tiempo
    setTimeout(() => {
      if (this.changes.has(sensorId)) {
        const change = this.changes.get(sensorId);
        const age = Date.now() - change.timestamp;
        if (age >= this.WINDOW_MS) {
          this.changes.delete(sensorId);
          console.log(`  🧹 Ventana de tiempo expirada para sensor ${sensorId}`);
        }
      }
    }, this.WINDOW_MS);
  }

  /**
   * Registrar un cambio externo para evitar duplicados
   * @param {number} sensorId 
   * @param {number} estado 
   */
  recordExternalChange(sensorId, estado) {
    this.externalChanges.set(sensorId, {
      estado,
      timestamp: Date.now()
    });
    
    // Auto-limpiar después de la ventana de tiempo
    setTimeout(() => {
      if (this.externalChanges.has(sensorId)) {
        this.externalChanges.delete(sensorId);
      }
    }, this.EXTERNAL_WINDOW_MS);
  }

  /**
   * Verificar si un cambio externo es duplicado (mismo sensor, mismo estado, en los últimos 3 segundos)
   * @param {number} sensorId 
   * @param {number} estado 
   * @returns {boolean} true si es duplicado
   */
  isExternalDuplicate(sensorId, estado) {
    if (!this.externalChanges.has(sensorId)) {
      return false;
    }

    const change = this.externalChanges.get(sensorId);
    const age = Date.now() - change.timestamp;

    // Si está fuera de la ventana de tiempo, no es duplicado
    if (age >= this.EXTERNAL_WINDOW_MS) {
      this.externalChanges.delete(sensorId);
      return false;
    }

    // Si el estado es el mismo y está dentro de la ventana, es duplicado
    if (change.estado === estado) {
      console.log(`  🔄 Duplicado externo detectado: Sensor ${sensorId} ya registrado hace ${age}ms con mismo estado ${estado}`);
      return true;
    }

    return false;
  }

  /**
   * Verificar si un cambio desde ESP32 es una confirmación de un cambio de usuario reciente
   * @param {number} sensorId 
   * @param {number} estado 
   * @returns {boolean} true si debe ignorarse (es duplicado)
   */
  shouldIgnoreESP32Update(sensorId, estado) {
    if (!this.changes.has(sensorId)) {
      return false; // No hay cambio reciente, procesar normalmente
    }

    const change = this.changes.get(sensorId);
    const age = Date.now() - change.timestamp;

    // Si está fuera de la ventana de tiempo, eliminar y procesar
    if (age >= this.WINDOW_MS) {
      this.changes.delete(sensorId);
      return false;
    }

    // Si el estado coincide con el cambio reciente, es una confirmación
    if (change.estado === estado) {
      console.log(`  ⏭️ Ignorando actualización ESP32: Sensor ${sensorId} ya fue cambiado por usuario hace ${age}ms`);
      this.changes.delete(sensorId); // Limpiar después de confirmar
      return true; // Ignorar este update del ESP32
    }

    // Si el estado es diferente, es un cambio nuevo (ej: alguien lo cambió físicamente)
    return false;
  }

  /**
   * Limpiar cambios antiguos (mantenimiento)
   */
  cleanup() {
    const now = Date.now();
    
    // Limpiar cambios de usuario
    for (const [sensorId, change] of this.changes.entries()) {
      const age = now - change.timestamp;
      if (age >= this.WINDOW_MS) {
        this.changes.delete(sensorId);
      }
    }
    
    // Limpiar cambios externos
    for (const [sensorId, change] of this.externalChanges.entries()) {
      const age = now - change.timestamp;
      if (age >= this.EXTERNAL_WINDOW_MS) {
        this.externalChanges.delete(sensorId);
      }
    }
  }

  /**
   * Obtener estadísticas (para debugging)
   */
  getStats() {
    return {
      activeUserChanges: this.changes.size,
      activeExternalChanges: this.externalChanges.size,
      userChanges: Array.from(this.changes.entries()).map(([sensorId, change]) => ({
        sensorId,
        estado: change.estado,
        age: Date.now() - change.timestamp,
        userId: change.userId
      })),
      externalChanges: Array.from(this.externalChanges.entries()).map(([sensorId, change]) => ({
        sensorId,
        estado: change.estado,
        age: Date.now() - change.timestamp
      }))
    };
  }
}

// Instancia singleton
const recentChanges = new RecentChanges();

// Limpiar cada minuto
setInterval(() => {
  recentChanges.cleanup();
}, 60000);

module.exports = recentChanges;
