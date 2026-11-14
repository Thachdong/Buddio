import { z } from 'zod'

/**
 * Quy ước message Zod: nếu một rule tương ứng với mã lỗi nghiệp vụ trong contract
 * (vd EMAIL_INVALID 422), đặt `message` = mã lỗi đó. runAction/runRoute trả đúng mã đó;
 * các lỗi còn lại trả VALIDATION_FAILED. UI hiển thị bằng vi.errors[code].
 */
export const UidSchema = z.string().min(1).max(128)

/** ISO-8601 UTC — mọi thời gian trong DTO. */
export const TimestampSchema = z.string().datetime({ offset: true })

/** trim + lowercase rồi mới kiểm định dạng (dùng chung client và server). */
export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'EMAIL_INVALID' })

export const DisplayNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'DISPLAY_NAME_INVALID' })
  .max(50, { message: 'DISPLAY_NAME_INVALID' })
