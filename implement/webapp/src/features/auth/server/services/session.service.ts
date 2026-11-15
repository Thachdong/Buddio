import 'server-only'
import { PRIVACY_POLICY_VERSION } from '@/shared/contracts'
import type { Identity } from '@/shared/server/auth'
import { AppError } from '@/shared/server/errors'
import { adminDb } from '@/shared/server/firebase-admin'
import { getLimits } from '@/shared/server/limits'
import { logger } from '@/shared/server/logger'
import { normalizeDisplayName } from '@/features/account/contracts'
import { getUser, touchLastActive } from '@/features/account/server/repositories/user.repo'
import { getProfile, updateProfileFromGoogle } from '@/features/account/server/repositories/profile.repo'
import { toMeDto } from '@/features/account/server/repositories/profile.doc'
import type { SessionResult } from '../../contracts'

/**
 * createSession — BIZ-01 · FLOW-01 bước 1–7 · BR-01, BR-28, BR-29 · NFR-17 · Q-029.
 * Tài khoản active → đồng bộ ảnh Google (luôn), tên Google (chỉ khi display_name_custom = false),
 * last_active_at = now. Chưa có (hoặc uid cũ không active) → KHÔNG ghi gì, trả consent_required.
 * Cookie phiên do transport đặt (service không biết HTTP).
 */
export async function createSession(ctx: Identity): Promise<SessionResult> {
  const email = ctx.email
  if (!email) throw new AppError('UNAUTHENTICATED') // BR-01: chỉ Google, phải có email
  const now = new Date()

  const me = await adminDb().runTransaction(async (tx) => {
    const user = await getUser(ctx.uid, tx)
    const profile = user?.status === 'active' ? await getProfile(ctx.uid, tx) : null
    if (!user || user.status !== 'active' || !profile) return null

    const displayName = profile.displayNameCustom ? undefined : normalizeDisplayName(ctx.name, email)
    updateProfileFromGoogle(ctx.uid, { photoUrl: ctx.picture, displayName, updatedAt: now }, tx)
    touchLastActive(ctx.uid, now, tx)
    return toMeDto(
      { ...user, lastActiveAt: now, updatedAt: now },
      { ...profile, photoUrl: ctx.picture, displayName: displayName ?? profile.displayName, updatedAt: now },
    )
  })

  // Sau commit — NFR-27: chỉ uid + accountStatus
  if (!me) {
    logger.info('createSession', { uid: ctx.uid, accountStatus: 'consent_required' })
    return {
      accountStatus: 'consent_required',
      googleProfile: { email, displayName: ctx.name, photoUrl: ctx.picture },
      policyVersion: PRIVACY_POLICY_VERSION,
    }
  }
  logger.info('createSession', { uid: ctx.uid, accountStatus: 'active' })
  return { accountStatus: 'active', me, limits: await getLimits() }
}
