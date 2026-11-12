# Business Specification: Buddio

> Nguồn: `idea/raw-idea.md` · Nhật ký quyết định: `idea/_qa-log.md` (Q-001 → Q-043) · Cập nhật: 2026-11-12

## 1. Tổng quan
- **Vấn đề cần giải quyết:** Người dùng cần một nơi giải trí nhẹ nhàng, xả stress cùng bạn bè: vào nhanh không rườm rà, trò chuyện riêng tư, có thể để tin nhắn tự biến mất sau một thời gian, và không bị người lạ làm phiền.
- **Mục tiêu sản phẩm:**
  - Tham gia chỉ bằng một cú click "Login with Google".
  - Kết bạn an toàn: mặc định **ẩn danh** (người khác không tìm thấy), mời qua email hoặc link mời không để lộ email.
  - Trò chuyện 1-1 hoặc nhóm trong **phòng** có host; mỗi phòng chọn lưu tin **ngắn hạn** (tự xóa) hoặc **lâu dài**; nội dung tin nhắn được mã hóa.
- **Phạm vi (in-scope) phase này:** Tham gia & đăng nhập; cài đặt tài khoản (tên, ẩn danh, hiển thị online); mời kết bạn bằng email / link mời; phản hồi lời mời; hủy kết bạn; chặn / bỏ chặn; tạo phòng; quản lý phòng & thành viên; nhắn tin chữ + ảnh (đã xem, đang soạn tin, online, thu hồi, tự hết hạn); xóa tài khoản.
- **Ngoài phạm vi (out-of-scope):**
  - Toàn bộ phần game (kho game, mời chơi, chơi game) — Q-001.
  - Vai trò quản trị / kiểm duyệt, báo cáo vi phạm, khóa tài khoản — Q-005.
  - Sticker, GIF, video, tệp khác ảnh — Q-022. Sửa tin nhắn — Q-021.
  - Tìm người theo tên, gợi ý kết bạn; đăng nhập bằng phương thức khác Google.
- **Nghiệp vụ phụ trợ:** xem `idea/business-flows.md` mục 1 (SUP-01 → SUP-14). (cập nhật từ Phase 2 – Q-030 → Q-034)

## 2. Glossary
| Thuật ngữ | Định nghĩa |
|---|---|
| Người dùng | Người đã tham gia Buddio bằng tài khoản Google (ACT-01, ENT-01). Tiếng Anh: user. |
| Người được mời | Người chưa có tài khoản, nhận link mời từ người quen (ACT-02). |
| Host | Người điều hành một phòng: người tạo phòng hoặc được chuyển quyền. Mỗi phòng có đúng 1 host (ACT-03). |
| Thành viên | Người dùng đang tham gia một phòng. Host cũng là thành viên. "Thành viên thường" là thành viên không phải host (ACT-04). |
| Phòng | Không gian trò chuyện (ENT-06), tối đa 50 thành viên; khi tạo có ít nhất 2 người (host + 1 bạn). Chat 1-1 cũng là một phòng. Tên gọi khác: phòng chat. |
| Phòng 2 người | Phòng tại thời điểm đó có đúng 2 thành viên đang tham gia. |
| Phòng nhóm | Phòng có từ 3 thành viên đang tham gia trở lên. |
| Chế độ lưu | Cách phòng giữ tin nhắn, chọn khi tạo phòng, không đổi được: **Ngắn hạn** (mỗi tin tự xóa sau thời hạn) hoặc **Lâu dài** (giữ vĩnh viễn). |
| Thời hạn tin nhắn | Khoảng thời gian một tin tồn tại trong phòng ngắn hạn, tính từ lúc gửi: 1 ngày, 2 ngày, 3 ngày, 1 tuần, 1 tháng, 3 tháng. |
| Chỉ đọc | Trạng thái của phòng 2 người khi hai người đó không còn là bạn hoặc có quan hệ chặn: xem được tin cũ, không gửi tin mới. |
| Chế độ ẩn danh | Cài đặt của người dùng (mặc định bật). Khi bật, người khác nhập email sẽ không tìm thấy người đó. |
| Hiển thị online | Cài đặt của người dùng (mặc định bật) cho phép bạn bè và người chung phòng thấy mình đang online. |
| Tìm thấy / Không tìm thấy | Kết quả khi nhập email ở ô kết bạn. "Không tìm thấy" gồm: chưa đăng ký, đang ẩn danh, hoặc có quan hệ chặn — luôn hiển thị giống hệt nhau. |
| Lời mời kết bạn | Yêu cầu kết bạn từ người gửi tới người nhận (ENT-02), qua kênh "Trong platform" hoặc "Qua link". |
| Link mời | Đường link mời một email cụ thể, hạn 7 ngày, không để lộ email; tự chứa email đã mã hóa nên tạo link không lưu gì (ENT-03, Q-033). |
| Bạn bè | Hai người dùng có quan hệ bạn bè đang hiệu lực (ENT-04). |
| Chặn | Một người dùng ngăn người khác liên lạc với mình (ENT-05). Bỏ chặn là gỡ quan hệ chặn. |
| Thu hồi tin | Người gửi rút lại tin của mình; mọi người thấy "Đã thu hồi". |
| Tin hệ thống | Dòng thông tin do hệ thống tạo trong phòng, ví dụ "A đã thêm B" hay "C đã rời phòng". |
| Đã xem | Danh sách thành viên đã xem một tin. |
| Đang soạn tin | Dấu hiệu cho thấy một thành viên đang nhập tin. |
| Kick | Host đưa một thành viên ra khỏi phòng. |
| Nhắn tin | Gửi và xem tin trong phòng (BIZ-10). Tên gọi khác: chat. |
| Chuyển quyền host | Host trao vai trò host cho một thành viên khác đang tham gia. |
| Giải tán phòng | Host xóa phòng cùng toàn bộ tin và ảnh. |
| Thông báo | Tin báo hệ thống gửi tới một người dùng về sự kiện liên quan tới họ (ENT-10). |

