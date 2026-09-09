import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import { FileText, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  reportsApi,
  type Report,
  type ReportStatus,
} from "@/lib/api/reports"
import { projectsApi } from "@/lib/api/projects"
import type { Project } from "@/lib/api/reports"
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

const REVIEWABLE_STATUSES: ReportStatus[] = [
  "SUBMITTED",
  "NEEDS_CORRECTION",
  "APPROVED",
]

export function AllReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("")
  const [projectFilter, setProjectFilter] = useState<string>("")

  const limit = 10

  useEffect(() => {
    projectsApi.listAll().then(setProjects).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const params: {
          page: number
          limit: number
          status?: ReportStatus
          projectId?: string
        } = { page, limit }
        if (statusFilter) params.status = statusFilter
        if (projectFilter) params.projectId = projectFilter

        const data = await reportsApi.listAll(params)
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
  }, [page, statusFilter, projectFilter])

  const formatWeek = (start: string, end: string) => {
    return `${format(new Date(start), "MMM d")} - ${format(
      new Date(end),
      "MMM d, yyyy",
    )}`
  }

  const clearFilters = () => {
    setStatusFilter("")
    setProjectFilter("")
    setPage(1)
  }

  const hasFilters = statusFilter !== "" || projectFilter !== ""

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">All Reports</h1>
        <p className="text-slate-500 mt-1">
          Review submitted reports across the team
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-wrap items-end gap-4">
        <div className="space-y-1 min-w-[200px]">
          <Label htmlFor="status-filter" className="text-xs">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter((value ?? "") as ReportStatus | "")
              setPage(1)
            }}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All statuses">
                {statusFilter ? STATUS_LABEL[statusFilter] : "All statuses"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {REVIEWABLE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABEL[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 min-w-[200px]">
          <Label htmlFor="project-filter" className="text-xs">Project</Label>
          <Select
            value={projectFilter}
            onValueChange={(value) => {
              setProjectFilter(value ?? "")
              setPage(1)
            }}
          >
            <SelectTrigger id="project-filter">
              <SelectValue placeholder="All projects">
                {projectFilter
                  ? projects.find((p) => p.id === projectFilter)?.name
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
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <div className="text-slate-900 font-medium mb-1">No reports found</div>
          <div className="text-slate-500 text-sm">
            {hasFilters
              ? "Try adjusting your filters."
              : "No team reports have been submitted yet."}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {formatWeek(report.weekStartDate, report.weekEndDate)}
                    </TableCell>
                    <TableCell>
                    {report.author ? (
                        <Link
                        to={`/members/${report.author.id}`}
                        className="text-slate-700 hover:text-blue-600 hover:underline font-medium"
                        >
                        {report.author.name}
                        </Link>
                    ) : (
                        <span className="text-slate-700">-</span>
                    )}
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
