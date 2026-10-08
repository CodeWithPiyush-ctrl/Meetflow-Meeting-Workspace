import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
