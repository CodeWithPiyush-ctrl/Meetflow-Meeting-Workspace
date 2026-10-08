'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileQuestion, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { DeleteMeetingDialog } from '@/components/meetings/delete-meeting-dialog'
import { MeetingFormDialog } from '@/components/meetings/meeting-form-dialog'
import { MeetingHeader } from '@/components/workspace/meeting-header'
import { MediaPlayer } from '@/components/workspace/media-player'
import { SummaryPanel } from '@/components/workspace/summary-panel'
import { TranscriptPanel } from '@/components/workspace/transcript-panel'
import { ApiError } from '@/lib/api'
import { useMeeting } from '@/lib/hooks/use-meetings'
import { usePlayback } from '@/lib/hooks/use-playback'
import { findActiveSegmentIndex } from '@/lib/transcript'
import type { Meeting } from '@/types/meeting'

function WorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading meeting">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-72 max-w-full" />
        <Skeleton className="h-3 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-6 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  )
}

function Workspace({ meeting }: { meeting: Meeting }) {
  const router = useRouter()
  const playback = usePlayback(meeting.duration)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const activeIndex = findActiveSegmentIndex(meeting.transcript, playback.currentTime)
  const readOnly = meeting.source !== 'owned'

  return (
    <div className="flex flex-col gap-5 lg:h-full">
      <MeetingHeader meeting={meeting} onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-4">
          <MediaPlayer playback={playback} speaker={meeting.transcript[activeIndex]?.speaker} />
          <TranscriptPanel
            segments={meeting.transcript}
            activeIndex={activeIndex}
            onSelect={(segment) => playback.seek(segment.start)}
          />
        </div>
        <SummaryPanel
          meeting={meeting}
          currentTime={playback.currentTime}
          readOnly={readOnly}
          onSeek={playback.seek}
        />
      </div>

      <MeetingFormDialog open={editOpen} onOpenChange={setEditOpen} meeting={meeting} />
      <DeleteMeetingDialog
        meeting={deleteOpen ? meeting : null}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push('/')}
      />
    </div>
  )
}

export function MeetingWorkspace({ id }: { id: string }) {
  const { meeting, error, isLoading, mutate } = useMeeting(id)

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:h-dvh lg:py-6">
      {isLoading ? (
        <WorkspaceSkeleton />
      ) : error instanceof ApiError && error.status === 404 ? (
        <EmptyState
          icon={FileQuestion}
          title="Meeting not found"
          description="It may have been deleted, or the link is incorrect."
          action={<Button render={<Link href="/" />} nativeButton={false}>Back to meetings</Button>}
        />
      ) : error || !meeting ? (
        <EmptyState
          icon={RefreshCw}
          title="Couldn’t load this meeting"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => mutate()}>
              Retry
            </Button>
          }
        />
      ) : (
        <Workspace key={meeting.id} meeting={meeting} />
      )}
    </div>
  )
}
