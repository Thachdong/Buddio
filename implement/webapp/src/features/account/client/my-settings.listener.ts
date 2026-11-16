import 'client-only'
import { doc, onSnapshot, type Timestamp, type Unsubscribe } from 'firebase/firestore'
import { clientDb } from '@/shared/client/firebase'
import type { MySettings } from '../contracts'

/** Field client được đọc (rules TBL-01: get khi isMe; TBL-02: get khi signedIn). */
type UserClientDoc = { anonymous?: boolean; show_online?: boolean; last_active_at?: Timestamp }
type ProfileClientDoc = { display_name?: string | null; photo_url?: string | null; email?: string | null }

/**
 * SCR-11.A0 — listener `users/{uid}` (anonymous, show_online) + `profiles/{uid}` (tên, ảnh, email).
 * Get theo doc id (không query → không cần index/limit). Gọi onData khi đã có cả hai.
 * Một trong hai lỗi (vd permission-denied) → onError, huỷ cả hai.
 */
export function subscribeMySettings(
  uid: string,
  onData: (settings: MySettings) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const db = clientDb()
  let user: UserClientDoc | undefined
  let profile: ProfileClientDoc | undefined
  let failed = false

  const emit = () => {
    if (failed || !user || !profile) return
    onData({
      email: profile.email ?? '',
      displayName: profile.display_name ?? '',
      photoUrl: profile.photo_url ?? null,
      anonymous: user.anonymous ?? true,
      showOnline: user.show_online ?? true,
    })
  }
  const fail = (err: Error) => {
    if (failed) return
    failed = true
    stop()
    onError(err)
  }

  const unsubUser = onSnapshot(
    doc(db, 'users', uid),
    (s) => {
      if (!s.exists()) return s.metadata.fromCache ? undefined : fail(new Error('not-found')) // cache cũ: chờ server
      user = s.data() as UserClientDoc
      emit()
    },
    fail,
  )
  const unsubProfile = onSnapshot(
    doc(db, 'profiles', uid),
    (s) => {
      if (!s.exists()) return s.metadata.fromCache ? undefined : fail(new Error('not-found'))
      profile = s.data() as ProfileClientDoc
      emit()
    },
    fail,
  )
  function stop() {
    unsubUser()
    unsubProfile()
  }
  return stop
}
