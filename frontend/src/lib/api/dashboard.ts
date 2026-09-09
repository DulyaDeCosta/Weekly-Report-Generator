import { api } from "./axios"

export interface DashboardStats {
  metrics: {
    reportsThisWeek: number
    awaitingReview: number
    approvedThisWeek: number
    activeMembers: number
  }
  statusDistribution: Array<{ status: string; count: number }>
  reportsByMember: Array<{ memberName: string; count: number }>
  hoursBreakdown: {
    development: number
    testing: number
    meetings: number
    documentation: number
  }
}

export interface DashboardParams {
  projectId?: string
  weekStart?: string
  weekEnd?: string
}

export const dashboardApi = {
  getStats: async (params: DashboardParams = {}): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/dashboard/stats", { params })
    return response.data
  },
}
