# Traceability Matrix

> Cập nhật: 2026-11-12 · Kiểm tra bằng script (`X1, X3, X4, X7, X11, X12`) + rà tay (`X2, X5, X6, X8, X9, X10`)

## 1. BIZ → toàn bộ artifact
| BIZ | FLOW | SUP | ENT | TBL | operationId | SCR | Trạng thái |
|---|---|---|---|---|---|---|---|
| BIZ-01 Tham gia & đăng nhập | FLOW-01 | — | ENT-01 | TBL-01, TBL-02, TBL-03, TBL-11 | createSession, createAccount, getMe, deleteCurrentSession | SCR-01, SCR-02, SCR-11 | ✅ |
| BIZ-02 Cài đặt tài khoản | FLOW-02 | SUP-09 | ENT-01 | TBL-01, TBL-02, TBL-12 | getMe, updateMe | SCR-11 | ✅ |
| BIZ-03 Mời kết bạn | FLOW-03 | SUP-01, SUP-03, SUP-07 | ENT-01, ENT-02, ENT-03, ENT-10 | TBL-01, TBL-03, TBL-04, TBL-05, TBL-06, TBL-10 | createEmailLookup, createFriendRequest, withdrawFriendRequest, createInviteLink | SCR-07, SCR-09 | ✅ |
| BIZ-04 Phản hồi lời mời | FLOW-04 | SUP-01, SUP-03 | ENT-02, ENT-04, ENT-06, ENT-10 | TBL-04, TBL-05, TBL-07, TBL-10 | acceptFriendRequest, rejectFriendRequest | SCR-02, SCR-09, SCR-10 | ✅ |
| BIZ-05 Tham gia qua link mời | FLOW-05 | SUP-01, SUP-03, SUP-07 | ENT-01, ENT-02, ENT-03, ENT-10 | TBL-01, TBL-04, TBL-05, TBL-06, TBL-10 | openInviteLink | SCR-02 | ✅ |
| BIZ-06 Hủy kết bạn | FLOW-06 | SUP-09 | ENT-04, ENT-06 | TBL-05, TBL-07 | deleteFriend | SCR-08 | ✅ |
| BIZ-07 Chặn / bỏ chặn | FLOW-07a, 07b | SUP-09 | ENT-02, ENT-03, ENT-04, ENT-05, ENT-06 | TBL-04, TBL-05, TBL-06, TBL-07 | createBlock, deleteBlock | SCR-02, SCR-06, SCR-08, SCR-09, SCR-10, SCR-12 | ✅ |
| BIZ-08 Tạo phòng | FLOW-08 | SUP-02, SUP-03, SUP-04 | ENT-06, ENT-07, ENT-08 | TBL-05, TBL-07, TBL-08, TBL-09, TBL-10, TBL-14 | createRoom | SCR-04 | ✅ |
| BIZ-09 Quản lý phòng & thành viên | FLOW-09a–f | SUP-02, SUP-03, SUP-04, SUP-08, SUP-09 | ENT-06, ENT-07, ENT-08 | TBL-05, TBL-07, TBL-08, TBL-09, TBL-10, TBL-14 | updateRoom, addRoomMembers, kickRoomMember, transferRoomHost, leaveRoom, deleteRoom (+ `purgeRoom`) | SCR-06 | ✅ |
| BIZ-10 Nhắn tin | FLOW-10a–c | SUP-04, SUP-05, SUP-08, SUP-09 | ENT-06, ENT-07, ENT-08, ENT-09 | TBL-07, TBL-08, TBL-09, TBL-12, TBL-13 | createMessage, recallMessage, markRoomAsRead, listMessageImageUrls (+ đọc FS) | SCR-03, SCR-05 | ✅ |
| BIZ-11 Xóa tài khoản | FLOW-11 | SUP-02, SUP-08 | ENT-01 → ENT-08 | TBL-01 → TBL-10, TBL-14 | deleteMe (+ `purgeAccount`) | SCR-11 | ✅ |
| — (phụ trợ) | FLOW-12 | SUP-03, SUP-06 | ENT-10 | TBL-10 | updateNotification, markAllNotificationsAsRead | SCR-10 | ✅ |

