import type { Metadata } from 'next'
import { MeetingLibrary } from '@/components/meetings/meeting-library'

export const metadata: Metadata = { title: 'Starred' }

export default function StarredPage() {
  return <MeetingLibrary view="starred" />
}
