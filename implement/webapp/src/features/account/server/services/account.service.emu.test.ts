import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Timestamp } from 'firebase-admin/firestore'
import { PRIVACY_POLICY_VERSION } from '@/shared/contracts'
import { clearFirestore, db } from '@/test/emulator'
import { seedT002, T002_USERS } from '../../../../../scripts/seed/fixtures/T-002'
import { createSession } from '@/features/auth/server/services/session.service'
import { createAccount } from './account.service'

const input = { acceptPrivacyPolicy: true as const, policyVersion: PRIVACY_POLICY_VERSION }
const binh = { uid: 'u_binh', email: 'binh@gmail.com', name: 'Bình Trần', picture: 'https://example.com/binh.png' }

describe('createAccount (FLOW-01 bước 6)', () => {
  beforeEach(async () => {
    await clearFirestore()
    await seedT002()
  })
  afterEach(() => vi.restoreAllMocks())

  it('AC-2: tạo users + profiles + email_index với giá trị mặc định', async () => {
    const r = await createAccount(binh, input)
    expect(r.created).toBe(true)
    expect(r.me).toMatchObject({ uid: binh.uid, email: binh.email, displayName: binh.name, photoUrl: binh.picture, anonymous: true, showOnline: true, status: 'active' })
    expect(r.limits.sessionIdleDays).toBe(30)

    const u = (await db().doc(`users/${binh.uid}`).get()).data()!
    expect(u).toMatchObject({ email_norm: binh.email, anonymous: true, show_online: true, status: 'active' })
    expect(u.consent_at).toBeTruthy()
    const p = (await db().doc(`profiles/${binh.uid}`).get()).data()!
    expect(p).toMatchObject({ display_name: binh.name, display_name_custom: false, photo_url: binh.picture, email: binh.email, status: 'active' })
    expect((await db().doc(`email_index/${binh.email}`).get()).data()!.uid).toBe(binh.uid)
  })

  it('AC-7: Google không có tên → display_name = phần trước "@"', async () => {
    const r = await createAccount({ uid: 'u_noname', email: 'noname@gmail.com', name: null, picture: null }, input)
    expect(r.me.displayName).toBe('noname')
    expect((await db().doc('profiles/u_noname').get()).data()!.display_name).toBe('noname')
  })

  it('AC-8: tên 60 ký tự → display_name 50 ký tự', async () => {
    const r = await createAccount({ uid: 'u_long', email: 'long@gmail.com', name: 'a'.repeat(60), picture: null }, input)
    expect(r.me.displayName).toHaveLength(50)
  })

  it('AC-9: email từng thuộc u_old (deleted) → tạo u_new, u_old giữ nguyên', async () => {
    const oldBefore = (await db().doc('users/u_old').get()).data()
    const r = await createAccount({ uid: 'u_new', email: 'cu@gmail.com', name: 'Cu', picture: null }, input)
    expect(r.created).toBe(true)
    expect((await db().doc('users/u_new').get()).exists).toBe(true)
    expect((await db().doc('profiles/u_new').get()).exists).toBe(true)
    expect((await db().doc('email_index/cu@gmail.com').get()).data()!.uid).toBe('u_new')
    expect((await db().doc('users/u_old').get()).data()).toEqual(oldBefore)
  })

  it('AC-14: gọi lần 2 → trả tài khoản hiện có, created = false, consent_at không đổi', async () => {
    await createAccount(binh, input)
    const c1 = (await db().doc(`users/${binh.uid}`).get()).data()!.consent_at as Timestamp
    const r2 = await createAccount({ ...binh, name: 'Tên khác' }, input)
    expect(r2.created).toBe(false)
    expect(r2.me.displayName).toBe(binh.name)
    const c2 = (await db().doc(`users/${binh.uid}`).get()).data()!.consent_at as Timestamp
    expect(c2.isEqual(c1)).toBe(true)
    expect((await db().collection('users').get()).size).toBe(3) // seed_an, u_old, u_binh
  })

  it('email_index trỏ uid khác đang active → INTERNAL_ERROR, không ghi đè', async () => {
    await expect(
      createAccount({ uid: 'u_other', email: T002_USERS.an.email, name: 'X', picture: null }, input),
    ).rejects.toMatchObject({ code: 'INTERNAL_ERROR' })
    expect((await db().doc(`email_index/${T002_USERS.an.email}`).get()).data()!.uid).toBe(T002_USERS.an.uid)
    expect((await db().doc('users/u_other').get()).exists).toBe(false)
  })

  it('AC-18: log của createSession + createAccount không chứa email hay tên', async () => {
    const lines: string[] = []
    const capture = (...a: unknown[]) => void lines.push(a.map(String).join(' '))
    vi.spyOn(console, 'log').mockImplementation(capture)
    vi.spyOn(console, 'error').mockImplementation(capture)
    vi.spyOn(console, 'warn').mockImplementation(capture)
    await createSession(binh)
    await createAccount(binh, input)
    expect(lines.length).toBeGreaterThan(0)
    const all = lines.join('\n')
    expect(all).toContain(binh.uid)
    expect(all).not.toContain(binh.email)
    expect(all).not.toContain('binh@')
    expect(all).not.toContain(binh.name)
  })
})
