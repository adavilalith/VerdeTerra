// aws_handler.h
#ifndef AWS_HANDLER_H
#define AWS_HANDLER_H

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>

extern WiFiClientSecure net;
extern PubSubClient client;
extern NTPClient timeClient;

#define AWS_IOT_PUBLISH_TOPIC   "esp32/data/verde-terra/" THINGNAME
#define AWS_IOT_SUBSCRIBE_TOPIC "esp32/commands/verde-terra/" THINGNAME

void setupTimeClient();
void connectAWS();
void messageHandler(char* topic, byte* payload, unsigned int length);
void publishMessage(const char* deviceId, unsigned long long timestampMs,
                    float airTemp, float airHum, float soilMoisture, float soilTemp);
void awsLoop();

#endif 