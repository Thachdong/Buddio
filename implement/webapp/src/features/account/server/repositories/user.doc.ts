import 'server-only'
import { Timestamp } from 'firebase-admin/firestore'

export const USERS = 'users' // TBL-01

export type UserStatus = 'active' | 'deleted'

export type UserDoc = {
  email_norm: string | null
  anonymous: boolean
  show_online: boolean
  status: UserStatus
  consent_at: Timestamp
  last_active_at: Timestamp
  lookup_window?: { start: Timestamp; count: number } | null
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at?: Timestamp | null
}

/** Entity cho service — có field nội bộ (emailNorm, lastActiveAt). lookup_window thuộc T-005. */
export type UserEntity = {
  uid: string
  emailNorm: string | null
  anonymous: boolean
  showOnline: boolean
  status: UserStatus
  consentAt: Date
  lastActiveAt: Date
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export function toUserDoc(e: Omit<UserEntity, 'uid'>): UserDoc {
  return {
    email_norm: e.emailNorm,
    anonymous: e.anonymous,
    show_online: e.showOnline,
    status: e.status,
    consent_at: Timestamp.fromDate(e.consentAt),
    last_active_at: Timestamp.fromDate(e.lastActiveAt),
    created_at: Timestamp.fromDate(e.createdAt),
    updated_at: Timestamp.fromDate(e.updatedAt),
    deleted_at: e.deletedAt ? Timestamp.fromDate(e.deletedAt) : null,
  }
}

export function fromUserDoc(uid: string, d: UserDoc): UserEntity {
  return {
    uid,
    emailNorm: d.email_norm ?? null,
    anonymous: d.anonymous,
    showOnline: d.show_online,
    status: d.status,
    consentAt: d.consent_at.toDate(),
    lastActiveAt: d.last_active_at.toDate(),
    createdAt: d.created_at.toDate(),
    updatedAt: d.updated_at.toDate(),
    deletedAt: d.deleted_at?.toDate() ?? null,
  }
}
