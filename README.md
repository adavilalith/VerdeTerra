<h1>🌱 VerdeTerra Sense: Real-time Environmental Monitor 🌡️💧</h1>

<p>Monitor your garden's vital signs with this comprehensive IoT solution powered by the cloud!</p>

Full-stack IoT solution monitoring soil/air moisture & temp. Uses ESP32, AWS IoT Core, SQS, DynamoDB, Lambda/API Gateway, and an <font color="#232F3E">**AWS Amplify**</font>-hosted web dashboard.

**View Website Demo Here**: [VerdeTerra Website Demo](https://main.d2w8447dose1m.amplifyapp.com/model)

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
|  (esp32)        |  (Publish)     |  (MQTT Topic)    | (Route to SQS) |                   |
+-----------------+                |                  |                +---------+---------+
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
                                                                       +-------------------+

```

**Explanation:**
* **IoT Things (ESP32):** Your ESP32 devices publish sensor data using MQTT.
* **AWS IoT Core:** Receives the MQTT messages on the `esp32/data/verde-terra/{device_id}` topic.
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
          | Fetch GET (Sensor Data Request with TimeBackMs)                
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
* **DynamoDB Table:** The Fetch Data Lambda queries this table to retrieve sensor data based on the specified time range.


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
      * **DynamoDB:** Create a table named `verde-terra-sensor-data` with:
          * **Partition Key:** `device_id` (String)
          * **Sort Key:** `timestamp_ms` (Number)
      * **AWS Lambda (`verde-terra-api-handler`):** Deploy the Python Lambda function (see backend/lambda/api directory). Ensure it has an IAM role with permissions to `dynamodb:Query` on your `verde-terra-api-handler` table.
      * **API Gateway:**
          * Create a new REST API.
          * Define a `/data` resource.
          * Create a `GET` method on `/data` and configure it with **Lambda Proxy Integration** pointing to your `verde-terra-api-handler` Lambda function.
          * **Enable CORS** on the `/data` resource (using the "Enable CORS" action in the API Gateway console).
      * *(Note: For a more automated setup, consider using Infrastructure as Code tools like AWS SAM or AWS CDK. You could also integrate Amplify CLI for backend management in a future iteration.)*

3.  **🌱 ESP32 Firmware:**

      * Develop your ESP32 firmware (see firmware/esp32 directory for examples or a starting point).
      * Ensure it reads data from your soil moisture and DHT sensors.
      * Configure the firmware to securely publish sensor readings in JSON format to a designated AWS IoT MQTT topic (e.g., `esp32/data/verde-terra/{device_id}`).
      * In the AWS IoT Core console, create an **IoT Rule** that listens to the topic your ESP32 publishes to (`SELECT * FROM 'esp32/data/verde-terra/{device_id}'`) and adds an action to send the message payload to your created SQS queue.

4.  **<font color="#007bff">Web Dashboard (Frontend) Deployment with Amplify Hosting:</font>:**

    * Navigate to the `verdeterra-dashboard/` directory.
    * **Configure Environment Variables in Amplify:**
        * **Do NOT** create a `.env` file in your repository for sensitive API endpoints. Instead, Amplify securely injects these during the build process.
        * Go to the [**AWS Amplify Console**](https://console.aws.amazon.com/amplify/home) for your application.
        * Navigate to **App settings** > **Environment variables**.
        * Add a new variable (e.g., `VITE_APP_API_GATEWAY_URL`) and set its value to the **Invoke URL** of your deployed `VerdeTerraSenseApi` `prod/data` endpoint.
        * *Vite expects environment variables to be prefixed with `VITE_` to be exposed to the client-side code.* Your code should access it like `process.env.VITE_APP_API_GATEWAY_URL`.
    * Commit your changes and push your `verdeterra-dashboard` code to your **main** branch (or your preferred deployment branch) on GitHub.
    * Go to the [**AWS Amplify Console**](https://console.aws.amazon.com/amplify/home), select **"Amplify Hosting,"** and click **"New app"** -> **"Host your web app."**
    * Choose **GitHub**, connect to your repository, and select the branch you want to deploy.
    * Amplify will automatically detect your frontend application (being a Vite app).
        * **Build Settings:** Amplify should auto-configure the build settings. If you need to manually confirm, ensure they are set to:
            * **Base directory:** `verdeterra-dashboard` (or the relative path from your repo root to your Vite project)
            * **Build command:** `npm run build` (or `yarn build`)
            * **Output directory:** `dist`
        * *You generally don't need to explicitly provide a `amplify.yml` file in your repository for a standard Vite app, as Amplify detects common frameworks.*
    * Click **"Save and deploy."** Your dashboard will be live at the provided Amplify URL.
      
5.  **Start Monitoring!** Access your deployed Amplify Hosting URL in your web browser to view your real-time environmental data.

## 🤝 <ins>**Contributing**</ins> 🤝


**Enjoy monitoring your green space with VerdeTerra Sense!** 🌱
