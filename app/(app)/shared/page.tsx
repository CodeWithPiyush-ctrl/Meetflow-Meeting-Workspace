import type { Metadata } from 'next'
import { MeetingLibrary } from '@/components/meetings/meeting-library'

export const metadata: Metadata = { title: 'Shared with me' }

export default function SharedPage() {
  return <MeetingLibrary view="shared" />
}
