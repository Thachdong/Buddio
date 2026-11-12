# SCR-03 Danh sách phòng (trang chính)

- **Actor:** ACT-01
- **BIZ thể hiện:** BIZ-10, SUP-04, SUP-09 — người dùng cần thấy mọi phòng mình đang tham gia (kể cả phòng chỉ đọc), tin cuối và số tin chưa đọc để biết nên vào đâu; đây cũng là landing sau đăng nhập.
- **FLOW:** FLOW-10a (bước 1), FLOW-08 (trigger "Tạo phòng"), FLOW-08 E1 (chưa có bạn)
- **Đến từ:** SCR-01, SCR-02, SCR-04 (back), SCR-05/SCR-06 (rời / giải tán / bị kick), tab "Phòng" · **Đi tới:** SCR-05, SCR-04, SCR-07
- **Wireframe:** [drawio](./drawio/scr-03-room-list.drawio) — 2 trang: *Có dữ liệu*, *Trống*. Chưa export PNG.

## 1. Layout
Header (tiêu đề + nút Tạo phòng) → banner mất kết nối (khi có) → danh sách phòng cuộn dọc (hàng 72px) → thanh tab dưới 4 mục (Phòng đang chọn). Theo layout chung wireframe.md mục 5.

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Tiêu đề "Phòng" | header | — | — |
| 2 | Nút "+ Tạo phòng" | button | → SCR-04 | — |
| 3 | Banner "Mất kết nối – đang thử lại…" | banner | Trạng thái kết nối Firestore/RTDB (NFR-10) | — |
| 4 | Hàng phòng | list item | Một phòng `rooms` có `member_uids ∋ me`, `status = active`, sắp xếp `last_message_at` giảm dần | BR-20: chỉ phòng đang tham gia |
| 5 | Tên phòng / ảnh | text + avatar | `rooms.name`; trống → tên các thành viên khác (tối đa 3, "+n") từ `profiles` (Q-012). Phòng 2 người: ảnh + chấm online của người kia (chỉ khi mình bật `show_online` – BR-25); phòng nhóm: chồng 2 ảnh | Thành viên đã xóa tài khoản không còn trong `member_uids` |
| 6 | Xem trước tin cuối | text | `rooms.last_message`: "{Tên}: {text_preview}" / "Bạn: …" / "Đã gửi n ảnh" / "Tin nhắn đã thu hồi" / tin hệ thống ("An đã thêm Hà") / người gửi đã xóa → "Người dùng đã xóa: …". `last_message.expire_at` đã qua → "Không có tin nhắn" `[ASSUMED → Q-044]`. In đậm khi có chưa đọc | SUP-04 |
| 7 | Thời gian | text | `last_message_at`: hôm nay "HH:mm", hôm qua "Hôm qua", trong tuần "T2…CN", cũ hơn "dd/MM" `[ASSUMED → Q-044]` theo múi giờ thiết bị (NFR-24) | — |
| 8 | Badge số chưa đọc | pill | `count()` tin `kind = user`, `sender_uid ≠ me`, `created_at > members/{me}.last_read_at`, chưa hết hạn; >99 → "99+" `[ASSUMED → Q-044]` | SUP-04 |
| 9 | Nhãn trạng thái phòng | chip | "Ngắn hạn" (`retention = short`) · "Chỉ đọc" (`read_only = true`) | BR-13, BR-16 |
| 10 | Thanh tab | tab bar | Phòng (badge tổng chưa đọc – LAYOUT.A3), Bạn bè (badge lời mời đang chờ), Thông báo (badge – LAYOUT.A2), Cài đặt | — |
| 11 | Trạng thái rỗng | empty state | "Chưa có phòng nào" + nút "Tạo phòng" + nút "Thêm bạn" | — |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| LAYOUT.A1 | Tải hồ sơ của tôi + giới hạn cấu hình (khởi động app) | `getMe` (`GET /me`) | Có `profile`, `settings` (anonymous, show_online), `limits` (TBL-11) dùng cho mọi màn | 401 / phiên hết 30 ngày → SCR-01 với thông báo hết phiên |
| LAYOUT.A2 | Badge thông báo chưa đọc | Không API — Firestore listener `users/{me}/notifications` where `read == false` (count) | Badge tab Thông báo | Ẩn badge |
| LAYOUT.A3 | Badge tổng chưa đọc + lời mời đang chờ | Không API — tổng các badge 8; Firestore listener `friend_requests` where `to_uid == me` && `status == pending` | Badge tab Phòng / Bạn bè | Ẩn badge |
| LAYOUT.A4 | Ghi online | Không API — RTDB `status/{me}` = online + `onDisconnect` offline; chỉ khi `show_online = true` | — | Tự kết nối lại |
| SCR-03.A0 | Tải danh sách phòng (realtime) | Không API — Firestore listener `rooms` where `member_uids array-contains me` && `status == active` orderBy `last_message_at desc`; `profiles/{uid}` (get) cho tên/ảnh | Hiện danh sách; phòng bị giải tán / bị kick tự biến mất | Banner 3, giữ dữ liệu cũ, tự thử lại |
| SCR-03.A1 | Đếm tin chưa đọc mỗi phòng | Không API — Firestore `rooms/{id}/members/{me}` (last_read_at) + `count()` trên `rooms/{id}/messages` where `created_at > last_read_at` | Badge 8 | Ẩn badge |
| SCR-03.A2 | Mở phòng / Tạo phòng / Thêm bạn | NAV → SCR-05 / SCR-04 / SCR-07 | — | — |

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | 5 hàng skeleton (ảnh tròn + 2 dòng) |
| Empty | 11 |
| Error | Banner 3 (mất kết nối); lỗi đọc → "Không tải được danh sách phòng" + nút "Thử lại" |
| Không có quyền | Chưa đăng nhập / phiên hết → SCR-01 |
| Phòng chỉ đọc | Vẫn hiện trong danh sách, nhãn "Chỉ đọc" (BR-13) |

## 5. Ghi chú UX
- Desktop (≥1024px): sidebar trái 4 mục thay thanh tab; SCR-03 là cột trái rộng ~360px, bên phải là SCR-05 của phòng đang chọn (chưa chọn → "Chọn một phòng để bắt đầu trò chuyện").
- Tin mới không tạo thông báo — chỉ cập nhật badge và đẩy phòng lên đầu (SUP-04, Q-030).
- `[ASSUMED → Q-044]` Hẹn giờ phía client để làm mới xem trước khi `last_message.expire_at` qua (NFR-19 ≤1 phút).
