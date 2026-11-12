# T-016 · Host thêm & kick thành viên

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-04 | M3 | 5 | T-015, T-014 | TODO |

## 1. Mục tiêu demo
Sau task này: **Host A mở Thông tin phòng → "+ Thêm thành viên" → chọn C (bạn của A) → Thêm → C thấy phòng xuất hiện trong danh sách và đọc được toàn bộ tin còn hạn, mọi người thấy "A đã thêm C". A mở ⋮ trên C → "Mời ra khỏi phòng" → xác nhận → C đang mở phòng bị đóng ngay với thông báo "Bạn không còn ở trong phòng này", phòng biến mất khỏi danh sách của C. Phòng A–B đang chỉ đọc, A thêm C → phòng chat lại được. Thành viên thường chặn được một người từ danh sách thành viên.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-06.A8 | Tải bạn của host chưa có trong phòng (FS listener) |
| Thao tác | SCR-06.A2 | Thêm thành viên |
| Thao tác | SCR-06.A3 | Kick thành viên |
| Thao tác | SCR-06.A7 | Chặn một thành viên (dùng `createBlock` từ T-014) |
| API | `addRoomMembers` | `POST /rooms/{roomId}/members` |
| API | `kickRoomMember` | `POST /rooms/{roomId}/members/{memberUid}/kick` |
| API | `createBlock` | dùng lại, điểm vào mới SCR-06 |
| Dữ liệu | TBL-07 | `member_uids`, `member_count`, `pair_key`, `read_only`, `last_message` |
| Dữ liệu | TBL-08 | tạo / ghi đè (thêm lại), `status = kicked`, `left_at` |
| Dữ liệu | TBL-09 | tin hệ thống `member_added`, `member_kicked` |
| Dữ liệu | TBL-10 | thông báo `room_member_added`, `room_member_kicked` |
| Dữ liệu | TBL-14 | RTDB `room_access` thêm / xóa |
| Rule | BR-13 | thêm thành ≥3 → hết chỉ đọc; kick còn 2 người không là bạn / có chặn → chỉ đọc |
| Rule | BR-15 | ≤ `max_room_members` |
| Rule | BR-18 | chỉ host; chỉ thêm bạn của host |
| Rule | BR-20 | bị kick mất quyền xem ngay; thêm lại thấy toàn bộ tin còn hạn |
| Rule | BR-24 | tin hệ thống thêm / kick |
| Phụ trợ | SUP-02 | thông báo được thêm / bị kick |
| Phụ trợ | SUP-09 | đóng phòng người bị kick, danh sách thành viên realtime |
| NFR | NFR-13 | quyền host phía server; rules chặn người bị kick đọc tin |
| Flow | FLOW-09b | bước 1–7, A1, E1, E2 |
| Flow | FLOW-09c | bước 1–5, A1, A2, E1 |
| Flow | FLOW-07a | chặn từ danh sách thành viên |
| Flow | FLOW-10a E2 | bị kick khi đang xem phòng |

**Ngoài phạm vi:** chuyển host, rời phòng (T-018); giải tán (T-017); chấm online thành viên (T-022); xem thông báo (T-024).