### SUP → giải pháp
| SUP | Giải pháp (tech-stack) | TBL | operation / kênh | SCR |
|---|---|---|---|---|
| SUP-01 | API tạo thông báo cùng transaction | TBL-10 | createFriendRequest, openInviteLink, acceptFriendRequest, rejectFriendRequest | SCR-10 |
| SUP-02 | API + `purgeAccount` tạo thông báo | TBL-10 | createRoom, addRoomMembers, kickRoomMember, transferRoomHost, leaveRoom, deleteRoom, deleteMe | SCR-10 |
| SUP-03 | Firestore listener + API đánh dấu đọc | TBL-10 | updateNotification, markAllNotificationsAsRead; FS | SCR-10, LAYOUT |
| SUP-04 | `last_message` + `count()` theo `last_read_at` | TBL-07, TBL-08, TBL-09 | createMessage, markRoomAsRead; FS | SCR-03, LAYOUT |
| SUP-05 | Firestore TTL + Storage lifecycle `customTime` (ADR-09) | TBL-09 | — (hạ tầng) | SCR-05 (ẩn tin hết hạn) |
| SUP-06 | Firestore TTL (ADR-09) | TBL-10 | — (hạ tầng) | SCR-10 |
| SUP-07 | AES-256-GCM + Secret Manager (ADR-08) | — (không lưu) | createInviteLink, openInviteLink | SCR-07, SCR-02 |
| SUP-08 | Storage private, upload tạm, signed URL (ADR-10) | TBL-09 `images` | createMessage, recallMessage, listMessageImageUrls; ST | SCR-05 |
| SUP-09 | Firestore listener + RTDB (ADR-05) | TBL-12, TBL-13, TBL-14 | RTDB, FS | SCR-03, SCR-05, SCR-06, SCR-08 |

## 2. NFR → nơi đáp ứng
| NFR | Đáp ứng ở (ADR / index / API / UI) | Trạng thái |
|---|---|---|
| NFR-01 Tin ≤1s | ADR-03 (ghi qua server, thêm ~50–150ms), ADR-04 region `asia-southeast1`, Firestore listener | ✅ |
| NFR-02 Trạng thái ≤2s | ADR-05 RTDB; đã xem suy từ `last_read_at` | ✅ |
| NFR-03 Mở phòng ≤1,5s | Index `messages.created_at`, giới hạn 50 tin + cuộn tải thêm (SCR-05.A0/A1); index `idx_rooms_member` | ✅ |
| NFR-04 Thao tác ≤1s | Index ở database-design 4.2; transaction ngắn | ✅ |
| NFR-05 Ảnh ≤10s | Upload thẳng Storage (SCR-05.A5), thanh tiến độ, ảnh xem trước phía client (ADR-10) | ✅ |
| NFR-06 Trang đầu ≤3s | ADR-02: SSR cho SCR-01, SCR-02 | ✅ |
| NFR-07 Quy mô | ADR-01, ADR-04 (Firestore tự mở rộng) | ✅ |
| NFR-08 Giới hạn chỉnh được | TBL-11 `config/limits`, `getMe` trả `limits` | ✅ |
| NFR-09 99,5% | ADR-04 (Firestore regional 99,99%), App Hosting; uptime check `getHealth` | ✅ |
| NFR-10 Không mất tin | `createMessage` idempotent (PUT + `messageId` client sinh), banner mất kết nối (wireframe mục 5) | ✅ |
| NFR-11 Phiên 30 ngày | ADR-06, `users.last_active_at`, lỗi `SESSION_EXPIRED` / `TOKEN_REVOKED`, SCR-01 thông báo hết phiên | ✅ |
| NFR-12 Mã hóa | ADR-07 (mặc định Google + TLS) | ✅ |
| NFR-13 Phân quyền server | ADR-03, Security Rules chỉ đọc (database-design 4.3), signed URL `min(1h, expire_at)` | ✅ |
| NFR-14 Link an toàn | ADR-08 AES-256-GCM, `INVITE_LINK_INVALID` | ✅ |
| NFR-15 Không lộ tài khoản | `createEmailLookup` (POST, `not_found` chỉ có `{result}`, thời gian đều), `profiles` cấm `list`, SCR-07 E3, lý do chỉ đọc chung (Q-044) | ✅ |
| NFR-16 Giới hạn tra email | `users.lookup_window`, `EMAIL_LOOKUP_RATE_LIMITED` (429), SCR-07 khóa ô | ✅ |
| NFR-17 NĐ 13/2023 | `createAccount` (`acceptPrivacyPolicy`, `policyVersion`), dialog SCR-01; ADR-04 ghi chú hồ sơ chuyển dữ liệu ra nước ngoài | ✅ (việc pháp lý ngoài specs) |
| NFR-18 Xóa tài khoản | `deleteMe` (202) + `purgeAccount` (ADR-11), backup 7 ngày (ADR-12) | ✅ |
| NFR-19 Tin hết hạn biến mất | ADR-09 (TTL + lifecycle + client lọc), SCR-05 ẩn đúng giờ | ✅ |
| NFR-20 Backup | ADR-12 scheduled backup 7 ngày, RPO 24h / RTO 4h | ✅ |
| NFR-21 Thông báo 30 ngày | TTL `notifications.expire_at` | ✅ |
| NFR-22 Mobile-first | wireframe mục 5, drawio 375×812 | ✅ |
| NFR-23 WCAG AA (Could) | Vùng chạm ≥44px (wireframe mục 5, scr md); độ tương phản: để design system kiểm khi hiện thực | ⚠️ một phần (Could) |
| NFR-24 Tiếng Việt | ADR-02 file từ điển; múi giờ thiết bị | ✅ |
| NFR-25 Trình duyệt | tech-stack mục 1 | ✅ |
| NFR-26 Cảnh báo | ADR-12 Cloud Monitoring | ✅ |
| NFR-27 Log không lộ dữ liệu | ADR-12; `createEmailLookup` dùng POST để email không vào URL / log | ✅ |

