// sensor_handler.h
#ifndef SENSOR_HANDLER_H
#define SENSOR_HANDLER_H

void setupSensors(); // Initializes random seed for sensor simulation

float readAirTemperature();
float readAirHumidity();
float readSoilMoisture(); 
float readSoilTemperature();

#endif // SENSOR_HANDLER_H