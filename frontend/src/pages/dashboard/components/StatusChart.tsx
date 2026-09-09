import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { DashboardStats } from "@/lib/api/dashboard"

interface StatusChartProps {
  data: DashboardStats["statusDistribution"]
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#3b82f6",
  NEEDS_CORRECTION: "#f59e0b",
  APPROVED: "#10b981",
}

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs Correction",
  APPROVED: "Approved",
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = data.map((d) => ({
    name: STATUS_LABEL[d.status] ?? d.status,
    value: d.count,
    status: d.status,
  }))

  const hasData = chartData.some((d) => d.value > 0)

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Report Status Distribution
      </h3>
      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No data for this period
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
