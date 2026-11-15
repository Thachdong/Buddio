import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/** Admin SDK cho e2e — chạy trong `firebase emulators:exec` (CLI đặt *_EMULATOR_HOST). Chỉ project demo-*. */
process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099'
const app = getApps()[0] ?? initializeApp({ projectId: 'demo-buddio' })

export const adminDb = () => getFirestore(app)
export const adminAuth = () => getAuth(app)

export async function uidByEmail(email: string): Promise<string> {
  return (await adminAuth().getUserByEmail(email)).uid
}

/** Email duy nhất mỗi lần chạy để test song song không giẫm lên nhau. */
export const uniqueEmail = (prefix: string) => `${prefix}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@gmail.com`
