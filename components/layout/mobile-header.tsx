'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/logo'
import { isNavActive, navItems } from '@/components/layout/nav-items'

export function MobileHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b bg-card md:hidden">
      <div className="flex h-12 items-center px-4">
        <Logo />
      </div>
      <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-2 pb-2">
        {navItems.map((item) => {
          const active = isNavActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground',
                active && 'bg-accent font-medium text-accent-foreground',
              )}
            >
              <item.icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
