#include <WiFi.h>
#include <WiFiClientSecure.h>   // <-- Added for HTTPS
#include "DHT.h"

// ---------- Pin Configuration ----------
#define DHTPIN 4
#define DHTTYPE DHT22
#define MQ135_PIN 34

DHT dht(DHTPIN, DHTTYPE);

// ---------- Wi-Fi Credentials ----------
const char* ssid = "OPPO";          // <-- Replace with your Wi-Fi SSID
const char* password = "12345678";       // <-- Replace with your Wi-Fi password

// ---------- Google Apps Script Web App ----------
const char* host = "script.google.com";
String SCRIPT_ID = "AKfycbznxoHemSQU-JhXxU8n9Qq-GIUboBZrBjnNfBfvWfRyG29CJyr3NrRupcuIryOpHHim1g";

// ---------- Optional Settings ----------
bool DEBUG_MODE = true;           // set false for presentation mode
unsigned long uploadInterval = 15000;  // data send interval (15 seconds)

// ---------- Setup ----------
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ESP32 Hyperlocal Weather + AQI Logger ===");
  Serial.println("Connecting to Wi-Fi...");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  dht.begin();
  delay(2000);
  Serial.println("DHT22 Initialized Successfully!");
  Serial.println("----------------------------------\n");
}

// ---------- Main Loop ----------
void loop() {
  // --- Read Sensor Data ---
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int mq135_value = analogRead(MQ135_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ DHT22 Read Error! Check wiring.");
    delay(2000);
    return;
  }

  // --- Display Readings ---
  Serial.println("==================================");
  Serial.printf("🌡  Temperature : %.2f °C\n", temperature);
  Serial.printf("💧 Humidity    : %.2f %%\n", humidity);
  Serial.printf("🌫  MQ135 Value : %d (Air Quality)\n", mq135_value);
  Serial.println("Uploading data to Google Sheets...");

  // --- Build HTTPS Path ---
  String path = "/macros/s/" + SCRIPT_ID + "/exec?temp=" + String(temperature) +
                "&hum=" + String(humidity) + "&mq=" + String(mq135_value);

  // --- Use HTTPS Client ---
  WiFiClientSecure client;
  client.setInsecure();  // skip certificate verification

  if (!client.connect(host, 443)) {
    Serial.println("⚠️  Connection to Google failed!");
    delay(uploadInterval);
    return;
  }

  // --- Send HTTPS Request ---
  client.println("GET " + path + " HTTP/1.1");
  client.println("Host: script.google.com");
  client.println("Connection: close");
  client.println();

  Serial.println("✅ Data sent successfully!");

  // --- Debug Response ---
  if (DEBUG_MODE) {
    Serial.println("\n--- Google Server Response ---");
    while (client.connected() || client.available()) {
      if (client.available()) {
        String line = client.readStringUntil('\r');
        Serial.print(line);
      }
    }
    Serial.println("\n--- End of Response ---\n");
  }

  Serial.println("==================================\n");
  delay(uploadInterval);
}
