# T-009 · Nhắn tin chữ realtime

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-05 | M1 | 5 | T-008 | TODO |

## 1. Mục tiêu demo
Sau task này: **A (thành viên phòng) mở phòng chat SCR-05, gõ "Chào" và bấm Gửi, thấy tin hiện ngay; B ở máy khác thấy tin trong ≤1 giây, cuộn lên tải được tin cũ; khi A mất mạng, tin hiện "Gửi thất bại · Gửi lại", có mạng lại bấm Gửi lại thì B thấy đúng 1 tin; tin dài hơn 1000 ký tự không gửi được.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-05.A0 | Listener phòng, thành viên `active`, 50 tin mới nhất; `profiles/{uid}` (get) |
| Thao tác | SCR-05.A1 | Tải thêm 50 tin cũ hơn khi cuộn lên |
| Thao tác | SCR-05.A6 | Gửi tin **chỉ chữ** |
| Thao tác | SCR-05.A7 | Gửi lại tin lỗi (cùng `messageId`) |
| API | `createMessage` | `PUT /rooms/{roomId}/messages/{messageId}`, body `{text}` (ảnh ở T-019) |
| Dữ liệu | TBL-09 `messages` | Tạo mới (ghi `kind = user`) + Security Rules đọc |
| Dữ liệu | TBL-07 `rooms` | Ghi `last_message`, `last_message_at` |
| Dữ liệu | TBL-08 `members` | Ghi `last_read_at` của người gửi; rules đọc |
| Dữ liệu | TBL-02 `profiles` | Chỉ đọc (tên, ảnh, `status`) |
| Rule | BR-20 | Chỉ thành viên `active` đọc / gửi |
| Rule | BR-21 | Phần chữ: có chữ, ≤1000 ký tự (Q-043) |
| Rule | BR-23 | Mã hóa mặc định Google + TLS (ADR-07), không làm thêm |
| Rule | BR-16 | Ghi `expire_at` cho phòng ngắn hạn |
| Rule | BR-28 | Người gửi đã xóa → "Người dùng đã xóa" |
| Phụ trợ | SUP-09 | Firestore listener |
| NFR | NFR-01, NFR-03, NFR-10, NFR-27 | Độ trễ gửi, mở phòng, mất mạng, log |
| Flow | FLOW-10a bước 1–4, 6–10 | happy path |
| Flow | FLOW-10a A3, E1 (phần chữ), E2, E3 | alternative / exception |

**Ngoài phạm vi:** ảnh (T-019); thu hồi (T-020); đã xem, số chưa đọc, gọi `markRoomAsRead` (T-021); đang soạn, online trong phụ đề header (T-022); hẹn giờ ẩn tin hết hạn + TTL (T-023); thanh chỉ đọc và tính `read_only` (T-013); Enter = gửi trên desktop (T-029).

