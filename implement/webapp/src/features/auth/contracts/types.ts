import type { z } from 'zod'
import type * as S from './schemas'

export type SessionCreate = z.input<typeof S.SessionCreateSchema>
export type GoogleProfile = z.output<typeof S.GoogleProfileSchema>
export type SessionResult = z.output<typeof S.SessionResultSchema>
