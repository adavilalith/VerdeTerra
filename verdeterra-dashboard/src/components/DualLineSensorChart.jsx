import { format } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DualLineSensorChart = ({
  title,
  data1,
  dataKey1,
  name1,
  strokeColor1,
  data2,
  dataKey2,
  name2,
  strokeColor2,
  yAxisDomain
}) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
    <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="timestamp_formatted" angle={-45} textAnchor="end" height={80} interval="preserveStartEnd" />
        <YAxis domain={yAxisDomain} />
        <Tooltip labelFormatter={(_, payload) =>
          payload && payload.length > 0
            ? format(new Date(payload[0].payload.timestamp_ms), 'MMM dd, HH:mm:ss')
            : ''
        } />
        <Legend />
        {/* Line 1 */}
        <Line
          type="monotone"
          data={data1} // Data for the first line
          dataKey={dataKey1}
          stroke={strokeColor1}
          activeDot={{ r: 8 }}
          name={name1}
        />
        {/* Line 2 */}
        <Line
          type="monotone"
          data={data2} // Data for the second line
          dataKey={dataKey2}
          stroke={strokeColor2}
          activeDot={{ r: 8 }}
          name={name2}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default DualLineSensorChart;