import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReportForm } from "./components/ReportForm"
import { ReviewActionsBar } from "./components/ReviewActionsBar"
import { ReviewHistoryList } from "./components/ReviewHistoryList"
import { useAuth } from "@/context/AuthContext"
import { reportsApi, type Report } from "@/lib/api/reports"
import type { AxiosError } from "axios"

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate("/", { replace: true })
      return
    }
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await reportsApi.findOne(id)
        setReport(data)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        const status = axiosError.response?.status
        if (status === 404) {
          toast.error("Report not found")
        } else if (status === 403) {
          toast.error("You cannot view this report")
        } else {
          toast.error(
            axiosError.response?.data?.message ?? "Failed to load report",
          )
        }
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, navigate])

  if (isLoading) {
    return <div className="text-center text-slate-500 py-12">Loading...</div>
  }

  if (!report || !user) return null

  const isOwner = report.authorId === user.id
  const isPrivilegedRole = user.role === "MANAGER" || user.role === "ADMIN"
  const canReview = isPrivilegedRole && !isOwner && report.status === "SUBMITTED"

  // For MEMBER viewing own report — the ReportForm handles read-only vs editable based on status
  // For MANAGER/ADMIN viewing others' reports — force read-only (they should not edit content)
  // We enforce this by treating the report as if it's in a locked state visually
  const forceReadOnly = isPrivilegedRole && !isOwner

  const backLink = isOwner
    ? "/reports/history"
    : "/reports"
  const backLabel = isOwner ? "Back to Report History" : "Back to All Reports"

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={backLink}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>

      {canReview && (
        <ReviewActionsBar report={report} onReportUpdate={setReport} />
      )}

      {report.reviewActions && report.reviewActions.length > 0 && (
        <ReviewHistoryList actions={report.reviewActions} />
      )}

      <ReportForm
        report={report}
        onReportUpdate={setReport}
        forceReadOnly={forceReadOnly}
      />
    </div>
  )
}
