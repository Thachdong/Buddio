# Businesses (draft)

> Nguồn: `idea/_draft/idea-map.md`, `idea/_draft/actors-entities.md` · Q&A: `idea/_qa-log.md` (Q-001 → Q-028) · Tạo bởi `biz-capability` · 2026-11-11
>
> Danh sách BIZ đã được user chốt ở Q-019.

## 5. Businesses

### BIZ-01 Tham gia & đăng nhập
- **Mục tiêu:** Vào Buddio chỉ với một cú click bằng tài khoản Google. Lần đầu đăng nhập cũng chính là đăng ký.
- **Actor:** ACT-01 (đã có tài khoản), ACT-02 (lần đầu tham gia) — chính; ACT-06 Google — liên quan.
- **Trigger:** User bấm "Login with Google", hoặc phải đăng nhập khi mở link mời (BIZ-05).
- **Điều kiện trước:** User có tài khoản Google.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Xác nhận đăng nhập bằng tài khoản Google | Actor thao tác tại Google | Có |
  | Email, tên, ảnh đại diện | Google cung cấp | Có (email), Không (tên, ảnh) |
- **Output (business):**
  - Lần đầu: tạo Người dùng (ENT-01) ở trạng thái **Đang hoạt động**, với ẩn danh **bật**, hiển thị online **bật**, tên và ảnh lấy từ Google.
  - Các lần sau: vào phiên làm việc. (Q-029) Ảnh đại diện được cập nhật theo Google. Tên hiển thị không bị ghi đè nếu user đã sửa.
  - Nếu đang mở dở một link mời → chuyển tiếp sang BIZ-05.
  - **Đăng xuất:** user chủ động kết thúc phiên làm việc.
- **Điều kiện sau:** User ở trạng thái đã đăng nhập.
- **Business rules:** BR-01, BR-28
- **Ngoại lệ / trường hợp đặc biệt:**
  - User hủy giữa chừng ở bước Google → vẫn ở màn hình đăng nhập, không tạo gì.
  - Email Google từng thuộc một tài khoản đã xóa → tạo tài khoản mới hoàn toàn, không khôi phục dữ liệu cũ (Q-018).
- **Entities liên quan:** ENT-01

### BIZ-02 Cài đặt tài khoản
- **Mục tiêu:** User tự quản lý tên hiển thị và quyền riêng tư của mình.
- **Actor:** ACT-01.
- **Trigger:** User mở phần cài đặt tài khoản và thay đổi.
- **Điều kiện trước:** Đã đăng nhập.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Tên hiển thị mới | Actor nhập | Không (chỉ khi muốn đổi) |
  | Chế độ ẩn danh (bật/tắt) | Actor chọn | Không |
  | Hiển thị online (bật/tắt) | Actor chọn | Không |
- **Output (business):**
  - Hồ sơ (ENT-01) được cập nhật. (Q-029) Tên mới hiển thị ở mọi nơi, kể cả trên tin nhắn cũ.
  - Bật ẩn danh → từ lúc đó người khác nhập email sẽ không tìm thấy user. (Q-029) Các lời mời đang chờ đã có vẫn giữ nguyên. Tắt ẩn danh → người khác tìm thấy được.
  - Tắt hiển thị online → mọi người thấy user là offline, và user cũng không thấy online của người khác.
- **Điều kiện sau:** Cài đặt mới có hiệu lực ngay.
- **Business rules:** BR-02, BR-25, BR-29
- **Ngoại lệ:** Để trống tên hoặc tên quá dài → báo lỗi, giữ tên cũ.
- **Entities liên quan:** ENT-01

### BIZ-03 Mời kết bạn
- **Mục tiêu:** Kết nối với người quen bằng email của họ.
- **Actor:** ACT-01 (người mời) — chính; ACT-01 (người nhận), ACT-05 — liên quan.
- **Trigger:** User nhập email vào ô kết bạn.
- **Điều kiện trước:** Đã đăng nhập.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Email người muốn mời | Actor nhập | Có |
  | Danh sách người dùng, cài đặt ẩn danh, quan hệ bạn bè/chặn, lời mời hiện có | Hệ thống có sẵn | — |
