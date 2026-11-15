import { z } from 'zod'
import type { ErrorCode } from './error-codes'

/** getHealth (GET /health) — không input. = components.schemas.Health (`status: const ok`) */
export const HealthSchema = z.object({ status: z.literal('ok') })
export type Health = z.output<typeof HealthSchema>

/** Chỉ lỗi chung (INTERNAL_ERROR). */
export const getHealthErrors = [] as const satisfies readonly ErrorCode[]
