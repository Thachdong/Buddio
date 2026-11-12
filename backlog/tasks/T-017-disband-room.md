# T-017 · Giải tán phòng (dọn dữ liệu nền)

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-04 | M3 | 5 | T-016 | TODO |

## 1. Mục tiêu demo
Sau task này: **Host A mở Thông tin phòng → "Giải tán phòng" → đọc cảnh báo → xác nhận → về danh sách phòng với toast "Đã giải tán phòng"; B đang mở phòng thấy dialog "Phòng đã bị giải tán" → về danh sách, phòng biến mất với mọi thành viên ngay; sau vài giây Emulator UI không còn tin, thành viên, ảnh của phòng; B và C có thông báo "Phòng Hội cờ đã bị giải tán".**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-06.A6 | Giải tán phòng (host) |
| API | `deleteRoom` | `DELETE /rooms/{roomId}` → `202` |
| Việc nền | `purgeRoom` | Cloud Functions 2nd gen task queue (ADR-11) |
| Dữ liệu | TBL-07 | `status = deleted`, `deleted_at`; xóa document sau khi dọn |
| Dữ liệu | TBL-08, TBL-09 | xóa theo lô |
| Dữ liệu | TBL-10 | thông báo `room_disbanded` (giữ `room_name`) |
| Dữ liệu | TBL-14 | xóa `room_access/{roomId}` |
| Dữ liệu | Storage | xóa prefix `rooms/{roomId}/` |
| Rule | BR-18 | chỉ host |
| Rule | BR-19 | giải tán bất cứ lúc nào, xóa toàn bộ tin và ảnh |
| Phụ trợ | SUP-02 | thông báo "Phòng X đã bị giải tán" cho thành viên khác |
| Phụ trợ | SUP-08 | xóa ảnh |
| Phụ trợ | SUP-09 | đóng phòng trên màn mọi người |
| NFR | NFR-19 | biến mất khỏi màn ≤1 phút; xóa hẳn ≤24h (trên emulator: vài giây) |
| NFR | NFR-13 | chỉ host |
| Rule | Q-037 | thông báo giữ tên phòng |
| Flow | FLOW-09f bước 1–4 | happy path |

**Ngoài phạm vi:** host cuối cùng rời → xóa phòng (T-018, gọi lại `purgeRoom`); `purgeAccount` (T-026); xóa khỏi bản sao lưu (T-028); trang xem thông báo (T-024).

## 3. Việc cần làm
### UI
- [ ] SCR-06: nút "Giải tán phòng" (kiểu nguy hiểm) ở cuối, chỉ host.
- [ ] Dialog xác nhận 14: "Phòng {tên} cùng toàn bộ tin nhắn và ảnh sẽ bị xóa vĩnh viễn. Mọi thành viên nhận thông báo." Hủy / Giải tán; nút spinner khi gọi API.
- [ ] Thành công → SCR-03, toast "Đã giải tán phòng". `NOT_ROOM_HOST` → toast "Bạn không còn là host", ẩn nút host. `ROOM_NOT_FOUND` → về SCR-03 `[ASSUMED → Q-047]`.
- [ ] Phía thành viên khác đang mở SCR-05 / SCR-06: listener phòng bị từ chối (rules chỉ cho đọc `status == active`) → dialog 24 biến thể "Phòng đã bị giải tán" + "Về danh sách phòng". Phân biệt với bị kick bằng thông báo mới nhất có `ref_id = roomId` trong `users/{me}/notifications` (`room_disbanded` vs `room_member_kicked`); không xác định được → câu chung "Bạn không còn ở trong phòng này" `[ASSUMED → Q-047]`.
- [ ] SCR-03: phòng tự biến mất (query `status == active`).

### API / Backend
- [ ] `DELETE /api/rooms/{roomId}` (`deleteRoom`): phòng không có / đã `deleted` → `404 ROOM_NOT_FOUND`; mình không `active` → `403 NOT_ROOM_MEMBER`; không phải host → `403 NOT_ROOM_HOST` (BR-18).
- [ ] Transaction: `rooms.status = deleted`, `deleted_at = now`, `updated_at`; thông báo `room_disbanded` (`actor_uid = me`, `ref_id`, `room_name` = tên hiện tại hoặc tên hiển thị theo thành viên nếu `name` null `[ASSUMED → Q-047]`) cho mọi thành viên `active` trừ host (SUP-02, Q-037).
- [ ] Sau commit: xóa RTDB `room_access/{roomId}` và `typing/{roomId}`; enqueue task `purgeRoom({roomId})` qua `getFunctions().taskQueue('purgeRoom')`. Enqueue lỗi → retry 3 lần, log lỗi (chỉ roomId) `[ASSUMED → Q-047]`.
- [ ] Response `202 RoomDeleted {id, status: deleted, deletedAt}`.
- [ ] Cloud Function `purgeRoom` (thư mục `functions/`): idempotent — phòng không còn → kết thúc; phòng còn `active` → bỏ qua (không xóa nhầm) `[ASSUMED → Q-047]`; xóa `messages` theo lô ≤500, `members` theo lô ≤500, file Storage prefix `rooms/{roomId}/` (`bucket.deleteFiles({prefix})`), cuối cùng xóa document `rooms/{roomId}` `[ASSUMED → Q-047]`; cấu hình `retryConfig` (maxAttempts 5, backoff) và `rateLimits`.
- [ ] Hàm `enqueuePurgeRoom(roomId)` dùng chung để T-018 (host cuối rời) và T-026 gọi lại.

