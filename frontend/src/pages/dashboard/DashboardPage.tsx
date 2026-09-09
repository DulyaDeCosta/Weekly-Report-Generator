import { useEffect, useState } from "react"
import { toast } from "sonner"
import { MetricCards } from "./components/MetricCards"
import { StatusChart } from "./components/StatusChart"
import { MembersChart } from "./components/MembersChart"
import { HoursChart } from "./components/HoursChart"
import {
  DashboardFilters,
  getWeekRangeFromPreset,
  type DashboardFilterValues,
} from "./components/DashboardFilters"
import { dashboardApi, type DashboardStats } from "@/lib/api/dashboard"
import { projectsApi } from "@/lib/api/projects"
import type { Project } from "@/lib/api/reports"
import type { AxiosError } from "axios"

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<DashboardFilterValues>({
    projectId: "",
    weekPreset: "current",
  })

  useEffect(() => {
    projectsApi.listAll().then(setProjects).catch(() => {})
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      try {
        const { weekStart, weekEnd } = getWeekRangeFromPreset(filters.weekPreset)
        const data = await dashboardApi.getStats({
          weekStart,
          weekEnd,
          projectId: filters.projectId || undefined,
        })
        setStats(data)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        toast.error(
          axiosError.response?.data?.message ?? "Failed to load dashboard",
        )
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [filters])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Team reporting overview and analytics
        </p>
      </div>

      <DashboardFilters
        values={filters}
        onChange={setFilters}
        projects={projects}
      />

      {isLoading || !stats ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          <MetricCards metrics={stats.metrics} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatusChart data={stats.statusDistribution} />
            <HoursChart data={stats.hoursBreakdown} />
          </div>

          <MembersChart data={stats.reportsByMember} />
        </>
      )}
    </div>
  )
}
