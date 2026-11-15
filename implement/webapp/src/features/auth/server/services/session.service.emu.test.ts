import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'
import { PRIVACY_POLICY_VERSION } from '@/shared/contracts'
import { clearFirestore, db } from '@/test/emulator'
import { seedT002, T002_USERS } from '../../../../../scripts/seed/fixtures/T-002'
import { createSession } from './session.service'

const binh = { uid: 'u_binh', email: 'binh@gmail.com', name: 'Bình Trần', picture: 'https://example.com/binh.png' }
const an = T002_USERS.an

describe('createSession (FLOW-01 bước 1–7)', () => {
  beforeEach(async () => {
    await clearFirestore()
    await seedT002()
  })
  afterEach(() => vi.useRealTimers())

  it('AC-1: uid chưa có tài khoản → consent_required + googleProfile + policyVersion, không ghi document', async () => {
    const r = await createSession(binh)
    expect(r).toEqual({
      accountStatus: 'consent_required',
      googleProfile: { email: binh.email, displayName: binh.name, photoUrl: binh.picture },
      policyVersion: PRIVACY_POLICY_VERSION,
    })
    expect((await db().doc(`users/${binh.uid}`).get()).exists).toBe(false)
    expect((await db().doc(`profiles/${binh.uid}`).get()).exists).toBe(false)
    expect((await db().doc(`email_index/${binh.email}`).get()).exists).toBe(false)
  })

  it('AC-4: display_name_custom = true → ảnh theo Google, tên giữ "An Gamer", last_active_at cập nhật', async () => {
    const before = (await db().doc(`users/${an.uid}`).get()).data()!.last_active_at as Timestamp
    await db().doc(`users/${an.uid}`).update({ last_active_at: Timestamp.fromMillis(before.toMillis() - 3_600_000) })
    const newPhoto = 'https://example.com/an-new.png'
    const r = await createSession({ uid: an.uid, email: an.email, name: 'An', picture: newPhoto })
    expect(r.accountStatus).toBe('active')
    if (r.accountStatus !== 'active') return
    expect(r.me.displayName).toBe('An Gamer')
    expect(r.me.photoUrl).toBe(newPhoto)
    expect(r.limits.maxRoomMembers).toBe(50)
    const p = (await db().doc(`profiles/${an.uid}`).get()).data()!
    expect(p.photo_url).toBe(newPhoto)
    expect(p.display_name).toBe('An Gamer')
    const u = (await db().doc(`users/${an.uid}`).get()).data()!
    expect((u.last_active_at as Timestamp).toMillis()).toBeGreaterThan(before.toMillis() - 3_600_000)
  })

  it('AC-5: display_name_custom = false → display_name theo tên Google mới', async () => {
    await db().doc(`profiles/${an.uid}`).update({ display_name: 'An', display_name_custom: false })
    const r = await createSession({ uid: an.uid, email: an.email, name: 'An Nguyễn', picture: null })
    expect(r.accountStatus === 'active' && r.me.displayName).toBe('An Nguyễn')
    expect((await db().doc(`profiles/${an.uid}`).get()).data()!.display_name).toBe('An Nguyễn')
  })

  it('BR-28: uid đã xoá (status deleted) → consent_required, không ghi', async () => {
    const r = await createSession({ uid: T002_USERS.cuOld.uid, email: 'cu@gmail.com', name: 'Cu', picture: null })
    expect(r.accountStatus).toBe('consent_required')
    expect((await db().doc(`users/${T002_USERS.cuOld.uid}`).get()).data()!.status).toBe('deleted')
  })

  it('thiếu email trong token → UNAUTHENTICATED', async () => {
    await expect(createSession({ ...binh, email: null })).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
  })
})