- **Output (business) — theo từng trường hợp:**
  | # | Trường hợp | Kết quả hiển thị cho người mời | Thay đổi |
  |---|---|---|---|
  | a | Email của chính mình | "Đây là email của bạn" | — |
  | b | Đã là bạn | "Hai bạn đã là bạn bè" | — |
  | c | Mình đã gửi lời mời và đang chờ | "Đang chờ phản hồi" + nút **Thu hồi** | Thu hồi → lời mời (ENT-02) chuyển **Đã thu hồi** |
  | d | Mình bị người đó từ chối chưa đủ 24 giờ | "Chưa thể gửi lại, thử lại sau …" | — |
  | e | **Tìm thấy**: người đó tắt ẩn danh, không có quan hệ chặn, chưa là bạn | Hiện người đó (tên, ảnh) + nút **Gửi lời mời** | Tạo ENT-02 kênh "Trong platform", trạng thái **Đang chờ**. Người nhận được thông báo. |
  | f | **Không tìm thấy**: chưa đăng ký, HOẶC đang ẩn danh, HOẶC có quan hệ chặn (chiều nào cũng vậy) | **Hiển thị giống hệt nhau**: chỉ có nút "Copy link mời" | Tạo link mời (ENT-03) gắn email, hạn 7 ngày. Link cũ của mình cho cùng email (nếu có) bị vô hiệu. Người mời tự gửi link qua kênh ngoài. |
  - Nếu người kia cũng đang có lời mời đang chờ gửi cho mình, vẫn gửi bình thường như trường hợp e (raw).
- **Điều kiện sau:** Có thêm 1 lời mời đang chờ, hoặc 1 link mời còn hiệu lực, hoặc không có gì thay đổi.
- **Business rules:** BR-02, BR-03, BR-04, BR-05, BR-06, BR-08, BR-10
- **Ngoại lệ:**
  - Email sai định dạng → báo lỗi.
  - Thu hồi đúng lúc người nhận vừa chấp nhận → lời chấp nhận thắng, hai người thành bạn. (Q-029)
- **Entities liên quan:** ENT-01, ENT-02, ENT-03, ENT-10

### BIZ-04 Phản hồi lời mời kết bạn
- **Mục tiêu:** Người nhận quyết định có kết bạn hay không.
- **Actor:** ACT-01 (người nhận) — chính; ACT-01 (người gửi), ACT-05 — liên quan.
- **Trigger:** Người nhận mở thông báo hoặc danh sách lời mời đã nhận, hoặc thấy màn hình chấp nhận/từ chối ngay sau khi mở link mời (BIZ-05).
- **Điều kiện trước:** Lời mời ở trạng thái **Đang chờ**, và người nhận chính là mình.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Lựa chọn: Chấp nhận / Từ chối | Actor chọn | Có |
- **Output (business):**
  - **Chấp nhận:**
    - Lời mời (ENT-02) → **Đã chấp nhận**. Tạo quan hệ bạn bè (ENT-04) ở trạng thái **Đang là bạn**.
    - Lời mời ngược chiều đang chờ (nếu có) → **Đã đóng**.
    - (Q-029) Người gửi nhận thông báo "đã trở thành bạn bè".
    - Phòng 2 người cũ giữa hai người (nếu có, đang chỉ đọc) được mở lại, miễn là không còn quan hệ chặn.
  - **Từ chối:**
    - Lời mời → **Đã từ chối**. Người gửi nhận thông báo bị từ chối.
    - Người gửi phải chờ 24 giờ mới gửi lại được. Người từ chối thì gửi lời mời cho người kia ngay được.
  - Từ lời mời, người nhận cũng có thể **chặn** người gửi (→ BIZ-07).
- **Điều kiện sau:** Hai người là bạn, hoặc lời mời đã đóng lại.
- **Business rules:** BR-09, BR-10, BR-11, BR-13
- **Ngoại lệ:**
  - Lời mời đã bị thu hồi hoặc người gửi đã xóa tài khoản → báo "Lời mời không còn hiệu lực".
  - Hai người đã thành bạn qua lời mời ngược chiều mà người này vẫn bấm Từ chối → lời từ chối vô hiệu. Hiển thị "Hai bạn đã là bạn bè" kèm tùy chọn **Hủy kết bạn** (→ BIZ-06) (raw).
  - Mình đã từ chối lời mời của người kia, sau đó người kia chấp nhận lời mời của mình → vẫn thành bạn (raw).
- **Entities liên quan:** ENT-02, ENT-04, ENT-06, ENT-10

