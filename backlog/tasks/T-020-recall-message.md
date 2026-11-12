# T-020 · Thu hồi tin nhắn của mình

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-05 | M3 | 2 | T-019, T-013 | TODO |

## 1. Mục tiêu demo
Sau task này: **A mở phòng chat SCR-05, nhấn giữ (hoặc bấm "⋯") tin của mình → Thu hồi tin nhắn → xác nhận; mọi người thấy "Tin nhắn đã thu hồi", ảnh kèm biến mất và file bị xóa trong Storage emulator; thu hồi được cả khi phòng đang chỉ đọc.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-05.A8 | Menu tin (20) → xác nhận (22) → thu hồi |
| API | `recallMessage` | `POST /rooms/{roomId}/messages/{messageId}/recall` |
| Dữ liệu | TBL-09 | `status = recalled`, `recalled_at`, `text = null`, `images = []` |
| Dữ liệu | TBL-07 | `rooms.last_message.status` khi tin bị thu hồi là tin cuối |
| Dữ liệu | Cloud Storage | Xóa `rooms/{roomId}/messages/{messageId}/*` |
| Rule | BR-22 | Chỉ người gửi; mọi người thấy "Đã thu hồi"; ảnh bị xóa |
| Phụ trợ | SUP-08 | Xóa ảnh ngay |
| NFR | NFR-02, NFR-19 | Cập nhật P95 ≤2s; biến mất khỏi màn ≤1 phút |
| Flow | FLOW-10b bước 1–4, E1 | |
| Khác | Q-035 | Thu hồi được khi phòng chỉ đọc |

**Ngoài phạm vi:** mục "Xem ai đã xem" trong menu tin (T-021 thêm vào cùng menu); sửa tin (không có – Q-021).

## 3. Việc cần làm
### UI
- [ ] Menu tin (component 20, bottom sheet): nhấn giữ ≥500ms hoặc nút "⋯" trên tin của mình (`kind = user`, `status = sent`) → "Thu hồi tin nhắn", "Đóng". Tin người khác / tin đã thu hồi / tin hệ thống không có mục Thu hồi.
- [ ] Dialog xác nhận (component 22): "Thu hồi tin nhắn? Mọi người sẽ thấy 'Tin nhắn đã thu hồi'. Ảnh kèm theo bị xóa và không khôi phục được." Hủy / Thu hồi; nút Thu hồi có trạng thái loading.
- [ ] Bubble đã thu hồi (component 10): chữ nghiêng "Tin nhắn đã thu hồi", không ảnh, không menu thu hồi; áp cho mọi thành viên qua listener (không cần tải lại).
- [ ] Menu vẫn có Thu hồi khi phòng chỉ đọc (thanh chỉ đọc 19 của T-013 không chặn menu).
- [ ] Lỗi `MESSAGE_NOT_FOUND` / `ROOM_NOT_FOUND` (FLOW-10b E1) → đóng dialog, không báo lỗi, tin tự biến mất theo listener; lỗi khác → toast "Không thu hồi được, thử lại".
- [ ] SCR-03 xem trước tin cuối: `last_message.status = recalled` → "Tin nhắn đã thu hồi" (kiểm hàm format của T-008/T-021 xử lý trường hợp này).
- [ ] Viewer ảnh (T-019) đang mở ảnh của tin vừa bị thu hồi → đóng viewer.

### API / Backend
- [ ] Handler `POST /api/rooms/[roomId]/messages/[messageId]/recall`: xác thực; phòng không tồn tại / `deleted` → `404 ROOM_NOT_FOUND`; không phải thành viên `active` → `403 NOT_ROOM_MEMBER`; tin không tồn tại hoặc `expire_at ≤ now` → `404 MESSAGE_NOT_FOUND`; `sender_uid ≠ me` hoặc `kind = system` → `403 NOT_MESSAGE_SENDER`.
- [ ] Không kiểm `rooms.read_only` (Q-035).
- [ ] Transaction: `status = recalled`, `recalled_at = now`, `text = null`, `images = []`; nếu `rooms.last_message.id == messageId` → `last_message.status = recalled`, `text_preview = null`, `image_count = 0` (giữ `last_message_at`).
- [ ] Sau commit: xóa mọi file dưới `rooms/{roomId}/messages/{messageId}/`; lỗi xóa → log cảnh báo (không chứa nội dung) và thử lại 3 lần `[ASSUMED → Q-047]`.
- [ ] Đã `recalled` → `200` trả tin (idempotent), vẫn chạy bước xóa file (dọn file sót) `[ASSUMED → Q-047]`.

### Data
- [ ] Không thêm field / index mới. Rules không đổi (mọi ghi từ client vẫn bị từ chối).

