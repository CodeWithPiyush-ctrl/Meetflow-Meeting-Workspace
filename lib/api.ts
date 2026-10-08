/**
 * MeetFlow API client.
 *
 * Every data operation in the app goes through this module. Right now it is
 * backed by an in-memory mock store. To connect a FastAPI backend, replace each
 * function body with a `request()` call — the commented endpoint above each
 * function shows the intended route. Components and hooks do not need to change.
 */
import type {
  ActionItem,
  ActionItemInput,
  Meeting,
  MeetingInput,
  Participant,
} from '@/types/meeting'
import { mockMeetings } from '@/lib/mock-data'
import { parseTranscript } from '@/lib/transcript'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Ready-to-use fetch wrapper for when the FastAPI backend is available. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.statusText}`, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Mock store
// ---------------------------------------------------------------------------

let store: Meeting[] = structuredClone(mockMeetings)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function findMeeting(id: string): Meeting {
  const meeting = store.find((m) => m.id === id)
  if (!meeting) throw new ApiError('Meeting not found', 404)
  return meeting
}

function saveMeeting(updated: Meeting): Meeting {
  store = store.map((m) => (m.id === updated.id ? updated : m))
  return structuredClone(updated)
}

function toParticipants(names: string[], existing: Participant[] = []): Participant[] {
  return names.map((name) => existing.find((p) => p.name === name) ?? { id: uid('p'), name })
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

// GET /meetings
export async function listMeetings(): Promise<Meeting[]> {
  await delay(450)
  return structuredClone(store)
}

// GET /meetings/{id}
export async function getMeeting(id: string): Promise<Meeting> {
  await delay(400)
  return structuredClone(findMeeting(id))
}

// POST /meetings
export async function createMeeting(input: MeetingInput): Promise<Meeting> {
  await delay(500)
  const meeting: Meeting = {
    id: uid('mtg'),
    title: input.title.trim(),
    date: input.date,
    duration: input.duration,
    participants: toParticipants(input.participants),
    transcript: parseTranscript(input.transcript, input.duration),
    summary: null,
    actionItems: [],
    starred: false,
    source: 'owned',
  }
  store = [meeting, ...store]
  return structuredClone(meeting)
}

// PATCH /meetings/{id}
export async function updateMeeting(id: string, input: MeetingInput): Promise<Meeting> {
  await delay(450)
  const meeting = findMeeting(id)
  return saveMeeting({
    ...meeting,
    title: input.title.trim(),
    date: input.date,
    duration: input.duration,
    participants: toParticipants(input.participants, meeting.participants),
    transcript: parseTranscript(input.transcript, input.duration),
  })
}

// PATCH /meetings/{id}/star
export async function setMeetingStarred(id: string, starred: boolean): Promise<Meeting> {
  await delay(200)
  return saveMeeting({ ...findMeeting(id), starred })
}

// DELETE /meetings/{id}
export async function deleteMeeting(id: string): Promise<void> {
  await delay(400)
  findMeeting(id)
  store = store.filter((m) => m.id !== id)
}

// ---------------------------------------------------------------------------
// Action items
// ---------------------------------------------------------------------------

// POST /meetings/{id}/action-items
export async function createActionItem(meetingId: string, input: ActionItemInput): Promise<Meeting> {
  await delay(250)
  const meeting = findMeeting(meetingId)
  const item: ActionItem = { id: uid('ai'), text: input.text.trim(), assignee: input.assignee, completed: false }
  return saveMeeting({ ...meeting, actionItems: [...meeting.actionItems, item] })
}

// PATCH /meetings/{id}/action-items/{itemId}
export async function updateActionItem(
  meetingId: string,
  itemId: string,
  patch: Partial<Omit<ActionItem, 'id'>>,
): Promise<Meeting> {
  await delay(250)
  const meeting = findMeeting(meetingId)
  return saveMeeting({
    ...meeting,
    actionItems: meeting.actionItems.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
  })
}

// DELETE /meetings/{id}/action-items/{itemId}
export async function deleteActionItem(meetingId: string, itemId: string): Promise<Meeting> {
  await delay(250)
  const meeting = findMeeting(meetingId)
  return saveMeeting({
    ...meeting,
    actionItems: meeting.actionItems.filter((item) => item.id !== itemId),
  })
}
