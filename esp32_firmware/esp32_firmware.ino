// esp32_firmware.ino
#include <Arduino.h>
#include "secrets.h"
#include "aws_handler.h"
#include "sensor_handler.h"

#ifndef LED_BUILTIN
#define LED_BUILTIN 2
#endif

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(2000);
  digitalWrite(LED_BUILTIN, LOW);

  connectAWS();
  setupSensors(); 
}

void loop() {
  awsLoop();

  if (client.connected()) {
    // Read simulated sensor data
    float airTemp = readAirTemperature();
    float airHum = readAirHumidity();
    float soilMoisture = readSoilMoisture();
    float soilTemp = readSoilTemperature();

    unsigned long long currentTimestampMs = (unsigned long long)timeClient.getEpochTime() * 1000ULL;
    printf("%f\n%f\n%f\n%f\n\n",airTemp,airHum,soilMoisture,soilTemp);
    publishMessage(THINGNAME, currentTimestampMs, airTemp, airHum, soilMoisture, soilTemp);
  } else {
    Serial.println("Not connected. Skipping publish.");
  }

  delay(3000);
}