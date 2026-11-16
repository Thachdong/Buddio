import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { Timestamp } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from './firebase-admin'
import { AppError } from './errors'
import { getLimits } from './limits'
import { logger } from './logger'

export const SESSION_COOKIE = '__session' // App Hosting chỉ forward cookie tên này
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000 // giới hạn của Firebase session cookie
const DAY_MS = 24 * 60 * 60 * 1000
const LAST_ACTIVE_THROTTLE_MS = 60 * 60 * 1000 // TBL-01: cập nhật tối đa 1 lần / giờ

/**
 * public   — không cần đăng nhập
 * identity — có Firebase identity hợp lệ, chưa cần tài khoản Buddio (createSession, createAccount, openInviteLink)
 * member   — có tài khoản active + đã đồng ý + phiên chưa quá 30 ngày (mặc định)
 */
export type AuthLevel = 'public' | 'identity' | 'member'
/** Claim từ ID token / session cookie. name, picture = hồ sơ Google (dùng khi đăng nhập, không log — NFR-27). */
export type Identity = { uid: string; email: string | null; name: string | null; picture: string | null }

type DecodedClaims = { uid: string; email?: string; name?: unknown; picture?: unknown }

/** Decoded token → Identity. Dùng chung cho cookie, Bearer và ID token khi tạo phiên. */
export function toIdentity(t: DecodedClaims): Identity {
  return {
    uid: t.uid,
    email: t.email ?? null,
    name: typeof t.name === 'string' ? t.name : null,
    picture: typeof t.picture === 'string' ? t.picture : null,
  }
}
export type AuthContext<L extends AuthLevel = AuthLevel> = L extends 'public' ? null : Identity

function mapFirebaseAuthError(err: unknown): AppError {
  const code = (err as { code?: string })?.code ?? ''
  if (code.endsWith('revoked') || code === 'auth/user-disabled') return new AppError('TOKEN_REVOKED', { cause: err })
  return new AppError('UNAUTHENTICATED', { cause: err })
}

/** Verify cookie `__session` (checkRevoked). Throw AppError. Memo theo request. */
export const verifySession = cache(async (): Promise<Identity> => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value
  if (!cookie) throw new AppError('UNAUTHENTICATED')
  try {
    return toIdentity(await adminAuth().verifySessionCookie(cookie, true))
  } catch (err) {
    throw mapFirebaseAuthError(err)
  }
})

/** Cho Route Handler được gọi từ client ngoài: `Authorization: Bearer <idToken>`. */
export async function verifyBearer(authorization: string | null): Promise<Identity | null> {
  const token = authorization?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  try {
    return toIdentity(await adminAuth().verifyIdToken(token, true))
  } catch (err) {
    throw mapFirebaseAuthError(err)
  }
}

/**
 * Kiểm phiên của tài khoản (NFR-11, NFR-17) — nguồn duy nhất, dùng cho requireAuth('member') và guard RSC (getMe).
 * Thứ tự: tài khoản active + đã đồng ý → CONSENT_REQUIRED; quá `sessionIdleDays` (config/limits, đúng mốc vẫn còn phiên)
 * → revokeRefreshTokens + (xoá cookie nếu được phép) + SESSION_EXPIRED, KHÔNG cập nhật last_active_at;
 * còn phiên và lần ghi trước cách ≥ 1 giờ → last_active_at = now.
 * Ngoại lệ có chủ đích: shared đọc thẳng `users` (TBL-01).
 * clearCookie: chỉ true trong Server Action / Route Handler (render RSC không được ghi cookie).
 */
export async function checkMemberSession(
  uid: string,
  opts: { now?: Date; clearCookie?: boolean } = {},
): Promise<void> {
  const now = opts.now ?? new Date()
  const ref = adminDb().collection('users').doc(uid)
  const [snap, limits] = await Promise.all([ref.get(), getLimits()])
  const u = snap.data() as
    | { status?: string; consent_at?: Timestamp; last_active_at?: Timestamp }
    | undefined
  if (!u || u.status !== 'active' || !u.consent_at) throw new AppError('CONSENT_REQUIRED')

  const idleMs = now.getTime() - (u.last_active_at?.toMillis() ?? 0)
  if (idleMs > limits.sessionIdleDays * DAY_MS) {
    await adminAuth().revokeRefreshTokens(uid)
    if (opts.clearCookie) await clearSessionCookie()
    logger.info('session expired', { uid })
    throw new AppError('SESSION_EXPIRED')
  }
  if (idleMs >= LAST_ACTIVE_THROTTLE_MS) {
    await ref.update({ last_active_at: Timestamp.fromDate(now), updated_at: Timestamp.fromDate(now) })
  }
}

/**
 * Dùng trong runAction / runRoute. `bearer` chỉ do runRoute truyền vào.
 * Server Component cần biết user: gọi getOptionalIdentity() trong <Suspense> (cacheComponents).
 */
export async function requireAuth<L extends AuthLevel>(
  level: L,
  bearer?: string | null,
): Promise<AuthContext<L>> {
  if (level === 'public') return null as AuthContext<L>
  const identity = (await verifyBearer(bearer ?? null)) ?? (await verifySession())
  if (level === 'member') await checkMemberSession(identity.uid, { clearCookie: true })
  return identity as AuthContext<L>
}

/** Cho Server Component / proxy-style check: không throw, trả null. */
export async function getOptionalIdentity(): Promise<Identity | null> {
  try {
    return await verifySession()
  } catch {
    return null
  }
}

/** Verify ID token Firebase (checkRevoked) — dùng cho createSession. Throw AppError UNAUTHENTICATED / TOKEN_REVOKED. */
export async function verifyIdToken(idToken: string): Promise<Identity> {
  try {
    return toIdentity(await adminAuth().verifyIdToken(idToken, true))
  } catch (err) {
    throw mapFirebaseAuthError(err)
  }
}

/** Gọi trong Server Action / Route Handler (không gọi lúc render). */
export async function setSessionCookie(idToken: string): Promise<void> {
  const value = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS })
  ;(await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS / 1000,
  })
}

export async function clearSessionCookie(): Promise<void> {
  ;(await cookies()).delete(SESSION_COOKIE)
}
