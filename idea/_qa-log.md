# Q&A Log

## Q-001 · idea-parse · 2026-11-11
- **Hỏi:** Phần game (game plugin, cờ ca rô, đua vịt...) có ghi vào tài liệu nghiệp vụ phase này không?
- **Trả lời:** Bỏ hẳn — tài liệu phase này không nhắc đến game. (User cũng xác nhận bản đồ sơ bộ 6 ACT / 10 ENT / 10 BIZ là đúng.)
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** Phạm vi toàn bộ Phase 1–3; gap #1, #27 trong idea-map đóng lại.

## Q-002 · biz-actor-entity · 2026-11-11
- **Hỏi:** Chat 1-1 giữa 2 người bạn hoạt động thế nào — là phòng có host như chat nhóm, hay tự có cuộc trò chuyện riêng khi là bạn?
- **Trả lời:** Mọi cuộc trò chuyện đều là phòng có host; 1-1 là phòng chỉ có 2 người. Hai người có thể có nhiều phòng với nhau (vd 1 phòng ngắn hạn, 1 phòng lâu dài).
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-06, ENT-07, BIZ-08, BIZ-09

## Q-003 · biz-actor-entity · 2026-11-11
- **Hỏi:** Thời hạn X của phòng "lưu ngắn hạn" hoạt động thế nào?
- **Trả lời:** X cài cho cả phòng lúc tạo; mỗi tin nhắn/ảnh tự xóa sau X kể từ lúc gửi. Phòng vẫn tiếp tục dùng được.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-06, ENT-08, ENT-09, BIZ-08, BIZ-10, SUP tự xóa (Phase 2)

## Q-004 · biz-actor-entity · 2026-11-11
- **Hỏi:** Chế độ "ẩn danh" ảnh hưởng tới đâu?
- **Trả lời:** Chỉ ảnh hưởng việc bị người khác tìm thấy qua email. User ẩn danh vẫn tự gửi lời mời, nhận link, chat và được bạn bè thêm vào phòng bình thường.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ACT-01, ENT-01, BIZ-02, BIZ-03

## Q-005 · biz-actor-entity · 2026-11-11
- **Hỏi:** Có cần vai trò quản trị / kiểm duyệt ở phase này không?
- **Trả lời:** Chưa cần. Không có admin, không có báo cáo vi phạm; user tự bảo vệ bằng chặn, hủy bạn, rời phòng.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** Danh sách actor (không thêm actor), phạm vi out-of-scope

## Q-006 · biz-actor-entity · 2026-11-11
- **Hỏi:** Phòng "lưu lâu dài" giữ tin nhắn bao lâu?
- **Trả lời:** Vĩnh viễn — giữ đến khi tin/phòng bị xóa bởi người dùng.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-06, ENT-08

## Q-007 · biz-actor-entity · 2026-11-11
- **Hỏi:** Link mời kết bạn hoạt động thế nào?
- **Trả lời:** Theo khuyến nghị: gắn với email đã nhập (chỉ người đăng nhập đúng Google email đó mới dùng được), dùng 1 lần, hết hạn sau 7 ngày. **Bổ sung:** email người nhận không được xuất hiện dạng chữ thường (raw text) trong link — phải được mã hóa/che đi.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-03, BIZ-03, BIZ-05, BR mới (link không lộ email). Ghi chú Phase 3: cách che email trong link (mã hóa hoặc mã tham chiếu ngẫu nhiên).

## Q-008 · biz-actor-entity · 2026-11-11
- **Hỏi:** Lời mời kết bạn có hết hạn không? Người gửi có thu hồi được không?
- **Trả lời:** Không hết hạn; người gửi thu hồi được khi lời mời còn đang chờ.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-02, BIZ-03

## Q-009 · biz-actor-entity · 2026-11-11
- **Hỏi:** Sau khi chặn có bỏ chặn được không?
- **Trả lời:** Bỏ chặn được. Bỏ chặn không tự kết bạn lại (phải mời lại). Người bị chặn/bỏ chặn không nhận thông báo.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-05, BIZ-07

