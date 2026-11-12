# Nghiệp vụ phụ trợ (Supporting) — bản nháp

> Nguồn: `idea/business.md`, Q-030 → Q-034 · Cập nhật: 2026-11-12

## 1. Danh sách SUP
| ID | Tên | Loại | Kích hoạt bởi | Người nhận / tác động | Nội dung chính · Kênh | Trong MVP? | Q-ref |
|---|---|---|---|---|---|---|---|
| SUP-01 | Thông báo kết bạn | notification | BIZ-03 (gửi lời mời trong platform), BIZ-05 (mở link → phát sinh lời mời), BIZ-04 (chấp nhận / từ chối) | Người nhận lời mời; người gửi (khi bị từ chối / đã thành bạn) | 3 loại: "Có lời mời kết bạn mới từ A" (kèm nút Chấp nhận / Từ chối / Chặn), "A đã từ chối lời mời", "A và bạn đã trở thành bạn bè". Kênh: in-app | Có | raw, Q-029 |
| SUP-02 | Thông báo sự kiện phòng | notification | BIZ-08 (tạo phòng), BIZ-09c (thêm), BIZ-09d (kick), BIZ-09e/f (chuyển quyền, host rời), BIZ-09g (giải tán), BIZ-11 (host xóa tài khoản → tự chuyển quyền) | Người được thêm; người bị kick; mọi thành viên khác (giải tán); người nhận quyền host | 4 loại: "A đã thêm bạn vào phòng X", "Bạn đã bị mời ra khỏi phòng X", "Phòng X đã bị giải tán", "Bạn đã trở thành host phòng X". Kênh: in-app | Có | Q-030 |
| SUP-03 | Danh sách thông báo & đã đọc | notification | Mọi SUP-01, SUP-02 | Người nhận thông báo | Xem danh sách thông báo mới nhất trước, đánh dấu đã đọc (từng cái / tất cả), badge số thông báo chưa đọc. Mở thông báo → đi tới đối tượng liên quan (lời mời, phòng). Thông báo về phòng đã giải tán / bị kick chỉ để đọc | Có | Q-018, Q-031 |
| SUP-04 | Tóm tắt phòng & số tin chưa đọc | notification (in-app) | BIZ-10 (gửi / xem tin) | Mọi thành viên đang tham gia | Danh sách phòng hiện tin cuối (hoặc "Đã thu hồi" / ảnh), thời điểm, số tin chưa đọc mỗi phòng; tổng số tin chưa đọc. Tin nhắn mới **không** tạo thông báo ở SUP-03 | Có | Q-030, Q-033 |
| SUP-05 | Tự xóa tin & ảnh hết hạn | scheduler | BIZ-10, phòng chế độ Ngắn hạn (BR-16) | Mọi thành viên phòng | Tới thời điểm hết hạn (gửi + thời hạn phòng) → tin, ảnh, tin hệ thống biến mất với mọi người, không khôi phục được | Có | raw, Q-003 |
| SUP-06 | Tự dọn thông báo cũ | scheduler | ENT-10 | Người nhận thông báo | Thông báo quá 30 ngày (kể cả chưa đọc) bị xóa | Có | Q-032 |
| SUP-07 | Link mời tự chứa (không lưu khi tạo) | auth / security | BIZ-03 (trường hợp f), BIZ-05 | Người mời, người được mời | Link chứa người mời + email được mời (đã mã hóa, không lộ) + hạn 7 ngày. Tạo link không lưu gì → không bị spam làm phình dữ liệu; không giới hạn số link; link mới không vô hiệu link cũ. Hiệu lực kiểm tra lúc mở: còn hạn, đúng email, chưa là bạn, không chặn, người mời còn hoạt động. Mở lại khi lời mời đang chờ → hiện lời mời đó | Có | Q-007, Q-033, Q-034 |
| SUP-08 | Lưu trữ ảnh tin nhắn | file | BIZ-10 (gửi tin có ảnh), BIZ-10 (thu hồi), SUP-05 (hết hạn), BIZ-09g (giải tán) | Người gửi; thành viên phòng | Nhận tối đa 10 ảnh/tin, tổng ≤10MB, chỉ ảnh; chỉ thành viên đang tham gia xem được; ảnh bị xóa hẳn khi thu hồi, hết hạn hoặc phòng bị xóa | Có | raw, Q-022 |
| SUP-09 | Cập nhật tức thời trong phòng | realtime | BIZ-10, BIZ-09, BIZ-02 (tắt hiển thị online) | Thành viên phòng, bạn bè | Tin mới, thu hồi, tin hệ thống, đã xem, đang soạn tin, online/offline hiển thị ngay không cần tải lại; bị kick / phòng giải tán → đóng phòng ngay. Độ trễ cụ thể → NFR | Có | Q-026 → Q-028 |
| SUP-10 | Push notification (trình duyệt / điện thoại) | notification | SUP-01, SUP-02, tin mới | Người dùng không mở app | Báo tin mới và lời mời khi không mở app; không hiển thị nội dung tin | **Ngoài MVP** (làm sau) | Q-031 |
| SUP-11 | Email thông báo | email | SUP-01 | Người nhận lời mời | — | Ngoài phạm vi | Q-031 |
| SUP-12 | Tắt tiếng từng phòng | notification setting | — | — | — | Ngoài phạm vi | Q-031 |
| SUP-13 | Giới hạn số lời mời / link mỗi ngày | anti-abuse | — | — | Đã thay bằng SUP-07 | Ngoài phạm vi | Q-034 |
| SUP-14 | Quản lý phiên nhiều thiết bị; nhật ký bảo mật (audit) | auth / audit | — | — | Đăng xuất thường vẫn có ở BIZ-01 | Ngoài phạm vi | Q-033 |

## 2. Đã xem xét, không cần SUP riêng
- **Job vô hiệu link sau 7 ngày:** không cần — hạn dùng nằm trong link (SUP-07).
- **Báo cáo / dashboard, payment, import, i18n, search phức tạp:** không có tín hiệu trong business.md (không có admin – Q-005, không có tiền, chỉ tìm bằng email chính xác).
- **Quản lý hồ sơ cá nhân:** đã là BIZ-02.

## 3. Thay đổi nghiệp vụ phát sinh (đã cập nhật business.md)
- ENT-03, BR-06, BIZ-03 (f): link tự chứa, bỏ quy tắc "link mới vô hiệu link cũ" (Q-033, Q-034).
- ENT-10: danh sách loại thông báo, lưu 30 ngày, chỉ in-app (Q-030 → Q-032).
- BIZ-08, BIZ-09g, BIZ-10: thông báo phòng, tóm tắt phòng & số chưa đọc.

## 4. Ghi chú cho Phase 3
- SUP-07: link dạng tự chứa, mã hóa — không cần bảng lưu link lúc tạo (Q-033).
- SUP-10 Push: thiết kế sao cho thêm sau không phải sửa SUP-01/02.
