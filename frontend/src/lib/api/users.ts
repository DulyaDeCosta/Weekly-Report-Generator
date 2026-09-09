import { api } from "./axios"
import { type User } from "./auth"

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: "MEMBER" | "MANAGER" | "ADMIN"
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: "MEMBER" | "MANAGER" | "ADMIN"
  isActive?: boolean
}

export const usersApi = {
  listAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users")
    return response.data
  },

  create: async (data: CreateUserInput): Promise<User> => {
    const response = await api.post<User>("/users", data)
    return response.data
  },

  update: async (id: string, data: UpdateUserInput): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
