import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, User as UserIcon, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { authApi } from "@/lib/api/auth"
import type { AxiosError } from "axios"

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  MANAGER: "bg-blue-100 text-blue-800",
  MEMBER: "bg-slate-100 text-slate-700",
}

export function MyProfilePage() {
  const { user, setUser } = useAuth()

  // Details form
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({})
  const [isSavingDetails, setIsSavingDetails] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  if (!user) return null

  const validateDetails = (): boolean => {
    const errors: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) errors.name = "Name must be at least 2 characters"
    if (!email.trim()) errors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Invalid email"
    setDetailsErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveDetails = async () => {
    if (!validateDetails()) return
    const hasChanges = name.trim() !== user.name || email.trim() !== user.email
    if (!hasChanges) {
      toast.info("No changes to save")
      return
    }
    setIsSavingDetails(true)
    try {
      const updated = await authApi.updateMe({
        name: name.trim(),
        email: email.trim(),
      })
      setUser(updated)
      toast.success("Profile updated")
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string | string[] }>
      const message = axiosError.response?.data?.message
      const display = Array.isArray(message) ? message.join(", ") : message
      toast.error(display ?? "Failed to update profile")
    } finally {
      setIsSavingDetails(false)
    }
  }

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {}
    if (!currentPassword) errors.currentPassword = "Current password is required"
    if (!newPassword || newPassword.length < 8) errors.newPassword = "New password must be at least 8 characters"
    if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match"
    if (currentPassword && newPassword && currentPassword === newPassword) {
      errors.newPassword = "New password must be different from current"
    }
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSavePassword = async () => {
    if (!validatePassword()) return
    setIsSavingPassword(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      toast.success("Password changed")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordErrors({})
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.response?.data?.message ?? "Failed to change password")
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account details and password</p>
      </div>

      {/* Account info header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-full">
            <UserIcon className="h-6 w-6 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="font-semibold text-slate-900">{user.name}</div>
              <Badge className={ROLE_STYLES[user.role]}>{user.role}</Badge>
            </div>
            <div className="text-sm text-slate-500">{user.email}</div>
          </div>
        </div>
      </div>

      {/* Details form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Account Details</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSavingDetails}
            maxLength={100}
          />
          {detailsErrors.name && <p className="text-sm text-red-600">{detailsErrors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSavingDetails}
            maxLength={200}
          />
          {detailsErrors.email && <p className="text-sm text-red-600">{detailsErrors.email}</p>}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSaveDetails}
            disabled={isSavingDetails}
            className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-800 hover:from-slate-800 hover:via-slate-700 hover:to-blue-700"
          >
            {isSavingDetails ? "Saving..." : "Save Details"}
          </Button>
        </div>
      </div>

      {/* Password form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-pw">Current Password</Label>
          <div className="relative">
            <Input
              id="current-pw"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isSavingPassword}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordErrors.currentPassword && (
            <p className="text-sm text-red-600">{passwordErrors.currentPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-pw">New Password</Label>
          <div className="relative">
            <Input
              id="new-pw"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSavingPassword}
              placeholder="At least 8 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordErrors.newPassword && (
            <p className="text-sm text-red-600">{passwordErrors.newPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-pw">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm-pw"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSavingPassword}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordErrors.confirmPassword && (
            <p className="text-sm text-red-600">{passwordErrors.confirmPassword}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSavePassword}
            disabled={isSavingPassword}
            variant="outline"
          >
            {isSavingPassword ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </div>
    </div>
  )
}
