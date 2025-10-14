// Módulo compartido para la cola de comandos ESP32
// Esto permite que múltiples rutas accedan a la misma cola

const pendingCommands = new Map();

module.exports = {
  pendingCommands,
  
  // Agregar comando a la cola
  enqueueCommand(ip, pin, action) {
    const commands = pendingCommands.get(ip) || [];
    commands.push({
      pin: pin,
      action: action,
      timestamp: Date.now()
    });
    pendingCommands.set(ip, commands);
    console.log(`📤 Comando encolado para ESP32 ${ip}: pin ${pin} → ${action}`);
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
