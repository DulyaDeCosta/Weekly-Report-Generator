import { useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, MessageSquareWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RequestChangesModal } from "./RequestChangesModal"
import { reportsApi, type Report } from "@/lib/api/reports"
import type { AxiosError } from "axios"

interface ReviewActionsBarProps {
  report: Report
  onReportUpdate: (report: Report) => void
}

export function ReviewActionsBar({ report, onReportUpdate }: ReviewActionsBarProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleApprove = async () => {
    if (!confirm("Approve this report?")) return
    setIsApproving(true)
    try {
      const updated = await reportsApi.review(report.id, {
        actionType: "APPROVED",
      })
      onReportUpdate(updated)
      toast.success("Report approved")
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to approve",
      )
    } finally {
      setIsApproving(false)
    }
  }

  const handleRequestChanges = async (comment: string) => {
    setIsRequesting(true)
    try {
      const updated = await reportsApi.review(report.id, {
        actionType: "REQUESTED_CHANGES",
        comment,
      })
      onReportUpdate(updated)
      toast.success("Report sent back for changes")
      setModalOpen(false)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data?.message ?? "Failed to request changes",
      )
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-blue-900">
          <div className="font-medium">This report is awaiting your review</div>
          <div className="text-blue-800 mt-0.5">
            Approve it, or send it back with feedback for changes.
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setModalOpen(true)}
            disabled={isApproving || isRequesting}
            className="bg-white"
          >
            <MessageSquareWarning className="h-4 w-4 mr-2" />
            Request Changes
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isApproving || isRequesting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        </div>
      </div>

      <RequestChangesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRequestChanges}
        isSubmitting={isRequesting}
      />
    </>
  )
}
