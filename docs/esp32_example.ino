/**
 * Ejemplo de código ESP32 para integración con el sistema de tiempo real
 * Proyecto: Gestor de Aulas Universitarias con IoT
 */

// Configuración WiFi y servidor
const char* ssid = "TU_SSID";
const char* password = "TU_PASSWORD";
const char* serverIP = "192.168.1.100";  // IP del servidor Django
const int serverPort = 8000;

// Configuración ESP32
const int sensorPinLuz = 23;      // Pin para sensor de luz
const int sensorPinMovimiento = 22; // Pin para sensor de movimiento
const int relePin = 21;           // Pin para relé

// Variables de estado
bool luzEncendida = false;
bool movimientoDetectado = false;
unsigned long ultimoHeartbeat = 0;
const unsigned long intervaloHeartbeat = 30000; // 30 segundos

// Cliente HTTP y WebSocket
WiFiClient client;
WebSocketClient webSocket;

// Función de setup
void setup() {
  Serial.begin(115200);

  // Configurar pines
  pinMode(sensorPinLuz, INPUT);
  pinMode(sensorPinMovimiento, INPUT);
  pinMode(relePin, OUTPUT);

  // Conectar a WiFi
  conectarWiFi();

  // Inicializar estado de sensores
  leerSensores();

  Serial.println("ESP32 inicializado y conectado");
}

// Función principal
void loop() {
  // Mantener conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    conectarWiFi();
  }

  // Leer sensores periódicamente
  static unsigned long ultimoLectura = 0;
  if (millis() - ultimoLectura > 5000) {  // Cada 5 segundos
    leerSensores();
    ultimoLectura = millis();
  }

  // Enviar heartbeat periódicamente
  if (millis() - ultimoHeartbeat > intervaloHeartbeat) {
    enviarHeartbeat();
    ultimoHeartbeat = millis();
  }

  // Procesar comandos del servidor
  procesarComandosServidor();

  delay(100);
}

// Funciones auxiliares

void conectarWiFi() {
  Serial.print("Conectando a WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println(" ¡Conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void leerSensores() {
  // Leer estado de luz (simulado)
  bool luzEstado = digitalRead(sensorPinLuz) == HIGH;

  // Leer sensor de movimiento (simulado)
  bool movimientoEstado = digitalRead(sensorPinMovimiento) == HIGH;

  // Verificar cambios
  if (luzEstado != luzEncendida) {
    luzEncendida = luzEstado;
    enviarActualizacionSensor(1, luzEstado);  // ID del sensor de luz
  }

  if (movimientoEstado != movimientoDetectado) {
    movimientoDetectado = movimientoEstado;
    enviarActualizacionSensor(2, movimientoEstado);  // ID del sensor de movimiento

    // Control automático de luces basado en movimiento
    controlarLucesAutomatico();
  }
}

void enviarHeartbeat() {
  if (client.connect(serverIP, serverPort)) {
    // Crear JSON de heartbeat
    String jsonData = "{";
    jsonData += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
    jsonData += "\"sensores\":[";
    jsonData += "{\"id\":1,\"tipo\":\"luz\",\"estado\":" + String(luzEncendida ? "true" : "false") + ",\"pin\":" + String(sensorPinLuz) + "},";
    jsonData += "{\"id\":2,\"tipo\":\"movimiento\",\"estado\":" + String(movimientoDetectado ? "true" : "false") + ",\"pin\":" + String(sensorPinMovimiento) + "}";
    jsonData += "]";
    jsonData += "}";

    // Enviar POST request
    client.println("POST /api/sensors/esp32/heartbeat/ HTTP/1.1");
    client.println("Host: " + String(serverIP) + ":" + String(serverPort));
    client.println("Content-Type: application/json");
    client.println("Content-Length: " + String(jsonData.length()));
    client.println();
    client.println(jsonData);

    Serial.println("Heartbeat enviado: " + jsonData);

    // Leer respuesta del servidor
    while (client.connected()) {
      String line = client.readStringUntil('\n');
      if (line == "\r") break;  // Fin de headers
    }

    // Leer cuerpo de respuesta
    String response = client.readString();
    Serial.println("Respuesta del servidor: " + response);

    client.stop();
  } else {
    Serial.println("Error conectando al servidor para heartbeat");
  }
}

void enviarActualizacionSensor(int sensorId, bool estado) {
  if (client.connect(serverIP, serverPort)) {
    String jsonData = "{";
    jsonData += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
    jsonData += "\"sensor_id\":" + String(sensorId) + ",";
    jsonData += "\"nuevo_estado\":" + String(estado ? "true" : "false");
    jsonData += "}";

    client.println("POST /api/sensors/esp32/sensor-update/ HTTP/1.1");
    client.println("Host: " + String(serverIP) + ":" + String(serverPort));
    client.println("Content-Type: application/json");
    client.println("Content-Length: " + String(jsonData.length()));
    client.println();
    client.println(jsonData);

    Serial.println("Actualización de sensor enviada: " + jsonData);

    // Leer respuesta
    while (client.connected()) {
      String line = client.readStringUntil('\n');
      if (line == "\r") break;
    }

    String response = client.readString();
    Serial.println("Respuesta: " + response);

    client.stop();
  }
}

void controlarLucesAutomatico() {
  // Si hay movimiento y está oscuro, encender luces
  if (movimientoDetectado && !luzEncendida) {
    digitalWrite(relePin, HIGH);
    Serial.println("Luces encendidas automáticamente por movimiento");
  }

  // Si no hay movimiento por más de 30 segundos, apagar luces
  static unsigned long ultimoMovimiento = 0;
  if (movimientoDetectado) {
    ultimoMovimiento = millis();
  } else if (millis() - ultimoMovimiento > 30000 && luzEncendida) {
    digitalWrite(relePin, LOW);
    Serial.println("Luces apagadas automáticamente por inactividad");
  }
}

void procesarComandosServidor() {
  // Esta función procesaría comandos recibidos del servidor
  // Por ejemplo, si el servidor envía un comando para apagar luces

  // Implementación básica - verificar si hay datos disponibles
  if (client.available()) {
    String comando = client.readString();
    Serial.println("Comando recibido: " + comando);

    // Procesar comando (ejemplo básico)
    if (comando.indexOf("apagar_luces") != -1) {
      digitalWrite(relePin, LOW);
      Serial.println("Luces apagadas por comando del servidor");
    }
  }
}

/**
 * NOTAS DE IMPLEMENTACIÓN:
 *
 * 1. Este código es un ejemplo básico. En producción necesitarías:
 *    - Manejo de errores más robusto
 *    - Reconexión automática WiFi
 *    - Validación de respuestas del servidor
 *    - Seguridad (HTTPS, autenticación)
 *
 * 2. Configuración del servidor Django:
 *    - Asegurar que CORS permita conexiones del ESP32
 *    - Configurar timeout apropiado para ESP32
 *    - Implementar rate limiting si es necesario
 *
 * 3. Seguridad:
 *    - Usar HTTPS en producción
 *    - Implementar API keys para ESP32
 *    - Validar origen de requests
 *
 * 4. Monitoreo:
 *    - Logs detallados en ESP32
 *    - Métricas de conexión en servidor
 *    - Alertas por desconexiones frecuentes
 */
