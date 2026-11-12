# T-021 · Đã xem, số tin chưa đọc & tóm tắt phòng

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-05 | M3 | 5 | T-009 | TODO |

## 1. Mục tiêu demo
Sau task này: **A gửi 3 tin; B mở danh sách phòng SCR-03 thấy hàng phòng in đậm với tin cuối "A: …" + badge "3", tab Phòng có badge tổng; B mở phòng → số về 0; A thấy ảnh nhỏ của B dưới tin cuối (đã xem); bấm "Xem ai đã xem" trên tin → danh sách đã xem / chưa xem.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-05.A2 | Đánh dấu đã xem khi mở phòng / có tin mới hiện |
| Thao tác | SCR-03.A1 | Đếm tin chưa đọc mỗi phòng |
| Thao tác | LAYOUT.A3 | Phần badge tổng tin chưa đọc ở tab Phòng (phần lời mời đã làm ở T-006) |
| API | `markRoomAsRead` | `POST /rooms/{roomId}/read`, body `{upToMessageId?}` |
| Dữ liệu | TBL-08 `members.last_read_at` | Ghi (chỉ tăng) |
| Dữ liệu | TBL-07 `rooms.last_message` | Đọc, hiển thị tóm tắt |
| Dữ liệu | TBL-09 | `count()` aggregation; thêm composite index (xem Data) |
| Rule | BR-26 | Đã xem luôn bật, hiện thành viên đã xem |
| Phụ trợ | SUP-04 | Tóm tắt phòng & số chưa đọc |
| NFR | NFR-02, NFR-03 | Đã xem P95 ≤2s; danh sách phòng nhanh |
| Flow | FLOW-10a bước 1, 3, 9–10 | |
| Khác | Q-044 | debounce, "99+", tin cuối hết hạn → "Không có tin nhắn" |

**Ngoài phạm vi:** ẩn tin hết hạn theo hẹn giờ trên màn chat (T-023 — task này chỉ xử lý xem trước tin cuối đã hết hạn lúc render); chấm online ở hàng phòng (T-022).

## 3. Việc cần làm
### UI
- [ ] SCR-05: gọi `markRoomAsRead({upToMessageId: tin mới nhất đang hiện})` khi mở phòng và khi có tin mới hiện lúc tab đang visible (`document.visibilityState`), debounce 1 giây `[ASSUMED → Q-047]`; lỗi → bỏ qua, thử lại lần sau.
- [ ] Đã xem (component 12): với từng thành viên `active` khác người gửi, tìm tin mới nhất có `created_at ≤ last_read_at` → hiện avatar nhỏ của họ dưới tin đó; tối đa 5 avatar + "+n"; cập nhật realtime qua listener `members`.
- [ ] Menu tin (component 20): thêm mục "Xem ai đã xem" cho mọi tin `kind = user` (tin của mình và người khác) → sheet "Đã xem (n)" (ảnh + tên) và "Chưa xem: …" (component 21); người gửi không tính.
- [ ] SCR-03 hàng phòng: xem trước tin cuối theo `rooms.last_message`: "Bạn: …" / "{Tên}: {text_preview}" / "Đã gửi n ảnh" / "Tin nhắn đã thu hồi" / chuỗi tin hệ thống / người gửi đã xóa → "Người dùng đã xóa: …"; `last_message.expire_at ≤ now` → "Không có tin nhắn"; in đậm khi có chưa đọc.
- [ ] Thời gian hàng phòng: hôm nay "HH:mm", hôm qua "Hôm qua", trong 7 ngày "T2…CN", cũ hơn "dd/MM" theo múi giờ thiết bị.
- [ ] Badge số chưa đọc (component 8): >99 → "99+"; 0 → ẩn.
- [ ] Tính lại số chưa đọc của một phòng khi `rooms.last_message_at` hoặc `members/{me}.last_read_at` thay đổi (aggregation `count()` không nghe realtime được) `[ASSUMED → Q-047]`.
- [ ] LAYOUT.A3: badge tab Phòng = tổng số chưa đọc các phòng (hiện "99+" khi >99).

