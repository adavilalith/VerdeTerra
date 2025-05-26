



<h1>🌱 VerdeTerra Sense: Real-time Environmental Monitor 🌡️💧</h1>

<p>Monitor your garden's vital signs with this comprehensive IoT solution powered by the cloud!</p>


<ins>**Short Description**</ins>

Full-stack IoT solution monitoring soil/air moisture & temp. Uses ESP32, AWS IoT Core, SQS, DynamoDB, Lambda/API Gateway, and an <font color="#232F3E">**AWS Amplify**</font>-hosted web dashboard.

## ✨**Key Features** ✨

  * **<font color="green">Real-time Environmental Data</font>:** Track soil moisture 💧, air humidity ☁️, and temperature 🔥.
  * **<font color="orange">ESP32-Powered Sensor Node</font>:** Low-power, efficient data collection from your plants.
  * **<font color="#4A148C">Scalable AWS Serverless Backend</font>:** Built with the power of AWS:
      * **<font color="#F9AA33">AWS IoT Core</font>**: Securely ingests device data.
      * **<font color="#F9AA33">Amazon SQS</font>**: Reliable message queuing.
      * **<font color="#F9AA33">Amazon DynamoDB</font>**: High-performance NoSQL data storage.
      * **<font color="#F9AA33">AWS Lambda & API Gateway</font>**: Serverless backend logic and API endpoint.
  * **<font color="#007bff">Interactive Web Dashboard</font>:** Visualize your garden's health with insightful charts and gauges.
  * **<font color="#232F3E">Automated CI/CD with Amplify Hosting</font>:** Effortless deployment and updates for the web frontend.

## AWS IoT Sensor Data Architecture

---

### 1. Data Ingestion Flow

This diagram illustrates how sensor data is published from ESP32 devices and stored in a DynamoDB table.

```
+----------------------------------------------------------------------------------+
|                              DATA INGESTION FLOW                                 |
+----------------------------------------------------------------------------------+
                                                                                  
+-----------------+    MQTT        +------------------+    IoT Rule    +-------------------+
|  IoT Things     |--------------> |   AWS IoT Core   |--------------->|    SQS Queue      |
|  (ESP32)        |  (Publish)     |  (Topic:         | (Route to SQS) |                   |
+-----------------+                |   esp32/pub)     |                +---------+---------+
                                   +------------------+                          |
                                                                                 | Trigger
                                                                                 v
                                                                       +-------------------+
                                                                       |   Lambda Function |
                                                                       |   (Ingestion)     |
                                                                       +---------+---------+
                                                                                 |
                                                                                 | Write Data
                                                                                 v
                                                                       +-------------------+
                                                                       |   DynamoDB Table  |
                                                                       | (esp32_metrics)   |
                                                                       +-------------------+
```

**Explanation:**
* **IoT Things (ESP32):** Your ESP32 devices publish sensor data using MQTT.
* **AWS IoT Core:** Receives the MQTT messages on the `esp32/pub` topic.
* **IoT Rule:** A message routing rule processes incoming messages, forwarding them to an SQS queue.
* **SQS Queue:** Temporarily stores the incoming sensor data messages.
* **Lambda Function (Ingestion):** Triggered by new messages in the SQS queue, this function processes the data.
* **DynamoDB Table (esp32_metrics):** The Lambda function writes the processed sensor data into this NoSQL database table for storage.

---

### 2. Dashboard Access Flow

This diagram details how users access the web dashboard and retrieve sensor data for visualization.

```
+----------------------------------------------------------------------------------+
|                              DASHBOARD ACCESS FLOW                               |
+----------------------------------------------------------------------------------+
                                                                                  
+-----------------+                                                               
|  User / Browser |                                                               
+-----------------+                                                               
         |                                                                        
         | HTTPS GET (Initial Page Load: HTML, JS, CSS)                           
         v                                                                        
+-------------------+                                                             
|   AWS Amplify     |                                                             
|   (Web App Host)  |                                                             
+---------+---------+                                                             
          |                                                                       
          | HTTPS / AJAX GET (Sensor Data Request with Time Range)                
          | (Initiated by JavaScript in browser)                                  
          v                                                                       
+-------------------+                                                             
|    API Gateway    |                                                             
|   (/data GET)     |                                                             
+---------+---------+                                                             
          |                                                                       
          | Invocation                                                            
          v                                                                       
+-------------------+                                                             
|   Lambda Function |                                                             
|   (Fetch Data)    |                                                             
+---------+---------+                                                             
          |                                                                       
          | Query Data (Time Range)                                               
          v                                                                       
+-------------------+                                                             
|   DynamoDB Table  |                                                             
| (esp32_metrics)   |                                                             
+-------------------+                                                             
```

