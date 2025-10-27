// ========== LIBRERÍAS ==========
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebSocketsClient_Generic.h>

// ========== CONFIGURACIÓN WIFI ==========
const char* ssid = "Personal-388-2.4GHz";
const char* password = "01424678639";

// ========== CONFIGURACIÓN SERVIDOR ==========
const char* serverIP = "192.168.0.11";  // IP local del backend
const int serverPort = 3003;
String backendURL = "http://192.168.0.11:3003";
String espIP = "";  // Se obtiene automáticamente al conectar WiFi

// ========== DEFINICIÓN DE PINES ==========
// Sensores de Luz (LDR) - Solo entrada
const int LDR1_PIN = 32;         // Sensor de luz 1 - "Luz 1" (Pin 32 - ADC)
const int LDR2_PIN = 25;         // Sensor de luz 2 - "Luz 2" (Pin 25)

// Relés (Control de luces) - Necesitan ser pines de salida
const int RELAY1_PIN = 26;       // Relé 1 - Luz 1 (Pin 26 - GPIO salida)
const int RELAY2_PIN = 27;       // Relé 2 - Luz 2 (Pin 27 - GPIO salida)

// Sensor de movimiento - Solo entrada
const int MOTION_SENSOR_PIN = 34; // Sensor PIR (Pin 34 - Solo entrada)

// Sensores magnéticos (ventanas) - Solo entrada
const int WINDOW_SWITCH1_PIN = 39; // Ventana 1 (Pin 39 - Solo entrada)
const int WINDOW_SWITCH2_PIN = 36; // Ventana 2 (Pin 36 - Solo entrada)

// ========== VARIABLES DE ESTADO ==========
// Estados de relés (luces independientes)
bool relay1State = false;  // false = apagado, true = encendido
bool relay2State = false;

// Control de apagado automático
unsigned long lastMotionTime = 0;
const unsigned long AUTO_OFF_TIMEOUT = 30 * 1000; // 30 segundos sin movimiento

// Estados previos para detectar cambios
bool prevMotion = false;
bool prevWindow1 = false;
bool prevWindow2 = false;
int prevLight1 = 0;
int prevLight2 = 0;
bool prevRelay1 = false;
bool prevRelay2 = false;

// Control de envío de datos
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 2000; // Enviar cada 2 segundos si no hay cambios

// ========== WEBSOCKET ==========
WebSocketsClient webSocket;
bool socketConnected = false;

// ========== FUNCIÓN: CONECTAR WIFI ==========
void connectWiFi() {
  Serial.println("\n========== CONECTANDO WIFI ==========");
  Serial.print("SSID: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi conectado");
    espIP = WiFi.localIP().toString();
    Serial.print("IP del ESP32: ");
    Serial.println(espIP);
  } else {
    Serial.println("\n✗ Error: No se pudo conectar al WiFi");
    Serial.println("Reiniciando en 5 segundos...");
    delay(5000);
    ESP.restart();
  }
}

// ========== FUNCIÓN: EVENTO WEBSOCKET ==========
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("⚠ WebSocket desconectado");
      socketConnected = false;
      break;
      
    case WStype_CONNECTED:
      {
        Serial.println("✓ WebSocket conectado");
        socketConnected = true;
        
        // Unirse a la sala específica del ESP32
        String joinMsg = "[\"join\",{\"room\":\"esp32:" + espIP + "\"}]";
        webSocket.sendTXT("42" + joinMsg);
        Serial.println("Unido a sala: esp32:" + espIP);
      }
      break;
      
    case WStype_TEXT:
      {
        String msg = String((char*)payload);
        Serial.println("📩 Mensaje recibido: " + msg);
        
        // Socket.IO usa prefijos: 42 = evento
        if (msg.startsWith("42")) {
          msg = msg.substring(2); // Remover prefijo
          
          // Parsear comando
          DynamicJsonDocument doc(512);
          DeserializationError error = deserializeJson(doc, msg);
          
          if (!error) {
            const char* eventName = doc[0];
            
            if (strcmp(eventName, "esp32:command") == 0) {
              JsonObject command = doc[1];
              processCommand(command);
            }
          }
        }
      }
      break;
      
    case WStype_ERROR:
      Serial.println("✗ Error en WebSocket");
      break;
      
    case WStype_PING:
      Serial.println("⚡ Ping recibido");
      break;
      
    case WStype_PONG:
      Serial.println("⚡ Pong recibido");
      break;
  }
}