## 3. Actors
| ID | Tên | Mô tả | Mục tiêu chính | Quyền/giới hạn | Nguồn |
|---|---|---|---|---|---|
| ACT-01 | Người dùng | Người đã tham gia Buddio bằng tài khoản Google. Ai có tài khoản Google cũng tự tham gia được, không cần lời mời. | Kết bạn và trò chuyện giải trí, xả stress với bạn bè. | Thấy hồ sơ của mình, danh sách bạn bè, các phòng mình đang tham gia, thông báo của mình. Tìm người khác **chỉ bằng email** — không tìm thấy người đang ẩn danh và những người có quan hệ chặn với mình (theo cả hai chiều). Sửa được tên hiển thị và chế độ ẩn danh, xóa được tài khoản của mình. | raw, Q-004, Q-010, Q-017 |
| ACT-02 | Người được mời (chưa tham gia) | Người chưa có tài khoản, nhận link mời kết bạn từ người quen qua kênh ngoài (Messenger, Zalo, email...). | Tham gia nhanh và kết bạn với người đã mời. | Chỉ mở được link mời. Phải đăng nhập bằng **đúng tài khoản Google có email được mời**. Sau lần đăng nhập đầu tiên sẽ trở thành ACT-01. | raw, Q-007 |
| ACT-03 | Host phòng | Vai trò của ACT-01 trong một phòng cụ thể: người tạo phòng hoặc người được chuyển quyền host. Mỗi phòng có đúng 1 host. | Tổ chức và điều hành cuộc trò chuyện. | Có mọi quyền của thành viên, và thêm: đặt/sửa tên phòng, thêm **bạn của mình** vào phòng, kick thành viên, chuyển quyền host, giải tán phòng bất cứ lúc nào. Muốn rời phòng thì phải chuyển quyền host trước, trừ khi là người cuối cùng (khi đó phòng bị xóa). | raw, Q-012, Q-013 |
| ACT-04 | Thành viên phòng | Vai trò của ACT-01 trong một phòng mà người đó không phải host. | Trò chuyện cùng nhóm. | Xem toàn bộ tin còn hạn (kể cả tin gửi trước khi mình vào), gửi tin, xem danh sách thành viên (tên, ảnh, email), rời phòng. **Không** thêm hay kick người được. Đã rời hoặc bị kick thì không xem được phòng nữa. | Q-011, Q-014, Q-015 |
| ACT-05 | Hệ thống | Tác nhân tự động của platform. | Thực thi các quy tắc tự động. | Tự xóa tin/ảnh hết hạn; gửi thông báo và tự xóa thông báo quá 30 ngày; kiểm tra link mời còn hiệu lực khi được mở; xóa phòng khi không còn ai; tự chuyển quyền host khi host xóa tài khoản. | raw, Q-003, Q-013, Q-017 |
| ACT-06 | Google | Nhà cung cấp danh tính bên ngoài. | — | Xác thực người dùng; cung cấp email, tên và ảnh đại diện khi đăng nhập lần đầu. | raw |

**Quan hệ giữa các actor:**
- ACT-03 và ACT-04 là **vai trò theo ngữ cảnh** của ACT-01. Cùng một người có thể là host ở phòng này và là thành viên ở phòng khác. Quyền host chuyển qua lại giữa các thành viên.
- ACT-02 trở thành ACT-01 ngay sau lần đăng nhập Google đầu tiên.
- Không có vai trò quản trị hay kiểm duyệt ở phase này (Q-005).

## 4. Entities

### ENT-01 Người dùng
- **Mô tả:** Tài khoản của một người trên Buddio, gắn với đúng một tài khoản Google.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Email | Email Google; người khác dùng để tìm và mời | Có | Duy nhất; lấy từ Google; không sửa được | raw |
  | Tên hiển thị | Tên mọi người thấy | Có | Lần đầu lấy từ Google; người dùng sửa được | Q-010 |
  | Ảnh đại diện | Ảnh mọi người thấy | Không | Lấy từ Google; không sửa được | Q-010 |
  | Chế độ ẩn danh | Khi bật, người khác nhập email sẽ không tìm thấy người dùng này | Có | Mặc định **bật**. Chỉ ảnh hưởng việc bị tìm thấy; không hạn chế việc người dùng tự gửi lời mời, chat hay được bạn bè thêm vào phòng | raw, Q-004 |
  | Hiển thị online | Bạn bè và người chung phòng thấy mình đang online | Có | Mặc định **bật**. Tắt thì mình luôn hiện offline và cũng không thấy online của người khác | Q-027 |
  | Thời điểm tham gia | Lần đăng nhập đầu tiên | Có | Hệ thống ghi | — |
  | Trạng thái | Đang hoạt động / Đã xóa | Có | — | Q-017 |
- **Vòng đời / trạng thái:** `(đăng nhập Google lần đầu) → Đang hoạt động → Đã xóa`
  - Khi xóa: tự rời mọi phòng (ở phòng đang làm host thì quyền tự chuyển cho thành viên vào sớm nhất); hủy mọi quan hệ bạn bè, lời mời và link mời. Tin đã gửi vẫn còn nhưng người gửi hiển thị là "Người dùng đã xóa" (Q-017).
  - (Q-018) Nếu sau đó đăng nhập lại bằng cùng tài khoản Google thì đó là một tài khoản mới hoàn toàn; dữ liệu cũ không được khôi phục.
- **Quan hệ:** Một người dùng có nhiều bạn bè (ENT-04), gửi và nhận nhiều lời mời (ENT-02), tạo nhiều link mời (ENT-03), chặn nhiều người (ENT-05), tham gia nhiều phòng (ENT-07), gửi nhiều tin nhắn (ENT-08) và nhận nhiều thông báo (ENT-10).
- **Ai được tạo / xem / sửa / xóa:**
  - Tạo: Hệ thống, khi đăng nhập Google lần đầu.
  - Xem: Chính chủ xem toàn bộ. Bạn bè và **mọi người chung phòng** thấy tên, ảnh và email (Q-011). Người lạ chỉ "tìm thấy" được khi nhập đúng email, người đó đang tắt ẩn danh, và giữa hai bên không có quan hệ chặn.
  - Sửa: Chính chủ — tên hiển thị, chế độ ẩn danh, hiển thị online.
  - Xóa: Chính chủ (Q-017).

