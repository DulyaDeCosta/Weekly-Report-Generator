import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface HoursValues {
  hoursDevelopment: number
  hoursTesting: number
  hoursMeetings: number
  hoursDocumentation: number
}

interface HoursBreakdownProps {
  values: HoursValues
  onChange: (values: HoursValues) => void
  disabled?: boolean
}

const FIELDS: Array<{ key: keyof HoursValues; label: string }> = [
  { key: "hoursDevelopment", label: "Development" },
  { key: "hoursTesting", label: "Testing" },
  { key: "hoursMeetings", label: "Meetings" },
  { key: "hoursDocumentation", label: "Documentation" },
]

export function HoursBreakdown({ values, onChange, disabled }: HoursBreakdownProps) {
  const total =
    values.hoursDevelopment +
    values.hoursTesting +
    values.hoursMeetings +
    values.hoursDocumentation

  const handleChange = (key: keyof HoursValues, value: string) => {
    const num = Math.max(0, parseInt(value) || 0)
    onChange({ ...values, [key]: num })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Time Breakdown</h2>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={field.key} className="text-sm text-slate-600">
                {field.label}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={field.key}
                  type="number"
                  min={0}
                  value={values[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  disabled={disabled}
                  className="w-24"
                />
                <span className="text-sm text-slate-500">hours</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Total</span>
          <span className="text-lg font-semibold text-slate-900">
            {total} hours
          </span>
        </div>
      </div>
    </div>
  )
}
