import { format } from "date-fns"
import { CheckCircle2, MessageSquareWarning, History } from "lucide-react"
import type { ReviewAction } from "@/lib/api/reports"

interface ReviewHistoryListProps {
  actions: ReviewAction[]
}

export function ReviewHistoryList({ actions }: ReviewHistoryListProps) {
  if (!actions || actions.length === 0) return null

  // Sort newest first
  const sorted = [...actions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-slate-600" />
        <h2 className="text-sm font-semibold text-slate-900">Review History</h2>
        <span className="text-xs text-slate-500">
          ({actions.length} {actions.length === 1 ? "action" : "actions"})
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map((action) => {
          const isApproval = action.actionType === "APPROVED"
          const Icon = isApproval ? CheckCircle2 : MessageSquareWarning
          const iconColor = isApproval ? "text-green-600" : "text-amber-600"
          const label = isApproval ? "Approved" : "Requested changes"
          const reviewerName = action.reviewer?.name ?? "Unknown reviewer"

          return (
            <div
              key={action.id}
              className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
            >
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-sm font-medium text-slate-900">
                    {reviewerName}
                  </span>
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="text-xs text-slate-400">
                    {format(new Date(action.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {action.comment && (
                  <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                    {action.comment}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
