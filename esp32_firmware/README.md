
# VerdeTerra Sense: ESP32 Sensor Node Firmware

## Overview

This directory contains the firmware that runs on your ESP32 development boards, transforming them into intelligent sensor nodes for the VerdeTerra Sense environmental monitoring system. This firmware is responsible for interfacing with connected sensors, reading environmental data, establishing a secure connection to AWS IoT Core, and publishing the collected data.

## Key Features

  * **Sensor Interfacing:** Reads data from common environmental sensors (e.g., soil moisture, air temperature, air humidity).
  * **Wi-Fi Connectivity:** Manages connection to your local Wi-Fi network.
  * **Secure AWS IoT Core Communication:** Establishes a secure MQTT connection to AWS IoT Core using client certificates and private keys.
  * **Data Publishing:** Publishes sensor readings to a designated AWS IoT MQTT topic in a structured JSON format.

## Folder Structure

```
esp32_firmware/
├── .gitignore
├── aws_handler.cpp
├── aws_handler.h
├── esp32_firmware.ino
├── sensor_handler.cpp
└── sensor_handler.h
```

### `esp32_firmware.ino`

  * This is the main Arduino sketch file (`.ino`) for the ESP32 firmware. It acts as the entry point, coordinating the initialization of Wi-Fi, sensor handlers, and AWS IoT communication. It typically contains the `setup()` and `loop()` functions.

### `aws_handler.cpp` / `aws_handler.h`

  * **Purpose:** These files encapsulate the logic for interacting with AWS IoT Core.
  * `aws_handler.h`: The header file, declaring functions and variables for AWS IoT connectivity (e.g., initializing MQTT client, connecting to broker, publishing messages).
  * `aws_handler.cpp`: The implementation file, containing the detailed C++ code for managing the MQTT connection, handling certificates, and sending sensor data to the specified AWS IoT topic (`verde-terra/pub`).

### `sensor_handler.cpp` / `sensor_handler.h`

  * **Purpose:** These files manage the interaction with the physical sensors attached to the ESP32.
  * `sensor_handler.h`: The header file, declaring functions for initializing sensors and reading various environmental parameters (e.g., `readSoilMoisture()`, `readAirTemperature()`, `readAirHumidity()`).
  * `sensor_handler.cpp`: The implementation file, containing the C++ code to communicate with sensor hardware (e.g., using I2C, analog reads) and return processed sensor values.

### `.gitignore`

  * Specifies intentionally untracked files that Git should ignore, such as compiled binaries, build artifacts, and importantly, local configuration files containing sensitive credentials (e.g., `secrets.h` if you create one).

## Configuration

Before compiling and flashing the firmware, you **must** configure your specific Wi-Fi credentials and AWS IoT Core connection details.

1.  **Create a `secrets.h` file:** For security best practices, create a new file named `secrets.h` (or similar) in the `esp32_firmware/` directory. **Do NOT commit this file to your Git repository.**

2.  **Add your credentials:** Populate `secrets.h` with your specific details:

    ```cpp
    #ifndef SECRETS_H
    #define SECRETS_H

    // Wi-Fi credentials
    const char* WIFI_SSID = "Your_WiFi_SSID";
    const char* WIFI_PASSWORD = "Your_WiFi_Password";

    // AWS IoT Core Endpoint (from AWS IoT console -> Settings)
    const char* AWS_IOT_ENDPOINT = "YOUR_AWS_IOT_ENDPOINT.iot.your-region.amazonaws.com";

    // AWS IoT Thing Name (must match your registered IoT Thing name, e.g., verdeTerra-ESP32-001)
    const char* THING_NAME = "verdeTerra-ESP32-001"; // Or whatever your Thing name is

    // AWS IoT Core Certificates (replace with YOUR certificate contents)
    // IMPORTANT: Ensure these are valid and correspond to your IoT Thing
    const char AWS_CERT_CA[] = R"EOF(
    -----BEGIN CERTIFICATE-----
    ... Your AWS Root CA Certificate (e.g., AmazonRootCA1.pem) ...
    -----END CERTIFICATE-----
    )EOF";

    const char AWS_CERT_CRT[] = R"EOF(
    -----BEGIN CERTIFICATE-----
    ... Your Thing Certificate (e.g., abcdefg12345-certificate.pem.crt) ...
    -----END CERTIFICATE-----
    )EOF";

    const char AWS_PRIVATE_KEY[] = R"EOF(
    -----BEGIN RSA PRIVATE KEY-----
    ... Your Thing Private Key (e.g., abcdefg12345-private.pem.key) ...
    -----END RSA PRIVATE KEY-----
    )EOF";

    #endif // SECRETS_H
    ```

3.  **Update `esp32_firmware.ino` (or `aws_handler.cpp`):** Ensure your main sketch or `aws_handler.cpp` includes `secrets.h` and uses these defined constants for Wi-Fi connection and AWS IoT setup.

## Build and Upload

This firmware can be compiled and uploaded using either the Arduino IDE or PlatformIO.

### Using Arduino IDE:

1.  Ensure you have the ESP32 boards manager installed.
2.  Open the `esp32_firmware.ino` file.
3.  Select your ESP32 board model and COM port from `Tools > Board` and `Tools > Port`.
4.  Click "Verify" to compile and "Upload" to flash the firmware to your board.

### Using PlatformIO (Recommended for VS Code):

1.  Open the `esp32_firmware/` folder in VS Code with the PlatformIO extension installed.
2.  Review `platformio.ini` (if present) for build configurations.
3.  Click the "Build" (check mark icon) and "Upload" (right arrow icon) buttons in the PlatformIO toolbar.

## AWS IoT Core Setup Reminder

Before flashing, ensure you have completed the following in your AWS account:

  * Registered your ESP32 as an **IoT Thing** (e.g., `verdeTerra-ESP32-001`).
  * Created an **IoT Policy** (e.g., `VerdeTerraSenseIoTThingPolicy`) that grants `iot:Connect` and `iot:Publish` permissions to your MQTT topic (`verde-terra/pub`).
  * Attached the policy to your Thing.
  * Downloaded the **Certificate, Private Key, and Root CA Certificate** for your Thing. These are the contents you'll paste into `secrets.h`.
  * Configured an **IoT Rule** that listens to the `verde-terra/pub` topic and forwards messages to your `VerdeTerraSenseDataQueue` (SQS).

## Troubleshooting

  * **Wi-Fi Connection Issues:**
      * Double-check `WIFI_SSID` and `WIFI_PASSWORD` in `secrets.h`.
      * Ensure your ESP32 is within range of your Wi-Fi router.
      * Monitor serial output for Wi-Fi connection errors.
  * **AWS IoT Core Connection Issues:**
      * Verify `AWS_IOT_ENDPOINT` is correct.
      * Ensure your certificates and private key in `secrets.h` are copied accurately and completely, including `BEGIN` and `END` lines.
      * Confirm your IoT Thing, Policy, and Certificate are correctly attached and active in the AWS IoT console.
      * Check AWS CloudWatch logs for IoT Core for connection failures or authorization errors.
  * **No Data in Dashboard:**
      * Use the AWS IoT Core MQTT Test Client to subscribe to your `verde-terra/pub` topic to see if the ESP32 is successfully publishing messages.
      * Check your ESP32 serial monitor for any errors during data publishing.
  * **Sensor Reading Issues:**
      * Verify sensor wiring is correct.
      * Ensure `sensor_handler.cpp` matches your specific sensor types and pin connections.

-----
