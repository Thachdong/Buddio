import 'server-only'
import { ZodError } from 'zod'
import {
  ERROR_HTTP_STATUS,
  type AppErrorPayload,
  type ErrorCode,
  type ErrorDetail,
} from '@/shared/contracts'
import { vi } from '@/shared/i18n/vi'

/** Service throw lỗi này. runAction / runRoute chuyển thành ActionResult / HTTP. */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly details?: ErrorDetail[]

  constructor(
    code: ErrorCode,
    opts: { message?: string; details?: ErrorDetail[]; cause?: unknown } = {},
  ) {
    super(opts.message ?? vi.errors[code], { cause: opts.cause })
    this.name = 'AppError'
    this.code = code
    this.details = opts.details
  }

  get status(): number {
    return ERROR_HTTP_STATUS[this.code]
  }

  toPayload(): AppErrorPayload {
    return { code: this.code, message: this.message, ...(this.details ? { details: this.details } : {}) }
  }
}

const isErrorCode = (v: string): v is ErrorCode => v in ERROR_HTTP_STATUS

/** Zod issue có message là mã lỗi nghiệp vụ → dùng mã đó; còn lại → VALIDATION_FAILED. */
export function fromZodError(err: ZodError): AppError {
  const details: ErrorDetail[] = err.issues.map((i) => ({
    field: i.path.join('.'),
    code: i.code,
    message: isErrorCode(i.message) ? vi.errors[i.message] : i.message,
  }))
  const business = err.issues.find((i) => isErrorCode(i.message))
  return new AppError(business ? (business.message as ErrorCode) : 'VALIDATION_FAILED', { details })
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof ZodError) return fromZodError(err)
  return new AppError('INTERNAL_ERROR', { cause: err })
}
