# T-024 · Trung tâm thông báo

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-06 | M4 | 5 | T-018, T-011 | TODO |

## 1. Mục tiêu demo
Sau task này: **B thấy badge số trên tab Thông báo → mở → thấy danh sách mới nhất trước ("A đã thêm bạn vào phòng X", "C đã gửi lời mời kết bạn"…), cái chưa đọc nền đậm + chấm → bấm một thông báo → mở đúng phòng / lời mời, badge giảm; bấm "Đọc tất cả" → badge về 0; bấm thông báo của phòng đã bị giải tán / đã bị kick sau đó → thấy toast "Nội dung không còn hiệu lực".**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-10.A0 | Listener danh sách thông báo (limit 50, cuộn tải thêm) |
| Thao tác | SCR-10.A1 | Đánh dấu một thông báo đã đọc (khi bấm hàng) |
| Thao tác | SCR-10.A2 | "Đọc tất cả" |
| Thao tác | SCR-10.A3 (NAV) | Mở đối tượng, kiểm còn hiệu lực |
| Thao tác | LAYOUT.A2 | Badge số chưa đọc trên tab Thông báo |
| API | `updateNotification`, `markAllNotificationsAsRead` | |
| Dữ liệu | TBL-10 `users/{uid}/notifications` | rules đọc, index `idx_noti_list`, TTL policy `expire_at` (cấu hình) |
| Dữ liệu | TBL-04, TBL-07, TBL-02 | chỉ đọc (kiểm hiệu lực, tên / ảnh actor) |
| Phụ trợ | SUP-01, SUP-02 | hiển thị 7 loại thông báo đã được tạo ở các task trước |
| Phụ trợ | SUP-03, SUP-06 | danh sách + đã đọc; tự dọn sau 30 ngày |
| NFR | NFR-21 | Thông báo tự xóa sau 30 ngày |
| Quyết định | Q-044 | `room_name` trống → "một phòng chat"; "Đọc tất cả" theo mốc `upTo` |
| Flow | FLOW-12 bước 1–5, A1, J1 | |

**Ngoài phạm vi:** nút Chấp nhận / Từ chối / Chặn ngay trên thông báo (T-025); tạo thông báo (đã làm trong task của nghiệp vụ sinh ra: T-005, T-006, T-008, T-011, T-016, T-017, T-018); desktop (T-029); push (SUP-10, ngoài MVP).

## 3. Việc cần làm
### UI
- [ ] Tab Thông báo (SCR-10): header "Thông báo" + nút "Đọc tất cả" (disabled khi không có chưa đọc); danh sách; ghi chú cuối "Thông báo tự xóa sau 30 ngày."
- [ ] SCR-10.A0: listener `users/{me}/notifications` orderBy `created_at desc` limit 50; cuộn tới cuối → tải thêm 50 (cursor `startAfter`). Ẩn phía client các thông báo có `expire_at ≤ now` `[ASSUMED → Q-047]` (TTL có thể trễ tới 24h).
- [ ] Hàng thông báo (thành phần 3–4): ảnh `profiles/{actor_uid}` (get, cache theo uid) hoặc biểu tượng phòng; nội dung theo `type`:
  - `friend_request_received` "{A} đã gửi lời mời kết bạn"
  - `friend_request_rejected` "{A} đã từ chối lời mời kết bạn"
  - `friend_request_accepted` "{A} và bạn đã trở thành bạn bè"
  - `room_member_added` "{A} đã thêm bạn vào phòng {X}"
  - `room_member_kicked` "Bạn đã bị mời ra khỏi phòng {X}"
  - `room_disbanded` "Phòng {X} đã bị giải tán"
  - `room_host_received` "Bạn đã trở thành host phòng {X}"
  - {X} = `room_name`, trống → "một phòng chat"; actor `profiles.status = deleted` hoặc không đọc được → "Người dùng đã xóa"; thời gian tương đối theo múi giờ thiết bị (NFR-24).
  - Chưa đọc (`read=false`): nền đậm + chấm.