// ========== FUNCIÓN: PROCESAR COMANDO ==========
void processCommand(JsonObject command) {
  int pin = command["pin"];
  int estado = command["estado"];
  
  Serial.print("🎛️ Comando recibido - Pin: ");
  Serial.print(pin);
  Serial.print(" | Estado: ");
  Serial.println(estado);
  
  // Procesar según el pin
  if (pin == 22) {
    // Relé 1 (Luz 1)
    relay1State = (estado == 1);
    digitalWrite(RELAY1_PIN, relay1State ? LOW : HIGH); // Lógica inversa
    Serial.print("💡 Luz 1 (Pin 22): ");
    Serial.println(relay1State ? "ENCENDIDA" : "APAGADA");
    
    // Reiniciar timer de movimiento si se enciende
    if (relay1State) {
      lastMotionTime = millis();
    }
    
  } else if (pin == 23) {
    // Relé 2 (Luz 2)
    relay2State = (estado == 1);
    digitalWrite(RELAY2_PIN, relay2State ? LOW : HIGH); // Lógica inversa
    Serial.print("💡 Luz 2 (Pin 23): ");
    Serial.println(relay2State ? "ENCENDIDA" : "APAGADA");
    
    // Reiniciar timer de movimiento si se enciende
    if (relay2State) {
      lastMotionTime = millis();
    }
  }
  
  // Enviar actualización inmediata al backend
  sendDataToBackend();
}

// ========== FUNCIÓN: LEER SENSORES ==========
void readSensors() {
  // Leer sensores analógicos (LDR) - valores de 0 a 4095
  int rawLight1 = analogRead(LDR1_PIN);
  int rawLight2 = analogRead(LDR2_PIN);
  
  // Leer sensor de movimiento
  bool motionDetected = digitalRead(MOTION_SENSOR_PIN);
  
  // Leer sensores de ventanas (HIGH = abierta, LOW = cerrada)
  bool window1Open = digitalRead(WINDOW_SWITCH1_PIN) == HIGH;
  bool window2Open = digitalRead(WINDOW_SWITCH2_PIN) == HIGH;
  
  // Actualizar timer de movimiento
  if (motionDetected) {
    lastMotionTime = millis();
  }
  
  // Detectar cambios significativos
  bool hasChanges = false;
  
  if (motionDetected != prevMotion) {
    hasChanges = true;
    Serial.print("👤 Movimiento: ");
    Serial.println(motionDetected ? "DETECTADO" : "NO");
  }
  
  if (window1Open != prevWindow1) {
    hasChanges = true;
    Serial.print("🪟 Ventana 1: ");
    Serial.println(window1Open ? "ABIERTA" : "CERRADA");
  }
  
  if (window2Open != prevWindow2) {
    hasChanges = true;
    Serial.print("🪟 Ventana 2: ");
    Serial.println(window2Open ? "ABIERTA" : "CERRADA");
  }
  
  if (abs(rawLight1 - prevLight1) > 100) {
    hasChanges = true;
    Serial.print("☀️ Luz 1: ");
    Serial.println(rawLight1);
  }
  
  if (abs(rawLight2 - prevLight2) > 100) {
    hasChanges = true;
    Serial.print("☀️ Luz 2: ");
    Serial.println(rawLight2);
  }
  
  if (relay1State != prevRelay1 || relay2State != prevRelay2) {
    hasChanges = true;
  }
  
  // Guardar estados previos
  prevMotion = motionDetected;
  prevWindow1 = window1Open;
  prevWindow2 = window2Open;
  prevLight1 = rawLight1;
  prevLight2 = rawLight2;
  prevRelay1 = relay1State;
  prevRelay2 = relay2State;
  
  // Enviar datos si hay cambios o ha pasado el intervalo
  if (hasChanges || (millis() - lastSendTime >= SEND_INTERVAL)) {
    sendDataToBackend();
  }
}

// ========== FUNCIÓN: APAGADO AUTOMÁTICO ==========
void checkAutoOff() {
  unsigned long timeSinceMotion = millis() - lastMotionTime;
  
  // Si ha pasado más de 30 segundos sin movimiento, apagar luces
  if (timeSinceMotion > AUTO_OFF_TIMEOUT) {
    bool wasOn = false;
    
    if (relay1State) {
      relay1State = false;
      digitalWrite(RELAY1_PIN, HIGH); // Apagar
      Serial.println("💤 Apagado automático: Luz 1 (30s sin movimiento)");
      wasOn = true;
    }
    
    if (relay2State) {
      relay2State = false;
      digitalWrite(RELAY2_PIN, HIGH); // Apagar
      Serial.println("💤 Apagado automático: Luz 2 (30s sin movimiento)");
      wasOn = true;
    }
    
    // Si se apagó alguna luz, enviar actualización
    if (wasOn) {
      sendDataToBackend();
    }
  }
}

