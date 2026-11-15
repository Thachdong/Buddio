/**
 * Helper cho test chạy trong `firebase emulators:exec` (CLI đặt *_EMULATOR_HOST).
 * Không dùng ngoài test.
 */
import { adminAuth, adminDb } from '@/shared/server/firebase-admin'
import { resetLimitsCache } from '@/shared/server/limits'

export const PROJECT_ID = 'demo-buddio'
const firestoreHost = () => process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080'
const authHost = () => process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099'

process.env.FIREBASE_PROJECT_ID ??= PROJECT_ID

export async function clearFirestore(): Promise<void> {
  const res = await fetch(
    `http://${firestoreHost()}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  )
  if (!res.ok) throw new Error(`clearFirestore ${res.status}`)
  resetLimitsCache()
}

export async function clearAuth(): Promise<void> {
  const res = await fetch(`http://${authHost()}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`clearAuth ${res.status}`)
}

/** Tạo user trên Auth emulator và đổi custom token → ID token thật của emulator. */
export async function createIdToken(user: { uid: string; email: string; displayName?: string; photoURL?: string }) {
  await adminAuth().createUser(user)
  const custom = await adminAuth().createCustomToken(user.uid)
  const res = await fetch(
    `http://${authHost()}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=demo-api-key`,
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: custom, returnSecureToken: true }) },
  )
  const body = (await res.json()) as { idToken?: string }
  if (!body.idToken) throw new Error('createIdToken failed')
  return body.idToken
}

export const db = () => adminDb()
