import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { toChartRows, type TemperatureChartRow } from '../chartData'
import type { TemperatureComparison } from '../types'

interface TemperatureChartProps {
  comparison: TemperatureComparison
}

const LINE_COLORS = ['#2463eb', '#e45133', '#14a06f', '#8c52c7']

export function TemperatureChart({ comparison }: TemperatureChartProps) {
  const rows = toChartRows(comparison)

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottom', offset: -4 }} />
          <YAxis unit="°C" />
          <Tooltip />
          <Legend verticalAlign="top" height={40} />
          {comparison.cities.map((city, index) => (
            <Line
              key={city.name}
              type="monotone"
              name={city.name}
              dataKey={(row: TemperatureChartRow) => row.temperatures[city.name]}
              stroke={LINE_COLORS[index % LINE_COLORS.length]}
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
