import 'server-only'
import { Timestamp, type CollectionReference, type Transaction } from 'firebase-admin/firestore'
import { adminDb } from '@/shared/server/firebase-admin'
import { EMAIL_INDEX, type EmailIndexDoc, type EmailIndexEntity } from './email-index.doc'

const col = () => adminDb().collection(EMAIL_INDEX) as CollectionReference<EmailIndexDoc>

export async function getEmailIndex(emailNorm: string, tx?: Transaction): Promise<EmailIndexEntity | null> {
  const ref = col().doc(emailNorm)
  const snap = tx ? await tx.get(ref) : await ref.get()
  if (!snap.exists) return null
  const d = snap.data()!
  return { emailNorm: snap.id, uid: d.uid, createdAt: d.created_at.toDate() }
}

/** set (không create): service đã kiểm doc cũ trỏ uid khác đang active trong cùng tx. */
export function upsertEmailIndex(e: EmailIndexEntity, tx: Transaction): void {
  tx.set(col().doc(e.emailNorm), { uid: e.uid, created_at: Timestamp.fromDate(e.createdAt) })
}
