import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { DashboardStats } from "@/lib/api/dashboard"

interface HoursChartProps {
  data: DashboardStats["hoursBreakdown"]
}

export function HoursChart({ data }: HoursChartProps) {
  const chartData = [
    { category: "Development", hours: data.development },
    { category: "Testing", hours: data.testing },
    { category: "Meetings", hours: data.meetings },
    { category: "Documentation", hours: data.documentation },
  ]

  const total = data.development + data.testing + data.meetings + data.documentation
  const hasData = total > 0

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Time Breakdown
        </h3>
        <span className="text-xs text-slate-500">
          Total: <span className="font-semibold text-slate-700">{total}h</span>
        </span>
      </div>
      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No hours logged
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${value ?? 0}h`, "Hours"]}
              />
              <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
