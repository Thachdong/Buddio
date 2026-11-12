# T-018 · Chuyển quyền host & rời phòng

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-04 | M3 | 5 | T-017 | TODO |

## 1. Mục tiêu demo
Sau task này: **Host A mở ⋮ trên B → "Chuyển quyền host" → xác nhận → B thấy nhãn Host ở mình và các nút host hiện ra, A chuyển sang giao diện thành viên, mọi người thấy "A chuyển quyền host cho B", B có thông báo. Thành viên C bấm "Rời phòng" → xác nhận → về danh sách phòng với toast "Đã rời phòng", người khác thấy "C đã rời phòng". Host muốn rời phải chọn người nhận quyền ngay trong dialog; host là người cuối cùng → cảnh báo "Rời phòng sẽ xóa phòng…" → rời = phòng bị xóa và dọn dữ liệu nền.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-06.A4 | Chuyển quyền host |
| Thao tác | SCR-06.A5 | Rời phòng (3 biến thể dialog 13) |
| API | `transferRoomHost` | `POST /rooms/{roomId}/transfer-host` |
| API | `leaveRoom` | `POST /rooms/{roomId}/leave` |
| Việc nền | `purgeRoom` | dùng lại từ T-017 khi host cuối rời |
| Dữ liệu | TBL-07 | `host_uid`, `member_uids`, `member_count`, `pair_key`, `read_only`, `status`, `last_message` |
| Dữ liệu | TBL-08 | `role`, `status = left`, `left_at` |
| Dữ liệu | TBL-09 | tin hệ thống `host_transferred`, `member_left` |
| Dữ liệu | TBL-10 | thông báo `room_host_received` |
| Dữ liệu | TBL-14 | xóa `room_access/{roomId}/{uid}` |
| Rule | BR-13 | rời làm còn 2 người không là bạn / có chặn → chỉ đọc |
| Rule | BR-17 | luôn đúng 1 host là thành viên đang tham gia |
| Rule | BR-18 | chỉ host chuyển quyền |
| Rule | BR-19 | host rời phải chuyển quyền trước; người cuối rời = xóa phòng |
| Rule | BR-20 | rời → mất quyền xem phòng và tin |
| Rule | BR-24 | tin hệ thống chuyển host / rời |
| Rule | Q-029 | chọn người nhận quyền ngay trong thao tác rời; không cần người nhận đồng ý |
| Phụ trợ | SUP-02 | "Bạn đã trở thành host phòng X" |
| Phụ trợ | SUP-08, SUP-09 | xóa ảnh khi phòng bị xóa; giao diện đổi realtime |
| NFR | NFR-13 | quyền phía server |
| NFR | NFR-19 | phòng xóa biến mất ngay, dữ liệu dọn nền |
| Flow | FLOW-09d bước 1–4, E1 | chuyển quyền host |
| Flow | FLOW-09e bước 1–8, A1, A2, A3 | rời phòng |

**Ngoài phạm vi:** tự chuyển host khi host xóa tài khoản (T-026); xem thông báo (T-024).

## 3. Việc cần làm
### UI
- [ ] Menu ⋮ của host trên hàng thành viên khác: thêm "Chuyển quyền host" → dialog 14 "Bạn sẽ trở thành thành viên thường…" Hủy / Chuyển quyền.
- [ ] Chuyển xong: giao diện SCR-06 của A chuyển sang góc nhìn thành viên (ẩn ✎, nút thêm, Giải tán, mục host trong ⋮); của B hiện các nút host — đổi realtime theo `rooms.host_uid` (không cần tải lại). `MEMBER_NOT_IN_ROOM` → toast "Người này không còn trong phòng"; `NOT_ROOM_HOST` → toast "Bạn không còn là host".
- [ ] Nút "Rời phòng" (mọi thành viên) → dialog 13:
  - (a) thành viên thường: "Sau khi rời, bạn sẽ không còn thấy phòng và tin nhắn…" Hủy / Rời phòng;
  - (b) host, còn người khác: danh sách radio thành viên `active` khác, **bắt buộc chọn** → nút "Chuyển quyền và rời" disabled tới khi chọn;
  - (c) host là người cuối cùng (`member_count = 1`): "Rời phòng sẽ **xóa phòng** cùng toàn bộ tin nhắn và ảnh" → "Rời và xóa phòng".
