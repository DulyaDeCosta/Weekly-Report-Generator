import { FileText, Clock, CheckCircle2, Users, AlertTriangle, ShieldAlert } from "lucide-react"
import type { DashboardStats } from "@/lib/api/dashboard"

interface MetricCardsProps {
  metrics: DashboardStats["metrics"]
}

const CARDS = [
  {
    key: "reportsThisWeek" as const,
    label: "Reports This Period",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "awaitingReview" as const,
    label: "Awaiting Review",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "approvedThisWeek" as const,
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "needsCorrection" as const,
    label: "Needs Correction",
    icon: ShieldAlert,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    key: "openBlockers" as const,
    label: "Open Blockers",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    key: "activeMembers" as const,
    label: "Active Members",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
]

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className="bg-white rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-500 font-medium truncate">
                  {card.label}
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {metrics[card.key]}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${card.bg} flex-shrink-0 ml-2`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
