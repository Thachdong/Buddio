import { SESSION_ENDED_CODES, type ActionResult, type ErrorCode } from '@/shared/contracts'
import { signOutClient } from './auth'

/** Lỗi phát sinh phía client, không đến từ server (không nằm trong ERROR_CODES). */
export type ClientErrorCode = 'NETWORK_ERROR' | 'STALE_DEPLOY'

export type ClientResult<T, C extends ErrorCode = ErrorCode> =
  | ActionResult<T, C>
  | { ok: false; error: { code: ClientErrorCode; message: string } }

/**
 * Gọi Server Action từ hook. Action không bao giờ throw lỗi nghiệp vụ (runAction đã bọc),
 * nên exception ở đây chỉ có thể là mạng hoặc action ID cũ sau khi deploy.
 *   const r = await callAction(() => createFriendRequestAction(input))
 * SESSION_EXPIRED / TOKEN_REVOKED → mặc định tự signOut + về /login?reason=expired (opts.onSessionEnded = 'ignore' để tự xử lý).
 */
export async function callAction<T, C extends ErrorCode = ErrorCode>(
  fn: () => Promise<ActionResult<T, C>>,
  opts: { onSessionEnded?: 'redirect' | 'ignore' } = {},
): Promise<ClientResult<T, C>> {
  try {
    const r = await fn()
    // T-003: phiên đã bị thu hồi / hết 30 ngày → signOut Firebase + về SCR-01 "Phiên đăng nhập đã hết hạn…"
    if (!r.ok && (opts.onSessionEnded ?? 'redirect') === 'redirect' && isSessionEnded(r.error.code)) {
      await endSessionOnClient()
    }
    return r
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const code: ClientErrorCode = /failed to find server action/i.test(message) ? 'STALE_DEPLOY' : 'NETWORK_ERROR'
    return { ok: false, error: { code, message } }
  }
}

const isSessionEnded = (code: string) => (SESSION_ENDED_CODES as readonly string[]).includes(code)

/** signOut Firebase (chủ động) rồi điều hướng cứng tới /login?reason=expired (xoá state client). */
export async function endSessionOnClient(): Promise<void> {
  try {
    await signOutClient()
  } finally {
    window.location.replace('/login?reason=expired')
  }
}
