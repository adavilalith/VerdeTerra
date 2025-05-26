import React, { useState, useEffect, useMemo, useCallback } from 'react';

import './App.css';

import Header from './components/Header';

import Controls from './components/Controls';
import DataDisplay from './components/DataDisplay';

// --- Configuration ---
const API_GATEWAY_ENDPOINT = import.meta.env.VITE_API_GATEWAY_ENDPOINT;
const DUMMY_DEVICE_IDS = [
  'verde-terra-esp32-001',
  'verde-terra-esp32-002',
  'verde-terra-esp32-003',
];

export default function App() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(DUMMY_DEVICE_IDS[0]);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [days, setDays] = useState(1);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const [fetchTrigger, setFetchTrigger] = useState(0);

  const timeBackMs = useMemo(() => {
    const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
    return Math.max(1, totalMinutes) * 60 * 1000;
  }, [days, hours, minutes]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSensorData([]);

    try {
      const queryParams = new URLSearchParams({
        deviceId: selectedDeviceId,
        timeBackMs: String(timeBackMs)
      }).toString();

      const url = `${API_GATEWAY_ENDPOINT}/data?${queryParams}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      setSensorData(data["data"] || []);

    } catch (e) {
      console.error('Error fetching sensor data:', e);
      setError(`Failed to fetch data: ${e.message}. Please check your network or API Gateway.`);
    } finally {
      setLoading(false);
    }
  }, [selectedDeviceId, timeBackMs, fetchTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFetchDataClick = () => {
    setFetchTrigger(prev => prev + 1);
  };

  const handleRefreshClick = () => {
    setFetchTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-green-50 to-blue-100 font-inter text-gray-800">
      <div className="w-full h-full bg-white shadow-2xl overflow-hidden rounded-xl">
        <Header />
        <Controls
          selectedDeviceId={selectedDeviceId}
          setSelectedDeviceId={setSelectedDeviceId}
          days={days}
          setDays={setDays}
          hours={hours}
          setHours={setHours}
          minutes={minutes}
          setMinutes={setMinutes}
          handleFetchDataClick={handleFetchDataClick}
          handleRefreshClick={handleRefreshClick}
          loading={loading}
        />
        <DataDisplay
          loading={loading}
          error={error}
          sensorData={sensorData}
        />
      </div>
    </div>
  );
}