## 3. Việc cần làm
### UI
- [ ] Route `/rooms/[roomId]` hiển thị SCR-05 toàn màn hình, ẩn thanh tab; nút ← về SCR-03; header tên phòng (`rooms.name`, trống → tên thành viên khác, tối đa 3 + "+n") + phụ đề "n thành viên" (phần "m đang online" để T-022); nút ℹ để sẵn (điều hướng ở T-015).
- [ ] Dòng chế độ lưu (component 4): "Phòng ngắn hạn · tin tự xóa sau {thời hạn} kể từ lúc gửi" / "Phòng lâu dài · tin được giữ vĩnh viễn".
- [ ] Listener `rooms/{roomId}`, `rooms/{roomId}/members` where `status == active`, `rooms/{roomId}/messages` orderBy `created_at desc` limit 50; lọc phía client `expire_at` null hoặc `> now` (không lọc trong query – database-design 3).
- [ ] Cache `profiles/{uid}` theo phiên (get một lần / uid) để hiện tên, ảnh người gửi.
- [ ] Bubble tin người khác (trái, ảnh + tên + giờ) / tin của tôi (phải); chip tin hệ thống (component 6) map đủ 6 loại `system_event.type`; `profiles.status = deleted` → "Người dùng đã xóa" + ảnh mặc định (component 11).
- [ ] Cuộn lên đầu → indicator "Đang tải tin cũ hơn" → query `created_at < cursor` limit 50, chèn lên đầu, giữ vị trí cuộn; lỗi → toast "Không tải được tin cũ".
- [ ] Ô nhập textarea tự giãn tối đa 5 dòng, placeholder "Nhập tin nhắn…", `maxLength = limits.max_message_chars` (từ `getMe`), bộ đếm hiện khi ≥900 ký tự.
- [ ] Nút Gửi disabled khi chữ rỗng sau trim; gửi = sinh `messageId` (ULID) phía client → hiện bubble "đang gửi" (optimistic) → xác nhận khi listener trả về cùng id → xóa ô nhập.
- [ ] Mất mạng / 5xx / timeout → bubble viền đứt "! Gửi thất bại · Gửi lại" (component 13); Gửi lại gọi lại `createMessage` cùng `messageId`; tin lỗi giữ trong state cục bộ của phòng.
- [ ] Banner "Mất kết nối – đang thử lại" khi `navigator.onLine = false` hoặc snapshot `metadata.fromCache` kéo dài > 3 giây `[ASSUMED → Q-047]`; có mạng lại listener tự tải bù.
- [ ] Trạng thái màn: Loading (header + 6 bubble skeleton), Empty "Chưa có tin nhắn. Hãy gửi lời chào!" (chỉ có tin hệ thống), Error (banner).
- [ ] Dialog 24: listener phòng bị `permission-denied` hoặc `rooms.status = deleted` hoặc mình không còn trong `member_uids` → "Bạn không còn ở trong phòng này" / "Phòng đã bị giải tán" + "Về danh sách phòng" → SCR-03; API trả `NOT_ROOM_MEMBER` / `ROOM_NOT_FOUND` khi gửi → cùng dialog.
- [ ] Toast lỗi cụ thể cho `MESSAGE_EMPTY`, `MESSAGE_TOO_LONG` (chuỗi trong từ điển tiếng Việt).
- [ ] SCR-03.A2: bấm hàng phòng → mở `/rooms/[roomId]` (nếu T-008 chưa nối).

### API / Backend
- [ ] Route handler `PUT /api/rooms/[roomId]/messages/[messageId]` (`createMessage`): xác thực ID token + phiên (middleware chung T-002/T-003).
- [ ] Zod `MessageCreate` (giai đoạn này chỉ `text`; `additionalProperties: false`); `messageId` dạng ULID / ≤64 ký tự `[ASSUMED → Q-047]` → sai → `400 VALIDATION_FAILED`.
- [ ] Kiểm nghiệp vụ (không qua Zod để trả đúng mã): chữ rỗng sau trim → `422 MESSAGE_EMPTY`; > `limits.max_message_chars` → `422 MESSAGE_TOO_LONG` `[ASSUMED → Q-047]` (OpenAPI có `maxLength: 1000` nhưng bảng lỗi quy định 422 → độ dài kiểm ở tầng nghiệp vụ).
- [ ] Transaction: phòng không tồn tại / `status = deleted` → `404 ROOM_NOT_FOUND`; `members/{me}` không `active` → `403 NOT_ROOM_MEMBER`; `rooms.read_only = true` → `409 ROOM_READ_ONLY` (field luôn false tới T-013, chỉ thêm nhánh kiểm).
- [ ] Idempotent: `messages/{messageId}` đã tồn tại, cùng `sender_uid` và cùng `text` → `200` trả tin cũ, không ghi gì; khác người gửi / nội dung → `409 MESSAGE_ID_CONFLICT`.
- [ ] Ghi trong transaction: `messages/{messageId}` (`kind = user`, `sender_uid`, `text`, `images = []`, `status = sent`, `created_at` = server time, `expire_at = created_at + ttl_days` khi `retention = short`, null khi `long`, `schema_version = 1`); `rooms.last_message` (`text_preview` ≤100 ký tự, `image_count = 0`, `status`, `created_at`, `expire_at`), `rooms.last_message_at`; `members/{me}.last_read_at = created_at`. Không tạo thông báo.
- [ ] Trả `201 Message` (camelCase, không lộ `images[].path`).
- [ ] Log có cấu trúc: `roomId`, `messageId`, độ dài chữ, kết quả — **không** ghi `text` (NFR-27).

