'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { ActionItems } from '@/components/workspace/action-items'
import { formatTimestamp } from '@/lib/format'
import type { Meeting } from '@/types/meeting'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{children}</h3>
}

export function SummaryPanel({
  meeting,
  currentTime,
  readOnly,
  onSeek,
}: {
  meeting: Meeting
  currentTime: number
  readOnly: boolean
  onSeek: (time: number) => void
}) {
  const { summary } = meeting
  const activeOutlineId = summary?.outline.filter((s) => s.start <= currentTime).at(-1)?.id

  return (
    <aside aria-label="AI summary" className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b p-3">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-medium">AI Summary</h2>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        {summary ? (
          <>
            <section className="flex flex-col gap-2">
              <SectionHeading>Overview</SectionHeading>
              <p className="text-sm leading-relaxed text-pretty">{summary.overview}</p>
            </section>

            {summary.keyTopics.length > 0 && (
              <section className="flex flex-col gap-2">
                <SectionHeading>Key topics</SectionHeading>
                <ul className="flex flex-wrap gap-1.5">
                  {summary.keyTopics.map((topic) => (
                    <li key={topic}>
                      <Badge variant="secondary" className="font-normal">
                        {topic}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {summary.outline.length > 0 && (
              <section className="flex flex-col gap-2">
                <SectionHeading>Meeting outline</SectionHeading>
                <ol className="flex flex-col gap-3">
                  {summary.outline.map((section) => {
                    const isActive = section.id === activeOutlineId
                    return (
                      <li key={section.id} className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => onSeek(section.start)}
                          className="group flex items-baseline gap-2 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <span
                            className={cn(
                              'shrink-0 rounded px-1 py-px text-[11px] tabular-nums text-muted-foreground bg-muted group-hover:text-primary',
                              isActive && 'bg-primary/10 text-primary',
                            )}
                          >
                            {formatTimestamp(section.start)}
                          </span>
                          <span className="text-sm font-medium group-hover:underline underline-offset-2">
                            {section.title}
                          </span>
                        </button>
                        {section.points.length > 0 && (
                          <ul className="ml-[3.25rem] flex list-disc flex-col gap-0.5 text-sm text-muted-foreground marker:text-border">
                            {section.points.map((point) => (
                              <li key={point} className="leading-relaxed text-pretty">
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </section>
            )}
          </>
        ) : (
          <EmptyState
            compact
            icon={Sparkles}
            title="Summary not generated yet"
            description="A summary will appear here once the transcript has been processed."
          />
        )}

        <ActionItems meeting={meeting} readOnly={readOnly} />
      </div>
    </aside>
  )
}
