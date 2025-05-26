
# VerdeTerra Sense: Web Dashboard

## Overview

This directory contains the source code for the **VerdeTerra Sense Web Dashboard**, a user-friendly frontend application designed to visualize environmental data collected by your ESP32 sensor nodes. Built with **Vite** and **React**, this dashboard connects to the AWS backend to fetch and display real-time and historical data, giving you actionable insights into your garden's health.

## ✨ Key Features ✨

  * **Real-time Data Visualization:** Displays current sensor readings (air temperature, air humidity, soil moisture, soil temperature).
  * **Historical Data Charts:** Presents sensor data over time using intuitive charts.
  * **Responsive Design:** Optimized for viewing on various devices.
  * **Intuitive User Interface:** Easy to navigate and understand your environmental metrics.

## 🚀 Technologies Used 🚀

  * **Vite:** A fast and opinionated build tool for modern web projects.
  * **React:** A declarative, efficient, and flexible JavaScript library for building user interfaces.
  * **JavaScript (ES6+)**
  * **CSS**
  * *(Potentially charting libraries like Chart.js, Recharts, or ApexCharts)*

## Folder Structure

```
verdeterra-dashboard/
├── public/                    # Static assets (e.g., favicon.png, other static files)
├── src/
│   ├── assets/                # Images, icons, or other static files used by components
│   ├── components/            # Reusable React components (e.g., Header, SensorChart)
│   ├── App.css                # Application-wide styles
│   ├── App.jsx                # Main application component
│   ├── index.css              # Global styles
│   └── main.jsx               # Entry point for the React application
├── .gitignore                 # Files and directories to be ignored by Git
├── eslint.config.js           # Configuration for ESLint (code linting)
├── index.html                 # The main HTML file for the application
├── package-lock.json          # Records exact dependency versions
├── package.json               # Project metadata and dependencies
└── vite.config.js             # Vite-specific configuration
```

## 🛠️ Local Development 🛠️

To get the dashboard running on your local machine:

1.  **Navigate to the dashboard directory:**

    ```bash
    cd verdeterra-dashboard/
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or if you use yarn:
    # yarn install
    ```

3.  **Configure API Endpoint:**
    This application fetches data from your deployed AWS API Gateway. You'll need to set the API Gateway Invoke URL as an environment variable. When running locally, you can create a `.env` file in the `verdeterra-dashboard/` root.

    Create a file named `.env` and add your API Gateway URL:

    ```
    VITE_APP_API_GATEWAY_URL="YOUR_API_GATEWAY_INVOKE_URL_HERE"
    ```

    **Important:** Do **NOT** commit this `.env` file to Git, as it might contain sensitive information. It's already in `.gitignore`.

4.  **Start the development server:**

    ```bash
    npm run dev
    # or if you use yarn:
    # yarn dev
    ```

    This will start the Vite development server, usually on `http://localhost:5173` (or another available port). The console will tell you the exact URL.

## ☁️ Deployment ☁️

This dashboard is designed to be deployed using AWS Amplify Hosting for continuous integration and global content delivery.

For detailed deployment instructions, including how to set up environment variables securely within AWS Amplify, please refer to the main project's [suspicious link removed] in the root directory.

-----