### Data
- [ ] `firestore.rules`: `rooms/{id}/messages/{mid}` và `rooms/{id}/members/{uid}` cho `read` khi `request.auth.uid in get(/databases/$(db)/documents/rooms/$(id)).data.member_uids`; `write: if false`.
- [ ] Index: dùng single-field mặc định `created_at` (không cần composite); tắt index `text`, `images`, `system_event` (fieldOverrides) và `rooms.last_message` (nếu T-008 chưa làm).
- [ ] Seed script emulator `scripts/seed/chat.ts`: phòng A–B lâu dài + phòng A–B ngắn hạn 1 ngày, 200 tin chữ cho phòng lâu dài, 1 tin của người dùng `status = deleted`.

### Khác
- [ ] Hàm tiện ích `formatMessageTime` theo múi giờ thiết bị (NFR-24).
- [ ] Chuỗi giao diện mới vào file từ điển tiếng Việt.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A và B là thành viên `active` của phòng P, cả hai đang mở P trên 2 trình duyệt | A gõ "Chào" và bấm Gửi | Tin hiện ngay ở bên phải màn A (trạng thái đang gửi → đã gửi); B thấy tin bên trái kèm tên, ảnh A, giờ gửi; ô nhập của A trống; trong emulator có `messages/{id}` `kind = user`, `status = sent`, `rooms.last_message.text_preview = "Chào"`, `last_message_at` mới, `members/A.last_read_at = created_at` | FLOW-10a bước 6–10 |
| AC-2 | Phòng P có 200 tin (seed) | B mở P | Thấy 50 tin mới nhất, tin mới nhất ở dưới; cuộn lên đầu → hiện "Đang tải tin cũ hơn" rồi thêm 50 tin cũ hơn phía trên, vị trí đang xem không nhảy | SCR-05.A0, SCR-05.A1, NFR-03 |
| AC-3 | Phòng P có 200 tin, local + emulator | Mở P 10 lần (Playwright) | P95 thời gian từ điều hướng tới khi 50 bubble hiện ≤1,5 giây | NFR-03 |
| AC-4 | A và B đang mở P | A gửi 20 tin liên tiếp (Playwright đo) | P95 từ lúc bấm Gửi trên A tới khi tin hiện trên B ≤1 giây | NFR-01 |
| AC-5 | Phòng P chỉ có tin hệ thống "A đã tạo phòng" | B mở P | Chip giữa "A đã tạo phòng" và dòng "Chưa có tin nhắn. Hãy gửi lời chào!" | SCR-05 trạng thái Empty, BR-24 |
| AC-6 | A đang soạn | A dán 1200 ký tự | Ô nhập chỉ giữ 1000 ký tự, bộ đếm hiện "1000/1000" (bộ đếm xuất hiện từ ký tự thứ 900); gọi API trực tiếp với 1001 ký tự → `422 MESSAGE_TOO_LONG`, không có document mới | BR-21, FLOW-10a E1 |
| AC-7 | Ô nhập rỗng hoặc chỉ khoảng trắng | A nhìn nút Gửi / gọi API với `text = "   "` | Nút Gửi disabled; API trả `422 MESSAGE_EMPTY` | BR-21, FLOW-10a E1 |
| AC-8 | A mất mạng (Playwright `context.setOffline(true)`) | A gửi "Alo" | Bubble "! Gửi thất bại · Gửi lại", banner "Mất kết nối – đang thử lại" | FLOW-10a E3, NFR-10 |
| AC-9 | Tin "Alo" đang ở trạng thái Gửi thất bại, A có mạng lại | A bấm Gửi lại | B thấy đúng 1 tin "Alo"; emulator chỉ có 1 document với `messageId` đó | FLOW-10a E3, NFR-10 |
| AC-10 | Đã có `messages/M1` do A gửi với text "Hi" | Gọi `PUT …/messages/M1` lần nữa với cùng body / với text khác / bằng token của B | Lần 1: `200` trả tin cũ, không ghi thêm; lần 2: `409 MESSAGE_ID_CONFLICT`; lần 3: `409 MESSAGE_ID_CONFLICT` | NFR-10 |
| AC-11 | B mất mạng khi A gửi 3 tin | B có mạng lại | Banner biến mất, B thấy đủ 3 tin theo thứ tự, không trùng, không cần tải lại trang | NFR-10 |
| AC-12 | Phòng ngắn hạn `ttl_days = 1` và phòng lâu dài | A gửi tin vào mỗi phòng | Tin phòng ngắn hạn có `expire_at = created_at + 1 ngày`, `rooms.last_message.expire_at` bằng giá trị đó; tin phòng lâu dài có `expire_at = null`; dòng chế độ lưu hiện đúng | BR-16 |
| AC-13 | C không phải thành viên P | C gọi `createMessage` vào P; C đọc `rooms/P/messages` bằng client SDK | API `403 NOT_ROOM_MEMBER`; rules từ chối đọc (`permission-denied`) | BR-20, NFR-13 |
| AC-14 | P không tồn tại hoặc `status = deleted` | A gửi tin | `404 ROOM_NOT_FOUND`; màn A hiện dialog "Phòng đã bị giải tán" + "Về danh sách phòng" | FLOW-10a E2 |
| AC-15 | B đang mở P | Script seed bỏ B khỏi `member_uids` + `members/B.status = kicked` (giả lập kick, T-016) / đặt `rooms.status = deleted` | Màn B hiện dialog "Bạn không còn ở trong phòng này" / "Phòng đã bị giải tán" trong ≤2 giây; bấm "Về danh sách phòng" → SCR-03 | FLOW-10a E2, SUP-09 |
| AC-16 | P có tin cũ của D, `profiles/D.status = deleted` | A mở P | Tin của D hiện tên "Người dùng đã xóa" và ảnh mặc định | BR-28, FLOW-10a A3 |
| AC-17 | Thiếu / sai ID token | Gọi `createMessage` | `401 UNAUTHENTICATED` | NFR-11 |
| AC-18 | A gửi tin "bí mật 123" | Đọc log server của request | Log có `roomId`, `messageId`, không chứa chuỗi "bí mật 123" | NFR-27 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Handler `createMessage` (Vitest + Firestore emulator): tạo tin chữ → 201, kiểm `messages`, `rooms.last_message*`, `members.last_read_at` | AC-1 |
| `createMessage` trên phòng `short` / `long` → `expire_at` đúng / null | AC-12 |
| Validation: text rỗng, toàn khoảng trắng → 422 `MESSAGE_EMPTY`; 1000 ký tự → 201; 1001 → 422 `MESSAGE_TOO_LONG`; body có field lạ → 400 | AC-6, AC-7 |
| Idempotent: PUT lặp cùng body → 200, đếm document = 1; khác text → 409; khác người gửi → 409 | AC-9, AC-10 |
| Không phải thành viên → 403; `members.status = left` → 403; phòng `deleted` / không tồn tại → 404; không token → 401 | AC-13, AC-14, AC-17 |
| Rules test (`@firebase/rules-unit-testing`): thành viên đọc được `messages`, `members`; người ngoài bị từ chối; mọi `write` từ client bị từ chối | AC-13 |
| Logger spy: request gửi "bí mật 123" → không có chuỗi này trong bản ghi log | AC-18 |
| Component test (Vitest + Testing Library): bubble người đã xóa, chip hệ thống 6 loại, bộ đếm ≥900, nút Gửi disabled | AC-5, AC-6, AC-7, AC-16 |
| Hook `useMessages`: phân trang cursor, gộp tin optimistic với snapshot theo `messageId` (không trùng) | AC-2, AC-9, AC-11 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context (375×812): A gửi "Chào" → B thấy; đo P95 20 tin ≤1s; mở phòng 200 tin 10 lần đo P95 ≤1,5s; cuộn tải tin cũ | AC-1, AC-2, AC-3, AC-4 |
| A `setOffline(true)` → gửi → thấy "Gửi thất bại" → `setOffline(false)` → Gửi lại → B thấy đúng 1 tin | AC-8, AC-9 |
| B đang mở phòng → script admin bỏ B khỏi phòng → B thấy dialog → về SCR-03 | AC-15 |

