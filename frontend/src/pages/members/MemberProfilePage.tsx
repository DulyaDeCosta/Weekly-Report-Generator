import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import { ArrowLeft, Mail, Calendar, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usersApi } from "@/lib/api/users"
import { reportsApi, type Report, type ReportStatus } from "@/lib/api/reports"
import type { User } from "@/lib/api/auth"
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

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  MANAGER: "bg-blue-100 text-blue-800",
  MEMBER: "bg-slate-100 text-slate-700",
}

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [member, setMember] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const limit = 10

  useEffect(() => {
    if (!id) {
      navigate("/reports", { replace: true })
      return
    }
    const load = async () => {
      setIsLoading(true)
      try {
        const [userData, reportsData] = await Promise.all([
          usersApi.getById(id),
          reportsApi.listAll({ authorId: id, page, limit }),
        ])
        setMember(userData)
        setReports(reportsData.items)
        setTotalPages(reportsData.totalPages)
        setTotal(reportsData.total)
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        toast.error(
          axiosError.response?.data?.message ?? "Failed to load member profile",
        )
        navigate("/reports", { replace: true })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, page, navigate])

  const formatWeek = (start: string, end: string) =>
    `${format(new Date(start), "MMM d")} - ${format(new Date(end), "MMM d, yyyy")}`

  // Compute summary metrics from loaded reports (visible page only — good enough for demo)
  const submittedCount = reports.filter((r) => r.status === "SUBMITTED").length
  const approvedCount = reports.filter((r) => r.status === "APPROVED").length
  const needsCorrectionCount = reports.filter(
    (r) => r.status === "NEEDS_CORRECTION",
  ).length

  if (isLoading) {
    return <div className="text-center text-slate-500 py-12">Loading...</div>
  }

  if (!member) return null

  return (
    <div className="space-y-6">
      <Link
        to="/reports"
        className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Reports
      </Link>

      {/* Member header card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-100 rounded-full">
            <UserIcon className="h-8 w-8 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {member.name}
              </h1>
              <Badge className={ROLE_STYLES[member.role]}>{member.role}</Badge>
            </div>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {member.email}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Joined {format(new Date(member.createdAt), "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500 font-medium">
            Total Reports
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{total}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500 font-medium">
            Awaiting Review (visible page)
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {submittedCount}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500 font-medium">
            Approved (visible page)
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {approvedCount + needsCorrectionCount > 0
              ? approvedCount
              : approvedCount}
          </div>
        </div>
      </div>

      {/* Reports table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Report History
        </h2>
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No submitted reports yet.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
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
                      <TableCell className="text-slate-600">
                        {report.project?.name ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[report.status]}>
                          {STATUS_LABEL[report.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
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
              <div className="flex items-center justify-between mt-4">
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
    </div>
  )
}
