import type { ErrorCode } from './error-codes'

/** = schema `ErrorDetail` trong specs/api-contract.yml */
export type ErrorDetail = {
  field?: string
  code?: string
  message?: string
  uid?: string
  friendUid?: string
  retryAfter?: string
  remainingSlots?: number
}

/** = schema `Error` trong specs/api-contract.yml */
export type AppErrorPayload<C extends ErrorCode = ErrorCode> = {
  code: C
  message: string
  details?: ErrorDetail[]
}

/** Kết quả mọi Server Action. Không throw qua ranh giới. */
export type ActionResult<T, C extends ErrorCode = ErrorCode> =
  | { ok: true; data: T }
  | { ok: false; error: AppErrorPayload<C> }
