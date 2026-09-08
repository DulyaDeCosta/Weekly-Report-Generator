import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { ProtectedRoute } from "@/routes/ProtectedRoute"

function PlaceholderDashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard (placeholder)</h1>
        <p className="text-slate-600">Welcome, <span className="font-medium">{user?.name}</span></p>
        <p className="text-slate-500 text-sm">Role: {user?.role}</p>
        <p className="text-slate-500 text-sm">Email: {user?.email}</p>
        <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
      </div>
    </div>
  )
}

function PlaceholderCurrentReport() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Current Report (placeholder)</h1>
        <p className="text-slate-600">Welcome, <span className="font-medium">{user?.name}</span></p>
        <p className="text-slate-500 text-sm">Role: {user?.role}</p>
        <p className="text-slate-500 text-sm">Email: {user?.email}</p>
        <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                <PlaceholderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/current"
            element={
              <ProtectedRoute allowedRoles={["MEMBER", "MANAGER", "ADMIN"]}>
                <PlaceholderCurrentReport />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
