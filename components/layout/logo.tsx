import Link from 'next/link'
import { AudioLines } from 'lucide-react'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <AudioLines className="size-4" aria-hidden="true" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">MeetFlow</span>
    </Link>
  )
}
