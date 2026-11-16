import type { ErrorCode } from '@/shared/contracts'

/** createSession: x-errors = UNAUTHENTICATED, TOKEN_REVOKED — đều là mã chung. */
export const createSessionErrors = [] as const satisfies readonly ErrorCode[]
export type CreateSessionError = (typeof createSessionErrors)[number]

/** deleteCurrentSession: x-errors = UNAUTHENTICATED — mã chung. Output 204 → void. Không input. */
export const deleteCurrentSessionErrors = [] as const satisfies readonly ErrorCode[]
export type DeleteCurrentSessionError = (typeof deleteCurrentSessionErrors)[number]
