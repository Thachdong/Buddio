# T-008 · Tạo phòng & danh sách phòng

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-04 | M1 | 5 | T-007 | TODO |

## 1. Mục tiêu demo
Sau task này: **A mở tab Phòng → "Tạo phòng" → chọn B, đặt tên "Hội cờ", chọn Ngắn hạn · 1 ngày → Tạo → vào phòng mới thấy tin hệ thống "A đã tạo phòng"; B (trình duyệt khác) thấy phòng "Hội cờ" xuất hiện trong danh sách phòng ngay, không cần tải lại. Người chưa có bạn mở "Tạo phòng" thấy gợi ý "Mời bạn".**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-04.A0 | Tải danh sách bạn để chọn (FS listener `friendships`) |
| Thao tác | SCR-04.A1 | Tạo phòng |
| Thao tác | SCR-03.A0 | Danh sách phòng realtime (FS listener `rooms`) |
| Thao tác | SCR-03.A2 | NAV → SCR-05 / SCR-04 / SCR-07 |
| API | `createRoom` | `POST /rooms` |
| Dữ liệu | TBL-07 `rooms` | tạo mới + rules đọc + index `idx_rooms_member` |
| Dữ liệu | TBL-08 `rooms/{id}/members` | tạo mới + rules đọc + index `idx_mem_join` |
| Dữ liệu | TBL-09 `rooms/{id}/messages` | tạo mới (chỉ tin hệ thống `room_created`) + rules đọc |
| Dữ liệu | TBL-10 `users/{uid}/notifications` | thêm loại `room_member_added` (collection đã có từ T-005) |
| Dữ liệu | TBL-14 RTDB `room_access` | tạo mới, chỉ server ghi, rules deny client |
| Dữ liệu | TBL-05, TBL-02, TBL-11 | chỉ đọc (bạn bè, hồ sơ, `max_room_members`, `ttl_days_options`, `room_name_max`) |
| Rule | BR-15 | 1–49 người, cần ≥1 bạn |
| Rule | BR-16 | chế độ lưu + thời hạn bắt buộc, không đổi |
| Rule | BR-17 | người tạo là host |
| Rule | BR-18 | chỉ thêm bạn của mình |
| Rule | BR-24 | tin hệ thống "A đã tạo phòng" |
| Rule | Q-037 | tên phòng ≤50; người không còn là bạn bị bỏ khỏi danh sách chọn |
| Phụ trợ | SUP-02 | tạo thông báo `room_member_added` cho người được thêm (màn xem ở T-024) |
| NFR | NFR-08 | giới hạn đọc từ `config/limits` |
| NFR | NFR-13 | rules: chỉ thành viên đọc phòng / thành viên / tin; cấm ghi client |
| NFR | NFR-22 | mobile 375px |
| Flow | FLOW-08 bước 1–8 | happy path |
| Flow | FLOW-08 A1, A2 | tạo trùng người vẫn được; không đặt tên → tên thành viên |
| Flow | FLOW-08 E1, E2 | chưa có bạn; dữ liệu không hợp lệ / người vừa hết là bạn |

**Ngoài phạm vi:** xem trước tin cuối, giờ tin cuối, số tin chưa đọc, badge tab Phòng (T-021); chấm online ở hàng phòng (T-022); nhập / gửi tin trong SCR-05 (T-009 — task này chỉ cần SCR-05 hiển thị header + tin hệ thống); thông tin phòng & quản lý thành viên (T-015 → T-018); màn xem thông báo (T-024); dialog desktop (T-029).

