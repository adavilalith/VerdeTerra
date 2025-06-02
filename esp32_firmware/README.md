

# VerdeTerra Sense: ESP32 Sensor Node Firmware

## Overview

This directory contains the firmware that runs on your ESP32 development boards, transforming them into intelligent sensor nodes for the VerdeTerra Sense environmental monitoring system. This firmware is responsible for interfacing with connected sensors, reading environmental data, establishing a secure connection to AWS IoT Core, and publishing the collected data.

## Key Features

* **Sensor Interfacing:** Reads data from common environmental sensors (e.g., soil moisture, air temperature, air humidity).
* **Robust Wi-Fi Connectivity:** Manages connection to multiple configured Wi-Fi networks with a **fallback mechanism**. If one network fails, it attempts the next, and continuously retries the last configured network.
* **Secure AWS IoT Core Communication:** Establishes a secure MQTT connection to AWS IoT Core using client certificates and private keys.
* **Data Publishing:** Publishes sensor readings to a designated AWS IoT MQTT topic in a structured JSON format.

---

## Folder Structure

```
esp32_firmware/
├── .gitignore
├── aws_handler.cpp
├── aws_handler.h
├── esp32_firmware.ino
├── sensor_handler.cpp
├── sensor_handler.h
└── wifi_credentials_data.cpp 
```

### `esp32_firmware.ino`

* This is the main Arduino sketch file (`.ino`) for the ESP32 firmware. It acts as the entry point, coordinating the initialization of Wi-Fi, sensor handlers, and AWS IoT communication. It typically contains the `setup()` and `loop()` functions.

### `aws_handler.cpp` / `aws_handler.h`

* **Purpose:** These files encapsulate the logic for interacting with AWS IoT Core and now handle the **robust Wi-Fi connection logic**.
* `aws_handler.h`: The header file, declaring functions and variables for AWS IoT connectivity (e.g., initializing MQTT client, connecting to broker, publishing messages) and the `connectWiFi()` function.
* `aws_handler.cpp`: The implementation file, containing the detailed C++ code for managing the MQTT connection, handling certificates, and sending sensor data to the specified AWS IoT topic (`verde-terra/pub`). It now includes the **multi-network Wi-Fi connection attempts** before connecting to AWS.

### `sensor_handler.cpp` / `sensor_handler.h`

* **Purpose:** These files manage the interaction with the physical sensors attached to the ESP32.
* `sensor_handler.h`: The header file, declaring functions for initializing sensors and reading various environmental parameters (e.g., `readSoilMoisture()`, `readAirTemperature()`, `readAirHumidity()`).
* `sensor_handler.cpp`: The implementation file, containing the C++ code to communicate with sensor hardware (e.g., using DHT library for temperature/humidity) and return processed sensor values. **Note:** Ensure your DHT sensor is wired to the correct GPIO pin (e.g., **GPIO16**), understanding its potential conflict with camera PSRAM for high resolutions.

### `wifi_credentials_data.cpp`

* **Purpose:** This is a **new file** specifically for holding your **Wi-Fi network SSIDs and passwords**. This separates sensitive data from declarations, preventing "multiple definition" errors when compiling.
* This file contains the actual array definitions of `WIFI_SSIDS`, `WIFI_PASSWORDS`, and `NUM_WIFI_NETWORKS`.

### `.gitignore`

* Specifies intentionally untracked files that Git should ignore, such as compiled binaries, build artifacts, and importantly, local configuration files containing sensitive credentials (e.g., `secrets.h`).

---

## Configuration

Before compiling and flashing the firmware, you **must** configure your specific Wi-Fi credentials and AWS IoT Core connection details.

1.  **Create/Modify `secrets.h` file:** For security best practices and proper compilation, `secrets.h` will now contain **declarations** for your Wi-Fi credentials and definitions for AWS details. **Do NOT commit this file to your Git repository.**

