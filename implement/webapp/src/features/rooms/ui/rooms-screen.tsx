import Link from 'next/link'
import { MessagesSquareIcon, PlusIcon, UserPlusIcon } from 'lucide-react'
import { vi } from '@/shared/i18n/vi'
import { Button } from '@/shared/ui/button'

const t = vi.rooms.list

/**
 * SCR-03 — T-002 chỉ có trạng thái rỗng (thành phần 1, 2, 11). Listener phòng ở T-008.
 * "Tạo phòng" / "Thêm bạn" dẫn tới trang giữ chỗ cho tới T-008 / T-005 [ASSUMED → Q-047].
 */
export function RoomsScreen() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between gap-2 px-4">
        <h1 className="text-xl font-semibold">{t.title}</h1>
        <Button asChild variant="ghost" className="h-11 gap-1 text-primary">
          <Link href="/rooms/new">
            <PlusIcon aria-hidden />
            {t.createRoom}
          </Link>
        </Button>
      </header>
      <RoomsEmptyState />
    </main>
  )
}

export function RoomsEmptyState() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <MessagesSquareIcon className="size-8 text-text-muted" aria-hidden />
      </div>
      <p className="text-base font-medium">{t.emptyTitle}</p>
      <div className="flex w-full max-w-[320px] flex-col gap-2">
        <Button asChild size="lg" className="h-11 w-full">
          <Link href="/rooms/new">
            <PlusIcon aria-hidden />
            {t.createRoom}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11 w-full">
          <Link href="/friends/add">
            <UserPlusIcon aria-hidden />
            {t.addFriend}
          </Link>
        </Button>
      </div>
    </section>
  )
}