## 3. Việc cần làm
### UI
- [ ] SCR-03: nút "+ Tạo phòng" ở header → SCR-04 (SCR-03.A2).
- [ ] SCR-03.A0: listener `rooms` where `member_uids array-contains me` && `status == active` orderBy `last_message_at desc`; mỗi hàng: avatar + tên phòng; tên trống → tên các thành viên khác (tối đa 3, "+n") lấy từ `profiles/{uid}` (get) (Q-012, FLOW-08 A2); chip "Ngắn hạn" khi `retention = short`.
- [ ] SCR-03 trạng thái: loading 5 hàng skeleton; empty "Chưa có phòng nào" + "Tạo phòng" + "Thêm bạn"; lỗi đọc → "Không tải được danh sách phòng" + "Thử lại"; banner mất kết nối (component chung từ T-009 nếu đã có, nếu chưa thì tạo tại đây) `[ASSUMED → Q-047]`.
- [ ] Bấm hàng phòng → `/rooms/{roomId}` (SCR-05) — SCR-05 tối thiểu: header tên phòng + dòng chế độ lưu + danh sách tin hệ thống (`system_event.type = room_created` → "{Tên} đã tạo phòng") `[ASSUMED → Q-047]` khung để T-009 bổ sung soạn/gửi tin.
- [ ] SCR-04 (màn con, ẩn thanh tab): header ← ("Bỏ tạo phòng?" khi đã nhập); ô tên phòng (trim, bộ đếm n/50, chặn gõ quá `room_name_max`); ô lọc cục bộ theo tên/email; chip đã chọn + "Đã chọn n/49"; danh sách bạn có checkbox (ảnh, tên, email – BR-27); đủ `max_room_members − 1` → checkbox còn lại disabled + "Phòng tối đa 50 thành viên".
- [ ] SCR-04: radio chế độ lưu (không chọn sẵn); chip thời hạn từ `limits.ttl_days_options` chỉ hiện khi Ngắn hạn; banner cảnh báo "Chế độ lưu và thời hạn không đổi được sau khi tạo phòng."; nút "Tạo phòng" sticky, disabled tới khi ≥1 bạn + chế độ lưu (+ thời hạn).
- [ ] SCR-04 trạng thái: skeleton khi tải bạn; empty (chưa có bạn) "Bạn chưa có người bạn nào. Cần ít nhất 1 người bạn để tạo phòng." + "Mời bạn" → SCR-07; lọc không khớp → "Không có bạn nào khớp"; khi tạo: nút spinner "Đang tạo…", khóa form.
- [ ] SCR-04 xử lý lỗi `createRoom`: `MEMBERS_NOT_FRIENDS` → bỏ các `details[].uid` khỏi chip + danh sách, báo "Người này không còn trong danh sách bạn bè"; `ROOM_FULL` → báo vượt giới hạn; `ROOM_TTL_INVALID` / `ROOM_NAME_TOO_LONG` / `VALIDATION_FAILED` → lỗi tại field; lỗi mạng → toast, giữ form.
- [ ] Tạo xong → `router.replace` sang SCR-05 phòng mới (back về SCR-03).
- [ ] Chuỗi giao diện vào file từ điển tiếng Việt (NFR-24).

### API / Backend
- [ ] `POST /api/rooms` (`createRoom`): auth chung (verifyIdToken + phiên + `CONSENT_REQUIRED`), Zod `RoomCreate` (`additionalProperties: false`, `memberUids` 1–49 không trùng, không chứa chính mình `[ASSUMED → Q-047]` → `VALIDATION_FAILED`).
- [ ] Kiểm nghiệp vụ: `memberUids.length + 1 > max_room_members` → `409 ROOM_FULL`; `retention = short` mà `ttlDays ∉ ttl_days_options` hoặc `retention = long` mà có `ttlDays` → `422 ROOM_TTL_INVALID`; tên sau trim > `room_name_max` → `422 ROOM_NAME_TOO_LONG`; từng uid phải có `friendships/{pair}` với mình và tài khoản `active` → thiếu → `422 MEMBERS_NOT_FRIENDS` với `details[].uid` (BR-15, BR-18, Q-037).
- [ ] Transaction Firestore: `rooms` (`host_uid = me`, `retention`, `ttl_days`, `status = active`, `member_uids`, `member_count`, `pair_key` khi đúng 2 người, `read_only = false`, `last_message` = tin hệ thống, `last_message_at`, `created_by`, timestamps, `schema_version = 1`); `members/{uid}` cho host (`role = host`, `added_by = null`) và từng người (`role = member`, `added_by = me`), `joined_at = last_read_at = now`; tin `messages` `kind = system`, `system_event {type: room_created, actor_uid: me}`, `expire_at = created_at + ttl_days` khi short (BR-16); `notifications` `room_member_added` (`actor_uid = me`, `ref_type = room`, `ref_id`, `room_name`, `expire_at = +30 ngày`) cho mỗi người được thêm (SUP-02).
- [ ] Sau commit: ghi RTDB `room_access/{roomId}/{uid} = true` cho mọi thành viên (multi-path update) `[ASSUMED → Q-047]` ghi sau transaction, lỗi → retry 3 lần và log cảnh báo (không chứa email – NFR-27).
- [ ] Response `201 Room` (camelCase, không lộ `pair_key`, `schema_version`).
- [ ] Hàm domain dùng chung `buildSystemMessage(type, …)` và `addMembersInTx(...)` để T-016 dùng lại `[ASSUMED → Q-047]`.