## Q-010 · biz-actor-entity · 2026-11-11
- **Hỏi:** Hồ sơ người dùng (tên hiển thị, ảnh đại diện) lấy từ đâu, có sửa được không?
- **Trả lời:** Lần đầu lấy tên + ảnh từ Google; user sửa được tên hiển thị, ảnh giữ theo Google.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-01, BIZ mới "Cập nhật hồ sơ" (hoặc gộp vào BIZ-02)

## Q-011 · biz-actor-entity · 2026-11-11
- **Hỏi:** Người khác thấy được thông tin gì của một user?
- **Trả lời:** Ai chung phòng (và bạn bè) cũng thấy tên hiển thị + ảnh + email.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-01 (quyền xem), ACT-04

## Q-012 · biz-actor-entity · 2026-11-11
- **Hỏi:** Phòng chat có tên / ảnh đại diện không?
- **Trả lời:** Có tên (không bắt buộc; trống thì hiển thị tên các thành viên), host đặt/sửa. Không có ảnh phòng.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-06, BIZ-08, BIZ-09

## Q-013 · biz-actor-entity · 2026-11-11
- **Hỏi:** Khi nào phòng chat bị xóa hẳn?
- **Trả lời:** Cả hai: (1) host là người cuối cùng rời phòng → phòng + toàn bộ tin/ảnh bị xóa; (2) host có thể giải tán (xóa) phòng bất cứ lúc nào, kể cả khi còn thành viên.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-06 (vòng đời), BIZ-09, BIZ mới/hành động mới "Giải tán phòng"

## Q-014 · biz-actor-entity · 2026-11-11
- **Hỏi:** Người bị kick hoặc tự rời phòng có còn xem tin nhắn cũ của phòng không?
- **Trả lời:** Không xem được nữa; phòng biến mất khỏi danh sách của họ. Nếu host thêm lại thì xem lại được như thành viên mới.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-07, ACT-04, BIZ-09, BIZ-10

## Q-015 · biz-actor-entity · 2026-11-11
- **Hỏi:** Thành viên được thêm vào phòng sau có thấy tin nhắn trước khi mình vào không?
- **Trả lời:** Thấy toàn bộ tin còn hạn trong phòng.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-07, ENT-08, BIZ-10

## Q-016 · biz-actor-entity · 2026-11-11
- **Hỏi:** Một phòng chat có tối đa bao nhiêu thành viên?
- **Trả lời:** Tối đa 50 (có thể điều chỉnh về sau).
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-06, BIZ-08, BIZ-09, BR mới

## Q-017 · biz-actor-entity · 2026-11-11
- **Hỏi:** User có tự xóa tài khoản được không?
- **Trả lời:** Có. Khi xóa: tự rời mọi phòng (phòng đang làm host tự chuyển quyền cho thành viên vào sớm nhất), hủy mọi quan hệ; tin đã gửi vẫn còn nhưng hiển thị "Người dùng đã xóa".
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-01 (vòng đời), ENT-07, ENT-08, BIZ mới "Xóa tài khoản"

## Q-018 · biz-actor-entity · 2026-11-11
- **Hỏi:** Xác nhận bảng 6 actor / 10 entity và 8 giả định: (1) mỗi chiều A→B tối đa 1 lời mời đang chờ, thành bạn thì lời mời còn lại tự đóng; (2) người ẩn danh không nhận gì cho tới khi tự mở link; (3) link mới cho cùng email làm link cũ vô hiệu, link vô hiệu khi đã là bạn/có chặn/người tạo xóa tài khoản; (4) chặn → đóng lời mời đang chờ, chặn 2 chiều độc lập, chỉ người chặn thấy danh sách chặn; (5) tạo phòng cần ≥1 bạn ngoài host, phòng chỉ còn host vẫn tồn tại; (6) tin nhắn phải có chữ hoặc ảnh; (7) xóa tài khoản rồi đăng nhập lại = tài khoản mới, kết bạn lại bằng lời mời mới; (8) thông báo có trạng thái đã đọc/chưa đọc.
- **Trả lời:** Đúng hết.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-01 → ENT-10 (các giả định chuyển thành quyết định)

