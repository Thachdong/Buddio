# Idea Map (draft)

> Nguồn: `idea/raw-idea.md` · Tạo bởi `idea-parse` · 2026-11-11

## Tóm tắt ý tưởng (2–3 câu)
Buddio là nền tảng giải trí, xả stress: người dùng tham gia chỉ bằng một cú click "Login with Google", kết bạn với nhau qua email/link mời, rồi nhắn tin (text + ảnh) trong các phòng chat có host, với lựa chọn lưu tin nhắn ngắn hạn (tự xóa sau thời hạn) hoặc lâu dài, nội dung được mã hóa khi lưu. Về sau, platform cung cấp "game plugin" để nhóm bạn chơi các mini-game (cờ ca rô, cờ thú, đua vịt, lô tô...) giết thời gian — **phase hiện tại chỉ làm kết bạn + chat**.

## Actors
| ID | Tên chuẩn | Tên gốc trong raw idea | Ghi chú |
|---|---|---|---|
| ACT-01 | Người dùng | "user" | Đã tham gia platform bằng tài khoản Google. Là actor chính của mọi nghiệp vụ. |
| ACT-02 | Người được mời (chưa tham gia) | "user chưa có trong flatform", "user ngoài flatform" | Nhận link mời qua kênh ngoài (Messenger, Zalo, email...). Sau khi đăng nhập Google lần đầu → trở thành ACT-01. |
| ACT-03 | Host phòng chat | "host", "người tạo room chat" | **Vai trò theo ngữ cảnh** của ACT-01 trong một phòng; mỗi phòng có đúng 1 host. Có quyền thêm/kick thành viên, chuyển quyền host. |
| ACT-04 | Thành viên phòng chat | (ngầm) "user trong room" | **Vai trò theo ngữ cảnh** của ACT-01 trong một phòng (không phải host). |
| ACT-05 | Hệ thống | (ngầm) "platform sẽ gửi notification", "xoá tin nhắn... của room hết hạn" | Tác nhân tự động: gửi thông báo, tự xóa nội dung hết hạn. |
| ACT-06 | Google | "Login with Google" | Bên ngoài: xác thực danh tính, cung cấp email (và có thể tên/ảnh) của người dùng. |

## Entities
| ID | Tên | Thuộc tính đã nhắc | Ghi chú |
|---|---|---|---|
| ENT-01 | Người dùng (tài khoản) | email (từ Google), chế độ "ẩn danh" (mặc định **bật**) | Tên hiển thị, ảnh đại diện chưa nhắc `[?]`. Setting "ẩn danh" coi là thuộc tính, không tách entity. |
| ENT-02 | Lời mời kết bạn | người gửi, người nhận (email), trạng thái (chờ / chấp nhận / từ chối) | Có 2 kênh: gửi trong platform (kèm thông báo) hoặc qua link. Có quy tắc mời chéo A↔B. |
| ENT-03 | Link mời | người tạo, (email người nhận?) | Dùng khi người nhận chưa tham gia hoặc đang ẩn danh. Phạm vi dùng/thời hạn `[?]`. |
| ENT-04 | Quan hệ bạn bè | 2 người dùng, trạng thái (bạn bè / đã hủy) | Điều kiện để chat/chơi game với nhau. |
| ENT-05 | Quan hệ chặn | người chặn, người bị chặn | Chặn ⇒ tự hủy kết bạn, không tìm thấy nhau (2 chiều), không nhắn/mời game tiếp; vẫn xem được lịch sử cũ. |
| ENT-06 | Phòng chat | host, chế độ lưu (ngắn hạn / lâu dài), thời hạn (1 ngày, 2 ngày, 3 ngày, 1 tuần, 1 tháng, 3 tháng) | Thời hạn **không đổi được** sau khi tạo. Tên/ảnh phòng chưa nhắc `[?]`. |
| ENT-07 | Thành viên phòng | người dùng, phòng, vai trò (host / thành viên) | Trạng thái đang ở / đã rời / bị kick — suy luận `[ASSUMED]`. |
| ENT-08 | Tin nhắn | người gửi, phòng, nội dung text, ảnh đính kèm, thời điểm gửi | Được **mã hóa trước khi lưu**. Xóa tự động khi hết hạn (nếu phòng ngắn hạn). |
| ENT-09 | Ảnh đính kèm | dung lượng ≤ 10MB (cấu hình được) | Thuộc một tin nhắn; xóa cùng tin nhắn khi hết hạn. |
| ENT-10 | Thông báo | người nhận, loại (lời mời kết bạn, bị từ chối...) | Trạng thái đã đọc/chưa đọc `[ASSUMED]`. Cơ chế gửi chi tiết → Phase 2 (SUP). |

