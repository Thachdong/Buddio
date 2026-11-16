import 'server-only'
import { checkMemberSession, type Identity } from '@/shared/server/auth'
import { AppError } from '@/shared/server/errors'
import { getLimits } from '@/shared/server/limits'
import type { MeWithLimits } from '../../contracts'
import { toMeDto } from '../repositories/profile.doc'
import { getProfile } from '../repositories/profile.repo'
import { getUser } from '../repositories/user.repo'

/**
 * getMe — LAYOUT.A1 · BIZ-01, BIZ-02 · NFR-08, NFR-11, NFR-17.
 * Page gọi trong <Suspense> sau getOptionalIdentity(). Kiểm phiên dùng chung `checkMemberSession`
 * (chưa có tài khoản → CONSENT_REQUIRED; quá sessionIdleDays → revoke + SESSION_EXPIRED, không ghi last_active_at;
 * ≥ 1 giờ → cập nhật last_active_at) rồi mới đọc hồ sơ. Render không xoá được cookie — cookie đã bị revoke nên vô hiệu.
 */
export async function getMe(ctx: Identity, now: Date = new Date()): Promise<MeWithLimits> {
  await checkMemberSession(ctx.uid, { now, clearCookie: false })
  const [user, profile, limits] = await Promise.all([getUser(ctx.uid), getProfile(ctx.uid), getLimits()])
  if (!user || user.status !== 'active' || !profile) throw new AppError('CONSENT_REQUIRED')
  return { me: toMeDto(user, profile), limits }
}
