import { Suspense } from 'react'
import { SessionWatcher } from '@/features/auth/ui/session-watcher'
import { AppShellSkeleton } from '../_components/app-shell-skeleton'
import { RequireMember } from '../_components/require-member'

/** Màn con toàn màn hình (ẩn thanh tab) — cần đăng nhập. */
export default function FullLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<AppShellSkeleton />}>
        <RequireMember>
          <SessionWatcher />
          {children}
        </RequireMember>
      </Suspense>
    </div>
  )
}
