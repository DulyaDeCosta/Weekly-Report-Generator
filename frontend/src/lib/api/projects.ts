import { api } from "./axios"
import { type Project } from "./reports"

export const projectsApi = {
  listAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>("/projects")
    return response.data
  },
}