- [ ] Trạng thái: loading 6 hàng skeleton; rỗng "Chưa có thông báo" + "Lời mời kết bạn và sự kiện phòng sẽ hiện ở đây."; lỗi listener → "Không tải được thông báo" + "Thử lại".
- [ ] Bấm hàng: nếu chưa đọc → gọi `updateNotification {read:true}` (không chờ, lỗi bỏ qua) rồi SCR-10.A3:
  - `friend_request_received` → `get friend_requests/{ref_id}`; còn `pending` → SCR-09 tab Đã nhận, làm nổi bật hàng tương ứng; khác → toast "Nội dung không còn hiệu lực".
  - `room_member_added`, `room_host_received` → `get rooms/{ref_id}`; đọc được và `status = active` → SCR-05; `permission-denied` / không tồn tại → toast.
  - `friend_request_rejected`, `friend_request_accepted` → SCR-08; actor đã xóa tài khoản → toast `[ASSUMED → Q-047]`.
  - `room_member_kicked`, `room_disbanded` → không điều hướng (chỉ đọc).
- [ ] "Đọc tất cả" → `markAllNotificationsAsRead {upTo: <created_at của thông báo mới nhất đang thấy>}` `[ASSUMED → Q-047]` → mọi hàng bỏ dấu chưa đọc, badge 0; lỗi → toast.
- [ ] LAYOUT.A2: listener `users/{me}/notifications` where `read == false` → badge số trên tab Thông báo (ẩn khi 0; > 99 → "99+" `[ASSUMED → Q-047]` như SCR-03); lỗi → ẩn badge. Lọc `expire_at > now` phía client.

### API / Backend
- [ ] `PATCH /api/notifications/{notificationId}` (`updateNotification`): `withAuth`; Zod `NotificationUpdate` (`read` = true, không field khác) → sai `400 VALIDATION_FAILED`. Đọc `users/{me}/notifications/{id}`; không có hoặc `expire_at ≤ now` → `404 NOTIFICATION_NOT_FOUND`. Đã đọc → `200` không đổi `read_at` (idempotent). Chưa đọc → `read=true`, `read_at=now` → `200 Notification`.
- [ ] `POST /api/notifications/read-all` (`markAllNotificationsAsRead`): body tùy chọn `{upTo}` (mặc định now); query `read == false` và `created_at ≤ upTo` (dùng `idx_noti_list`); cập nhật theo lô ≤ 500 ghi / batch; trả `{updatedCount}`.
- [ ] Map document → schema `Notification` (camelCase).

### Data
- [ ] `firestore.rules`: `users/{uid}/notifications/{id}` đọc khi `request.auth.uid == uid`; ghi `if false` (database-design 4.3) — nếu task trước đã thêm thì chỉ bổ sung test.
- [ ] `firestore.indexes.json`: `idx_noti_list` (`read` ASC, `created_at` DESC) trên collection group `notifications` scope collection.
- [ ] Cấu hình TTL policy `notifications.expire_at`: thêm vào script hạ tầng / runbook (`gcloud firestore fields ttls update expire_at --collection-group=notifications`) — emulator không chạy TTL, chỉ kiểm có trong repo (Q-045).
- [ ] Xác nhận mọi nơi tạo thông báo (T-005, T-006, T-008, T-011, T-016, T-017, T-018) đặt `expire_at = created_at + notification_ttl_days` và `room_name` cho loại phòng; thiếu → sửa trong task này `[ASSUMED → Q-047]`.
- [ ] Seed dev `npm run seed:notifications -- <email>`: tạo đủ 7 loại + 1 thông báo `expire_at` đã qua + 1 thông báo phòng đã `deleted` + 1 lời mời đã `withdrawn`.

