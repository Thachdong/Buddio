### FLOW-01 Tham gia & đăng nhập (BIZ-01)
- **Actor:** ACT-01, ACT-02 (chính); ACT-06 Google, ACT-05 Hệ thống (liên quan)
- **Trigger:** Bấm "Login with Google", hoặc phải đăng nhập khi mở link mời (FLOW-05).
- **Kết quả:** Người dùng ở trạng thái đã đăng nhập (tài khoản mới được tạo nếu là lần đầu); hoặc đã đăng xuất.

```mermaid
flowchart TD
  subgraph ND["ACT-01 / ACT-02 Người dùng"]
    S1["1. Bấm Login with Google"]
    S3["3. Chọn tài khoản, đồng ý"]
    L1["L1. Bấm Đăng xuất"]
  end
  subgraph GG["ACT-06 Google"]
    S2["2. Hiện màn xác thực Google"]
    S4["4. Trả email, tên, ảnh"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    S5{"5. Email có tài khoản<br/>Đang hoạt động?<br/>BR-01"}
    S6["6. Tạo người dùng mới: ẩn danh bật,<br/>online bật, tên + ảnh từ Google<br/>BR-02, BR-28"]
    S7["7. Cập nhật ảnh theo Google;<br/>giữ tên nếu đã sửa"]
    S8["8. Vào phiên làm việc"]
    S9{"9. Đang mở dở link mời?"}
    E1["E1. Ở lại màn đăng nhập"]
    L2["L2. Kết thúc phiên"]
  end

  S1 --> S2 --> S3 --> S4 --> S5
  S2 -- "Hủy / lỗi" --> E1 --> ENDE(["Không tạo gì"])
  S5 -- "Không (chưa có / đã xóa)" --> S6 --> S8
  S5 -- Có --> S7 --> S8
  S8 --> S9
  S9 -- Có --> TO5(["Tiếp FLOW-05 bước 4"])
  S9 -- Không --> HOME(["Vào trang chính"])
  L1 --> L2 --> ENDL(["Về màn đăng nhập"])
```

- **Happy path:**
  1. Người dùng bấm "Login with Google".
  2. Google hiện màn xác thực.
  3. Người dùng chọn tài khoản và đồng ý.
  4. Google trả email, tên, ảnh đại diện.
  5. Hệ thống kiểm tra email đã có tài khoản Đang hoạt động chưa (BR-01).
  6. *(Lần đầu)* Tạo người dùng (ENT-01) **Đang hoạt động**: ẩn danh **bật**, hiển thị online **bật**, tên và ảnh lấy từ Google (BR-02). Email từng thuộc tài khoản đã xóa → vẫn tạo tài khoản mới hoàn toàn (BR-28).
  7. *(Các lần sau)* Cập nhật ảnh theo Google; tên hiển thị giữ nguyên nếu người dùng đã sửa (Q-029).
  8. Vào phiên làm việc.
  9. Nếu đang mở dở link mời → tiếp FLOW-05 bước 4; không thì vào trang chính. Kết thúc.
- **Alternative paths:**
  - A1. Đăng xuất: L1 người dùng bấm Đăng xuất → L2 hệ thống kết thúc phiên, về màn đăng nhập.
- **Exceptions:**
  - E1. Người dùng hủy hoặc Google báo lỗi ở bước 2–3 → ở lại màn đăng nhập, không tạo gì.
  - E2. Google không trả tên → (Q-037) dùng phần trước "@" của email làm tên hiển thị (vì BR-29 tên không được trống).
- **Supporting kích hoạt:** —
- **Business rules áp dụng:** BR-01 bước 5; BR-02 bước 6; BR-28 bước 6; BR-29 E2.
