import { Suspense } from 'react'
import { AppShellSkeleton } from '../_components/app-shell-skeleton'
import { RequireMember } from '../_components/require-member'

/** Màn con toàn màn hình (ẩn thanh tab) — cần đăng nhập. */
export default function FullLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<AppShellSkeleton />}>
        <RequireMember>{children}</RequireMember>
      </Suspense>
    </div>
  )
}