### Data
- [ ] `firestore.rules`: `rooms/{id}` read khi `request.auth.uid in resource.data.member_uids && resource.data.status == 'active'`; `rooms/{id}/members/*`, `rooms/{id}/messages/*` read khi `request.auth.uid in get(/databases/$(database)/documents/rooms/$(id)).data.member_uids`; mọi write `false`.
- [ ] `database.rules.json`: `room_access` `.read: false`, `.write: false` (chỉ Admin SDK).
- [ ] `firestore.indexes.json`: `idx_rooms_member` (`member_uids` array-contains, `status`, `last_message_at desc`), `idx_mem_join` (`status`, `joined_at asc`).
- [ ] Seed emulator: `config/limits` có `max_room_members`, `ttl_days_options`, `room_name_max` (đã có từ T-002 – kiểm lại); bộ seed T-008: A, B, C là bạn của A, D không là bạn của A, E chưa có bạn.

### Khác
- [ ] Không log `name` phòng / email trong request log (NFR-27) `[ASSUMED → Q-047]` coi tên phòng là nội dung người dùng.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A là bạn của B; cả hai đang mở app ở 2 trình duyệt | A mở SCR-04, chọn B, nhập "Hội cờ", chọn Ngắn hạn · 1 ngày, bấm Tạo | A được chuyển vào SCR-05 phòng "Hội cờ", thấy tin hệ thống "A đã tạo phòng" và dòng "Phòng ngắn hạn · tin tự xóa sau 1 ngày…"; trong ≤2 giây phòng "Hội cờ" xuất hiện ở đầu SCR-03 của B kèm chip "Ngắn hạn" mà B không tải lại trang | FLOW-08 bước 1–8, SUP-09 |
| AC-2 | Như AC-1 | Kiểm emulator sau khi tạo | `rooms/{id}`: `host_uid = A`, `member_uids = [A, B]`, `member_count = 2`, `pair_key = uidMin_uidMax`, `read_only = false`, `retention = short`, `ttl_days = 1`; `members/A.role = host`, `members/B.role = member`, `added_by = A`; 1 tin `kind = system`, `system_event.type = room_created`, `expire_at = created_at + 1 ngày`; RTDB `room_access/{id}/A` và `/B` = true | BR-16, BR-17, BR-24 |
| AC-3 | Như AC-1 | Kiểm `users/B/notifications` | Có 1 thông báo `type = room_member_added`, `actor_uid = A`, `ref_id = roomId`, `room_name = "Hội cờ"`, `read = false`; A **không** có thông báo này | SUP-02, FLOW-08 bước 8 |
| AC-4 | A có bạn B, C | A tạo phòng với B, C, Lâu dài, không đặt tên | Phòng hiển thị tên "B, C" (tên các thành viên khác) ở SCR-03 của A và "A, C" ở SCR-03 của B; `ttl_days = null`, tin hệ thống `expire_at = null`; không có chip "Ngắn hạn" | FLOW-08 A2, BR-16 |
| AC-5 | A đã có phòng với B | A tạo thêm phòng với B | Phòng mới được tạo, SCR-03 của A có 2 phòng, không có cảnh báo trùng | FLOW-08 A1 (Q-002) |
| AC-6 | E chưa có bạn nào | E mở SCR-04 | Thấy "Bạn chưa có người bạn nào. Cần ít nhất 1 người bạn để tạo phòng." + nút "Mời bạn"; bấm → SCR-07 | FLOW-08 E1, BR-15 |
| AC-7 | A đang ở SCR-04 | Chưa chọn bạn, hoặc chưa chọn chế độ lưu, hoặc chọn Ngắn hạn nhưng chưa chọn thời hạn | Nút "Tạo phòng" disabled; chế độ lưu không có lựa chọn sẵn | FLOW-08 E2, BR-16 |
| AC-8 | A ở SCR-04 đã chọn B, C; B vừa hủy kết bạn với A (seed xóa `friendships`) | A bấm Tạo | API trả `422 MEMBERS_NOT_FRIENDS` (`details[].uid = B`); B bị bỏ khỏi chip và danh sách, hiện "Người này không còn trong danh sách bạn bè"; form giữ C, tên, chế độ lưu; không có phòng nào được tạo | FLOW-08 E2, BR-18, Q-037 |
| AC-9 | `config/limits.max_room_members = 3` (seed); A có 3 bạn | A chọn bạn trên SCR-04 | Sau khi chọn 2 người checkbox còn lại disabled + "Phòng tối đa 3 thành viên" `[ASSUMED → Q-047]` câu dùng giá trị cấu hình; gọi API trực tiếp với 3 uid → `409 ROOM_FULL` | BR-15, NFR-08 |
| AC-10 | — | Gọi `createRoom` với `ttlDays = 5`, hoặc `retention = long` + `ttlDays = 7`, hoặc tên 51 ký tự, hoặc `memberUids = []` | Lần lượt: `422 ROOM_TTL_INVALID`, `422 ROOM_TTL_INVALID`, `422 ROOM_NAME_TOO_LONG`, `400 VALIDATION_FAILED`; không ghi gì vào emulator. Trên UI ô tên không cho gõ ký tự thứ 51 | BR-16, Q-037 |
| AC-11 | D không là bạn của A | A gọi `createRoom` với uid của D | `422 MEMBERS_NOT_FRIENDS`, không tạo phòng | BR-18 |
| AC-12 | Phòng A–B tồn tại; C không là thành viên | C dùng client SDK đọc `rooms/{id}`, `rooms/{id}/messages`, `rooms/{id}/members`; bất kỳ ai ghi trực tiếp vào `rooms` | Đọc bị từ chối (permission-denied); ghi bị từ chối; A và B đọc được | NFR-13, BR-20 |
| AC-13 | A chưa tham gia phòng nào | A mở tab Phòng | Thấy "Chưa có phòng nào" + "Tạo phòng" + "Thêm bạn"; khi đang tải thấy 5 hàng skeleton | SCR-03 trạng thái Empty / Loading |
| AC-14 | A có 2 phòng, phòng X có `last_message_at` mới hơn | A mở tab Phòng | X đứng trên; phòng `status = deleted` (seed) không hiện | SCR-03.A0 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Vitest (Zod) `RoomCreate`: thiếu `retention`, `memberUids` rỗng / 50 phần tử / trùng / chứa chính mình, field lạ → lỗi | AC-10 |
| Vitest domain `validateRoomCreate` với limits giả: ROOM_FULL, ROOM_TTL_INVALID (2 trường hợp), ROOM_NAME_TOO_LONG, tên trim "  " → null | AC-9, AC-10 |
| Integration (handler + Firestore/RTDB emulator): tạo phòng 2 người short → kiểm đủ document như AC-2, notification như AC-3 | AC-1, AC-2, AC-3 |
| Integration: tạo phòng 3 người long không tên → `pair_key = null`, `ttl_days = null`, `expire_at = null` | AC-4 |
| Integration: tạo 2 lần cùng người → 2 phòng | AC-5 |
| Integration: một uid không có `friendships` → 422 + `details[].uid`, emulator không có `rooms` mới | AC-8, AC-11 |
| Rules test (`@firebase/rules-unit-testing`): thành viên đọc được `rooms`/`members`/`messages`; người ngoài bị deny; phòng `deleted` bị deny với cả thành viên; mọi write deny; RTDB `room_access` read/write deny | AC-12, AC-14 |
| Vitest component SCR-04: nút Tạo disabled theo AC-7; chip thời hạn chỉ hiện khi Ngắn hạn; giới hạn chọn theo `max_room_members` | AC-7, AC-9 |
| Vitest hàm `roomDisplayName(room, profiles, me)`: có tên / trống 2 người / trống 5 người → "B, C, D +1" | AC-4 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context (A, B, Auth emulator, 375×812): A tạo phòng "Hội cờ" Ngắn hạn 1 ngày với B → A thấy SCR-05 + tin hệ thống; context B thấy phòng ở SCR-03 không reload | AC-1 |
| Playwright: E (không có bạn) mở Tạo phòng → thấy trạng thái chưa có bạn, bấm "Mời bạn" → SCR-07 | AC-6 |
| Playwright: A chọn B, C; seed xóa friendship A–B ngay trước khi bấm Tạo → thấy thông báo, B bị bỏ khỏi danh sách | AC-8 |