### BIZ-05 Tham gia qua link mời
- **Mục tiêu:** Người được mời (chưa tham gia hoặc đang ẩn danh) nhận lời mời kết bạn một cách an toàn.
- **Actor:** ACT-02, hoặc ACT-01 có đúng email được mời — chính; ACT-06, ACT-05 — liên quan.
- **Trigger:** Mở link mời nhận được qua kênh ngoài.
- **Điều kiện trước:** Link ở trạng thái **Còn hiệu lực**.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Link mời | Actor mở | Có |
  | Tài khoản Google (đăng nhập nếu chưa) | Actor / Google | Có |
- **Output (business):**
  - Chưa đăng nhập → đi qua BIZ-01. Nếu là lần đầu thì tạo tài khoản.
  - Email đăng nhập **khớp** email được mời → link (ENT-03) chuyển **Đã dùng**. Tạo lời mời (ENT-02) kênh "Qua link", trạng thái **Đang chờ**, gửi tới người mở link. Hiển thị ngay màn hình chấp nhận/từ chối (→ BIZ-04), kèm thông báo lời mời.
  - (Q-029) Nếu người mời đã có sẵn một lời mời đang chờ gửi cho người này thì hiển thị lời mời đó, không tạo thêm.
- **Điều kiện sau:** Người mở link có một lời mời đang chờ từ người mời.
- **Business rules:** BR-01, BR-06, BR-07
- **Ngoại lệ:**
  - Link hết hạn, đã dùng hoặc bị vô hiệu → báo "Link không còn hiệu lực, hãy xin người mời link mới". User vẫn có thể tham gia Buddio bình thường.
  - Email không khớp → báo "Link này không dành cho tài khoản của bạn". **Không hiển thị email được mời.**
  - Hai người đã là bạn, hoặc có quan hệ chặn, hoặc người mời đã xóa tài khoản → link bị vô hiệu, báo như trên.
- **Entities liên quan:** ENT-01, ENT-02, ENT-03, ENT-10

### BIZ-06 Hủy kết bạn
- **Mục tiêu:** Kết thúc quan hệ bạn bè với một người.
- **Actor:** ACT-01.
- **Trigger:** User chọn "Hủy kết bạn" trong danh sách bạn bè, hoặc từ màn hình "Hai bạn đã là bạn bè" ở BIZ-04.
- **Điều kiện trước:** Hai người đang là bạn.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Người bạn cần hủy | Actor chọn | Có |
  | Xác nhận hủy | Actor | Có |
- **Output (business):**
  - Quan hệ bạn bè (ENT-04) → **Đã hủy**.
  - Phòng chỉ có đúng 2 người đó → chuyển **chỉ đọc**, vẫn xem được tin cũ. Phòng nhóm từ 3 người trở lên không bị ảnh hưởng.
  - Hai người không thêm nhau vào phòng mới được nữa.
  - (Q-029) Bên kia không nhận thông báo.
- **Kèm theo:** **Xem danh sách bạn bè** — tên, ảnh, email, trạng thái online của từng người.
- **Điều kiện sau:** Hai người không còn là bạn. Muốn kết bạn lại thì gửi lời mời mới (BIZ-03).
- **Business rules:** BR-12, BR-13
- **Ngoại lệ:** Bên kia vừa hủy trước → báo "Hai bạn không còn là bạn bè".
- **Entities liên quan:** ENT-04, ENT-06

### BIZ-07 Chặn / bỏ chặn người dùng
- **Mục tiêu:** Ngăn một người tiếp tục liên lạc với mình.
- **Actor:** ACT-01.
- **Trigger:**
  - **Chặn:** từ danh sách bạn bè, từ danh sách thành viên phòng, hoặc từ một lời mời kết bạn. Chặn được cả người chưa là bạn (Q-025).
  - **Bỏ chặn:** từ danh sách những người mình đã chặn.
- **Điều kiện trước:** Chặn — chưa chặn người này. Bỏ chặn — đang chặn người này.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Người cần chặn / bỏ chặn | Actor chọn | Có |
  | Xác nhận | Actor | Có |
