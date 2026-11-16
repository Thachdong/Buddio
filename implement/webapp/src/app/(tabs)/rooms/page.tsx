import type { Metadata } from 'next'
import { RoomsScreen } from '@/features/rooms/ui/rooms-screen'
import { vi } from '@/shared/i18n/vi'

export const metadata: Metadata = { title: `${vi.rooms.list.title} · ${vi.app.name}` }

/** SCR-03 — T-002: trạng thái rỗng. Listener phòng ở T-008. */
export default function Page() {
  return <RoomsScreen />
}
