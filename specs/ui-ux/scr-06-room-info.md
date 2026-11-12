# SCR-06 Thông tin phòng & thành viên

- **Actor:** ACT-03 (host – mọi thao tác), ACT-04 (thành viên – xem, rời phòng, chặn)
- **BIZ thể hiện:** BIZ-09, BIZ-07 — host cần một chỗ điều hành phòng (đổi tên, thêm bạn, kick, chuyển quyền, giải tán) và mọi thành viên cần xem ai trong phòng (tên, ảnh, email, online – BR-27), tự rời phòng hoặc chặn một người.
- **FLOW:** FLOW-09a–f, FLOW-07a (chặn từ danh sách thành viên)
- **Đến từ:** SCR-05 (ℹ / tên phòng) · **Đi tới:** SCR-05 (quay lại), SCR-03 (rời / giải tán / bị kick)
- **Wireframe:** [drawio](./drawio/scr-06-room-info.drawio) — 5 trang: *Góc nhìn host* (kèm menu thành viên), *Thành viên thường*, *Sửa tên & thêm thành viên*, *Rời phòng* (3 biến thể), *Các xác nhận* (giải tán, kick, chuyển host, chặn). Chưa export PNG.

## 1. Layout
Màn con toàn màn hình, ẩn thanh tab. Header (← + "Thông tin phòng") → khối phòng (tên + nút sửa, chế độ lưu, nhãn chỉ đọc) → tiêu đề "Thành viên (n/50)" + nút thêm → danh sách thành viên → nút "Rời phòng" và "Giải tán phòng" ở cuối. Nút/menu chỉ dành cho host bị **ẩn** với thành viên thường.

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Header "Thông tin phòng" + ← | header | → SCR-05 | — |
| 2 | Tên phòng + nút ✎ | text + icon button | `rooms.name` (trống → tên thành viên); ✎ chỉ host → 11 | BR-18 |
| 3 | Chế độ lưu | read-only box | "Ngắn hạn · tin tự xóa sau {thời hạn} (không đổi được)" / "Lâu dài · giữ vĩnh viễn (không đổi được)" | BR-16 |
| 4 | Nhãn "Chỉ đọc" | chip | Khi `rooms.read_only = true` | BR-13 |
| 5 | Tiêu đề "Thành viên (n/50)" | text | `member_count` / `limits.max_room_members` | BR-15 |
| 6 | Nút "+ Thêm thành viên" | button phụ | Chỉ host; disabled khi đủ 50 ("Phòng đã đủ 50 thành viên") | BR-15, BR-18 |
| 7 | Hàng thành viên | list item | Ảnh + chấm online (BR-25), tên (+ "(Bạn)"), email (BR-27), nhãn "Host"; host đứng đầu, sau đó theo `joined_at` | Chỉ thành viên `status = active` |
| 8 | Menu ⋮ của thành viên | bottom sheet | Host xem người khác: "Chuyển quyền host", "Mời ra khỏi phòng (kick)", "Chặn". Thành viên thường xem người khác: chỉ "Chặn". Không có ⋮ ở hàng của chính mình | BR-18 |
| 9 | Nút "Rời phòng" | button phụ | Mọi thành viên → 13 | BR-19 |
| 10 | Nút "Giải tán phòng" | button nguy hiểm | Chỉ host → 14 | BR-18, BR-19 |
| 11 | Dialog đổi tên phòng | modal + input | Tên hiện tại, bộ đếm "n/50", "Để trống để hiển thị tên các thành viên." | Trim; ≤ `limits.room_name_max` (50); không đổi → nút Lưu disabled |
| 12 | Sheet thêm thành viên | bottom sheet | "Còn n chỗ", ô lọc cục bộ, danh sách **bạn của host chưa có trong phòng** (checkbox), nút "Thêm (n)" | BR-18: chỉ bạn của host; số chọn ≤ chỗ còn lại (BR-15) |
| 13 | Dialog rời phòng | modal / sheet | (a) Thành viên: "Sau khi rời, bạn sẽ không còn thấy phòng và tin nhắn…" (b) Host còn người khác: **bắt buộc chọn người nhận quyền** (radio danh sách thành viên) → "Chuyển quyền và rời" (Q-029) (c) Host là người cuối cùng: "Rời phòng sẽ **xóa phòng** cùng toàn bộ tin nhắn và ảnh" → "Rời và xóa phòng" | BR-19 |
| 14 | Dialog xác nhận | modal | Giải tán: "Phòng … cùng toàn bộ tin nhắn và ảnh sẽ bị xóa vĩnh viễn. Mọi thành viên nhận thông báo." · Kick: "{Tên} sẽ không còn thấy phòng và nhận thông báo…" · Chuyển host: "Bạn sẽ trở thành thành viên thường…" · Chặn: hệ quả BR-14 (phòng 2 người → chỉ đọc, phòng nhóm vẫn chat, người bị chặn không được báo) | — |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-06.A0 | Tải thông tin phòng & thành viên | Không API — Firestore listener `rooms/{roomId}`, `rooms/{roomId}/members` where `status == active`; `profiles/{uid}` (get); RTDB `status/{uid}` | Hiện 2–7 realtime | Không còn là thành viên → về SCR-03 kèm thông báo (như SCR-05 #24) |
| SCR-06.A1 | Sửa tên phòng (host, 11) | `updateRoom` (`PATCH /rooms/{roomId}`, body `{name}`) | Tên cập nhật, tin hệ thống "A đã đổi tên phòng…" | `NOT_ROOM_HOST` (vừa mất quyền) → toast "Bạn không còn là host", ẩn nút host; `VALIDATION_FAILED` → lỗi tại ô |
| SCR-06.A8 | Tải danh sách bạn của host để chọn (12) | Firestore listener `friendships` where `member_uids array-contains me` + `profiles` (get) | Hiện bạn chưa có trong `rooms.member_uids` | Lỗi tải → thông báo trong sheet, nút thử lại |
| SCR-06.A2 | Thêm thành viên (host, 12) | `addRoomMembers` (`POST /rooms/{roomId}/members`, body `{uids[]}`). Danh sách chọn đọc từ Firestore listener `friendships` where `member_uids array-contains me`, loại người đã trong `rooms.member_uids` | Thêm vào phòng, tin hệ thống, người được thêm nhận thông báo; phòng 2 người đang chỉ đọc lên ≥3 người → hết chỉ đọc (BR-13) | `ROOM_FULL` (E1); `MEMBERS_NOT_FRIENDS` (E2 – vừa hủy kết bạn / chặn) → bỏ người đó khỏi danh sách + báo; `NOT_ROOM_HOST` → như A1 |
| SCR-06.A3 | Kick thành viên (host, 8 → 14) | `kickRoomMember` (`POST /rooms/{roomId}/members/{memberUid}/kick`) | Người đó biến mất khỏi 7, tin hệ thống, họ nhận thông báo | `MEMBER_NOT_IN_ROOM` → "Người này không còn trong phòng" (E1) |
| SCR-06.A4 | Chuyển quyền host (host, 8 → 14) | `transferRoomHost` (`POST /rooms/{roomId}/transfer-host`, body `{newHostUid}`) | Đổi vai trò, tin hệ thống, người nhận được thông báo; giao diện mình chuyển sang góc nhìn thành viên | `MEMBER_NOT_IN_ROOM` → "Người này không còn trong phòng" |
| SCR-06.A5 | Rời phòng (13) | `leaveRoom` (`POST /rooms/{roomId}/leave`, body `{newHostUid?}` – bắt buộc khi host và còn người khác) | → SCR-03, toast "Đã rời phòng"; host cuối cùng → phòng bị xóa (`purgeRoom`) | `HOST_TRANSFER_REQUIRED` → mở lại 13(b); `MEMBER_NOT_IN_ROOM` (người nhận vừa rời) → làm mới danh sách, chọn lại |
| SCR-06.A6 | Giải tán phòng (host, 14) | `deleteRoom` (`DELETE /rooms/{roomId}`) | Phòng xóa (`purgeRoom`), thành viên khác nhận thông báo → SCR-03, toast "Đã giải tán phòng" | `NOT_ROOM_HOST` → như A1 |
| SCR-06.A7 | Chặn một thành viên (8 → 14) | `createBlock` (`POST /blocks`, body `{blockedUid}`) | Toast "Đã chặn {tên}". Người đó vẫn ở phòng nhóm; phòng 2 người → chỉ đọc (BR-13) | `ALREADY_BLOCKED` → toast "Bạn đã chặn người này" (FLOW-07a A1) |

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | Skeleton khối phòng + 5 hàng thành viên |
| Empty | Phòng chỉ còn host: danh sách chỉ có mình + gợi ý "Thêm bạn vào phòng để trò chuyện" (Q-018) |
| Error | Toast theo thao tác; mất kết nối → banner chung |
| Không có quyền | Thành viên thường: ẩn 2(✎), 6, 10, mục host trong 8. Bị kick / phòng xóa khi đang xem → SCR-03 kèm thông báo |
| Phòng chỉ đọc | Nhãn 4; host vẫn thêm được bạn khác (BIZ-09 ngoại lệ) |
| Vừa nhận / mất quyền host (realtime) | Giao diện tự đổi theo `rooms.host_uid` |

## 5. Ghi chú UX
- Desktop: panel trượt bên phải khung chat (rộng ~360px), dialog hiển thị giữa màn.
- Không cần người được thêm / người nhận host đồng ý (Q-029).
- `[ASSUMED → Q-044]` Kick và chuyển quyền host có dialog xác nhận (yêu cầu chỉ nêu xác nhận cho chặn / giải tán / rời).
