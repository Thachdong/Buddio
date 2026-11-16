'use server'

import type { ActionResult } from '@/shared/contracts'
import { runAction } from '@/shared/server/action'
import { clearSessionCookie, setSessionCookie, verifyIdToken } from '@/shared/server/auth'
import {
  DeleteCurrentSessionSchema,
  NoContentSchema,
  SessionCreateSchema,
  SessionResultSchema,
  type SessionResult,
} from '../contracts'
import { createSession, deleteCurrentSession } from './services/session.service'

/**
 * createSession (SCR-01.A1). Chưa có cookie nên auth 'public': danh tính lấy từ ID token
 * đã verify (checkRevoked), không từ input. Cookie `__session` đặt cho cả consent_required
 * để createAccount (auth 'identity') dùng được.
 */
export async function createSessionAction(input: unknown): Promise<ActionResult<SessionResult>> {
  return runAction(
    { name: 'createSession', auth: 'public', schema: SessionCreateSchema, output: SessionResultSchema, input },
    async (data) => {
      const identity = await verifyIdToken(data.idToken)
      await setSessionCookie(data.idToken)
      return createSession(identity)
    },
  )
}

/**
 * deleteCurrentSession (SCR-11.A4). Auth 'identity': không kiểm hết phiên để luôn đăng xuất được.
 * Thu hồi refresh token (mọi thiết bị, Q-044) rồi xoá cookie `__session`. Client tự signOut() kể cả khi lỗi.
 */
export async function deleteCurrentSessionAction(input?: unknown): Promise<ActionResult<undefined>> {
  return runAction(
    { name: 'deleteCurrentSession', auth: 'identity', schema: DeleteCurrentSessionSchema, output: NoContentSchema, input },
    async (_data, ctx) => {
      await deleteCurrentSession(ctx)
      await clearSessionCookie()
      return undefined
    },
  )
}
