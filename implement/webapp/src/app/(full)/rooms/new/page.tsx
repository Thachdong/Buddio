import type { Metadata } from 'next'
import { ComingSoonScreen } from '@/features/account/ui/coming-soon-screen'
import { vi } from '@/shared/i18n/vi'

export const metadata: Metadata = { title: `${vi.rooms.list.createRoom} · ${vi.app.name}` }

/** SCR-04 (T-008) — trang giữ chỗ "Sắp có" [ASSUMED → Q-047]. */
export default function Page() {
  return <ComingSoonScreen title={vi.rooms.list.createRoom} />
}
