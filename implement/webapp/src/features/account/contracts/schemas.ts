import { z } from 'zod'
import { EmailSchema, PRIVACY_POLICY_VERSION, TimestampSchema, UidSchema } from '@/shared/contracts'

/** = components.schemas.Me — TBL-01 + TBL-02, đã bỏ email_norm, lookup_window, display_name_custom */
export const MeSchema = z.object({
  uid: UidSchema,
  email: EmailSchema,
  displayName: z.string().min(1).max(50),
  photoUrl: z.string().url().nullable().optional(),
  anonymous: z.boolean(),
  showOnline: z.boolean(),
  status: z.enum(['active', 'deleted']),
  consentAt: TimestampSchema,
  createdAt: TimestampSchema,
})

/** = components.schemas.Limits (TBL-11 config/limits, camelCase) */
export const LimitsSchema = z.object({
  maxRoomMembers: z.number().int().min(2),
  maxImagesPerMessage: z.number().int().min(1),
  maxImageBytesPerMessage: z.number().int().min(1),
  ttlDaysOptions: z.array(z.number().int().min(1)),
  inviteTtlDays: z.number().int(),
  notificationTtlDays: z.number().int(),
  emailLookupsPerHour: z.number().int(),
  rejectCooldownHours: z.number().int(),
  maxMessageChars: z.number().int(),
  displayNameMax: z.number().int(),
  roomNameMax: z.number().int(),
  sessionIdleDays: z.number().int(),
})

/** = components.schemas.MeWithLimits — output createAccount, getMe */
export const MeWithLimitsSchema = z.object({ me: MeSchema, limits: LimitsSchema })

/**
 * createAccount — input (= components.schemas.AccountCreate, additionalProperties: false).
 * policyVersion khác phiên bản hiện hành → VALIDATION_FAILED [ASSUMED → Q-047].
 */
export const AccountCreateSchema = z
  .object({
    acceptPrivacyPolicy: z.literal(true),
    policyVersion: z
      .string()
      .min(1)
      .max(32)
      .refine((v) => v === PRIVACY_POLICY_VERSION, { message: 'Policy version mismatch' }),
  })
  .strict()

/** SCR-11.A0 — dữ liệu màn Cài đặt đọc từ listener users/{me} + profiles/{me} (không qua API). */
export const MySettingsSchema = MeSchema.pick({
  email: true,
  displayName: true,
  photoUrl: true,
  anonymous: true,
  showOnline: true,
})
