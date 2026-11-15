/** Giới hạn tên hiển thị (BR-29, = Limits.displayNameMax mặc định). */
export const DISPLAY_NAME_MAX = 50

/**
 * Chuẩn hoá tên lấy từ Google (BR-29, FLOW-01 E2):
 * trim; trống / thiếu → phần trước "@" của email; dài hơn 50 → cắt còn 50 [ASSUMED → Q-047].
 * Cắt theo code point để không làm vỡ ký tự ngoài BMP.
 */
export function normalizeDisplayName(name: string | null | undefined, email: string): string {
  const trimmed = (name ?? '').trim()
  const base = trimmed || email.split('@')[0]?.trim() || email
  const chars = Array.from(base)
  return chars.length > DISPLAY_NAME_MAX ? chars.slice(0, DISPLAY_NAME_MAX).join('').trimEnd() : base
}
