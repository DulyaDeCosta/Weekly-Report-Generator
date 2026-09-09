import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  TaskInput,
  TaskPriority,
  TaskStatus,
} from "@/lib/api/reports"

interface TaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (task: TaskInput) => void
  initialTask?: TaskInput
}

const EMPTY_TASK: TaskInput = {
  name: "",
  priority: "MEDIUM",
  status: "NOT_STARTED",
  plannedPercentage: 0,
  actualPercentage: 0,
  timePlannedHours: 0,
  timeSpentHours: 0,
  deliverable: "",
}

export function TaskModal({ open, onClose, onSave, initialTask }: TaskModalProps) {
  const [task, setTask] = useState<TaskInput>(EMPTY_TASK)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setTask(initialTask ?? EMPTY_TASK)
      setErrors({})
    }
  }, [open, initialTask])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!task.name.trim()) newErrors.name = "Task name is required"
    if (task.name.length > 200) newErrors.name = "Task name too long"
    if (task.plannedPercentage < 0 || task.plannedPercentage > 100)
      newErrors.plannedPercentage = "Must be 0-100"
    if (task.actualPercentage < 0 || task.actualPercentage > 100)
      newErrors.actualPercentage = "Must be 0-100"
    if (task.timePlannedHours < 0) newErrors.timePlannedHours = "Must be >= 0"
    if (task.timeSpentHours < 0) newErrors.timeSpentHours = "Must be >= 0"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      ...task,
      name: task.name.trim(),
      deliverable: task.deliverable?.trim() || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialTask ? "Edit Task" : "Add Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name *</Label>
            <Input
              id="task-name"
              value={task.name}
              onChange={(e) => setTask({ ...task, name: e.target.value })}
              placeholder="e.g., Implement login page"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={task.priority}
                onValueChange={(v) =>
                  setTask({ ...task, priority: v as TaskPriority })
                }
              >
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={task.status}
                onValueChange={(v) =>
                  setTask({ ...task, status: v as TaskStatus })
                }
              >
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planned-pct">Planned %</Label>
              <Input
                id="planned-pct"
                type="number"
                min={0}
                max={100}
                value={task.plannedPercentage}
                onChange={(e) =>
                  setTask({
                    ...task,
                    plannedPercentage: parseInt(e.target.value) || 0,
                  })
                }
              />
              {errors.plannedPercentage && (
                <p className="text-sm text-red-600">
                  {errors.plannedPercentage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual-pct">Actual %</Label>
              <Input
                id="actual-pct"
                type="number"
                min={0}
                max={100}
                value={task.actualPercentage}
                onChange={(e) =>
                  setTask({
                    ...task,
                    actualPercentage: parseInt(e.target.value) || 0,
                  })
                }
              />
              {errors.actualPercentage && (
                <p className="text-sm text-red-600">
                  {errors.actualPercentage}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planned-hrs">Time Planned (hours)</Label>
              <Input
                id="planned-hrs"
                type="number"
                min={0}
                value={task.timePlannedHours}
                onChange={(e) =>
                  setTask({
                    ...task,
                    timePlannedHours: parseInt(e.target.value) || 0,
                  })
                }
              />
              {errors.timePlannedHours && (
                <p className="text-sm text-red-600">
                  {errors.timePlannedHours}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="spent-hrs">Time Spent (hours)</Label>
              <Input
                id="spent-hrs"
                type="number"
                min={0}
                value={task.timeSpentHours}
                onChange={(e) =>
                  setTask({
                    ...task,
                    timeSpentHours: parseInt(e.target.value) || 0,
                  })
                }
              />
              {errors.timeSpentHours && (
                <p className="text-sm text-red-600">
                  {errors.timeSpentHours}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverable">Deliverable (optional)</Label>
            <Textarea
              id="deliverable"
              value={task.deliverable ?? ""}
              onChange={(e) =>
                setTask({ ...task, deliverable: e.target.value })
              }
              placeholder="What was delivered? Link, doc, PR, etc."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initialTask ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
