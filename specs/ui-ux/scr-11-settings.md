# SCR-11 Cài đặt tài khoản

- **Actor:** ACT-01
- **BIZ thể hiện:** BIZ-02, BIZ-11, BIZ-01 (đăng xuất) — người dùng tự quản lý tên hiển thị và quyền riêng tư (ẩn danh, hiển thị online), đăng xuất, và xóa tài khoản vĩnh viễn; mọi thứ thuộc về "tài khoản của tôi" gom ở một chỗ.
- **FLOW:** FLOW-02 (bước 1–7, A1, E1), FLOW-11 (bước 1–8, E1), FLOW-01 A1
- **Đến từ:** tab "Cài đặt" · **Đi tới:** SCR-12, SCR-01 (đăng xuất / xóa xong)
- **Wireframe:** [drawio](./drawio/scr-11-settings.drawio) — 2 trang: *Cài đặt* (kèm lỗi tên), *Xóa tài khoản*. Chưa export PNG.

## 1. Layout
Màn tab. Header "Cài đặt" → khối hồ sơ (ảnh + email chỉ xem) → tên hiển thị (ô + nút Lưu) → 2 công tắc quyền riêng tư (mỗi cái có mô tả) → mục "Danh sách đã chặn", "Chính sách quyền riêng tư" → nút "Đăng xuất" → nút "Xóa tài khoản" → thanh tab.

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Tiêu đề "Cài đặt" | header | — | — |
| 2 | Ảnh đại diện | avatar (chỉ xem) | `profiles.photo_url` + "Ảnh lấy từ Google" | Không sửa được (Q-010) |
| 3 | Email | text (chỉ xem) | `profiles.email` | Không sửa được |
| 4 | Ô tên hiển thị | input text | `profiles.display_name`; bộ đếm "n/50" | BR-29: không trống (sau trim), ≤ `limits.display_name_max` (50). Lỗi: "Tên hiển thị không được để trống." / "Tên tối đa 50 ký tự." |
| 5 | Nút "Lưu" | button chính | Chỉ bật khi tên thay đổi và hợp lệ | — |
| 6 | Công tắc "Chế độ ẩn danh" | switch | `users.anonymous` (mặc định Bật); mô tả "Khi bật, người khác nhập email của bạn sẽ không tìm thấy bạn." | BR-02 |
| 7 | Công tắc "Hiển thị trạng thái online" | switch | `users.show_online` (mặc định Bật); mô tả "Khi tắt, mọi người thấy bạn offline và bạn cũng không thấy online của người khác." | BR-25 |
| 8 | Mục "Danh sách đã chặn" | list item | → SCR-12 | — |
| 9 | Mục "Chính sách quyền riêng tư" | list item | Trang tĩnh `/privacy` `[ASSUMED → Q-044]` | NFR-17 |
| 10 | Nút "Đăng xuất" | button phụ | Không cần xác nhận `[ASSUMED → Q-044]` | — |
| 11 | Nút "Xóa tài khoản" | button nguy hiểm | → 13 | — |
| 12 | Thanh tab | tab bar | Như layout chung | — |
| 13 | Dialog xác nhận xóa tài khoản | modal | Cảnh báo: không khôi phục được, hiệu lực ngay; rời mọi phòng (phòng mình làm host chuyển cho thành viên vào sớm nhất); xóa quan hệ bạn bè, lời mời, link mời, danh sách chặn; tin đã gửi còn, hiển thị "Người dùng đã xóa"; đăng nhập lại = tài khoản mới. Checkbox "Tôi hiểu và muốn xóa tài khoản" + Hủy / "Xóa vĩnh viễn" | BR-28; nút Xóa disabled tới khi tích checkbox `[ASSUMED → Q-044]` |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-11.A0 | Tải hồ sơ & cài đặt | Không API — Firestore listener `users/{me}` (riêng tư: anonymous, show_online) + `profiles/{me}` | Hiện 2–7 | "Không tải được" + "Thử lại" |
| SCR-11.A1 | Đổi tên hiển thị (5) | `updateMe` (`PATCH /me`, body `{displayName}`) | Toast "Đã lưu"; tên mới hiện mọi nơi kể cả tin cũ (Q-029) | `VALIDATION_FAILED` (BR-29) → lỗi dưới ô 4, giữ tên cũ (E1) |
| SCR-11.A2 | Bật / tắt ẩn danh (6) | `updateMe` (`PATCH /me`, body `{anonymous}`) | Lưu ngay khi gạt, không cần nút Lưu (FLOW-02 A1); toast ngắn | Lỗi → công tắc trả về trạng thái cũ + toast |
| SCR-11.A3 | Bật / tắt hiển thị online (7) | `updateMe` (`PATCH /me`, body `{showOnline}`) + client: tắt → ghi RTDB `status/{me}` = offline và dừng LAYOUT.A4; bật → ghi online | Như A2 | Như A2 |
| SCR-11.A4 | Đăng xuất (10) | `deleteCurrentSession` (`DELETE /sessions/current`) rồi client `signOut()` | → SCR-01 "Bạn đã đăng xuất." | Lỗi mạng → vẫn `signOut()` phía client, về SCR-01 `[ASSUMED → Q-044]` |
| SCR-11.A5 | Xóa tài khoản (13) | `deleteMe` (`DELETE /me`) | Phiên kết thúc → SCR-01 "Tài khoản đã được xóa." Dọn dữ liệu chạy nền (`purgeAccount`) | Lỗi → giữ dialog, toast; hủy ở dialog → không đổi gì (E1) |

Điều hướng: 8 → SCR-12.

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | Skeleton khối hồ sơ + 2 công tắc; nút Lưu / công tắc spinner khi đang lưu |
| Empty | Không áp dụng |
| Error | Lỗi dưới ô 4; toast cho công tắc / đăng xuất / xóa |
| Không có quyền | Chưa đăng nhập → SCR-01 |

## 5. Ghi chú UX
- Desktop: mục "Cài đặt" ở sidebar; nội dung một cột rộng tối đa 560px; SCR-12 mở trong cùng vùng nội dung.
- Bật ẩn danh không ảnh hưởng lời mời đang chờ (Q-029).