### Khác
- [ ] Chuỗi giao diện mới vào từ điển tiếng Việt.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A gửi tin "Ảnh nè" kèm 2 ảnh trong phòng P (A, B đang mở) | A nhấn giữ tin → Thu hồi tin nhắn → Thu hồi | Trên cả A và B tin thành "Tin nhắn đã thu hồi" (nghiêng, không ảnh) trong ≤2 giây; emulator: `status = recalled`, `recalled_at` có giá trị, `text = null`, `images = []`; Storage không còn file dưới `rooms/P/messages/{id}/` | FLOW-10b bước 1–4, BR-22, SUP-08, NFR-02 |
| AC-2 | Tin bị thu hồi là tin cuối của P | B xem danh sách phòng | Hàng P hiện "Tin nhắn đã thu hồi" | FLOW-10b bước 4, SUP-04 |
| AC-3 | A mở menu tin của mình | A bấm Hủy trong dialog xác nhận | Tin không đổi | SCR-05 component 22 |
| AC-4 | B mở menu trên tin của A | — | Không có mục "Thu hồi tin nhắn"; B gọi API `recallMessage` tin của A → `403 NOT_MESSAGE_SENDER`, tin không đổi | BR-22 |
| AC-5 | Phòng 2 người A–B đang chỉ đọc (A đã hủy kết bạn B – T-013) | A thu hồi một tin cũ của mình | Thu hồi thành công như AC-1; ô nhập vẫn khóa | Q-035 |
| AC-6 | Tin của A ở phòng ngắn hạn đã quá `expire_at` (seed) / phòng vừa bị giải tán | A gọi thu hồi | API `404 MESSAGE_NOT_FOUND` / `404 ROOM_NOT_FOUND`; UI đóng dialog, không toast lỗi, tin không còn trên màn | FLOW-10b E1 |
| AC-7 | Tin đã thu hồi | Gọi `recallMessage` lần nữa | `200`, dữ liệu không đổi | idempotent (api-contract) |
| AC-8 | C không phải thành viên P | C gọi `recallMessage` | `403 NOT_ROOM_MEMBER` | BR-20, NFR-13 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `recallMessage` (Firestore + Storage emulator): tin có 2 ảnh → 200, field đúng, file bị xóa | AC-1 |
| Tin cuối → `rooms.last_message.status = recalled`; tin không phải cuối → `last_message` không đổi | AC-2 |
| Người khác gửi → 403 `NOT_MESSAGE_SENDER`; tin hệ thống → 403; người ngoài → 403 `NOT_ROOM_MEMBER` | AC-4, AC-8 |
| Phòng `read_only = true` → 200 | AC-5 |
| Tin hết hạn → 404 `MESSAGE_NOT_FOUND`; phòng `deleted` → 404 `ROOM_NOT_FOUND` | AC-6 |
| Gọi 2 lần → 200 cả hai, không lỗi | AC-7 |
| Component test: menu không có Thu hồi với tin người khác / tin đã thu hồi; Hủy không gọi API | AC-3, AC-4 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context: A gửi tin 2 ảnh → nhấn giữ → Thu hồi → xác nhận → B thấy "Tin nhắn đã thu hồi", danh sách phòng của B hiện cùng chữ | AC-1, AC-2 |
| Phòng chỉ đọc (seed `read_only = true`): A thu hồi thành công | AC-5 |

### Dữ liệu seed / tiền điều kiện
- Seed T-009 + T-019: A, B, C; phòng P1 có tin của A kèm 2 ảnh; phòng 2 người chỉ đọc P3 (A–B, `read_only = true`) có tin của A; phòng ngắn hạn có tin của A với `expire_at` đã qua.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A mở P1, nhấn giữ tin có ảnh của mình | Bottom sheet "Thu hồi tin nhắn", "Đóng" | AC-1 |
| 2 | Bấm Thu hồi tin nhắn → Hủy | Tin không đổi | AC-3 |
| 3 | Lặp lại → Thu hồi | A và B thấy "Tin nhắn đã thu hồi"; Emulator Storage không còn file của tin | AC-1 |
| 4 | B về danh sách phòng | P1 hiện "Tin nhắn đã thu hồi" | AC-2 |
| 5 | B nhấn giữ tin của A | Không có mục Thu hồi | AC-4 |
| 6 | A mở P3 (chỉ đọc), thu hồi tin cũ | Thành công, thanh chỉ đọc vẫn hiện | AC-5 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Test khẳng định file Storage bị xóa sau thu hồi (Storage emulator)
- [ ] Không log nội dung tin trước khi thu hồi

## 7. Ghi chú
- `[ASSUMED → Q-047]` Xóa file Storage chạy sau commit transaction, thử lại 3 lần; vẫn lỗi → log cảnh báo. Ảnh không còn đọc được ngay vì API không cấp URL cho tin `recalled` (T-019), file sót sẽ do `purgeRoom` / lifecycle dọn.
- `[ASSUMED → Q-047]` Gọi thu hồi lần 2 vẫn chạy bước xóa file (dọn phần sót).
- Point 2 giữ nguyên.
