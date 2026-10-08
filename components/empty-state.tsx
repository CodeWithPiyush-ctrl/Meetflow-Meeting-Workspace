import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 rounded-lg border border-dashed bg-card px-6 py-16',
        className,
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-lg bg-muted text-muted-foreground',
          compact ? 'size-8' : 'size-10',
        )}
      >
        <Icon className={compact ? 'size-4' : 'size-5'} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}