- [ ] Rời thành công → SCR-03, toast "Đã rời phòng" (biến thể c: toast "Đã rời và xóa phòng" `[ASSUMED → Q-047]`). Lỗi `HOST_TRANSFER_REQUIRED` → mở lại dialog (b); `MEMBER_NOT_IN_ROOM` (người nhận vừa rời) → làm mới danh sách radio, yêu cầu chọn lại; Hủy → không đổi (FLOW-09e A3).
- [ ] SCR-05: tin hệ thống "A chuyển quyền host cho B", "C đã rời phòng"; phòng chuyển chỉ đọc → thanh chỉ đọc realtime.

### API / Backend
- [ ] `POST /api/rooms/{roomId}/transfer-host` (`transferRoomHost`): Zod `HostTransfer {newHostUid}`; `404 ROOM_NOT_FOUND` / `403 NOT_ROOM_MEMBER` / `403 NOT_ROOM_HOST`; `newHostUid == me` → `422 CANNOT_TARGET_SELF`; người nhận không `active` → `409 MEMBER_NOT_IN_ROOM`.
- [ ] Transaction chuyển quyền (hàm dùng chung `transferHostInTx`): `rooms.host_uid = newHostUid`; `members/{me}.role = member`, `members/{newHost}.role = host`; tin hệ thống `host_transferred` (`actor_uid = me`, `target_uid = newHost`) + `last_message`; thông báo `room_host_received` (`room_name`) cho người nhận (SUP-02). Response `200 Room`.
- [ ] `POST /api/rooms/{roomId}/leave` (`leaveRoom`): Zod `RoomLeave {newHostUid?}`; kiểm `ROOM_NOT_FOUND`, `NOT_ROOM_MEMBER`.
  - Thành viên thường: `members/{me}.status = left`, `left_at`; bỏ khỏi `member_uids`, `member_count`, cập nhật `pair_key`, `read_only = recomputeReadOnly(...)` (BR-13); tin hệ thống `member_left` + `last_message`. `newHostUid` gửi kèm khi không phải host → bỏ qua `[ASSUMED → Q-047]`.
  - Host, còn người khác: thiếu `newHostUid` → `422 HOST_TRANSFER_REQUIRED`; `newHostUid == me` → `422 CANNOT_TARGET_SELF`; người nhận không `active` → `409 MEMBER_NOT_IN_ROOM`; hợp lệ → trong **cùng transaction** `transferHostInTx` rồi rời như thành viên (2 tin hệ thống theo thứ tự: chuyển host → rời).
  - Host là người cuối cùng: `rooms.status = deleted`, `deleted_at`, `members/{me}.status = left`; không thông báo ai; sau commit xóa `room_access/{roomId}`, `typing/{roomId}` và `enqueuePurgeRoom(roomId)` (T-017). Response `roomDeleted = true`.
  - Sau commit (không xóa phòng): xóa `room_access/{roomId}/{me}`.
- [ ] Response `200 RoomLeft {roomId, roomDeleted, newHostUid?}`.

### Data
- [ ] Không có bảng / index mới. Thêm rules test: người đã rời không đọc được `messages` / `members`.
- [ ] Seed T-018: phòng nhóm "Hội cờ" (host A; B, C; A–B, A–C là bạn; B–C không là bạn); phòng 3 người (host A; B, C) để kiểm chỉ đọc khi rời; phòng chỉ có A.

