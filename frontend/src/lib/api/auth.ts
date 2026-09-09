import { api } from "./axios"

export interface User {
  id: string
  name: string
  email: string
  role: "MEMBER" | "MANAGER" | "ADMIN"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data)
    return response.data
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me")
    return response.data
  },
    updateMe: async (data: { name?: string; email?: string }): Promise<User> => {
    const response = await api.patch<User>("/auth/me", data)
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.patch("/auth/password", data)
  },
}