### ENT-02 Lời mời kết bạn
- **Mô tả:** Yêu cầu kết bạn từ người gửi tới người nhận. Có 2 kênh: gửi trực tiếp trong platform, hoặc phát sinh khi người nhận mở link mời.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Người gửi | | Có | Không được là chính người nhận | raw |
  | Người nhận | | Có | Phải là người dùng đang hoạt động | raw |
  | Kênh | Trong platform / Qua link mời | Có | Kênh "Trong platform" chỉ dùng được khi người nhận tắt ẩn danh và không có quan hệ chặn | raw |
  | Thời điểm gửi | | Có | — | — |
  | Trạng thái | (xem vòng đời) | Có | — | — |
  | Thời điểm phản hồi | Lúc chấp nhận, từ chối, thu hồi hoặc đóng | Không | — | — |
- **Vòng đời / trạng thái:** `Đang chờ → Đã chấp nhận | Đã từ chối | Đã thu hồi | Đã đóng`
  - Đã chấp nhận: người nhận đồng ý → tạo quan hệ bạn bè.
  - Đã từ chối: người nhận từ chối → người gửi nhận thông báo từ chối (raw).
  - Đã thu hồi: người gửi rút lại khi lời mời còn đang chờ (Q-008).
  - Đã đóng: hệ thống tự đóng khi 2 người đã thành bạn qua lời mời khác, khi một bên chặn bên kia, hoặc khi một bên xóa tài khoản. (Q-018)
  - Lời mời **không tự hết hạn** (Q-008).
- **Quy tắc liên quan (raw):** A và B gửi lời mời cho nhau cùng lúc thì cả hai thông báo đều được gửi bình thường. Chỉ cần một bên chấp nhận là thành bạn. Một bên chấp nhận trước, bên kia từ chối sau → lời từ chối vô hiệu (hiện gợi ý "hủy kết bạn" thay vào đó). Một bên từ chối trước, bên kia chấp nhận sau → vẫn thành bạn.
- (Q-018) Mỗi chiều (A→B) chỉ có tối đa 1 lời mời đang chờ.
- **Quan hệ:** Mỗi lời mời có 1 người gửi và 1 người nhận. Lời mời qua kênh link phát sinh từ đúng 1 link mời (ENT-03).
- **Ai được tạo / xem / sửa / xóa:** Người gửi tạo và thu hồi. Người nhận chấp nhận hoặc từ chối. Cả hai đều xem được. Hệ thống tự đóng.

### ENT-03 Link mời
- **Mô tả:** Đường link do người dùng tạo để mời một **email cụ thể** khi người đó chưa tham gia platform hoặc đang ẩn danh. Người mời tự gửi link qua kênh ngoài.
- (cập nhật từ Phase 2 – Q-033, Q-034) Link **tự chứa** thông tin người mời, email được mời (đã mã hóa) và hạn dùng. Tạo link **không lưu lại gì** — tránh bị spam tạo link làm phình dữ liệu. Người dùng tạo bao nhiêu link cũng được, không giới hạn. Trạng thái của link được xác định lúc có người mở link.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Người tạo | Người mời | Có | — | raw |
  | Email được mời | Email đã nhập ở ô kết bạn | Có | **Không được lộ dạng chữ thường trong link** (phải che hoặc mã hóa) | Q-007 |
  | Thời điểm tạo | | Có | — | — |
  | Hạn sử dụng | | Có | 7 ngày kể từ lúc tạo | Q-007 |
  | Trạng thái | (xem vòng đời) | Có | — | — |
- **Vòng đời / trạng thái:** `Còn hiệu lực → Đã dùng | Hết hạn | Vô hiệu`
  - Đã dùng: đúng người (đăng nhập Google có email trùng email được mời) mở link → phát sinh 1 lời mời kết bạn (ENT-02, kênh "Qua link") ở trạng thái Đang chờ. Mở lại link (hoặc link khác cùng người mời) khi lời mời vẫn đang chờ → hiển thị lại đúng lời mời đó, không tạo thêm (Q-007, Q-029). (cập nhật từ Phase 2 – Q-036) Mở lại link còn hạn sau khi lời mời trước đã bị từ chối → tạo lời mời mới, không áp luật chờ 24h.
  - Hết hạn: sau 7 ngày kể từ lúc tạo.
  - Vô hiệu (Q-018): hai người đã thành bạn; có quan hệ chặn; người tạo xóa tài khoản. (cập nhật từ Phase 2 – Q-034) **Bỏ** quy tắc "tạo link mới thì link cũ vô hiệu": nhiều link cho cùng email cùng còn hiệu lực tới hạn.
  - (Q-018) Người ẩn danh **không nhận được gì** cho tới khi tự mở link. Như vậy người mời không thể "chạm" tới người ẩn danh nếu người đó không muốn.
- **Quan hệ:** Mỗi link thuộc 1 người tạo và nhắm tới 1 email. Mỗi link sinh ra tối đa 1 lời mời kết bạn.
- **Ai được tạo / xem / sửa / xóa:** Mọi ACT-01 tạo được. Người nhận dùng link. Hệ thống đổi trạng thái. Không ai sửa được link.

### ENT-04 Quan hệ bạn bè
- **Mô tả:** Hai người dùng đã kết bạn. Đây là điều kiện để được host thêm vào phòng của nhau.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Hai người dùng | | Có | Hai người khác nhau; mỗi cặp chỉ có tối đa 1 quan hệ đang hiệu lực | raw |
  | Thời điểm kết bạn | | Có | — | — |
  | Trạng thái | Đang là bạn / Đã hủy | Có | — | raw |
- **Vòng đời / trạng thái:** `(lời mời được chấp nhận) → Đang là bạn → Đã hủy`
  - Bị hủy khi: một bên hủy kết bạn, một bên chặn bên kia, hoặc một bên xóa tài khoản.
  - Kết bạn lại: qua lời mời mới như bình thường. (Q-018)
