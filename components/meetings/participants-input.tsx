'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ParticipantAvatar } from '@/components/meetings/participant-avatars'

interface ParticipantsInputProps {
  id: string
  value: string[]
  onChange: (value: string[]) => void
  invalid?: boolean
}

export function ParticipantsInput({
  id,
  value,
  onChange,
  invalid,
}: ParticipantsInputProps) {
  const [draft, setDraft] = useState('')

  // ------------------------------------------------------------
  // Add one or more participant names
  // ------------------------------------------------------------

  const commit = (raw: string) => {
    const names = raw
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)

    if (names.length === 0) {
      setDraft('')
      return
    }

    const newNames = names.filter(
      (name) =>
        !value.some(
          (existing) =>
            existing.toLowerCase() ===
            name.toLowerCase(),
        ),
    )

    if (newNames.length > 0) {
      onChange([
        ...value,
        ...newNames,
      ])
    }

    setDraft('')
  }

  // ------------------------------------------------------------
  // Keyboard handling
  // ------------------------------------------------------------

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.nativeEvent.isComposing ||
      event.keyCode === 229
    ) {
      return
    }

    // Enter -> add participant
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()

      commit(draft)
      return
    }

    // Comma -> add participant
    if (event.key === ',') {
      event.preventDefault()
      event.stopPropagation()

      commit(draft)
      return
    }

    // Backspace on empty input -> remove last participant
    if (
      event.key === 'Backspace' &&
      draft === '' &&
      value.length > 0
    ) {
      event.preventDefault()

      onChange(
        value.slice(0, -1),
      )
    }
  }

  // ------------------------------------------------------------
  // Blur handling
  // ------------------------------------------------------------

  const handleBlur = () => {
    if (draft.trim()) {
      commit(draft)
    }
  }

  // ------------------------------------------------------------
  // Remove participant
  // ------------------------------------------------------------

  const removeParticipant = (
    nameToRemove: string,
  ) => {
    onChange(
      value.filter(
        (name) => name !== nameToRemove,
      ),
    )
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <div
      className={cn(
        'flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-1.5 py-1 transition-colors',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        invalid &&
          'border-destructive ring-3 ring-destructive/20',
      )}
    >
      {/* Existing participants */}

      {value.map((name) => (
        <span
          key={name}
          className="flex h-6 items-center gap-1 rounded-md bg-muted pr-1 pl-0.5 text-xs"
        >
          <ParticipantAvatar
            name={name}
            className="size-5 text-[9px]"
          />

          <span className="max-w-40 truncate">
            {name}
          </span>

          <button
            type="button"
            onClick={() =>
              removeParticipant(name)
            }
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label={`Remove ${name}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {/* Participant input */}

      <input
        id={id}
        type="text"
        value={draft}
        onChange={(event) =>
          setDraft(event.target.value)
        }
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={
          value.length
            ? 'Add another…'
            : 'Type a name and press Enter'
        }
        aria-invalid={
          invalid || undefined
        }
        className="h-6 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}