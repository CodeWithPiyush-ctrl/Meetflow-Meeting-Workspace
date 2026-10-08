'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { ParticipantsInput } from '@/components/meetings/participants-input'
import { useMeetingMutations } from '@/lib/hooks/use-meetings'
import { toDateTimeLocal } from '@/lib/format'
import { serializeTranscript } from '@/lib/transcript'

import type { Meeting } from '@/types/meeting'

interface FormState {
  title: string
  participants: string[]
  date: string
  durationMinutes: string
  transcript: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

/* -------------------------------------------------------------------------- */
/* Initial form state                                                         */
/* -------------------------------------------------------------------------- */

function initialState(meeting?: Meeting): FormState {
  if (meeting) {
    return {
      title: meeting.title,
      participants: meeting.participants.map(
        (participant) => participant.name,
      ),
      date: toDateTimeLocal(meeting.date),
      durationMinutes: String(
        Math.round(meeting.duration / 60),
      ),
      transcript: serializeTranscript(meeting.transcript),
    }
  }

  return {
    title: '',
    participants: [],
    date: toDateTimeLocal(
      new Date().toISOString(),
    ),
    durationMinutes: '30',
    transcript: '',
  }
}

/* -------------------------------------------------------------------------- */
/* Form validation                                                            */
/* -------------------------------------------------------------------------- */

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {}

  if (!state.title.trim()) {
    errors.title = 'Title is required.'
  } else if (state.title.length > 120) {
    errors.title =
      'Title must be 120 characters or fewer.'
  }

  if (state.participants.length === 0) {
    errors.participants =
      'Add at least one participant.'
  }

  if (
    !state.date ||
    Number.isNaN(
      new Date(state.date).getTime(),
    )
  ) {
    errors.date = 'Enter a valid date.'
  }

  const minutes = Number(
    state.durationMinutes,
  )

  if (
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 600
  ) {
    errors.durationMinutes =
      'Enter a duration between 1 and 600 minutes.'
  }

  return errors
}

/* -------------------------------------------------------------------------- */
/* Meeting form dialog                                                        */
/* -------------------------------------------------------------------------- */

export function MeetingFormDialog({
  open,
  onOpenChange,
  meeting,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting
  onSaved?: (meeting: Meeting) => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        {open && (
          <MeetingForm
            meeting={meeting}
            onCancel={() =>
              onOpenChange(false)
            }
            onSaved={(saved) => {
              onOpenChange(false)
              onSaved?.(saved)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/* Meeting form                                                               */
/* -------------------------------------------------------------------------- */

function MeetingForm({
  meeting,
  onCancel,
  onSaved,
}: {
  meeting?: Meeting
  onCancel: () => void
  onSaved: (meeting: Meeting) => void
}) {
  const isEdit = Boolean(meeting)

  const {
    createMeeting,
    updateMeeting,
  } = useMeetingMutations()

  const [state, setState] =
    useState<FormState>(
      () => initialState(meeting),
    )

  const [errors, setErrors] =
    useState<FormErrors>({})

  const [submitting, setSubmitting] =
    useState(false)

  /* ------------------------------------------------------------------------ */
  /* Update form state                                                        */
  /* ------------------------------------------------------------------------ */

  const set = <
    K extends keyof FormState
  >(
    key: K,
    value: FormState[K],
  ) => {
    setState((current) => ({
      ...current,
      [key]: value,
    }))

    if (errors[key]) {
      setErrors((current) => ({
        ...current,
        [key]: undefined,
      }))
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Submit form                                                              */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault()

    const nextErrors =
      validate(state)

    setErrors(nextErrors)

    if (
      Object.keys(nextErrors).length > 0
    ) {
      return
    }

    const input = {
      title: state.title.trim(),

      participants:
        state.participants
          .map((participant) =>
            participant.trim(),
          )
          .filter(Boolean),

      date: new Date(
        state.date,
      ).toISOString(),

      duration:
        Number(state.durationMinutes) *
        60,

      transcript:
        state.transcript.trim(),
    }

    setSubmitting(true)

    try {
      const saved = meeting
        ? await updateMeeting(
            meeting.id,
            input,
          )
        : await createMeeting(input)

      toast.success(
        isEdit
          ? 'Meeting updated'
          : 'Meeting created',
        {
          description: saved.title,
        },
      )

      onSaved(saved)
    } catch (error) {
      console.error(
        'Meeting save failed:',
        error,
      )

      toast.error(
        isEdit
          ? 'Could not update meeting'
          : 'Could not create meeting',
        {
          description:
            'Please try again.',
        },
      )
    } finally {
      setSubmitting(false)
    }
  }

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>
          {isEdit
            ? 'Edit meeting'
            : 'New meeting'}
        </DialogTitle>

        <DialogDescription>
          {isEdit
            ? 'Update the meeting details and transcript.'
            : 'Add a meeting manually by pasting its transcript.'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">

        {/* Title */}
        <Field
          id="title"
          label="Title"
          error={errors.title}
        >
          <Input
            id="title"
            value={state.title}
            onChange={(event) =>
              set(
                'title',
                event.target.value,
              )
            }
            placeholder="e.g. Weekly product sync"
            aria-invalid={
              Boolean(errors.title) ||
              undefined
            }
            autoFocus
          />
        </Field>

        {/* Participants */}
        <Field
          id="participants"
          label="Participants"
          error={errors.participants}
        >
          <ParticipantsInput
            id="participants"
            value={state.participants}
            onChange={(value) =>
              set(
                'participants',
                value,
              )
            }
            invalid={Boolean(
              errors.participants,
            )}
          />
        </Field>

        {/* Date and duration */}
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">

          <Field
            id="date"
            label="Date"
            error={errors.date}
          >
            <Input
              id="date"
              type="datetime-local"
              value={state.date}
              onChange={(event) =>
                set(
                  'date',
                  event.target.value,
                )
              }
              aria-invalid={
                Boolean(errors.date) ||
                undefined
              }
            />
          </Field>

          <Field
            id="duration"
            label="Duration (min)"
            error={
              errors.durationMinutes
            }
          >
            <Input
              id="duration"
              type="number"
              inputMode="numeric"
              min={1}
              max={600}
              value={
                state.durationMinutes
              }
              onChange={(event) =>
                set(
                  'durationMinutes',
                  event.target.value,
                )
              }
              aria-invalid={
                Boolean(
                  errors.durationMinutes,
                ) || undefined
              }
            />
          </Field>

        </div>

        {/* Transcript */}
        <Field
          id="transcript"
          label="Transcript"
          hint="One line per utterance: [mm:ss] Speaker: text. Timestamps are optional."
        >
          <Textarea
            id="transcript"
            value={state.transcript}
            onChange={(event) =>
              set(
                'transcript',
                event.target.value,
              )
            }
            placeholder={
              '[0:00] Maya Chen: Let’s get started.\n[0:12] Daniel Okafor: Sounds good.'
            }
            className="max-h-56 min-h-32 font-mono text-xs leading-relaxed"
          />
        </Field>

      </div>

      {/* Footer */}
      <DialogFooter>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting && (
            <Loader2
              className="animate-spin"
              data-icon="inline-start"
            />
          )}

          {isEdit
            ? 'Save changes'
            : 'Create meeting'}
        </Button>

      </DialogFooter>
    </form>
  )
}

/* -------------------------------------------------------------------------- */
/* Form field                                                                 */
/* -------------------------------------------------------------------------- */

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">

      <Label htmlFor={id}>
        {label}
      </Label>

      {children}

      {error ? (
        <p
          className="text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

    </div>
  )
}