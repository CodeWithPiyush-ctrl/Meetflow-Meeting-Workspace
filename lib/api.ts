import type {
  ActionItem,
  ActionItemInput,
  Meeting,
  MeetingInput,
} from '@/types/meeting'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}


/* -------------------------------------------------------------------------- */
/* Request helper                                                             */
/* -------------------------------------------------------------------------- */

export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    },
  )

  if (!response.ok) {
    let message = `Request failed: ${response.statusText}`

    try {
      const errorData = await response.json()

      if (
        typeof errorData?.detail === 'string'
      ) {
        message = errorData.detail
      }
    } catch {
      // Keep the default error message
      // if the response is not JSON.
    }

    throw new ApiError(
      message,
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}


/* -------------------------------------------------------------------------- */
/* Backend types                                                             */
/* -------------------------------------------------------------------------- */

type BackendParticipant = {
  id: number
  name: string
  email?: string | null
}

type BackendTranscriptSegment = {
  id: number
  meeting_id: number
  speaker_name: string
  text: string
  start_time: number
  end_time: number
  sequence_number: number
}

type BackendActionItem = {
  id: number
  meeting_id: number
  title: string
  description?: string | null
  assignee?: string | null
  due_date?: string | null
  completed: boolean
}

type BackendSummary = {
  id: number
  overview: string
}

type BackendTopic = {
  id: number
  title: string
  start_time: number
}

type BackendMeeting = {
  id: number
  title: string
  meeting_date: string
  duration_seconds: number
  created_at?: string
  updated_at?: string

  participants: BackendParticipant[]

  transcript_segments?: BackendTranscriptSegment[]

  summary?: BackendSummary | null

  action_items?: BackendActionItem[]

  topics?: BackendTopic[]
}


/* -------------------------------------------------------------------------- */
/* Mapping backend data -> frontend data                                     */
/* -------------------------------------------------------------------------- */

function mapMeeting(
  meeting: BackendMeeting,
): Meeting {
  const transcriptSegments =
    meeting.transcript_segments ?? []

  const topics =
    meeting.topics ?? []

  const actionItems =
    meeting.action_items ?? []

  return {
    id: String(meeting.id),

    title: meeting.title,

    date: meeting.meeting_date,

    duration: meeting.duration_seconds,

    participants:
      meeting.participants.map(
        (participant) => ({
          id: String(participant.id),
          name: participant.name,
          email:
            participant.email ??
            undefined,
        }),
      ),

    transcript:
      transcriptSegments
        .slice()
        .sort(
          (a, b) =>
            a.sequence_number -
            b.sequence_number,
        )
        .map((segment) => ({
          id: String(segment.id),
          start: segment.start_time,
          end: segment.end_time,
          speaker:
            segment.speaker_name,
          text: segment.text,
        })),

    summary: meeting.summary
      ? {
          overview:
            meeting.summary.overview,

          keyTopics:
            topics.map(
              (topic) => topic.title,
            ),

          outline:
            topics.map((topic) => ({
              id: String(topic.id),
              start: topic.start_time,
              title: topic.title,
              points: [],
            })),
        }
      : null,

    actionItems:
      actionItems.map((item) => ({
        id: String(item.id),
        text: item.title,
        assignee:
          item.assignee ?? null,
        completed: item.completed,
      })),

    // Starred is not stored in
    // the current backend.
    starred: false,

    // Current backend meetings
    // are owned meetings.
    source: 'owned',
  }
}


/* -------------------------------------------------------------------------- */
/* Meetings                                                                  */
/* -------------------------------------------------------------------------- */

/* GET /api/meetings */

export async function listMeetings(): Promise<
  Meeting[]
> {
  const meetings =
    await request<BackendMeeting[]>(
      '/api/meetings',
    )

  return meetings.map(mapMeeting)
}


/* GET /api/meetings/{id} */

export async function getMeeting(
  id: string,
): Promise<Meeting> {
  const meeting =
    await request<BackendMeeting>(
      `/api/meetings/${id}`,
    )

  return mapMeeting(meeting)
}


/* POST /api/meetings */

export async function createMeeting(
  input: MeetingInput,
): Promise<Meeting> {
  const meeting =
    await request<BackendMeeting>(
      '/api/meetings',
      {
        method: 'POST',

        body: JSON.stringify({
          title: input.title.trim(),

          meeting_date: input.date,

          duration_seconds:
            input.duration,

          participants:
            input.participants
              .map((name) => ({
                name: name.trim(),
                email: null,
              })),

          transcript:
            input.transcript.trim(),
        }),
      },
    )

  return mapMeeting(meeting)
}


/* PUT /api/meetings/{id} */

export async function updateMeeting(
  id: string,
  input: MeetingInput,
): Promise<Meeting> {
  const meeting =
    await request<BackendMeeting>(
      `/api/meetings/${id}`,
      {
        method: 'PUT',

        body: JSON.stringify({
          title: input.title.trim(),

          meeting_date: input.date,

          duration_seconds:
            input.duration,

          // IMPORTANT:
          // Send updated participants
          // to the FastAPI backend.
          participants:
            input.participants
              .map((name) => ({
                name: name.trim(),
                email: null,
              })),
        }),
      },
    )

  return mapMeeting(meeting)
}


/* -------------------------------------------------------------------------- */
/* Starred                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Starred meetings are currently a
 * frontend-only feature because the
 * FastAPI backend does not have a
 * starred column yet.
 */
export async function setMeetingStarred(
  id: string,
  starred: boolean,
): Promise<Meeting> {
  const meeting =
    await getMeeting(id)

  return {
    ...meeting,
    starred,
  }
}


/* -------------------------------------------------------------------------- */
/* Delete meeting                                                            */
/* -------------------------------------------------------------------------- */

/* DELETE /api/meetings/{id} */

export async function deleteMeeting(
  id: string,
): Promise<void> {
  await request<void>(
    `/api/meetings/${id}`,
    {
      method: 'DELETE',
    },
  )
}


/* -------------------------------------------------------------------------- */
/* Action items                                                              */
/* -------------------------------------------------------------------------- */

/* POST /api/meetings/{meeting_id}/action-items */

export async function createActionItem(
  meetingId: string,
  input: ActionItemInput,
): Promise<Meeting> {
  await request<BackendActionItem>(
    `/api/meetings/${meetingId}/action-items`,
    {
      method: 'POST',

      body: JSON.stringify({
        title: input.text.trim(),

        description: null,

        assignee: input.assignee,

        due_date: null,
      }),
    },
  )

  return getMeeting(meetingId)
}


/* PUT /api/action-items/{action_item_id} */

export async function updateActionItem(
  meetingId: string,
  itemId: string,
  patch: Partial<
    Omit<ActionItem, 'id'>
  >,
): Promise<Meeting> {
  const body: Record<
    string,
    unknown
  > = {}

  if (patch.text !== undefined) {
    body.title =
      patch.text.trim()
  }

  if (
    patch.assignee !== undefined
  ) {
    body.assignee =
      patch.assignee
  }

  if (
    patch.completed !== undefined
  ) {
    body.completed =
      patch.completed
  }

  await request<BackendActionItem>(
    `/api/action-items/${itemId}`,
    {
      method: 'PUT',

      body: JSON.stringify(body),
    },
  )

  return getMeeting(meetingId)
}


/* DELETE /api/action-items/{action_item_id} */

export async function deleteActionItem(
  meetingId: string,
  itemId: string,
): Promise<Meeting> {
  await request<void>(
    `/api/action-items/${itemId}`,
    {
      method: 'DELETE',
    },
  )

  return getMeeting(meetingId)
}