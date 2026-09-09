import axios from "axios"

const API_BASE_URL = "http://localhost:3000/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor — attach JWT to every request if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 globally (kick user to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.startsWith("/login") && 
          !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