### Data
- [ ] Rules `rooms/{id}` đã yêu cầu `status == active` (T-008) → thêm test: thành viên đọc phòng `deleted` bị deny; `messages` của phòng `deleted` — đọc bị deny `[ASSUMED → Q-047]` cần bổ sung điều kiện `get(rooms/{id}).data.status == 'active'` vào rule `members` / `messages` nếu T-008 chưa có.
- [ ] `firebase.json`: bật emulator Functions + Storage + Cloud Tasks (task queue) cho môi trường local.
- [ ] Seed T-017: phòng "Hội cờ" (host A; B, C) với 120 tin `user` (để purge chạy >1 lô khi đặt lô nhỏ trong test) + 3 file ảnh trong Storage `rooms/{roomId}/…`.

### Khác
- [ ] Biến môi trường kích thước lô `PURGE_BATCH_SIZE` (mặc định 500; test đặt 50) `[ASSUMED → Q-047]`.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A host phòng "Hội cờ" (A, B, C); B đang mở SCR-05 của phòng; C ở SCR-03 | A mở SCR-06 → Giải tán phòng → xác nhận | A về SCR-03 với toast "Đã giải tán phòng"; trong ≤2 giây B thấy dialog "Phòng đã bị giải tán" → về SCR-03; phòng biến mất khỏi SCR-03 của A, B, C | FLOW-09f bước 1–3, SUP-09, NFR-19 |
| AC-2 | Như AC-1 | Kiểm emulator ngay sau API trả `202` | Response `{status: "deleted", deletedAt}`; `rooms.status = deleted`, `deleted_at` có giá trị; `users/B/notifications` và `users/C/notifications` mỗi người có 1 `room_disbanded` với `room_name = "Hội cờ"`; A không có; RTDB `room_access/{roomId}` không còn | FLOW-09f bước 2, 4, SUP-02, Q-037 |
| AC-3 | Như AC-1, phòng có 120 tin và 3 ảnh | Chờ task `purgeRoom` chạy (≤30 giây trên emulator) | Emulator không còn document nào trong `rooms/{roomId}/messages`, `rooms/{roomId}/members`, không còn `rooms/{roomId}`; Storage không còn file dưới `rooms/{roomId}/` | BR-19, SUP-08, NFR-19 |
| AC-4 | A mở dialog giải tán | A bấm Hủy | Không gọi API, phòng vẫn hoạt động | FLOW-09f bước 1 (xác nhận) |
| AC-5 | B là thành viên thường | B xem SCR-06; B gọi `deleteRoom` trực tiếp | Không có nút "Giải tán phòng"; API trả `403 NOT_ROOM_HOST`, phòng không đổi | BR-18, NFR-13 |
| AC-6 | D không ở phòng | D gọi `deleteRoom` | `403 NOT_ROOM_MEMBER` | NFR-13 |
| AC-7 | Phòng đã giải tán | A gọi `deleteRoom` lần nữa | `404 ROOM_NOT_FOUND` | ENT-06 |
| AC-8 | Phòng đã giải tán (trước khi purge xong) | B dùng SDK đọc `rooms/{id}` và `rooms/{id}/messages` | Bị từ chối (permission-denied) | BR-19, NFR-13 |
| AC-9 | `purgeRoom` đã chạy xong một lần | Task `purgeRoom` cùng `roomId` chạy lại (retry) | Kết thúc thành công, không lỗi, không xóa gì khác | ADR-11 (idempotent) |
| AC-10 | Phòng `active` khác (không bị giải tán) | Gọi `purgeRoom` với id phòng đó (test) | Không xóa dữ liệu nào | ADR-11 `[ASSUMED → Q-047]` |
| AC-11 | Phòng không đặt tên (hiển thị "B, C") | A giải tán | Thông báo `room_disbanded` có `room_name` là tên hiển thị "…" thay vì rỗng | Q-037 `[ASSUMED → Q-047]` |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Integration `deleteRoom` (emulator): 202, `rooms` deleted, thông báo cho B, C không cho A, `room_access` bị xóa, task được enqueue (mock / spy `taskQueue.enqueue`) | AC-1, AC-2 |
| Integration: thành viên thường → 403 `NOT_ROOM_HOST`; người ngoài → 403 `NOT_ROOM_MEMBER`; lần 2 → 404 | AC-5, AC-6, AC-7 |
| Integration `purgeRoom` handler gọi trực tiếp (Firestore + Storage emulator), `PURGE_BATCH_SIZE = 50`, 120 tin + 3 ảnh → mọi thứ bị xóa | AC-3 |
| Integration `purgeRoom` chạy 2 lần → lần 2 no-op; phòng `active` → no-op | AC-9, AC-10 |
| Integration (Functions + Cloud Tasks emulator): API enqueue thật → chờ tới khi `rooms/{id}` biến mất (poll ≤30s) | AC-3 |
| Rules test: thành viên đọc `rooms` / `messages` của phòng `deleted` → deny | AC-8 |
| Vitest hàm chọn nội dung dialog 24 (`room_disbanded` / `room_member_kicked` / không rõ) | AC-1 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context (A host, B đang mở phòng): A giải tán → A thấy toast + SCR-03; B thấy dialog "Phòng đã bị giải tán" → SCR-03 không còn phòng | AC-1 |
| Playwright: B (thành viên) mở SCR-06 → không có nút Giải tán | AC-5 |

