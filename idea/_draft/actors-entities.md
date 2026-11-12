# Actors & Entities (draft)

> Nguồn: `idea/_draft/idea-map.md` · Q&A: `idea/_qa-log.md` (Q-001 → Q-017) · Tạo bởi `biz-actor-entity` · 2026-11-11

## 3. Actors
| ID | Tên | Mô tả | Mục tiêu chính | Quyền/giới hạn | Nguồn |
|---|---|---|---|---|---|
| ACT-01 | Người dùng | Người đã tham gia Buddio bằng tài khoản Google. Ai có tài khoản Google cũng tự tham gia được, không cần lời mời. | Kết bạn và trò chuyện giải trí, xả stress với bạn bè. | Thấy hồ sơ của mình, danh sách bạn bè, các phòng mình đang tham gia, thông báo của mình. Tìm người khác **chỉ bằng email** — không tìm thấy người đang ẩn danh và những người có quan hệ chặn với mình (theo cả hai chiều). Sửa được tên hiển thị và chế độ ẩn danh, xóa được tài khoản của mình. | raw, Q-004, Q-010, Q-017 |
| ACT-02 | Người được mời (chưa tham gia) | Người chưa có tài khoản, nhận link mời kết bạn từ người quen qua kênh ngoài (Messenger, Zalo, email...). | Tham gia nhanh và kết bạn với người đã mời. | Chỉ mở được link mời. Phải đăng nhập bằng **đúng tài khoản Google có email được mời**. Sau lần đăng nhập đầu tiên sẽ trở thành ACT-01. | raw, Q-007 |
| ACT-03 | Host phòng | Vai trò của ACT-01 trong một phòng cụ thể: người tạo phòng hoặc người được chuyển quyền host. Mỗi phòng có đúng 1 host. | Tổ chức và điều hành cuộc trò chuyện. | Có mọi quyền của thành viên, và thêm: đặt/sửa tên phòng, thêm **bạn của mình** vào phòng, kick thành viên, chuyển quyền host, giải tán phòng bất cứ lúc nào. Muốn rời phòng thì phải chuyển quyền host trước, trừ khi là người cuối cùng (khi đó phòng bị xóa). | raw, Q-012, Q-013 |
| ACT-04 | Thành viên phòng | Vai trò của ACT-01 trong một phòng mà người đó không phải host. | Trò chuyện cùng nhóm. | Xem toàn bộ tin còn hạn (kể cả tin gửi trước khi mình vào), gửi tin, xem danh sách thành viên (tên, ảnh, email), rời phòng. **Không** thêm hay kick người được. Đã rời hoặc bị kick thì không xem được phòng nữa. | Q-011, Q-014, Q-015 |
| ACT-05 | Hệ thống | Tác nhân tự động của platform. | Thực thi các quy tắc tự động. | Tự xóa tin/ảnh hết hạn; gửi thông báo; vô hiệu link mời hết hạn; xóa phòng khi không còn ai; tự chuyển quyền host khi host xóa tài khoản. | raw, Q-003, Q-013, Q-017 |
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
  | Tên hiển thị | Tên mọi người thấy | Có | Lần đầu lấy từ Google; user sửa được | Q-010 |
  | Ảnh đại diện | Ảnh mọi người thấy | Không | Lấy từ Google; không sửa được | Q-010 |
  | Chế độ ẩn danh | Khi bật, người khác nhập email sẽ không tìm thấy user này | Có | Mặc định **bật**. Chỉ ảnh hưởng việc bị tìm thấy; không hạn chế việc user tự gửi lời mời, chat hay được bạn bè thêm vào phòng | raw, Q-004 |
  | Hiển thị online | Bạn bè và người chung phòng thấy mình đang online | Có | Mặc định **bật**. Tắt thì mình luôn hiện offline và cũng không thấy online của người khác *(cập nhật từ biz-capability – Q-027)* | Q-027 |
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
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Người tạo | Người mời | Có | — | raw |
  | Email được mời | Email đã nhập ở ô kết bạn | Có | **Không được lộ dạng chữ thường trong link** (phải che hoặc mã hóa) | Q-007 |
  | Thời điểm tạo | | Có | — | — |
  | Hạn sử dụng | | Có | 7 ngày kể từ lúc tạo | Q-007 |
  | Trạng thái | (xem vòng đời) | Có | — | — |