## 3. Kết quả từng kiểm tra
| Mã | Kết quả |
|---|---|
| X1 | 11/11 BIZ có FLOW, SCR, operation |
| X2 | 10/10 ENT có TBL (ENT-03 có lý do không lưu, ENT-09 gộp vào TBL-09); 9/9 SUP MVP có giải pháp |
| X3 | Không có TBL / operation / SCR mồ côi. `getHealth` phục vụ NFR-09 / ADR-12 (hạ tầng) |
| X4 | 66 dòng thao tác: mọi thao tác `API` có operationId tồn tại; mọi `x-screens` trỏ tới mã thao tác có thật; 12 file scr md chứa đủ mã thao tác của màn |
| X5 | Rà các màn chính (SCR-05, SCR-06, SCR-07, SCR-01): field hiển thị / nhập có trong schema hoặc đọc trực tiếp Firestore (TBL tương ứng) |
| X6 | Field API ↔ cột DB khớp (camelCase ↔ snake_case). Giá trị tính toán: `Room.readOnly`, `EmailLookupResult.result`, `retryAfter`, `MessageImage.index`, URL ảnh |
| X7 | Enum khớp giữa vòng đời ↔ DB ↔ API: FriendRequest (5 trạng thái + 3 lý do đóng), Room (`active` / `deleted`), retention, ttlDays, Message (`sent` / `recalled`), SystemEvent (6), Notification (7 loại), User (`active` / `deleted`) |
| X8 | `x-roles` khớp ma trận: BIZ-09 host-only → ACT-03; `leaveRoom`, nhắn tin → ACT-03, ACT-04; `openInviteLink` → ACT-01, ACT-02 |
| X9 | Khớp: tên ≤50 (BR-29), tên phòng ≤50 (Q-037), tin ≤1000 ký tự / ≤10 ảnh (BR-21, Q-043), 10MB → `IMAGES_TOO_LARGE`, ttlDays ∈ {1, 2, 3, 7, 30, 90} (BR-16), ≤49 người khi tạo / ≤50 (BR-15) |
| X10 | 27/27 NFR có nơi đáp ứng (NFR-23 một phần, mức Could) |
| X11 | Mọi link wireframe → scr md → drawio tồn tại |
| X12 | `api-contract.yml` hợp lệ (redocly: valid, 4 cảnh báo style), mọi `$ref` tồn tại; 12/12 file drawio là XML well-formed |

## 4. Vấn đề phát hiện
| # | Loại | Mô tả | File | Đề xuất | Skill xử lý | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | MISSING | Thao tác chấp nhận / từ chối / chặn ngay trên thông báo, "đăng nhập tài khoản khác" ở link sai email, tải bạn của host khi thêm thành viên chưa có trong bảng thao tác | wireframe.md mục 4 | Thêm SCR-10.A4–A6, SCR-02.A5, SCR-06.A8; thêm `x-screens` | ui-screen-map, api-contract | ✅ Đã sửa |
| 2 | MISSING | scr-06 thiếu dòng SCR-06.A8 | scr-06-room-info.md | Thêm dòng | ui-screen-design | ✅ Đã sửa |
| 3 | MISMATCH | SCR-01 ghi API trả `consentRequired`, contract là `accountStatus = consent_required` | scr-01-login.md | Đổi tên field | ui-screen-design | ✅ Đã sửa |
| 4 | MISMATCH | Tag `[ĐỀ XUẤT]` còn trong scr-02, scr-10 sau khi thao tác đã chính thức | scr-02, scr-10 | Gỡ tag | ui-screen-design | ✅ Đã sửa |
| 5 | NFR-GAP | NFR-23 (Could): độ tương phản WCAG AA chưa có bảng màu | — | Kiểm khi dựng design system / theme | (hiện thực) | ⚠️ Chấp nhận (Could) |
| 6 | Lưu ý | Không export được PNG cho drawio (máy không có draw.io CLI) | specs/ui-ux/drawio | Mở bằng app draw.io / extension VS Code | — | ℹ️ |
| 7 | Lưu ý | Hồ sơ đánh giá chuyển dữ liệu ra nước ngoài theo NĐ 13 (region Singapore) | ADR-04 | Việc pháp lý trước khi ra mắt | — | ℹ️ |

**Kết luận: PASS** — 0 MISSING / 0 MISMATCH còn mở; 1 NFR-GAP mức Could được chấp nhận.
