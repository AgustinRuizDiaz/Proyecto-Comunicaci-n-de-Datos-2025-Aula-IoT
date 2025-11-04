// Módulo compartido para la cola de comandos ESP32
// Esto permite que múltiples rutas accedan a la misma cola

const pendingCommands = new Map();

module.exports = {
  pendingCommands,
  
  // Agregar comando a la cola
  enqueueCommand(ip, pin, action) {
    const commands = pendingCommands.get(ip) || [];
    // Convertir action ('on'/'off') a estado (1/0)
    const estado = action === 'on' ? 1 : 0;
    commands.push({
      pin: pin,
      estado: estado,  // Cambiar 'action' por 'estado'
      timestamp: Date.now()
    });
    pendingCommands.set(ip, commands);
    console.log(`📤 Comando encolado: Pin ${pin} → ${estado === 1 ? 'ON' : 'OFF'}`);
  },
  
  // Obtener y limpiar comandos pendientes
  getAndClearCommands(ip) {
    const commands = pendingCommands.get(ip) || [];
    if (commands.length > 0) {
      pendingCommands.delete(ip);
    }
    return commands;
  },
  
  // Verificar si hay comandos pendientes
  hasCommands(ip) {
    const commands = pendingCommands.get(ip);
    return commands && commands.length > 0;
  }
};
