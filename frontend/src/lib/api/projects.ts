import { api } from "./axios"
import { type Project } from "./reports"

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  isActive?: boolean
}

export const projectsApi = {
  listAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>("/projects")
    return response.data
  },

  create: async (data: CreateProjectInput): Promise<Project> => {
    const response = await api.post<Project>("/projects", data)
    return response.data
  },

  update: async (id: string, data: UpdateProjectInput): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },
}