### Dữ liệu seed / tiền điều kiện
- Emulator Auth, Firestore, RTDB, Storage, Functions (task queue) chạy cùng `firebase emulators:start`.
- Phòng "Hội cờ": host A, B, C; 120 tin `user` + 3 ảnh đã nằm ở `rooms/{roomId}/{messageId}/…`; D không trong phòng.
- Phòng không tên (A, B, C) cho AC-11.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | B mở SCR-06 phòng "Hội cờ" | Không có nút Giải tán | AC-5 |
| 2 | A mở SCR-06 → Giải tán → Hủy | Không đổi gì | AC-4 |
| 3 | B mở SCR-05, C ở SCR-03; A Giải tán → xác nhận | A toast + SCR-03; B dialog "Phòng đã bị giải tán"; phòng biến mất ở C | AC-1 |
| 4 | Emulator UI ngay sau đó | `status = deleted`, thông báo B, C có `room_name`; RTDB không còn `room_access` | AC-2 |
| 5 | Chờ ~30 giây, làm mới Emulator UI Firestore + Storage | Không còn tin, thành viên, document phòng, ảnh | AC-3 |
| 6 | curl `deleteRoom` lại bằng token A; token D | 404; 403 | AC-6, AC-7 |
| 7 | Giải tán phòng không tên; xem `notifications` | `room_name` = tên hiển thị | AC-11 |
| 8 | Xem log Functions emulator | Không có email / nội dung tin trong log; task không báo lỗi | AC-9 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] `purgeRoom` có test idempotent + test xử lý nhiều lô
- [ ] Emulator Functions / Cloud Tasks / Storage chạy trong CI (GitHub Actions) và trong `npm run emulators`
- [ ] Rules test: phòng `deleted` không đọc được
- [ ] `enqueuePurgeRoom` export để T-018, T-026 dùng lại

## 7. Ghi chú
- `[ASSUMED → Q-047]` Phân biệt "bị kick" và "phòng giải tán" phía client bằng thông báo mới nhất trong `users/{me}/notifications` có `ref_id = roomId`, vì rules làm listener phòng bị từ chối như nhau ở cả hai trường hợp.
- `[ASSUMED → Q-047]` `purgeRoom` xóa luôn document `rooms/{roomId}` ở bước cuối (spec chỉ nêu tin, thành viên, ảnh); thông báo đã giữ `room_name` nên không cần document phòng. Nếu muốn giữ document `deleted` làm dấu vết → sửa ở `db-design`.
- `[ASSUMED → Q-047]` Phòng không tên → `room_name` của thông báo = tên hiển thị theo thành viên lúc giải tán.
- `[ASSUMED → Q-047]` Firebase Emulator Suite hỗ trợ task queue functions (Cloud Tasks emulator); nếu phiên bản `firebase-tools` không hỗ trợ, test tích hợp gọi trực tiếp handler `purgeRoom` và ghi chú lại.
- Rủi ro point: cấu hình Functions + Cloud Tasks emulator lần đầu trong dự án nằm trong task này; nếu tốn hơn dự kiến có thể cần 8.
