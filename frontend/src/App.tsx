import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/AuthContext"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { ReportHistoryPage } from "@/pages/reports/ReportHistoryPage"
import { CurrentReportPage } from "@/pages/reports/CurrentReportPage"
import { ReportDetailPage } from "@/pages/reports/ReportDetailPage"
import { AllReportsPage } from "@/pages/reports/AllReportsPage"
import { ProjectsPage } from "@/pages/projects/ProjectsPage"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { AppLayout } from "@/layouts/AppLayout"

// Placeholder pages — will be replaced with real ones
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="text-slate-500">This page is coming soon.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes with AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard - Manager/Admin */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                  <PlaceholderPage title="Dashboard" />
                </ProtectedRoute>
              }
            />

            {/* Current Report - Member */}
            <Route
              path="/reports/current"
              element={
                <ProtectedRoute allowedRoles={["MEMBER"]}>
                  <CurrentReportPage />
                </ProtectedRoute>
              }
            />

            {/* Report History - Member */}
            <Route
              path="/reports/history"
              element={
                <ProtectedRoute allowedRoles={["MEMBER"]}>
                  <ReportHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* All Reports - Manager/Admin */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                    <AllReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Single Report Detail - any role, service enforces access */}
            <Route
              path="/reports/:id"
              element={<ReportDetailPage />}  
            />

            {/* Projects - Manager/Admin */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                    <ProjectsPage />
                </ProtectedRoute>
              }
            />

            {/* Users - Admin only */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <PlaceholderPage title="Users" />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Root redirects based on auth state */}
          <Route path="/" element={<Navigate to="/reports/current" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
