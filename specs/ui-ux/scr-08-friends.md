# SCR-08 Bạn bè

- **Actor:** ACT-01
- **BIZ thể hiện:** BIZ-06, BIZ-07 — người dùng cần xem danh sách bạn (tên, ảnh, email, online – BR-25, BR-27) và từ đó hủy kết bạn hoặc chặn; đây cũng là cửa vào "Thêm bạn" và "Lời mời kết bạn".
- **FLOW:** FLOW-06 (bước 1–8, A1, A2, E1), FLOW-07a (chặn từ danh sách bạn), FLOW-04 A1 (hủy kết bạn khi từ chối nhưng đã là bạn)
- **Đến từ:** tab "Bạn bè", SCR-09 / SCR-02 (dialog "Hai bạn đã là bạn bè" → Hủy kết bạn), SCR-10 (thông báo từ chối / đã thành bạn) · **Đi tới:** SCR-07, SCR-09
- **Wireframe:** [drawio](./drawio/scr-08-friends.drawio) — 3 trang: *Danh sách bạn* (kèm menu), *Xác nhận* (hủy kết bạn, chặn), *Trống*. Chưa export PNG.

## 1. Layout
Màn tab. Header ("Bạn bè" + nút "+ Thêm bạn") → hàng "Lời mời kết bạn" có badge → tiêu đề "Bạn bè (n)" → danh sách bạn → thanh tab (Bạn bè đang chọn).

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Tiêu đề "Bạn bè" | header | — | — |
| 2 | Nút "+ Thêm bạn" | button | → SCR-07 | — |
| 3 | Hàng "Lời mời kết bạn" + badge | list item | Số lời mời **đã nhận** đang chờ (LAYOUT.A3) → SCR-09 | — |
| 4 | Tiêu đề "Bạn bè (n)" | text | Số bạn | — |
| 5 | Hàng bạn | list item | Ảnh + chấm online (chỉ khi mình bật `show_online` và bạn đó online – BR-25), tên, email (BR-27); sắp xếp theo tên A→Z `[ASSUMED → Q-044]` | — |
| 6 | Menu ⋮ | bottom sheet | "Hủy kết bạn", "Chặn", "Đóng" | — |
| 7 | Thanh tab | tab bar | Như layout chung | — |
| 8 | Dialog xác nhận hủy kết bạn | modal | "Hủy kết bạn với {tên}? Phòng chat chỉ có hai bạn sẽ chuyển sang chỉ đọc (vẫn xem được tin cũ). Phòng nhóm không bị ảnh hưởng. {tên} không nhận được thông báo." Không / Hủy kết bạn | BR-12, BR-13 |
| 9 | Dialog xác nhận chặn | modal | "Chặn {tên}? Hai bạn sẽ không còn là bạn bè, không tìm thấy nhau qua email; lời mời giữa hai bạn bị đóng. Phòng chỉ có hai bạn chuyển sang chỉ đọc. Phòng nhóm vẫn chat bình thường. {tên} không được báo." Hủy / Chặn | BR-14 |
| 10 | Trạng thái rỗng | empty state | "Chưa có bạn bè" + "Nhập email của người quen để kết bạn hoặc gửi link mời." + nút "Thêm bạn" | — |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-08.A0 | Tải danh sách bạn bè (realtime) | Không API — Firestore listener `friendships` where `member_uids array-contains me`; `profiles/{uid}` (get); RTDB listener `status/{uid}` | Hiện 5 | "Không tải được danh sách bạn" + "Thử lại" |
| SCR-08.A1 | Hủy kết bạn (6 → 8) | `deleteFriend` (`DELETE /friends/{friendUid}`) | Bạn biến mất khỏi danh sách; toast "Đã hủy kết bạn". Phòng 2 người → chỉ đọc | `NOT_FRIENDS` (E1: bên kia vừa hủy trước) → toast "Hai bạn không còn là bạn bè", làm mới danh sách |
| SCR-08.A2 | Chặn một người bạn (6 → 9) | `createBlock` (`POST /blocks`, body `{blockedUid}`) | Bạn biến mất khỏi danh sách; toast "Đã chặn {tên}" | `ALREADY_BLOCKED` → toast "Bạn đã chặn người này" |
| SCR-08.A3 | Thêm bạn / Lời mời | NAV → SCR-07 / SCR-09 | — | — |

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | 6 hàng skeleton |
| Empty | 10 (hàng 3 vẫn hiện để vào xem lời mời) |
| Error | Toast; mất kết nối → banner chung |
| Không có quyền | Chưa đăng nhập → SCR-01 |
| Mở từ dialog "Hai bạn đã là bạn bè" (SCR-09/SCR-02) | Cuộn tới người đó và mở sẵn dialog 8 (wireframe.md mục 3) |

## 5. Ghi chú UX
- Desktop: mục "Bạn bè" ở sidebar; nội dung một cột rộng tối đa 720px; menu ⋮ là dropdown thay bottom sheet; SCR-07 mở dạng dialog.
- Không có tìm người theo tên (BR-03); danh sách bạn không có ô lọc ở phiên bản này `[ASSUMED → Q-044]`.