### Khác
- [ ] Chữ hiển thị 7 loại + toast + empty state vào `messages/vi.ts`.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | B có 3 thông báo chưa đọc (`room_member_added` phòng "Team A" của An, `friend_request_received` từ Chi, `friend_request_accepted` với Dũng) + 1 đã đọc | Mở app | Badge tab Thông báo = 3 | FLOW-12 bước 1, LAYOUT.A2 |
| AC-2 | Như AC-1 | Mở tab Thông báo | 4 hàng, mới nhất trên cùng; nội dung "An đã thêm bạn vào phòng Team A", "Chi đã gửi lời mời kết bạn", "Dũng và bạn đã trở thành bạn bè"; 3 hàng chưa đọc có nền đậm + chấm | FLOW-12 bước 2, SUP-03 |
| AC-3 | Có đủ 7 loại thông báo | Mở tab Thông báo | Mỗi loại hiện đúng câu theo bảng ở mục 3; thông báo phòng có `room_name` rỗng hiện "một phòng chat" | SCR-10 thành phần 3, Q-044 |
| AC-4 | Thông báo `room_member_added` chưa đọc, B vẫn là thành viên phòng `active` | Bấm hàng | `updateNotification` → `read=true`, `read_at` có giá trị; badge giảm 1; mở SCR-05 phòng đó | FLOW-12 bước 3–5, SCR-10.A1 |
| AC-5 | Thông báo `friend_request_received`, lời mời còn `pending` | Bấm hàng | Mở SCR-09 tab Đã nhận, hàng lời mời của người gửi được làm nổi bật | FLOW-12 bước 5 |
| AC-6 | Thông báo `friend_request_accepted` / `friend_request_rejected` | Bấm hàng | Mở SCR-08 | FLOW-12 bước 5 |
| AC-7 | Thông báo `room_member_kicked` / `room_disbanded` | Bấm hàng | Đánh dấu đã đọc; không điều hướng | FLOW-12 bước 5 |
| AC-8 | Thông báo `room_member_added` của phòng đã giải tán, hoặc B đã bị kick sau đó | Bấm hàng | Toast "Nội dung không còn hiệu lực", ở lại SCR-10; thông báo vẫn được đánh dấu đã đọc | FLOW-12 A1 |
| AC-9 | Thông báo `friend_request_received` mà lời mời đã bị thu hồi / đóng | Bấm hàng | Toast "Nội dung không còn hiệu lực" | FLOW-12 A1, FLOW-11 A2 |
| AC-10 | Actor của thông báo đã xóa tài khoản (`profiles.status = deleted`) | Mở danh sách | Tên actor hiện "Người dùng đã xóa" | SCR-10 thành phần 3, BR-28 |
| AC-11 | Có 4 thông báo chưa đọc | Bấm "Đọc tất cả" | `updatedCount = 4`; mọi hàng bỏ dấu chưa đọc; badge = 0; nút "Đọc tất cả" disabled | FLOW-12 bước 3–4, SCR-10.A2 |
| AC-12 | Có 2 chưa đọc; ngay sau khi người dùng thấy danh sách, 1 thông báo mới tạo (sau mốc `upTo`) | Bấm "Đọc tất cả" | 2 cái cũ đã đọc; cái mới vẫn chưa đọc, badge = 1 | api-contract `markAllNotificationsAsRead`, Q-044 |
| AC-13 | Có 620 thông báo chưa đọc | Gọi `markAllNotificationsAsRead` | `updatedCount = 620`, không lỗi giới hạn 500 ghi | api-contract (chia lô ≤ 500) |
| AC-14 | Chưa có thông báo nào | Mở tab Thông báo | "Chưa có thông báo" + "Lời mời kết bạn và sự kiện phòng sẽ hiện ở đây."; không có badge; "Đọc tất cả" disabled | SCR-10 Empty |
| AC-15 | Thông báo có `expire_at` đã qua (TTL chưa kịp xóa) | Mở danh sách / gọi `updateNotification` cho id đó | Không hiện trong danh sách, không tính badge; API trả `404 NOTIFICATION_NOT_FOUND` | NFR-21, SUP-06 |
| AC-16 | — | Đọc `firestore.indexes.json` và runbook hạ tầng | Có `idx_noti_list (read, created_at desc)` và lệnh / cấu hình TTL `expire_at` cho `notifications` | NFR-21, database.md TBL-10 |
| AC-17 | B đăng nhập | Client đọc `users/A/notifications` của người khác; ghi `users/B/notifications/x` | Cả hai bị từ chối; đọc `users/B/notifications` được phép | NFR-13, database-design 4.3 |
| AC-18 | B gọi API với id thông báo của A | `PATCH /api/notifications/{idCủaA}` | `404 NOTIFICATION_NOT_FOUND`, thông báo của A không đổi | Phân quyền |
| AC-19 | — | `PATCH /api/notifications/{id}` với `{read:false}` | `400 VALIDATION_FAILED` (không cho đặt lại chưa đọc) | `NotificationUpdate` |
| AC-20 | Thông báo đã đọc | Gọi `updateNotification` lần nữa | `200`, `read_at` giữ nguyên | api-contract (idempotent) |
| AC-21 | Listener lỗi | Mở tab Thông báo | "Không tải được thông báo" + "Thử lại" | SCR-10 Error |
| AC-22 | Có 120 thông báo | Cuộn tới cuối danh sách | Tải thêm 50 hàng tiếp theo, không trùng | SCR-10.A0 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Component test SCR-10: listener `notifications` trả lỗi → hiện "Không tải được thông báo" + nút "Thử lại"; bấm Thử lại → đăng ký lại listener | AC-21 |
| `updateNotification` (emulator): chưa đọc → `read=true`, `read_at`; lần 2 → `read_at` không đổi | AC-4, AC-20 |
| `updateNotification` id không tồn tại / của người khác / `expire_at` đã qua → `404` | AC-15, AC-18 |
| `updateNotification {read:false}` / body lạ → `400` | AC-19 |
| `markAllNotificationsAsRead` với 4 chưa đọc → 4; với `upTo` trước thông báo mới → thông báo mới giữ chưa đọc | AC-11, AC-12 |
| `markAllNotificationsAsRead` 620 chưa đọc → 620, kiểm số batch ≥ 2 | AC-13 |
| Rules: own read allow; other read deny; mọi write deny | AC-17 |
| Hàm `formatNotification(type, actor, roomName)` cho 7 loại + room_name rỗng + actor deleted | AC-3, AC-10 |
| Hàm `resolveNotificationTarget` (mock Firestore get): pending → SCR-09; withdrawn → invalid; room active → SCR-05; permission-denied → invalid; kicked/disbanded → none | AC-5 → AC-9 |
| Component test badge: 0 → ẩn; 5 → "5"; 120 → "99+"; lọc `expire_at` đã qua | AC-1, AC-15 |
| Test cấu hình: `firestore.indexes.json` chứa `idx_noti_list`; runbook / script chứa TTL `notifications.expire_at` | AC-16 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Seed B có 3 chưa đọc + 1 đã đọc → badge 3 → mở tab → thấy 4 hàng đúng thứ tự & nội dung → bấm thông báo "An đã thêm bạn vào phòng Team A" → vào phòng → quay lại → badge 2 → "Đọc tất cả" → badge biến mất | AC-1, AC-2, AC-4, AC-11 |
| Bấm thông báo phòng đã giải tán (seed `rooms/x.status=deleted`) → toast "Nội dung không còn hiệu lực" | AC-8 |

