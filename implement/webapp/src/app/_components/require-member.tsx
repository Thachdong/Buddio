import type { ReactNode } from 'react'
import { redirect, unstable_rethrow } from 'next/navigation'
import { connection } from 'next/server'
import { getMe } from '@/features/account/server/queries/me.query'
import { MeProvider } from '@/features/account/ui/me-provider'
import { getOptionalIdentity, verifySession } from '@/shared/server/auth'

const codeOf = (err: unknown) => (err as { code?: string })?.code ?? ''

/** Phiên đã bị thu hồi / hết 30 ngày → SCR-01 "Phiên đăng nhập đã hết hạn…" (T-003). Còn lại → /login. */
function loginUrlFor(code: string): string | null {
  if (code === 'SESSION_EXPIRED' || code === 'TOKEN_REVOKED') return '/login?reason=expired'
  if (code === 'UNAUTHENTICATED' || code === 'CONSENT_REQUIRED') return '/login'
  return null
}

/**
 * Guard cho (tabs) / (full) — LAYOUT.A1. Phải nằm trong <Suspense> (đọc cookie, cacheComponents).
 * Không có phiên / chưa có tài khoản → /login; phiên bị thu hồi (đăng xuất nơi khác) / hết 30 ngày
 * → /login?reason=expired (NFR-11, Q-044). CONSENT_REQUIRED: /login tự gọi lại
 * createSession (Firebase client còn đăng nhập) và mở lại dialog [ASSUMED → Q-047].
 * Kiểm quyền thật vẫn ở từng action / query.
 */
export async function RequireMember({ children }: { children: ReactNode }) {
  // verifySessionCookie / getMe dùng thời gian hiện tại → chỉ chạy lúc request (không prerender, kể cả runtime prefetch)
  await connection()
  let data: Awaited<ReturnType<typeof getMe>>
  try {
    const identity = await verifySession()
    data = await getMe(identity)
  } catch (err) {
    unstable_rethrow(err)
    const url = loginUrlFor(codeOf(err))
    if (url) redirect(url)
    throw err
  }
  return <MeProvider value={data}>{children}</MeProvider>
}

/**
 * /login: đã có phiên + tài khoản → thẳng /rooms (AC-17). Không thì không render gì.
 * Có `?reason` (vừa đăng xuất / hết phiên) → không redirect: client đang signOut, cookie có thể còn
 * do gọi đăng xuất lỗi mạng (T-003 AC-8).
 */
export async function RedirectIfMember({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if ((await searchParams).reason) return null
  await connection()
  const identity = await getOptionalIdentity()
  if (!identity) return null
  let isMember = false
  try {
    await getMe(identity)
    isMember = true
  } catch (err) {
    unstable_rethrow(err)
  }
  if (isMember) redirect('/rooms')
  return null
}