2.  **Modify `secrets.h`:** Populate `secrets.h` with your specific details. For Wi-Fi, use `extern` declarations:

    ```cpp
    #ifndef SECRETS_H
    #define SECRETS_H

    #pragma once // Ensures this header is included only once per compilation unit

    // Wi-Fi credentials (declarations only - definitions are in wifi_credentials_data.cpp)
    extern const char* WIFI_SSIDS[];
    extern const char* WIFI_PASSWORDS[];
    extern const int NUM_WIFI_NETWORKS;

    // AWS IoT Core Endpoint (from AWS IoT console -> Settings)
    const char AWS_IOT_ENDPOINT[] = "YOUR_AWS_IOT_ENDPOINT.iot.your-region.amazonaws.com";

    // AWS IoT Thing Name (must match your registered IoT Thing name, e.g., verdeTerra-ESP32-001)
    #define THINGNAME "esp32" // Or whatever your Thing name is from the IoT console

    // AWS IoT Core Certificates (replace with YOUR certificate contents)
    // IMPORTANT: Ensure these are valid and correspond to your IoT Thing
    static const char AWS_CERT_CA[] PROGMEM = R"EOF(
    -----BEGIN CERTIFICATE-----
    ... Your AWS Root CA Certificate (e.g., AmazonRootCA1.pem) ...
    -----END CERTIFICATE-----
    )EOF";

    static const char AWS_CERT_CRT[] PROGMEM = R"EOF(
    -----BEGIN CERTIFICATE-----
    ... Your Thing Certificate (e.g., abcdefg12345-certificate.pem.crt) ...
    -----END CERTIFICATE-----
    )EOF";

    static const char AWS_CERT_PRIVATE[] PROGMEM = R"KEY(
    -----BEGIN RSA PRIVATE KEY-----
    ... Your Thing Private Key (e.g., abcdefg12345-private.pem.key) ...
    -----END RSA PRIVATE KEY-----
    )KEY";

    #endif // SECRETS_H
    ```

3.  **Create/Modify `wifi_credentials_data.cpp`:** Create this new file in the same directory as your `.ino` sketch. This file will contain the actual Wi-Fi credentials. **Do NOT commit this file to your Git repository.**

    ```cpp
    // wifi_credentials_data.cpp
    // This file contains the actual definitions of your WiFi credentials.
    // It should be compiled only once.
    #include "secrets.h" // Include the header to ensure consistency with the extern declarations

    // --- ACTUAL DEFINITIONS HERE (AND ONLY HERE!) ---
    const char* WIFI_SSIDS[] = {
      "Your_WiFi_SSID_1",      // Your primary Wi-Fi network
      "Your_WiFi_SSID_2",      // A backup Wi-Fi network (e.g., mobile hotspot)
      "Your_WiFi_SSID_3",      // Another backup network
      // Add more SSIDs as needed
    };

    const char* WIFI_PASSWORDS[] = {
      "Your_WiFi_Password_1",  // Password for SSID_1
      "Your_WiFi_Password_2",  // Password for SSID_2
      "Your_WiFi_Password_3",  // Password for SSID_3
      // Add more passwords, ensuring order matches SSIDs
    };

    // Calculate the number of WiFi networks based on the array size
    const int NUM_WIFI_NETWORKS = sizeof(WIFI_SSIDS) / sizeof(WIFI_SSIDS[0]);
    // --- END ACTUAL DEFINITIONS ---
    ```

4.  **Update `esp32_firmware.ino` (or `aws_handler.cpp`):** Ensure your main sketch or `aws_handler.cpp` includes `secrets.h` and uses these defined constants for Wi-Fi connection and AWS IoT setup. The `connectAWS()` function now intelligently handles Wi-Fi connection and fallback.

---

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

---

## AWS IoT Core Setup Reminder

Before flashing, ensure you have completed the following in your AWS account:

* Registered your ESP32 as an **IoT Thing** (e.g., `verdeTerra-ESP32-001`).
* Created an **IoT Policy** (e.g., `VerdeTerraSenseIoTThingPolicy`) that grants `iot:Connect` and `iot:Publish` permissions to your MQTT topic (`verde-terra/pub`).
* Attached the policy to your Thing.
* Downloaded the **Certificate, Private Key, and Root CA Certificate** for your Thing. These are the contents you'll paste into `secrets.h`.
* Configured an **IoT Rule** that listens to the `verde-terra/pub` topic and forwards messages to your `VerdeTerraSenseDataQueue` (SQS).

---

## Troubleshooting

* **Wi-Fi Connection Issues:**
    * Double-check `WIFI_SSIDS` and `WIFI_PASSWORDS` in `wifi_credentials_data.cpp`.
    * Ensure your ESP32 is within range of your Wi-Fi router.
    * Monitor serial output for Wi-Fi connection errors and watch for the `connectWiFi()` function iterating through networks.
* **AWS IoT Core Connection Issues:**
    * Verify `AWS_IOT_ENDPOINT` is correct in `secrets.h`.
    * Ensure your certificates and private key in `secrets.h` are copied accurately and completely, including `BEGIN` and `END` lines.
    * Confirm your IoT Thing, Policy, and Certificate are correctly attached and active in the AWS IoT console.
    * Check AWS CloudWatch logs for IoT Core for connection failures or authorization errors.
* **No Data in Dashboard:**
    * Use the AWS IoT Core MQTT Test Client to subscribe to your `verde-terra/pub` topic to see if the ESP32 is successfully publishing messages.
    * Check your ESP32 serial monitor for any errors during data publishing.
* **Sensor Reading Issues:**
    * Verify sensor wiring is correct. Remember to add a **10K Ohm pull-up resistor** to the DHT22 data line if your breakout board doesn't have one.
    * Ensure `sensor_handler.cpp` matches your specific sensor types and pin connections.

