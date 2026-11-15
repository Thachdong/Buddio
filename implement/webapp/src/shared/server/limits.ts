import 'server-only'
import type { Limits } from '@/features/account/contracts'
import { adminDb } from './firebase-admin'

/** TBL-11 `config/limits` — chỉ server đọc. Thiếu field → default (database-design mục 6). */
type LimitsDoc = {
  max_room_members: number
  max_images_per_message: number
  max_image_bytes_per_message: number
  ttl_days_options: number[]
  invite_ttl_days: number
  notification_ttl_days: number
  email_lookups_per_hour: number
  reject_cooldown_hours: number
  max_message_chars: number
  ended_request_ttl_days: number
  display_name_max: number
  room_name_max: number
  session_idle_days: number
}

const DEFAULTS: LimitsDoc = {
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

const CACHE_MS = 5 * 60 * 1000 // api-contract getMe: cache 5 phút
let cached: { value: Limits; at: number } | undefined

function toLimits(d: Partial<LimitsDoc>): Limits {
  const v = { ...DEFAULTS, ...d }
  return {
    maxRoomMembers: v.max_room_members,
    maxImagesPerMessage: v.max_images_per_message,
    maxImageBytesPerMessage: v.max_image_bytes_per_message,
    ttlDaysOptions: v.ttl_days_options,
    inviteTtlDays: v.invite_ttl_days,
    notificationTtlDays: v.notification_ttl_days,
    emailLookupsPerHour: v.email_lookups_per_hour,
    rejectCooldownHours: v.reject_cooldown_hours,
    maxMessageChars: v.max_message_chars,
    displayNameMax: v.display_name_max,
    roomNameMax: v.room_name_max,
    sessionIdleDays: v.session_idle_days,
  }
}

/** Cache trong bộ nhớ process 5 phút. */
export async function getLimits(now: number = Date.now()): Promise<Limits> {
  if (cached && now - cached.at < CACHE_MS) return cached.value
  const snap = await adminDb().doc('config/limits').get()
  const value = toLimits((snap.data() ?? {}) as Partial<LimitsDoc>)
  cached = { value, at: now }
  return value
}

/** Chỉ cho test. */
export function resetLimitsCache(): void {
  cached = undefined
}
