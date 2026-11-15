'use server'

import type { ActionResult } from '@/shared/contracts'
import { runAction } from '@/shared/server/action'
import { setSessionCookie, verifyIdToken } from '@/shared/server/auth'
import { SessionCreateSchema, SessionResultSchema, type SessionResult } from '../contracts'
import { createSession } from './services/session.service'

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