### API / Backend
- [ ] Handler `POST /api/rooms/[roomId]/read` (`markRoomAsRead`): Zod `ReadMarkerUpdate`; phòng không tồn tại / `deleted` → `404 ROOM_NOT_FOUND`; không phải thành viên `active` → `403 NOT_ROOM_MEMBER`; có `upToMessageId` mà tin không tồn tại → `404 MESSAGE_NOT_FOUND`.
- [ ] Transaction: `last_read_at = max(hiện tại, created_at của upToMessageId | now)`; chỉ tăng; phòng chỉ đọc vẫn ghi được; trả `{roomId, lastReadAt}`.
- [ ] Bỏ ghi khi giá trị không đổi (tiết kiệm ghi).

### Data
- [ ] Truy vấn đếm: `rooms/{id}/messages` where `kind == "user"` and `created_at > lower` → `count()`, với `lower = last_read_at` (phòng lâu dài) hoặc `max(last_read_at, now − ttl_days)` (phòng ngắn hạn, loại tin đã hết hạn vì `expire_at = created_at + ttl_days`) `[ASSUMED → Q-047]`. Tin của chính mình tự loại vì `createMessage` đặt `last_read_at` của người gửi = `created_at`.
- [ ] `firestore.indexes.json`: composite index `messages (kind ASC, created_at ASC)` scope collection `[ASSUMED → Q-047]` (chưa có trong `database.md` – xem Ghi chú).
- [ ] Rules: không đổi (thành viên đã đọc được `members`, `messages` từ T-009).

### Khác
- [ ] Hàm thuần `computeSeenBy(members, messages)`, `formatRoomPreview(lastMessage, me, profiles, now)`, `formatRoomTime(ts, now)`, `formatBadge(n)` có unit test.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A, B trong phòng P, B đang ở SCR-03 | A gửi 3 tin, tin cuối "Tối nay chơi không?" | Hàng P của B lên đầu danh sách, in đậm, "A: Tối nay chơi không?", badge "3"; tab Phòng có badge 3 (cộng với phòng khác nếu có) | FLOW-10a bước 9, SUP-04, SCR-03.A1, LAYOUT.A3 |
| AC-2 | Như AC-1 | B mở P | `members/B.last_read_at` = `created_at` tin cuối; quay lại SCR-03: badge P ẩn, hàng không in đậm; badge tab giảm 3 | FLOW-10a bước 3, SCR-05.A2 |
| AC-3 | A đang mở P | B mở P | Dưới tin cuối của A xuất hiện avatar nhỏ của B trong ≤2 giây | BR-26, FLOW-10a bước 10, NFR-02 |
| AC-4 | Phòng 7 người, 6 người đã xem tin cuối | A xem | Hiện 5 avatar + "+1" | SCR-05 component 12 |
| AC-5 | P có 3 thành viên khác A, 2 người đã xem tin X của A | A mở menu tin X → "Xem ai đã xem" | Sheet "Đã xem (2)" với ảnh + tên 2 người, "Chưa xem: {tên người còn lại}"; A không có trong danh sách | BR-26 |
| AC-6 | B có 120 tin chưa đọc trong P (seed) | B mở SCR-03 | Badge P "99+" | Q-044 |
| AC-7 | Tin hệ thống mới (vd "A đã thêm C") sau `last_read_at` của B | B xem SCR-03 | Badge không tính tin hệ thống; xem trước hiện "A đã thêm C" | SCR-03 component 6, 8 |
| AC-8 | Phòng ngắn hạn 1 ngày, tin cuối có `expire_at` đã qua (seed) | B xem SCR-03 | Xem trước "Không có tin nhắn", badge không đếm tin đã hết hạn | Q-044, SUP-04 |
| AC-9 | Tin cuối do người dùng đã xóa gửi / tin cuối do B gửi / tin cuối chỉ có ảnh | B xem SCR-03 | "Người dùng đã xóa: …" / "Bạn: …" / "{Tên}: Đã gửi 2 ảnh" | SCR-03 component 6, BR-28 |
| AC-10 | Tin cuối gửi hôm nay 09:05 / hôm qua / 3 ngày trước (thứ Hai) / 10 ngày trước | B xem SCR-03 | "09:05" / "Hôm qua" / "T2" / "dd/MM" | SCR-03 component 7, NFR-24 |
| AC-11 | `members/B.last_read_at` = T2 | Gọi `markRoomAsRead` với tin có `created_at` = T1 < T2 | `last_read_at` vẫn là T2 (không lùi) | api-contract `markRoomAsRead` |
| AC-12 | C không phải thành viên P / P không tồn tại / `upToMessageId` không tồn tại | Gọi `markRoomAsRead` | `403 NOT_ROOM_MEMBER` / `404 ROOM_NOT_FOUND` / `404 MESSAGE_NOT_FOUND` | BR-20 |
| AC-13 | Phòng 2 người A–B chỉ đọc | B mở phòng | `markRoomAsRead` thành công, badge về 0 | api-contract |
| AC-14 | B có 30 phòng, mỗi phòng 0–150 tin chưa đọc (seed) | B mở SCR-03 (local + emulator) | Danh sách + đủ badge hiện ≤1,5 giây | NFR-03 `[ASSUMED → Q-047]` áp cho danh sách phòng |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `markRoomAsRead` (emulator): mở với `upToMessageId` → `last_read_at` = `created_at`; không body → now; giá trị nhỏ hơn → không lùi | AC-2, AC-11 |
| Lỗi: không thành viên 403; phòng không có 404; tin không có 404; phòng `read_only` → 200 | AC-12, AC-13 |
| Truy vấn đếm trên emulator: 3 tin user + 1 tin hệ thống sau `last_read_at` → 3; phòng ngắn hạn có tin quá hạn → không đếm | AC-1, AC-7, AC-8 |
| `computeSeenBy`: avatar đặt dưới tin mới nhất ≤ `last_read_at`, loại người gửi, 5 + "+n" | AC-3, AC-4, AC-5 |
| `formatRoomPreview`: bản thân, người khác, ảnh, thu hồi, hệ thống, người đã xóa, hết hạn | AC-8, AC-9 |
| `formatRoomTime` với đồng hồ giả (Vitest fake timers) | AC-10 |
| `formatBadge`: 0 ẩn, 99, 100 → "99+" | AC-6 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context: A gửi 3 tin → B thấy badge 3 + tab badge → B mở phòng → A thấy avatar B dưới tin cuối → B quay lại badge ẩn | AC-1, AC-2, AC-3 |
| A mở "Xem ai đã xem" trên tin của mình → thấy đúng danh sách | AC-5 |

