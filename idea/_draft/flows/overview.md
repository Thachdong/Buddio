## Flow tổng thể (Overview)

Buddio có 3 nhóm flow: **Tài khoản** (vào, cài đặt, rời platform), **Kết bạn** (mời, link mời, phản hồi, hủy, chặn) và **Phòng & chat** (tạo, quản lý, nhắn tin). Hành trình chính: đăng nhập (FLOW-01) → kết bạn (FLOW-03 → FLOW-04, hoặc FLOW-03 → FLOW-05 → FLOW-04) → tạo phòng (FLOW-08) → nhắn tin (FLOW-10). Hủy kết bạn hoặc chặn (FLOW-06, FLOW-07) ngược lại khóa phòng 2 người về chỉ đọc. Điểm bắt đầu: FLOW-01 (tự vào) và FLOW-05 (mở link mời). Kết thúc tự nhiên: FLOW-11.

### 1. Sơ đồ quan hệ FLOW

```mermaid
flowchart LR
  subgraph TK["Tài khoản"]
    F01["FLOW-01<br/>Tham gia & đăng nhập"]
    F02["FLOW-02<br/>Cài đặt tài khoản"]
    F11["FLOW-11<br/>Xóa tài khoản"]
  end
  subgraph KB["Kết bạn"]
    F03["FLOW-03<br/>Mời kết bạn"]
    F05["FLOW-05<br/>Tham gia qua link"]
    F04["FLOW-04<br/>Phản hồi lời mời"]
    F06["FLOW-06<br/>Hủy kết bạn"]
    F07["FLOW-07<br/>Chặn / bỏ chặn"]
  end
  subgraph PC["Phòng & chat"]
    F08["FLOW-08<br/>Tạo phòng"]
    F09["FLOW-09<br/>Quản lý phòng"]
    F10["FLOW-10<br/>Nhắn tin"]
  end

  START1(["Tự vào"]) --> F01
  START2(["Nhận link qua kênh ngoài"]) --> F05

  F05 -->|chưa đăng nhập| F01
  F01 -->|đang mở dở link| F05
  F01 -->|đã đăng nhập| F03
  F01 -->|đã đăng nhập| F02
  F02 -->|chọn xóa tài khoản| F11
  F02 -->|danh sách đã chặn| F07
  F02 -.->|bật/tắt ẩn danh đổi kết quả tìm| F03

  F03 -->|tìm thấy: lời mời đang chờ| F04
  F03 -->|không tìm thấy: gửi link| F05
  F05 -->|email khớp: lời mời đang chờ| F04
  F04 -->|từ chối nhưng đã là bạn| F06
  F04 -->|chặn từ lời mời| F07
  F04 -->|đã là bạn| F08
  F04 -->|là bạn lại: mở lại phòng 2 người| F10
  F06 -->|phòng 2 người → chỉ đọc| F10
  F06 -->|kết bạn lại| F03
  F07 -->|phòng 2 người → chỉ đọc| F10
  F07 -->|bỏ chặn rồi kết bạn lại| F03

  F08 -->|chưa có bạn| F03
  F08 -->|phòng đã tạo| F10
  F10 <-->|trong cùng phòng| F09
  F09 -->|chặn từ danh sách thành viên| F07
  F11 -->|tự chuyển host / rời phòng| F09
  F11 --> END1(["Rời Buddio<br/>đăng nhập lại = tài khoản mới"])

  S01[["SUP-01 TB kết bạn"]]
  S02[["SUP-02 TB phòng"]]
  S03[["SUP-03 DS thông báo"]]
  S04[["SUP-04 Tóm tắt phòng"]]
  S05[["SUP-05 Xóa tin hết hạn"]]
  S06[["SUP-06 Dọn TB 30 ngày"]]
  S07[["SUP-07 Link tự chứa"]]
  S08[["SUP-08 Lưu trữ ảnh"]]
  S09[["SUP-09 Cập nhật tức thời"]]

  F03 -.-> S01
  F04 -.-> S01
  F05 -.-> S01
  F03 -.-> S07
  F05 -.-> S07
  F08 -.-> S02
  F09 -.-> S02
  F11 -.-> S02
  S01 -.-> S03
  S02 -.-> S03
  S03 -.-> F12["FLOW-12<br/>Xem & dọn thông báo"]
  F12 -->|mở thông báo lời mời| F04
  F12 -->|mở thông báo phòng| F10
  S06 -.-> F12
  F10 -.-> S04
  F10 -.-> S08
  F10 -.-> S09
  F09 -.-> S09
  S05 -.-> F10
```

