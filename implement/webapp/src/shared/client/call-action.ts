import type { ActionResult, ErrorCode } from '@/shared/contracts'

/** Lỗi phát sinh phía client, không đến từ server (không nằm trong ERROR_CODES). */
export type ClientErrorCode = 'NETWORK_ERROR' | 'STALE_DEPLOY'

export type ClientResult<T, C extends ErrorCode = ErrorCode> =
  | ActionResult<T, C>
  | { ok: false; error: { code: ClientErrorCode; message: string } }

/**
 * Gọi Server Action từ hook. Action không bao giờ throw lỗi nghiệp vụ (runAction đã bọc),
 * nên exception ở đây chỉ có thể là mạng hoặc action ID cũ sau khi deploy.
 *   const r = await callAction(() => createFriendRequestAction(input))
 */
export async function callAction<T, C extends ErrorCode = ErrorCode>(
  fn: () => Promise<ActionResult<T, C>>,
): Promise<ClientResult<T, C>> {
  try {
    return await fn()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const code: ClientErrorCode = /failed to find server action/i.test(message) ? 'STALE_DEPLOY' : 'NETWORK_ERROR'
    return { ok: false, error: { code, message } }
  }
}
