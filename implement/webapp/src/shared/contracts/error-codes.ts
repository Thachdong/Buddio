// GENERATED from specs/api-contract.yml (bảng mã lỗi). Chạy lại fs-scaffold / fs-contract khi contract đổi.
// Isomorphic: không import gì ngoài type.

export const ERROR_HTTP_STATUS = {
  VALIDATION_FAILED: 400, // Request sai cấu trúc / kiểu
  UNAUTHENTICATED: 401, // Thiếu / sai ID token
  TOKEN_REVOKED: 401, // Token đã bị thu hồi (đăng xuất, xóa tài khoản)
  SESSION_EXPIRED: 401, // Quá 30 ngày không dùng
  CONSENT_REQUIRED: 403, // Chưa đồng ý chính sách / chưa có tài khoản
  DISPLAY_NAME_INVALID: 422, // Tên hiển thị trống hoặc > 50 ký tự
  EMAIL_INVALID: 422, // Email sai định dạng
  EMAIL_LOOKUP_RATE_LIMITED: 429, // Tra quá 100 email / giờ
  CANNOT_INVITE_SELF: 422, // Mời / tạo link cho chính email của mình
  FRIEND_TARGET_NOT_FOUND: 404, // "Không tìm thấy" khi gửi lời mời (không lộ lý do)
  ALREADY_FRIENDS: 409, // Hai người đã là bạn
  FRIEND_REQUEST_ALREADY_PENDING: 409, // Đã có lời mời đang chờ cùng chiều
  REJECT_COOLDOWN: 409, // Bị từ chối chưa đủ 24 giờ
  FRIEND_REQUEST_NOT_FOUND: 404, // Lời mời không tồn tại / không liên quan tới mình
  FRIEND_REQUEST_FORBIDDEN: 403, // Sai vai trò (người gửi bấm chấp nhận, người nhận bấm thu hồi)
  FRIEND_REQUEST_NOT_PENDING: 409, // "Lời mời không còn hiệu lực"
  INVITE_LINK_INVALID: 410, // Link hỏng / hết hạn / người mời đã xóa / đã là bạn / có chặn
  INVITE_LINK_WRONG_ACCOUNT: 403, // Email đăng nhập khác email được mời (không hiện email)
  NOT_FRIENDS: 404, // "Hai bạn không còn là bạn bè"
  USER_NOT_FOUND: 404, // Người dùng không tồn tại / đã xóa / không liên quan
  CANNOT_BLOCK_SELF: 422, // Tự chặn mình
  ALREADY_BLOCKED: 409, // Đã đang chặn người này
  BLOCK_NOT_FOUND: 404, // Không đang chặn người này
  ROOM_NOT_FOUND: 404, // Phòng không tồn tại / đã xóa
  NOT_ROOM_MEMBER: 403, // Không còn là thành viên đang tham gia
  NOT_ROOM_HOST: 403, // "Bạn không có quyền thực hiện thao tác này"
  ROOM_FULL: 409, // Vượt 50 thành viên
  MEMBERS_NOT_FRIENDS: 422, // Người được chọn không (còn) là bạn của host
  ROOM_TTL_INVALID: 422, // Thiếu / sai thời hạn tin của phòng ngắn hạn
  ROOM_NAME_TOO_LONG: 422, // Tên phòng > 50 ký tự
  MEMBER_ALREADY_IN_ROOM: 409, // Người được thêm đã ở trong phòng
  MEMBER_NOT_IN_ROOM: 409, // "Người này không còn trong phòng"
  CANNOT_TARGET_SELF: 422, // Host tự kick / tự chuyển quyền cho mình
  HOST_TRANSFER_REQUIRED: 422, // Host rời phòng còn người khác mà chưa chọn người nhận quyền
  ROOM_READ_ONLY: 409, // Phòng 2 người đang chỉ đọc
  MESSAGE_EMPTY: 422, // Tin không có chữ lẫn ảnh
  MESSAGE_TOO_LONG: 422, // Chữ > 1000 ký tự
  TOO_MANY_IMAGES: 422, // > 10 ảnh
  IMAGES_TOO_LARGE: 422, // Tổng ảnh > 10MB
  INVALID_IMAGE_TYPE: 422, // Tệp không phải ảnh
  UPLOAD_NOT_FOUND: 422, // Ảnh tạm không tồn tại / không thuộc người gửi
  MESSAGE_ID_CONFLICT: 409, // messageId đã dùng cho tin khác
  MESSAGE_NOT_FOUND: 404, // Tin không tồn tại / đã hết hạn
  NOT_MESSAGE_SENDER: 403, // Không phải người gửi tin
  MESSAGE_RECALLED: 409, // Tin đã thu hồi (không cấp link ảnh)
  NOTIFICATION_NOT_FOUND: 404, // Thông báo không tồn tại / đã quá 30 ngày
  INTERNAL_ERROR: 500, // Lỗi hệ thống
} as const

export type ErrorCode = keyof typeof ERROR_HTTP_STATUS

export const ERROR_CODES = Object.keys(ERROR_HTTP_STATUS) as ErrorCode[]

/** Lỗi mọi operation đều có thể trả — hook phải xử lý chung. */
export const COMMON_ERROR_CODES = [
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'TOKEN_REVOKED',
  'SESSION_EXPIRED',
  'CONSENT_REQUIRED',
  'INTERNAL_ERROR',
] as const satisfies readonly ErrorCode[]

export type CommonErrorCode = (typeof COMMON_ERROR_CODES)[number]
