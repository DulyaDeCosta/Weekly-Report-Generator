import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authApi,type User } from "@/lib/api/auth"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, check if we have a token and try to fetch the current user
  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setIsLoading(false)
      return
    }

    authApi
      .getMe()
      .then((fetchedUser) => {
        setUser(fetchedUser)
      })
      .catch(() => {
        // Token is invalid or expired; the axios interceptor will handle cleanup
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    const { user: loggedInUser, accessToken } = await authApi.login({ email, password })
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("user", JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const { user: newUser, accessToken } = await authApi.register({ name, email, password })
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/login"
  }

const value: AuthContextValue = {
  user,
  isLoading,
  isAuthenticated: user !== null,
  login,
  register,
  logout,
  setUser: (u) => {
    setUser(u)
    localStorage.setItem("user", JSON.stringify(u))
  },
}

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
