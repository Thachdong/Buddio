import { z } from 'zod'

/**
 * Lý do quay về SCR-01, truyền qua `/login?reason=…` (SCR-01 vùng 5).
 * signed_out → "Bạn đã đăng xuất." · expired → SESSION_EXPIRED / TOKEN_REVOKED (dùng chung thông điệp, [ASSUMED → Q-047]).
 */
export const LOGIN_REASONS = ['signed_out', 'expired'] as const
export const LoginReasonSchema = z.enum(LOGIN_REASONS)
export type LoginReason = z.output<typeof LoginReasonSchema>

/** Mã lỗi buộc đăng nhập lại (đã thu hồi phiên ở server). */
export const SESSION_ENDED_CODES = ['SESSION_EXPIRED', 'TOKEN_REVOKED'] as const