## Q-019 · biz-capability · 2026-11-11
- **Hỏi:** Xác nhận danh sách 11 nghiệp vụ BIZ-01 → BIZ-11 (đăng nhập, cài đặt tài khoản, mời kết bạn, phản hồi lời mời, tham gia qua link, hủy kết bạn, chặn/bỏ chặn, tạo phòng, quản lý phòng & thành viên, nhắn tin, xóa tài khoản).
- **Trả lời:** Đúng.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BIZ-01 → BIZ-11 (BIZ-02 đổi tên "Cài đặt tài khoản", BIZ-09 đổi tên "Quản lý phòng & thành viên", thêm BIZ-11)

## Q-020 · biz-capability · 2026-11-11
- **Hỏi:** A và B có phòng chung; sau khi A hủy kết bạn hoặc chặn B thì các phòng chung xử lý thế nào?
- **Trả lời:** Chỉ khóa phòng 2 người: phòng chỉ còn đúng A và B → chỉ đọc (vẫn xem tin cũ). Phòng nhóm ≥3 người vẫn chat bình thường. Không thêm nhau vào phòng mới được. Kết bạn lại (và không còn chặn) thì phòng 2 người mở lại.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BIZ-06, BIZ-07, BIZ-09, BIZ-10, ENT-04, ENT-05, ENT-06, BR mới

## Q-021 · biz-capability · 2026-11-11
- **Hỏi:** Người gửi có thu hồi / sửa tin nhắn đã gửi không?
- **Trả lời:** Thu hồi được tin của mình bất cứ lúc nào (mọi người thấy "Đã thu hồi", ảnh kèm bị xóa); không sửa được.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-08 (thêm trạng thái Đã thu hồi), ENT-09, BIZ-10

## Q-022 · biz-capability · 2026-11-11
- **Hỏi:** Tin nhắn chứa được những loại nội dung nào?
- **Trả lời:** Chữ + ảnh. Tối đa 10 ảnh mỗi tin; **tổng dung lượng các ảnh trong một tin không quá 10MB** (giới hạn tính theo tin, không phải theo từng ảnh). Không có sticker/GIF/video/file.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-08, ENT-09 (sửa ràng buộc dung lượng), BIZ-10, BR mới

## Q-023 · biz-capability · 2026-11-11
- **Hỏi:** Khi nhập email của người chưa đăng ký hoặc người đang ẩn danh, màn hình hiển thị thế nào?
- **Trả lời:** Giống hệt nhau — cả 2 trường hợp chỉ hiện "Copy link mời"; người tìm không biết người kia có tài khoản hay không.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BIZ-03, BR mới (không lộ sự tồn tại tài khoản)

## Q-024 · biz-capability · 2026-11-11
- **Hỏi:** Sau khi bị từ chối, người gửi có được gửi lại lời mời cho cùng người đó không?
- **Trả lời:** Người bị từ chối được gửi lại sau 24 giờ. **Người đã từ chối** thì có thể chủ động gửi lời mời kết bạn cho người kia ngay lập tức (không bị chờ).
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BIZ-03, BIZ-04, BR mới

## Q-025 · biz-capability · 2026-11-11
- **Hỏi:** Có chặn được người chưa phải bạn không?
- **Trả lời:** Có — chặn được từ danh sách thành viên phòng, từ lời mời kết bạn, hoặc từ danh sách bạn bè.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BIZ-07, ENT-05

