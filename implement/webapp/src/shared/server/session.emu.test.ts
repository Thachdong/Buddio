import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'
import { clearAuth, clearFirestore, createIdToken, db } from '@/test/emulator'
import { seedT002, T002_USERS } from '../../../scripts/seed/fixtures/T-002'
import { deleteCurrentSession } from '@/features/auth/server/services/session.service'
import { checkMemberSession, verifyIdToken } from './auth'
import { adminAuth } from './firebase-admin'
import { resetLimitsCache } from './limits'

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }) }))

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-11-15T10:00:00Z')
const uid = T002_USERS.an.uid

async function setLastActive(daysAgo: number) {
  const at = Timestamp.fromMillis(NOW.getTime() - daysAgo * DAY)
  await db().doc(`users/${uid}`).update({ last_active_at: at })
  return at.toMillis()
}
const lastActive = async () => ((await db().doc(`users/${uid}`).get()).data()!.last_active_at as Timestamp).toMillis()
const validSince = async () => new Date((await adminAuth().getUser(uid)).tokensValidAfterTime ?? 0).getTime()

describe('checkMemberSession — kiểm hết phiên dùng chung (NFR-11)', () => {
  beforeEach(async () => {
    await clearFirestore()
    await clearAuth()
    await seedT002()
  })

  it('AC-5: last_active_at −31 ngày → SESSION_EXPIRED, thu hồi refresh token, KHÔNG cập nhật last_active_at', async () => {
    const before = await setLastActive(31)
    const t0 = Date.now() - 1000
    await expect(checkMemberSession(uid, { now: NOW })).rejects.toMatchObject({ code: 'SESSION_EXPIRED', status: 401 })
    expect(await lastActive()).toBe(before)
    expect(await validSince()).toBeGreaterThanOrEqual(t0)
  })

  it('AC-6: −29 ngày → còn phiên, last_active_at = now', async () => {
    await setLastActive(29)
    await checkMemberSession(uid, { now: NOW })
    expect(await lastActive()).toBe(NOW.getTime())
  })

  it('biên: đúng 30 ngày → vẫn còn phiên [ASSUMED → Q-047]', async () => {
    await setLastActive(30)
    await expect(checkMemberSession(uid, { now: NOW })).resolves.toBeUndefined()
  })

  it('AC-5: đọc session_idle_days từ config/limits (7 ngày → −8 ngày hết phiên)', async () => {
    await db().doc('config/limits').update({ session_idle_days: 7 })
    resetLimitsCache()
    await setLastActive(8)
    await expect(checkMemberSession(uid, { now: NOW })).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
  })

  it('chưa có tài khoản → CONSENT_REQUIRED (không thu hồi)', async () => {
    await expect(checkMemberSession('u_nobody', { now: NOW })).rejects.toMatchObject({ code: 'CONSENT_REQUIRED' })
  })
})

describe('deleteCurrentSession (FLOW-01 A1, Q-044)', () => {
  beforeEach(async () => {
    await clearFirestore()
    await clearAuth()
  })

  it('AC-2, AC-3: thu hồi refresh token → ID token cũ bị từ chối TOKEN_REVOKED', async () => {
    const token = await createIdToken({ uid: 'u_out', email: 'out@gmail.com' })
    const ctx = await verifyIdToken(token)
    // revoke so theo giây: token phải được cấp trước mốc revoke ≥ 1 giây
    await new Promise((r) => setTimeout(r, 1100))
    await expect(deleteCurrentSession(ctx)).resolves.toBeUndefined()
    await expect(verifyIdToken(token)).rejects.toMatchObject({ code: 'TOKEN_REVOKED', status: 401 })
  })
})
