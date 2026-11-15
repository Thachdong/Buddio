import type { ReactNode } from 'react'
import { redirect, unstable_rethrow } from 'next/navigation'
import { connection } from 'next/server'
import { getMe } from '@/features/account/server/queries/me.query'
import { MeProvider } from '@/features/account/ui/me-provider'
import { getOptionalIdentity } from '@/shared/server/auth'

const TO_LOGIN = new Set(['UNAUTHENTICATED', 'TOKEN_REVOKED', 'SESSION_EXPIRED', 'CONSENT_REQUIRED'])

/**
 * Guard cho (tabs) / (full) — LAYOUT.A1. Phải nằm trong <Suspense> (đọc cookie, cacheComponents).
 * Không có phiên / chưa có tài khoản / hết phiên → /login. CONSENT_REQUIRED: /login tự gọi lại
 * createSession (Firebase client còn đăng nhập) và mở lại dialog [ASSUMED → Q-047].
 * Kiểm quyền thật vẫn ở từng action / query.
 */
export async function RequireMember({ children }: { children: ReactNode }) {
  // verifySessionCookie / getMe dùng thời gian hiện tại → chỉ chạy lúc request (không prerender, kể cả runtime prefetch)
  await connection()
  const identity = await getOptionalIdentity()
  if (!identity) redirect('/login')

  let data: Awaited<ReturnType<typeof getMe>>
  try {
    data = await getMe(identity)
  } catch (err) {
    unstable_rethrow(err)
    if (TO_LOGIN.has((err as { code?: string })?.code ?? '')) redirect('/login')
    throw err
  }
  return <MeProvider value={data}>{children}</MeProvider>
}

/** /login: đã có phiên + tài khoản → thẳng /rooms (AC-17). Không thì không render gì. */
export async function RedirectIfMember() {
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
