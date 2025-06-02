// aws_handler.cpp

#include "aws_handler.h"
#include "secrets.h"
#include "WiFi.h"
#include <Arduino.h> 
#ifndef LED_BUILTIN
#define LED_BUILTIN 4
#endif

WiFiClientSecure net;
PubSubClient client(net);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000);

// Global variable to keep track of the current Wi-Fi network index
int currentWifiIndex = 0;

void setupTimeClient() {
  timeClient.begin();
  Serial.print("Syncing time");
  // Increase delay and add an overall timeout to avoid getting stuck indefinitely
  unsigned long syncStartTime = millis();
  const unsigned long SYNC_TIMEOUT_MS = 120000; // 2 minutes overall timeout for sync

  while (!timeClient.update() && (millis() - syncStartTime < SYNC_TIMEOUT_MS)) {
    timeClient.forceUpdate();
    Serial.print(".");
    delay(1000); // Increased delay for better chance of response
  }

  if (timeClient.update()) { // Check one last time after the loop
    Serial.println("\nTime synced!");
  } else {
    Serial.println("\nFailed to sync time after multiple attempts or timeout.");
  }
}

// --- NEW FUNCTION: connectWiFi() ---
void connectWiFi() {
  WiFi.mode(WIFI_STA); // Set WiFi mode to station

  while (WiFi.status() != WL_CONNECTED) {
    // Try current network
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSIDS[currentWifiIndex]);
    WiFi.begin(WIFI_SSIDS[currentWifiIndex], WIFI_PASSWORDS[currentWifiIndex]);

    int attempts = 0;
    // Wait for connection with a timeout (e.g., 20 seconds)
    while (WiFi.status() != WL_CONNECTED && attempts < 40) { // 40 * 500ms = 20 seconds
      delay(500);
      Serial.print(".");
      attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nWiFi Connected!");
      Serial.print("IP: "); Serial.println(WiFi.localIP());
      setupTimeClient(); // Sync time once connected
      return; // Exit function, WiFi is connected
    } else {
      Serial.println("\nFailed to connect.");
      // Move to the next network
      currentWifiIndex++;
      digitalWrite(LED_BUILTIN, HIGH);
      delay(1000);
      digitalWrite(LED_BUILTIN, LOW);
      digitalWrite(LED_BUILTIN, HIGH);
      delay(1000);
      digitalWrite(LED_BUILTIN, LOW);
      // If we've tried all networks, loop back to the last one (or start from beginning)
      if (currentWifiIndex >= NUM_WIFI_NETWORKS) {
        currentWifiIndex = NUM_WIFI_NETWORKS - 1; // Infinitely loop on the last network
        // Or: currentWifiIndex = 0; // Loop back to the first network
        Serial.println("Tried all networks. Sticking to the last one or restarting from first.");
        delay(5000); // Add a delay before retrying the last/first network
      }
    }
  }
}
// --- END NEW FUNCTION ---


void connectAWS() {
  // Ensure WiFi is connected and time is synced before attempting AWS
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi(); // Call our new function to handle WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Critical Error: Could not connect to any WiFi network. Aborting AWS connection.");
      return; // Abort if WiFi still fails
    }
  }

  // --- AWS Certificate and Endpoint Setup ---
  // Ensure AWS_IOT_ENDPOINT is NOT empty in secrets.h!
  if (strlen(AWS_IOT_ENDPOINT) == 0) {
      Serial.println("ERROR: AWS_IOT_ENDPOINT is not set in secrets.h!");
      return;
  }
  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE); // Corrected from AWS_PRIVATE_KEY
  client.setServer(AWS_IOT_ENDPOINT, 8883);
  client.setCallback(messageHandler);
  // --- End AWS Certificate and Endpoint Setup ---


  Serial.print("Connecting AWS IoT");
  // Add a timeout for AWS IoT connection as well
  unsigned long awsConnectStartTime = millis();
  const unsigned long AWS_CONNECT_TIMEOUT_MS = 60000; // 60 seconds timeout for AWS

  while (!client.connect(THINGNAME) && (millis() - awsConnectStartTime < AWS_CONNECT_TIMEOUT_MS)) {
    Serial.print(".");
    delay(1000); // Increase delay for AWS connection attempts
  }

  if (!client.connected()) {
    Serial.println("\nAWS IoT Timeout/Failed to connect!");
    return;
  }
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC); // Ensure AWS_IOT_SUBSCRIBE_TOPIC is defined somewhere
  Serial.println("\nAWS IoT Connected!");
}

void messageHandler(char* topic, byte* payload, unsigned int length) {
  Serial.print("RX: ");
  Serial.println(topic);
  StaticJsonDocument<200> doc;
  // Make sure you have included ArduinoJson.h
  // If deserializeJson returns DeserializationError::Ok, it's successful
  DeserializationError error = deserializeJson(doc, payload, length);
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.c_str());
    Serial.print("Raw Payload: ");
    for (unsigned int i = 0; i < length; i++) Serial.print((char)payload[i]);
    Serial.println();
  } else {
    if (doc.containsKey("message")) {
      Serial.println((const char*)doc["message"]);
    } else {
      for (unsigned int i = 0; i < length; i++) Serial.print((char)payload[i]);
      Serial.println();
    }
  }
}

void publishMessage(const char* deviceId, unsigned long long timestampMs,
                    float airTemp, float airHum, float soilMoisture, float soilTemp) {
  StaticJsonDocument<200> doc;

  doc["device_id"] = deviceId;
  doc["timestamp_ms"] = timestampMs;
  doc["air_temp_c"] = airTemp;
  doc["air_humidity_pct"] = airHum;
  doc["soil_moisture_pct"] = soilMoisture;
  doc["soil_temp_c"] = soilTemp;

  // Ensure buffer size is adequate for your JSON payload. 200 is often too small for 6 fields.
  // Using a larger buffer, or calculating size dynamically:
  // size_t jsonSize = measureJson(doc);
  // char jsonBuffer[jsonSize + 1]; // +1 for null terminator
  char jsonBuffer[512]; // Increased buffer size, adjust if needed

  serializeJson(doc, jsonBuffer);

  Serial.print("Pub to: "); Serial.println(AWS_IOT_PUBLISH_TOPIC); // Ensure AWS_IOT_PUBLISH_TOPIC is defined
  Serial.print("Payload: "); Serial.println(jsonBuffer);

  if (!client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer)) {
      Serial.println("Failed to publish MQTT message.");
  }
}

void awsLoop() {
  if (!client.connected()) {
    Serial.println("MQTT disconnected. Reconnecting...");
    // Call connectAWS, which now internally handles WiFi connection as well
    connectAWS();
  }
  client.loop();
}