- **Output (business):**
  - **Chặn:**
    - Tạo quan hệ chặn (ENT-05) ở trạng thái **Đang chặn**.
    - Quan hệ bạn bè (nếu có) → **Đã hủy**.
    - Lời mời đang chờ giữa hai bên (cả hai chiều) → **Đã đóng**. Link mời giữa hai bên → **Vô hiệu**.
    - Phòng chỉ có đúng 2 người đó → **chỉ đọc**. Phòng nhóm từ 3 người trở lên không bị ảnh hưởng.
    - Hai bên **không tìm thấy nhau** qua email nữa. Vẫn xem được tin nhắn cũ.
    - Người bị chặn **không** nhận thông báo.
  - **Bỏ chặn:**
    - ENT-05 → **Đã bỏ chặn**. Không tự kết bạn lại, và không thông báo cho ai.
    - Muốn chat lại thì phải mời kết bạn (BIZ-03).
- **Kèm theo:** **Xem danh sách đã chặn** — chỉ người chặn thấy.
- **Điều kiện sau:** Quan hệ chặn có hiệu lực, hoặc đã được gỡ.
- **Business rules:** BR-12, BR-13, BR-14
- **Ngoại lệ:** Chặn một người đang chặn mình → vẫn được; hai quan hệ chặn tồn tại độc lập.
- **Entities liên quan:** ENT-02, ENT-03, ENT-04, ENT-05, ENT-06

### BIZ-08 Tạo phòng chat
- **Mục tiêu:** Mở một cuộc trò chuyện (1-1 hoặc nhóm) với bạn bè và chọn cách lưu tin nhắn.
- **Actor:** ACT-01 (trở thành ACT-03 của phòng mới) — chính; ACT-05 — liên quan.
- **Trigger:** User chọn "Tạo phòng".
- **Điều kiện trước:** User có ít nhất 1 người bạn.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Thành viên ban đầu | Actor chọn từ danh sách bạn bè của mình | Có (1–49 người) |
  | Tên phòng | Actor nhập | Không |
  | Chế độ lưu: Ngắn hạn / Lâu dài | Actor chọn | Có |
  | Thời hạn tin nhắn: 1 ngày, 2 ngày, 3 ngày, 1 tuần, 1 tháng, 3 tháng | Actor chọn | Có nếu chọn Ngắn hạn |
- **Output (business):**
  - Tạo phòng (ENT-06) ở trạng thái **Đang hoạt động**, với người tạo là host.
  - Tạo thành viên phòng (ENT-07) cho host và từng người được chọn.
  - Có tin hệ thống "A đã tạo phòng". Phòng xuất hiện trong danh sách phòng của mọi thành viên. Việc thông báo cho người được thêm → Phase 2.
- **Điều kiện sau:** Phòng sẵn sàng nhắn tin. Chế độ lưu và thời hạn **không đổi được** về sau.
- **Business rules:** BR-15, BR-16, BR-17, BR-18, BR-24
- **Ngoại lệ:**
  - Chưa có bạn nào → không tạo được, gợi ý đi mời kết bạn.
  - Chọn quá 49 người → báo vượt giới hạn 50 thành viên.
  - Đã có phòng khác với cùng những người này → vẫn tạo được phòng mới (Q-002).
- **Entities liên quan:** ENT-06, ENT-07, ENT-08

### BIZ-09 Quản lý phòng & thành viên
- **Mục tiêu:** Host điều hành phòng; thành viên tự do rời phòng.
- **Actor:** ACT-03 (host) — chính; ACT-04 (thành viên: xem thành viên, rời phòng); ACT-05 — liên quan.
- **Trigger:** Host hoặc thành viên chọn thao tác trong phần thông tin phòng.
- **Điều kiện trước:** Là thành viên đang tham gia của phòng; phòng đang hoạt động.
- **Các thao tác:**
  | # | Thao tác | Ai | Input | Output |
  |---|---|---|---|---|
  | a | Xem danh sách thành viên | Mọi thành viên | — | Tên, ảnh, email, online, vai trò của từng người |
  | b | Sửa tên phòng | Host | Tên mới (để trống được) | Tên phòng cập nhật; tin hệ thống |
  | c | Thêm thành viên | Host | Chọn từ **bạn của host** chưa có trong phòng | Tạo ENT-07 **Đang tham gia**; người được thêm thấy toàn bộ tin còn hạn; tin hệ thống. (Q-029) Không cần người được thêm đồng ý. |
  | d | Kick thành viên | Host | Thành viên cần kick | ENT-07 → **Bị kick**; người đó không còn thấy phòng; tin hệ thống |
  | e | Chuyển quyền host | Host | Thành viên đang tham gia nhận quyền | Đổi vai trò hai người; tin hệ thống. (Q-029) Không cần người nhận đồng ý. |
  | f | Rời phòng | Thành viên / Host | (Host: chọn người nhận quyền) | Thành viên → **Đã rời**, không còn thấy phòng; tin hệ thống. Host phải chuyển quyền trước — (Q-029) chọn người nhận ngay trong thao tác rời. Host là người cuối cùng → xác nhận → phòng bị xóa. |
  | g | Giải tán phòng | Host | Xác nhận | Phòng → **Đã xóa**; toàn bộ tin và ảnh bị xóa; mọi thành viên mất phòng. Việc thông báo → Phase 2. |
