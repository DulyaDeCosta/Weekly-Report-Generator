import { X } from "lucide-react"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Project } from "@/lib/api/reports"

export interface DashboardFilterValues {
  projectId: string
  weekPreset: "current" | "last4" | "last12"
}

interface DashboardFiltersProps {
  values: DashboardFilterValues
  onChange: (values: DashboardFilterValues) => void
  projects: Project[]
}

const WEEK_LABELS: Record<DashboardFilterValues["weekPreset"], string> = {
  current: "This week",
  last4: "Last 4 weeks",
  last12: "Last 12 weeks",
}

export function DashboardFilters({
  values,
  onChange,
  projects,
}: DashboardFiltersProps) {
  const hasFilters = values.projectId !== "" || values.weekPreset !== "current"

  const clear = () => {
    onChange({ projectId: "", weekPreset: "current" })
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-wrap items-end gap-4">
      <div className="space-y-1 min-w-[200px]">
        <Label htmlFor="dash-week" className="text-xs">Period</Label>
        <Select
          value={values.weekPreset}
          onValueChange={(value) =>
            onChange({
              ...values,
              weekPreset: (value ?? "current") as DashboardFilterValues["weekPreset"],
            })
          }
        >
          <SelectTrigger id="dash-week">
            <SelectValue>{WEEK_LABELS[values.weekPreset]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">This week</SelectItem>
            <SelectItem value="last4">Last 4 weeks</SelectItem>
            <SelectItem value="last12">Last 12 weeks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 min-w-[200px]">
        <Label htmlFor="dash-project" className="text-xs">Project</Label>
        <Select
          value={values.projectId}
          onValueChange={(value) =>
            onChange({ ...values, projectId: value ?? "" })
          }
        >
          <SelectTrigger id="dash-project">
            <SelectValue placeholder="All projects">
              {values.projectId
                ? projects.find((p) => p.id === values.projectId)?.name
                : "All projects"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={clear}>
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}

export function getWeekRangeFromPreset(preset: DashboardFilterValues["weekPreset"]) {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const currentMonday = new Date(now)
  currentMonday.setDate(now.getDate() + diff)
  currentMonday.setHours(0, 0, 0, 0)

  const currentSunday = new Date(currentMonday)
  currentSunday.setDate(currentMonday.getDate() + 6)

  let weeksBack = 0
  if (preset === "last4") weeksBack = 3
  else if (preset === "last12") weeksBack = 11

  const start = new Date(currentMonday)
  start.setDate(currentMonday.getDate() - weeksBack * 7)

  const formatDate = (d: Date) => format(d, "yyyy-MM-dd")

  return {
    weekStart: formatDate(start),
    weekEnd: formatDate(currentSunday),
  }
}
