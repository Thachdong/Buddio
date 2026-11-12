# T-013 · Hủy kết bạn & phòng 2 người chỉ đọc

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-02 | M2 | 5 | T-009, T-007 | TODO |

## 1. Mục tiêu demo
Sau task này: **A mở Bạn bè → ⋮ cạnh B → "Hủy kết bạn" → xác nhận → B biến mất khỏi danh sách, toast "Đã hủy kết bạn"; phòng 2 người A–B chuyển chỉ đọc trên cả hai máy (thanh soạn thay bằng "Phòng chỉ đọc — Hai bạn không còn là bạn bè…", danh sách phòng có nhãn "Chỉ đọc"); phòng nhóm A–B–C vẫn chat được. A mời lại, B chấp nhận → phòng A–B mở lại.** B từ chối một lời mời cũ khi hai người đã là bạn → thấy dialog "Hai bạn đã là bạn bè" + "Hủy kết bạn".

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-08.A1 | Menu ⋮ → Hủy kết bạn → dialog xác nhận |
| Thao tác | SCR-05 trạng thái chỉ đọc | Thanh chỉ đọc (thành phần 19) thay thanh soạn |
| Thao tác | SCR-03 nhãn "Chỉ đọc" | Chip `read_only` (thành phần 9) `[ASSUMED → Q-047]` |
| Thao tác | SCR-09 / SCR-02 dialog "Hai bạn đã là bạn bè" | FLOW-04 A1 → SCR-08 mở sẵn dialog hủy |
| API | `deleteFriend` | `DELETE /friends/{friendUid}` |
| API | `acceptFriendRequest` (cập nhật) | mở lại phòng: `reopenedRoomIds` (C3) |
| API | `rejectFriendRequest` (cập nhật) | `409 ALREADY_FRIENDS` + `details[0].friendUid` (A1) |
| API | `createMessage`, `createRoom` (cập nhật) | `409 ROOM_READ_ONLY` (E4); đặt `pair_key` khi tạo phòng 2 người |
| Dữ liệu | TBL-05 | xóa document |
| Dữ liệu | TBL-07 | field `pair_key`, `read_only`; index `idx_rooms_pair` |
| Dữ liệu | TBL-06 | chỉ đọc (tính `read_only`) |
| Rule | BR-12, BR-13 | |
| Phụ trợ | SUP-09 | cập nhật chỉ đọc tức thời |
| Flow | FLOW-06 bước 1–8, A1, E1; FLOW-04 A1, C3; FLOW-10a A1, E4 | |

**Ngoài phạm vi:** chặn từ menu ⋮ (T-014 – menu chỉ có "Hủy kết bạn", "Đóng"); chỉ đọc do kick / rời / thêm người (T-016, T-018 dùng lại `recomputeReadOnly`); thu hồi tin khi chỉ đọc (T-020).

## 3. Việc cần làm
### UI
- [ ] SCR-08: menu ⋮ mỗi hàng (bottom sheet) gồm "Hủy kết bạn", "Đóng" → dialog 8: "Hủy kết bạn với {tên}? Phòng chat chỉ có hai bạn sẽ chuyển sang chỉ đọc (vẫn xem được tin cũ). Phòng nhóm không bị ảnh hưởng. {tên} không nhận được thông báo." Không / Hủy kết bạn.
- [ ] Thành công → toast "Đã hủy kết bạn" (hàng biến mất nhờ listener). `NOT_FRIENDS` → toast "Hai bạn không còn là bạn bè", làm mới danh sách. Chọn "Không" → không gọi API.
- [ ] SCR-08 nhận `?unfriend={uid}`: cuộn tới người đó và mở sẵn dialog 8 (wireframe mục 3).
- [ ] SCR-09 (và SCR-02.A3): `rejectFriendRequest` trả `ALREADY_FRIENDS` → dialog 9 "{tên} đã chấp nhận lời mời của bạn trước đó nên lời từ chối không có hiệu lực. Bạn có muốn hủy kết bạn không?" Đóng / Hủy kết bạn → `/friends?unfriend={friendUid}`.
- [ ] SCR-05: listener `rooms/{roomId}` theo dõi `read_only`; `true` → thay thanh soạn bằng thanh 19 "[Khóa] Phòng chỉ đọc — Hai bạn không còn là bạn bè nên không thể gửi tin mới. Bạn vẫn xem được tin cũ và thu hồi tin của mình." (host thêm câu "Host có thể thêm bạn khác vào phòng để trò chuyện tiếp."); `false` → hiện lại thanh soạn. Một câu lý do chung (không lộ chặn – Q-044).
- [ ] SCR-05: gửi tin nhận `409 ROOM_READ_ONLY` (E4) → chuyển sang thanh chỉ đọc, tin đang gửi đánh dấu "Gửi thất bại" không có nút Gửi lại `[ASSUMED → Q-047]`.
- [ ] SCR-03: chip "Chỉ đọc" khi `read_only = true`; phòng vẫn trong danh sách.