## Actions
| # | Action | Actor | Entity | Câu gốc |
|---|---|---|---|---|
| 1 | Đăng nhập bằng Google (lần đầu = tự tạo tài khoản) | ACT-01, ACT-02, ACT-06 | ENT-01 | "user có thể tham gia platform dễ dàng chỉ bằng một cú click button 'Login with Google'" |
| 2 | Bật/tắt chế độ ẩn danh | ACT-01 | ENT-01 | "flag 'ẩn danh': user khác sẽ không thể tìm thấy user... default value là true" |
| 3 | Tìm người dùng theo email | ACT-01 | ENT-01 | "UI kết bạn sẽ là input cho phép user nhập email" |
| 4 | Gửi lời mời kết bạn trong platform | ACT-01 | ENT-02, ENT-10 | "user có trong flatform và flag 'ẩn danh' false -> cho phép gửi, flatform sẽ gửi notification" |
| 5 | Tạo & copy link mời kết bạn | ACT-01 | ENT-03 | "chỉ có thể copy link và gửi cho user (ngoài flatform, messenger, zalo, email ...)" |
| 6 | Mở link mời → đăng nhập → nhận lời mời | ACT-02 | ENT-03, ENT-01, ENT-10 | "sau khi đăng ký thành công thì hiển thị notification kết bạn cho user" |
| 7 | Mở link mời khi đang ẩn danh → accept/reject | ACT-01 | ENT-03, ENT-02 | "user có trong flatform và flag 'ẩn danh' true thì hiển thị UI cho phép user accept/reject" |
| 8 | Chấp nhận lời mời kết bạn | ACT-01 | ENT-02, ENT-04 | "user có thể accept / reject"; "chỉ cần 1 trong 2 người accept thì đã kết bạn thành công" |
| 9 | Từ chối lời mời kết bạn | ACT-01 | ENT-02, ENT-10 | "nếu reject thì người gửi sẽ nhận được thông báo từ chối" |
| 10 | Hủy kết bạn | ACT-01 | ENT-04 | "user huỷ kết bạn thì không thể chat/chơi game với nhau được" |
| 11 | Chặn người dùng | ACT-01 | ENT-05, ENT-04 | "user có thể block user khác: sau khi block thì user sẽ bị huỷ kết bạn..." |
| 12 | Tạo phòng chat (chọn lưu ngắn hạn + thời hạn, hoặc lâu dài) | ACT-01 → ACT-03 | ENT-06, ENT-07 | "mỗi room chat sẽ có host, host là người tạo room chat"; "lưu tin nhắn ngắn hạn, hoặc lâu dài" |
| 13 | Thêm bạn vào phòng | ACT-03 | ENT-07 | "host có thể thêm bạn vào room (không cần check bạn của user khác trong room)" |
| 14 | Kick thành viên | ACT-03 | ENT-07 | "host có thể kick user trong room" |
| 15 | Chuyển quyền host | ACT-03 | ENT-06, ENT-07 | "host có thể chuyển quyền host cho user khác trong room" |
| 16 | Rời phòng (host phải chuyển quyền trước) | ACT-03, ACT-04 | ENT-07 | "host thoát room phải chuyển quyền cho user khác" |
| 17 | Gửi tin nhắn (text, ảnh) | ACT-03, ACT-04 | ENT-08, ENT-09 | "message có thể bao gồm: text và images (không quá 10M...)" |
| 18 | Xem tin nhắn theo thời gian thực | ACT-03, ACT-04 | ENT-08 | "user tự lấy msg realtime" |
| 19 | Xem lại tin nhắn cũ với người đã chặn (chỉ đọc) | ACT-01 | ENT-08, ENT-05 | "sau khi block thì user vẫn có thể thấy các thông tin như tin nhắn..." |
| 20 | Nhận & xem thông báo | ACT-01 | ENT-10 | "user sẽ nhận được thông báo khi có lời mời kết bạn" |
| 21 | Tự động xóa tin nhắn/ảnh hết hạn | ACT-05 | ENT-08, ENT-09 | "xoá tin nhắn, images của room hết hạn..." |

