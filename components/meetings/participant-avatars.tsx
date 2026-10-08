import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/format'
import type { Participant } from '@/types/meeting'

const tones = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-slate-200 text-slate-700',
]

function toneFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return tones[hash % tones.length]
}

const sizes = {
  sm: 'size-6 text-[10px]',
  md: 'size-7 text-[11px]',
  lg: 'size-8 text-xs',
}

export function ParticipantAvatar({
  name,
  size = 'sm',
  className,
}: {
  name: string
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <span
      title={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium select-none',
        sizes[size],
        toneFor(name),
        className,
      )}
    >
      <span aria-hidden="true">{getInitials(name)}</span>
      <span className="sr-only">{name}</span>
    </span>
  )
}

export function ParticipantAvatarStack({
  participants,
  max = 4,
  size = 'sm',
}: {
  participants: Participant[]
  max?: number
  size?: keyof typeof sizes
}) {
  const visible = participants.slice(0, max)
  const remaining = participants.length - visible.length

  return (
    <div className="flex items-center -space-x-0.5">
      {visible.map((p) => (
        <ParticipantAvatar key={p.id} name={p.name} size={size} className="ring-2 ring-card" />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-card',
            sizes[size],
          )}
        >
          +{remaining}
        </span>
      )}
    </div>
  )
}

export function participantSummary(participants: Participant[], max = 2) {
  const names = participants.map((p) => p.name.split(' ')[0])
  if (names.length <= max) return names.join(', ')
  return `${names.slice(0, max).join(', ')} +${names.length - max}`
}
