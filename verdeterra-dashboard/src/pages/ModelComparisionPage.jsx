import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import DualLineSensorChart from "../components/DualLineSensorChart";

const dummyData = [
    {"device_id": "verde-terra-esp32-001", "timestamp_ms": 1747872000000, "timestamp_formatted": "2025-05-22", "air_temp_c": 27.41, "air_humidity_pct": 65.22, "soil_moisture_pct": 50.33, "soil_temp_c": 22.54},
    {"device_id": "verde-terra-esp32-001", "timestamp_ms": 1747958400000, "timestamp_formatted": "2025-05-23", "air_temp_c": 27.46, "air_humidity_pct": 64.86, "soil_moisture_pct": 50.0, "soil_temp_c": 22.37},
    {"device_id": "verde-terra-esp32-001", "timestamp_ms": 1748044800000, "timestamp_formatted": "2025-05-24", "air_temp_c": 27.38, "air_humidity_pct": 64.71, "soil_moisture_pct": 49.83, "soil_temp_c": 22.49},
    {"device_id": "verde-terra-esp32-001", "timestamp_ms": 1748131200000, "timestamp_formatted": "2025-05-25", "air_temp_c": 27.52, "air_humidity_pct": 65.26, "soil_moisture_pct": 50.11, "soil_temp_c": 22.45},
    {"device_id": "verde-terra-esp32-001", "timestamp_ms": 1748217600000, "timestamp_formatted": "2025-05-26", "air_temp_c": 27.49, "air_humidity_pct": 65.39, "soil_moisture_pct": 49.84, "soil_temp_c": 22.55},
    {"device_id": "verde-terra-esp32-001", "timestamp_ms": 1748822400000, "timestamp_formatted": "2025-06-02", "air_temp_c": 29.56, "air_humidity_pct": 67.71, "soil_moisture_pct": 50.02, "soil_temp_c": 19.92},
    {"device_id": "verde-terra-esp32-001", "timestamp_ms": 1748908800000, "timestamp_formatted": "2025-06-03", "air_temp_c": 30.05, "air_humidity_pct": 71.27, "soil_moisture_pct": 49.43, "soil_temp_c": 20.08}
];

const dummyData1 = dummyData.map(item => ({
    ...item,
    air_humidity_pct: item.air_humidity_pct + (Math.random() * 5 - 2.5), 
    air_temp_c: item.air_temp_c + (Math.random() * 3  -1.5),
    soil_moisture_pct: item.soil_moisture_pct + (Math.random() * 5 - 2.5),
    soil_temp_c: item.soil_temp_c + (Math.random() * 2 - 1)
}));

// Simulated fetch function
async function fetchModelComparisonData() {
    await new Promise(res => setTimeout(res, 500));
    return {
        dummyData,
        dummyData1
    };
}

export default function ModelComparisionPage() {
    const [data, setData] = useState({ dummyData: [], dummyData1: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModelComparisonData().then(res => {
            setData(res);
            setLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen min-w-screen bg-gradient-to-br from-green-50 to-blue-100 font-inter text-gray-800">
            <div className="w-full h-full bg-white shadow-2xl overflow-hidden "></div>
            <Header/>
            <h1 className="text-center text-gray-600">Model Comparision </h1>
            <p className="text-center text-gray-600 mt-4">This page compares LSTM model trained of timeseries data from the sensors to the actual values.</p>
            {loading ? (
                <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading model predictions and sensor data...</p>
      </div>
            ) : (
                <DualLineSensorChart
                    title="Model vs Actual Values"
                    data1={data.dummyData}
                    name1="Actual Values"
                    dataKey1="air_temp_c"
                    strokeColor1="#8884d8"
                    data2={data.dummyData1}
                    dataKey2="air_temp_c"
                    name2="Model Predictions"
                    strokeColor2="#82ca9d"
                    yAxisDomain={[20, 40]}
                />
            )}
        </div>
    );
}