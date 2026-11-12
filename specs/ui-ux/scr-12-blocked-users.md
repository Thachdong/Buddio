# SCR-12 Danh sách đã chặn

- **Actor:** ACT-01
- **BIZ thể hiện:** BIZ-07 — bỏ chặn chỉ thực hiện được từ danh sách những người mình đã chặn, và chỉ người chặn thấy danh sách này (BR-14).
- **FLOW:** FLOW-07b
- **Đến từ:** SCR-11 (Danh sách đã chặn) · **Đi tới:** SCR-11 (quay lại)
- **Wireframe:** [drawio](./drawio/scr-12-blocked-users.drawio) — 2 trang: *Danh sách đã chặn* (kèm xác nhận bỏ chặn), *Trống*. Chưa export PNG.

## 1. Layout
Màn con toàn màn hình, ẩn thanh tab. Header (← + "Danh sách đã chặn") → ghi chú quyền riêng tư → danh sách, mới chặn trước.

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Header "Danh sách đã chặn" + ← | header | → SCR-11 | — |
| 2 | Ghi chú | text | "Chỉ bạn thấy danh sách này. Người bị chặn không được báo khi bạn chặn hoặc bỏ chặn." | BR-14 |
| 3 | Hàng người bị chặn | list item | Ảnh, tên (`profiles`), "Đã chặn dd/MM/yyyy" (`blocks.created_at`). Không hiện email `[ASSUMED → Q-044]` | — |
| 4 | Nút "Bỏ chặn" | button phụ | → 5 | — |
| 5 | Dialog xác nhận bỏ chặn | modal | "Bỏ chặn {tên}? Hai bạn sẽ tìm thấy nhau qua email (nếu không ẩn danh) nhưng không tự kết bạn lại. Muốn trò chuyện cần gửi lời mời kết bạn mới. {tên} không được báo." Hủy / Bỏ chặn | BR-14 |
| 6 | Trạng thái rỗng | empty state | "Bạn chưa chặn ai" | — |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-12.A0 | Tải danh sách đã chặn | Không API — Firestore listener `blocks` where `blocker_uid == me` orderBy `created_at desc`; `profiles/{blocked_uid}` (get) | Hiện 3 | "Không tải được" + "Thử lại" |
| SCR-12.A1 | Bỏ chặn (4 → 5) | `deleteBlock` (`DELETE /blocks/{blockedUid}`) | Hàng biến mất; toast "Đã bỏ chặn {tên}". Không tự kết bạn; phòng 2 người vẫn chỉ đọc tới khi kết bạn lại (BR-13) | 404 (đã bỏ chặn ở thiết bị khác) → coi như thành công, làm mới |

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | 3 hàng skeleton |
| Empty | 6 |
| Error | Toast |
| Không có quyền | Chưa đăng nhập → SCR-01 |
| Người bị chặn đã xóa tài khoản | Quan hệ chặn bị xóa (Q-029) → tự biến mất |

## 5. Ghi chú UX
- Desktop: hiển thị trong vùng nội dung mục "Cài đặt" (rộng tối đa 560px) với nút quay lại.
