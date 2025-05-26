// sensor_handler.cpp
#include "sensor_handler.h"
#include <Arduino.h> // Required for random() and analogRead()

void setupSensors() {
  // Seed the random number generator using an unpredictable source
  // analogRead(0) on unconnected pin provides fluctuating noise for good randomness.
  randomSeed(analogRead(0));
}

float readAirTemperature() {
  // Simulate air temperature in Celsius, e.g., 5.0 to 35.0 C
  return random(50, 351) / 10.0f; // random(50, 350) -> divide by 10.0f for one decimal place
}

float readAirHumidity() {
  // Simulate air humidity in percentage, e.g., 30.0% to 90.0%
  return random(300, 901) / 10.0f; // random(300, 900) -> divide by 10.0f
}

float readSoilMoisture() {
  // Simulate soil moisture as a percentage, e.g., 20% to 80%
  return random(20, 81)*1.0f; // Integer percentage
}

float readSoilTemperature() {
  // Simulate soil temperature in Celsius, e.g., 10.0 to 30.0 C
  return random(100, 301) / 10.0f; // random(100, 300) -> divide by 10.0f
}
