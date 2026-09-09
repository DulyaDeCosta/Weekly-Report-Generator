import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import { FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { reportsApi, type Report, type ReportStatus } from "@/lib/api/reports"
import type { AxiosError } from "axios"

const STATUS_STYLES: Record<ReportStatus, string> = {
  DRAFT: "bg-slate-200 text-slate-700 hover:bg-slate-200",
  SUBMITTED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  NEEDS_CORRECTION: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  APPROVED: "bg-green-100 text-green-800 hover:bg-green-100",
}

const STATUS_LABEL: Record<ReportStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs Correction",
  APPROVED: "Approved",
}

export function ReportHistoryPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const limit = 10

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const data = await reportsApi.listMine({ page, limit })
        setReports(data.items)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        toast.error(
          axiosError.response?.data?.message ?? "Failed to load reports",
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchReports()
  }, [page])

  const formatWeek = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Report History</h1>
        <p className="text-slate-500 mt-1">
          All your weekly reports, most recent first
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <div className="text-slate-900 font-medium mb-1">No reports yet</div>
          <div className="text-slate-500 text-sm">
            When you create your first weekly report, it will appear here.
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {formatWeek(report.weekStartDate, report.weekEndDate)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {report.project?.name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[report.status]}>
                        {STATUS_LABEL[report.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {report.submittedAt
                        ? format(new Date(report.submittedAt), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {format(new Date(report.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/reports/${report.id}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Page {page} of {totalPages} ({total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