### Dữ liệu seed / tiền điều kiện
- Emulator chạy Auth, Firestore, RTDB; `config/limits` mặc định (`max_room_members = 50`, `ttl_days_options = [1,2,3,7,30,90]`, `room_name_max = 50`).
- Tài khoản: A (bạn của B, C), B, C, D (không là bạn A), E (không có bạn). Tất cả đã đồng ý chính sách.
- Biến thể seed cho AC-9: `max_room_members = 3`. Cho AC-14: một phòng `status = deleted` có A trong `member_uids`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Đăng nhập E, mở tab Phòng | "Chưa có phòng nào" + 2 nút | AC-13 |
| 2 | E bấm "Tạo phòng" | Trạng thái chưa có bạn + "Mời bạn" → SCR-07 | AC-6 |
| 3 | Đăng nhập A, mở SCR-04 | Nút Tạo disabled; chế độ lưu chưa chọn | AC-7 |
| 4 | Chọn B, chọn Ngắn hạn → nút vẫn disabled; chọn 1 ngày | Nút bật | AC-7 |
| 5 | Gõ tên 60 ký tự | Dừng ở 50, bộ đếm "50/50" | AC-10 |
| 6 | Nhập "Hội cờ", bấm Tạo; mở B ở trình duyệt khác | A vào SCR-05 thấy tin hệ thống; B thấy phòng mới không reload | AC-1 |
| 7 | Mở Emulator UI | Document đúng như AC-2; `users/B/notifications` có `room_member_added` | AC-2, AC-3 |
| 8 | A tạo phòng với B, C, Lâu dài, không tên | Tên hiển thị "B, C"; không chip Ngắn hạn | AC-4, AC-5 |
| 9 | Ở SCR-04 chọn B; dùng Emulator UI xóa `friendships` A–B; bấm Tạo | B bị bỏ + thông báo, không tạo phòng | AC-8 |
| 10 | Đặt `max_room_members = 3`, mở lại SCR-04 | Chọn 2 người thì các ô còn lại bị khóa | AC-9 |
| 11 | Kiểm thứ tự SCR-03 sau khi tạo nhiều phòng | Phòng mới nhất ở trên | AC-14 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Rules `rooms`, `members`, `messages`, RTDB `room_access` có test allow + deny
- [ ] Index `idx_rooms_member`, `idx_mem_join` khai báo trong `firestore.indexes.json`, query SCR-03 chạy được trên emulator không báo thiếu index
- [ ] Giới hạn đọc từ `config/limits`, không hard-code 50 / 49 / danh sách thời hạn (NFR-08)
- [ ] Hàm domain thêm thành viên + tạo tin hệ thống tách riêng để T-016 dùng lại

## 7. Ghi chú
- `[ASSUMED → Q-047]` SCR-05 ở task này chỉ là khung hiển thị tin hệ thống; ô nhập / gửi tin thuộc T-009.
- `[ASSUMED → Q-047]` Hàng phòng ở SCR-03 chưa hiện xem trước tin cuối, giờ và số chưa đọc — để T-021 (theo "Ngoài phạm vi" của slices). Sắp xếp vẫn theo `last_message_at`.
- `[ASSUMED → Q-047]` `memberUids` chứa chính người tạo → `400 VALIDATION_FAILED` (spec không nêu).
- `[ASSUMED → Q-047]` RTDB `room_access` ghi ngay sau transaction Firestore (hai DB không chung transaction), có retry.
- Point 5 giữ nguyên; khối lượng sát trần (form SCR-04 nhiều trạng thái + transaction 5 loại document + 3 rules mới). Nếu vượt, có thể tách phần "tên phòng theo thành viên (Q-012)" sang T-021.
