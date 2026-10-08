'use client'

import { ArrowUpDown, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type DateRange = 'any' | '7d' | '30d' | '90d'

export type SortOrder = 'newest' | 'oldest' | 'longest' | 'title'

export interface FilterState {
  query: string
  participant: string
  dateRange: DateRange
  sort: SortOrder
}

export const defaultFilters: FilterState = { query: '', participant: 'all', dateRange: 'any', sort: 'newest' }

const sortItems = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'longest', label: 'Longest first' },
  { value: 'title', label: 'Title A–Z' },
]

export function sortMeetings<T extends { date: string; duration: number; title: string }>(
  meetings: T[],
  sort: SortOrder,
): T[] {
  const sorted = [...meetings]
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    case 'longest':
      return sorted.sort((a, b) => b.duration - a.duration)
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

const dateRangeItems = [
  { value: 'any', label: 'Any time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

export function MeetingFilters({
  filters,
  onChange,
  participants,
}: {
  filters: FilterState
  onChange: (filters: FilterState) => void
  participants: string[]
}) {
  const participantItems = [
    { value: 'all', label: 'All participants' },
    ...participants.map((name) => ({ value: name, label: name })),
  ]
  const isFiltered =
    filters.query !== '' || filters.participant !== 'all' || filters.dateRange !== 'any'

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="relative flex-1 lg:max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search titles, transcripts, summaries…"
          aria-label="Search meetings"
          className="bg-card pl-8"
        />
      </div>

      <div className="flex flex-wrap gap-2 lg:flex-1">
        <Select
          items={participantItems}
          value={filters.participant}
          onValueChange={(value) => onChange({ ...filters, participant: (value as string) ?? 'all' })}
        >
          <SelectTrigger aria-label="Filter by participant" className="min-w-0 flex-1 bg-card sm:w-44 sm:flex-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {participantItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={dateRangeItems}
          value={filters.dateRange}
          onValueChange={(value) => onChange({ ...filters, dateRange: (value as DateRange) ?? 'any' })}
        >
          <SelectTrigger aria-label="Filter by date" className="min-w-0 flex-1 bg-card sm:w-36 sm:flex-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRangeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => onChange({ ...defaultFilters, sort: filters.sort })}
            className="shrink-0"
          >
            <X data-icon="inline-start" />
            Clear
          </Button>
        )}

        <Select
          items={sortItems}
          value={filters.sort}
          onValueChange={(value) => onChange({ ...filters, sort: (value as SortOrder) ?? 'newest' })}
        >
          <SelectTrigger aria-label="Sort meetings" className="min-w-0 flex-1 bg-card sm:w-36 sm:flex-none lg:ml-auto">
            <ArrowUpDown className="text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

const rangeDays: Record<DateRange, number | null> = { any: null, '7d': 7, '30d': 30, '90d': 90 }

export function matchesFilters(
  meeting: {
    title: string
    date: string
    participants: { name: string }[]
    transcript: { text: string; speaker: string }[]
    summary: { overview: string; keyTopics: string[] } | null
  },
  filters: FilterState,
  now: number,
) {
  if (filters.participant !== 'all' && !meeting.participants.some((p) => p.name === filters.participant)) {
    return false
  }
  const days = rangeDays[filters.dateRange]
  if (days !== null && now - new Date(meeting.date).getTime() > days * 86_400_000) return false

  const q = filters.query.trim().toLowerCase()
  if (!q) return true
  return (
    meeting.title.toLowerCase().includes(q) ||
    meeting.participants.some((p) => p.name.toLowerCase().includes(q)) ||
    meeting.summary?.overview.toLowerCase().includes(q) ||
    meeting.summary?.keyTopics.some((t) => t.toLowerCase().includes(q)) ||
    meeting.transcript.some((s) => s.text.toLowerCase().includes(q))
  )
}
