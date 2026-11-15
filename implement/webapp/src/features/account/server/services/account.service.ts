import 'server-only'
import type { Identity } from '@/shared/server/auth'
import { AppError } from '@/shared/server/errors'
import { adminDb } from '@/shared/server/firebase-admin'
import { getLimits } from '@/shared/server/limits'
import { logger } from '@/shared/server/logger'
import { normalizeDisplayName, type AccountCreate, type MeWithLimits } from '../../contracts'
import { toEmailNorm } from '../repositories/email-index.doc'
import { getEmailIndex, upsertEmailIndex } from '../repositories/email-index.repo'
import { toMeDto, type ProfileEntity } from '../repositories/profile.doc'
import { getProfile, insertProfile } from '../repositories/profile.repo'
import type { UserEntity } from '../repositories/user.doc'
import { getUser, insertUser } from '../repositories/user.repo'

export type CreateAccountResult = MeWithLimits & { created: boolean }

/**
 * createAccount — BIZ-01 · FLOW-01 bước 6, E2 · BR-02 (anonymous mặc định), BR-28 (uid mới), BR-29 · NFR-17.
 * input đã qua AccountCreateSchema (acceptPrivacyPolicy = true, policyVersion hiện hành) — chỉ kiểm, không lưu (TBL-01 không có cột).
 * Email lấy từ token. Một transaction: users + profiles + email_index. Đã có tài khoản → trả hiện có (created = false).
 * email_index đang trỏ uid KHÁC còn active → INTERNAL_ERROR, không ghi đè [ASSUMED → Q-047].
 */
export async function createAccount(ctx: Identity, input: AccountCreate): Promise<CreateAccountResult> {
  void input
  const email = ctx.email
  if (!email) throw new AppError('UNAUTHENTICATED')
  const emailNorm = toEmailNorm(email)
  const now = new Date()

  const outcome = await adminDb().runTransaction(async (tx) => {
    // 1. ĐỌC
    const existingUser = await getUser(ctx.uid, tx)
    if (existingUser) {
      const profile = await getProfile(ctx.uid, tx)
      if (existingUser.status !== 'active' || !profile) return { kind: 'broken' as const }
      return { kind: 'existing' as const, me: toMeDto(existingUser, profile) }
    }
    const index = await getEmailIndex(emailNorm, tx)
    if (index && index.uid !== ctx.uid) {
      const owner = await getUser(index.uid, tx)
      if (owner?.status === 'active') return { kind: 'conflict' as const, ownerUid: index.uid }
    }

    // 2. GHI
    const user: UserEntity = {
      uid: ctx.uid,
      emailNorm,
      anonymous: true,
      showOnline: true,
      status: 'active',
      consentAt: now,
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }
    const profile: ProfileEntity = {
      uid: ctx.uid,
      displayName: normalizeDisplayName(ctx.name, email),
      displayNameCustom: false,
      photoUrl: ctx.picture,
      email: emailNorm,
      status: 'active',
      updatedAt: now,
    }
    insertUser(user, tx)
    insertProfile(profile, tx)
    upsertEmailIndex({ emailNorm, uid: ctx.uid, createdAt: now }, tx)
    return { kind: 'created' as const, me: toMeDto(user, profile) }
  })

  // Sau commit: log + lỗi (không side-effect trong callback tx)
  if (outcome.kind === 'conflict') {
    logger.warn('createAccount email_index points to another active uid', { uid: ctx.uid, otherUid: outcome.ownerUid })
    throw new AppError('INTERNAL_ERROR')
  }
  if (outcome.kind === 'broken') {
    logger.warn('createAccount user exists but not active', { uid: ctx.uid })
    throw new AppError('INTERNAL_ERROR')
  }
  const created = outcome.kind === 'created'
  logger.info('createAccount', { uid: ctx.uid, accountStatus: 'active', created })
  return { me: outcome.me, limits: await getLimits(), created }
}
