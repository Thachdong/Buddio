import 'server-only'
import type { Timestamp } from 'firebase-admin/firestore'

export const EMAIL_INDEX = 'email_index' // TBL-03 — doc id = email_norm

export type EmailIndexDoc = { uid: string; created_at: Timestamp }
export type EmailIndexEntity = { emailNorm: string; uid: string; createdAt: Date }

/** email_norm = trim + lowercase (khớp users.email_norm). */
export const toEmailNorm = (email: string) => email.trim().toLowerCase()
