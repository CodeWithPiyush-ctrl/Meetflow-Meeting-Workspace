'use client'

import { useState } from 'react'
import { ListTodo, MoreHorizontal, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/empty-state'
import { ParticipantAvatar } from '@/components/meetings/participant-avatars'
import { useActionItems } from '@/lib/hooks/use-action-items'
import type { ActionItem, ActionItemInput, Meeting } from '@/types/meeting'

const UNASSIGNED = '__unassigned'

function ActionItemForm({
  assignees,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  assignees: string[]
  initial?: ActionItemInput
  submitLabel: string
  onSubmit: (input: ActionItemInput) => Promise<void>
  onCancel: () => void
}) {
  const [text, setText] = useState(initial?.text ?? '')
  const [assignee, setAssignee] = useState(initial?.assignee ?? UNASSIGNED)
  const [saving, setSaving] = useState(false)

  const items = [
    { value: UNASSIGNED, label: 'Unassigned' },
    ...assignees.map((name) => ({ value: name, label: name })),
  ]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    try {
      await onSubmit({ text: text.trim(), assignee: assignee === UNASSIGNED ? null : assignee })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-md border bg-background p-2">
      <Input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        placeholder="What needs to happen?"
        aria-label="Action item"
        className="h-8 text-sm"
        maxLength={280}
      />
      <div className="flex items-center gap-2">
        <Select items={items} value={assignee} onValueChange={(value) => setAssignee(value ?? UNASSIGNED)}>
          <SelectTrigger size="sm" aria-label="Assignee" className="min-w-0 flex-1">
            <UserRound className="text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!text.trim() || saving}>
          {saving ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function ActionItemRow({
  item,
  readOnly,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: ActionItem
  readOnly: boolean
  onToggle: (completed: boolean) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const checkboxId = `ai-${item.id}`
  return (
    <li className="group flex items-start gap-2.5 rounded-md px-2 py-2 hover:bg-muted/50">
      <Checkbox
        id={checkboxId}
        checked={item.completed}
        onCheckedChange={(checked) => onToggle(checked === true)}
        disabled={readOnly}
        className="mt-0.5"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            'text-sm leading-snug text-pretty',
            item.completed && 'text-muted-foreground line-through decoration-muted-foreground/60',
          )}
        >
          {item.text}
        </label>
        {item.assignee ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ParticipantAvatar name={item.assignee} className="size-4 text-[8px]" />
            {item.assignee}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )}
      </div>
      {!readOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground opacity-100 group-hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100 md:opacity-0"
                aria-label={`Actions for “${item.text}”`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  )
}

export function ActionItems({ meeting, readOnly }: { meeting: Meeting; readOnly: boolean }) {
  const actions = useActionItems(meeting)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const assignees = meeting.participants.map((p) => p.name)
  const open = meeting.actionItems.filter((i) => !i.completed).length

  const run = async (action: () => Promise<void>, success: string) => {
    try {
      await action()
      toast.success(success)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <section aria-labelledby="action-items-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 id="action-items-heading" className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Action items
          <span className="rounded-full bg-muted px-1.5 py-px text-[11px] font-medium normal-case tracking-normal tabular-nums">
            {open}/{meeting.actionItems.length}
          </span>
        </h3>
        {!readOnly && !adding && (
          <Button variant="ghost" size="xs" onClick={() => setAdding(true)}>
            <Plus data-icon="inline-start" />
            Add
          </Button>
        )}
      </div>

      {meeting.actionItems.length === 0 && !adding ? (
        <EmptyState compact icon={ListTodo} title="No action items" description="Add follow-ups to keep the team accountable." />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {meeting.actionItems.map((item) =>
            editingId === item.id ? (
              <li key={item.id} className="px-2 py-1">
                <ActionItemForm
                  assignees={assignees}
                  initial={{ text: item.text, assignee: item.assignee }}
                  submitLabel="Save"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(input) =>
                    run(async () => {
                      await actions.update(item.id, input)
                      setEditingId(null)
                    }, 'Action item updated')
                  }
                />
              </li>
            ) : (
              <ActionItemRow
                key={item.id}
                item={item}
                readOnly={readOnly}
                onToggle={(completed) =>
                  run(() => actions.update(item.id, { completed }), completed ? 'Marked complete' : 'Marked incomplete')
                }
                onEdit={() => setEditingId(item.id)}
                onDelete={() => run(() => actions.remove(item.id), 'Action item deleted')}
              />
            ),
          )}
        </ul>
      )}

      {adding && (
        <ActionItemForm
          assignees={assignees}
          submitLabel="Add"
          onCancel={() => setAdding(false)}
          onSubmit={(input) =>
            run(async () => {
              await actions.add(input)
              setAdding(false)
            }, 'Action item added')
          }
        />
      )}
    </section>
  )
}