### 2. Bảng quan hệ
| Từ | Đến | Loại | Điều kiện |
|---|---|---|---|
| FLOW-01 | Mọi FLOW (trừ FLOW-05 bước 1–3) | tiên quyết | Phải đăng nhập |
| FLOW-05 | FLOW-01 | kích hoạt | Mở link khi chưa đăng nhập |
| FLOW-01 | FLOW-05 | kích hoạt | Đăng nhập xong mà đang mở dở link → quay lại FLOW-05 bước 4 |
| FLOW-03 | FLOW-04 | kích hoạt | Tìm thấy → gửi lời mời trong platform |
| FLOW-03 | FLOW-05 | kích hoạt (gián tiếp) | Không tìm thấy → copy link, người mời tự gửi qua kênh ngoài |
| FLOW-05 | FLOW-04 | kích hoạt | Email khớp, link hợp lệ → lời mời đang chờ, hiện màn chấp nhận/từ chối |
| FLOW-04 | FLOW-08 | tiên quyết | Có ít nhất 1 bạn mới tạo được phòng; chỉ thêm được bạn vào phòng (FLOW-09b) |
| FLOW-04 | FLOW-10 | kích hoạt | Kết bạn lại, không còn chặn → phòng 2 người cũ mở lại |
| FLOW-04 | FLOW-06 | tùy chọn | Từ chối nhưng đã là bạn → gợi ý hủy kết bạn |
| FLOW-04 | FLOW-07 | tùy chọn | Chặn ngay từ lời mời |
| FLOW-06 | FLOW-10 | kích hoạt | Phòng đúng 2 người → chỉ đọc |
| FLOW-07 | FLOW-10 | kích hoạt | Phòng đúng 2 người → chỉ đọc |
| FLOW-06, FLOW-07b | FLOW-03 | tùy chọn | Muốn kết bạn lại |
| FLOW-07a | FLOW-03, FLOW-05 | tiên quyết (chặn) | Đang chặn → không tìm thấy nhau, link không dùng được |
| FLOW-02 | FLOW-03 | tiên quyết (ảnh hưởng) | Ẩn danh bật → người khác không tìm thấy → chỉ mời được bằng link |
| FLOW-02 | FLOW-11, FLOW-07b | tùy chọn | Mở từ cài đặt |
| FLOW-08 | FLOW-10 | kích hoạt | Phòng tạo xong |
| FLOW-08 | FLOW-03 | tùy chọn | Chưa có bạn → gợi ý mời |
| FLOW-09 | FLOW-10 | song song | Cùng diễn ra trong phòng; thay đổi thành viên sinh tin hệ thống trong FLOW-10; bị kick / giải tán đóng phòng ở FLOW-10 |
| FLOW-09 | FLOW-07 | tùy chọn | Chặn từ danh sách thành viên |
| FLOW-11 | FLOW-09 | kích hoạt | Tự rời mọi phòng, tự chuyển host, xóa phòng trống |
| FLOW-11 | FLOW-04, FLOW-06, FLOW-07 | kích hoạt (hệ quả) | Đóng lời mời, hủy bạn bè, xóa quan hệ chặn |
| SUP-05 | FLOW-10 | kích hoạt (hệ thống) | Tới thời điểm hết hạn của tin (phòng ngắn hạn) |
| SUP-01, SUP-02 | FLOW-12 | kích hoạt | Có thông báo mới → badge, danh sách thông báo |
| FLOW-12 | FLOW-04 | kích hoạt | Mở thông báo lời mời |
| FLOW-12 | FLOW-10 | kích hoạt | Mở thông báo được thêm vào phòng / nhận quyền host |
| SUP-06 | FLOW-12 | kích hoạt (hệ thống) | Thông báo đủ 30 ngày |

### 3. Hành trình theo actor
- **ACT-02 Người được mời (lần đầu):** nhận link → FLOW-05 → FLOW-01 (tạo tài khoản, ẩn danh bật) → FLOW-05 → FLOW-04 (chấp nhận) → được bạn thêm vào phòng (FLOW-09b) hoặc tự tạo phòng (FLOW-08) → FLOW-10.
- **ACT-01 Người dùng tự tham gia:** FLOW-01 → FLOW-02 (tùy chọn tắt ẩn danh / đổi tên) → FLOW-03 (mời bằng email hoặc link) → chờ FLOW-04 / FLOW-05 ở phía người kia → FLOW-08 → FLOW-10. Lúc cần: FLOW-06, FLOW-07, FLOW-11.
- **ACT-03 Host:** FLOW-08 → FLOW-10 ⇄ FLOW-09 (thêm, kick, đổi tên, chuyển quyền) → rời (FLOW-09e, phải chuyển quyền) hoặc giải tán (FLOW-09f).
- **ACT-04 Thành viên:** nhận thông báo được thêm (SUP-02) → FLOW-10 → xem thành viên / chặn / rời (FLOW-09a, FLOW-07, FLOW-09e).
- **ACT-05 Hệ thống:** chạy nền SUP-05 (xóa tin hết hạn), SUP-06 (dọn thông báo), SUP-09 (cập nhật tức thời); thực thi hệ quả trong FLOW-04 C2–C3, FLOW-06/07 (chỉ đọc), FLOW-11 (chuyển host, dọn quan hệ).

### 4. Kiểm tra
- **FLOW không có cạnh vào:** chỉ FLOW-01, FLOW-05 — đều là điểm bắt đầu hợp lệ.
- **FLOW không có cạnh ra:** FLOW-11 (kết thúc tự nhiên). FLOW-10 là nơi người dùng ở lâu nhất (kết thúc tự nhiên của hành trình).
- **Vòng lặp:** FLOW-03 → FLOW-04 → FLOW-06 → FLOW-03 (kết bạn – hủy – kết bạn lại) do người dùng chủ động, có BR-10 (chờ 24h sau từ chối) chặn spam phía người gửi. FLOW-01 ⇄ FLOW-05 chỉ đi qua 1 lần mỗi lượt mở link. Không có phụ thuộc vòng vô hạn.
- **Gap:** không phát hiện.
