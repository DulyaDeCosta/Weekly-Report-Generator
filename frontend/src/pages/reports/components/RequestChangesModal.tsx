import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface RequestChangesModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (comment: string) => Promise<void>
  isSubmitting: boolean
}

export function RequestChangesModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: RequestChangesModalProps) {
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setComment("")
      setError("")
    }
  }, [open])

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Please provide a comment explaining what needs to change")
      return
    }
    setError("")
    await onSubmit(comment.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">
              What needs to change? <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain what the member should update or add..."
              rows={5}
              maxLength={2000}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                {comment.length}/2000 characters
              </span>
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSubmitting ? "Sending..." : "Send Back for Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
