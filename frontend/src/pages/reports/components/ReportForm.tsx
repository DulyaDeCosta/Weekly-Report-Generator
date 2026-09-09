import { useState } from "react"
import { toast } from "sonner"
import { Save, Send, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TaskTable } from "./TaskTable"
import { ListWithKeyFlag } from "./ListWithKeyFlag"
import { HoursBreakdown, type HoursValues } from "./HoursBreakdown"
import {
  reportsApi,
  type Report,
  type TaskInput,
  type BlockerInput,
  type AchievementInput,
  type ReportStatus,
} from "@/lib/api/reports"
import type { AxiosError } from "axios"

interface ReportFormProps {
  report: Report
  onReportUpdate: (report: Report) => void
  forceReadOnly?: boolean
}

const STATUS_STYLES: Record<ReportStatus, string> = {
  DRAFT: "bg-slate-200 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-800",
  NEEDS_CORRECTION: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
}

const STATUS_LABEL: Record<ReportStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs Correction",
  APPROVED: "Approved",
}

export function ReportForm({ report, onReportUpdate, forceReadOnly }: ReportFormProps) {
  const [tasks, setTasks] = useState<TaskInput[]>(
    (report.tasks ?? []).map((t) => ({
      name: t.name,
      priority: t.priority,
      status: t.status,
      plannedPercentage: t.plannedPercentage,
      actualPercentage: t.actualPercentage,
      timePlannedHours: t.timePlannedHours,
      timeSpentHours: t.timeSpentHours,
      deliverable: t.deliverable ?? undefined,
    })),
  )
  const [blockers, setBlockers] = useState<BlockerInput[]>(
    (report.blockers ?? []).map((b) => ({
      description: b.description,
      isKey: b.isKey,
    })),
  )
  const [achievements, setAchievements] = useState<AchievementInput[]>(
    (report.achievements ?? []).map((a) => ({
      description: a.description,
      isKey: a.isKey,
    })),
  )
  const [tasksPlannedNextWeek, setTasksPlannedNextWeek] = useState(
    report.tasksPlannedNextWeek ?? "",
  )
  const [notes, setNotes] = useState(report.notes ?? "")
  const [hours, setHours] = useState<HoursValues>({
    hoursDevelopment: report.hoursDevelopment,
    hoursTesting: report.hoursTesting,
    hoursMeetings: report.hoursMeetings,
    hoursDocumentation: report.hoursDocumentation,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isReadOnly =
    forceReadOnly ||
    report.status === "SUBMITTED" ||
    report.status === "APPROVED"
    
  const canSubmit =
    report.status === "DRAFT" || report.status === "NEEDS_CORRECTION"

  const formatWeek = (start: string, end: string) =>
    `${format(new Date(start), "MMM d")} - ${format(new Date(end), "MMM d, yyyy")}`

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await reportsApi.update(report.id, {
        tasks,
        blockers,
        achievements,
        tasksPlannedNextWeek,
        notes,
        ...hours,
      })
      onReportUpdate(updated)
      toast.success("Report saved")
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string | string[] }>
      const message = axiosError.response?.data?.message
      const displayMessage = Array.isArray(message)
        ? message.join(", ")
        : message ?? "Failed to save"
      toast.error(displayMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!confirm("Submit this report for review? You won't be able to edit it until the manager reviews it.")) {
      return
    }
    setIsSubmitting(true)
    try {
      // Save first, then submit
      await reportsApi.update(report.id, {
        tasks,
        blockers,
        achievements,
        tasksPlannedNextWeek,
        notes,
        ...hours,
      })
      const submitted = await reportsApi.submit(report.id)
      onReportUpdate(submitted)
      toast.success("Report submitted for review")
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string | string[] }>
      const message = axiosError.response?.data?.message
      const displayMessage = Array.isArray(message)
        ? message.join(", ")
        : message ?? "Failed to submit"
      toast.error(displayMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-900">
              Weekly Report
            </h1>
            <Badge className={STATUS_STYLES[report.status]}>
              {STATUS_LABEL[report.status]}
            </Badge>
          </div>
          <p className="text-slate-500">
            {formatWeek(report.weekStartDate, report.weekEndDate)}
            {report.project && ` · ${report.project.name}`}
          </p>
        </div>
      </div>

      {/* Status banners */}
      {report.status === "SUBMITTED" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <div className="font-medium">Waiting for manager review</div>
            <div className="text-blue-800 mt-0.5">
              Your report has been submitted. You'll be able to edit it if the manager requests changes.
            </div>
          </div>
        </div>
      )}

      {report.status === "NEEDS_CORRECTION" && report.latestReviewComment && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 flex-1">
            <div className="font-medium mb-1">Manager requested changes</div>
            <div className="text-amber-800 whitespace-pre-wrap">
              {report.latestReviewComment}
            </div>
          </div>
        </div>
      )}

      {report.status === "APPROVED" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <div className="font-medium">Report approved</div>
            <div className="text-green-800 mt-0.5">
              Your manager has approved this report.
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      <TaskTable tasks={tasks} onChange={setTasks} disabled={isReadOnly} />

      {/* Blockers */}
      <ListWithKeyFlag
        title="Blockers"
        items={blockers}
        onChange={setBlockers}
        addLabel="Add Blocker"
        placeholder="Describe a blocker you faced this week..."
        keyLabel="key blocker"
        disabled={isReadOnly}
      />

      {/* Achievements */}
      <ListWithKeyFlag
        title="Achievements"
        items={achievements}
        onChange={setAchievements}
        addLabel="Add Achievement"
        placeholder="What did you accomplish this week?"
        keyLabel="key achievement"
        disabled={isReadOnly}
      />

      {/* Hours */}
      <HoursBreakdown values={hours} onChange={setHours} disabled={isReadOnly} />

      {/* Next week plans */}
      <div className="space-y-2">
        <Label htmlFor="next-week" className="text-lg font-semibold text-slate-900">
          Plans for Next Week
        </Label>
        <Textarea
          id="next-week"
          value={tasksPlannedNextWeek}
          onChange={(e) => setTasksPlannedNextWeek(e.target.value)}
          placeholder="What are you planning to work on next week?"
          rows={4}
          maxLength={5000}
          disabled={isReadOnly}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-lg font-semibold text-slate-900">
          Additional Notes
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else worth mentioning?"
          rows={3}
          maxLength={5000}
          disabled={isReadOnly}
        />
      </div>

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          {canSubmit && (
            <Button
              onClick={handleSubmit}
              disabled={isSaving || isSubmitting}
              className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-800 hover:from-slate-800 hover:via-slate-700 hover:to-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