### Dữ liệu seed / tiền điều kiện
- Người dùng: B `binh@gmail.com`, An (host phòng "Team A", B là thành viên), Chi (lời mời `pending` tới B), Dũng (bạn của B), Em (đã xóa tài khoản: `profiles.status=deleted`).
- Phòng: "Team A" `active` (B thành viên); "Cũ" `deleted`; phòng không tên (B thành viên) cho `room_name` rỗng.
- Thông báo của B: đủ 7 loại; 1 cái actor = Em; 1 cái `expire_at` = now − 1 giờ; 1 `friend_request_received` trỏ lời mời đã `withdrawn`; 120 thông báo cho test cuộn (bộ seed riêng).
- Script: `npm run seed:notifications -- binh@gmail.com`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Seed, đăng nhập B (375×812) | Badge tab Thông báo đúng số chưa đọc (không tính cái quá hạn) | AC-1, AC-15 |
| 2 | Mở tab Thông báo | Mới nhất trên cùng; chưa đọc nền đậm + chấm; đủ 7 câu; phòng không tên → "một phòng chat"; actor Em → "Người dùng đã xóa"; cái quá hạn không xuất hiện | AC-2, AC-3, AC-10, AC-15 |
| 3 | Bấm "An đã thêm bạn vào phòng Team A" | Vào phòng Team A; quay lại thấy hàng hết đậm, badge −1 | AC-4 |
| 4 | Bấm "Chi đã gửi lời mời kết bạn" | SCR-09 tab Đã nhận, hàng của Chi nổi bật | AC-5 |
| 5 | Bấm "Dũng và bạn đã trở thành bạn bè" | SCR-08 | AC-6 |
| 6 | Bấm "Bạn đã bị mời ra khỏi phòng …" | Không chuyển màn, hàng hết đậm | AC-7 |
| 7 | Bấm thông báo của phòng "Cũ" (đã giải tán) | Toast "Nội dung không còn hiệu lực" | AC-8 |
| 8 | Bấm thông báo lời mời đã thu hồi | Toast "Nội dung không còn hiệu lực" | AC-9 |
| 9 | Bấm "Đọc tất cả" | Mọi hàng hết đậm, badge biến mất, nút "Đọc tất cả" mờ | AC-11 |
| 10 | Đăng nhập tài khoản mới chưa có thông báo → tab Thông báo | Empty state đúng chữ | AC-14 |
| 11 | Dùng seed 120 thông báo, cuộn xuống cuối | Tải thêm, không trùng hàng | AC-22 |
| 12 | Kiểm `firestore.indexes.json` và runbook | Có `idx_noti_list` và TTL `notifications.expire_at` | AC-16 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Rules `notifications` có test allow chủ + deny người khác + deny ghi
- [ ] Index `idx_noti_list` và TTL policy có trong repo / runbook (không áp lên project thật – Q-045)
- [ ] Mọi chỗ tạo thông báo ở task trước đặt `expire_at` và `room_name` đúng (có test)

