import 'server-only'
import { getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

/**
 * Trên App Hosting: initializeApp() tự đọc FIREBASE_CONFIG.
 * Local: biến môi trường *_EMULATOR_HOST làm Admin SDK trỏ vào emulator.
 */
function app(): App {
  return (
    getApps()[0] ??
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  )
}

let firestore: Firestore | undefined

export function adminDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(app())
    firestore.settings({ ignoreUndefinedProperties: true })
  }
  return firestore
}

export const adminAuth = () => getAuth(app())
export const adminRtdb = () => getDatabase(app())
export const adminBucket = () => getStorage(app()).bucket()
