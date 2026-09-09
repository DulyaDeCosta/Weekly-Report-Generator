import { useState } from "react"
import { Pencil, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TaskModal } from "./TaskModal"
import type { TaskInput, TaskPriority, TaskStatus } from "@/lib/api/reports"

interface TaskTableProps {
  tasks: TaskInput[]
  onChange: (tasks: TaskInput[]) => void
  disabled?: boolean
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  BLOCKED: "bg-red-100 text-red-800",
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
}

export function TaskTable({ tasks, onChange, disabled }: TaskTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const openAddModal = () => {
    setEditIndex(null)
    setModalOpen(true)
  }

  const openEditModal = (index: number) => {
    setEditIndex(index)
    setModalOpen(true)
  }

  const handleSave = (task: TaskInput) => {
    if (editIndex === null) {
      onChange([...tasks, task])
    } else {
      const newTasks = [...tasks]
      newTasks[editIndex] = task
      onChange(newTasks)
    }
  }

  const handleDelete = (index: number) => {
    if (confirm("Delete this task?")) {
      onChange(tasks.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
        {!disabled && (
          <Button onClick={openAddModal} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 border-dashed p-8 text-center text-slate-500 text-sm">
          No tasks added yet. Click "Add Task" to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Progress</TableHead>
                <TableHead className="text-right">Hours (Plan/Actual)</TableHead>
                {!disabled && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {task.name}
                  </TableCell>
                  <TableCell>
                    <Badge className={PRIORITY_STYLES[task.priority]}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[task.status]}>
                      {STATUS_LABEL[task.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-600">
                    {task.actualPercentage}% / {task.plannedPercentage}%
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-600">
                    {task.timeSpentHours}h / {task.timePlannedHours}h
                  </TableCell>
                  {!disabled && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialTask={editIndex !== null ? tasks[editIndex] : undefined}
      />
    </div>
  )
}