## Q-026 · biz-capability · 2026-11-11
- **Hỏi:** Phòng chat cần hiển thị những trạng thái nào?
- **Trả lời:** Cả 4: tin hệ thống trong phòng ("A đã thêm B", "C đã rời phòng"...), đã xem, đang soạn tin, trạng thái online.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BIZ-09, BIZ-10, ENT-01 (trạng thái online), ENT-08 (tin hệ thống, đã xem) — phát sinh gap: ai thấy online, chi tiết "đã xem"

## Q-027 · biz-capability · 2026-11-11
- **Hỏi:** Ai thấy được trạng thái online của một user? User có tắt được không?
- **Trả lời:** Bạn bè và người chung phòng thấy. Mặc định bật; user tắt được — khi tắt thì mình luôn hiện offline và cũng không thấy online của người khác.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-01 (thêm cài đặt "Hiển thị online"), BIZ-02, BIZ-10, BR mới

## Q-028 · biz-capability · 2026-11-11
- **Hỏi:** "Đã xem" hiển thị thế nào?
- **Trả lời:** Mỗi tin hiển thị những thành viên đã xem; luôn bật cho mọi người, không tắt được.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-08 (người đã xem), BIZ-10

## Q-029 · biz-capability · 2026-11-11
- **Hỏi:** Xác nhận danh sách 11 BIZ (actor – input – output) và 9 giả định: (1) chỉ tìm bằng email chính xác, chỉ host thêm người; (2) người được thêm vào phòng / người nhận quyền host không cần đồng ý; (3) chấp nhận → người gửi được báo, hủy kết bạn → bên kia không được báo; (4) ảnh cập nhật theo Google, tên đã sửa không bị ghi đè, tên ≤50 ký tự, đổi tên áp dụng cả tin cũ; (5) bật ẩn danh không ảnh hưởng lời mời đang chờ; (6) host rời phòng chọn người nhận quyền ngay trong thao tác rời; (7) xóa tài khoản có hiệu lực ngay, xóa luôn quan hệ chặn; (8) mở link khi đã có lời mời đang chờ → hiển thị lời mời đó, thu hồi trùng lúc chấp nhận → chấp nhận thắng; (9) gửi lỗi mạng → "gửi thất bại", cho gửi lại. Cách hiểu "dưới 10 ảnh/tin" = tối đa 10 ảnh.
- **Trả lời:** Đúng hết.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BIZ-01 → BIZ-11, BR-03, BR-11, BR-12, BR-18, BR-21, BR-29

## Q-030 · biz-supporting · 2026-11-12
- **Hỏi:** Sự kiện trong phòng nào tạo thông báo in-app?
- **Trả lời:** Cả 4: được thêm vào phòng, bị kick, phòng bị giải tán, được nhận quyền host (do chuyển quyền hoặc host cũ xóa tài khoản).
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-10 (loại thông báo), BIZ-08, BIZ-09, BIZ-11, SUP-02

## Q-031 · biz-supporting · 2026-11-12
- **Hỏi:** Báo tin mới / lời mời khi người dùng không mở app thế nào (push, email, tắt tiếng phòng)?
- **Trả lời:** Phiên bản đầu **không push**, chỉ báo trong app (danh sách thông báo, badge). Push để làm sau. Không email, không tắt tiếng phòng.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** SUP-10 (Push — ngoài MVP), SUP-11, SUP-12 (ngoài phạm vi)

## Q-032 · biz-supporting · 2026-11-12
- **Hỏi:** Thông báo in-app giữ bao lâu?
- **Trả lời:** 30 ngày, hệ thống tự xóa thông báo cũ hơn.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ENT-10, SUP-06

## Q-033 · biz-supporting · 2026-11-12
- **Hỏi:** Chức năng phụ trợ khác cho phiên bản đầu?
- **Trả lời:** Tóm tắt phòng & số tin chưa đọc. Thêm (ý của user): chống spam link mời làm phình dữ liệu → **link mời tự chứa email đã mã hóa** (cùng người mời, hạn dùng), lúc tạo link không lưu gì. Không chọn: quản lý phiên nhiều thiết bị, nhật ký bảo mật.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** SUP-04, SUP-07, ENT-03, BR-06. Ghi chú cho Phase 3 (tech-stack/db-design): link mời dạng tự chứa, mã hóa — không cần bảng lưu link lúc tạo; tính hợp lệ (hạn, bạn bè, chặn, người mời còn hoạt động) kiểm tra lúc mở link.

