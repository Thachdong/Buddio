import { Suspense } from 'react'
import { TabBar } from '@/features/account/ui/tab-bar'
import { SessionWatcher } from '@/features/auth/ui/session-watcher'
import { AppShellSkeleton } from '../_components/app-shell-skeleton'
import { RequireMember } from '../_components/require-member'

/** Nhóm route cần đăng nhập + thanh tab dưới (wireframe.md mục 5). TabBar thuộc static shell. */
export default function TabsLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <Suspense fallback={<AppShellSkeleton />}>
        <RequireMember>
          <SessionWatcher />
          {children}
        </RequireMember>
      </Suspense>
      <TabBar />
    </div>
  )
}
