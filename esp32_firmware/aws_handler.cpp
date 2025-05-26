// aws_handler.cpp
#include "aws_handler.h"
#include "secrets.h"
#include "WiFi.h"
#include <Arduino.h>

WiFiClientSecure net;
PubSubClient client(net);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000);

void setupTimeClient() {
  timeClient.begin();
  Serial.print("Syncing time");
  while(!timeClient.update()) {
    timeClient.forceUpdate();
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nTime synced!");
}

void connectAWS() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_PRIVATE_KEY);
  client.setServer(AWS_IOT_ENDPOINT, 8883);
  client.setCallback(messageHandler);

  setupTimeClient();

  Serial.print("Connecting AWS IoT");
  while (!client.connect(THINGNAME)) {
    Serial.print(".");
    delay(100);
  }
  if (!client.connected()) {
    Serial.println("\nAWS IoT Timeout/Failed!");
    return;
  }
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
  Serial.println("\nAWS IoT Connected!");
}

void messageHandler(char* topic, byte* payload, unsigned int length) {
  Serial.print("RX: ");
  Serial.println(topic);
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload, length);
  if (doc.containsKey("message")) {
    Serial.println((const char*)doc["message"]);
  } else {
    for (unsigned int i = 0; i < length; i++) Serial.print((char)payload[i]);
    Serial.println();
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

  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  Serial.print("Pub to: "); Serial.println(AWS_IOT_PUBLISH_TOPIC);
  Serial.print("Payload: "); Serial.println(jsonBuffer);

  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}

void awsLoop() {
  if (!client.connected()) {
    Serial.println("MQTT disconnected. Reconnecting...");
    connectAWS();
  }
  client.loop();
}