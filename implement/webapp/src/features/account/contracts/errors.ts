import type { ErrorCode } from '@/shared/contracts'

/** createAccount: x-errors = UNAUTHENTICATED, VALIDATION_FAILED — đều là mã chung. */
export const createAccountErrors = [] as const satisfies readonly ErrorCode[]
export type CreateAccountError = (typeof createAccountErrors)[number]

/** getMe: x-errors = UNAUTHENTICATED, TOKEN_REVOKED, SESSION_EXPIRED, CONSENT_REQUIRED — đều là mã chung. */
export const getMeErrors = [] as const satisfies readonly ErrorCode[]
export type GetMeError = (typeof getMeErrors)[number]
