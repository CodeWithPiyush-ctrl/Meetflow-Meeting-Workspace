import { Settings, Star, Users, Video, type LucideIcon } from 'lucide-react'
import type { Meeting } from '@/types/meeting'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  count?: (meetings: Meeting[]) => number
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Meetings', icon: Video, count: (m) => m.filter((x) => x.source === 'owned').length },
  { href: '/starred', label: 'Starred', icon: Star, count: (m) => m.filter((x) => x.starred).length },
  { href: '/shared', label: 'Shared with me', icon: Users, count: (m) => m.filter((x) => x.source === 'shared').length },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/meetings')
  return pathname.startsWith(href)
}
