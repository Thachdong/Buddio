import type { Metadata } from 'next'
import { LoginScreen } from '@/features/auth/ui/login-screen'
import { vi } from '@/shared/i18n/vi'

export const metadata: Metadata = { title: `${vi.auth.login.title} · ${vi.app.name}` }

/** SCR-01 — public, không đọc runtime data → nằm trong static shell (NFR-06). */
export default function Page() {
  return <LoginScreen />
}
