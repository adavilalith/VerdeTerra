
const DUMMY_DEVICE_IDS = [
  'verde-terra-esp32-001',
  'verde-terra-esp32-002',
  'verde-terra-esp32-003',
];

const Controls = ({
  selectedDeviceId,
  setSelectedDeviceId,
  days,
  setDays,
  hours,
  setHours,
  minutes,
  setMinutes,
  handleFetchDataClick,
  handleRefreshClick,
  loading
}) => (<>
  <section className="p-4 sm:p-6 border-b border-gray-200">
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Device Selector */}
      <div className="w-full sm:w-auto">
        <label htmlFor="device-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Device:
        </label>
        
        <select
          id="device-select"
          className="block w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {DUMMY_DEVICE_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      {/* Time Range Inputs (Days, Hours, Minutes) */}
      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
        {/* Days Input */}
        <div>
          <label htmlFor="days-input" className="block text-sm font-medium text-gray-700 mb-1">
            Days:
          </label>
          <input
            type="number"
            id="days-input"
            min="0"
            value={days}
            onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
            className="block w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
          />
        </div>
        {/* Hours Input */}
        <div>
          <label htmlFor="hours-input" className="block text-sm font-medium text-gray-700 mb-1">
            Hours:
          </label>
          <input
            type="number"
            id="hours-input"
            min="0"
            max="23"
            value={hours}
            onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
            className="block w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
          />
        </div>
        {/* Minutes Input */}
        <div>
          <label htmlFor="minutes-input" className="block text-sm font-medium text-gray-700 mb-1">
            Minutes:
          </label>
          <input
            type="number"
            id="minutes-input"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="block w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
          />
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 mt-4 sm:mt-0">
        <button
          onClick={handleFetchDataClick}
          className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-200"
          disabled={loading}
        >
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
        <button
          onClick={handleRefreshClick}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
    </div>
  </section>
  </>
);
export default Controls; 
