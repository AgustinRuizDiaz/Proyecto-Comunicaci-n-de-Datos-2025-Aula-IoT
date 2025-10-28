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
// Sensores de Luz (LDR) - Entrada analógica
const int LDR1_PIN = 32;         // Sensor de luz 1 - "Luz 1" (Pin 32 - ADC)
const int LDR2_PIN = 25;         // Sensor de luz 2 - "Luz 2" (Pin 25 - ADC)

// Relés (Control de luces) - Salida digital
// NO SE ENVÍAN AL BACKEND - Se controlan internamente
const int RELAY1_PIN = 26;       // Relé 1 físico - Controlado por ventana 1 (Pin 26)
const int RELAY2_PIN = 27;       // Relé 2 físico - Controlado por ventana 2 (Pin 27)

// Sensor de movimiento - Entrada digital
const int MOTION_SENSOR_PIN = 34; // Sensor PIR (Pin 34)

// Sensores magnéticos de ventanas - Entrada digital
// ESTOS SÍ SE ENVÍAN AL BACKEND y controlan los relés
const int WINDOW_SWITCH1_PIN = 22; // Ventana 1 (Pin 22) - Controla RELAY1
const int WINDOW_SWITCH2_PIN = 23; // Ventana 2 (Pin 23) - Controla RELAY2

// ========== VARIABLES DE ESTADO ==========
// Estados de relés (luces independientes)
bool relay1State = false;  // false = apagado, true = encendido
bool relay2State = false;

// Control de apagado automático
unsigned long lastMotionTime = 0;
const unsigned long AUTO_OFF_TIMEOUT = 30 * 1000; // 30 segundos sin movimiento

// Estados previos para detectar cambios
bool prevMotion = false;
int prevLight1 = 0;   // Valor anterior del LDR 1
int prevLight2 = 0;   // Valor anterior del LDR 2
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
  
  // Los comandos vienen para las VENTANAS (pins 22 y 23)
  // Cada ventana controla su relé correspondiente
  
  if (pin == 22) {
    // Comando para Ventana 1 → Controla Relé 1
    relay1State = (estado == 1);
    digitalWrite(RELAY1_PIN, relay1State ? LOW : HIGH); // Lógica inversa: LOW=ON
    Serial.print("💡 Relé 1 (controlado por Ventana 1 - Pin 22): ");
    Serial.println(relay1State ? "ENCENDIDO" : "APAGADO");
    
    // Reiniciar timer de movimiento si se enciende
    if (relay1State) {
      lastMotionTime = millis();
    }
    
  } else if (pin == 23) {
    // Comando para Ventana 2 → Controla Relé 2
    relay2State = (estado == 1);
    digitalWrite(RELAY2_PIN, relay2State ? LOW : HIGH); // Lógica inversa: LOW=ON
    Serial.print("💡 Relé 2 (controlado por Ventana 2 - Pin 23): ");
    Serial.println(relay2State ? "ENCENDIDO" : "APAGADO");
    
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
  // Leer sensores de luz (LDR) - valores de 0 a 4095
  int rawLight1 = analogRead(LDR1_PIN);
  int rawLight2 = analogRead(LDR2_PIN);
  
  // Leer sensor de movimiento
  bool motionDetected = digitalRead(MOTION_SENSOR_PIN);
  
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
  
  // Detectar cambios en LDRs (umbral de 100 para evitar ruido)
  if (abs(rawLight1 - prevLight1) > 100) {
    hasChanges = true;
    Serial.print("☀️ LDR 1 (Pin 32): ");
    Serial.println(rawLight1);
  }
  
  if (abs(rawLight2 - prevLight2) > 100) {
    hasChanges = true;
    Serial.print("☀️ LDR 2 (Pin 25): ");
    Serial.println(rawLight2);
  }
  
  // Detectar cambios en relés
  if (relay1State != prevRelay1) {
    hasChanges = true;
    Serial.print("💡 Relé 1: ");
    Serial.println(relay1State ? "ON" : "OFF");
  }
  
  if (relay2State != prevRelay2) {
    hasChanges = true;
    Serial.print("💡 Relé 2: ");
    Serial.println(relay2State ? "ON" : "OFF");
  }
  
  // Guardar estados previos
  prevMotion = motionDetected;
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
  String url = backendURL + "/esp32/data";
  
  // Construir JSON
  DynamicJsonDocument doc(1024);
  doc["ip"] = espIP;
  
  JsonArray sensores = doc.createNestedArray("sensores");
  
  // ========== SENSORES DE LUZ (LDR) ==========
  // Sensor de luz 1 - Pin 32 (ADC - valores 0-4095)
  JsonObject luz1 = sensores.createNestedObject();
  luz1["pin"] = 32;
  int rawLight1 = analogRead(LDR1_PIN);
  luz1["estado"] = rawLight1 > 500 ? 1 : 0; // Umbral ajustable según luz ambiente
  
  // Sensor de luz 2 - Pin 25 (ADC - valores 0-4095)
  JsonObject luz2 = sensores.createNestedObject();
  luz2["pin"] = 25;
  int rawLight2 = analogRead(LDR2_PIN);
  luz2["estado"] = rawLight2 > 500 ? 1 : 0; // Umbral ajustable según luz ambiente
  
  // ========== SENSOR DE MOVIMIENTO ==========
  // Pin 34 - PIR (digital)
  JsonObject motion = sensores.createNestedObject();
  motion["pin"] = 34;
  motion["estado"] = digitalRead(MOTION_SENSOR_PIN) ? 1 : 0;
  
  // ========== SENSORES DE VENTANAS ==========
  // Estos SÍ se envían y representan el estado de los relés en la app
  
  // Ventana 1 - Pin 22 (el backend usa este para controlar Relé 1)
  JsonObject vent1 = sensores.createNestedObject();
  vent1["pin"] = 22;
  vent1["estado"] = relay1State ? 1 : 0; // Estado del relé 1
  
  // Ventana 2 - Pin 23 (el backend usa este para controlar Relé 2)
  JsonObject vent2 = sensores.createNestedObject();
  vent2["pin"] = 23;
  vent2["estado"] = relay2State ? 1 : 0; // Estado del relé 2
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Debug: Mostrar JSON que se envía
  Serial.println("📤 JSON enviado:");
  Serial.println(jsonString);
  
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
        if (comandos.size() > 0) {
          Serial.print("📥 Recibidos ");
          Serial.print(comandos.size());
          Serial.println(" comando(s) pendiente(s)");
          
          for (JsonObject cmd : comandos) {
            processCommand(cmd);
          }
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
  pinMode(WINDOW_SWITCH1_PIN, INPUT);  // Pin 22 - Input digital para ventana 1
  pinMode(WINDOW_SWITCH2_PIN, INPUT);  // Pin 23 - Input digital para ventana 2
  pinMode(LDR1_PIN, INPUT);            // Pin 32 - Input analógico
  pinMode(LDR2_PIN, INPUT);            // Pin 25 - Input analógico
  
  // Configurar ADC para sensores de luz
  analogReadResolution(12);        // Resolución de 12 bits (0-4095)
  analogSetAttenuation(ADC_11db);  // Rango completo 0-3.3V
  
  Serial.println("✓ Pines configurados:");
  Serial.println("  - Relés (salida): 26, 27");
  Serial.println("  - LDRs (entrada analógica): 32, 25");
  Serial.println("  - Movimiento (entrada digital): 34");
  Serial.println("  - Ventanas (entrada digital): 22, 23");
  
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