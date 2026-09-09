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
import { UsersPage } from "@/pages/users/UsersPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { MemberProfilePage } from "@/pages/members/MemberProfilePage"
import { MyProfilePage } from "@/pages/profile/MyProfilePage"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { AppLayout } from "@/layouts/AppLayout"

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
                  <DashboardPage />
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
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id"
              element={
                <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                  <MemberProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" 
              element={
                <MyProfilePage />
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