- **Quan hệ:** Nối 2 người dùng (ENT-01) với nhau (nhiều–nhiều).
- **Ai được tạo / xem / sửa / xóa:** Hệ thống tạo khi lời mời được chấp nhận. Hai người trong quan hệ xem được. Một trong hai người hủy được.
- **Hệ quả của hủy kết bạn trên phòng chat đang có chung:** Phòng chỉ còn đúng 2 người đó → chỉ đọc (vẫn xem tin cũ). Phòng nhóm ≥3 người vẫn chat bình thường. Không thêm nhau vào phòng mới được. Kết bạn lại thì phòng 2 người mở lại.

### ENT-05 Quan hệ chặn
- **Mô tả:** Một người dùng chặn người khác để không bị liên lạc tiếp.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Người chặn | | Có | — | raw |
  | Người bị chặn | | Có | Khác người chặn | raw |
  | Thời điểm chặn | | Có | — | — |
  | Trạng thái | Đang chặn / Đã bỏ chặn | Có | — | Q-009 |
- **Vòng đời / trạng thái:** `Đang chặn → Đã bỏ chặn`. Khi một bên xóa tài khoản, quan hệ chặn của và đến người đó bị xóa (BIZ-11, Q-029).
  - Bỏ chặn **không** tự kết bạn lại. Người bị chặn không nhận thông báo khi bị chặn hoặc được bỏ chặn (Q-009).
  - (Q-018) A chặn B và B chặn A là hai quan hệ độc lập. Chỉ khi cả hai đều bỏ chặn thì hai người mới hết bị ảnh hưởng.
- **Hiệu lực khi đang chặn (raw):** Tự hủy kết bạn (nếu đang là bạn). Hai bên **không tìm thấy nhau** (cả hai chiều). Không nhắn tin tiếp với nhau được. Vẫn xem được tin nhắn cũ. (Q-018) Lời mời đang chờ giữa hai bên tự đóng và link mời tự vô hiệu.
- **Quan hệ:** Nối 2 người dùng (ENT-01) theo một chiều.
- **Ai được tạo / xem / sửa / xóa:** Người chặn tạo và bỏ chặn. (Q-018) Chỉ người chặn xem được danh sách những người mình đã chặn.
- **Hệ quả trên phòng chung:** Giống hủy kết bạn — phòng chỉ còn đúng 2 người đó → chỉ đọc; phòng nhóm ≥3 người vẫn chat bình thường. Phòng 2 người chỉ mở lại khi hết chặn (cả 2 chiều) **và** đã kết bạn lại.

### ENT-06 Phòng chat
- **Mô tả:** Không gian trò chuyện tối đa 50 người; khi tạo có ít nhất 2 người (host + 1 bạn). Phòng chỉ còn mỗi host vẫn tồn tại (Q-018). Chat 1-1 cũng là một phòng chỉ có 2 người. Hai người có thể có nhiều phòng với nhau, ví dụ một phòng ngắn hạn và một phòng lâu dài (Q-002).
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Tên phòng | | Không | Để trống thì hiển thị tên các thành viên; host đặt và sửa. Không có ảnh phòng. (cập nhật từ Phase 2 – Q-037) Tối đa 50 ký tự | Q-012, Q-037 |
  | Host | Người điều hành phòng | Có | Luôn có đúng 1 host, và host phải là thành viên đang tham gia | raw |
  | Chế độ lưu | Ngắn hạn / Lâu dài | Có | Chọn khi tạo phòng, **không đổi được** về sau | raw |
  | Thời hạn tin nhắn | Mỗi tin tự xóa sau khoảng này, tính từ lúc gửi | Có nếu chế độ là Ngắn hạn | Chọn một trong: 1 ngày, 2 ngày, 3 ngày, 1 tuần, 1 tháng, 3 tháng; **không đổi được**. Chế độ Lâu dài thì tin được giữ vĩnh viễn | raw, Q-003, Q-006 |
  | Người tạo, thời điểm tạo | | Có | — | — |
  | Số thành viên | | — | Tối đa 50 (có thể điều chỉnh) | Q-016 |
- **Vòng đời / trạng thái:** `Đang hoạt động → Đã xóa`
  - Bị xóa khi host giải tán phòng (bất cứ lúc nào), hoặc khi người cuối cùng rời phòng (Q-013). Khi xóa, toàn bộ tin nhắn và ảnh của phòng bị xóa theo.
  - (Q-018) Khi tạo phòng phải có ít nhất 1 người bạn ngoài host. Nếu sau đó chỉ còn mỗi host, phòng vẫn tồn tại đến khi host rời hoặc giải tán.
- **Quan hệ:** Một phòng có 1–50 thành viên đang tham gia (ENT-07), trong đó đúng 1 host. Một phòng có nhiều tin nhắn (ENT-08).
- **Ai được tạo / xem / sửa / xóa:** Mọi ACT-01 tạo được phòng và trở thành host. Thành viên đang tham gia xem được phòng. Host sửa tên phòng. Host xóa (giải tán) phòng. Hệ thống xóa phòng khi không còn ai.

### ENT-07 Thành viên phòng
- **Mô tả:** Việc một người dùng tham gia một phòng, kèm vai trò của họ trong phòng đó.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Người dùng, Phòng | | Có | Mỗi người chỉ có 1 lần tham gia đang hiệu lực trong mỗi phòng | — |
  | Vai trò | Host / Thành viên | Có | Mỗi phòng có đúng 1 host | raw |
  | Người thêm vào | Host nào đã thêm người này | Có (trừ host tạo phòng) | Người được thêm phải là **bạn của host** (không cần là bạn của các thành viên khác) | raw |
  | Thời điểm vào | | Có | Dùng để chọn người nhận quyền host khi host xóa tài khoản | Q-017 |
  | Trạng thái | Đang tham gia / Đã rời / Bị kick | Có | — | — |