### Khác
- [ ] Không có.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A host phòng "Hội cờ" (A, B, C); B đang mở SCR-06 | A ⋮ B → Chuyển quyền host → xác nhận | Trong ≤2 giây: nhãn "Host" chuyển sang B; SCR-06 của A ẩn ✎ / Thêm / Giải tán; SCR-06 của B hiện các nút đó; mọi người thấy tin hệ thống "A chuyển quyền host cho B" | FLOW-09d bước 1–3, BR-17, BR-24, SUP-09 |
| AC-2 | Như AC-1 | Kiểm emulator | `rooms.host_uid = B`; `members/A.role = member`, `members/B.role = host`; đúng 1 thành viên `role = host`; `users/B/notifications` có `room_host_received` với `room_name = "Hội cờ"` | BR-17, SUP-02, FLOW-09d bước 4 |
| AC-3 | C vừa rời phòng nhưng màn của A chưa làm mới | A chuyển quyền cho C | `409 MEMBER_NOT_IN_ROOM`, toast "Người này không còn trong phòng"; host không đổi | FLOW-09d E1 |
| AC-4 | B là thành viên thường | B gọi `transferRoomHost`; A gọi với `newHostUid = A` | `403 NOT_ROOM_HOST`; `422 CANNOT_TARGET_SELF` | BR-18, NFR-13 |
| AC-5 | C là thành viên thường, đang mở SCR-06 | C bấm Rời phòng → xác nhận | C về SCR-03 với toast "Đã rời phòng", phòng không còn trong danh sách của C; A, B thấy "C đã rời phòng" và C biến mất khỏi SCR-06 | FLOW-09e bước 1, 2, 5, 7, BR-20, BR-24 |
| AC-6 | Như AC-5 | Kiểm emulator + rules | `members/C.status = left`, `left_at` có giá trị; C không trong `member_uids`; `room_access/{id}/C` bị xóa; C đọc `rooms/{id}/messages` bằng SDK → permission-denied | BR-20, NFR-13 |
| AC-7 | C mở dialog rời | C bấm Hủy | Không gọi API, không đổi gì | FLOW-09e A3 |
| AC-8 | A host phòng (A, B, C) | A bấm Rời phòng | Dialog hiện danh sách B, C để chọn người nhận quyền; nút "Chuyển quyền và rời" disabled tới khi chọn | FLOW-09e A1, Q-029 |
| AC-9 | Như AC-8 | A chọn B → "Chuyển quyền và rời" | A về SCR-03, mất phòng; B thành host và có thông báo `room_host_received`; phòng có 2 tin hệ thống theo thứ tự "A chuyển quyền host cho B", "A đã rời phòng"; `members/A.status = left` | FLOW-09e A1, bước 6–7, BR-17, BR-19 |
| AC-10 | A host phòng (A, B) | A gọi `leaveRoom` không có `newHostUid` | `422 HOST_TRANSFER_REQUIRED`; UI mở lại dialog chọn người nhận; A vẫn là host | BR-19 |
| AC-11 | A host chọn C làm người nhận, nhưng C vừa rời | A bấm "Chuyển quyền và rời" | `409 MEMBER_NOT_IN_ROOM`; danh sách làm mới không còn C; A vẫn ở phòng, vẫn là host | SCR-06.A5 lỗi |
| AC-12 | A là thành viên duy nhất (host) của phòng có 10 tin + 1 ảnh | A bấm Rời phòng | Dialog cảnh báo "Rời phòng sẽ xóa phòng cùng toàn bộ tin nhắn và ảnh" + "Rời và xóa phòng"; xác nhận → về SCR-03, phòng biến mất; response `roomDeleted = true`; `rooms.status = deleted`; ≤30 giây sau emulator không còn tin, thành viên, ảnh | FLOW-09e A2, bước 9, BR-19, SUP-08, NFR-19 |
| AC-13 | Phòng (host A; B, C); B–C không là bạn | A chọn B làm host rồi rời | Phòng còn B, C → `read_only = true`; B và C thấy thanh chỉ đọc | FLOW-09e bước 8, BR-13 |
| AC-14 | Phòng (host A; B, C); B–C là bạn, không chặn | C rời phòng | Phòng còn A, B (bạn) → `read_only = false`, vẫn chat | BR-13 |
| AC-15 | D không ở phòng | D gọi `leaveRoom` | `403 NOT_ROOM_MEMBER` | NFR-13 |
| AC-16 | C đã rời | A thêm lại C (T-016) | C thấy lại phòng và tin còn hạn | BR-20 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Integration `transferRoomHost` (emulator): đổi `host_uid`, `role` hai người, tin hệ thống, thông báo; bất biến "đúng 1 host" | AC-1, AC-2 |
| Integration: `MEMBER_NOT_IN_ROOM`, `NOT_ROOM_HOST`, `CANNOT_TARGET_SELF` | AC-3, AC-4 |
| Integration `leaveRoom` thành viên: document như AC-6, tin `member_left`, `room_access` bị xóa | AC-5, AC-6 |
| Integration `leaveRoom` host + `newHostUid`: 1 transaction, 2 tin hệ thống đúng thứ tự, thông báo cho người nhận | AC-9 |
| Integration: host thiếu `newHostUid` → 422; người nhận đã rời → 409; trạng thái không đổi | AC-10, AC-11 |
| Integration: host cuối rời → `roomDeleted = true`, `status = deleted`, `enqueuePurgeRoom` được gọi (spy); với Functions emulator → dữ liệu bị xóa | AC-12 |
| Integration `recomputeReadOnly` sau rời: còn 2 người không là bạn → true; là bạn → false; có chặn → true | AC-13, AC-14 |
| Integration: người ngoài gọi leave → 403 | AC-15 |
| Rules test: người đã `left` đọc `messages`/`members` → deny; thêm lại → allow | AC-6, AC-16 |
| Vitest component dialog rời 3 biến thể theo `host_uid` và `member_count`; nút disabled khi chưa chọn | AC-8, AC-12 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context (A host, B): A chuyển quyền cho B → B thấy nút host, A mất nút host | AC-1 |
| Playwright 2 context (A host, B, C): A rời, chọn B → A về SCR-03; B thấy mình là Host và 2 tin hệ thống | AC-8, AC-9 |
| Playwright: A một mình trong phòng → rời → cảnh báo xóa → phòng biến mất | AC-12 |

