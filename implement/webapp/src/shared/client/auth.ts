import 'client-only'
import { useSyncExternalStore } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { clientAuth } from './firebase'

export type AuthUser = { uid: string }

/**
 * Trạng thái Firebase Auth ở trình duyệt. `undefined` = chưa biết (Firebase đang khôi phục phiên),
 * `null` = chưa đăng nhập. Không phải ranh giới bảo mật — server kiểm bằng cookie `__session`.
 */
export function subscribeAuthUser(cb: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(clientAuth(), (u: User | null) => cb(u ? { uid: u.uid } : null))
}

let current: AuthUser | null | undefined
const listeners = new Set<() => void>()
let unsubscribe: (() => void) | undefined

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  unsubscribe ??= subscribeAuthUser((u) => {
    current = u
    listeners.forEach((l) => l())
  })
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0) {
      unsubscribe?.()
      unsubscribe = undefined
      current = undefined
    }
  }
}

/** Hook cho listener cần uid: `const user = useAuthUser()`. */
export function useAuthUser(): AuthUser | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => undefined,
  )
}