- **Vòng đời / trạng thái:** `Đang tham gia → Đã rời | Bị kick`. Nếu host thêm lại thì đó là một lần tham gia mới, ở trạng thái Đang tham gia.
  - Vai trò chuyển `Thành viên ⇄ Host` khi chuyển quyền host. Chỉ chuyển được cho thành viên đang tham gia.
  - Đã rời hoặc bị kick → không còn thấy phòng và tin nhắn của phòng (Q-014).
  - Vào sau vẫn thấy toàn bộ tin còn hạn (Q-015).
- **Quan hệ:** Nối người dùng (ENT-01) với phòng (ENT-06) theo quan hệ nhiều–nhiều.
- **Ai được tạo / xem / sửa / xóa:** Host thêm và kick. Thành viên tự rời. Host chuyển quyền. Mọi thành viên đang tham gia xem được danh sách thành viên (tên, ảnh, email). Hệ thống tự chuyển quyền host khi host xóa tài khoản.

### ENT-08 Tin nhắn
- **Mô tả:** Một lượt gửi nội dung trong phòng.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Phòng | | Có | — | raw |
  | Người gửi | | Có | Phải là thành viên đang tham gia của phòng. Nếu người gửi đã xóa tài khoản thì hiển thị "Người dùng đã xóa" | raw, Q-017 |
  | Nội dung chữ | | Không* | (Q-018) Tin nhắn phải có chữ hoặc ảnh (ít nhất một trong hai) | raw |
  | Ảnh đính kèm | | Không* | Xem ENT-09 | raw |
  | Thời điểm gửi | | Có | — | — |
  | Loại tin | Tin người dùng / Tin hệ thống (vd "A đã thêm B", "C đã rời phòng", "A chuyển quyền host cho B") | Có | Tin hệ thống do Hệ thống tạo, cùng thời hạn với phòng | Q-026 |
  | Người đã xem | Những thành viên đã xem tin | — | Luôn hiển thị cho mọi thành viên, không tắt được | Q-028 |
  | Thời điểm hết hạn | | Có nếu phòng ngắn hạn | Bằng thời điểm gửi cộng thời hạn của phòng | Q-003 |
- **Bảo mật:** Nội dung được mã hóa khi lưu và khi truyền (raw). (cập nhật từ Phase 2 – Q-038) Không mã hóa đầu-cuối — xem NFR-12.
- **Vòng đời / trạng thái:** `Đã gửi → Đã thu hồi | Đã xóa`. Người gửi thu hồi được bất cứ lúc nào: mọi người thấy "Đã thu hồi", ảnh kèm bị xóa. Tin không sửa được (Q-021). Tin bị xóa khi hết hạn (phòng ngắn hạn) hoặc khi phòng bị xóa.
- **Quan hệ:** Mỗi tin thuộc 1 phòng và có 1 người gửi. Mỗi tin có 0–10 ảnh (ENT-09) (Q-022).
- **Ai được tạo / xem / sửa / xóa:** Thành viên đang tham gia gửi được tin. Riêng phòng chỉ còn 2 người mà 2 người đó không còn là bạn hoặc có chặn thì phòng ở chế độ chỉ đọc (Q-020). Thành viên đang tham gia xem được toàn bộ tin còn hạn. Người gửi thu hồi tin của mình. Hệ thống xóa tin khi hết hạn.

### ENT-09 Ảnh đính kèm
- **Mô tả:** Ảnh gửi kèm trong một tin nhắn.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Tin nhắn chứa ảnh | | Có | — | raw |
  | Tệp ảnh | | Có | Chỉ ảnh — không có sticker, GIF, video hay file khác (Q-022) | raw, Q-022 |
  | Dung lượng | | Có | Tối đa 10 ảnh mỗi tin; **tổng dung lượng các ảnh trong một tin ≤ 10MB** (mức này điều chỉnh được) | raw, Q-022 |
- **Vòng đời / trạng thái:** Theo tin nhắn chứa nó: hết hạn, bị thu hồi hoặc bị xóa cùng tin.
- **Quan hệ:** Mỗi ảnh thuộc đúng 1 tin nhắn.
- **Ai được tạo / xem / sửa / xóa:** Như tin nhắn chứa ảnh.

### ENT-10 Thông báo
- **Mô tả:** Tin báo của hệ thống gửi tới một người dùng về sự kiện liên quan đến họ.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Người nhận | | Có | — | raw |
  | Loại | Có lời mời kết bạn mới / Lời mời bị từ chối / Đã thành bạn / Được thêm vào phòng / Bị kick khỏi phòng / Phòng bị giải tán / Được nhận quyền host | Có | (cập nhật từ Phase 2 – Q-030). Tin nhắn mới **không** tạo thông báo — chỉ hiện số chưa đọc ở danh sách phòng (SUP-04) | raw, Q-030 |
  | Đối tượng liên quan | Lời mời nào, của ai | Có | — | raw |
  | Thời điểm | | Có | — | — |
  | Đã đọc | | Có | (Q-018) | — |
- **Vòng đời / trạng thái:** `Chưa đọc → Đã đọc → (sau 30 ngày) Đã xóa`. (cập nhật từ Phase 2 – Q-032) Hệ thống tự xóa thông báo quá 30 ngày. Chỉ hiển thị trong app; phiên bản đầu không push, không email (Q-031).
- **Quan hệ:** Mỗi thông báo gửi tới 1 người dùng. Thông báo có thể tham chiếu tới 1 lời mời kết bạn (ENT-02).
- **Ai được tạo / xem / sửa / xóa:** Hệ thống tạo. Người nhận xem và đánh dấu đã đọc. Người nhận có thể chấp nhận hoặc từ chối lời mời ngay từ thông báo (raw).

## 5. Businesses

