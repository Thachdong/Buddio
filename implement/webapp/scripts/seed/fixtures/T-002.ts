import { Timestamp } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '@/shared/server/firebase-admin'

/**
 * T-002 — config/limits (TBL-11) + tài khoản mẫu. Idempotent: id cố định, set() ghi đè.
 * Email mẫu là địa chỉ giả trên emulator, không phải dữ liệu người dùng thật.
 */
export const T002_USERS = {
  an: { uid: 'seed_an', email: 'an@gmail.com', name: 'An', photo: 'https://example.com/an-google.png' },
  cuOld: { uid: 'u_old', email: 'cu@gmail.com' },
} as const

/** database-design mục 6 — 13 giá trị mặc định */
export const DEFAULT_LIMITS_DOC = {
  max_room_members: 50,
  max_images_per_message: 10,
  max_image_bytes_per_message: 10485760,
  ttl_days_options: [1, 2, 3, 7, 30, 90],
  invite_ttl_days: 7,
  notification_ttl_days: 30,
  email_lookups_per_hour: 100,
  reject_cooldown_hours: 24,
  max_message_chars: 1000,
  ended_request_ttl_days: 30,
  display_name_max: 50,
  room_name_max: 50,
  session_idle_days: 30,
}

async function upsertAuthUser(uid: string, data: { email: string; displayName?: string; photoURL?: string }) {
  try {
    await adminAuth().updateUser(uid, data)
  } catch {
    await adminAuth().createUser({ uid, ...data })
  }
}

export async function seedT002(): Promise<void> {
  const db = adminDb()
  const now = Timestamp.now()

  await db.doc('config/limits').set({ ...DEFAULT_LIMITS_DOC, updated_at: now })

  // AC-4: an@gmail.com đã có tài khoản, tự đổi tên "An Gamer"
  const an = T002_USERS.an
  await upsertAuthUser(an.uid, { email: an.email, displayName: an.name, photoURL: an.photo })
  await db.doc(`users/${an.uid}`).set({
    email_norm: an.email,
    anonymous: true,
    show_online: true,
    status: 'active',
    consent_at: now,
    last_active_at: now,
    created_at: now,
    updated_at: now,
  })
  await db.doc(`profiles/${an.uid}`).set({
    display_name: 'An Gamer',
    display_name_custom: true,
    photo_url: 'https://example.com/an-old.png',
    email: an.email,
    status: 'active',
    updated_at: now,
  })
  await db.doc(`email_index/${an.email}`).set({ uid: an.uid, created_at: now })

  // AC-9: u_old đã xoá (BR-28) — không có email_index cho cu@gmail.com, không có Auth user
  const old = T002_USERS.cuOld
  await db.doc(`users/${old.uid}`).set({
    email_norm: null,
    anonymous: true,
    show_online: true,
    status: 'deleted',
    consent_at: now,
    last_active_at: now,
    created_at: now,
    updated_at: now,
    deleted_at: now,
  })
  await db.doc(`profiles/${old.uid}`).set({
    display_name: null,
    display_name_custom: false,
    photo_url: null,
    email: null,
    status: 'deleted',
    updated_at: now,
  })
  await db.doc(`email_index/${old.email}`).delete()
}
