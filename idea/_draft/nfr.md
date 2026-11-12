# Non-Functional Requirements — bản nháp

> Nguồn: `idea/business.md`, `_draft/supporting.md`, Q-038 → Q-039 · Cập nhật: 2026-11-12
> Bối cảnh: 1k–10k người dùng năm đầu, web responsive ưu tiên điện thoại, chỉ tiếng Việt, tin nhắn mã hóa khi lưu (Q-038).

| ID | Nhóm | Yêu cầu | Chỉ số đo được | Ưu tiên | Áp dụng cho | Q-ref |
|---|---|---|---|---|---|---|
| NFR-01 | Performance | Tin mới tới các thành viên đang mở app gần như tức thì | P95 ≤ 1 giây từ lúc bấm Gửi tới lúc hiện trên máy người nhận (tin chữ) | Must | BIZ-10, SUP-09 | Q-039 |
| NFR-02 | Performance | Đang soạn tin, online/offline, đã xem, thu hồi cập nhật nhanh | P95 ≤ 2 giây | Should | BIZ-10, SUP-09 | Q-039 |
| NFR-03 | Performance | Mở một phòng hiện ngay các tin gần nhất | P95 ≤ 1,5 giây hiện 50 tin mới nhất trên mạng 4G; tin cũ hơn tải thêm khi cuộn | Must | BIZ-10 | Q-039 |
| NFR-04 | Performance | Thao tác thường phản hồi nhanh (tra email, gửi/phản hồi lời mời, tạo phòng, thêm/kick, cài đặt) | P95 ≤ 1 giây | Should | BIZ-02 → BIZ-09 | Q-039 |
| NFR-05 | Performance | Gửi tin có ảnh | Tin 10 ảnh / 10MB gửi xong P95 ≤ 10 giây trên 4G; có thanh tiến độ; ảnh xem trước hiện ≤ 2 giây | Should | BIZ-10, SUP-08 | Q-039 |
| NFR-06 | Performance | Mở Buddio lần đầu | Trang chính dùng được ≤ 3 giây trên 4G | Should | Toàn hệ thống | Q-039 |
| NFR-07 | Scalability | Đáp ứng quy mô năm đầu | 10k người dùng; 1k người online cùng lúc (gấp đôi ước tính 500); 200k tin/ngày; phòng tối đa 50 người. Mở rộng tới 100k người dùng chỉ bằng thêm tài nguyên, không đổi nghiệp vụ | Must | Toàn hệ thống | Q-038 |
| NFR-08 | Scalability | Các giới hạn nghiệp vụ điều chỉnh được không cần sửa chương trình | 50 người/phòng (BR-15), 10 ảnh và 10MB/tin (BR-21), 30 ngày lưu thông báo, 7 ngày hạn link | Should | BIZ-08, BIZ-09, BIZ-10, SUP-06, SUP-07 | Q-016, Q-022 |
| NFR-09 | Availability | Hệ thống sẵn sàng | ≥ 99,5% / tháng (ngừng tối đa ~3,6 giờ/tháng); bảo trì có báo trước trong app ≥ 24 giờ | Should | Toàn hệ thống | Q-039 |
| NFR-10 | Availability | Mất mạng không mất tin | Tự kết nối lại; sau khi có mạng, tải bù mọi tin bị lỡ; không mất, không trùng tin; tin gửi lỗi hiện "Gửi thất bại" + gửi lại (Q-029) | Must | BIZ-10, SUP-09 | Q-039 |
| NFR-11 | Security | Xác thực | Chỉ đăng nhập Google (BR-01). Phiên tự hết sau 30 ngày không dùng. Đăng xuất / xóa tài khoản kết thúc phiên ngay | Must | BIZ-01, BIZ-11 | Q-039 |
| NFR-12 | Security | Bảo mật nội dung tin nhắn | Nội dung chữ và ảnh **mã hóa khi lưu** và **khi truyền**; khóa mã hóa giữ tách biệt với dữ liệu; người lấy được bản sao dữ liệu không đọc được nội dung. Không mã hóa đầu-cuối (để giữ BR-20) | Must | BIZ-10, BR-23, SUP-08 | Q-038 |
| NFR-13 | Security | Phân quyền luôn được hệ thống kiểm tra | Mọi thao tác kiểm tra quyền phía hệ thống (không tin vào giao diện): chỉ thành viên đang tham gia đọc được tin, ảnh, danh sách thành viên; chỉ host làm thao tác host. Ảnh không có đường dẫn công khai; đường dẫn xem ảnh hết hiệu lực sau ≤ 1 giờ | Must | BIZ-09, BIZ-10, SUP-08 | Q-039 |
| NFR-14 | Security | Link mời an toàn | Email trong link được mã hóa, không đọc được; link không sửa / giả mạo được (sửa → không hợp lệ); không đoán được link của người khác | Must | BIZ-03, BIZ-05, SUP-07 | Q-033, Q-036 |
| NFR-15 | Security / Privacy | Không lộ sự tồn tại tài khoản (BR-04) | Kết quả "Không tìm thấy" giống hệt nhau về nội dung **và thời gian phản hồi** (chênh lệch trung bình ≤ 50ms) giữa: chưa đăng ký / ẩn danh / có chặn. Link mời sai email không hiện email được mời | Must | BIZ-03, BIZ-05 | Q-023, Q-039 |
| NFR-16 | Security | Hạn chế dò email hàng loạt | Một người tra quá 100 email trong 1 giờ → tạm khóa ô tra trong 1 giờ. Không áp cho việc gửi lời mời / tạo link (Q-034) | Should | BIZ-03 | Q-039 |
| NFR-17 | Privacy / Compliance | Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân | Lần đăng nhập đầu hiện chính sách quyền riêng tư và người dùng đồng ý; chỉ thu email, tên, ảnh từ Google; không chia sẻ cho bên thứ ba | Must | BIZ-01 | Q-039 |
| NFR-18 | Privacy / Data retention | Xóa tài khoản xóa thật | Email, tên, ảnh không còn hiển thị ngay (BR-28); xóa hẳn khỏi hệ thống ≤ 24 giờ, khỏi bản sao lưu ≤ 30 ngày | Must | BIZ-11 | Q-039 |
| NFR-19 | Privacy / Data retention | Tin hết hạn, thu hồi, phòng giải tán biến mất thật | Biến mất khỏi màn hình ≤ 1 phút sau thời điểm hết hạn / thao tác; nội dung và ảnh xóa hẳn khỏi hệ thống ≤ 24 giờ, khỏi bản sao lưu ≤ 7 ngày | Must | BIZ-09, BIZ-10, SUP-05, SUP-08 | Q-039 |
| NFR-20 | Data retention / Backup | Sao lưu & khôi phục | Sao lưu hằng ngày, giữ 7 ngày. Mất tối đa 24 giờ dữ liệu (RPO 24h); khôi phục trong 4 giờ (RTO 4h) | Should | Toàn hệ thống | Q-039 |
| NFR-21 | Data retention | Thông báo | Tự xóa sau 30 ngày (SUP-06) | Must | SUP-03, SUP-06 | Q-032 |
| NFR-22 | Usability | Ưu tiên điện thoại | Dùng đầy đủ trên màn hình rộng từ 360px; gửi tin ≤ 2 chạm sau khi mở phòng; mời bạn ≤ 3 bước | Must | Toàn hệ thống | Q-038 |
| NFR-23 | Usability / Accessibility | Dễ đọc | Độ tương phản chữ đạt WCAG 2.1 AA; vùng chạm ≥ 44×44px | Could | Toàn hệ thống | Q-039 |
| NFR-24 | i18n | Ngôn ngữ & giờ | Chỉ tiếng Việt. Giờ hiển thị theo múi giờ thiết bị (mặc định GMT+7). Hạn tin tính theo thời gian tuyệt đối từ lúc gửi | Must | Toàn hệ thống | Q-038 |
| NFR-25 | Compatibility | Trình duyệt hỗ trợ | Chrome, Edge, Firefox, Safari: 2 phiên bản mới nhất; Safari iOS 16+; Chrome Android 2 phiên bản mới nhất | Must | Toàn hệ thống | Q-038 |
| NFR-26 | Observability | Theo dõi & cảnh báo | Ghi lỗi tập trung; cảnh báo đội vận hành khi: tỉ lệ gửi tin lỗi > 1% trong 5 phút; việc xóa tin hết hạn trễ > 1 giờ; đăng nhập Google lỗi > 5% trong 5 phút; hệ thống không phản hồi > 2 phút | Should | SUP-05, BIZ-01, BIZ-10 | Q-039 |
| NFR-27 | Observability / Privacy | Nhật ký không lộ dữ liệu | Nhật ký không ghi nội dung tin, ảnh, email dạng đọc được | Must | Toàn hệ thống | Q-039 |