- **Vòng đời / trạng thái:** `Còn hiệu lực → Đã dùng | Hết hạn | Vô hiệu`
  - Đã dùng: đúng người (đăng nhập Google có email trùng email được mời) mở link → phát sinh 1 lời mời kết bạn (ENT-02, kênh "Qua link") ở trạng thái Đang chờ. Mỗi link chỉ dùng được 1 lần (Q-007).
  - Hết hạn: sau 7 ngày mà chưa dùng.
  - Vô hiệu (Q-018): người tạo tạo link mới cho cùng email (link cũ mất hiệu lực); hai người đã thành bạn; có quan hệ chặn; người tạo xóa tài khoản.
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
- **Hệ quả của hủy kết bạn trên phòng chat đang có chung:** Phòng chỉ còn đúng 2 người đó → chỉ đọc (vẫn xem tin cũ). Phòng nhóm ≥3 người vẫn chat bình thường. Không thêm nhau vào phòng mới được. Kết bạn lại thì phòng 2 người mở lại. *(cập nhật từ biz-capability – Q-020)*

### ENT-05 Quan hệ chặn
- **Mô tả:** Một người dùng chặn người khác để không bị liên lạc tiếp.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Người chặn | | Có | — | raw |
  | Người bị chặn | | Có | Khác người chặn | raw |
  | Thời điểm chặn | | Có | — | — |
  | Trạng thái | Đang chặn / Đã bỏ chặn | Có | — | Q-009 |
- **Vòng đời / trạng thái:** `Đang chặn → Đã bỏ chặn`
  - Bỏ chặn **không** tự kết bạn lại. Người bị chặn không nhận thông báo khi bị chặn hoặc được bỏ chặn (Q-009).
  - (Q-018) A chặn B và B chặn A là hai quan hệ độc lập. Chỉ khi cả hai đều bỏ chặn thì hai người mới hết bị ảnh hưởng.
- **Hiệu lực khi đang chặn (raw):** Tự hủy kết bạn (nếu đang là bạn). Hai bên **không tìm thấy nhau** (cả hai chiều). Không nhắn tin tiếp với nhau được. Vẫn xem được tin nhắn cũ. (Q-018) Lời mời đang chờ giữa hai bên tự đóng và link mời tự vô hiệu.
- **Quan hệ:** Nối 2 người dùng (ENT-01) theo một chiều.
- **Ai được tạo / xem / sửa / xóa:** Người chặn tạo và bỏ chặn. (Q-018) Chỉ người chặn xem được danh sách những người mình đã chặn.
- **Hệ quả trên phòng chung:** Giống hủy kết bạn — phòng chỉ còn đúng 2 người đó → chỉ đọc; phòng nhóm ≥3 người vẫn chat bình thường. Phòng 2 người chỉ mở lại khi hết chặn (cả 2 chiều) **và** đã kết bạn lại. *(cập nhật từ biz-capability – Q-020)*

### ENT-06 Phòng chat
- **Mô tả:** Không gian trò chuyện của 2–50 người. Chat 1-1 cũng là một phòng chỉ có 2 người. Hai người có thể có nhiều phòng với nhau, ví dụ một phòng ngắn hạn và một phòng lâu dài (Q-002).
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Tên phòng | | Không | Để trống thì hiển thị tên các thành viên; host đặt và sửa. Không có ảnh phòng | Q-012 |
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
  | Người thêm vào | Host nào đã thêm người này | Có | Người được thêm phải là **bạn của host** (không cần là bạn của các thành viên khác) | raw |
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
  | Loại tin | Tin người dùng / Tin hệ thống (vd "A đã thêm B", "C đã rời phòng", "A chuyển quyền host cho B") | Có | Tin hệ thống do Hệ thống tạo, cùng thời hạn với phòng *(cập nhật từ biz-capability – Q-026)* | Q-026 |
  | Người đã xem | Những thành viên đã xem tin | — | Luôn hiển thị cho mọi thành viên, không tắt được *(cập nhật từ biz-capability – Q-028)* | Q-028 |
  | Thời điểm hết hạn | | Có nếu phòng ngắn hạn | Bằng thời điểm gửi cộng thời hạn của phòng | Q-003 |
