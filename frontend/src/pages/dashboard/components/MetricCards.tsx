import { FileText, Clock, CheckCircle2, Users } from "lucide-react"
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
    key: "activeMembers" as const,
    label: "Active Members",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
]

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className="bg-white rounded-lg border border-slate-200 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500 font-medium">
                  {card.label}
                </div>
                <div className="text-3xl font-bold text-slate-900 mt-1">
                  {metrics[card.key]}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
