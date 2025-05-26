
# VerdeTerra Sense: AWS Backend Configuration & Lambda Code

## Overview

This `aws-backend/` directory serves as the central repository for the configuration definitions and Lambda function code that power the serverless backend of the VerdeTerra Sense agricultural monitoring system. While the actual AWS services are deployed and managed within the AWS Console or via AWS CLI/SDK, this folder provides the foundational blueprints and executable code for those services.

The backend is crucial for two main operations:

1.  **Data Ingestion:** Securely ingests sensor data from **VerdeTerra-ESP32** devices, buffers it for reliability, and stores it in a persistent database.
2.  **Data Query:** Exposes a REST API for the **VerdeTerra Dashboard** to retrieve and visualize historical and real-time sensor data.

## Folder Structure and Components

```
aws-backend/
├── dynamodb/
│   └── sensor_data_table_schema.json
├── iot_core/
│   ├── device_iot_policy.json
│   └── iot_rule_config.json
├── lambda/
│   ├── data_api_handler/
│   │   ├── events/
│   │   │   └── 2minAggregation_test_event.json
│   │   ├── lambda_function.py
│   │   └── requirements.txt
│   └── data_ingester_lambda/
│       ├── events/
│       │   └── sqs_test_event.json
│       ├── lambda_function.py
│       └── requirements.txt
└── sqs/
    └── sensor_data_queue_config.json
```

### `dynamodb/`

This directory contains the schema definition for your Amazon DynamoDB table.

  * `sensor_data_table_schema.json`: Defines the structure, primary key, and potentially secondary indexes for the `VerdeTerraSenseMetricsTable`. This JSON file would be used when creating or updating the DynamoDB table in AWS.
      * **Table Name:** `VerdeTerraSenseMetricsTable`
      * **Partition Key:** `device_id` (String)
      * **Sort Key:** `timestamp_ms` (Number)

### `iot_core/`

This directory holds configuration files related to AWS IoT Core, managing device connectivity and message routing.

  * `device_iot_policy.json`: Defines the IAM policy that grants permissions to your **VerdeTerra-ESP32** IoT Things. This policy specifies what actions (e.g., `iot:Connect`, `iot:Publish`) the devices are allowed to perform on specific MQTT topics.
  * `iot_rule_config.json`: Contains the configuration for the **`VerdeTerraSenseIngestionRule`**. This JSON defines the SQL query that filters incoming MQTT messages (e.g., `SELECT * FROM 'verde-terra/pub'`) and the action to route these messages to the `VerdeTerraSenseDataQueue` (SQS).

### `lambda/`

This directory contains the source code and dependencies for your AWS Lambda functions. Each subdirectory represents a distinct Lambda function.

  * #### `data_api_handler/`

      * **Corresponds to:** `VerdeTerraSenseQueryLambda`
      * **Purpose:** This Lambda function is invoked by the `VerdeTerraSenseApi` (API Gateway) to handle requests from the frontend dashboard. It's responsible for querying the `VerdeTerraSenseMetricsTable` in DynamoDB based on parameters received in the HTTP request (e.g., `device_id`, time range) and returning the relevant sensor data.
      * `lambda_function.py`: The main Python code for the `VerdeTerraSenseQueryLambda`.
      * `requirements.txt`: Lists the Python packages required by this Lambda function (e.g., `boto3` for AWS SDK).
      * `events/2minAggregation_test_event.json`: A sample JSON event payload that can be used to test the `lambda_function.py` locally or within the AWS Lambda console, simulating an API Gateway invocation.

  * #### `data_ingester_lambda/`

      * **Corresponds to:** `VerdeTerraSenseIngestionLambda`
      * **Purpose:** This Lambda function is triggered by messages arriving in the `VerdeTerraSenseDataQueue` (SQS). Its primary role is to process the raw sensor data payloads received from SQS, perform any necessary data validation or transformation, and then persist this processed data into the `VerdeTerraSenseMetricsTable` in DynamoDB.
      * `lambda_function.py`: The main Python code for the `VerdeTerraSenseIngestionLambda`.
      * `requirements.txt`: Lists the Python packages required by this Lambda function.
      * `events/sqs_test_event.json`: A sample JSON event payload for testing the `lambda_function.py` locally or in the AWS Lambda console, simulating an SQS message.

