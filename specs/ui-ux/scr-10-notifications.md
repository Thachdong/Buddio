# SCR-10 Thông báo

- **Actor:** ACT-01
- **BIZ thể hiện:** SUP-01, SUP-02, SUP-03 (FLOW-12) — thông báo chỉ hiển thị trong app (Q-031), nên người dùng cần một danh sách để biết có lời mời mới, bị từ chối, đã thành bạn, được thêm vào phòng, bị kick, phòng bị giải tán, được nhận quyền host; đánh dấu đã đọc và đi tới đối tượng liên quan.
- **FLOW:** FLOW-12 (bước 1–5, A1)
- **Đến từ:** tab "Thông báo" · **Đi tới:** SCR-09, SCR-05, SCR-08
- **Wireframe:** [drawio](./drawio/scr-10-notifications.drawio) — 2 trang: *Danh sách* (kèm toast hết hiệu lực), *Trống*. Chưa export PNG.

## 1. Layout
Màn tab. Header ("Thông báo" + nút "Đọc tất cả") → danh sách thông báo mới nhất trước (chưa đọc nền đậm + chấm) → ghi chú 30 ngày ở cuối → thanh tab (Thông báo đang chọn).

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Tiêu đề "Thông báo" | header | — | — |
| 2 | Nút "Đọc tất cả" | button | Disabled khi không có thông báo chưa đọc | — |
| 3 | Hàng thông báo | list item | Ảnh `actor_uid` (hoặc biểu tượng phòng), nội dung theo `type`: `friend_request_received` "{A} đã gửi lời mời kết bạn" · `friend_request_rejected` "{A} đã từ chối lời mời kết bạn" · `friend_request_accepted` "{A} và bạn đã trở thành bạn bè" · `room_member_added` "{A} đã thêm bạn vào phòng {X}" · `room_member_kicked` "Bạn đã bị mời ra khỏi phòng {X}" · `room_disbanded` "Phòng {X} đã bị giải tán" · `room_host_received` "Bạn đã trở thành host phòng {X}". {X} = `room_name` (ảnh chụp lúc tạo; trống → "một phòng chat" `[ASSUMED → Q-044]`). Actor đã xóa tài khoản → "Người dùng đã xóa". Thời gian tương đối | — |
| 4 | Dấu chưa đọc | dot + nền | `read = false` | — |
| 5 | Nút inline lời mời | button | Chỉ với `friend_request_received` mà lời mời (ref_id) **còn `pending`**: "Chấp nhận", "Từ chối", ⋮ → "Chặn" (SUP-01) | BR-09, BR-14 |
| 6 | Ghi chú | text | "Thông báo tự xóa sau 30 ngày." | NFR-21 |
| 7 | Thanh tab | tab bar | Badge số chưa đọc (LAYOUT.A2) | — |
| 8 | Toast "Nội dung không còn hiệu lực" | toast | Khi đối tượng không còn (FLOW-12 A1) | — |
| 9 | Trạng thái rỗng | empty state | "Chưa có thông báo" + "Lời mời kết bạn và sự kiện phòng sẽ hiện ở đây." | — |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-10.A0 | Tải danh sách thông báo (realtime) | Không API — Firestore listener `users/{me}/notifications` orderBy `created_at desc` limit 50 (cuộn tải thêm); `profiles/{actor_uid}` (get); listener lời mời đã nhận đang chờ (dùng chung LAYOUT.A3) để biết hiện 5 | Hiện 3 | "Không tải được thông báo" + "Thử lại" |
| SCR-10.A1 | Đánh dấu một thông báo đã đọc (tự gọi khi bấm hàng) | `updateNotification` (`PATCH /notifications/{notificationId}`, body `{read: true}`) | Bỏ 4, badge giảm | Bỏ qua (không chặn điều hướng) |
| SCR-10.A2 | Đánh dấu tất cả đã đọc (2) | `markAllNotificationsAsRead` (`POST /notifications/read-all`) | Mọi hàng bỏ 4, badge = 0 | Toast lỗi |
| SCR-10.A3 | Mở đối tượng của thông báo (bấm hàng) | NAV, kiểm hiệu lực bằng Firestore: lời mời mới → `friend_requests/{ref_id}` còn `pending` → SCR-09 tab Đã nhận; được thêm / nhận host → `rooms/{ref_id}` đọc được (còn là thành viên, `status = active`) → SCR-05; từ chối / đã thành bạn → SCR-08; bị kick / giải tán → không điều hướng (chỉ đọc) | — | Đối tượng không còn → 8 |
| SCR-10.A4 | Chấp nhận lời mời ngay từ thông báo (5) | `acceptFriendRequest` | Như SCR-09.A2; nút 5 biến mất | `FRIEND_REQUEST_NOT_PENDING` → 8 |
| SCR-10.A5 | Từ chối ngay từ thông báo (5) | `rejectFriendRequest` | Như SCR-09.A3 | `ALREADY_FRIENDS` → dialog "Hai bạn đã là bạn bè" như SCR-09 #9 |
| SCR-10.A6 | Chặn ngay từ thông báo (5 → ⋮) | `createBlock` (có dialog xác nhận như SCR-09 #10) | Như SCR-09.A4 | — |

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | 6 hàng skeleton |
| Empty | 9 |
| Error | Toast; mất kết nối → banner chung |
| Không có quyền | Chưa đăng nhập → SCR-01 |
| Thông báo quá 30 ngày | Tự biến mất (TTL – SUP-06) |

## 5. Ghi chú UX
- Desktop: mục "Thông báo" ở sidebar; danh sách một cột rộng tối đa 720px.
- Tin nhắn mới **không** tạo thông báo (Q-030) — chỉ có ở badge tab Phòng.
- Không có push / email ở MVP (Q-031).
