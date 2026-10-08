'use client'

import * as api from '@/lib/api'
import { useMeetingMutations } from '@/lib/hooks/use-meetings'
import type { ActionItem, ActionItemInput, Meeting } from '@/types/meeting'

export function useActionItems(meeting: Meeting) {
  const { syncMeeting } = useMeetingMutations()

  const optimistic = async (next: Meeting, request: () => Promise<Meeting>) => {
    syncMeeting(next)
    try {
      syncMeeting(await request())
    } catch (error) {
      syncMeeting(meeting)
      throw error
    }
  }

  return {
    async add(input: ActionItemInput) {
      syncMeeting(await api.createActionItem(meeting.id, input))
    },
    update(itemId: string, patch: Partial<Omit<ActionItem, 'id'>>) {
      return optimistic(
        {
          ...meeting,
          actionItems: meeting.actionItems.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
        },
        () => api.updateActionItem(meeting.id, itemId, patch),
      )
    },
    remove(itemId: string) {
      return optimistic(
        { ...meeting, actionItems: meeting.actionItems.filter((item) => item.id !== itemId) },
        () => api.deleteActionItem(meeting.id, itemId),
      )
    },
  }
}
