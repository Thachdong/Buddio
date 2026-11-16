import type { ErrorCode } from '@/shared/contracts'

/**
 * Từ điển tiếng Việt duy nhất (NFR-24). Mọi chuỗi giao diện lấy từ đây.
 * Mỗi feature thêm namespace riêng: vi.<feature>.<screen>.<key>. Copy lấy từ specs/ui-ux/scr-*.md.
 */
const errors = {
  VALIDATION_FAILED: 'Dữ liệu không hợp lệ.',
  UNAUTHENTICATED: 'Bạn cần đăng nhập để tiếp tục.',
  TOKEN_REVOKED: 'Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  CONSENT_REQUIRED: 'Bạn cần đồng ý chính sách quyền riêng tư để tiếp tục.',
  DISPLAY_NAME_INVALID: 'Tên hiển thị phải từ 1 đến 50 ký tự.',
  EMAIL_INVALID: 'Email không đúng định dạng.',
  EMAIL_LOOKUP_RATE_LIMITED: 'Bạn đã tra quá nhiều lần. Vui lòng thử lại sau.',
  CANNOT_INVITE_SELF: 'Đây là email của bạn.',
  FRIEND_TARGET_NOT_FOUND: 'Không tìm thấy người dùng phù hợp.',
  ALREADY_FRIENDS: 'Hai bạn đã là bạn bè.',
  FRIEND_REQUEST_ALREADY_PENDING: 'Đang chờ phản hồi.',
  REJECT_COOLDOWN: 'Chưa thể gửi lại lời mời, thử lại sau.',
  FRIEND_REQUEST_NOT_FOUND: 'Lời mời không còn hiệu lực.',
  FRIEND_REQUEST_FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  FRIEND_REQUEST_NOT_PENDING: 'Lời mời không còn hiệu lực.',
  INVITE_LINK_INVALID: 'Link không còn hiệu lực.',
  INVITE_LINK_WRONG_ACCOUNT: 'Link mời này dành cho tài khoản khác.',
  NOT_FRIENDS: 'Hai bạn không còn là bạn bè.',
  USER_NOT_FOUND: 'Người dùng không tồn tại.',
  CANNOT_BLOCK_SELF: 'Bạn không thể tự chặn mình.',
  ALREADY_BLOCKED: 'Bạn đang chặn người này.',
  BLOCK_NOT_FOUND: 'Bạn không chặn người này.',
  ROOM_NOT_FOUND: 'Phòng không tồn tại.',
  NOT_ROOM_MEMBER: 'Bạn không còn là thành viên phòng này.',
  NOT_ROOM_HOST: 'Bạn không có quyền thực hiện thao tác này.',
  ROOM_FULL: 'Phòng đã đủ 50 thành viên.',
  MEMBERS_NOT_FRIENDS: 'Người được chọn không còn là bạn của bạn.',
  ROOM_TTL_INVALID: 'Vui lòng chọn thời hạn tin nhắn hợp lệ.',
  ROOM_NAME_TOO_LONG: 'Tên phòng tối đa 50 ký tự.',
  MEMBER_ALREADY_IN_ROOM: 'Người này đã ở trong phòng.',
  MEMBER_NOT_IN_ROOM: 'Người này không còn trong phòng.',
  CANNOT_TARGET_SELF: 'Bạn không thể chọn chính mình.',
  HOST_TRANSFER_REQUIRED: 'Hãy chọn người nhận quyền chủ phòng trước khi rời phòng.',
  ROOM_READ_ONLY: 'Phòng đang ở chế độ chỉ đọc.',
  MESSAGE_EMPTY: 'Tin nhắn trống.',
  MESSAGE_TOO_LONG: 'Tin nhắn tối đa 1000 ký tự.',
  TOO_MANY_IMAGES: 'Mỗi tin tối đa 10 ảnh.',
  IMAGES_TOO_LARGE: 'Tổng dung lượng ảnh tối đa 10MB.',
  INVALID_IMAGE_TYPE: 'Chỉ gửi được tệp ảnh.',
  UPLOAD_NOT_FOUND: 'Ảnh tải lên không còn, vui lòng chọn lại.',
  MESSAGE_ID_CONFLICT: 'Tin nhắn bị trùng, vui lòng gửi lại.',
  MESSAGE_NOT_FOUND: 'Tin nhắn không còn tồn tại.',
  NOT_MESSAGE_SENDER: 'Bạn chỉ thu hồi được tin của mình.',
  MESSAGE_RECALLED: 'Tin nhắn đã được thu hồi.',
  NOTIFICATION_NOT_FOUND: 'Thông báo không còn tồn tại.',
  INTERNAL_ERROR: 'Có lỗi xảy ra, vui lòng thử lại.',
} satisfies Record<ErrorCode, string>

