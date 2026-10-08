'use client'

import Link from 'next/link'
import { Calendar, ChevronLeft, Clock, Pencil, Share2, Star, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ParticipantAvatarStack, participantSummary } from '@/components/meetings/participant-avatars'
import { formatDuration, formatMeetingDateTime } from '@/lib/format'
import { useMeetingMutations } from '@/lib/hooks/use-meetings'
import type { Meeting } from '@/types/meeting'

export function MeetingHeader({
  meeting,
  onEdit,
  onDelete,
}: {
  meeting: Meeting
  onEdit: () => void
  onDelete: () => void
}) {
  const { setStarred } = useMeetingMutations()
  const canManage = meeting.source === 'owned'

  const toggleStar = async () => {
    try {
      await setStarred(meeting, !meeting.starred)
      toast.success(meeting.starred ? 'Removed from starred' : 'Added to starred')
    } catch {
      toast.error('Could not update star')
    }
  }

  return (
    <header className="flex flex-col gap-3">
      <Link
        href={meeting.source === 'shared' ? '/shared' : '/'}
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" aria-hidden="true" />
        {meeting.source === 'shared' ? 'Shared with me' : 'Meetings'}
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-lg leading-tight font-semibold text-balance">{meeting.title}</h1>
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <dt>
                <Calendar className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Date</span>
              </dt>
              <dd>
                <time dateTime={meeting.date}>{formatMeetingDateTime(meeting.date)}</time>
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>
                <Clock className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Duration</span>
              </dt>
              <dd>{formatDuration(meeting.duration)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>
                <Users className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Participants</span>
              </dt>
              <dd className="flex items-center gap-2">
                <ParticipantAvatarStack participants={meeting.participants} max={5} />
                <span>{participantSummary(meeting.participants, 3)}</span>
              </dd>
            </div>
            {meeting.sharedBy && (
              <div className="flex items-center gap-1.5">
                <dt>
                  <Share2 className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Shared by</span>
                </dt>
                <dd>Shared by {meeting.sharedBy} · View only</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleStar}
            aria-pressed={meeting.starred}
            aria-label={meeting.starred ? 'Unstar meeting' : 'Star meeting'}
          >
            <Star className={cn(meeting.starred && 'fill-amber-400 text-amber-400')} />
          </Button>
          {canManage && (
            <>
              <Button variant="outline" onClick={onEdit}>
                <Pencil data-icon="inline-start" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={onDelete}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 data-icon="inline-start" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
