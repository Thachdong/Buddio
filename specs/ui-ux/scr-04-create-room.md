# SCR-04 Tạo phòng

- **Actor:** ACT-01 (trở thành ACT-03 của phòng mới)
- **BIZ thể hiện:** BIZ-08 — mở cuộc trò chuyện 1-1 hoặc nhóm với bạn bè và chọn **một lần duy nhất** cách lưu tin (ngắn hạn + thời hạn, hoặc lâu dài); vì lựa chọn không đổi được (BR-16) nên cần màn riêng có cảnh báo rõ.
- **FLOW:** FLOW-08 (bước 1–8, A1, A2, E1, E2)
- **Đến từ:** SCR-03 (nút Tạo phòng) · **Đi tới:** SCR-05 (tạo xong), SCR-07 (chưa có bạn), SCR-03 (quay lại)
- **Wireframe:** [drawio](./drawio/scr-04-create-room.drawio) — 2 trang: *Form tạo phòng*, *Chưa có bạn*. Chưa export PNG.

## 1. Layout
Màn con toàn màn hình, ẩn thanh tab. Header có nút quay lại → form cuộn: tên phòng → chọn thành viên (ô lọc, chip đã chọn, danh sách bạn có checkbox) → chế độ lưu → thời hạn → cảnh báo → thanh nút "Tạo phòng" dính đáy.

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Header "Tạo phòng" + nút ← | header | — | Rời màn khi đã nhập → hỏi "Bỏ tạo phòng?" `[ASSUMED → Q-044]` |
| 2 | Tên phòng | input text | Không bắt buộc; placeholder "Để trống: hiển thị tên thành viên"; bộ đếm "n/50" | Trim; ≤ `limits.room_name_max` (50, Q-037) – chặn gõ quá |
| 3 | Lọc bạn bè | input search | Lọc **cục bộ** danh sách bạn theo tên / email `[ASSUMED → Q-044]` (không phải tìm người – BR-03) | — |
| 4 | Chip đã chọn + bộ đếm | chip list + text | Tên người đã chọn (bấm × để bỏ); "Đã chọn n/49" | 1 ≤ n ≤ `limits.max_room_members − 1` (49) (BR-15) |
| 5 | Danh sách bạn bè | list + checkbox | Ảnh, tên, email từ `friendships` + `profiles` (BR-27) | Khi đã đủ 49: checkbox còn lại disabled + gợi ý "Phòng tối đa 50 thành viên" |
| 6 | Chế độ lưu | radio (2 thẻ) | "Ngắn hạn – tin tự xóa sau thời hạn" / "Lâu dài – giữ vĩnh viễn". **Không chọn sẵn** `[ASSUMED → Q-044]` để buộc người dùng chủ động chọn | Bắt buộc (BR-16) |
| 7 | Thời hạn tin nhắn | chip group | 1 ngày / 2 ngày / 3 ngày / 1 tuần / 1 tháng / 3 tháng (từ `limits.ttl_days_options` = 1,2,3,7,30,90). Chỉ hiện khi chọn Ngắn hạn | Bắt buộc nếu Ngắn hạn (BR-16) |
| 8 | Cảnh báo | banner | "Chế độ lưu và thời hạn **không đổi được** sau khi tạo phòng." | BR-16 |
| 9 | Nút "Tạo phòng" | button chính (sticky) | — | Disabled cho tới khi: ≥1 bạn được chọn, đã chọn chế độ lưu (+ thời hạn) |
| 10 | Trạng thái chưa có bạn | empty state | "Bạn chưa có người bạn nào. Cần ít nhất 1 người bạn để tạo phòng." + nút "Mời bạn" | BR-15, FLOW-08 E1 |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-04.A0 | Tải danh sách bạn bè để chọn | Không API — Firestore listener `friendships` where `member_uids array-contains me` orderBy `since desc`; `profiles/{uid}` (get) | Hiện 5; rỗng → 10 | "Không tải được danh sách bạn" + "Thử lại" |
| SCR-04.A1 | Tạo phòng (nút 9) | `createRoom` (`POST /rooms`, body `{name?, memberUids[], retention, ttlDays?}`) | Tạo phòng, host = mình, tin hệ thống "A đã tạo phòng", người được thêm nhận thông báo → thay màn bằng SCR-05 của phòng mới (back từ SCR-05 về SCR-03) | `MEMBERS_NOT_FRIENDS` (một người vừa hủy kết bạn / chặn – E2, Q-037): bỏ người đó khỏi danh sách + báo "Người này không còn trong danh sách bạn bè"; `ROOM_FULL` → báo vượt 50; `VALIDATION_FAILED` → báo lỗi tại field; lỗi mạng → toast, giữ form |
| — | "Mời bạn" (trạng thái 10) | NAV → SCR-07 | — | — |

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | Skeleton danh sách bạn; khi tạo: nút 9 spinner "Đang tạo…", khóa form |
| Empty | 10 (chưa có bạn); lọc không khớp → "Không có bạn nào khớp" |
| Error | Lỗi tại field (2, 4, 6, 7) hoặc toast |
| Không có quyền | Chưa đăng nhập → SCR-01 |

## 5. Ghi chú UX
- Desktop: dialog lớn (~560×720) phủ lên SCR-03 + SCR-05; thanh nút ở chân dialog.
- Đã có phòng với cùng người vẫn tạo được phòng mới (Q-002), không cảnh báo trùng.
- Tên phòng để trống → hiển thị tên thành viên (Q-012).
