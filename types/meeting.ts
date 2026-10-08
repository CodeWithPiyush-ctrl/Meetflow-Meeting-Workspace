export interface Participant {
  id: string
  name: string
  email?: string
}

export interface TranscriptSegment {
  id: string
  /** Start time in seconds from the beginning of the recording */
  start: number
  /** End time in seconds from the beginning of the recording */
  end: number
  speaker: string
  text: string
}

export interface OutlineSection {
  id: string
  start: number
  title: string
  points: string[]
}

export interface MeetingSummary {
  overview: string
  keyTopics: string[]
  outline: OutlineSection[]
}

export interface ActionItem {
  id: string
  text: string
  assignee: string | null
  completed: boolean
}

export type MeetingSource = 'owned' | 'shared'

export interface Meeting {
  id: string
  title: string
  /** ISO 8601 timestamp */
  date: string
  /** Duration in seconds */
  duration: number
  participants: Participant[]
  transcript: TranscriptSegment[]
  summary: MeetingSummary | null
  actionItems: ActionItem[]
  starred: boolean
  source: MeetingSource
  sharedBy?: string
}

export interface MeetingInput {
  title: string
  date: string
  duration: number
  participants: string[]
  transcript: string
}

export interface ActionItemInput {
  text: string
  assignee: string | null
}
