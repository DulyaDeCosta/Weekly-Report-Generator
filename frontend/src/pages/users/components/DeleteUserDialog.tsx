import { useState } from "react"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usersApi } from "@/lib/api/users"
import type { User } from "@/lib/api/auth"
import type { AxiosError } from "axios"

interface DeleteUserDialogProps {
  open: boolean
  onClose: () => void
  onDeleted: () => void
  user: User | null
}

export function DeleteUserDialog({
  open,
  onClose,
  onDeleted,
  user,
}: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!user) return
    setIsDeleting(true)
    try {
      await usersApi.delete(user.id)
      toast.success("User deactivated")
      onDeleted()
      onClose()
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to deactivate user",
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Deactivate User?
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-700">
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-slate-900">{user.name}</span>?
          </p>
          <p className="text-sm text-slate-500">
            They will no longer be able to log in. Their existing reports and
            history will remain intact.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deactivating..." : "Deactivate User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