### Dữ liệu seed / tiền điều kiện
- Emulator Auth, Firestore, RTDB, Storage, Functions (task queue).
- Phòng "Hội cờ": host A; B, C; A–B, A–C bạn; B–C không là bạn.
- Phòng "Nhóm 3": host A; B, C; B–C là bạn (AC-14).
- Phòng "Một mình": chỉ A, 10 tin + 1 ảnh trong Storage `rooms/{id}/…`.
- D không ở phòng nào.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A ⋮ B → Chuyển quyền host → xác nhận; B mở SCR-06 song song | Nhãn Host sang B, giao diện hai bên đổi, tin hệ thống | AC-1 |
| 2 | Emulator UI kiểm `rooms`, `members`, notifications B | Như AC-2 | AC-2 |
| 3 | curl `transferRoomHost` bằng token C (thường); token B với `newHostUid = B` | 403; 422 | AC-4 |
| 4 | Đặt `members/C.status = left` trong Emulator UI; B (host) chuyển quyền cho C từ màn cũ | Toast "Người này không còn trong phòng" | AC-3 |
| 5 | Reset seed; C bấm Rời phòng → Hủy | Không đổi | AC-7 |
| 6 | C bấm Rời phòng → xác nhận | C về SCR-03, A/B thấy "C đã rời phòng" | AC-5 |
| 7 | Emulator UI kiểm `members/C`, `room_access`; C thử mở lại URL phòng | Như AC-6; C thấy dialog không còn trong phòng | AC-6 |
| 8 | Reset; A bấm Rời phòng | Dialog chọn người nhận, nút disabled | AC-8 |
| 9 | Chọn B → Chuyển quyền và rời | A mất phòng, B là host + thông báo, 2 tin hệ thống | AC-9, AC-13 |
| 10 | curl `leaveRoom` host không có body | 422 HOST_TRANSFER_REQUIRED | AC-10 |
| 11 | Mở dialog chọn C; đặt C `left` trong Emulator UI; bấm xác nhận | Danh sách làm mới, phải chọn lại | AC-11 |
| 12 | Phòng "Nhóm 3": C rời | Phòng A–B vẫn chat được | AC-14 |
| 13 | Phòng "Một mình": A rời → xác nhận cảnh báo; chờ 30 giây | Phòng biến mất; emulator không còn tin / ảnh | AC-12 |
| 14 | curl `leaveRoom` bằng token D | 403 NOT_ROOM_MEMBER | AC-15 |
| 15 | A (host "Nhóm 3") thêm lại C | C thấy lại phòng | AC-16 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Test bất biến BR-17: sau mọi thao tác chuyển / rời, phòng `active` có đúng 1 `members.role = host` và `host_uid ∈ member_uids`
- [ ] Rules test: người đã rời mất quyền đọc
- [ ] Host cuối rời dùng lại `enqueuePurgeRoom` của T-017 (không viết lại logic xóa)

## 7. Ghi chú
- `[ASSUMED → Q-047]` Rời ở biến thể (c) dùng toast "Đã rời và xóa phòng" (spec chỉ có "Đã rời phòng").
- `[ASSUMED → Q-047]` Thành viên thường gửi kèm `newHostUid` → server bỏ qua, không báo lỗi.
- `[ASSUMED → Q-047]` Host rời kèm chuyển quyền tạo 2 tin hệ thống riêng (`host_transferred` rồi `member_left`), `last_message` là tin `member_left`.
- `[ASSUMED → Q-047]` Host cuối rời không tạo thông báo cho ai (không còn thành viên khác).
