import 'server-only'
import type { Identity } from '@/shared/server/auth'
import { AppError } from '@/shared/server/errors'
import { getLimits } from '@/shared/server/limits'
import type { MeWithLimits } from '../../contracts'
import { toMeDto } from '../repositories/profile.doc'
import { getProfile } from '../repositories/profile.repo'
import { getUser, touchLastActive } from '../repositories/user.repo'

const LAST_ACTIVE_THROTTLE_MS = 60 * 60 * 1000 // TBL-01: tối đa 1 lần / giờ
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * getMe — LAYOUT.A1 · BIZ-01, BIZ-02 · NFR-08, NFR-11 · NFR-17.
 * Page gọi trong <Suspense> sau getOptionalIdentity(). Chưa có tài khoản active → CONSENT_REQUIRED.
 * Quá sessionIdleDays → SESSION_EXPIRED (thu hồi phiên + UI thuộc T-003; render không xoá được cookie).
 * last_active_at cập nhật khi lần ghi trước cách ≥ 1 giờ.
 */
export async function getMe(ctx: Identity, now: Date = new Date()): Promise<MeWithLimits> {
  const [user, profile, limits] = await Promise.all([getUser(ctx.uid), getProfile(ctx.uid), getLimits()])
  if (!user || user.status !== 'active' || !profile) throw new AppError('CONSENT_REQUIRED')

  const idleMs = now.getTime() - user.lastActiveAt.getTime()
  if (idleMs > limits.sessionIdleDays * DAY_MS) throw new AppError('SESSION_EXPIRED')

  let fresh = user
  if (idleMs >= LAST_ACTIVE_THROTTLE_MS) {
    await touchLastActive(ctx.uid, now)
    fresh = { ...user, lastActiveAt: now, updatedAt: now }
  }
  return { me: toMeDto(fresh, profile), limits }
}
