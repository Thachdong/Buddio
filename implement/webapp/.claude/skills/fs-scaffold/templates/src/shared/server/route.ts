import 'server-only'
import { unstable_rethrow } from 'next/navigation'
import type { z } from 'zod'
import { requireAuth, type AuthContext, type AuthLevel } from './auth'
import { fromZodError, toAppError } from './errors'
import { logger } from './logger'

type RouteContext = { params: Promise<Record<string, string | string[]>> }

type RunRouteOptions<L extends AuthLevel, S extends z.ZodTypeAny, O extends z.ZodTypeAny> = {
  name: string
  auth: L
  /** Input = JSON body (nếu có) + path params. Bỏ trống khi operation không có input. */
  schema?: S
  output?: O
  /** HTTP status khi thành công (theo api-contract.yml). Mặc định 200; 204 → không có body. */
  status?: number
}

/**
 * CHỈ dùng khi prompt yêu cầu API route. Gọi CÙNG service với Server Action.
 *   export const POST = runRoute({ name: 'createFriendRequest', auth: 'member', schema, status: 201 },
 *     (data, ctx) => createFriendRequest(ctx, data))
 */
export function runRoute<L extends AuthLevel, S extends z.ZodTypeAny, T, O extends z.ZodTypeAny = z.ZodType<T>>(
  opts: RunRouteOptions<L, S, O>,
  handler: (data: z.output<S>, ctx: AuthContext<L>, req: Request) => Promise<T>,
) {
  return async (req: Request, route: RouteContext): Promise<Response> => {
    const started = performance.now()
    const res = await handle(req, route)
    // NFR-27: chỉ log method, path, status, thời gian — không log body, query hay header Authorization
    logger.info('request', {
      operation: opts.name,
      method: req.method,
      path: new URL(req.url).pathname,
      status: res.status,
      ms: Math.round(performance.now() - started),
    })
    return res
  }

  async function handle(req: Request, route: RouteContext): Promise<Response> {
    try {
      const ctx = await requireAuth(opts.auth, req.headers.get('authorization'))
      let data: z.output<S> = undefined as z.output<S>
      if (opts.schema) {
        const body = req.method === 'GET' || req.method === 'DELETE' ? {} : await req.json().catch(() => ({}))
        const parsed = opts.schema.safeParse({ ...body, ...(await route.params) })
        if (!parsed.success) throw fromZodError(parsed.error)
        data = parsed.data
      }
      const result = await handler(data, ctx, req)
      const status = opts.status ?? 200
      if (status === 204) return new Response(null, { status })
      return Response.json(opts.output ? opts.output.parse(result) : result, { status })
    } catch (err) {
      // tín hiệu nội bộ của Next (bail-out prerender, redirect, notFound) phải đi tiếp
      unstable_rethrow(err)
      const appErr = toAppError(err)
      if (appErr.code === 'INTERNAL_ERROR') logger.error(`route ${opts.name} failed`, err)
      return Response.json(appErr.toPayload(), { status: appErr.status })
    }
  }
}
