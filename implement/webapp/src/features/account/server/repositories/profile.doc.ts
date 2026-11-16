import 'server-only'
import { Timestamp } from 'firebase-admin/firestore'
import type { Me } from '../../contracts'
import type { UserEntity, UserStatus } from './user.doc'

export const PROFILES = 'profiles' // TBL-02

export type ProfileDoc = {
  display_name: string | null
  display_name_custom: boolean
  photo_url: string | null
  email: string | null
  status: UserStatus
  updated_at: Timestamp
}

export type ProfileEntity = {
  uid: string
  displayName: string | null
  displayNameCustom: boolean
  photoUrl: string | null
  email: string | null
  status: UserStatus
  updatedAt: Date
}

export function toProfileDoc(e: Omit<ProfileEntity, 'uid'>): ProfileDoc {
  return {
    display_name: e.displayName,
    display_name_custom: e.displayNameCustom,
    photo_url: e.photoUrl,
    email: e.email,
    status: e.status,
    updated_at: Timestamp.fromDate(e.updatedAt),
  }
}

export function fromProfileDoc(uid: string, d: ProfileDoc): ProfileEntity {
  return {
    uid,
    displayName: d.display_name ?? null,
    displayNameCustom: d.display_name_custom ?? false,
    photoUrl: d.photo_url ?? null,
    email: d.email ?? null,
    status: d.status,
    updatedAt: d.updated_at.toDate(),
  }
}

/** Me DTO = TBL-01 + TBL-02, bỏ email_norm, lookup_window, display_name_custom. Chỉ dùng cho tài khoản active. */
export function toMeDto(user: UserEntity, profile: ProfileEntity): Me {
  return {
    uid: user.uid,
    email: profile.email ?? user.emailNorm ?? '',
    displayName: profile.displayName ?? '',
    photoUrl: profile.photoUrl,
    anonymous: user.anonymous,
    showOnline: user.showOnline,
    status: user.status,
    consentAt: user.consentAt.toISOString(),
    createdAt: user.createdAt.toISOString(),
  }
}