## 3. Việc cần làm
### UI
- [ ] SCR-06: nút "+ Thêm thành viên" (chỉ host); disabled + "Phòng đã đủ {max} thành viên" khi `member_count ≥ max_room_members`.
- [ ] Sheet 12 thêm thành viên: "Còn n chỗ"; listener `friendships` where `member_uids array-contains me` + `profiles` (get), loại người đã trong `rooms.member_uids` (SCR-06.A8); ô lọc cục bộ; checkbox, chặn chọn quá số chỗ còn lại; nút "Thêm (n)" spinner khi gửi; lỗi tải → thông báo trong sheet + "Thử lại"; không có bạn nào để thêm → "Không còn bạn nào để thêm" `[ASSUMED → Q-047]`.
- [ ] Lỗi `addRoomMembers`: `ROOM_FULL` → "Phòng đã đủ 50 thành viên" (dùng `details[0].remainingSlots` để báo số chỗ còn); `MEMBERS_NOT_FRIENDS` → bỏ `details[].uid` khỏi lựa chọn + "Người này không còn trong danh sách bạn bè"; `MEMBER_ALREADY_IN_ROOM` → làm mới danh sách; `NOT_ROOM_HOST` → toast "Bạn không còn là host", đóng sheet.
- [ ] Menu ⋮ trên hàng thành viên khác (không có ở hàng của mình): host thấy "Mời ra khỏi phòng (kick)", "Chặn" (mục "Chuyển quyền host" thêm ở T-018); thành viên thường chỉ thấy "Chặn".
- [ ] Dialog xác nhận kick: "{Tên} sẽ không còn thấy phòng và nhận thông báo…" Hủy / Mời ra; thành công → hàng biến mất; `MEMBER_NOT_IN_ROOM` → toast "Người này không còn trong phòng".
- [ ] Dialog xác nhận chặn (component từ T-014, nội dung SCR-06 #14: phòng 2 người → chỉ đọc, phòng nhóm vẫn chat, người bị chặn không được báo); thành công → toast "Đã chặn {tên}", người đó vẫn ở danh sách thành viên phòng nhóm; `ALREADY_BLOCKED` → toast "Bạn đã chặn người này".
- [ ] SCR-05 / SCR-06 phía người bị kick: listener `rooms/{id}` bị từ chối hoặc `me ∉ member_uids` → dialog 24 "Bạn không còn ở trong phòng này" + "Về danh sách phòng" (dùng lại từ T-009); SCR-03 tự bỏ phòng.
- [ ] SCR-05: tin hệ thống "A đã thêm C", "A đã mời C ra khỏi phòng"; phòng hết chỉ đọc → thanh chỉ đọc biến mất, thanh soạn tin hiện lại realtime.

### API / Backend
- [ ] `POST /api/rooms/{roomId}/members` (`addRoomMembers`): Zod `RoomMembersAdd {uids[1..49]}`; phòng không có / `deleted` → `404 ROOM_NOT_FOUND`; mình không `active` → `403 NOT_ROOM_MEMBER`; không phải host → `403 NOT_ROOM_HOST`; uid đã `active` → `409 MEMBER_ALREADY_IN_ROOM`; `member_count + uids.length > max_room_members` → `409 ROOM_FULL` (`details[0].remainingSlots`); uid không có `friendships` với host / tài khoản không `active` → `422 MEMBERS_NOT_FRIENDS` (`details[].uid`) (BR-15, BR-18).
- [ ] Transaction: ghi / ghi đè `members/{uid}` (`role = member`, `status = active`, `joined_at = last_read_at = now`, `added_by = me`, `left_at = null`) — thêm lại = lần tham gia mới (BR-20); cập nhật `member_uids`, `member_count`, `pair_key` (đặt khi =2, null khi ≠2), `read_only` qua `recomputeReadOnly` (≥3 → false, BR-13); tin hệ thống `member_added` cho **từng** người (`actor_uid = me`, `target_uid`), `last_message`; thông báo `room_member_added` (kèm `room_name`) cho từng người được thêm (SUP-02). Sau commit ghi `room_access/{roomId}/{uid} = true`.
- [ ] `POST /api/rooms/{roomId}/members/{memberUid}/kick` (`kickRoomMember`): kiểm phòng / thành viên / host như trên; `memberUid == me` → `422 CANNOT_TARGET_SELF`; người đó không `active` → `409 MEMBER_NOT_IN_ROOM`.
- [ ] Transaction kick: `members/{uid}.status = kicked`, `left_at = now`; bỏ khỏi `member_uids`, giảm `member_count`, cập nhật `pair_key`; `read_only = recomputeReadOnly(...)` (còn đúng 2 người không là bạn / có chặn → true, BR-13); chỉ còn host → phòng vẫn `active` (FLOW-09c A2); tin hệ thống `member_kicked`; thông báo `room_member_kicked` (kèm `room_name`) cho người bị kick. Sau commit xóa `room_access/{roomId}/{uid}`.
- [ ] Response `200 Room` cho cả hai endpoint.
- [ ] `createBlock`: điều kiện "có liên hệ" đã gồm "chung phòng active" (T-014) — thêm test cho điểm vào này.

### Data
- [ ] Không có bảng / index mới. Rules `rooms` / `members` / `messages` (T-008) đã chặn người không trong `member_uids` — thêm test cho trường hợp **bị kick** (trước đọc được, sau kick deny).
- [ ] Seed T-016: A host phòng nhóm "Hội cờ" (A, B, C); D, E là bạn A chưa trong phòng; F không là bạn A; phòng 2 người A–B đang `read_only = true` (A–B đã hủy kết bạn); phòng có `max_room_members` đầy (biến thể `max_room_members = 4`).

### Khác
- [ ] Không có.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A host phòng "Hội cờ" (A, B, C); D là bạn A; phòng có 5 tin còn hạn | A mở SCR-06 → Thêm thành viên → chọn D → Thêm | Trong ≤2 giây: D thấy phòng ở SCR-03 và mở ra đọc được cả 5 tin cũ; mọi thành viên thấy tin hệ thống "A đã thêm D"; SCR-06 hiện "Thành viên (4/50)" | FLOW-09b bước 1–5, 7, BR-20, BR-24 |
| AC-2 | Như AC-1 | Kiểm emulator | `members/D`: `status = active`, `role = member`, `added_by = A`; `rooms.member_uids` có D, `member_count = 4`; `users/D/notifications` có `room_member_added` với `room_name = "Hội cờ"`; RTDB `room_access/{id}/D = true` | SUP-02, FLOW-09b bước 5, 7 |
| AC-3 | Sheet thêm thành viên đang mở | A xem danh sách | Chỉ có bạn của A **chưa** ở trong phòng (không có B, C, không có F); "Còn 47 chỗ" (phòng 3/50) | BR-18, SCR-06.A8 |
| AC-4 | Phòng 2 người A–B đang chỉ đọc (A host) | A thêm E | Phòng có 3 người, `read_only = false`, `pair_key = null`; A và B thấy thanh soạn tin hiện lại và gửi tin được | FLOW-09b bước 6, BR-13 |
| AC-5 | `max_room_members = 4`, phòng đang 4 người | A mở SCR-06 | Nút "+ Thêm thành viên" disabled với "Phòng đã đủ 4 thành viên"; gọi API thêm 1 người → `409 ROOM_FULL` | FLOW-09b E1, BR-15, NFR-08 |
| AC-6 | `max_room_members = 4`, phòng 3 người | A gọi API thêm D và E | `409 ROOM_FULL`, `details[0].remainingSlots = 1`; không ai được thêm | FLOW-09b E2, BR-15 |
| AC-7 | A đã chọn D trong sheet; D vừa hủy kết bạn với A (seed) | A bấm Thêm | `422 MEMBERS_NOT_FRIENDS`; D bị bỏ khỏi danh sách + "Người này không còn trong danh sách bạn bè"; không ai được thêm | FLOW-09b E2, BR-18 |
| AC-8 | B là thành viên thường | B gọi `addRoomMembers` / `kickRoomMember` | `403 NOT_ROOM_HOST`; dữ liệu không đổi; B không thấy nút "+ Thêm thành viên" và menu ⋮ chỉ có "Chặn" | BR-18, NFR-13 |
| AC-9 | C đang mở SCR-05 phòng "Hội cờ" | A ⋮ C → "Mời ra khỏi phòng" → xác nhận | Trong ≤2 giây: C thấy dialog "Bạn không còn ở trong phòng này" → về SCR-03, phòng không còn trong danh sách; A, B thấy "A đã mời C ra khỏi phòng"; C biến mất khỏi SCR-06 | FLOW-09c bước 1–4, FLOW-10a E2, BR-20, BR-24 |
| AC-10 | Như AC-9 | Kiểm emulator + rules | `members/C.status = kicked`, `left_at` có giá trị; C không trong `member_uids`; `users/C/notifications` có `room_member_kicked`; `room_access/{id}/C` bị xóa; C đọc `rooms/{id}/messages` bằng SDK → permission-denied | FLOW-09c bước 3–5, SUP-02, NFR-13 |
| AC-11 | C đã bị kick (AC-9) | A thêm lại C | C thấy lại phòng và toàn bộ tin còn hạn (kể cả tin gửi lúc C vắng); `members/C.joined_at` mới, `status = active` | FLOW-09b A1, BR-20 |
| AC-12 | Phòng (A host, B, C); A–B không còn là bạn | A kick C | Phòng còn A, B → `read_only = true`, cả hai thấy thanh chỉ đọc | FLOW-09c A1, BR-13 |
| AC-13 | Phòng (A host, B) | A kick B | Phòng vẫn `active` chỉ còn A; SCR-06 hiện gợi ý "Thêm bạn vào phòng để trò chuyện"; A vẫn gửi tin được | FLOW-09c A2 (Q-018) |
| AC-14 | C vừa tự rời phòng (seed `status = left`) nhưng màn của A chưa làm mới | A kick C | `409 MEMBER_NOT_IN_ROOM`; toast "Người này không còn trong phòng" | FLOW-09c E1 |
| AC-15 | A là host | A gọi kick chính mình | `422 CANNOT_TARGET_SELF` | BR-17 |
| AC-16 | B là thành viên thường phòng nhóm (A, B, C), không là bạn C | B ⋮ C → Chặn → xác nhận | Toast "Đã chặn C"; có `blocks/B_C`; C vẫn ở phòng nhóm, phòng vẫn chat được; C không được báo | FLOW-07a (từ thành viên phòng), BR-13, BR-14 |
| AC-17 | B đã chặn C | B chặn C lần nữa từ SCR-06 | Toast "Bạn đã chặn người này" | FLOW-07a A1 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Integration `addRoomMembers` (emulator): thêm 1 người → document như AC-2, tin hệ thống, thông báo, `room_access` | AC-1, AC-2 |
| Integration: thêm nhiều người → mỗi người 1 tin `member_added` + 1 thông báo | AC-1 |
| Integration: phòng 2 người `read_only` + thêm → `read_only = false`, `pair_key = null` | AC-4 |
| Integration: `ROOM_FULL` (đầy / vượt chỗ còn lại kèm `remainingSlots`), `MEMBERS_NOT_FRIENDS`, `MEMBER_ALREADY_IN_ROOM`, `NOT_ROOM_HOST`, `NOT_ROOM_MEMBER`, `ROOM_NOT_FOUND` | AC-5, AC-6, AC-7, AC-8 |
| Integration: thêm lại người `kicked` → ghi đè `joined_at`, `status = active` | AC-11 |
| Integration `kickRoomMember`: document như AC-10; còn 2 người không là bạn → `read_only = true`; chỉ còn host → phòng `active`; `MEMBER_NOT_IN_ROOM`; `CANNOT_TARGET_SELF`; `NOT_ROOM_HOST` | AC-10, AC-12, AC-13, AC-14, AC-15, AC-8 |
| Rules test: C đọc `messages` trước kick → allow, sau kick → deny; sau thêm lại → allow | AC-10, AC-11 |
| Integration `createBlock` từ người chung phòng không là bạn → 201, `read_only` phòng nhóm không đổi; lần 2 → 409 | AC-16, AC-17 |
| Vitest component menu ⋮: host thấy kick + chặn; thành viên chỉ thấy chặn; không có ⋮ ở hàng mình | AC-8 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context (A host, D): A thêm D → D thấy phòng và tin cũ | AC-1 |
| Playwright 2 context (A host, C đang mở phòng): A kick C → C thấy dialog "Bạn không còn ở trong phòng này" và phòng biến mất | AC-9 |
| Playwright: phòng A–B chỉ đọc, A thêm E → thanh soạn tin hiện lại, gửi tin được | AC-4 |

### Dữ liệu seed / tiền điều kiện
- Emulator Auth, Firestore, RTDB; tài khoản A–F đã đồng ý chính sách.
- Phòng nhóm "Hội cờ" (host A; B, C) có 5 tin `user`; D, E là bạn A chưa vào phòng; F không là bạn A; B và C không là bạn.
- Phòng 2 người A–B `read_only = true` (A–B đã hủy kết bạn, `pair_key` đặt).
- Biến thể `config/limits.max_room_members = 4`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A mở SCR-06 phòng "Hội cờ" → Thêm thành viên | Chỉ thấy D, E; "Còn 47 chỗ" (theo số thực tế) | AC-3 |
| 2 | Chọn D → Thêm; D mở app | D thấy phòng + 5 tin cũ; tin hệ thống "A đã thêm D" | AC-1 |
| 3 | Emulator UI kiểm `members/D`, `notifications`, RTDB `room_access` | Như AC-2 | AC-2 |
| 4 | B mở SCR-06 | Không có nút thêm; ⋮ chỉ có "Chặn" | AC-8 |
| 5 | C mở phòng; A kick C | C bị đóng phòng, mất khỏi SCR-03 | AC-9 |
| 6 | Emulator UI kiểm `members/C`, notifications C, `room_access` | Như AC-10 | AC-10 |
| 7 | A thêm lại C | C thấy lại phòng và mọi tin còn hạn | AC-11 |
| 8 | Phòng A–B chỉ đọc → A thêm E | Hết chỉ đọc, gửi tin được | AC-4 |
| 9 | Đặt `max_room_members = 4`, phòng đủ 4 | Nút thêm disabled + thông báo | AC-5 |
| 10 | Mở sheet chọn D; xóa `friendships` A–D; bấm Thêm | Báo "không còn trong danh sách bạn bè" | AC-7 |
| 11 | Phòng (A, B, C), A–B không là bạn; A kick C | Phòng chỉ đọc | AC-12 |
| 12 | Phòng (A, B); A kick B | Phòng còn A, gợi ý thêm bạn, vẫn gửi tin | AC-13 |
| 13 | Đặt `members/C.status = left` trong Emulator UI; A kick C từ màn cũ | Toast "Người này không còn trong phòng" | AC-14 |
| 14 | curl kick chính A; curl `addRoomMembers` thêm 2 người khi còn 1 chỗ | 422 CANNOT_TARGET_SELF; 409 ROOM_FULL | AC-15, AC-6 |
| 15 | B ⋮ C → Chặn → xác nhận; lặp lại | Toast "Đã chặn C", C vẫn ở phòng; lần 2 "Bạn đã chặn người này" | AC-16, AC-17 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Rules test khẳng định người bị kick mất quyền đọc tin ngay sau kick
- [ ] `room_access` RTDB đồng bộ với `member_uids` sau thêm / kick (có test)
- [ ] `recomputeReadOnly` dùng chung với T-013 / T-014 / T-018

## 7. Ghi chú
- `[ASSUMED → Q-047]` Sheet thêm thành viên không còn bạn nào để thêm → "Không còn bạn nào để thêm" (spec chưa có câu).
- `[ASSUMED → Q-047]` Thêm nhiều người trong một lần → mỗi người một tin hệ thống "A đã thêm X" (API mô tả "cho từng người").
- `[ASSUMED → Q-047]` `MEMBER_ALREADY_IN_ROOM` trên UI → làm mới danh sách, không toast lỗi.
- Mục "Chuyển quyền host" trong menu ⋮ do T-018 thêm.
