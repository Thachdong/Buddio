import type { ErrorCode } from '@/shared/contracts'

/** createSession: x-errors = UNAUTHENTICATED, TOKEN_REVOKED — đều là mã chung. */
export const createSessionErrors = [] as const satisfies readonly ErrorCode[]
export type CreateSessionError = (typeof createSessionErrors)[number]
