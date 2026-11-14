import 'client-only'
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectDatabaseEmulator, getDatabase, type Database } from 'firebase/database'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage'

/** Chỉ dùng biến NEXT_PUBLIC_*. Lazy để không khởi tạo khi SSR client component. */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true'

let services: { app: FirebaseApp; auth: Auth; db: Firestore; rtdb: Database; storage: FirebaseStorage } | undefined

function init() {
  if (services) return services
  const app = getApps().length ? getApp() : initializeApp(config)
  const auth = getAuth(app)
  const db = getFirestore(app)
  const rtdb = getDatabase(app)
  const storage = getStorage(app)
  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    connectDatabaseEmulator(rtdb, '127.0.0.1', 9000)
    connectStorageEmulator(storage, '127.0.0.1', 9199)
  }
  services = { app, auth, db, rtdb, storage }
  return services
}

export const clientAuth = () => init().auth
export const clientDb = () => init().db
export const clientRtdb = () => init().rtdb
export const clientStorage = () => init().storage
