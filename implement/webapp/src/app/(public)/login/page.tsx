import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginScreen } from '@/features/auth/ui/login-screen'
import { vi } from '@/shared/i18n/vi'
import { RedirectIfMember } from '../../_components/require-member'

export const metadata: Metadata = { title: `${vi.auth.login.title} · ${vi.app.name}` }

/** SCR-01 — static shell (NFR-06). Đã có phiên + tài khoản → /rooms (AC-17), kiểm trong <Suspense>. */
export default function Page({ searchParams }: PageProps<'/login'>) {
  return (
    <>
      <LoginScreen />
      <Suspense fallback={null}>
        <RedirectIfMember searchParams={searchParams} />
      </Suspense>
    </>
  )
}
