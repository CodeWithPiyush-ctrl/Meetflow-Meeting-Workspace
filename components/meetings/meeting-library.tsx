'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Plus, SearchX, Star, Users, Video, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { DeleteMeetingDialog } from '@/components/meetings/delete-meeting-dialog'
import {
  MeetingFilters,
  defaultFilters,
  matchesFilters,
  sortMeetings,
  type FilterState,
} from '@/components/meetings/meeting-filters'
import { MeetingCard } from '@/components/meetings/meeting-card'
import { MeetingFormDialog } from '@/components/meetings/meeting-form-dialog'
import { useMeetings } from '@/lib/hooks/use-meetings'
import type { Meeting } from '@/types/meeting'

export type LibraryView = 'all' | 'starred' | 'shared'

const viewConfig: Record<
  LibraryView,
  { title: string; description: string; icon: LucideIcon; emptyTitle: string; emptyDescription: string; filter: (m: Meeting) => boolean }
> = {
  all: {
    title: 'Meetings',
    description: 'Recordings, transcripts, and AI summaries from your meetings.',
    icon: Video,
    emptyTitle: 'No meetings yet',
    emptyDescription: 'Create a meeting by pasting a transcript to get a searchable record and summary.',
    filter: (m) => m.source === 'owned',
  },
  starred: {
    title: 'Starred',
    description: 'Meetings you have starred for quick access.',
    icon: Star,
    emptyTitle: 'No starred meetings',
    emptyDescription: 'Star a meeting from your library to pin it here.',
    filter: (m) => m.starred,
  },
  shared: {
    title: 'Shared with me',
    description: 'Meetings teammates have shared with you.',
    icon: Users,
    emptyTitle: 'Nothing shared yet',
    emptyDescription: 'When a teammate shares a meeting with you, it will appear here.',
    filter: (m) => m.source === 'shared',
  },
}

export function MeetingLibrary({ view }: { view: LibraryView }) {
  const router = useRouter()
  const config = viewConfig[view]
  const { meetings, error, isLoading, mutate } = useMeetings()
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Meeting | undefined>()
  const [deleting, setDeleting] = useState<Meeting | null>(null)

  const viewMeetings = useMemo(() => (meetings ?? []).filter(config.filter), [meetings, config])

  const participants = useMemo(
    () => Array.from(new Set(viewMeetings.flatMap((m) => m.participants.map((p) => p.name)))).sort(),
    [viewMeetings],
  )

  const visible = useMemo(() => {
    const now = Date.now()
    return sortMeetings(
      viewMeetings.filter((m) => matchesFilters(m, filters, now)),
      filters.sort,
    )
  }, [viewMeetings, filters])

  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-balance">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Button onClick={openCreate} className="self-start sm:self-auto">
          <Plus data-icon="inline-start" />
          New meeting
        </Button>
      </header>

      {viewMeetings.length > 0 && (
        <MeetingFilters filters={filters} onChange={setFilters} participants={participants} />
      )}

      {error ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load meetings"
          description="Something went wrong while fetching your meetings."
          action={
            <Button variant="outline" onClick={() => mutate()}>
              Try again
            </Button>
          }
        />
      ) : isLoading ? (
        <LibrarySkeleton />
      ) : viewMeetings.length === 0 ? (
        <EmptyState
          icon={config.icon}
          title={config.emptyTitle}
          description={config.emptyDescription}
          action={
            view === 'all' ? (
              <Button onClick={openCreate}>
                <Plus data-icon="inline-start" />
                New meeting
              </Button>
            ) : undefined
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching meetings"
          description="Try a different search term or clear your filters."
          action={
            <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <section aria-label={`${config.title} list`} className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {visible.length} {visible.length === 1 ? 'meeting' : 'meetings'}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onEdit={(m) => {
                  setEditing(m)
                  setFormOpen(true)
                }}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        </section>
      )}

      <MeetingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        meeting={editing}
        onSaved={(saved) => {
          if (!editing) router.push(`/meetings/${saved.id}`)
        }}
      />
      <DeleteMeetingDialog
        meeting={deleting}
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  )
}

function LibrarySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading meetings">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="flex items-center gap-2 border-t pt-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