**Explanation:**
* **User / Browser:** The end-user's web browser.
* **AWS Amplify (Web App Host):**
    * Serves the static files (HTML, JavaScript, CSS) for the web dashboard upon the **initial HTTPS GET request** from the user's browser.
* **API Gateway:**
    * Once the web application loads in the browser, subsequent requests for dynamic data (like fetching sensor metrics) are made directly to this API Gateway.
    * It exposes a `/data` GET HTTP endpoint.
* **Lambda Function (Fetch Data):** Triggered by the API Gateway endpoint, this function retrieves data.
* **DynamoDB Table (esp32_metrics):** The Fetch Data Lambda queries this table to retrieve sensor data based on the specified time range.


## 🚀 <ins>**Getting Started**</ins> 🚀

Follow these steps to get your own VerdeTerra Sense system running:

### ✅ Prerequisites

  * An <font color="#F9AA33">AWS Account</font> with appropriate permissions.
  * A <font color="black">GitHub Account</font>.
  * An <font color="orange">ESP32 Development Board</font>.
  * Sensors: Soil moisture sensor, DHT11/DHT22 (temp/humidity).
  * <font color="green">PlatformIO</font> or <font color="green">Arduino IDE</font> for ESP32 firmware.
  * <font color="blue">Node.js</font> and <font color="blue">npm</font> or <font color="blue">yarn</font> installed.
  * <font color="#F9AA33">AWS CLI</font> configured.
  * <font color="#232F3E">Amplify CLI</font> installed globally (`npm install -g @aws-amplify/cli`).

### 🛠️ Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **AWS Backend Deployment:**

      * **AWS IoT Core:** Register your ESP32 as a Thing, create a security Policy, and attach it to the Thing.
      * **SQS:** Create a Standard SQS Queue in your AWS console.
      * **DynamoDB:** Create a table named `esp32_metrics` with:
          * **Partition Key:** `device_id` (String)
          * **Sort Key:** `timestamp_ms` (Number)
      * **AWS Lambda (`esp32-data-api-handler`):** Deploy the Python Lambda function (see backend/lambda/api directory). Ensure it has an IAM role with permissions to `dynamodb:Query` on your `esp32-sensor-data` table.
      * **API Gateway:**
          * Create a new REST API.
          * Define a `/data` resource.
          * Create a `GET` method on `/data` and configure it with **Lambda Proxy Integration** pointing to your `esp32-data-api-handler` Lambda function.
          * **Enable CORS** on the `/data` resource (using the "Enable CORS" action in the API Gateway console).
      * *(Note: For a more automated setup, consider using Infrastructure as Code tools like AWS SAM or AWS CDK. You could also integrate Amplify CLI for backend management in a future iteration.)*

3.  **🌱 ESP32 Firmware:**

      * Develop your ESP32 firmware (see firmware/esp32 directory for examples or a starting point).
      * Ensure it reads data from your soil moisture and DHT sensors.
      * Configure the firmware to securely publish sensor readings in JSON format to a designated AWS IoT MQTT topic (e.g., `esp32/pub`).
      * In the AWS IoT Core console, create an **IoT Rule** that listens to the topic your ESP32 publishes to (`SELECT * FROM 'esp32/pub'`) and adds an action to send the message payload to your created SQS queue.

4.  **<font color="#007bff">Web Dashboard (Frontend) Deployment with Amplify Hosting</font>:**

      * Navigate to the `frontend` directory: `cd frontend`
      * Open `script.js` and **replace the placeholder `API_GATEWAY_URL`** with the **Invoke URL** of your deployed API Gateway `prod/data` endpoint.
      * Commit your changes and push your `frontend` code to your **main** branch (or your preferred deployment branch) on GitHub.
      * Go to the [**AWS Amplify Console**](https://console.aws.amazon.com/amplify/home), select **"Amplify Hosting,"** and click **"New app"** -> **"Host your web app."**
      * Choose **GitHub**, connect to your repository, and select the branch you want to deploy.
      * Amplify will automatically detect the frontend application. Review the build settings and click **"Save and deploy."** Your dashboard will be live at the provided Amplify URL.

5.  **Start Monitoring!** Access your deployed Amplify Hosting URL in your web browser to view your real-time environmental data.

## 🤝 <ins>**Contributing**</ins> 🤝

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

**Enjoy monitoring your green space with VerdeTerra Sense!** 🌱
