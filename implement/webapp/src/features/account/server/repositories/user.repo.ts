import 'server-only'
import { Timestamp, type CollectionReference, type Transaction } from 'firebase-admin/firestore'
import { adminDb } from '@/shared/server/firebase-admin'
import { USERS, fromUserDoc, toUserDoc, type UserDoc, type UserEntity } from './user.doc'

const col = () => adminDb().collection(USERS) as CollectionReference<UserDoc>

export async function getUser(uid: string, tx?: Transaction): Promise<UserEntity | null> {
  const ref = col().doc(uid)
  const snap = tx ? await tx.get(ref) : await ref.get()
  return snap.exists ? fromUserDoc(snap.id, snap.data()!) : null
}

/** tx.create → lỗi nếu đã tồn tại (service đã kiểm trước trong cùng tx). */
export function insertUser(e: UserEntity, tx: Transaction): void {
  const { uid, ...rest } = e
  tx.create(col().doc(uid), toUserDoc(rest))
}

/** Cập nhật last_active_at (+ updated_at). Ngoài tx: ghi đơn lẻ. */
export async function touchLastActive(uid: string, at: Date, tx?: Transaction): Promise<void> {
  const patch = { last_active_at: Timestamp.fromDate(at), updated_at: Timestamp.fromDate(at) }
  if (tx) tx.update(col().doc(uid), patch)
  else await col().doc(uid).update(patch)
}
