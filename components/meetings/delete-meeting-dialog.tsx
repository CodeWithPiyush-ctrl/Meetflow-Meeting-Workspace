'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMeetingMutations } from '@/lib/hooks/use-meetings'
import type { Meeting } from '@/types/meeting'

export function DeleteMeetingDialog({
  meeting,
  open,
  onOpenChange,
  onDeleted,
}: {
  meeting: Meeting | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const { deleteMeeting } = useMeetingMutations()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!meeting) return
    setDeleting(true)
    try {
      await deleteMeeting(meeting.id)
      toast.success('Meeting deleted', { description: meeting.title })
      onOpenChange(false)
      onDeleted?.()
    } catch {
      toast.error('Could not delete meeting', { description: 'Please try again.' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !deleting && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this meeting?</AlertDialogTitle>
          <AlertDialogDescription>
            {meeting ? (
              <>
                <span className="font-medium text-foreground">{meeting.title}</span> and its transcript,
                summary, and action items will be permanently deleted. This cannot be undone.
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="animate-spin" data-icon="inline-start" />}
            Delete meeting
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
