import { api } from "./axios"

export type ReportStatus = "DRAFT" | "SUBMITTED" | "NEEDS_CORRECTION" | "APPROVED"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED"
export type ReviewActionType = "APPROVED" | "REQUESTED_CHANGES"

export interface Task {
  id: string
  reportId: string
  name: string
  priority: TaskPriority
  status: TaskStatus
  plannedPercentage: number
  actualPercentage: number
  timePlannedHours: number
  timeSpentHours: number
  deliverable?: string | null
  createdAt: string
}

export interface Blocker {
  id: string
  reportId: string
  description: string
  isKey: boolean
  createdAt: string
}

export interface Achievement {
  id: string
  reportId: string
  description: string
  isKey: boolean
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ReportAuthor {
  id: string
  name: string
  email: string
  role: "MEMBER" | "MANAGER" | "ADMIN"
}

export interface ReviewAction {
  id: string
  reportId: string
  reviewerId: string
  actionType: ReviewActionType
  comment: string | null
  createdAt: string
  reviewer?: ReportAuthor
}

export interface Report {
  id: string
  authorId: string
  projectId: string
  weekStartDate: string
  weekEndDate: string
  status: ReportStatus
  tasksPlannedNextWeek: string | null
  notes: string | null
  hoursDevelopment: number
  hoursTesting: number
  hoursMeetings: number
  hoursDocumentation: number
  latestReviewComment: string | null
  submittedAt: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  author?: ReportAuthor
  project?: Project
  tasks?: Task[]
  blockers?: Blocker[]
  achievements?: Achievement[]
  reviewActions?: ReviewAction[]
}

export interface PaginatedReports {
  items: Report[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ListReportsParams {
  page?: number
  limit?: number
  status?: ReportStatus
  projectId?: string
  authorId?: string
  weekStart?: string
  weekEnd?: string
}

export interface TaskInput {
  name: string
  priority: TaskPriority
  status: TaskStatus
  plannedPercentage: number
  actualPercentage: number
  timePlannedHours: number
  timeSpentHours: number
  deliverable?: string
}

export interface BlockerInput {
  description: string
  isKey: boolean
}

export interface AchievementInput {
  description: string
  isKey: boolean
}

export interface UpdateReportInput {
  tasks?: TaskInput[]
  blockers?: BlockerInput[]
  achievements?: AchievementInput[]
  tasksPlannedNextWeek?: string
  notes?: string
  hoursDevelopment?: number
  hoursTesting?: number
  hoursMeetings?: number
  hoursDocumentation?: number
}

export interface ReviewInput {
  actionType: ReviewActionType
  comment?: string
}

export const reportsApi = {
  create: async (projectId: string, weekStart?: string): Promise<Report> => {
    const payload: { projectId: string; weekStart?: string } = { projectId }
    if (weekStart) payload.weekStart = weekStart
    const response = await api.post<Report>("/reports", payload)
    return response.data
  },

  getBackfillableWeeks: async (): Promise<string[]> => {
    const response = await api.get<string[]>("/reports/me/backfillable-weeks")
    return response.data
  },

  getCurrent: async (): Promise<Report | null> => {
    const response = await api.get<Report | null>("/reports/me/current")
    return response.data
  },

  update: async (id: string, data: UpdateReportInput): Promise<Report> => {
    const response = await api.patch<Report>(`/reports/${id}`, data)
    return response.data
  },

  submit: async (id: string): Promise<Report> => {
    const response = await api.post<Report>(`/reports/${id}/submit`)
    return response.data
  },

  review: async (id: string, data: ReviewInput): Promise<Report> => {
    const response = await api.post<Report>(`/reports/${id}/review`, data)
    return response.data
  },

  listMine: async (params: ListReportsParams = {}): Promise<PaginatedReports> => {
    const response = await api.get<PaginatedReports>("/reports/me", { params })
    return response.data
  },

  listAll: async (params: ListReportsParams = {}): Promise<PaginatedReports> => {
    const response = await api.get<PaginatedReports>("/reports", { params })
    return response.data
  },

  findOne: async (id: string): Promise<Report> => {
    const response = await api.get<Report>(`/reports/${id}`)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`)
  },
}