### Dữ liệu seed / tiền điều kiện
- Seed T-009; thêm phòng 7 người (A + 6 bạn), phòng có 120 tin chưa đọc của B, phòng ngắn hạn có tin cuối đã hết hạn, phòng có tin cuối của người đã xóa, 30 phòng cho B để đo AC-14.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A mở P, gửi 3 tin; B ở danh sách phòng | Hàng P in đậm, "A: …", badge 3; tab Phòng badge | AC-1 |
| 2 | B mở P | A thấy avatar B dưới tin cuối ≤2s | AC-3 |
| 3 | B quay lại danh sách | Badge P ẩn, chữ không đậm | AC-2 |
| 4 | A nhấn giữ tin của mình → Xem ai đã xem | "Đã xem (1)": B | AC-5 |
| 5 | B mở phòng seed 120 tin | Trước khi mở: "99+" | AC-6 |
| 6 | Xem hàng phòng ngắn hạn có tin cuối hết hạn, phòng tin cuối người đã xóa, phòng tin cuối là ảnh | Đúng chuỗi như AC-8, AC-9 | AC-8, AC-9 |
| 7 | Xem cột thời gian các phòng seed với ngày khác nhau | Đúng định dạng | AC-10 |
| 8 | Mở phòng 7 người | 5 avatar + "+1" | AC-4 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Index `messages (kind, created_at)` khai báo trong `firestore.indexes.json` và truy vấn đếm chạy trên emulator
- [ ] Số đo AC-14 ghi vào mô tả PR

## 7. Ghi chú
- `[ASSUMED → Q-047]` Debounce `markRoomAsRead` = 1 giây (theo api-contract) thay vì 2 giây (scr-05) để giữ NFR-02 ≤2 giây cho "đã xem". Spec đang lệch giữa hai file → cần chốt ở Phase 3.
- `[ASSUMED → Q-047]` Loại tin hết hạn khỏi số đếm bằng cận dưới `now − ttl_days` (không cần lọc `expire_at` trong query). Composite index `messages (kind, created_at)` **chưa có** trong `specs/database.md` / `database-design.md` 4.2 → đề xuất bổ sung ở Phase 3 (db-design).
- `[ASSUMED → Q-047]` `count()` không nghe realtime → tính lại khi `last_message_at` / `last_read_at` đổi; chi phí: 1 aggregation / phòng / thay đổi.
- `[ASSUMED → Q-047]` NFR-03 (≤1,5s) áp cả cho danh sách phòng kèm badge, đo trên local + emulator.
- Point 5 giữ nguyên.