### API / Backend
- [ ] Domain `recomputeReadOnly(tx, room)`: `member_count == 2` và (không có `friendships/{pair_key}` hoặc có `blocks` chiều nào) → `true`, ngược lại `false` (BR-13). Dùng chung cho các task sau.
- [ ] `createRoom` (T-008): đặt `pair_key = uidMin_uidMax` khi `member_count == 2`, `null` khi ≥3; `read_only = false`.
- [ ] `DELETE /api/friends/{friendUid}` (`deleteFriend`): transaction — không có `friendships/{uidMin_uidMax}` → `404 NOT_FRIENDS` (E1); xóa document (BR-12); query `rooms where pair_key == pairId && status == active` → `read_only = true`, `updated_at`; trả `200 {readOnlyRoomIds}`. **Không** tạo thông báo (BR-12, bước 8).
- [ ] `acceptFriendRequest` (T-006): sau khi tạo `friendships`, phòng `pair_key` của cặp đang `read_only` → `recomputeReadOnly` (mở lại nếu không còn chặn) → trả `reopenedRoomIds` (C3).
- [ ] `rejectFriendRequest` (T-006): lời mời `closed (became_friends)` hoặc cặp đã có `friendships` → `409 ALREADY_FRIENDS`, `details[0].friendUid` (BR-09, A1).
- [ ] `createMessage` (T-009): trong transaction đọc `rooms.read_only` → `true` → `409 ROOM_READ_ONLY` (BR-13, E4).

### Data
- [ ] `firestore.indexes.json`: `idx_rooms_pair` (`pair_key`, `status`).
- [ ] Rules: không đổi (rooms đọc theo `member_uids` – T-008); test lại thành viên đọc được `read_only`.
- [ ] Seed: cập nhật seed phòng 2 người có `pair_key` (dữ liệu local, không cần migration – chưa deploy, Q-045).

### Khác
- [ ] —

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A và B là bạn; có phòng 2 người R1 (A, B) và phòng nhóm R2 (A, B, C) | A mở Bạn bè → ⋮ cạnh B → Hủy kết bạn → xác nhận | B biến mất khỏi danh sách A (và A khỏi danh sách B), toast "Đã hủy kết bạn"; `friendships/{A_B}` bị xóa; response `readOnlyRoomIds = [R1]` | FLOW-06 bước 3–6, BR-12 |
| AC-2 | Như AC-1, B đang mở R1 trên máy khác | A hủy kết bạn | Trên cả hai máy, không tải lại: thanh soạn R1 thay bằng thanh chỉ đọc với câu lý do; danh sách phòng có chip "Chỉ đọc" ở R1; tin cũ vẫn xem được | FLOW-06 bước 7, BR-13, SUP-09, FLOW-10a A1 |
| AC-3 | Như AC-1 | A/B gửi tin trong R2 | Gửi bình thường; R2 `read_only = false` | BR-13 (phòng ≥3 người) |
| AC-4 | A hủy kết bạn B | Kiểm `users/B/notifications` | Không có thông báo mới | BR-12, FLOW-06 bước 8 |
| AC-5 | A mở dialog hủy kết bạn | A bấm "Không" | Không gọi API, B vẫn trong danh sách | FLOW-06 A1 |
| AC-6 | B vừa hủy kết bạn A nhưng màn A chưa cập nhật | A bấm Hủy kết bạn với B | API `404 NOT_FRIENDS`; toast "Hai bạn không còn là bạn bè"; danh sách làm mới | FLOW-06 E1 |
| AC-7 | B đang soạn tin trong R1 | A hủy kết bạn, B bấm Gửi | API `409 ROOM_READ_ONLY`; B thấy thanh chỉ đọc; không có tin mới trong R1 | FLOW-10a E4 |
| AC-8 | R1 chỉ đọc sau AC-1 | A gửi lời mời cho B, B chấp nhận | `reopenedRoomIds = [R1]`; R1 hiện lại thanh soạn trên cả hai máy, chip "Chỉ đọc" biến mất; gửi tin được | FLOW-04 C3, BR-13 |
| AC-9 | R1 chỉ đọc; có `blocks/B_A` (seed) | A và B thành bạn lại (seed lời mời + accept) | R1 vẫn `read_only = true`, `reopenedRoomIds = []` | BR-13 (còn chặn) |
| AC-10 | A→B và B→A pending; A chấp nhận lời mời của B (lời mời A→B `closed`) | B bấm Từ chối lời mời A→B (màn chưa cập nhật) hoặc gọi API | `409 ALREADY_FRIENDS` + `friendUid = A`; dialog "Hai bạn đã là bạn bè"; bấm "Hủy kết bạn" → SCR-08 cuộn tới A, mở sẵn dialog hủy kết bạn | FLOW-04 A1, BR-09 |
| AC-11 | Phòng tạo mới với đúng 2 người / 3 người | `createRoom` | `pair_key = uidMin_uidMax` / `null`; `read_only = false` | BR-13, TBL-07 |
| AC-12 | Người dùng là host R1 chỉ đọc | Mở R1 | Thanh chỉ đọc có thêm câu "Host có thể thêm bạn khác vào phòng để trò chuyện tiếp." | SCR-05 thành phần 19 |
| AC-13 | A, B không còn là bạn | A gọi `deleteFriend` cho C (không phải bạn) / không token | `404 NOT_FRIENDS` / `401` | NFR-13 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `recomputeReadOnly`: 2 người bạn → false; 2 người không bạn → true; 2 người bạn + chặn → true; 3 người → false | AC-1, AC-3, AC-9 |
| Handler `deleteFriend` (emulator): xóa friendships, R1 → read_only, R2 không đổi, không có notification | AC-1, AC-3, AC-4 |
| Handler `deleteFriend` khi không là bạn → 404; không token → 401 | AC-6, AC-13 |
| Handler `createMessage` với phòng `read_only` → 409 `ROOM_READ_ONLY`, không ghi tin | AC-7 |
| Handler `acceptFriendRequest`: mở lại R1, trả `reopenedRoomIds`; có chặn → không mở | AC-8, AC-9 |
| Handler `rejectFriendRequest` với lời mời `closed (became_friends)` → 409 `ALREADY_FRIENDS` + `friendUid` | AC-10 |
| Handler `createRoom`: `pair_key` đúng cho 2 / 3 người | AC-11 |
| Component test thanh chỉ đọc: host / không host | AC-12 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context: A, B là bạn, có R1; B mở R1; A hủy kết bạn → B thấy thanh chỉ đọc, A không còn B trong Bạn bè; A gửi lời mời lại, B chấp nhận → R1 mở lại | AC-1, AC-2, AC-8 |
| Playwright: B soạn tin trong R1, A hủy kết bạn qua API, B bấm Gửi → thấy thanh chỉ đọc, không có tin mới | AC-7 |