## 7. Ghi chú
- `[ASSUMED → Q-047]` Client ẩn thông báo có `expire_at ≤ now` (TTL Firestore có thể trễ ≤ 24h); spec chỉ nêu TTL.
- `[ASSUMED → Q-047]` `upTo` gửi lên = `created_at` của thông báo mới nhất đang hiển thị, để không đánh dấu thông báo tới sau khi người dùng bấm.
- `[ASSUMED → Q-047]` Thông báo `friend_request_rejected` / `friend_request_accepted` có actor đã xóa tài khoản → toast "Nội dung không còn hiệu lực" thay vì mở SCR-08 (FLOW-12 A1 "người kia xóa tài khoản").
- `[ASSUMED → Q-047]` Bấm hàng luôn đánh dấu đã đọc, kể cả khi đối tượng không còn hiệu lực.
- `[ASSUMED → Q-047]` Badge > 99 hiện "99+" (theo quy ước SCR-03).
- `[ASSUMED → Q-047]` Rules đọc `notifications` có thể chưa có (không task trước nào đọc TBL-10) → thêm ở đây.
- Kiểm TTL thật (xóa sau 30 ngày) không làm được trên emulator — chỉ kiểm cấu hình có trong repo (Q-045); xác minh trên project thật thuộc T-028 / sau khi có staging.
