import { vi } from '@/shared/i18n/vi'

/** Fallback khi guard đang kiểm phiên — giữ khung, không nhảy layout. */
export function AppShellSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-1 flex-col gap-3 p-4">
      <span className="sr-only">{vi.common.loading}</span>
      <div className="h-7 w-28 animate-pulse rounded-md bg-muted" />
      <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
    </div>
  )
}
