import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FileText, Plus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ReportForm } from "./components/ReportForm"
import { reportsApi, type Report } from "@/lib/api/reports"
import { projectsApi } from "@/lib/api/projects"
import type { Project } from "@/lib/api/reports"
import type { AxiosError } from "axios"

export function CurrentReportPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Backfill modal state
  const [backfillOpen, setBackfillOpen] = useState(false)
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([])
  const [backfillProjectId, setBackfillProjectId] = useState<string>("")
  const [backfillWeek, setBackfillWeek] = useState<string>("")
  const [isBackfilling, setIsBackfilling] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [reportData, projectsData] = await Promise.all([
        reportsApi.getCurrent(),
        projectsApi.listAll(),
      ])
      setReport(reportData)
      setProjects(projectsData)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to load report",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCurrentWeek = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project first")
      return
    }
    setIsCreating(true)
    try {
      await reportsApi.create(selectedProjectId)
      const full = await reportsApi.getCurrent()
      setReport(full)
      toast.success("Draft created")
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to create draft",
      )
    } finally {
      setIsCreating(false)
    }
  }

  const openBackfillModal = async () => {
    setBackfillProjectId("")
    setBackfillWeek("")
    setBackfillOpen(true)
    try {
      const weeks = await reportsApi.getBackfillableWeeks()
      setAvailableWeeks(weeks)
    } catch (error) {
      toast.error("Failed to load available weeks")
      setBackfillOpen(false)
    }
  }

  const handleBackfillCreate = async () => {
    if (!backfillProjectId || !backfillWeek) {
      toast.error("Please select both a project and a week")
      return
    }
    setIsBackfilling(true)
    try {
      const newReport = await reportsApi.create(backfillProjectId, backfillWeek)
      const full = await reportsApi.findOne(newReport.id)
      setReport(full)
      toast.success("Draft created")
      setBackfillOpen(false)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to create draft",
      )
    } finally {
      setIsBackfilling(false)
    }
  }

  const formatWeekLabel = (weekStart: string) => {
    const start = new Date(weekStart + "T00:00:00")
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
  }

  if (isLoading) {
    return <div className="text-center text-slate-500 py-12">Loading...</div>
  }

  return (
    <>
      {report ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openBackfillModal} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Draft for Past Week
            </Button>
          </div>
          <ReportForm report={report} onReportUpdate={setReport} />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Weekly Report</h1>
            <p className="text-slate-500 mt-1">
              Create this week's report to start tracking your work
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-md mx-auto">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              No report for this week
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Choose a project and create your weekly report draft.
            </p>

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={(value) => setSelectedProjectId(value ?? "")}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select a project...">
                      {selectedProjectId
                        ? projects.find((p) => p.id === selectedProjectId)?.name
                        : "Select a project..."}
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

              <Button
                onClick={handleCreateCurrentWeek}
                disabled={!selectedProjectId || isCreating}
                className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-blue-800 hover:from-slate-800 hover:via-slate-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Creating..." : "Create Draft for Current Week"}
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={openBackfillModal}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Or create a draft for a past week
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backfill Modal */}
      <Dialog open={backfillOpen} onOpenChange={setBackfillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Draft for Past Week</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backfill-project">Project</Label>
              <Select
                value={backfillProjectId}
                onValueChange={(value) => setBackfillProjectId(value ?? "")}
              >
                <SelectTrigger id="backfill-project">
                  <SelectValue placeholder="Select a project...">
                    {backfillProjectId
                      ? projects.find((p) => p.id === backfillProjectId)?.name
                      : "Select a project..."}
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

            <div className="space-y-2">
              <Label htmlFor="backfill-week">Week</Label>
              {availableWeeks.length === 0 ? (
                <div className="text-sm text-slate-500 p-3 border border-slate-200 rounded-md">
                  No past weeks available. You already have reports for all recent weeks.
                </div>
              ) : (
                <Select
                  value={backfillWeek}
                  onValueChange={(value) => setBackfillWeek(value ?? "")}
                >
                  <SelectTrigger id="backfill-week">
                    <SelectValue placeholder="Select a week...">
                      {backfillWeek
                        ? formatWeekLabel(backfillWeek)
                        : "Select a week..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableWeeks.map((week) => (
                      <SelectItem key={week} value={week}>
                        {formatWeekLabel(week)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBackfillOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBackfillCreate}
              disabled={
                !backfillProjectId ||
                !backfillWeek ||
                isBackfilling ||
                availableWeeks.length === 0
              }
            >
              {isBackfilling ? "Creating..." : "Create Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
