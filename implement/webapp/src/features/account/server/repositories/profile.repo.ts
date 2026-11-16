import 'server-only'
import { Timestamp, type CollectionReference, type Transaction } from 'firebase-admin/firestore'
import { adminDb } from '@/shared/server/firebase-admin'
import { PROFILES, fromProfileDoc, toProfileDoc, type ProfileDoc, type ProfileEntity } from './profile.doc'

const col = () => adminDb().collection(PROFILES) as CollectionReference<ProfileDoc>

export async function getProfile(uid: string, tx?: Transaction): Promise<ProfileEntity | null> {
  const ref = col().doc(uid)
  const snap = tx ? await tx.get(ref) : await ref.get()
  return snap.exists ? fromProfileDoc(snap.id, snap.data()!) : null
}

export function insertProfile(e: ProfileEntity, tx: Transaction): void {
  const { uid, ...rest } = e
  tx.create(col().doc(uid), toProfileDoc(rest))
}

/** Đồng bộ từ Google khi đăng nhập: luôn ghi photo_url; display_name chỉ khi service truyền vào. */
export function updateProfileFromGoogle(
  uid: string,
  patch: { photoUrl: string | null; displayName?: string; updatedAt: Date },
  tx: Transaction,
): void {
  tx.update(col().doc(uid), {
    photo_url: patch.photoUrl,
    ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
    updated_at: Timestamp.fromDate(patch.updatedAt),
  })
}