### BIZ-01 Tham gia & đăng nhập
- **Mục tiêu:** Vào Buddio chỉ với một cú click bằng tài khoản Google. Lần đầu đăng nhập cũng chính là đăng ký.
- **Actor:** ACT-01 (đã có tài khoản), ACT-02 (lần đầu tham gia) — chính; ACT-06 Google — liên quan.
- **Trigger:** Người dùng bấm "Login with Google", hoặc phải đăng nhập khi mở link mời (BIZ-05).
- **Điều kiện trước:** Người dùng có tài khoản Google.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Xác nhận đăng nhập bằng tài khoản Google | Actor thao tác tại Google | Có |
  | Email, tên, ảnh đại diện | Google cung cấp | Có (email), Không (tên, ảnh) |
- **Output (business):**
  - (cập nhật từ Phase 2 – Q-039) Lần đầu: hiện chính sách quyền riêng tư, người dùng phải đồng ý mới tiếp tục (NFR-17).
  - Lần đầu: tạo Người dùng (ENT-01) ở trạng thái **Đang hoạt động**, với ẩn danh **bật**, hiển thị online **bật**, tên và ảnh lấy từ Google.
  - Các lần sau: vào phiên làm việc. (Q-029) Ảnh đại diện được cập nhật theo Google. Tên hiển thị không bị ghi đè nếu người dùng đã sửa.
  - Nếu đang mở dở một link mời → chuyển tiếp sang BIZ-05.
  - **Đăng xuất:** người dùng chủ động kết thúc phiên làm việc.
- **Điều kiện sau:** Người dùng ở trạng thái đã đăng nhập.
- **Business rules:** BR-01, BR-28
- **Ngoại lệ / trường hợp đặc biệt:**
  - Người dùng hủy giữa chừng ở bước Google → vẫn ở màn hình đăng nhập, không tạo gì.
  - Email Google từng thuộc một tài khoản đã xóa → tạo tài khoản mới hoàn toàn, không khôi phục dữ liệu cũ (Q-018).
- **Entities liên quan:** ENT-01

### BIZ-02 Cài đặt tài khoản
- **Mục tiêu:** Người dùng tự quản lý tên hiển thị và quyền riêng tư của mình.
- **Actor:** ACT-01.
- **Trigger:** Người dùng mở phần cài đặt tài khoản và thay đổi.
- **Điều kiện trước:** Đã đăng nhập.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Tên hiển thị mới | Actor nhập | Không (chỉ khi muốn đổi) |
  | Chế độ ẩn danh (bật/tắt) | Actor chọn | Không |
  | Hiển thị online (bật/tắt) | Actor chọn | Không |
- **Output (business):**
  - Hồ sơ (ENT-01) được cập nhật. (Q-029) Tên mới hiển thị ở mọi nơi, kể cả trên tin nhắn cũ.
  - Bật ẩn danh → từ lúc đó người khác nhập email sẽ không tìm thấy người dùng. (Q-029) Các lời mời đang chờ đã có vẫn giữ nguyên. Tắt ẩn danh → người khác tìm thấy được.
  - Tắt hiển thị online → mọi người thấy người dùng là offline, và người dùng cũng không thấy online của người khác.
- **Điều kiện sau:** Cài đặt mới có hiệu lực ngay.
- **Business rules:** BR-02, BR-25, BR-29
- **Ngoại lệ:** Để trống tên hoặc tên quá dài → báo lỗi, giữ tên cũ.
- **Entities liên quan:** ENT-01

### BIZ-03 Mời kết bạn
- **Mục tiêu:** Kết nối với người quen bằng email của họ.
- **Actor:** ACT-01 (người mời) — chính; ACT-01 (người nhận), ACT-05 — liên quan.
- **Trigger:** Người dùng nhập email vào ô kết bạn.
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
  | f | **Không tìm thấy**: chưa đăng ký, HOẶC đang ẩn danh, HOẶC có quan hệ chặn (chiều nào cũng vậy) | **Hiển thị giống hệt nhau**: chỉ có nút "Copy link mời" | Tạo link mời (ENT-03) gắn email, hạn 7 ngày. Link cũ cho cùng email (nếu có) vẫn còn hiệu lực (Q-034). Người mời tự gửi link qua kênh ngoài. Nếu thực chất là do có quan hệ chặn thì link vẫn được tạo (để hiển thị giống hệt), nhưng không dùng được (BR-06). |
  - Nếu người kia cũng đang có lời mời đang chờ gửi cho mình, vẫn gửi bình thường như trường hợp e (raw).
- **Kèm theo:** **Xem danh sách lời mời** — đã gửi (đang chờ, có nút Thu hồi) và đã nhận (đang chờ, có nút Chấp nhận / Từ chối / Chặn) (Q-001, idea-map).
- **Điều kiện sau:** Có thêm 1 lời mời đang chờ, hoặc 1 link mời còn hiệu lực, hoặc không có gì thay đổi.
- **Business rules:** BR-02, BR-03, BR-04, BR-05, BR-06, BR-08, BR-10
- **Ngoại lệ:**
  - Email sai định dạng → báo lỗi.
  - (cập nhật từ Phase 2 – Q-039) Tra quá 100 email trong 1 giờ → tạm khóa ô tra 1 giờ (NFR-16).
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
    - Link mời còn hiệu lực giữa hai người (nếu có) → **Vô hiệu**.
    - (Q-029) Người gửi nhận thông báo "đã trở thành bạn bè".
    - Phòng 2 người cũ giữa hai người (nếu có, đang chỉ đọc) được mở lại, miễn là không còn quan hệ chặn.
  - **Từ chối:**
    - Lời mời → **Đã từ chối**. Người gửi nhận thông báo bị từ chối.
    - Người gửi phải chờ 24 giờ mới gửi lại được. Người từ chối thì gửi lời mời cho người kia ngay được.
  - Từ lời mời, người nhận cũng có thể **chặn** người gửi (→ BIZ-07).
- **Điều kiện sau:** Hai người là bạn, hoặc lời mời đã đóng lại.
- **Business rules:** BR-06, BR-09, BR-10, BR-11, BR-13
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
  - Link hết hạn, đã dùng hoặc bị vô hiệu → báo "Link không còn hiệu lực, hãy xin người mời link mới". Người dùng vẫn có thể tham gia Buddio bình thường.
  - Email không khớp → báo "Link này không dành cho tài khoản của bạn". **Không hiển thị email được mời.**
  - Hai người đã là bạn, hoặc có quan hệ chặn, hoặc người mời đã xóa tài khoản → link bị vô hiệu, báo như trên.