### Dữ liệu seed / tiền điều kiện
- Tài khoản emulator A, B (bạn bè, đã đồng ý chính sách), C (không trong phòng), D (`profiles.status = deleted`).
- Phòng P1 lâu dài A–B với 200 tin + 1 tin của D; phòng P2 ngắn hạn 1 ngày A–B chỉ có tin hệ thống.
- `config/limits` seed (T-002).

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Chạy emulator + `npm run seed:chat`; đăng nhập A (Chrome) và B (cửa sổ ẩn danh) | Cả hai thấy P1, P2 ở danh sách phòng | — |
| 2 | B mở P2 | Thấy chip "A đã tạo phòng", "Chưa có tin nhắn. Hãy gửi lời chào!", dòng "Phòng ngắn hạn · tin tự xóa sau 1 ngày…" | AC-5 |
| 3 | A mở P2, gõ "Chào", bấm Gửi | Tin hiện ngay bên phải; B thấy gần như tức thì; Emulator UI: `expire_at` = +1 ngày | AC-1, AC-12 |
| 4 | B mở P1, cuộn lên đầu | Thấy "Đang tải tin cũ hơn", thêm tin cũ, vị trí không nhảy; tin của D hiện "Người dùng đã xóa" | AC-2, AC-16 |
| 5 | A dán đoạn 1200 ký tự | Chỉ nhận 1000, bộ đếm 1000/1000; xóa hết → nút Gửi xám | AC-6, AC-7 |
| 6 | DevTools A → Offline, gửi "Alo" | Banner mất kết nối + "Gửi thất bại · Gửi lại" | AC-8 |
| 7 | Bật mạng, bấm Gửi lại | B thấy 1 tin "Alo"; Emulator UI chỉ 1 document | AC-9 |
| 8 | DevTools B → Offline; A gửi 3 tin; B Online lại | B thấy đủ 3 tin, không trùng | AC-11 |
| 9 | Trong Emulator UI xóa B khỏi `member_uids` của P1 khi B đang mở P1 | B thấy "Bạn không còn ở trong phòng này" → về danh sách phòng | AC-15 |
| 10 | Xem log terminal Next.js sau bước 3 | Không có chuỗi "Chào" trong log | AC-18 |

