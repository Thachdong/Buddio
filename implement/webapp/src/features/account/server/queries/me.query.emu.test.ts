import { beforeEach, describe, expect, it } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'
import { clearFirestore, db } from '@/test/emulator'
import { seedT002, T002_USERS } from '../../../../../scripts/seed/fixtures/T-002'
import { getMe } from './me.query'

const an = { uid: T002_USERS.an.uid, email: T002_USERS.an.email, name: null, picture: null }
const NOW = new Date('2026-11-15T10:00:00Z')

async function setLastActive(minutesAgo: number) {
  await db().doc(`users/${an.uid}`).update({ last_active_at: Timestamp.fromMillis(NOW.getTime() - minutesAgo * 60_000) })
}
const lastActive = async () => ((await db().doc(`users/${an.uid}`).get()).data()!.last_active_at as Timestamp).toMillis()

describe('getMe (LAYOUT.A1)', () => {
  beforeEach(async () => {
    await clearFirestore()
    await seedT002()
  })

  it('trả MeWithLimits, bỏ cột nội bộ', async () => {
    await setLastActive(5)
    const r = await getMe(an, NOW)
    expect(r.me).toMatchObject({ uid: an.uid, displayName: 'An Gamer', anonymous: true, showOnline: true, status: 'active' })
    expect(r.me).not.toHaveProperty('emailNorm')
    expect(r.me).not.toHaveProperty('displayNameCustom')
    expect(r.limits.ttlDaysOptions).toEqual([1, 2, 3, 7, 30, 90])
  })

  it('AC-16: last_active_at cách 30 phút → không đổi', async () => {
    await setLastActive(30)
    const before = await lastActive()
    await getMe(an, NOW)
    expect(await lastActive()).toBe(before)
  })

  it('AC-16: last_active_at cách 2 giờ → cập nhật = now', async () => {
    await setLastActive(120)
    await getMe(an, NOW)
    expect(await lastActive()).toBe(NOW.getTime())
  })

  it('AC-10: chưa có tài khoản (chưa đồng ý) → CONSENT_REQUIRED', async () => {
    await expect(getMe({ uid: 'u_nobody', email: 'x@gmail.com', name: null, picture: null }, NOW)).rejects.toMatchObject({
      code: 'CONSENT_REQUIRED',
    })
  })

  it('tài khoản deleted → CONSENT_REQUIRED', async () => {
    await expect(getMe({ uid: 'u_old', email: null, name: null, picture: null }, NOW)).rejects.toMatchObject({
      code: 'CONSENT_REQUIRED',
    })
  })
})
