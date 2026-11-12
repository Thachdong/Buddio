# SCR-02 Mở link mời

- **Actor:** ACT-02 (chưa tham gia), ACT-01 (có email được mời)
- **BIZ thể hiện:** BIZ-05, BIZ-04, BIZ-07 — người ẩn danh hoặc chưa tham gia chỉ kết bạn được qua link mời (BR-06, BR-07); màn này kiểm tra link, bắt đăng nhập đúng email, rồi cho phản hồi lời mời (chấp nhận / từ chối / chặn) ngay tại chỗ.
- **FLOW:** FLOW-05 (bước 1–9, A1, A2, E1, E2) → FLOW-04 (chấp nhận / từ chối, A1, E1) · FLOW-07a (chặn từ lời mời)
- **Đến từ:** link ngoài `/invite/{token}` (landing của ACT-02), SCR-01 (đăng nhập xong khi đang mở dở link) · **Đi tới:** SCR-01, SCR-03
- **Wireframe:** [drawio](./drawio/scr-02-invite-link.drawio) — 4 trang: *Chưa đăng nhập*, *Lời mời hợp lệ*, *Link lỗi* (2 biến thể), *Dialog chặn*. Chưa export PNG.

## 1. Layout
Trang công khai, render ở server (NFR-06), không có thanh tab. Một cột căn giữa: logo → nội dung theo trạng thái → nút hành động full width (343px). Không bao giờ hiển thị email được mời (BR-06, NFR-15).

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Logo + "Buddio" | image + text | Tĩnh | — |
| 2 | Tiêu đề "Bạn nhận được một lời mời kết bạn" | text | Tĩnh — **không** hiện tên người mời khi chưa đăng nhập `[ASSUMED → Q-044]` | BR-07 |
| 3 | Mô tả | text | "Đăng nhập bằng đúng tài khoản Google có email được mời để xem lời mời." | — |
| 4 | Nút "Đăng nhập với Google" | button chính | → SCR-01.A1, giữ `token` | BR-01 |
| 5 | Ảnh người mời | avatar | `profile.photo_url` của người mời (từ kết quả A0) | — |
| 6 | Tên người mời | text | "**{display_name}** muốn kết bạn với bạn trên Buddio" (không hiện email người mời – BR-27 chỉ áp cho bạn bè) | — |
| 7 | Nút "Chấp nhận" | button chính | — | Lời mời phải `pending` |
| 8 | Nút "Từ chối" | button phụ | — | Lời mời phải `pending` |
| 9 | Link "Chặn người này" | text link | Mở dialog 13 | BR-14 |
| 10 | Thông điệp lỗi | icon + text | Biến thể 1: "Link không còn hiệu lực, hãy xin người mời link mới." (hỏng, hết hạn 7 ngày, người mời đã xóa tài khoản, đã là bạn, có chặn – FLOW-05 E1). Biến thể 2: "Link này không dành cho tài khoản của bạn." (sai email – E2) | BR-04/BR-06: mọi lý do của biến thể 1 dùng **cùng một câu**; biến thể 2 không hiện email được mời |
| 11 | Nút "Vào Buddio" | button | → SCR-03 | — |
| 12 | Nút "Đăng nhập tài khoản khác" | button | Chỉ ở biến thể 2: đăng xuất rồi về SCR-01 giữ `token` `[ASSUMED → Q-044]` | — |
| 13 | Dialog xác nhận chặn | modal | "Chặn {tên}? Lời mời này sẽ bị đóng. Hai bạn sẽ không tìm thấy nhau qua email và không nhắn tin cho nhau được. {tên} sẽ không được báo." Nút Hủy / Chặn | BR-14 |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-02.A0 | Kiểm tra link & lấy / tạo lời mời (tự chạy khi mở trang; chưa đăng nhập thì gọi không kèm token, chỉ kiểm hạn) | `openInviteLink` (`POST /invite-links/open`, body `{token}`) | Trả lời mời `pending` từ người mời tới mình (tạo mới kênh `link` + thông báo `friend_request_received`, hoặc trả lời mời đang chờ sẵn – A1; mở lại sau khi đã từ chối → lời mời mới, không áp 24h – A2) kèm `profile` người mời → hiện 5–9 | `INVITE_LINK_INVALID` → 10 biến thể 1 (E1); `INVITE_LINK_WRONG_ACCOUNT` → 10 biến thể 2 (E2); `CONSENT_REQUIRED` (có Google nhưng chưa có tài khoản) → dialog chính sách SCR-01.A2 rồi quay lại; lỗi mạng → toast + nút "Thử lại" |
| SCR-02.A1 | Đăng nhập với Google (nút 4) | NAV → SCR-01.A1 (`createSession`) | Quay lại SCR-02 với cùng `token`, chạy A0 | Như SCR-01 |
| SCR-02.A2 | Chấp nhận (nút 7) | `acceptFriendRequest` (`POST /friend-requests/{requestId}/accept`) | Hai người thành bạn; lời mời ngược chiều tự đóng; người mời nhận thông báo "đã thành bạn"; phòng 2 người cũ (nếu có) mở lại → toast "Hai bạn đã là bạn bè" → SCR-03 | `FRIEND_REQUEST_NOT_PENDING` → toast "Lời mời không còn hiệu lực" (FLOW-04 E1) → 10 biến thể 1 |
| SCR-02.A3 | Từ chối (nút 8) | `rejectFriendRequest` (`POST /friend-requests/{requestId}/reject`) | Lời mời → Đã từ chối; người mời nhận thông báo từ chối → toast "Đã từ chối lời mời" → SCR-03 | `ALREADY_FRIENDS` (FLOW-04 A1) → dialog "Hai bạn đã là bạn bè" + "Hủy kết bạn" (→ SCR-08 mở dialog hủy) / "Đóng"; `FRIEND_REQUEST_NOT_PENDING` → như A2 |
| SCR-02.A4 | Chặn người mời (9 → 13) | `createBlock` (`POST /blocks`, body `{blockedUid}`) | Tạo quan hệ chặn; lời mời đóng; không thông báo → toast "Đã chặn" → SCR-03 | `ALREADY_BLOCKED` → coi như thành công; lỗi khác → toast, giữ dialog |
| SCR-02.A5 | Đăng nhập tài khoản khác (nút 12) | `deleteCurrentSession` (`DELETE /sessions/current`) + client `signOut()` | Về SCR-01 giữ `token` | — |

Điều hướng: nút 11 → SCR-03.

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | Skeleton ảnh + 2 dòng chữ khi chạy A0; nút 7/8 hiện spinner khi đang gửi |
| Empty | Không áp dụng |
| Error | 10 (2 biến thể); lỗi mạng → toast + "Thử lại" |
| Không có quyền | Chưa đăng nhập → trang *Chưa đăng nhập* (1–4). Sai email → biến thể 2 |
| Token hỏng / hết hạn khi chưa đăng nhập | Gọi `openInviteLink` **không kèm** ID token (contract cho phép): `410 INVITE_LINK_INVALID` → hiện luôn biến thể 1, không bắt đăng nhập; `200 {status: login_required}` → trang *Chưa đăng nhập* (FLOW-05 bước 2 kiểm hạn trước bước 3) |

## 5. Ghi chú UX
- Desktop: khung giữa màn rộng tối đa 400px, giống mobile.
- Không lộ email được mời ở bất kỳ trạng thái nào (NFR-14, NFR-15).
- Sau khi chấp nhận/từ chối, `token` bị xóa khỏi sessionStorage để không chạy lại A0.