## 6. Definition of Done
- [ ] BR-23 / NFR-12 (ADR-07): kiểm code — nội dung tin chỉ lưu trong Firestore / Storage (mã hóa mặc định Google), không ghi bản sao ra log, cache server hay file tạm; client chỉ gọi API qua HTTPS (ở local dùng emulator; production App Hosting bắt buộc TLS)
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Rules `messages` / `members` có test cho phép (thành viên) và từ chối (người ngoài, mọi ghi client)
- [ ] Số đo P95 của AC-3, AC-4 ghi vào mô tả PR (môi trường local + emulator)
- [ ] Seed `scripts/seed/chat.ts` dùng lại được cho T-019 → T-023, T-028

## 7. Ghi chú
- `[ASSUMED → Q-047]` `messageId` client sinh dạng ULID (sắp theo thời gian, ≤64 ký tự); server chỉ kiểm định dạng.
- `[ASSUMED → Q-047]` Độ dài chữ kiểm ở tầng nghiệp vụ (422 `MESSAGE_TOO_LONG`) dù OpenAPI có `maxLength: 1000` — bảng mã lỗi ưu tiên 422.
- `[ASSUMED → Q-047]` Banner mất kết nối dựa trên `navigator.onLine` + `metadata.fromCache` của snapshot (RTDB `.info/connected` chỉ có từ T-022).
- `[ASSUMED → Q-047]` NFR-01 / NFR-03 đo trên local + emulator (Q-045), không phải 4G thật; đo lại khi có staging (T-028 ghi chú).
- Kiểm `read_only` phía server được thêm ngay (rẻ, tránh sửa lại handler); việc **tính** `read_only` và thanh chỉ đọc vẫn thuộc T-013.
- Point 5 giữ nguyên: checklist khớp ước lượng sơ bộ.
