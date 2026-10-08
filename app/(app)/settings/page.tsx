import type { Metadata } from 'next'
import { SettingsSections } from '@/components/settings/settings-sections'

export const metadata: Metadata = {
  title: 'Settings · MeetFlow',
}

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, workspace, and integrations.</p>
      </header>
      <SettingsSections />
    </div>
  )
}
