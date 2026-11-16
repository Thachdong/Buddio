import type { Metadata } from 'next'
import { SettingsScreen } from '@/features/account/ui/settings-screen'
import { vi } from '@/shared/i18n/vi'

export const metadata: Metadata = { title: `${vi.account.settings.title} · ${vi.app.name}` }

/** SCR-11 — dữ liệu ban đầu từ MeProvider (getMe ở layout), listener users/{me} + profiles/{me} tiếp quản. */
export default function Page() {
  return <SettingsScreen />
}
