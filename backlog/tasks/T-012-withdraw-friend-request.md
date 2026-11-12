# T-012 · Thu hồi lời mời đã gửi

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-02 | M2 | 2 | T-006 | TODO |

## 1. Mục tiêu demo
Sau task này: **A tra email B (đang chờ) → thẻ "Đang chờ phản hồi" có nút "Thu hồi lời mời" → bấm → thẻ "Đã thu hồi lời mời", toast; lời mời biến mất khỏi tab Đã nhận của B ngay. Hoặc A vào Lời mời kết bạn → tab Đã gửi → "Thu hồi".** Thu hồi đúng lúc B vừa chấp nhận → A thấy "Hai bạn đã là bạn bè".

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-07.A3 | Nút "Thu hồi lời mời" ở thẻ c |
| Thao tác | SCR-09.A5 | Nút "Thu hồi" ở tab Đã gửi |
| API | `withdrawFriendRequest` | `POST /friend-requests/{requestId}/withdraw` |
| Dữ liệu | TBL-04 | `status = withdrawn`, `responded_at`, `expire_at` |
| Rule | BR-08 | thu hồi khi còn đang chờ |
| Flow | FLOW-03 A3, E2 | |

**Ngoài phạm vi:** dọn thông báo `friend_request_received` của lời mời đã thu hồi (thông báo vẫn còn, T-024 hiển thị "Nội dung không còn hiệu lực").

## 3. Việc cần làm
### UI
- [ ] SCR-07 thẻ c: thêm nút phụ "Thu hồi lời mời" (dùng `requestId` từ `pending_sent`). Thành công → thẻ "Đã thu hồi lời mời" + toast "Đã thu hồi lời mời"; bấm Tìm lại được ngay.
- [ ] SCR-09 tab Đã gửi: nút "Thu hồi" mỗi hàng, **không** hỏi xác nhận (Q-044); thành công → toast, hàng biến mất (listener).
- [ ] Lỗi `ALREADY_FRIENDS` → SCR-07: thẻ b "Hai bạn đã là bạn bè"; SCR-09: toast "Hai bạn đã là bạn bè". Lỗi `FRIEND_REQUEST_NOT_PENDING` → toast "Lời mời không còn hiệu lực" `[ASSUMED → Q-047]`. Spinner trên nút khi đang gửi.

### API / Backend
- [ ] `POST /api/friend-requests/{requestId}/withdraw`: không tồn tại → `404 FRIEND_REQUEST_NOT_FOUND`; `from_uid ≠ me` → `403 FRIEND_REQUEST_FORBIDDEN`.
- [ ] Transaction: `pending` → `withdrawn`, `responded_at = now`, `expire_at = now + ended_request_ttl_days`; trả `200 FriendRequest`.
- [ ] Không `pending`: `accepted` (hoặc đã có `friendships` của cặp) → `409 ALREADY_FRIENDS` (E2 – chấp nhận thắng); còn lại → `409 FRIEND_REQUEST_NOT_PENDING`.
- [ ] Không tạo thông báo cho người nhận `[ASSUMED → Q-047]` (spec không có loại thông báo thu hồi).

### Data
- [ ] Không đổi rules / index.

### Khác
- [ ] —

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A→B pending; A tra email B (thẻ c) | A bấm "Thu hồi lời mời" | Thẻ "Đã thu hồi lời mời", toast; doc lời mời `withdrawn`, có `responded_at`, `expire_at ≈ +30 ngày` | FLOW-03 A3, BR-08 |
| AC-2 | A→B pending, B đang mở SCR-09 tab Đã nhận | A thu hồi (từ SCR-07 hoặc SCR-09) | Hàng của A biến mất khỏi B không cần tải lại; badge Bạn bè của B giảm | SCR-09.A0 (realtime) |
| AC-3 | A→B pending | A mở tab Đã gửi, bấm "Thu hồi" | Không có dialog; hàng biến mất, toast "Đã thu hồi lời mời" | SCR-09.A5, Q-044 |
| AC-4 | A vừa thu hồi lời mời tới B | A tra email B lại | Thẻ e (gửi lại được ngay, không cooldown) | BR-08, BR-10 (chỉ áp khi bị từ chối) |
| AC-5 | B đã chấp nhận lời mời của A nhưng màn của A còn thẻ c | A bấm "Thu hồi lời mời" | API `409 ALREADY_FRIENDS`; thẻ đổi sang "Hai bạn đã là bạn bè"; `friendships` còn nguyên | FLOW-03 E2, Q-029 |
| AC-6 | Lời mời A→B đã `rejected` / `closed` | A gọi thu hồi | `409 FRIEND_REQUEST_NOT_PENDING`, không đổi dữ liệu | BR-08 |
| AC-7 | A→B pending | B hoặc C gọi thu hồi | `403 FRIEND_REQUEST_FORBIDDEN`; id không tồn tại → `404` | NFR-13 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Handler (emulator): pending → withdrawn + `responded_at` + `expire_at` | AC-1 |
| `lookupEmail` sau withdraw → `found` | AC-4 |
| Handler: lời mời `accepted` → 409 `ALREADY_FRIENDS`; `rejected`/`closed` → 409 `FRIEND_REQUEST_NOT_PENDING` | AC-5, AC-6 |
| Chạy song song accept (T-006) và withdraw 20 lần trên emulator → mỗi lần đúng một bên thành công; khi accept thắng, withdraw trả `ALREADY_FRIENDS`; không có trạng thái lai | AC-5 |
| Handler: người gọi không phải `from_uid` → 403; id sai → 404 | AC-7 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context: A gửi lời mời → B mở tab Đã nhận → A thu hồi ở SCR-07 → hàng biến mất ở B | AC-1, AC-2 |
| Playwright: A có thẻ c mở sẵn, B chấp nhận → A bấm Thu hồi → thấy "Hai bạn đã là bạn bè" | AC-5 |

### Dữ liệu seed / tiền điều kiện
- A `an@test.local`, B `binh.tran@test.local` (`anonymous=false`); lời mời A→B pending.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | B mở Lời mời → Đã nhận (thấy A). A tra email B → "Thu hồi lời mời" | A thấy "Đã thu hồi lời mời"; hàng A biến mất ở B | AC-1, AC-2 |
| 2 | A tra lại email B | Thẻ e, gửi lại được | AC-4 |
| 3 | A gửi lại, vào Lời mời → Đã gửi → "Thu hồi" | Không dialog, hàng biến mất, toast | AC-3 |
| 4 | A gửi lại, tra email B (thẻ c). B chấp nhận. A bấm "Thu hồi lời mời" | "Hai bạn đã là bạn bè" | AC-5 |
| 5 | Dùng REST client gọi withdraw với token của B cho lời mời A→B | 403 | AC-7 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Test chạy song song accept/withdraw trên emulator pass ổn định (không flaky)

## 7. Ghi chú
- `[ASSUMED → Q-047]` "Chấp nhận thắng" (Q-029) hiểu theo thứ tự commit transaction: accept commit trước → withdraw trả `ALREADY_FRIENDS`; withdraw commit trước → accept trả `FRIEND_REQUEST_NOT_PENDING` (T-006 AC-9). Không thêm cơ chế ưu tiên accept khi withdraw đã commit.
- `[ASSUMED → Q-047]` Thu hồi không tạo thông báo và không xóa thông báo `friend_request_received` đã có.
- `[ASSUMED → Q-047]` `FRIEND_REQUEST_NOT_PENDING` khi thu hồi → toast "Lời mời không còn hiệu lực".
- Point 2 giữ nguyên.
