import { z } from 'zod'
import { EmailSchema } from '@/shared/contracts'
import { LimitsSchema, MeSchema } from '@/features/account/contracts'

/**
 * createSession — input. Contract HTTP gửi ID token qua header Authorization;
 * với Server Action (ADR-06 cập nhật) token đi trong body, server đổi sang cookie `__session`.
 */
export const SessionCreateSchema = z.object({ idToken: z.string().min(1) })

/** SessionResult.googleProfile — chỉ khi consent_required */
export const GoogleProfileSchema = z.object({
  email: EmailSchema,
  displayName: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
})

/** = components.schemas.SessionResult, tách theo accountStatus */
export const SessionResultSchema = z.discriminatedUnion('accountStatus', [
  z.object({ accountStatus: z.literal('active'), me: MeSchema, limits: LimitsSchema }),
  z.object({
    accountStatus: z.literal('consent_required'),
    googleProfile: GoogleProfileSchema,
    policyVersion: z.string(),
  }),
])