- **Điều kiện sau:** Phòng luôn có đúng 1 host và không quá 50 thành viên, hoặc phòng đã bị xóa.
- **Business rules:** BR-13, BR-15, BR-17, BR-18, BR-19, BR-20, BR-24, BR-27
- **Ngoại lệ:**
  - Phòng đã đủ 50 người → không thêm được.
  - Người cần kick hoặc nhận quyền vừa rời phòng → báo "Người này không còn trong phòng".
  - Phòng 2 người đang chỉ đọc → host vẫn thêm bạn khác vào được. Khi phòng có từ 3 người trở lên thì chat lại bình thường (theo BR-13).
- **Entities liên quan:** ENT-06, ENT-07, ENT-08

### BIZ-10 Nhắn tin trong phòng
- **Mục tiêu:** Trò chuyện theo thời gian thực bằng chữ và ảnh.
- **Actor:** ACT-03, ACT-04 — chính; ACT-05 (tự xóa tin hết hạn, tạo tin hệ thống) — liên quan.
- **Trigger:** User mở phòng; nhập và gửi tin.
- **Điều kiện trước:** Là thành viên đang tham gia. Để **gửi** tin thì phòng không được ở chế độ chỉ đọc.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Nội dung chữ | Actor nhập | Không, nếu đã có ảnh |
  | Ảnh (0–10 ảnh, tổng ≤ 10MB) | Actor chọn | Không, nếu đã có chữ |
- **Output (business):**
  - **Gửi:** tạo tin nhắn (ENT-08) và ảnh (ENT-09). Nội dung được mã hóa khi lưu. Phòng ngắn hạn thì tin có thời điểm hết hạn bằng lúc gửi cộng thời hạn. Mọi thành viên đang tham gia thấy tin **ngay lập tức**. Việc thông báo tin mới → Phase 2.
  - **Xem:** thấy toàn bộ tin còn hạn (kể cả tin gửi trước khi mình vào), kèm danh sách người đã xem từng tin, người đang soạn tin, và trạng thái online của thành viên.
  - **Thu hồi:** người gửi thu hồi tin của mình bất cứ lúc nào. Mọi người thấy "Đã thu hồi" và ảnh kèm bị xóa.
  - **Hết hạn** (ACT-05): tin và ảnh tự biến mất khi tới thời điểm hết hạn.
- **Điều kiện sau:** Tin hiển thị cho thành viên cho tới khi hết hạn, bị thu hồi, hoặc phòng bị xóa.
- **Business rules:** BR-13, BR-16, BR-20, BR-21, BR-22, BR-23, BR-25, BR-26, BR-27
- **Ngoại lệ:**
  - Quá 10 ảnh, tổng dung lượng quá 10MB, hoặc tệp không phải ảnh → báo lỗi, không gửi.
  - Tin trống (không chữ, không ảnh) → không gửi được.
  - Phòng đang chỉ đọc → ô nhập bị khóa, kèm giải thích lý do.
  - Bị kick hoặc phòng bị giải tán trong lúc đang xem → đóng phòng, báo cho user.
  - (Q-029) Gửi lỗi (mất mạng) → tin hiển thị "gửi thất bại", cho phép gửi lại.
- **Entities liên quan:** ENT-06, ENT-07, ENT-08, ENT-09

