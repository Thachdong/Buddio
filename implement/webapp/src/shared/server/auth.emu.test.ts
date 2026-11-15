import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAuth, clearFirestore, createIdToken } from '@/test/emulator'
import { seedT002 } from '../../../scripts/seed/fixtures/T-002'
import { requireAuth, verifyIdToken } from './auth'

// Server Action / RSC không có header Authorization → cookie. Test giả lập request không có cookie.
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }) }))
vi.mock('react', async (orig) => ({ ...(await orig<typeof import('react')>()), cache: <T,>(fn: T) => fn }))

describe('requireAuth / verifyIdToken (withAuth của task = requireAuth)', () => {
  beforeEach(async () => {
    await clearFirestore()
    await clearAuth()
    await seedT002()
  })

  it('AC-11: không có Authorization lẫn cookie → UNAUTHENTICATED', async () => {
    await expect(requireAuth('member', null)).rejects.toMatchObject({ code: 'UNAUTHENTICATED', status: 401 })
  })

  it('AC-11: token sai chữ ký / rác → UNAUTHENTICATED', async () => {
    await expect(requireAuth('member', 'Bearer not-a-jwt')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
    await expect(verifyIdToken('eyJhbGciOiJIUzI1NiJ9.e30.bad')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
  })

  it('AC-10: token hợp lệ nhưng chưa có tài khoản → CONSENT_REQUIRED 403', async () => {
    const token = await createIdToken({ uid: 'u_new', email: 'new@gmail.com' })
    await expect(requireAuth('member', `Bearer ${token}`)).rejects.toMatchObject({ code: 'CONSENT_REQUIRED', status: 403 })
    // mức identity (createSession / createAccount) vẫn qua
    await expect(requireAuth('identity', `Bearer ${token}`)).resolves.toMatchObject({ uid: 'u_new' })
  })

  it('AC-12: token của uid đã revokeRefreshTokens → TOKEN_REVOKED', async () => {
    const token = await createIdToken({ uid: 'u_rev', email: 'rev@gmail.com', displayName: 'Rev' })
    const id = await verifyIdToken(token)
    expect(id).toMatchObject({ uid: 'u_rev', email: 'rev@gmail.com', name: 'Rev' })
    // revoke so theo giây: token phải được cấp trước mốc revoke ít nhất 1 giây
    await new Promise((r) => setTimeout(r, 1100))
    const { adminAuth } = await import('./firebase-admin')
    await adminAuth().revokeRefreshTokens('u_rev')
    await expect(verifyIdToken(token)).rejects.toMatchObject({ code: 'TOKEN_REVOKED', status: 401 })
    await expect(requireAuth('identity', `Bearer ${token}`)).rejects.toMatchObject({ code: 'TOKEN_REVOKED' })
  })
})
