'use client'

import { toast } from 'sonner'
import { Calendar, Video, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

function SettingsCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-col gap-0.5 border-b px-5 py-4">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-4 px-5 py-4">{children}</div>
      {footer && <div className="flex justify-end border-t bg-muted/40 px-5 py-3">{footer}</div>}
    </section>
  )
}

function ToggleRow({ id, label, description, defaultChecked }: { id: string; label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  )
}

const integrations = [
  { name: 'Google Calendar', description: 'Automatically join scheduled meetings.', icon: Calendar },
  { name: 'Zoom', description: 'Import cloud recordings after each call.', icon: Video },
  { name: 'Slack', description: 'Post summaries to a channel.', icon: MessageSquare },
]

export function SettingsSections() {
  const saved = () => toast.success('Settings saved')

  return (
    <div className="flex flex-col gap-5">
      <SettingsCard
        title="Profile"
        description="How you appear to teammates in shared meetings."
        footer={<Button size="sm" onClick={saved}>Save changes</Button>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" defaultValue="Maya Chen" autoComplete="name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="maya@northwind.io" autoComplete="email" />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Notifications"
        description="Choose what MeetFlow tells you about."
        footer={<Button size="sm" onClick={saved}>Save preferences</Button>}
      >
        <ToggleRow id="notify-summary" label="Summary ready" description="Email me when a meeting summary is generated." defaultChecked />
        <ToggleRow id="notify-assigned" label="Assigned action items" description="Notify me when I’m assigned a follow-up." defaultChecked />
        <ToggleRow id="notify-shared" label="Shared meetings" description="Notify me when someone shares a meeting with me." />
      </SettingsCard>

      <SettingsCard title="Integrations" description="Connect the tools your team already uses.">
        <ul className="flex flex-col divide-y">
          {integrations.map(({ name, description, icon: Icon }) => (
            <li key={name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </div>
              <Badge variant="outline" className="text-muted-foreground">Coming soon</Badge>
            </li>
          ))}
        </ul>
      </SettingsCard>

      <SettingsCard title="Danger zone" description="Irreversible actions for your workspace.">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Permanently delete all recordings, transcripts, and summaries.</p>
          <Button variant="destructive" size="sm" onClick={() => toast.info('Disabled in this demo')}>
            Delete all data
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
}