## Nhóm nghiệp vụ sơ bộ
| ID | Tên | Actions | Lý do gộp/tách |
|---|---|---|---|
| BIZ-01 | Tham gia & đăng nhập | 1 (+ đăng xuất `[ASSUMED]`) | Cửa vào duy nhất; lần đầu đăng nhập = đăng ký. |
| BIZ-02 | Cài đặt chế độ ẩn danh | 2 | Tách riêng vì setting này chi phối quy tắc của BIZ-03/04/05 (ai tìm thấy ai). |
| BIZ-03 | Mời kết bạn | 3, 4, 5 | Cùng mục tiêu "gửi lời mời", cùng điểm vào (nhập email); rẽ nhánh theo trạng thái người nhận. |
| BIZ-04 | Phản hồi lời mời kết bạn | 7, 8, 9 | Actor khác (người nhận), có bộ quy tắc riêng phức tạp (mời chéo, accept trước/reject sau). |
| BIZ-05 | Tham gia qua link mời | 6 | Actor khác (ACT-02 chưa có tài khoản), nối onboarding với lời mời; tách để làm rõ hành trình người mới. |
| BIZ-06 | Hủy kết bạn | 10 | Thay đổi quan hệ, có hệ quả lên chat/game. |
| BIZ-07 | Chặn người dùng | 11, 19 | Quy tắc riêng (2 chiều, kéo theo hủy kết bạn, giữ lịch sử chỉ đọc). Bỏ chặn chưa rõ `[?]`. |
| BIZ-08 | Tạo phòng chat | 12 | Quyết định chế độ lưu/thời hạn — không đổi về sau → quy trình riêng. |
| BIZ-09 | Quản lý thành viên phòng | 13, 14, 15, 16 | Cùng entity ENT-07, cùng bộ quy tắc quyền host. |
| BIZ-10 | Nhắn tin trong phòng | 17, 18 | Giá trị cốt lõi; gửi + nhận realtime cùng một trải nghiệm. |

**Ứng viên nghiệp vụ phụ trợ (Phase 2, chưa cấp ID):**
- Action 20 — Thông báo (lời mời kết bạn, bị từ chối, có thể cả tin nhắn mới) → SUP.
- Action 21 — Tự động xóa nội dung hết hạn → SUP (job/cơ chế hết hạn); quy tắc thời hạn ghi thành BR của BIZ-08/BIZ-10.

**Ngoài phạm vi phase này (ghi nhận, chưa cấp ID):** Kho game / game plugin, mời bạn chơi game, chơi game (cờ ca rô, cờ thú, đua vịt, lô tô...). Game chỉ tập trung luật chơi, không có lịch sử/tournament.

## Suy luận [ASSUMED]
- `[ASSUMED]` Lần đầu đăng nhập Google = tự tạo tài khoản, không có form đăng ký riêng. Có **đăng xuất**.
- `[ASSUMED]` Người dùng xem được **danh sách bạn bè** (cần để thêm vào phòng, hủy kết bạn, chặn) và **danh sách lời mời** đang chờ (đã gửi / đã nhận).
- `[ASSUMED]` Người dùng xem được **danh sách phòng chat** mình đang tham gia và **danh sách thông báo** (đánh dấu đã đọc).
- `[ASSUMED]` Khi tạo phòng, người tạo chọn thành viên ban đầu từ danh sách bạn bè của mình.
- `[ASSUMED]` Mỗi phòng luôn có đúng 1 host; host cũng là thành viên.
- `[ASSUMED]` Chỉ host được thêm người vào phòng; host chỉ thêm được **bạn của host** (thành viên khác không cần là bạn của người được thêm).
- `[ASSUMED]` Nhập email của người đã chặn mình / người mình đã chặn ⇒ xử lý như "không tìm thấy" (chỉ copy link). Nhập email của chính mình hoặc người đã là bạn ⇒ báo tương ứng, không gửi lời mời.
- `[ASSUMED]` Ảnh có cùng thời hạn với tin nhắn chứa nó.
- `[ASSUMED]` Thông báo có trạng thái đã đọc/chưa đọc.

