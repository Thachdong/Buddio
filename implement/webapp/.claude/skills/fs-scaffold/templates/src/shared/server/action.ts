import 'server-only'
import { unstable_rethrow } from 'next/navigation'
import type { z } from 'zod'
import type { ActionResult } from '@/shared/contracts'
import { requireAuth, type AuthContext, type AuthLevel } from './auth'
import { fromZodError, toAppError } from './errors'
import { logger } from './logger'

type RunActionOptions<L extends AuthLevel, S extends z.ZodTypeAny, O extends z.ZodTypeAny> = {
  /** Tên operationId — dùng cho log. */
  name: string
  auth: L
  schema: S
  input: unknown
  /** Schema output: parse để loại field thừa trước khi serialize ra client. Khuyến nghị luôn có. */
  output?: O
}

/**
 * Khung chuẩn cho mọi Server Action:
 *   auth → Zod parse input → handler (service) → parse output → ActionResult.
 * Chỉ throw lại lỗi điều hướng của Next (redirect/notFound); mọi lỗi khác thành { ok: false }.
 */
export async function runAction<
  L extends AuthLevel,
  S extends z.ZodTypeAny,
  T,
  O extends z.ZodTypeAny = z.ZodType<T>,
>(
  opts: RunActionOptions<L, S, O>,
  handler: (data: z.output<S>, ctx: AuthContext<L>) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const ctx = await requireAuth(opts.auth)
    const parsed = opts.schema.safeParse(opts.input)
    if (!parsed.success) throw fromZodError(parsed.error)
    const result = await handler(parsed.data, ctx)
    const data = (opts.output ? opts.output.parse(result) : result) as T
    return { ok: true, data }
  } catch (err) {
    unstable_rethrow(err)
    const appErr = toAppError(err)
    if (appErr.code === 'INTERNAL_ERROR') logger.error(`action ${opts.name} failed`, err)
    return { ok: false, error: appErr.toPayload() }
  }
}
