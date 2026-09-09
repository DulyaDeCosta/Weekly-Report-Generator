import { useEffect, useState } from "react"
import { toast } from "sonner"
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
import { Textarea } from "@/components/ui/textarea"
import { projectsApi } from "@/lib/api/projects"
import type { Project } from "@/lib/api/reports"
import type { AxiosError } from "axios"

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  project?: Project | null
}

export function ProjectModal({ open, onClose, onSaved, project }: ProjectModalProps) {
  const isEdit = !!project
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(project?.name ?? "")
      setDescription(project?.description ?? "")
      setErrors({})
    }
  }, [open, project])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const trimmedName = name.trim()
    if (!trimmedName) newErrors.name = "Project name is required"
    if (trimmedName.length > 100) newErrors.name = "Name must be at most 100 characters"
    if (description.length > 500) newErrors.description = "Description must be at most 500 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setIsSaving(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
      }
      if (isEdit && project) {
        await projectsApi.update(project.id, payload)
        toast.success("Project updated")
      } else {
        await projectsApi.create(payload)
        toast.success("Project created")
      }
      onSaved()
      onClose()
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string | string[] }>
      const message = axiosError.response?.data?.message
      const displayMessage = Array.isArray(message) ? message.join(", ") : message
      toast.error(displayMessage ?? `Failed to ${isEdit ? "update" : "create"} project`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">
              Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Client Gamma"
              disabled={isSaving}
              maxLength={100}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project (optional)"
              rows={3}
              disabled={isSaving}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                {description.length}/500 characters
              </span>
              {errors.description && (
                <span className="text-sm text-red-600">{errors.description}</span>
              )}
            </div>
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
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
