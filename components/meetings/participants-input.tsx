'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ParticipantAvatar } from '@/components/meetings/participant-avatars'

export function ParticipantsInput({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  value: string[]
  onChange: (value: string[]) => void
  invalid?: boolean
}) {
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const names = raw
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) => !value.some((existing) => existing.toLowerCase() === n.toLowerCase()))
    if (names.length) onChange([...value, ...names])
    setDraft('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-1.5 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        invalid && 'border-destructive ring-3 ring-destructive/20',
      )}
    >
      {value.map((name) => (
        <span key={name} className="flex h-6 items-center gap-1 rounded-md bg-muted pr-1 pl-0.5 text-xs">
          <ParticipantAvatar name={name} className="size-5 text-[9px]" />
          {name}
          <button
            type="button"
            onClick={() => onChange(value.filter((n) => n !== name))}
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label={`Remove ${name}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft && commit(draft)}
        placeholder={value.length ? 'Add another…' : 'Type a name and press Enter'}
        aria-invalid={invalid || undefined}
        className="h-6 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