- **Entities liên quan:** ENT-01, ENT-02, ENT-03, ENT-10

### BIZ-06 Hủy kết bạn
- **Mục tiêu:** Kết thúc quan hệ bạn bè với một người.
- **Actor:** ACT-01.
- **Trigger:** Người dùng chọn "Hủy kết bạn" trong danh sách bạn bè, hoặc từ màn hình "Hai bạn đã là bạn bè" ở BIZ-04.
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
- **Business rules:** BR-12, BR-13, BR-25, BR-27
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
- **Business rules:** BR-06, BR-12, BR-13, BR-14
- **Ngoại lệ:** Chặn một người đang chặn mình → vẫn được; hai quan hệ chặn tồn tại độc lập.
- **Entities liên quan:** ENT-02, ENT-03, ENT-04, ENT-05, ENT-06

### BIZ-08 Tạo phòng chat
- **Mục tiêu:** Mở một cuộc trò chuyện (1-1 hoặc nhóm) với bạn bè và chọn cách lưu tin nhắn.
- **Actor:** ACT-01 (trở thành ACT-03 của phòng mới) — chính; ACT-05 — liên quan.
- **Trigger:** Người dùng chọn "Tạo phòng".
- **Điều kiện trước:** Người dùng có ít nhất 1 người bạn.
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
  - Có tin hệ thống "A đã tạo phòng". Phòng xuất hiện trong danh sách phòng của mọi thành viên. (Q-030) Người được thêm nhận thông báo "Được thêm vào phòng" (SUP-02).
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
  | g | Giải tán phòng | Host | Xác nhận | Phòng → **Đã xóa**; toàn bộ tin và ảnh bị xóa; mọi thành viên mất phòng. (Q-030) Mọi thành viên khác nhận thông báo "Phòng bị giải tán" (SUP-02). |
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
- **Trigger:** Người dùng mở phòng; nhập và gửi tin.
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
- **Kèm theo:** **Xem danh sách phòng** của mình — gồm các phòng đang tham gia, kể cả phòng đang chỉ đọc (Q-001, idea-map). (cập nhật từ Phase 2 – Q-033) Mỗi phòng hiển thị tin cuối và số tin chưa đọc; có tổng số chưa đọc (SUP-04).
- **Điều kiện sau:** Tin hiển thị cho thành viên cho tới khi hết hạn, bị thu hồi, hoặc phòng bị xóa.
- **Business rules:** BR-13, BR-16, BR-20, BR-21, BR-22, BR-23, BR-25, BR-26, BR-27
- **Ngoại lệ:**
  - Quá 10 ảnh, tổng dung lượng quá 10MB, hoặc tệp không phải ảnh → báo lỗi, không gửi.
  - Tin trống (không chữ, không ảnh) → không gửi được.
  - Phòng đang chỉ đọc → ô nhập bị khóa, kèm giải thích lý do.
  - Bị kick hoặc phòng bị giải tán trong lúc đang xem → đóng phòng, báo cho người dùng.
  - (Q-029) Gửi lỗi (mất mạng) → tin hiển thị "gửi thất bại", cho phép gửi lại.
- **Entities liên quan:** ENT-06, ENT-07, ENT-08, ENT-09

### BIZ-11 Xóa tài khoản
- **Mục tiêu:** Người dùng rời khỏi Buddio và thu hồi dữ liệu cá nhân của mình.
- **Actor:** ACT-01 — chính; ACT-05 — liên quan.
- **Trigger:** Người dùng chọn "Xóa tài khoản" trong cài đặt.
- **Điều kiện trước:** Đã đăng nhập.
- **Input (business):**
  | Thông tin | Nguồn | Bắt buộc? |
  |---|---|---|
  | Xác nhận xóa (cảnh báo không khôi phục được) | Actor | Có |
- **Output (business):**
  - Người dùng (ENT-01) → **Đã xóa**. (Q-029) Có hiệu lực ngay, không có thời gian chờ khôi phục.
  - Người dùng tự rời mọi phòng:
    - Ở phòng mình đang làm host → quyền host tự chuyển cho thành viên vào phòng sớm nhất.
    - Phòng không còn ai → bị xóa.
    - Mỗi phòng có tin hệ thống tương ứng.
  - Mọi quan hệ bạn bè → **Đã hủy**. Lời mời đang chờ → **Đã đóng**. Link mời → **Vô hiệu**. (Q-029) Quan hệ chặn của và đến người này cũng bị xóa.
  - Tin đã gửi vẫn còn, người gửi hiển thị là "Người dùng đã xóa".
- **Điều kiện sau:** Không ai tìm thấy, mời hay thêm tài khoản này được nữa. Đăng nhập lại bằng cùng Google = tài khoản mới.
- **Business rules:** BR-06, BR-12, BR-17, BR-24, BR-28
- **Ngoại lệ:** Hủy ở bước xác nhận → không có gì thay đổi.
- **Entities liên quan:** ENT-01 → ENT-08