## Gaps
| # | Topic | Ref | Câu hỏi | Gợi ý đáp án | Vì sao cần |
|---|---|---|---|---|---|
| 1 | scope | Game | Phần game có ghi vào business.md không? | **(KN)** Ghi mục "Tương lai" ở mức tổng quan, không chi tiết · Bỏ hẳn khỏi tài liệu phase này | Tránh thiết kế chặn mở rộng (block/hủy bạn có ảnh hưởng game). |
| 2 | entity | ENT-06, ENT-08 | Thời hạn áp dụng thế nào: cả phòng hết hạn sau X kể từ khi tạo, hay mỗi tin tự xóa sau X kể từ lúc gửi (phòng vẫn dùng tiếp)? | Cả phòng hết hạn (đúng chữ "room hết hạn") · **Mỗi tin tự xóa sau X, cài theo phòng** · Mỗi tin chọn riêng | Quyết định vòng đời phòng & tin nhắn. |
| 3 | entity | ENT-06 | "Lưu lâu dài" là vĩnh viễn hay có giới hạn? | **(KN)** Vĩnh viễn (đến khi phòng bị xóa) · Giới hạn (vd 1 năm) | Vòng đời dữ liệu. |
| 4 | business | BIZ-08, BIZ-10 | Chat 1-1 giữa 2 người bạn có cần "tạo phòng" (có host) không, hay tự có cuộc trò chuyện riêng khi là bạn? | **(KN)** 1-1 có sẵn khi là bạn, không host · Mọi cuộc trò chuyện đều là phòng có host | Ảnh hưởng BIZ-08/09 và quy tắc hủy bạn/chặn. |
| 5 | business | BIZ-06, BIZ-07, BIZ-09 | Hủy kết bạn / chặn khi 2 người đang ở chung một phòng nhóm thì sao? | **(KN)** Vẫn ở chung phòng nhóm cũ, chỉ chặn chat 1-1 & không thêm nhau vào phòng mới · Người bị chặn không thấy tin của người chặn trong nhóm · Tự rời phòng | "Không thể chat với nhau" mâu thuẫn với phòng nhóm. |
| 6 | actor | ACT-01, BIZ-02 | Ẩn danh chỉ ảnh hưởng việc **bị tìm thấy**, hay hạn chế cả việc user chủ động mời / được bạn thêm vào phòng? | **(KN)** Chỉ ảnh hưởng việc bị tìm thấy qua email | Quy tắc lõi của BIZ-02/03. |
| 7 | business | BIZ-03 | Nhập email người "chưa đăng ký" và người "đang ẩn danh" có hiển thị giống hệt nhau (không lộ người đó có tài khoản)? | **(KN)** Giống hệt · Khác nhau | Quyền riêng tư. |
| 8 | entity | ENT-03 | Link mời: ai mở cũng dùng được hay chỉ đúng email? Dùng 1 lần hay nhiều lần? Có hết hạn? | **(KN)** Gắn với email đã nhập, 1 lần, hết hạn 7 ngày · Ai có link cũng dùng, nhiều lần | An toàn & vòng đời link. |
| 9 | entity | ENT-02 | Lời mời có hết hạn? Người gửi thu hồi được không? | **(KN)** Không hết hạn, thu hồi được khi còn chờ | Vòng đời lời mời. |
| 10 | business | BIZ-03 | Bị từ chối rồi có gửi lại được không? Có giới hạn chống spam? | **(KN)** Gửi lại được sau một khoảng chờ (vd 24h) · Không gửi lại · Không giới hạn | Chống làm phiền. |
| 11 | business | BIZ-07 | Có bỏ chặn không? Bỏ chặn có tự kết bạn lại? Người bị chặn có được báo? | **(KN)** Bỏ chặn được, không tự kết bạn lại, không báo người bị chặn | Vòng đời ENT-05. |
| 12 | business | BIZ-07 | Chặn được người chưa là bạn (vd người lạ trong phòng nhóm, người gửi lời mời)? | **(KN)** Có | Phạm vi chặn. |
| 13 | business | BIZ-09 | Thành viên thường có được thêm người vào phòng? | **(KN)** Không, chỉ host | Quyền ACT-03/04. |
| 14 | business | BIZ-09 | Giới hạn số thành viên tối đa của phòng? | **(KN)** Có (vd 50) · Không giới hạn | Business rule. |
| 15 | business | BIZ-09, BIZ-10 | Người bị kick / tự rời còn xem tin cũ không? Được thêm lại không? | **(KN)** Không xem được nữa; host thêm lại được | Quyền truy cập dữ liệu. |
| 16 | business | BIZ-09 | Host là người cuối cùng trong phòng muốn rời (không còn ai nhận quyền) thì sao? | **(KN)** Phòng bị xóa | Tránh phòng không host. |
| 17 | business | BIZ-10 | Thành viên vào sau có thấy tin nhắn trước khi mình vào? | **(KN)** Thấy toàn bộ (còn hạn) · Chỉ thấy từ lúc vào | Quyền xem lịch sử. |
| 18 | business | BIZ-10 | Có thu hồi/xóa/sửa tin nhắn đã gửi? | **(KN)** Thu hồi tin của mình, không sửa · Không gì cả | Phạm vi BIZ-10. |
| 19 | business | BIZ-10 | Ngoài text + ảnh cần gì khác (emoji/sticker, file, video)? Tối đa mấy ảnh/tin? | **(KN)** Chỉ text + ảnh, tối đa vài ảnh/tin | Phạm vi BIZ-10. |
| 20 | entity | ENT-06 | Phòng có tên/ảnh đại diện? Ai sửa? | **(KN)** Có tên, host sửa | Thuộc tính ENT-06. |
| 21 | entity | ENT-01 | Hồ sơ gồm gì (tên, ảnh từ Google)? Có sửa được? | **(KN)** Lấy từ Google, cho sửa tên hiển thị | Thuộc tính ENT-01. |
| 22 | business | BIZ-01 | User có xóa tài khoản được không? Tin nhắn/phòng đang làm host xử lý thế nào? | **(KN)** Có; tự rời mọi phòng, host tự chuyển cho thành viên lâu nhất · Chưa hỗ trợ phase này | Vòng đời ENT-01, quyền riêng tư. |
| 23 | actor | — | Có cần vai trò quản trị / kiểm duyệt (báo cáo vi phạm, khóa tài khoản)? | **(KN)** Chưa cần ở phase này · Cần admin cơ bản | Có thể thêm actor mới. |
| 24 | business | BIZ-03 | Chỉ tìm theo email chính xác (không tìm theo tên, không gợi ý)? | **(KN)** Chỉ email chính xác | Phạm vi tìm kiếm. |

