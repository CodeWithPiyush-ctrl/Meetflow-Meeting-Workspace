import type { TranscriptSegment } from '@/types/meeting'
import { formatTimestamp } from '@/lib/format'

const LINE_PATTERN =
  /^\s*(?:\[?((?:\d{1,2}:)?\d{1,2}:\d{2})\]?\s+)?([^:\n]{1,48}):\s*(.+)$/

function parseTimestamp(value: string): number {
  return value
    .split(':')
    .map(Number)
    .reduce((acc, part) => acc * 60 + part, 0)
}

/**
 * Parses plain-text transcripts. Each line should look like
 * "[00:12] Speaker Name: what they said" — the timestamp is optional.
 * Lines without timestamps are distributed evenly across the duration.
 */
export function parseTranscript(raw: string, duration: number): TranscriptSegment[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const drafts: { start: number | null; speaker: string; text: string }[] = []

  for (const line of lines) {
    const match = line.match(LINE_PATTERN)
    if (match) {
      drafts.push({
        start: match[1] ? parseTimestamp(match[1]) : null,
        speaker: match[2].trim(),
        text: match[3].trim(),
      })
    } else if (drafts.length > 0) {
      drafts[drafts.length - 1].text += ` ${line}`
    } else {
      drafts.push({ start: null, speaker: 'Speaker', text: line })
    }
  }

  if (drafts.length === 0) return []

  const safeDuration = Math.max(duration, drafts.length)
  const step = safeDuration / drafts.length

  const starts = drafts.map((draft, index) =>
    draft.start !== null ? Math.min(draft.start, safeDuration) : Math.round(index * step),
  )

  return drafts.map((draft, index) => ({
    id: `seg-${index}-${Math.random().toString(36).slice(2, 8)}`,
    start: starts[index],
    end: index < drafts.length - 1 ? Math.max(starts[index + 1], starts[index]) : safeDuration,
    speaker: draft.speaker,
    text: draft.text,
  }))
}

export function serializeTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map((segment) => `[${formatTimestamp(segment.start)}] ${segment.speaker}: ${segment.text}`)
    .join('\n')
}

export function findActiveSegmentIndex(segments: TranscriptSegment[], time: number): number {
  let active = -1
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].start <= time) active = i
    else break
  }
  return active
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
