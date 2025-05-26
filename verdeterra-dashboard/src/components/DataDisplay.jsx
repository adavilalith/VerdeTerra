import SensorChart from './SensorChart';


// --- DataDisplay Component ---
const DataDisplay = ({ loading, error, sensorData }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading sensor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (sensorData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p className="text-lg">No data available for the selected device and time range.</p>
        <p className="text-sm mt-2">Ensure your ESP32 is publishing, IoT Rule is active, and Lambda is ingesting data to DynamoDB.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SensorChart
        title="Air Temperature (°C)"
        data={sensorData}
        dataKey="air_temp_c"
        name="Air Temp"
        strokeColor="#8884d8"
        yAxisDomain={['auto', 'auto']}
      />
      <SensorChart
        title="Air Humidity (%)"
        data={sensorData}
        dataKey="air_humidity_pct"
        name="Air Humidity"
        strokeColor="#82ca9d"
        yAxisDomain={[0, 100]}
      />
      <SensorChart
        title="Soil Moisture (%)"
        data={sensorData}
        dataKey="soil_moisture_pct"
        name="Soil Moisture"
        strokeColor="#ffc658"
        yAxisDomain={[0, 100]}
      />
      <SensorChart
        title="Soil Temperature (°C)"
        data={sensorData}
        dataKey="soil_temp_c"
        name="Soil Temp"
        strokeColor="#ff7300"
        yAxisDomain={['auto', 'auto']}
      />
    </div>
  );
};
export default DataDisplay;  
