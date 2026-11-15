import { readFileSync } from 'node:fs'
import { assertFails, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref as dbRef, get as dbGet, set as dbSet } from 'firebase/database'
import { getBytes, ref as stRef, uploadBytes } from 'firebase/storage'
import { afterAll, beforeAll, describe, it } from 'vitest'

// AC-3 — ADR-03 deny-all khởi điểm. Chạy trong `firebase emulators:exec` (CLI đặt FIREBASE_EMULATOR_HUB).
let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-buddio',
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8') },
    database: { rules: readFileSync('firebase/database.rules.json', 'utf8') },
    storage: { rules: readFileSync('firebase/storage.rules', 'utf8') },
  })
})

afterAll(async () => {
  await env?.cleanup()
})

const contexts = () => [
  { who: 'đã đăng nhập', ctx: env.authenticatedContext('alice') },
  { who: 'chưa đăng nhập', ctx: env.unauthenticatedContext() },
]

describe('Firestore rules deny-all', () => {
  it.each(['users/x', 'rooms/y'])('AC-3: get/set %s bị từ chối (authed + unauth)', async (path) => {
    for (const { ctx } of contexts()) {
      const db = ctx.firestore()
      await assertFails(getDoc(doc(db, path)))
      await assertFails(setDoc(doc(db, path), { a: 1 }))
    }
  })
})

describe('RTDB rules deny-all', () => {
  it('AC-3: đọc / ghi status/x bị từ chối (authed + unauth)', async () => {
    for (const { ctx } of contexts()) {
      const db = ctx.database()
      await assertFails(dbGet(dbRef(db, 'status/x')))
      await assertFails(dbSet(dbRef(db, 'status/x'), { state: 'online' }))
    }
  })
})

describe('Storage rules deny-all', () => {
  it('AC-3: upload / đọc uploads/x/a.png bị từ chối (authed + unauth)', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    for (const { ctx } of contexts()) {
      const st = ctx.storage()
      await assertFails(uploadBytes(stRef(st, 'uploads/x/a.png'), png, { contentType: 'image/png' }))
      await assertFails(getBytes(stRef(st, 'uploads/x/a.png')))
    }
  })
})
