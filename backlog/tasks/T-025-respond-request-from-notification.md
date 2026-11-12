# T-025 · Phản hồi lời mời ngay trên thông báo

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-06 | M4 | 2 | T-024, T-014 | TODO |

## 1. Mục tiêu demo
Sau task này: **B mở tab Thông báo → thông báo "A đã gửi lời mời kết bạn" có nút "Chấp nhận", "Từ chối" và ⋮ → "Chặn" → bấm "Chấp nhận" → các nút biến mất, toast "Hai bạn đã là bạn bè", A và B là bạn (A nhận thông báo đã thành bạn). Nếu A vừa thu hồi lời mời → B bấm nút thấy "Nội dung không còn hiệu lực".**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-10.A4 | Chấp nhận ngay từ thông báo |
| Thao tác | SCR-10.A5 | Từ chối ngay từ thông báo |
| Thao tác | SCR-10.A6 | Chặn ngay từ thông báo (dialog xác nhận như SCR-09 #10) |
| API | `acceptFriendRequest`, `rejectFriendRequest`, `createBlock` | đã có từ T-006 / T-014 — chỉ gọi lại |
| Dữ liệu | TBL-04 (đọc, listener lời mời đang chờ), TBL-10 (đọc) | Không thêm bảng / field |
| Rule | BR-09, BR-11, BR-14 | |
| Phụ trợ | SUP-01 | Nút inline trên thông báo lời mời |
| Flow | FLOW-04 (vào từ thông báo): happy path, A1, A2, A3, E1 | |
| Flow | FLOW-12 bước 5 | |

**Ngoài phạm vi:** logic server chấp nhận / từ chối / chặn (T-006, T-014 — không sửa); hủy kết bạn (T-013, chỉ điều hướng tới).

## 3. Việc cần làm
### UI
- [ ] Hàng `friend_request_received` (SCR-10 thành phần 5): chỉ hiện "Chấp nhận" (chính), "Từ chối" (phụ), ⋮ → "Chặn" khi `ref_id` nằm trong tập lời mời đã nhận đang `pending` — lấy từ listener dùng chung LAYOUT.A3 (`friend_requests` where `to_uid == me` && `status == pending`). Lời mời rời `pending` → nút tự biến mất (realtime).
- [ ] Bấm nút không kích hoạt điều hướng của hàng (SCR-10.A3) (`stopPropagation`); vẫn đánh dấu thông báo đã đọc (`updateNotification`) `[ASSUMED → Q-047]`.
- [ ] Đang gửi: spinner trên nút được bấm, khóa 2 nút còn lại của hàng (như SCR-09 mục 4).
- [ ] Chấp nhận → `acceptFriendRequest` → toast "Hai bạn đã là bạn bè"; nút biến mất. `FRIEND_REQUEST_NOT_PENDING` / `FRIEND_REQUEST_NOT_FOUND` → toast "Nội dung không còn hiệu lực".
- [ ] Từ chối → `rejectFriendRequest` → toast "Đã từ chối". `ALREADY_FRIENDS` → dialog "Hai bạn đã là bạn bè" (dùng lại component SCR-09 #9: Đóng / "Hủy kết bạn" → SCR-08 mở sẵn dialog hủy kết bạn với `details[0].friendUid`). `FRIEND_REQUEST_NOT_PENDING` → toast "Nội dung không còn hiệu lực".
- [ ] ⋮ → "Chặn" → dialog xác nhận (dùng lại SCR-09 #10: "Chặn {tên}? Lời mời này sẽ bị đóng. Hai bạn sẽ không tìm thấy nhau qua email và không nhắn tin cho nhau được. {tên} không được báo.") → `createBlock {blockedUid: actor_uid}` → toast "Đã chặn {tên}"; nút biến mất. `ALREADY_BLOCKED` → toast "Bạn đã chặn người này". Hủy dialog → không đổi gì.
- [ ] Lỗi mạng / 5xx → toast "Không kết nối được, thử lại", nút mở khóa.

### API / Backend
- [ ] Không có endpoint mới. Kiểm `x-screens` của 3 operation đã gồm `SCR-10.A4/A5/A6` (api-contract đã có) — không sửa logic.

### Data
- [ ] Không thay đổi. Dùng lại rules `friend_requests` (đọc khi `to_uid == me`) từ T-006.

### Khác
- [ ] Không có chữ mới ngoài toast đã có ở SCR-09 / SCR-10 (dùng lại khóa từ điển).

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A gửi lời mời `pending` tới B; B có thông báo `friend_request_received` | B mở tab Thông báo | Hàng "A đã gửi lời mời kết bạn" có "Chấp nhận", "Từ chối", ⋮ "Chặn" | SUP-01, SCR-10 thành phần 5 |
| AC-2 | Như AC-1 | B bấm "Chấp nhận" | `acceptFriendRequest 200`; toast "Hai bạn đã là bạn bè"; các nút trên hàng biến mất; `friendships/{A_B}` tồn tại; lời mời `accepted`; A có thông báo `friend_request_accepted`; B vẫn ở SCR-10 (không điều hướng) | FLOW-04 C1, C4, BR-09, BR-11 |
| AC-3 | Như AC-1 | B bấm "Từ chối" | `rejectFriendRequest 200`; toast "Đã từ chối"; nút biến mất; lời mời `rejected`; A có thông báo `friend_request_rejected` | FLOW-04 A2, BR-11 |
| AC-4 | Như AC-1 | B bấm ⋮ → "Chặn" → xác nhận | `createBlock 201`; toast "Đã chặn A"; nút biến mất; có `blocks/B_A`; lời mời `closed (blocked)`; A không nhận thông báo | FLOW-04 A3, BR-14 |
| AC-5 | Như AC-4 | Ở dialog chặn bấm Hủy | Không gọi API, nút vẫn còn | FLOW-07a (hủy), SCR-09 #10 |
| AC-6 | Lời mời của A đã bị A thu hồi nhưng hàng vẫn còn nút (listener chưa kịp cập nhật) | B bấm "Chấp nhận" | API `409 FRIEND_REQUEST_NOT_PENDING`; toast "Nội dung không còn hiệu lực"; nút biến mất sau khi listener cập nhật | FLOW-04 E1, SCR-10.A4 Khi lỗi |
| AC-7 | B đã gửi lời mời cho A và A đã chấp nhận (lời mời A→B `closed (became_friends)`) nhưng hàng vẫn còn nút | B bấm "Từ chối" | `409 ALREADY_FRIENDS`; dialog "Hai bạn đã là bạn bè" với nút "Hủy kết bạn"; bấm "Hủy kết bạn" → SCR-08 mở dialog hủy kết bạn với A | FLOW-04 A1, BR-09 |
| AC-8 | Lời mời đã `accepted` / `rejected` / `withdrawn` / `closed` | B mở tab Thông báo | Hàng thông báo lời mời **không** có nút | SCR-10 thành phần 5 |
| AC-9 | B đã chặn A từ nơi khác (race) | B bấm "Chặn" trên thông báo → xác nhận | `409 ALREADY_BLOCKED`; toast "Bạn đã chặn người này" | FLOW-07a A1 |
| AC-10 | Như AC-1 | B bấm "Chấp nhận" | Thông báo được đánh dấu đã đọc, badge giảm 1 | SCR-10.A1 `[ASSUMED → Q-047]` |
| AC-11 | Như AC-1 | B bấm "Chấp nhận" | Trong lúc chờ: spinner trên "Chấp nhận", "Từ chối" và ⋮ bị khóa | SCR-09 mục 4 Loading |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Component test hàng thông báo: `ref_id` ∈ tập pending → có 3 nút; ∉ → không có nút | AC-1, AC-8 |
| Component test: bấm nút gọi đúng operation (mock fetch), không gọi điều hướng hàng, gọi `updateNotification`; khóa nút khi đang chờ | AC-2, AC-3, AC-10, AC-11 |
| Component test map lỗi: `FRIEND_REQUEST_NOT_PENDING` → toast "Nội dung không còn hiệu lực"; `ALREADY_FRIENDS` → dialog có "Hủy kết bạn"; `ALREADY_BLOCKED` → toast | AC-6, AC-7, AC-9 |
| Server: không có test mới (đã phủ ở T-006, T-014); chạy lại bộ test của 3 operation để chắc không hồi quy | AC-2, AC-3, AC-4 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Seed A→B pending + thông báo → B mở Thông báo → "Chấp nhận" → toast, nút biến mất → tab Bạn bè có A | AC-1, AC-2 |
| Seed A→B pending → B mở Thông báo → test dùng Admin SDK đặt lời mời `withdrawn` và chặn cập nhật listener bằng `page.route` trả `409 FRIEND_REQUEST_NOT_PENDING` cho request accept `[ASSUMED → Q-047]` → B bấm "Chấp nhận" → toast "Nội dung không còn hiệu lực" | AC-6 |

### Dữ liệu seed / tiền điều kiện
- A `an@gmail.com`, B `binh@gmail.com`, C `chi@gmail.com` (cả 3 active, chưa là bạn).
- `friend_requests`: A→B `pending` (in_app) + thông báo `friend_request_received` cho B; C→B `pending` + thông báo.
- Bộ riêng cho AC-7: B→A `accepted` (đã là bạn), A→B `closed (became_friends)` + thông báo cũ cho B.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Đăng nhập B (375×812) → tab Thông báo | Hàng lời mời của A và C có 3 nút | AC-1 |
| 2 | Hàng của A: bấm "Chấp nhận" | Spinner, khóa nút; rồi toast "Hai bạn đã là bạn bè", nút biến mất; badge −1 | AC-2, AC-10, AC-11 |
| 3 | Đăng nhập A ở trình duyệt khác → tab Thông báo | "B và bạn đã trở thành bạn bè" | AC-2 |
| 4 | Ở B, hàng của C: ⋮ → "Chặn" → Hủy | Không đổi gì | AC-5 |
| 5 | ⋮ → "Chặn" → xác nhận | Toast "Đã chặn Chi", nút biến mất; Firestore có `blocks/B_C`, lời mời `closed` | AC-4 |
| 6 | Seed lời mời mới D→B; ở B mở Thông báo; ở D (trình duyệt khác) thu hồi rồi B bấm "Chấp nhận" thật nhanh (hoặc tắt mạng B lúc D thu hồi rồi bật lại và bấm) | Toast "Nội dung không còn hiệu lực" hoặc nút đã biến mất trước khi bấm | AC-6, AC-8 |
| 7 | Seed bộ AC-7, B bấm "Từ chối" trên thông báo cũ (nếu nút còn do dữ liệu seed lời mời `pending` giả) | Dialog "Hai bạn đã là bạn bè" → "Hủy kết bạn" mở SCR-08 với dialog hủy kết bạn | AC-7 |
| 8 | Lời mời E→B; B bấm "Từ chối" | Toast "Đã từ chối", E nhận thông báo từ chối | AC-3 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Dùng lại component dialog / toast của SCR-09 (không nhân bản code)
- [ ] Bộ test server của `acceptFriendRequest`, `rejectFriendRequest`, `createBlock` vẫn xanh

## 7. Ghi chú
- `[ASSUMED → Q-047]` Bấm nút inline cũng đánh dấu thông báo đã đọc.
- `[ASSUMED → Q-047]` E2E giả lập race (AC-6) bằng `page.route` vì listener realtime thường ẩn nút trước khi người dùng kịp bấm; test tay bước 6 kiểm luồng thật.
- AC-7 khó dựng tự nhiên (lời mời đã `closed` thì nút đã ẩn); chỉ xảy ra khi listener trễ — phủ bằng component test + test tay với dữ liệu seed.