## Q-034 · biz-supporting · 2026-11-12
- **Hỏi:** Link mời không lưu lúc tạo → quy tắc "tạo link mới cho cùng email thì link cũ vô hiệu" (BR-06) xử lý sao? Có giới hạn số lời mời/link mỗi ngày không?
- **Trả lời:** **Bỏ quy tắc**: nhiều link cho cùng email cùng còn hiệu lực tới hạn 7 ngày; mở link nào cũng chỉ ra đúng 1 lời mời đang chờ. **Không giới hạn** số lời mời / link mỗi ngày.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BR-06, ENT-03, BIZ-03 (trường hợp f), SUP-09 (ngoài phạm vi)

## Q-035 · flow-detail · 2026-11-12
- **Hỏi:** Duyệt cách trình bày FLOW-03, FLOW-10 (10a/10b/10c) và 3 giả định: (1) người kia đổi trạng thái (bật ẩn danh/chặn) ngay trước khi mình bấm Gửi lời mời → hiện màn "Không tìm thấy", không lộ lý do; (2) phòng vừa thành chỉ đọc khi đang soạn → không gửi được; (3) vẫn thu hồi được tin của mình khi phòng đang chỉ đọc.
- **Trả lời:** Cách trình bày ổn, áp dụng cho các flow còn lại. Đúng cả 3.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** FLOW-03 (E3), FLOW-10a (E4), FLOW-10b

## Q-036 · flow-detail · 2026-11-12
- **Hỏi:** Link mời không lưu trạng thái "đã dùng". B đã từ chối lời mời phát sinh từ link của A, rồi mở lại chính link đó (còn hạn) thì sao?
- **Trả lời:** "Link có token → token chứa email + expiredAt." Hiểu là: hiệu lực link chỉ dựa trên email + hạn dùng (và điều kiện chưa là bạn, không chặn, người mời còn hoạt động) → mở lại khi còn hạn thì tạo lời mời mới, không áp luật chờ 24h (BR-10 chỉ ràng buộc người gửi chủ động gửi lại).
- **Trạng thái:** ANSWERED (diễn giải từ câu trả lời — user sửa nếu sai)
- **Ảnh hưởng:** FLOW-05 (A2), BR-06, BR-10, SUP-07. Ghi chú Phase 3: token link mời chứa email (mã hóa) + expiredAt (+ người mời).

## Q-037 · flow-detail · 2026-11-12
- **Hỏi:** Xác nhận 7 giả định: (1) Google không trả tên → dùng phần trước @ của email; (2) công tắc ẩn danh / online lưu ngay khi gạt; (3) tạo phòng mà 1 người vừa hủy kết bạn → bỏ khỏi danh sách chọn + báo; (4) host vừa mất quyền mà vẫn thao tác → báo lỗi quyền; (5) tên phòng ≤50 ký tự; (6) thông báo giải tán giữ tên phòng; (7) xóa tài khoản không thông báo cho ai trừ người nhận quyền host; thông báo cũ liên quan vẫn còn, mở ra báo "không còn hiệu lực".
- **Trả lời:** Đúng hết; riêng (4) câu báo là "Bạn không có quyền thực hiện thao tác này".
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** FLOW-01, FLOW-02, FLOW-08, FLOW-09, FLOW-11; BR-29 (tên phòng ≤50 ký tự – mới cho ENT-06)