### Dữ liệu seed / tiền điều kiện
- A `an@test.local`, B `binh.tran@test.local`, C `chi@test.local`; `friendships` A–B, A–C, B–C.
- R1: phòng long, thành viên A (host), B, `pair_key = A_B` (sắp xếp uid). R2: A (host), B, C. Mỗi phòng có vài tin.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | B mở R1 trên cửa sổ 2. A: Bạn bè → ⋮ B → Hủy kết bạn → "Không" | Không đổi gì | AC-5 |
| 2 | A: ⋮ B → Hủy kết bạn → xác nhận | Toast; B mất khỏi danh sách; cửa sổ B: R1 hiện thanh chỉ đọc; danh sách phòng có chip "Chỉ đọc" | AC-1, AC-2 |
| 3 | A mở R1 | Thanh chỉ đọc có câu dành cho host | AC-12 |
| 4 | A, B gửi tin trong R2 | Gửi được | AC-3 |
| 5 | Emulator UI: `users/B/notifications` | Không có thông báo mới | AC-4 |
| 6 | Ở màn B (danh sách bạn chưa cập nhật – giả lập bằng mở 2 tab, tab 1 đã hủy) bấm Hủy kết bạn với A ở tab 2 | Toast "Hai bạn không còn là bạn bè" | AC-6 |
| 7 | A gửi lời mời cho B, B chấp nhận | R1 mở lại trên cả hai máy | AC-8 |
| 8 | Seed A→B và B→A pending; A chấp nhận lời mời của B; B (màn cũ) bấm Từ chối lời mời của A | Dialog "Hai bạn đã là bạn bè" → "Hủy kết bạn" → SCR-08 mở sẵn dialog với A | AC-10 |
| 9 | Seed `blocks/B_A`, kết bạn lại A–B (Emulator / API) | R1 vẫn chỉ đọc | AC-9 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] `recomputeReadOnly` là hàm domain dùng chung, có unit test đủ 4 nhánh
- [ ] Index `idx_rooms_pair` khai báo; truy vấn chạy trên emulator
- [ ] Smoke e2e của T-009 (chat realtime) vẫn pass
- [ ] Demo M2 phần "hủy kết bạn (phòng chỉ đọc)" chạy được

## 7. Ghi chú
- `[ASSUMED → Q-047]` Chip "Chỉ đọc" ở SCR-03 làm trong task này (slices không gán rõ cho task nào).
- `[ASSUMED → Q-047]` Dialog "Hai bạn đã là bạn bè" (FLOW-04 A1) áp dụng cho cả SCR-09.A3 và SCR-02.A3, dùng chung một component.
- `[ASSUMED → Q-047]` Tin bị từ chối do `ROOM_READ_ONLY` hiện "Gửi thất bại" không có nút Gửi lại.
- `[ASSUMED → Q-047]` Cập nhật chỉ đọc "tức thời" kiểm bằng mắt / Playwright chờ ≤ 2 giây trên emulator (không có NFR riêng; tham chiếu mức NFR-02).
- **Đề xuất point:** checklist gồm 1 endpoint mới + sửa 4 endpoint cũ (createRoom, createMessage, accept, reject) + 4 điểm UI (SCR-08, SCR-05, SCR-03, dialog A1 trên SCR-09/SCR-02 kèm điều hướng). Ước lượng thực tế ~8. Giữ 5 trong file; đề xuất tách phần FLOW-04 A1 (reject `ALREADY_FRIENDS` + dialog + `?unfriend=`) thành task riêng 2 point, phần còn lại giữ 5.