### BIZ-11 Xóa tài khoản
- **Mục tiêu:** User rời khỏi Buddio và thu hồi dữ liệu cá nhân của mình.
- **Actor:** ACT-01 — chính; ACT-05 — liên quan.
- **Trigger:** User chọn "Xóa tài khoản" trong cài đặt.
- **Điều kiện trước:** Đã đăng nhập.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Xác nhận xóa (cảnh báo không khôi phục được) | Actor | Có |
- **Output (business):**
  - Người dùng (ENT-01) → **Đã xóa**. (Q-029) Có hiệu lực ngay, không có thời gian chờ khôi phục.
  - User tự rời mọi phòng:
    - Ở phòng mình đang làm host → quyền host tự chuyển cho thành viên vào phòng sớm nhất.
    - Phòng không còn ai → bị xóa.
    - Mỗi phòng có tin hệ thống tương ứng.
  - Mọi quan hệ bạn bè → **Đã hủy**. Lời mời đang chờ → **Đã đóng**. Link mời → **Vô hiệu**. (Q-029) Quan hệ chặn của và đến người này cũng bị xóa.
  - Tin đã gửi vẫn còn, người gửi hiển thị là "Người dùng đã xóa".
- **Điều kiện sau:** Không ai tìm thấy, mời hay thêm tài khoản này được nữa. Đăng nhập lại bằng cùng Google = tài khoản mới.
- **Business rules:** BR-17, BR-28
- **Ngoại lệ:** Hủy ở bước xác nhận → không có gì thay đổi.
- **Entities liên quan:** ENT-01 → ENT-08