## 6. Business Rules
| ID | Nội dung | Áp dụng cho | Nguồn |
|---|---|---|---|
| BR-01 | Chỉ đăng nhập bằng tài khoản Google. Lần đăng nhập đầu tiên tự tạo tài khoản, không có form đăng ký riêng. | BIZ-01, BIZ-05 | raw |
| BR-02 | Chế độ ẩn danh mặc định **bật**. Khi bật, người khác nhập email sẽ không tìm thấy người dùng. Ẩn danh **không** hạn chế việc người dùng chủ động gửi lời mời, nhận link, chat hay được bạn bè thêm vào phòng. | BIZ-02, BIZ-03 | raw, Q-004 |
| BR-03 | (Q-029) Chỉ tìm người bằng **email chính xác** — không tìm theo tên, không gợi ý. | BIZ-03 | raw |
| BR-04 | Các trường hợp "không tìm thấy" (chưa đăng ký / đang ẩn danh / có quan hệ chặn theo bất kỳ chiều nào) phải **hiển thị giống hệt nhau** và chỉ đưa ra lựa chọn "Copy link mời". Không được để lộ người đó có tài khoản hay không. | BIZ-03 | raw, Q-023 |
| BR-05 | Chỉ gửi được lời mời trong platform khi người nhận đang tắt ẩn danh, không có quan hệ chặn, chưa là bạn, và chưa có lời mời đang chờ cùng chiều. | BIZ-03 | raw, Q-018 |
| BR-06 | Link mời gắn với email được mời; email **không xuất hiện dạng chữ thường trong link** (link chứa email đã mã hóa, tạo link không lưu gì – Q-033). Mỗi link chỉ sinh tối đa 1 lời mời, hết hạn sau 7 ngày. (cập nhật từ Phase 2 – Q-034) Tạo link mới không làm link cũ vô hiệu; không giới hạn số link. Link vô hiệu khi hai người đã là bạn, có quan hệ chặn, hoặc người tạo xóa tài khoản. (Q-036) Link chỉ mang email + hạn dùng: người được mời mở lại link còn hạn sau khi đã từ chối → tạo lời mời mới. | BIZ-03, BIZ-04, BIZ-05, BIZ-07, BIZ-11 | Q-007, Q-018 |
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
| BR-21 | Tin nhắn phải có chữ hoặc ảnh. (cập nhật từ Phase 3 – Q-043) Chữ tối đa **1000 ký tự**. Mỗi tin tối đa **10 ảnh**, tổng dung lượng ảnh ≤ **10MB** (mức này điều chỉnh được). Chỉ chấp nhận ảnh. | BIZ-10 | raw, Q-022 |
| BR-22 | Người gửi thu hồi được tin của mình bất cứ lúc nào: mọi người thấy "Đã thu hồi" và ảnh kèm bị xóa. Không sửa được tin. | BIZ-10 | Q-021 |
| BR-23 | Nội dung tin nhắn (chữ và ảnh) được mã hóa khi lưu và khi truyền. (cập nhật từ Phase 2 – Q-038) Không mã hóa đầu-cuối, để giữ BR-20. Chi tiết: NFR-12. | BIZ-10 | raw |
| BR-24 | Các thay đổi trong phòng (tạo phòng, thêm, kick, rời, chuyển host, đổi tên) đều sinh **tin hệ thống** trong phòng. | BIZ-08, BIZ-09, BIZ-11 | Q-026 |
| BR-25 | Trạng thái online chỉ hiển thị cho bạn bè và người chung phòng. Người dùng tắt được: khi tắt thì luôn hiện offline và cũng không thấy online của người khác. | BIZ-02, BIZ-06, BIZ-10 | Q-027 |
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
| ACT-05 Hệ thống | — | — | — | ⚙ đóng lời mời ngược chiều | ⚙ đổi trạng thái link | — | ⚙ đóng lời mời, vô hiệu link | ⚙ tin hệ thống | ⚙ tin hệ thống, xóa phòng khi trống | ⚙ tự xóa tin hết hạn | ⚙ chuyển host, dọn quan hệ |
| ACT-06 Google | ✔ xác thực | — | — | — | ✔ xác thực | — | — | — | — | — | — |


## 8. Giả định & Câu hỏi mở
Toàn bộ giả định ở Phase 1 đã được xác nhận (Q-018, Q-029). Phase 1 **không còn câu hỏi mở**.

| Loại | Nội dung | Ref |
|---|---|---|
| ASSUMED → đã xác nhận | Mỗi chiều chỉ có tối đa 1 lời mời đang chờ; thành bạn thì lời mời ngược chiều tự đóng. Người ẩn danh không nhận gì nếu không tự mở link. ~~Link mới cho cùng email làm link cũ vô hiệu.~~ (bỏ – Q-034) Chặn hai chiều là độc lập; chỉ người chặn thấy danh sách chặn. Tạo phòng cần ≥1 bạn; phòng chỉ còn host vẫn tồn tại. Tin phải có chữ hoặc ảnh. Đăng nhập lại sau khi xóa = tài khoản mới. Thông báo có trạng thái đã đọc. | Q-018 |
| ASSUMED → đã xác nhận | Chỉ tìm bằng email chính xác; chỉ host thêm người. Người được thêm / người nhận quyền host không cần đồng ý. Chấp nhận → người gửi được báo; hủy kết bạn → không báo. Ảnh theo Google; tên ≤50 ký tự, đổi tên áp dụng cả tin cũ. Bật ẩn danh không ảnh hưởng lời mời đang chờ. Host rời phòng chọn người nhận quyền ngay khi rời. Xóa tài khoản có hiệu lực ngay. Mở link khi đã có lời mời chờ → dùng lời mời đó; thu hồi trùng lúc chấp nhận → chấp nhận thắng. Gửi lỗi → cho gửi lại. | Q-029 |
| ĐÃ XỬ LÝ Phase 2 (Q-030→Q-033) | Thông báo: xem danh sách thông báo & đánh dấu đã đọc (ENT-10), kênh, các sự kiện (lời mời, từ chối, đã thành bạn, được thêm vào phòng, bị kick, phòng bị giải tán, tin mới), số tin chưa đọc, thời gian lưu thông báo. | `biz-supporting` |
| ĐÃ XỬ LÝ Phase 2 (Q-032→Q-034) | Cơ chế tự động theo thời gian: tự xóa tin/ảnh hết hạn (SUP-05), dọn thông báo 30 ngày (SUP-06); link mời tự chứa hạn dùng, không cần job (SUP-07). | `biz-supporting` |
| ĐÃ XỬ LÝ Phase 2 (Q-038, Q-039 → NFR-01, NFR-02, NFR-12) | Mức bảo mật nội dung tin nhắn (BR-23): mã hóa khi lưu hay mã hóa đầu-cuối. Độ trễ hiển thị tin, online, đang soạn tin, đã xem. | `nfr-define` |