// ========== FUNCIÓN: ENVIAR DATOS AL BACKEND ==========
void sendDataToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ WiFi desconectado, reintentando...");
    connectWiFi();
    return;
  }
  
  HTTPClient http;
  String url = backendURL + "/esp32/data";  // Ruta correcta sin /api
  
  // Construir JSON
  DynamicJsonDocument doc(1024);
  doc["ip"] = espIP;
  
  JsonArray sensores = doc.createNestedArray("sensores");
  
  // Sensor de luz 1 (Pin 32 - LDR)
  JsonObject luz1 = sensores.createNestedObject();
  luz1["pin"] = 32;
  luz1["estado"] = analogRead(LDR1_PIN) > 500 ? 1 : 0; // Umbral ajustable
  
  // Sensor de luz 2 (Pin 25 - LDR)
  JsonObject luz2 = sensores.createNestedObject();
  luz2["pin"] = 25;
  luz2["estado"] = analogRead(LDR2_PIN) > 500 ? 1 : 0;
  
  // Sensor de movimiento (Pin 34 - PIR)
  JsonObject motion = sensores.createNestedObject();
  motion["pin"] = 34;
  motion["estado"] = digitalRead(MOTION_SENSOR_PIN) ? 1 : 0;
  
  // Ventana 1 (Pin 39 - Magnético)
  JsonObject vent1 = sensores.createNestedObject();
  vent1["pin"] = 39;
  vent1["estado"] = digitalRead(WINDOW_SWITCH1_PIN) == HIGH ? 1 : 0;
  
  // Ventana 2 (Pin 36 - Magnético)
  JsonObject vent2 = sensores.createNestedObject();
  vent2["pin"] = 36;
  vent2["estado"] = digitalRead(WINDOW_SWITCH2_PIN) == HIGH ? 1 : 0;
  
  // NO enviamos los relés (pins 22 y 23) al backend
  // Se manejan internamente en el ESP32
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Enviar HTTP POST
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("✓ Datos enviados al backend (HTTP " + String(httpCode) + ")");
    
    // Procesar comandos pendientes de la respuesta
    if (httpCode == 200) {
      DynamicJsonDocument respDoc(2048);
      DeserializationError error = deserializeJson(respDoc, response);
      
      if (!error && respDoc.containsKey("comandos")) {
        JsonArray comandos = respDoc["comandos"];
        for (JsonObject cmd : comandos) {
          processCommand(cmd);
        }
      }
    }
  } else {
    Serial.println("✗ Error al enviar datos: " + String(httpCode));
  }
  
  http.end();
  lastSendTime = millis();
}

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n");
  Serial.println("═══════════════════════════════════════════");
  Serial.println("   SISTEMA DE GESTIÓN DE AULAS - ESP32");
  Serial.println("   Modo: Control Manual + Apagado Auto");
  Serial.println("═══════════════════════════════════════════");
  
  // Configurar pines de salida (relés)
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  digitalWrite(RELAY1_PIN, HIGH);  // Inicialmente apagados (lógica inversa)
  digitalWrite(RELAY2_PIN, HIGH);
  
  // Configurar pines de entrada (sensores)
  pinMode(MOTION_SENSOR_PIN, INPUT);
  pinMode(WINDOW_SWITCH1_PIN, INPUT_PULLUP);
  pinMode(WINDOW_SWITCH2_PIN, INPUT_PULLUP);
  pinMode(LDR1_PIN, INPUT);
  pinMode(LDR2_PIN, INPUT);
  
  // Configurar ADC
  analogReadResolution(12);        // Resolución de 12 bits (0-4095)
  analogSetAttenuation(ADC_11db);  // Rango completo 0-3.3V
  
  Serial.println("✓ Pines configurados");
  
  // Conectar WiFi
  connectWiFi();
  
  // Conectar WebSocket
  Serial.println("\n========== CONECTANDO WEBSOCKET ==========");
  webSocket.begin(serverIP, serverPort, "/socket.io/?EIO=4&transport=websocket");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  Serial.println("WebSocket iniciado");
  
  // Inicializar timer de movimiento
  lastMotionTime = millis();
  
  Serial.println("\n✓ Sistema inicializado correctamente");
  Serial.println("═══════════════════════════════════════════\n");
  
  // Enviar estado inicial
  delay(2000);
  sendDataToBackend();
}

// ========== LOOP ==========
void loop() {
  // Mantener WebSocket activo
  webSocket.loop();
  
  // Leer sensores y enviar datos si hay cambios
  readSensors();
  
  // Verificar apagado automático
  checkAutoOff();
  
  // Pequeña pausa para no saturar
  delay(100);
}