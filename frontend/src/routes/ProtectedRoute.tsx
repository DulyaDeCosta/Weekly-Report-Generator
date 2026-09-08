import { type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { type User } from "@/lib/api/auth"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: User["role"][]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to role-appropriate home
    const homeRoute = user.role === "MEMBER" ? "/reports/current" : "/dashboard"
    return <Navigate to={homeRoute} replace />
  }

  return <>{children}</>
}
