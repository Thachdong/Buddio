import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

// AC-15 — NFR-13, database-design 4.3: TBL-01, TBL-02, TBL-03, TBL-11
let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-buddio',
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8') },
  })
})
afterAll(async () => {
  await env?.cleanup()
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    for (const uid of ['A', 'B']) {
      await setDoc(doc(db, `users/${uid}`), { status: 'active', anonymous: true })
      await setDoc(doc(db, `profiles/${uid}`), { display_name: uid, status: 'active' })
    }
    await setDoc(doc(db, 'email_index/b@gmail.com'), { uid: 'B' })
    await setDoc(doc(db, 'config/limits'), { max_room_members: 50 })
  })
})

describe('Firestore rules TBL-01/02/03/11 (AC-15)', () => {
  it('AC-15: A được get users/A và get profiles/B', async () => {
    const db = env.authenticatedContext('A').firestore()
    await assertSucceeds(getDoc(doc(db, 'users/A')))
    await assertSucceeds(getDoc(doc(db, 'profiles/B')))
  })

  it('AC-15: A bị từ chối đọc users/B, list users, list profiles, email_index, config', async () => {
    const db = env.authenticatedContext('A').firestore()
    await assertFails(getDoc(doc(db, 'users/B')))
    await assertFails(getDocs(collection(db, 'users')))
    await assertFails(getDocs(collection(db, 'profiles')))
    await assertFails(getDoc(doc(db, 'email_index/b@gmail.com')))
    await assertFails(getDocs(collection(db, 'email_index')))
    await assertFails(getDoc(doc(db, 'config/limits')))
  })

  it('AC-15: mọi ghi từ client bị từ chối (kể cả users/A của chính mình)', async () => {
    const db = env.authenticatedContext('A').firestore()
    await assertFails(updateDoc(doc(db, 'users/A'), { anonymous: false }))
    await assertFails(setDoc(doc(db, 'users/A'), { status: 'active' }))
    await assertFails(updateDoc(doc(db, 'profiles/A'), { display_name: 'x' }))
    await assertFails(setDoc(doc(db, 'email_index/a@gmail.com'), { uid: 'A' }))
    await assertFails(setDoc(doc(db, 'config/limits'), { max_room_members: 1 }))
  })

  it('AC-15: chưa đăng nhập → không đọc được users/A, profiles/B', async () => {
    const db = env.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'users/A')))
    await assertFails(getDoc(doc(db, 'profiles/B')))
  })
})
