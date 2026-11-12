# SCR-09 Lời mời kết bạn (Đã nhận / Đã gửi)

- **Actor:** ACT-01
- **BIZ thể hiện:** BIZ-04, BIZ-03, BIZ-07 — người nhận cần một chỗ quyết định chấp nhận / từ chối / chặn các lời mời đang chờ; người gửi cần xem và thu hồi lời mời của mình (BR-08).
- **FLOW:** FLOW-04 (bước 1–…, A1–A4, E1, E2), FLOW-03 A3/A6, FLOW-07a A3
- **Đến từ:** SCR-08 (hàng Lời mời), SCR-07 (Xem lời mời đã gửi → tab Đã gửi), SCR-10 (thông báo lời mời mới → tab Đã nhận) · **Đi tới:** SCR-08 (Hủy kết bạn khi đã là bạn), quay lại
- **Wireframe:** [drawio](./drawio/scr-09-friend-requests.drawio) — 3 trang: *Đã nhận* (kèm xác nhận chặn), *Đã gửi* (kèm trống), *Đã là bạn / hết hiệu lực*. Chưa export PNG.

## 1. Layout
Màn con toàn màn hình, ẩn thanh tab. Header (← + "Lời mời kết bạn") → 2 tab "Đã nhận (n)" / "Đã gửi (n)" → danh sách lời mời đang chờ, mới nhất trước.

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Header "Lời mời kết bạn" + ← | header | — | — |
| 2 | Tab Đã nhận / Đã gửi | tabs | Số lời mời `pending` mỗi tab | — |
| 3 | Hàng lời mời đã nhận | list item | Ảnh, tên người gửi (`profiles`), thời gian gửi tương đối, "· qua link mời" khi `channel = link`. **Không** hiện email người gửi `[ASSUMED → Q-044]` (chưa là bạn – BR-27) | — |
| 4 | Nút "Chấp nhận" | button chính | — | — |
| 5 | Nút "Từ chối" | button phụ | — | — |
| 6 | Menu ⋮ → "Chặn" | menu | Mở 10 | BR-14 |
| 7 | Hàng lời mời đã gửi | list item | Ảnh, tên người nhận, "Đã gửi … · Đang chờ" | — |
| 8 | Nút "Thu hồi" | button phụ | Không cần xác nhận `[ASSUMED → Q-044]` (thao tác nhẹ, gửi lại được ngay) | BR-08 |
| 9 | Dialog "Hai bạn đã là bạn bè" | modal | "{tên} đã chấp nhận lời mời của bạn trước đó nên lời từ chối không có hiệu lực. Bạn có muốn hủy kết bạn không?" Đóng / Hủy kết bạn | BR-09 (FLOW-04 A1) |
| 10 | Dialog xác nhận chặn | modal | "Chặn {tên}? Lời mời này sẽ bị đóng. Hai bạn sẽ không tìm thấy nhau qua email và không nhắn tin cho nhau được. {tên} không được báo." | BR-14 |
| 11 | Trạng thái rỗng | empty state | "Không có lời mời nào đang chờ" (mỗi tab) | — |
| 12 | Toast "Lời mời không còn hiệu lực" | toast | Khi lời mời đã thu hồi / đóng / người gửi xóa tài khoản; hàng tự biến mất | FLOW-04 E1 |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-09.A0 | Tải lời mời đã nhận đang chờ | Không API — Firestore listener `friend_requests` where `to_uid == me` && `status == pending` orderBy `created_at desc`; `profiles/{from_uid}` (get) | Tab Đã nhận | "Không tải được" + "Thử lại" |
| SCR-09.A1 | Tải lời mời đã gửi đang chờ | Không API — Firestore listener `friend_requests` where `from_uid == me` && `status == pending` orderBy `created_at desc`; `profiles/{to_uid}` (get) | Tab Đã gửi | như A0 |
| SCR-09.A2 | Chấp nhận (4) | `acceptFriendRequest` (`POST /friend-requests/{requestId}/accept`) | Hàng biến mất; toast "Hai bạn đã là bạn bè"; người gửi nhận thông báo; lời mời ngược chiều tự đóng; phòng 2 người cũ mở lại (nếu không còn chặn) | `FRIEND_REQUEST_NOT_PENDING` → 12. Thu hồi trùng lúc chấp nhận → chấp nhận thắng (E2), xử lý ở server |
| SCR-09.A3 | Từ chối (5) | `rejectFriendRequest` (`POST /friend-requests/{requestId}/reject`) | Hàng biến mất; toast "Đã từ chối"; người gửi nhận thông báo, phải chờ 24h mới gửi lại (BR-10) | `ALREADY_FRIENDS` → 9 (A1); `FRIEND_REQUEST_NOT_PENDING` → 12 |
| SCR-09.A4 | Chặn người gửi (6 → 10) | `createBlock` (`POST /blocks`, body `{blockedUid}`) | Lời mời đóng, hàng biến mất; toast "Đã chặn {tên}" | `ALREADY_BLOCKED` → toast "Bạn đã chặn người này" |
| SCR-09.A5 | Thu hồi lời mời đã gửi (8) | `withdrawFriendRequest` (`POST /friend-requests/{requestId}/withdraw`) | Hàng biến mất; toast "Đã thu hồi lời mời" | `FRIEND_REQUEST_NOT_PENDING` (người kia vừa chấp nhận – BIZ-03 E2) → toast "Hai bạn đã là bạn bè" |

Điều hướng: 9 → "Hủy kết bạn" → SCR-08 mở sẵn dialog hủy kết bạn với người đó (wireframe.md mục 3).

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | 3 hàng skeleton mỗi tab; nút đang gửi hiện spinner, khóa các nút khác của hàng |
| Empty | 11 |
| Error | Toast; 12 |
| Không có quyền | Chưa đăng nhập → SCR-01 |
| Người gửi đã xóa tài khoản | Lời mời đã bị đóng (`purgeAccount`) → tự biến mất khỏi danh sách |

## 5. Ghi chú UX
- Desktop: hiển thị trong vùng nội dung mục "Bạn bè" (cột rộng tối đa 720px) với nút quay lại.
- Mở từ SCR-10 lời mời mới → chọn tab Đã nhận và làm nổi bật hàng tương ứng `[ASSUMED → Q-044]`.
