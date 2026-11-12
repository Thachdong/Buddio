# SCR-05 Phòng chat

- **Actor:** ACT-03 (host), ACT-04 (thành viên)
- **BIZ thể hiện:** BIZ-10, SUP-05, SUP-08, SUP-09 — nơi trò chuyện thời gian thực bằng chữ và ảnh: gửi, xem, đã xem, đang soạn, online, thu hồi, tin tự hết hạn; đồng thời thể hiện phòng chỉ đọc (BR-13) và đóng phòng khi bị kick / phòng bị giải tán.
- **FLOW:** FLOW-10a (bước 1–10, A1–A3, E1–E4), FLOW-10b, FLOW-10c
- **Đến từ:** SCR-03, SCR-04 (tạo xong), SCR-10 (được thêm / nhận host), SCR-06 (quay lại) · **Đi tới:** SCR-06, SCR-03
- **Wireframe:** [drawio](./drawio/scr-05-chat-room.drawio) — 5 trang: *Đang chat*, *Chỉ đọc*, *Thao tác trên tin* (menu, đã xem, xác nhận thu hồi), *Xem ảnh lớn*, *Bị kick / phòng giải tán*. Chưa export PNG.

## 1. Layout
Màn con toàn màn hình, ẩn thanh tab. Header (←, tên phòng + phụ đề, ℹ) → dòng chế độ lưu → danh sách tin cuộn (mới nhất ở dưới) → dòng "đang soạn" → khay ảnh đã chọn (khi có) → thanh soạn tin dính đáy (chọn ảnh, ô nhập, gửi). Phòng chỉ đọc: thanh soạn thay bằng thanh khóa. Gửi tin ≤2 chạm sau khi mở phòng (NFR-22).

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Nút ← | button | → SCR-03 | — |
| 2 | Tên phòng + phụ đề | header text (bấm được) | `rooms.name` hoặc tên thành viên; phụ đề "n thành viên · m đang online" (m chỉ tính khi mình bật `show_online` – BR-25) → bấm mở SCR-06 | — |
| 3 | Nút ℹ | icon button | → SCR-06 | — |
| 4 | Dòng chế độ lưu | text | "Phòng ngắn hạn · tin tự xóa sau {thời hạn} kể từ lúc gửi" / "Phòng lâu dài · tin được giữ vĩnh viễn" | BR-16 |
| 5 | Đang tải tin cũ hơn | indicator | Hiện khi cuộn lên đầu và đang tải trang tiếp | — |
| 6 | Tin hệ thống | chip giữa | Từ `system_event`: "A đã tạo phòng", "A đã thêm B", "A đã mời B ra khỏi phòng", "C đã rời phòng", "A chuyển quyền host cho B", "A đã đổi tên phòng thành X" | BR-24 |
| 7 | Tin người khác | bubble trái | Ảnh + tên người gửi (`profiles`), nội dung (≤1000 ký tự), giờ gửi | — |
| 8 | Tin của tôi | bubble phải | Nội dung, giờ; nhấn giữ / bấm "⋯" → menu 20 | — |
| 9 | Ảnh trong tin | image grid | 1–10 ảnh, lưới 2 cột; ảnh tải bằng signed URL (A9); bấm → 23 | — |
| 10 | Tin đã thu hồi | bubble nghiêng | "Tin nhắn đã thu hồi" (`status = recalled`) | BR-22 |
| 11 | Người gửi đã xóa | bubble | Tên "Người dùng đã xóa", ảnh mặc định (`profiles.status = deleted`) | BR-28 |
| 12 | Đã xem | avatar nhỏ | Dưới tin mới nhất mà từng thành viên đã xem tới: ảnh nhỏ của họ (tối đa 5 + "+n") `[ASSUMED → Q-044]` kiểu Messenger. **Suy từ** `members/{uid}.last_read_at ≥ message.created_at` (trừ người gửi). Luôn hiện, không tắt được | BR-26 |
| 13 | Tin gửi thất bại | bubble viền đứt + link | "! Gửi thất bại · Gửi lại" | NFR-10, Q-029 |
| 14 | Đang soạn | text | "{Tên} đang soạn tin…" / "{A} và {B} đang soạn tin…" / "Nhiều người đang soạn tin…" (bỏ qua giá trị cũ >5 giây) | SUP-09 |
| 15 | Khay ảnh đã chọn | thumbnail list | Ảnh xem trước tạo phía client, nút × bỏ ảnh, "n ảnh · x/10 MB", thanh tiến độ upload | BR-21: ≤ `limits.max_images_per_message` (10), tổng ≤ `limits.max_image_bytes_per_message` (10MB), chỉ `image/*` |
| 16 | Nút chọn ảnh | icon button | Mở bộ chọn ảnh (`accept="image/*"`, chọn nhiều) | Vượt giới hạn → toast "Tối đa 10 ảnh, tổng 10MB" và không thêm ảnh vượt |
| 17 | Ô nhập tin | textarea tự giãn (tối đa 5 dòng) | Placeholder "Nhập tin nhắn…"; bộ đếm hiện khi ≥900 ký tự | BR-21: ≤ `limits.max_message_chars` (1000), chặn gõ quá |
| 18 | Nút Gửi | icon button | — | Disabled khi không có chữ (sau trim) và không có ảnh, hoặc ảnh đang upload |
| 19 | Thanh chỉ đọc | bar | "[Khóa] Phòng chỉ đọc — Hai bạn không còn là bạn bè nên không thể gửi tin mới. Bạn vẫn xem được tin cũ và thu hồi tin của mình." Với host thêm: "Host có thể thêm bạn khác vào phòng để trò chuyện tiếp." | BR-13. Một câu lý do chung cho cả hủy kết bạn lẫn chặn (chặn cũng hủy kết bạn) → không lộ việc bị chặn (BR-14) `[ASSUMED → Q-044]` |
| 20 | Menu tin của tôi | bottom sheet | "Xem ai đã xem", "Thu hồi tin nhắn", "Đóng". Tin người khác: chỉ "Xem ai đã xem" | Thu hồi chỉ với tin của mình, `status = sent` |
| 21 | Sheet "Đã xem" | bottom sheet | "Đã xem (n)": ảnh + tên; "Chưa xem: …" | BR-26 |
| 22 | Xác nhận thu hồi | dialog | "Thu hồi tin nhắn? Mọi người sẽ thấy 'Tin nhắn đã thu hồi'. Ảnh kèm theo bị xóa và không khôi phục được." Hủy / Thu hồi `[ASSUMED → Q-044]` có xác nhận | — |
| 23 | Xem ảnh lớn | full-screen viewer | Ảnh lớn, "i/n", vuốt trái/phải, tên người gửi + giờ, nút × | URL hết hạn sau ≤1 giờ (NFR-13) → tự lấy lại khi lỗi tải |
| 24 | Dialog không còn trong phòng | dialog | "Bạn không còn ở trong phòng này" (bị kick) / "Phòng đã bị giải tán" + nút "Về danh sách phòng" | BR-20, FLOW-10a E2 |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-05.A0 | Tải phòng, thành viên, 50 tin mới nhất (realtime) | Không API — Firestore listener `rooms/{roomId}`, `rooms/{roomId}/members` where `status == active`, `rooms/{roomId}/messages` orderBy `created_at desc` limit 50 (lọc `expire_at > now` hoặc null); `profiles/{uid}` (get) | Hiện tin (NFR-03 ≤1,5s); hẹn giờ ẩn từng tin đúng `expire_at` (SUP-05, NFR-19) | Bị từ chối đọc (không còn là thành viên) hoặc `rooms.status = deleted` → 24 |
| SCR-05.A1 | Tải tin cũ hơn khi cuộn | Không API — Firestore query `messages` where `created_at < cursor` orderBy desc limit 50 | Chèn lên đầu, giữ vị trí cuộn | Toast "Không tải được tin cũ" |
| SCR-05.A2 | Đánh dấu đã xem | `markRoomAsRead` (`POST /rooms/{roomId}/read`) | `members/{me}.last_read_at` cập nhật → badge phòng về 0, người khác thấy mình trong 12. Gọi khi mở phòng và khi có tin mới hiển thị lúc tab đang mở, debounce 1 giây (Q-047, giữ NFR-02) | Bỏ qua, thử lại lần sau |
| SCR-05.A3 | Báo đang soạn | Không API — RTDB ghi `typing/{roomId}/{me}` = server timestamp (throttle 3 giây khi gõ), `onDisconnect().remove()`, xóa khi gửi / xóa hết chữ | Người khác thấy 14 | Bỏ qua |
| SCR-05.A4 | Xem online / đang soạn | Không API — RTDB listener `status/{uid}` của thành viên, `typing/{roomId}` | Chấm online + 14; ẩn online nếu mình tắt `show_online` (BR-25) | Bỏ qua |
| SCR-05.A5 | Chọn & upload ảnh tạm | Không API — Cloud Storage upload `uploads/{me}/{uuid}` (Storage Rules: chủ sở hữu, `image/*`, ≤10MB/tệp) | Thanh tiến độ 15 (NFR-05) | Tệp không phải ảnh / quá lớn → toast, bỏ ảnh đó; upload lỗi → nút thử lại trên thumbnail |
| SCR-05.A6 | Gửi tin (chữ / ảnh) | `createMessage` (`PUT /rooms/{roomId}/messages/{messageId}`, `messageId` do client sinh, body `{text?, images[]}`) | Tin hiện ngay ở trạng thái "đang gửi" (optimistic), xác nhận qua listener; ô nhập + khay ảnh xóa | `ROOM_READ_ONLY` (E4) → chuyển 19, giữ nội dung đang soạn; `NOT_ROOM_MEMBER` / phòng xóa → 24; `VALIDATION_FAILED` (BR-21) → toast lỗi cụ thể; mất mạng / 5xx → 13 |
| SCR-05.A7 | Gửi lại tin lỗi | `createMessage` (cùng `id` → idempotent, NFR-10) | Như A6 | Vẫn lỗi → giữ 13 |
| SCR-05.A8 | Thu hồi tin của mình (20 → 22) | `recallMessage` (`POST /rooms/{roomId}/messages/{messageId}/recall`) | Mọi người thấy 10, ảnh bị xóa. Được phép cả khi phòng chỉ đọc (Q-035) | Tin vừa hết hạn / phòng vừa xóa (FLOW-10b E1) → tin biến mất, không báo lỗi; khác → toast |
| SCR-05.A9 | Xem ảnh (lấy link xem) | `listMessageImageUrls` (`GET /rooms/{roomId}/messages/{messageId}/image-urls`) | Signed URL hết hạn `min(1h, expire_at)`; gọi khi tin có ảnh hiện trên màn | 403/404 → ô ảnh "Ảnh không còn" |
| SCR-05.A10 | Mở thông tin phòng (2 hoặc 3) | NAV → SCR-06 | — | — |

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | Header hiện ngay (từ dữ liệu SCR-03), vùng tin 6 bubble skeleton |
| Empty | Phòng chưa có tin người dùng (chỉ tin hệ thống) hoặc mọi tin đã hết hạn: "Chưa có tin nhắn. Hãy gửi lời chào!" |
| Error | Banner "Mất kết nối – đang thử lại" (NFR-10); khi có mạng tải bù tin bị lỡ |
| Không có quyền | Không còn là thành viên / phòng đã xóa → 24 → SCR-03 |
| Chỉ đọc (`rooms.read_only = true`) | 19 thay thanh soạn; menu 20 vẫn có "Thu hồi" |
| Phòng chỉ còn host | Bình thường, gửi tin được (Q-018) |
| Tin hết hạn | Biến mất khỏi màn ≤1 phút (client hẹn giờ, NFR-19) |

## 5. Ghi chú UX
- Desktop: SCR-05 là khung phải cạnh SCR-03; ℹ mở SCR-06 dạng panel trượt bên phải; Enter = gửi, Shift+Enter = xuống dòng; kéo-thả ảnh vào khung chat.
- Mobile: Enter = xuống dòng, gửi bằng nút 18.
- Không có sửa tin (Q-021), không sticker/GIF/video/tệp (Q-022).
- `[ASSUMED → Q-044]` Ảnh chưa gửi bị bỏ (rời phòng) tự dọn sau 1 ngày nhờ lifecycle `uploads/` (ADR-10).
