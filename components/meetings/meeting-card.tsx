'use client'

import Link from 'next/link'
import { Calendar, CheckSquare, Clock, MoreHorizontal, Pencil, Sparkles, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ParticipantAvatarStack, participantSummary } from '@/components/meetings/participant-avatars'
import { formatDuration, formatMeetingDate } from '@/lib/format'
import { useMeetingMutations } from '@/lib/hooks/use-meetings'
import type { Meeting } from '@/types/meeting'

export function MeetingCard({
  meeting,
  onEdit,
  onDelete,
}: {
  meeting: Meeting
  onEdit: (meeting: Meeting) => void
  onDelete: (meeting: Meeting) => void
}) {
  const { setStarred } = useMeetingMutations()
  const openItems = meeting.actionItems.filter((a) => !a.completed).length
  const canManage = meeting.source === 'owned'

  const toggleStar = async () => {
    try {
      await setStarred(meeting, !meeting.starred)
    } catch {
      toast.error('Could not update star')
    }
  }

  return (
    <li className="group relative flex flex-col gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20 focus-within:border-ring">
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Link
            href={`/meetings/${meeting.id}`}
            className="line-clamp-2 text-sm leading-snug font-medium outline-none after:absolute after:inset-0 after:rounded-lg"
          >
            {meeting.title}
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" aria-hidden="true" />
              <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" />
              {formatDuration(meeting.duration)}
            </span>
          </div>
        </div>

        <div className="relative z-10 -mt-1 -mr-1.5 flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleStar}
            aria-pressed={meeting.starred}
            aria-label={meeting.starred ? `Unstar ${meeting.title}` : `Star ${meeting.title}`}
            className="text-muted-foreground"
          >
            <Star className={cn('size-4', meeting.starred && 'fill-amber-400 text-amber-400')} />
          </Button>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    aria-label={`Actions for ${meeting.title}`}
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => onEdit(meeting)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(meeting)}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {meeting.summary ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{meeting.summary.overview}</p>
      ) : (
        <p className="text-xs text-muted-foreground italic">No summary yet</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <ParticipantAvatarStack participants={meeting.participants} max={4} />
          <span className="truncate text-xs text-muted-foreground">
            {meeting.sharedBy ? `Shared by ${meeting.sharedBy}` : participantSummary(meeting.participants)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          {meeting.summary && (
            <span className="flex items-center gap-1" title="AI summary available">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              <span className="sr-only">AI summary available</span>
            </span>
          )}
          <span className="flex items-center gap-1 tabular-nums" title={`${openItems} open action items`}>
            <CheckSquare className="size-3.5" aria-hidden="true" />
            {openItems}
            <span className="sr-only">open action items</span>
          </span>
        </div>
      </div>
    </li>
  )
}
