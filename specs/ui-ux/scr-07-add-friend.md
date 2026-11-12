# SCR-07 Thêm bạn (tra email)

- **Actor:** ACT-01
- **BIZ thể hiện:** BIZ-03, SUP-07 — chỉ kết nối được bằng **email chính xác** (BR-03); màn này tra email, hiển thị đúng 1 trong 6 kết quả a–f và với kết quả "không tìm thấy" chỉ đưa nút "Copy link mời", giống hệt nhau cho mọi lý do (BR-04).
- **FLOW:** FLOW-03 (bước 1–11, A1–A5, E1–E3)
- **Đến từ:** SCR-08 (Thêm bạn), SCR-03 (trạng thái rỗng), SCR-04 (chưa có bạn) · **Đi tới:** SCR-09 (tab Đã gửi), quay lại màn trước
- **Wireframe:** [drawio](./drawio/scr-07-add-friend.drawio) — 4 trang: *Tìm thấy (e)*, *Không tìm thấy (f)*, *Kết quả a–d* (4 khung), *Lỗi nhập / bị giới hạn*. Chưa export PNG.

## 1. Layout
Màn con toàn màn hình, ẩn thanh tab. Header (← + "Thêm bạn") → ô email + nút Tìm → ghi chú → thẻ kết quả (một thẻ, nội dung đổi theo trường hợp). Mời bạn ≤3 bước: nhập → Tìm → Gửi lời mời / Copy link mời (NFR-22).

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Header "Thêm bạn" + ← | header | — | — |
| 2 | Ô email | input email | `type=email`, `autocomplete=off`, trim + lowercase trước khi gửi | Định dạng email (E1) |
| 3 | Nút "Tìm" | button chính | Enter cũng tìm | Disabled khi trống / đang tra / bị tạm khóa |
| 4 | Ghi chú | text | "Chỉ tìm được bằng email chính xác." | BR-03 |
| 5 | Lỗi / giới hạn | text / banner | "Email không đúng định dạng." · "Bạn đã tra quá nhiều email trong 1 giờ. Thử lại sau HH:mm." (ô 2, nút 3 khóa tới giờ đó) | NFR-16 |
| 6 | Thẻ kết quả | card | a: "Đây là email của bạn" · b: "Hai bạn đã là bạn bè" · c: "Đang chờ phản hồi" + 9 + 10 · d: "Chưa thể gửi lại, thử lại sau HH:mm ngày dd/MM" · e: ảnh + tên + 7 · f: "Không tìm thấy người dùng phù hợp" + "Gửi link mời để người này tham gia Buddio và kết bạn với bạn. Link có hạn 7 ngày." + 8 | BR-04: f **giống hệt nhau** (chữ, bố cục, không ảnh/tên) cho chưa đăng ký / ẩn danh / có chặn; c, d không hiện ảnh/tên `[ASSUMED → Q-044]` |
| 7 | Nút "Gửi lời mời" (e) | button chính | — | BR-05 |
| 8 | Nút "Copy link mời" (f) | button chính | Lựa chọn **duy nhất** ở f, không có nút chia sẻ khác | BR-04, BR-06 |
| 9 | Nút "Thu hồi lời mời" (c) | button phụ | — | BR-08 |
| 10 | Link "Xem lời mời đã gửi" (c) | text link | → SCR-09 tab Đã gửi | — |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-07.A1 | Tra email (nút 3) | `createEmailLookup` (`POST /email-lookups`, body `{email}` – dùng POST để email không nằm trên URL/log, NFR-27) | Trả `result ∈ {self, already_friends, pending_sent, reject_cooldown, found, not_found}` (+ `user` khi `found`; `requestId` khi `pending_sent`; `retryAfter` khi `reject_cooldown`); `not_found` chỉ có `{result}` → hiện 6. Thời gian phản hồi `not_found` đồng đều (NFR-15) | `VALIDATION_FAILED` → 5 (E1); `EMAIL_LOOKUP_RATE_LIMITED` (429, header `Retry-After`) → 5 khóa ô; lỗi mạng → toast |
| SCR-07.A2 | Gửi lời mời (e, nút 7) | `createFriendRequest` (`POST /friend-requests`, body `{email}`) | Thẻ đổi sang c "Đang chờ phản hồi"; toast "Đã gửi lời mời". Người nhận nhận thông báo | Trạng thái vừa đổi (E3): `ALREADY_FRIENDS` → b; mọi lý do khác (vừa bật ẩn danh, vừa chặn) → **hiện như f**, không lộ lý do |
| SCR-07.A3 | Thu hồi lời mời (c, nút 9) | `withdrawFriendRequest` (`POST /friend-requests/{requestId}/withdraw`) | Thẻ về trạng thái "Đã thu hồi lời mời" + tra lại được; toast | `FRIEND_REQUEST_NOT_PENDING` vì người kia vừa chấp nhận (E2) → hiện b "Hai bạn đã là bạn bè" |
| SCR-07.A4 | Tạo & copy link mời (f, nút 8) | `createInviteLink` (`POST /invite-links`, body `{email}`) | Trả `url` `/invite/{token}` → `navigator.clipboard.writeText` → toast "Đã copy link mời. Hãy gửi cho người bạn qua Messenger, Zalo…". Không lưu gì; link cũ vẫn hiệu lực (Q-034) | Lỗi clipboard → hiện link trong ô chỉ đọc để người dùng tự copy `[ASSUMED → Q-044]`; lỗi mạng → toast |

Điều hướng: 10 → SCR-09 (tab Đã gửi); ← → màn trước.

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | Nút 3 spinner; thẻ 6 skeleton |
| Empty | Chưa tra: chỉ ô nhập + ghi chú, không có thẻ |
| Error | 5 (định dạng / bị giới hạn); toast lỗi mạng |
| Không có quyền | Chưa đăng nhập → SCR-01 |

## 5. Ghi chú UX
- Desktop: dialog lớn (~480×560) phủ lên màn hiện tại.
- Đổi email trong ô 2 → xóa thẻ kết quả cũ.
- Kết quả f không dùng ảnh minh họa hay màu khác nhau theo lý do (BR-04, NFR-15).
