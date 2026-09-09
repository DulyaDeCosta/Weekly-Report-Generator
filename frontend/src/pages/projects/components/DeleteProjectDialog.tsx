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
import { projectsApi } from "@/lib/api/projects"
import type { Project } from "@/lib/api/reports"
import type { AxiosError } from "axios"

interface DeleteProjectDialogProps {
  open: boolean
  onClose: () => void
  onDeleted: () => void
  project: Project | null
}

export function DeleteProjectDialog({
  open,
  onClose,
  onDeleted,
  project,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!project) return
    setIsDeleting(true)
    try {
      await projectsApi.delete(project.id)
      toast.success("Project deleted")
      onDeleted()
      onClose()
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to delete project",
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Project?
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">{project.name}</span>?
          </p>
          <p className="text-sm text-slate-500">
            This project will be hidden from new report creation. Existing
            reports that reference this project will not be affected.
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
            {isDeleting ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
