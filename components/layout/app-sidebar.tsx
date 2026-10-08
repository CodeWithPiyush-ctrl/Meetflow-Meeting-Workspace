'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useMeetings } from '@/lib/hooks/use-meetings'
import { Logo } from '@/components/layout/logo'
import { isNavActive, navItems } from '@/components/layout/nav-items'
import { ParticipantAvatar } from '@/components/meetings/participant-avatars'

export function AppSidebar() {
  const pathname = usePathname()
  const { meetings } = useMeetings()

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-14 items-center px-4">
        <Logo />
      </div>

      <nav aria-label="Main" className="flex-1 px-2 py-2">
        <p className="px-2 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Workspace
        </p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href)
            const count = item.count && meetings ? item.count(meetings) : undefined
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    active && 'bg-accent font-medium text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {count !== undefined && (
                    <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
          <ParticipantAvatar name="Maya Chen" size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Maya Chen</p>
            <p className="truncate text-xs text-muted-foreground">Northwind · Pro plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
