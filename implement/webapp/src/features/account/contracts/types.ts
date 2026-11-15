import type { z } from 'zod'
import type * as S from './schemas'

export type Me = z.output<typeof S.MeSchema>
export type Limits = z.output<typeof S.LimitsSchema>
export type MeWithLimits = z.output<typeof S.MeWithLimitsSchema>
export type AccountCreate = z.input<typeof S.AccountCreateSchema>
