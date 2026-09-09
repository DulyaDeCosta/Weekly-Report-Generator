import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usersApi } from "@/lib/api/users"
import type { User } from "@/lib/api/auth"
import type { AxiosError } from "axios"

type Role = "MEMBER" | "MANAGER" | "ADMIN"

interface UserModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  user?: User | null
  currentUserId: string
}

const ROLE_LABELS: Record<Role, string> = {
  MEMBER: "Member",
  MANAGER: "Manager",
  ADMIN: "Admin",
}

export function UserModal({
  open,
  onClose,
  onSaved,
  user,
  currentUserId,
}: UserModalProps) {
  const isEdit = !!user
  const isSelf = user?.id === currentUserId

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("MEMBER")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(user?.name ?? "")
      setEmail(user?.email ?? "")
      setPassword("")
      setRole((user?.role as Role) ?? "MEMBER")
      setShowPassword(false)
      setErrors({})
    }
  }, [open, user])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email"
    }
    if (!isEdit) {
      if (!password || password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setIsSaving(true)
    try {
      if (isEdit && user) {
        const payload: {
          name: string
          email: string
          role?: Role
        } = {
          name: name.trim(),
          email: email.trim(),
        }
        if (!isSelf) payload.role = role
        await usersApi.update(user.id, payload)
        toast.success("User updated")
      } else {
        await usersApi.create({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        })
        toast.success("User created")
      }
      onSaved()
      onClose()
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string | string[] }>
      const message = axiosError.response?.data?.message
      const displayMessage = Array.isArray(message) ? message.join(", ") : message
      toast.error(displayMessage ?? `Failed to ${isEdit ? "update" : "create"} user`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit User" : "Invite New User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">
              Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              disabled={isSaving}
              maxLength={100}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">
              Email <span className="text-red-600">*</span>
            </Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              disabled={isSaving}
              maxLength={200}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="user-password">
                Password <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={isSaving}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user-role">
              Role <span className="text-red-600">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(value) => setRole((value ?? "MEMBER") as Role)}
              disabled={isSaving || (isEdit && isSelf)}
            >
              <SelectTrigger id="user-role">
                <SelectValue>{ROLE_LABELS[role]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            {isEdit && isSelf && (
              <p className="text-xs text-slate-500">
                You cannot change your own role.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-800 hover:from-slate-800 hover:via-slate-700 hover:to-blue-700"
          >
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