**Hoãn sang Phase 2 / sau này (không hỏi ở Phase 1):**
| # | Topic | Ref | Câu hỏi | Xử lý ở |
|---|---|---|---|---|
| 25 | nfr | ENT-08 | Mức bảo mật tin nhắn: mã hóa khi lưu (vận hành có thể truy xuất khi cần) hay mã hóa đầu-cuối (chỉ thành viên đọc được)? | `nfr-define` |
| 26 | supporting | ENT-10 | Thông báo tin nhắn mới (trong app / push / email)? Số tin chưa đọc? | `biz-supporting` |
| 27 | scope | Game | Mâu thuẫn: "game không quan tâm lịch sử" vs "sau khi block vẫn thấy game đã chơi chung". | Khi làm phase game |

## Ràng buộc kỹ thuật từ raw idea (chuyển cho Phase 3 – `tech-stack-select`)
> Ghi lại để không mất; **không dùng** trong tài liệu Phase 1–2.
- Toàn bộ trên nền tảng Google/Firebase: Firestore (cân nhắc Realtime Database cho chat), Firebase Storage, Google Authentication, Firebase App Hosting.
- UI/UX và backend: Next.js.
- Client đọc tin nhắn realtime qua Firebase client SDK; mọi thao tác ghi thực hiện ở server qua firebase-admin SDK.
- Tin nhắn mã hóa trước khi lưu.
- Giới hạn dung lượng ảnh cấu hình qua biến môi trường (mặc định 10MB).
- Xóa tin nhắn/ảnh hết hạn bằng cơ chế của Firestore & Firebase Storage (lưu ý Phase 3: TTL policy / lifecycle rule).
- Mỗi game lưu ở collection riêng, logic xử lý riêng.
