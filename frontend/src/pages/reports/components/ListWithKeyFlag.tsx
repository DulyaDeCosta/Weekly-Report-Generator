import { useState } from "react"
import { Star, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ListItem {
  description: string
  isKey: boolean
}

interface ListWithKeyFlagProps {
  title: string
  items: ListItem[]
  onChange: (items: ListItem[]) => void
  addLabel: string
  placeholder: string
  keyLabel: string
  disabled?: boolean
}

export function ListWithKeyFlag({
  title,
  items,
  onChange,
  addLabel,
  placeholder,
  keyLabel,
  disabled,
}: ListWithKeyFlagProps) {
  const [newItem, setNewItem] = useState("")

  const handleAdd = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    if (trimmed.length > 1000) return
    onChange([...items, { description: trimmed, isKey: false }])
    setNewItem("")
  }

  const handleDelete = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleToggleKey = (index: number) => {
    const currentKey = items[index].isKey
    const newItems = items.map((item, i) => ({
      ...item,
      // If turning this ON, clear all other keys first
      isKey: i === index ? !currentKey : currentKey ? item.isKey : false,
    }))
    onChange(newItems)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

      {items.length === 0 && disabled ? (
        <div className="bg-white rounded-lg border border-slate-200 border-dashed p-6 text-center text-slate-500 text-sm">
          None added.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-slate-200 p-3 flex items-start gap-3"
            >
              <button
                type="button"
                onClick={() => handleToggleKey(index)}
                disabled={disabled}
                title={item.isKey ? `Unmark as ${keyLabel}` : `Mark as ${keyLabel}`}
                className={`
                  flex-shrink-0 mt-0.5 p-1 rounded transition-colors
                  ${
                    item.isKey
                      ? "text-amber-500 hover:text-amber-600"
                      : "text-slate-300 hover:text-slate-400"
                  }
                  ${disabled ? "cursor-not-allowed opacity-60" : ""}
                `}
              >
                <Star
                  className="h-5 w-5"
                  fill={item.isKey ? "currentColor" : "none"}
                />
              </button>
              <div className="flex-1 text-sm text-slate-700 whitespace-pre-wrap">
                {item.description}
              </div>
              {!disabled && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
          <Textarea
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            rows={2}
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {newItem.length}/1000 characters
            </span>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newItem.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              {addLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
