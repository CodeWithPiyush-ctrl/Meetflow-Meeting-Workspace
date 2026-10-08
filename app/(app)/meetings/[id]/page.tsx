import type { Metadata } from 'next'
import { MeetingWorkspace } from '@/components/workspace/meeting-workspace'

export const metadata: Metadata = {
  title: 'Meeting · MeetFlow',
}

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MeetingWorkspace id={id} />
}
