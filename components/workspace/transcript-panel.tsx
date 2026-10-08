'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, FileText, Search, SearchX, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/empty-state'
import { ParticipantAvatar } from '@/components/meetings/participant-avatars'
import { formatTimestamp } from '@/lib/format'
import { escapeRegExp } from '@/lib/transcript'
import type { TranscriptSegment } from '@/types/meeting'

function HighlightedText({ text, pattern }: { text: string; pattern: RegExp | null }) {
  if (!pattern) return <>{text}</>
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-amber-200/80 px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function TranscriptPanel({
  segments,
  activeIndex,
  onSelect,
}: {
  segments: TranscriptSegment[]
  activeIndex: number
  onSelect: (segment: TranscriptSegment) => void
}) {
  const [query, setQuery] = useState('')
  const [matchCursor, setMatchCursor] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)

  const trimmed = query.trim()
  const pattern = useMemo(() => (trimmed ? new RegExp(`(${escapeRegExp(trimmed)})`, 'gi') : null), [trimmed])

  const { matchIndices, totalMatches } = useMemo(() => {
    if (!pattern) return { matchIndices: [] as number[], totalMatches: 0 }
    const indices: number[] = []
    let total = 0
    segments.forEach((segment, index) => {
      const count = segment.text.match(pattern)?.length ?? 0
      if (count > 0) {
        indices.push(index)
        total += count
      }
    })
    return { matchIndices: indices, totalMatches: total }
  }, [segments, pattern])

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const list = listRef.current
    const item = list?.querySelector<HTMLElement>(`[data-index="${index}"]`)
    if (!list || !item) return
    const outOfView = item.offsetTop < list.scrollTop || item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight
    if (outOfView) list.scrollTo({ top: item.offsetTop - list.clientHeight / 3, behavior })
  }

  // Follow playback, but don't fight the user while they navigate search results.
  useEffect(() => {
    if (!pattern && activeIndex >= 0) scrollToIndex(activeIndex)
  }, [activeIndex, pattern])

  const goToMatch = (direction: 1 | -1) => {
    if (matchIndices.length === 0) return
    const next = (matchCursor + direction + matchIndices.length) % matchIndices.length
    setMatchCursor(next)
    scrollToIndex(matchIndices[next])
  }

  const updateQuery = (value: string) => {
    setQuery(value)
    setMatchCursor(0)
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0 }))
  }

  const focusedMatch = matchIndices[matchCursor]

  return (
    <section aria-label="Transcript" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
          Transcript
        </h2>
        <div className="flex flex-1 items-center gap-1 sm:justify-end">
          <div className="relative flex-1 sm:max-w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                goToMatch(e.shiftKey ? -1 : 1)
              }}
              placeholder="Search transcript"
              aria-label="Search transcript"
              className="h-8 bg-background pr-8 pl-8 text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery('')}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {pattern && (
            <div className="flex items-center gap-0.5">
              <span className="min-w-16 text-center text-xs text-muted-foreground tabular-nums" aria-live="polite">
                {totalMatches === 0
                  ? 'No results'
                  : `${matchCursor + 1}/${matchIndices.length} · ${totalMatches} hit${totalMatches === 1 ? '' : 's'}`}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => goToMatch(-1)}
                disabled={matchIndices.length === 0}
                aria-label="Previous match"
              >
                <ChevronUp />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => goToMatch(1)}
                disabled={matchIndices.length === 0}
                aria-label="Next match"
              >
                <ChevronDown />
              </Button>
            </div>
          )}
        </div>
      </div>

      {segments.length === 0 ? (
        <EmptyState compact icon={FileText} title="No transcript" description="Edit this meeting to add one." />
      ) : pattern && totalMatches === 0 ? (
        <EmptyState compact icon={SearchX} title={`No matches for “${trimmed}”`} />
      ) : null}

      <ol
        ref={listRef}
        className={cn(
          'relative max-h-[60vh] flex-1 overflow-y-auto p-1.5 lg:max-h-none',
          (segments.length === 0 || (pattern && totalMatches === 0)) && 'hidden',
        )}
      >
        {segments.map((segment, index) => {
          const isActive = index === activeIndex
          const isMatch = pattern ? matchIndices.includes(index) : true
          return (
            <li key={segment.id} data-index={index}>
              <button
                type="button"
                onClick={() => onSelect(segment)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex w-full gap-3 rounded-md border-l-2 border-transparent px-3 py-2.5 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50',
                  isActive && 'border-primary bg-primary/[0.06] hover:bg-primary/[0.08]',
                  !isMatch && 'opacity-40',
                  focusedMatch === index && 'ring-1 ring-amber-300',
                )}
              >
                <ParticipantAvatar name={segment.speaker} className="mt-0.5" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-xs font-medium">{segment.speaker}</span>
                    <span
                      className={cn(
                        'text-[11px] tabular-nums text-muted-foreground',
                        isActive && 'font-medium text-primary',
                      )}
                    >
                      {formatTimestamp(segment.start)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-pretty text-foreground/90">
                    <HighlightedText text={segment.text} pattern={pattern} />
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