## 6. Business Rules
| ID | Nội dung | Áp dụng cho | Nguồn |
|---|---|---|---|
| BR-01 | Chỉ đăng nhập bằng tài khoản Google. Lần đăng nhập đầu tiên tự tạo tài khoản, không có form đăng ký riêng. | BIZ-01, BIZ-05 | raw |
| BR-02 | Chế độ ẩn danh mặc định **bật**. Khi bật, người khác nhập email sẽ không tìm thấy user. Ẩn danh **không** hạn chế việc user chủ động gửi lời mời, nhận link, chat hay được bạn bè thêm vào phòng. | BIZ-02, BIZ-03 | raw, Q-004 |
| BR-03 | (Q-029) Chỉ tìm người bằng **email chính xác** — không tìm theo tên, không gợi ý. | BIZ-03 | raw |
| BR-04 | Các trường hợp "không tìm thấy" (chưa đăng ký / đang ẩn danh / có quan hệ chặn theo bất kỳ chiều nào) phải **hiển thị giống hệt nhau** và chỉ đưa ra lựa chọn "Copy link mời". Không được để lộ người đó có tài khoản hay không. | BIZ-03 | raw, Q-023 |
| BR-05 | Chỉ gửi được lời mời trong platform khi người nhận đang tắt ẩn danh, không có quan hệ chặn, chưa là bạn, và chưa có lời mời đang chờ cùng chiều. | BIZ-03 | raw, Q-018 |
| BR-06 | Link mời gắn với email được mời; email **không xuất hiện dạng chữ thường trong link**. Link dùng 1 lần, hết hạn sau 7 ngày. Tạo link mới cho cùng email thì link cũ vô hiệu. Link cũng vô hiệu khi hai người đã là bạn, có quan hệ chặn, hoặc người tạo xóa tài khoản. | BIZ-03, BIZ-05, BIZ-07, BIZ-11 | Q-007, Q-018 |
| BR-07 | Chỉ người đăng nhập bằng đúng Google email được mời mới dùng được link. Lời mời kết bạn qua link chỉ phát sinh khi đúng người mở link; người ẩn danh không nhận được gì nếu không tự mở link. | BIZ-05 | Q-007, Q-018 |
| BR-08 | Lời mời kết bạn không tự hết hạn. Người gửi thu hồi được khi lời mời còn đang chờ. Mỗi chiều chỉ có tối đa 1 lời mời đang chờ. | BIZ-03 | Q-008, Q-018 |
| BR-09 | Chỉ cần một bên chấp nhận là thành bạn. Hai bên mời chéo nhau thì cả hai thông báo vẫn gửi bình thường. Khi đã thành bạn, lời mời ngược chiều tự đóng; từ chối sau đó là vô hiệu (gợi ý hủy kết bạn). Một bên từ chối trước, bên kia chấp nhận sau → vẫn thành bạn. | BIZ-04 | raw, Q-018 |
| BR-10 | Bị từ chối thì người gửi chỉ gửi lại cho cùng người đó sau **24 giờ**. Người đã từ chối được chủ động mời lại người kia **ngay**. | BIZ-03, BIZ-04 | Q-024 |
| BR-11 | Từ chối → người gửi nhận thông báo từ chối. (Q-029) Chấp nhận → người gửi nhận thông báo đã thành bạn. | BIZ-04 | raw |
| BR-12 | Hủy kết bạn, chặn hoặc xóa tài khoản đều kết thúc quan hệ bạn bè; sau đó hai người không thêm nhau vào phòng mới được. (Q-029) Hủy kết bạn không thông báo cho bên kia. | BIZ-06, BIZ-07, BIZ-11 | raw, Q-020 |
| BR-13 | Phòng có **đúng 2 thành viên** mà hai người đó không còn là bạn hoặc có quan hệ chặn (bất kỳ chiều nào) → **chỉ đọc**. Phòng từ 3 người trở lên không bị ảnh hưởng. Phòng 2 người mở lại khi hai người là bạn và không còn chặn. | BIZ-04, BIZ-06, BIZ-07, BIZ-09, BIZ-10 | raw, Q-020 |
| BR-14 | Chặn: tự hủy kết bạn, đóng lời mời đang chờ và vô hiệu link giữa hai bên; hai bên không tìm thấy nhau; vẫn xem được tin cũ; người bị chặn không được báo. Chặn được cả người chưa là bạn. Chặn hai chiều là độc lập. Bỏ chặn không tự kết bạn lại. | BIZ-07 | raw, Q-009, Q-018, Q-025 |
| BR-15 | Một phòng có tối đa **50** thành viên đang tham gia (mức này điều chỉnh được). Khi tạo phòng phải có ít nhất 1 người bạn ngoài host. | BIZ-08, BIZ-09 | Q-016, Q-018 |
| BR-16 | Chế độ lưu và thời hạn chọn khi tạo phòng, **không đổi được**. Ngắn hạn: mỗi tin và ảnh tự xóa sau thời hạn (1 ngày / 2 ngày / 3 ngày / 1 tuần / 1 tháng / 3 tháng) tính từ lúc gửi. Lâu dài: giữ vĩnh viễn. | BIZ-08, BIZ-10 | raw, Q-003, Q-006 |
| BR-17 | Mỗi phòng luôn có **đúng 1 host**, và host phải là thành viên đang tham gia. | BIZ-08, BIZ-09, BIZ-11 | raw |
| BR-18 | Chỉ host được: sửa tên phòng, thêm người, kick, chuyển quyền host, giải tán phòng. Host chỉ thêm được **bạn của mình** (không cần là bạn của các thành viên khác). (Q-029) Thành viên thường không thêm người được. | BIZ-08, BIZ-09 | raw |
| BR-19 | Host muốn rời phòng phải chuyển quyền trước; nếu là người cuối cùng thì rời = phòng bị xóa. Host giải tán được phòng bất cứ lúc nào; khi đó toàn bộ tin và ảnh bị xóa. | BIZ-09 | raw, Q-013 |
| BR-20 | Rời phòng hoặc bị kick → không còn xem được phòng và tin. Thành viên mới, hoặc người được thêm lại, thấy toàn bộ tin còn hạn. | BIZ-09, BIZ-10 | Q-014, Q-015 |
| BR-21 | Tin nhắn phải có chữ hoặc ảnh. Mỗi tin tối đa **10 ảnh**, tổng dung lượng ảnh ≤ **10MB** (mức này điều chỉnh được). Chỉ chấp nhận ảnh. | BIZ-10 | raw, Q-022 |
| BR-22 | Người gửi thu hồi được tin của mình bất cứ lúc nào: mọi người thấy "Đã thu hồi" và ảnh kèm bị xóa. Không sửa được tin. | BIZ-10 | Q-021 |
| BR-23 | Nội dung tin nhắn được mã hóa trước khi lưu. Mức độ cụ thể → `nfr-define` (Phase 2). | BIZ-10 | raw |
| BR-24 | Các thay đổi trong phòng (tạo phòng, thêm, kick, rời, chuyển host, đổi tên) đều sinh **tin hệ thống** trong phòng. | BIZ-08, BIZ-09, BIZ-11 | Q-026 |
| BR-25 | Trạng thái online chỉ hiển thị cho bạn bè và người chung phòng. User tắt được: khi tắt thì luôn hiện offline và cũng không thấy online của người khác. | BIZ-02, BIZ-06, BIZ-10 | Q-027 |
| BR-26 | "Đã xem" hiển thị những thành viên đã xem từng tin, luôn bật, không tắt được. | BIZ-10 | Q-028 |
| BR-27 | Bạn bè và người chung phòng thấy tên hiển thị, ảnh và email của nhau. | BIZ-06, BIZ-09, BIZ-10 | Q-011 |
| BR-28 | Xóa tài khoản: tự rời mọi phòng (phòng đang làm host → quyền chuyển cho thành viên vào sớm nhất; phòng không còn ai → xóa); hủy mọi quan hệ bạn bè, lời mời, link; tin đã gửi được giữ lại và hiển thị "Người dùng đã xóa". Đăng nhập lại bằng cùng Google = tài khoản mới. | BIZ-01, BIZ-11 | Q-017, Q-018 |
| BR-29 | Tên hiển thị không được để trống. (Q-029) Tối đa 50 ký tự. | BIZ-02 | Q-010 |