export const vi = {
  app: {
    name: 'Buddio',
    description: 'Trò chuyện, xả stress cùng bạn bè.',
  },
  auth: {
    // SCR-01 mục 2
    login: {
      title: 'Đăng nhập',
      tagline: 'Trò chuyện, xả stress cùng bạn bè. Vào nhanh chỉ với một cú chạm.',
      signInWithGoogle: 'Đăng nhập với Google',
      privacyPolicy: 'Chính sách quyền riêng tư',
      signingIn: 'Đang đăng nhập…',
      // vùng 5 — FLOW-01 E1
      signInIncomplete: 'Đăng nhập chưa hoàn tất. Vui lòng thử lại.',
      // vùng 5 — T-003 (FLOW-01 A1, NFR-11)
      signedOut: 'Bạn đã đăng xuất.',
      sessionExpired: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
    },
  },
  account: {
    // SCR-01 thành phần 7–10 — dialog đồng ý chính sách (NFR-17)
    consent: {
      title: 'Chính sách quyền riêng tư',
      description: 'Vui lòng đọc và đồng ý để bắt đầu dùng Buddio.',
      checkbox: 'Tôi đã đọc và đồng ý với Chính sách quyền riêng tư',
      accept: 'Đồng ý và tiếp tục',
      decline: 'Không đồng ý',
    },
    // Nội dung chính sách — dùng chung cho dialog và trang /privacy
    privacy: {
      title: 'Chính sách quyền riêng tư',
      version: 'Phiên bản',
      sections: [
        {
          heading: 'Dữ liệu chúng tôi thu thập',
          body: 'Buddio chỉ lấy email, tên và ảnh đại diện từ tài khoản Google của bạn.',
        },
        {
          heading: 'Chia sẻ dữ liệu',
          body: 'Chúng tôi không chia sẻ dữ liệu của bạn cho bên thứ ba.',
        },
        {
          heading: 'Nơi lưu trữ',
          body: 'Dữ liệu được lưu tại Singapore.',
        },
      ],
    },
    // Thanh tab dưới — wireframe.md mục 5
    tabs: {
      label: 'Điều hướng chính',
      rooms: 'Phòng',
      friends: 'Bạn bè',
      notifications: 'Thông báo',
      settings: 'Cài đặt',
    },
    // SCR-11 Cài đặt (T-003: chỉ xem, công tắc disabled tới T-004)
    settings: {
      title: 'Cài đặt',
      photoCaption: 'Ảnh lấy từ Google',
      email: 'Email',
      displayName: 'Tên hiển thị',
      privacySection: 'Quyền riêng tư',
      anonymous: 'Chế độ ẩn danh',
      anonymousDescription: 'Khi bật, người khác nhập email của bạn sẽ không tìm thấy bạn.',
      showOnline: 'Hiển thị trạng thái online',
      showOnlineDescription: 'Khi tắt, mọi người thấy bạn offline và bạn cũng không thấy online của người khác.',
      privacyPolicy: 'Chính sách quyền riêng tư',
      signOut: 'Đăng xuất',
      loadError: 'Không tải được',
    },
    // Trang giữ chỗ cho màn chưa làm [ASSUMED → Q-047]
    comingSoon: {
      title: 'Sắp có',
      body: 'Tính năng này đang được hoàn thiện.',
      back: 'Về trang Phòng',
    },
  },
  rooms: {
    // SCR-03 thành phần 1, 2, 11
    list: {
      title: 'Phòng',
      createRoom: 'Tạo phòng',
      emptyTitle: 'Chưa có phòng nào',
      addFriend: 'Thêm bạn',
    },
  },
  common: {
    networkError: 'Không kết nối được, thử lại',
    staleDeploy: 'Ứng dụng vừa được cập nhật. Vui lòng tải lại trang.',
    retry: 'Thử lại',
    loading: 'Đang tải…',
    loadError: 'Không tải được dữ liệu.',
  },
  errors,
} as const
