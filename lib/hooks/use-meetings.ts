'use client'

import useSWR, { useSWRConfig } from 'swr'
import * as api from '@/lib/api'
import type { Meeting, MeetingInput } from '@/types/meeting'

export const MEETINGS_KEY = 'meetings'
export const meetingKey = (id: string) => ['meeting', id] as const

export function useMeetings() {
  const { data, error, isLoading, mutate } = useSWR(MEETINGS_KEY, api.listMeetings)
  return { meetings: data, error, isLoading, mutate }
}

export function useMeeting(id: string) {
  const { data, error, isLoading, mutate } = useSWR(meetingKey(id), ([, meetingId]) =>
    api.getMeeting(meetingId),
  )
  return { meeting: data, error, isLoading, mutate }
}

/** Mutations that keep the meeting list and meeting detail caches in sync. */
export function useMeetingMutations() {
  const { mutate } = useSWRConfig()

  const syncMeeting = (meeting: Meeting) => {
    mutate(meetingKey(meeting.id), meeting, { revalidate: false })
    mutate(
      MEETINGS_KEY,
      (current: Meeting[] | undefined) => current?.map((m) => (m.id === meeting.id ? meeting : m)),
      { revalidate: false },
    )
  }

  return {
    async createMeeting(input: MeetingInput) {
      const meeting = await api.createMeeting(input)
      mutate(MEETINGS_KEY, (current: Meeting[] | undefined) => [meeting, ...(current ?? [])], {
        revalidate: false,
      })
      return meeting
    },
    async updateMeeting(id: string, input: MeetingInput) {
      const meeting = await api.updateMeeting(id, input)
      syncMeeting(meeting)
      return meeting
    },
    async setStarred(meeting: Meeting, starred: boolean) {
      syncMeeting({ ...meeting, starred })
      try {
        syncMeeting(await api.setMeetingStarred(meeting.id, starred))
      } catch (error) {
        syncMeeting(meeting)
        throw error
      }
    },
    async deleteMeeting(id: string) {
      await api.deleteMeeting(id)
      mutate(MEETINGS_KEY, (current: Meeting[] | undefined) => current?.filter((m) => m.id !== id), {
        revalidate: false,
      })
    },
    syncMeeting,
  }
}