- **Bảo mật:** Nội dung được mã hóa trước khi lưu (raw). Mức độ bảo mật cụ thể sẽ quyết định ở Phase 2 (`nfr-define`).
- **Vòng đời / trạng thái:** `Đã gửi → Đã thu hồi | Đã xóa`. Người gửi thu hồi được bất cứ lúc nào: mọi người thấy "Đã thu hồi", ảnh kèm bị xóa. Tin không sửa được (Q-021). Tin bị xóa khi hết hạn (phòng ngắn hạn) hoặc khi phòng bị xóa. *(cập nhật từ biz-capability – Q-021)*
- **Quan hệ:** Mỗi tin thuộc 1 phòng và có 1 người gửi. Mỗi tin có 0–10 ảnh (ENT-09) (Q-022).
- **Ai được tạo / xem / sửa / xóa:** Thành viên đang tham gia gửi được tin. Riêng phòng chỉ còn 2 người mà 2 người đó không còn là bạn hoặc có chặn thì phòng ở chế độ chỉ đọc (Q-020). Thành viên đang tham gia xem được toàn bộ tin còn hạn. Người gửi thu hồi tin của mình. Hệ thống xóa tin khi hết hạn.

### ENT-09 Ảnh đính kèm
- **Mô tả:** Ảnh gửi kèm trong một tin nhắn.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Tin nhắn chứa ảnh | | Có | — | raw |
  | Tệp ảnh | | Có | Chỉ ảnh — không có sticker, GIF, video hay file khác (Q-022) | raw, Q-022 |
  | Dung lượng | | Có | Tối đa 10 ảnh mỗi tin; **tổng dung lượng các ảnh trong một tin ≤ 10MB** (mức này điều chỉnh được) *(cập nhật từ biz-capability – Q-022)* | raw, Q-022 |
- **Vòng đời / trạng thái:** Theo tin nhắn chứa nó: hết hạn, bị thu hồi hoặc bị xóa cùng tin.
- **Quan hệ:** Mỗi ảnh thuộc đúng 1 tin nhắn.
- **Ai được tạo / xem / sửa / xóa:** Như tin nhắn chứa ảnh.

### ENT-10 Thông báo
- **Mô tả:** Tin báo của hệ thống gửi tới một người dùng về sự kiện liên quan đến họ.
- **Thuộc tính nghiệp vụ:**
  | Thuộc tính | Ý nghĩa | Bắt buộc? | Ràng buộc nghiệp vụ | Nguồn |
  |---|---|---|---|---|
  | Người nhận | | Có | — | raw |
  | Loại | Có lời mời kết bạn mới / Lời mời bị từ chối / … | Có | Danh sách đầy đủ xác định ở Phase 2 (`biz-supporting`) | raw |
  | Đối tượng liên quan | Lời mời nào, của ai | Có | — | raw |
  | Thời điểm | | Có | — | — |
  | Đã đọc | | Có | (Q-018) | — |
- **Vòng đời / trạng thái:** `Chưa đọc → Đã đọc`. Thời gian lưu thông báo → Phase 2.
- **Quan hệ:** Mỗi thông báo gửi tới 1 người dùng. Thông báo có thể tham chiếu tới 1 lời mời kết bạn (ENT-02).
- **Ai được tạo / xem / sửa / xóa:** Hệ thống tạo. Người nhận xem và đánh dấu đã đọc. Người nhận có thể chấp nhận hoặc từ chối lời mời ngay từ thông báo (raw).

## Ghi chú chuyển cho `biz-capability`
- **Hành động mới phát sinh từ Q&A:** Sửa tên hiển thị (Q-010) · Xóa tài khoản (Q-017) · Sửa tên phòng (Q-012) · Giải tán phòng (Q-013) · Thu hồi lời mời (Q-008) · Bỏ chặn (Q-009).
- **Đề xuất điều chỉnh BIZ sơ bộ:**
  - BIZ-02 đổi thành "Cài đặt tài khoản": gồm sửa tên hiển thị và bật/tắt ẩn danh.
  - Thêm BIZ-11 "Xóa tài khoản".
  - BIZ-09 đổi thành "Quản lý phòng & thành viên": gồm sửa tên, thêm, kick, chuyển host, rời phòng, giải tán.
- **Gap còn lại thuộc nghiệp vụ** (theo số trong idea-map): #5 (hủy bạn/chặn khi chung phòng nhóm), #7, #10, #12, #13, #18, #19, #24.