## Q-038 · nfr-define · 2026-11-12
- **Hỏi:** Quy mô 12 tháng đầu? Mức bảo mật nội dung tin (mã hóa khi lưu hay đầu-cuối — đầu-cuối mâu thuẫn BR-20)? Nền tảng? Ngôn ngữ?
- **Trả lời:** 1k–10k người dùng (~500 online cùng lúc). **Mã hóa khi lưu** (+ khi truyền), không đầu-cuối. Web responsive, ưu tiên điện thoại. Chỉ tiếng Việt.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** BR-23, NFR-07, NFR-12, NFR-22, NFR-24, NFR-25

## Q-039 · nfr-define · 2026-11-12
- **Hỏi:** Xác nhận 27 NFR với giá trị đề xuất: tin ≤1s, trạng thái ≤2s, mở phòng ≤1,5s; 1k online; 99,5%/tháng; phiên hết sau 30 ngày không dùng; tra quá 100 email/giờ thì khóa ô tra 1 giờ; NĐ 13/2023 (đồng ý chính sách lần đầu); xóa tài khoản xóa hẳn ≤24h, khỏi backup ≤30 ngày; tin hết hạn/thu hồi biến mất ≤1 phút, xóa hẳn ≤24h; backup hằng ngày RPO 24h / RTO 4h; WCAG AA (Could); cảnh báo vận hành.
- **Trả lời:** Đúng hết.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** NFR-01 → NFR-27; BIZ-01 (đồng ý chính sách), BIZ-03 (giới hạn tra email)

## Q-040 · tech-stack-select · 2026-11-12
- **Hỏi:** Kỹ năng team? Hạ tầng & ngân sách? Ưu tiên ra nhanh hay mở rộng?
- **Trả lời:** TypeScript / Node.js. Hạ tầng: **Firestore, Firebase Storage, Firebase App Hosting**. Ưu tiên cân bằng.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ADR-01 → ADR-04

## Q-041 · tech-stack-select · 2026-11-12
- **Hỏi:** Đường ghi dữ liệu (qua server / trực tiếp từ client / lai)? Mã hóa nội dung tin (mặc định Google / cấp ứng dụng / CMEK)?
- **Trả lời:** **Ghi qua server** (Next.js route handler + Admin SDK; client chỉ đọc realtime). **Mã hóa mặc định của Google** + TLS.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ADR-03, ADR-07, NFR-12

## Q-042 · tech-stack-select · 2026-11-12
- **Hỏi:** Vai trò Cloud Functions? (user hỏi chi tiết) → Dùng `customTime` + lifecycle để xóa ảnh, TTL để xóa tin có được không? Việc nền dài chạy bằng gì? Duyệt đề xuất Realtime DB cho presence, chưa resize ảnh, region Singapore + hồ sơ NĐ 13.
- **Trả lời:** Dùng **Firestore TTL** cho tin/thông báo và **Storage lifecycle `daysSinceCustomTime`** cho ảnh (customTime = expireAt) — bỏ trigger xóa ảnh. Việc nền dài: **2 Cloud Functions task queue** (`purgeRoom`, `purgeAccount`). Đồng ý cả 3 đề xuất.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** ADR-04, ADR-05, ADR-09, ADR-10, ADR-11

## Q-043 · db-design · 2026-11-12
- **Hỏi:** Duyệt 14 collection/node (TBL-01 → TBL-14), đánh đổi hồ sơ công khai (get theo uid, cấm list) và đã xem/chưa đọc suy từ `last_read_at`; giới hạn độ dài tin; thời gian giữ lời mời đã kết thúc.
- **Trả lời:** Đồng ý danh sách và 2 đánh đổi. Tin chữ tối đa **1000 ký tự**. Lời mời đã kết thúc giữ **30 ngày**.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** TBL-02, TBL-04, TBL-08, TBL-09, TBL-11; BR-21 (thêm giới hạn 1000 ký tự – cập nhật business.md)