## 7. Ma trận Actor × Business
Chú thích: ✔ thực hiện · 👁 xem · ⚙ tự động · — không liên quan

| | BIZ-01 | BIZ-02 | BIZ-03 | BIZ-04 | BIZ-05 | BIZ-06 | BIZ-07 | BIZ-08 | BIZ-09 | BIZ-10 | BIZ-11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ACT-01 Người dùng | ✔ | ✔ | ✔ | ✔ | ✔ (có email được mời) | ✔ | ✔ | ✔ | (qua vai trò ACT-03/04) | (qua vai trò ACT-03/04) | ✔ |
| ACT-02 Người được mời | ✔ (lần đầu) | — | — | — | ✔ | — | — | — | — | — | — |
| ACT-03 Host phòng | — | — | — | — | — | — | — | — | ✔ tất cả thao tác | ✔ | — |
| ACT-04 Thành viên phòng | — | — | — | — | — | — | — | — | 👁 xem thành viên, ✔ rời phòng | ✔ | — |
| ACT-05 Hệ thống | — | — | ⚙ vô hiệu link cũ | ⚙ đóng lời mời ngược chiều | ⚙ đổi trạng thái link | — | ⚙ đóng lời mời, vô hiệu link | ⚙ tin hệ thống | ⚙ tin hệ thống, xóa phòng khi trống | ⚙ tự xóa tin hết hạn | ⚙ chuyển host, dọn quan hệ |
| ACT-06 Google | ✔ xác thực | — | — | — | ✔ xác thực | — | — | — | — | — | — |

## Giả định đã được user xác nhận (Q-029)
1. Chỉ tìm người bằng email chính xác (BR-03). Chỉ host thêm người được (BR-18).
2. Người được thêm vào phòng và người nhận quyền host **không cần đồng ý** (BIZ-09 c, e).
3. Lời mời được chấp nhận → người gửi nhận thông báo (BR-11). Hủy kết bạn → bên kia **không** nhận thông báo (BR-12).
4. Ảnh đại diện cập nhật theo Google mỗi lần đăng nhập; tên đã sửa không bị ghi đè. Tên tối đa 50 ký tự. Đổi tên áp dụng cả trên tin cũ.
5. Bật ẩn danh không ảnh hưởng các lời mời đang chờ đã có.
6. Host rời phòng thì chọn người nhận quyền ngay trong thao tác rời.
7. Xóa tài khoản có hiệu lực ngay, không có thời gian chờ khôi phục; xóa luôn quan hệ chặn của và đến người đó.
8. Mở link khi đã có lời mời đang chờ cùng chiều → hiển thị lời mời đó, không tạo thêm. Thu hồi đúng lúc người nhận vừa chấp nhận → lời chấp nhận thắng.
9. Gửi tin lỗi mạng → hiển thị "gửi thất bại", cho gửi lại.

## Chuyển cho Phase 2
- Thông báo: người nhận lời mời, bị từ chối, đã thành bạn, được thêm vào phòng, bị kick, phòng bị giải tán, tin nhắn mới (kênh, số tin chưa đọc) → `biz-supporting`.
- Tự xóa tin/ảnh hết hạn; vô hiệu link mời sau 7 ngày → `biz-supporting` (cơ chế tự động theo thời gian).
- Mức bảo mật tin nhắn (BR-23); thời gian lưu thông báo; trạng thái online/đang soạn/đã xem theo thời gian thực → `nfr-define`.