### `sqs/`

This directory holds the configuration for your Amazon SQS queue.

  * `sensor_data_queue_config.json`: Defines the properties of your `VerdeTerraSenseDataQueue`, such as its type (Standard), visibility timeout, and any other queue-specific settings.

    ---

    # 🌿 VerdeTerra Lambda Functions

    This repository contains the AWS Lambda functions powering the backend of the **VerdeTerra Garden Monitoring System**. These functions handle real-time ingestion and retrieval of sensor data, and expose it through an API for the web dashboard.

    ---

    ## Overview

    The system currently includes two primary Lambda functions:

    ---

    ## 1. `writeFromSQSToTimestream.py` — Data Ingester / SQS Consumer

    **Purpose:**
    Consumes sensor data from an **AWS SQS** queue and writes it to **DynamoDB**. It acts as a buffer between incoming data (from ESP32 devices via IoT Core) and persistent storage.

    **⚙️ Current Status:**

    * Fully operational and integrated with AWS services
    * ESP32 devices are currently publishing **dummy sensor data** (for testing purposes) to the SQS queue
    * Ready for transition to real sensor values when available

    **Trigger:**
    Automatically invoked by AWS SQS when new messages arrive (e.g., in `verde-terra-sensor-data-queue`)

    **Input:**
    SQS event containing JSON-formatted sensor data, such as:

    ```json
    {
    "soil_moisture": 38,
    "air_temp": 27.5,
    "timestamp": "2025-05-26T10:00:00Z",
    "device_id": "esp32-garden-01"
    }
    ```

    **Output:**
    Writes the parsed data into the configured **DynamoDB** table.

    **Runtime:**
    Python 3.13

    **🔧 Environment Variables:**

    * `DYNAMODB_TABLE_NAME`: Name of the DynamoDB table
    <br>

    ---

    ## 2. `esp32_data_handler.py` — API Handler

    ** Purpose:**
    Serves as the backend API for the VerdeTerra web dashboard. It responds to HTTP requests by querying **DynamoDB** for sensor data and returning the results.

    **⚙️ current Status:**

    * Actively serving real-time data from DynamoDB
    * Works seamlessly with incoming sensor data (currently dummy, but flowing through the actual pipeline)

    ** Trigger:**
    Invoked by **API Gateway** on HTTP requests (e.g., `/data`, `/latest`)

    **Input:**
    HTTP GET requests with query parameters like `device_id`, `start_time`, or `end_time`

    **Output:**
    Returns sensor data in JSON format:

    ```json
          {
            "device_id": "verde-terra-esp32-001",
            "timestamp_ms": 1748264880000,
            "timestamp_formatted": "13:08",
            "air_temp_c": 27.6,
            "air_humidity_pct": 58.05,
            "soil_moisture_pct": 51.45,
            "soil_temp_c": 21.85
          },
          {
            "device_id": "verde-terra-esp32-001",
            "timestamp_ms": 1748265000000,
            "timestamp_formatted": "13:10",
            "air_temp_c": 29.08,
            "air_humidity_pct": 53.86,
            "soil_moisture_pct": 54.94,
            "soil_temp_c": 23.02
          },
          // ... more data points ...
          {
            "device_id": "verde-terra-esp32-001",
            "timestamp_ms": 1748275680000,
            "timestamp_formatted": "16:08",
            "air_temp_c": 30.22,
            "air_humidity_pct": 67.78,
            "soil_moisture_pct": 25.8,
            "soil_temp_c": 22.05
          }
    ```

    ** Runtime:**
    Python 3.13

    **🔧 Environment Variables:**

    * `DYNAMODB_TABLE_NAME`: Name of the DynamoDB table to query 
    <br>

    ---