## Q-044 · api-contract + ui-screen-design · 2026-11-12
- **Hỏi:** Xác nhận 26 giả định từ api-contract (13) và ui-screen-design (13). Quan trọng: đăng xuất thu hồi phiên mọi thiết bị; chỉ chặn được người có liên hệ (bạn bè / chung phòng / có lời mời) để tránh dò uid; tra email kiểm chặn trước luật 24h; phòng chỉ đọc dùng lý do chung "Hai bạn không còn là bạn bè"; không hiện email người chưa là bạn (lời mời đã nhận, danh sách chặn); "đã xem" kiểu Messenger suy từ last_read_at; dialog xác nhận cho thu hồi / kick / chuyển host. Giả định nhỏ: domain placeholder, messageId client sinh + idempotent, debounce đánh dấu đã xem, trang /privacy tĩnh, 99+, chế độ lưu không chọn sẵn, Enter gửi trên desktop, checkbox khi xóa tài khoản...
- **Trả lời:** Đồng ý tất cả.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** specs/api-contract.yml, specs/ui-ux/scr-*.md (các mục đánh dấu `[ASSUMED → Q-044]`)

## Q-045 · backlog-plan · 2026-11-13
- **Hỏi:** Thiết lập backlog: công cụ test, thang story point, năng lực nhóm, môi trường kiểm tra.
- **Trả lời:** Vitest + Firebase Emulator Suite + Playwright. Fibonacci 1, 2, 3, 5, 8 (8 là trần). 1 dev, ~10 point / sprint 2 tuần. Task xong khi chạy được ở **local + emulator** (chưa cần deploy).
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** backlog/backlog.md mục Thiết lập, mọi task Phase 4

## Q-046 · backlog-slice · 2026-11-13
- **Hỏi:** Duyệt 29 task vertical slice / 6 milestone (M0 skeleton 10, M1 hành trình chính 25, M2 kết bạn đầy đủ 20, M3 phòng & chat đầy đủ 36, M4 thông báo & xóa tài khoản 12, M5 hardening 11 = 114 point, ~13 sprint).
- **Trả lời:** Đồng ý.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** backlog/_draft/slices.md, backlog/backlog.md

## Q-047 · backlog-task-detail · 2026-11-13
- **Hỏi:** Đề xuất từ 4 agent viết chi tiết task: tách / nâng point T-013 (+2), T-026 (+3), T-019 (+3), T-022 & T-029 (3→5); sửa spec (index đếm chưa đọc + debounce 1s; lưu policy_version; cắt dữ liệu ngay khi đăng xuất; siết quyền đọc online RTDB); kéo-thả ảnh desktop chưa có task; chấp nhận các [ASSUMED] trong 29 file task.
- **Trả lời:** Không tách / không nâng point — giữ nguyên. Sửa spec: **chỉ** index `messages (kind, created_at)` (chưa đọc không tính tin hệ thống) + debounce `markRoomAsRead` 1 giây. Không lưu policy_version, không cắt listener ngay khi đăng xuất (chấp nhận trễ ≤1 giờ), không siết quyền đọc online (chấp nhận rủi ro như Q-043). Kéo-thả ảnh desktop **thêm vào T-029** (3 → 5 point theo thang Fibonacci). Chấp nhận tất cả [ASSUMED].
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** specs/database.md (TBL-09 index), specs/database-design.md, specs/ui-ux/scr-05-chat-room.md, T-022 (chấm online SCR-03, giữ 3 point), T-029 (5 point), mọi file task (`[ASSUMED → Q-047]`)

## Q-048 · đổi tên · 2026-11-13
- **Hỏi:** (yêu cầu của user) Đổi tên project từ GameHub sang Buddio.
- **Trả lời:** Đổi tên sản phẩm "GameHub" → "Buddio" trong toàn bộ tài liệu; thư mục project `gamehub/` → `buddio/`; giá trị mẫu `gamehub.example.com` → `buddio.example.com`, project id emulator `demo-gamehub` → `demo-buddio`, bucket mẫu `gamehub-prod` → `buddio-prod`.
- **Trạng thái:** ANSWERED
- **Ảnh hưởng:** toàn bộ `idea/`, `specs/`, `backlog/`
