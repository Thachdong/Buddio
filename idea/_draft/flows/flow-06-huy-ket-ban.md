### FLOW-06 Hủy kết bạn (BIZ-06)
- **Actor:** ACT-01 (chính); ACT-05 Hệ thống (liên quan)
- **Trigger:** Chọn "Hủy kết bạn" trong danh sách bạn bè, hoặc từ màn "Hai bạn đã là bạn bè" (FLOW-04 A1).
- **Kết quả:** Hai người không còn là bạn; phòng 2 người chung chuyển chỉ đọc.

```mermaid
flowchart TD
  subgraph ND["ACT-01 Người dùng"]
    S1["1. Mở danh sách bạn bè"]
    S3["3. Chọn một người → Hủy kết bạn"]
    S4["4. Xác nhận"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    S2["2. Hiện tên, ảnh, email, online<br/>từng người BR-25 BR-27"]
    S5{"5. Còn là bạn?"}
    S6["6. Quan hệ bạn bè → Đã hủy<br/>BR-12"]
    S7["7. Phòng có đúng 2 người đó → Chỉ đọc;<br/>phòng ≥3 người không đổi<br/>BR-13 SUP-09"]
    S8["8. Không báo cho bên kia"]
    E1["E1. Hai bạn không còn là bạn bè"]
  end
  S1 --> S2 --> S3 --> S4 --> S5
  S4 -.->|Hủy xác nhận| S2
  S5 -- Không --> E1 --> END0(["Kết thúc"])
  S5 -- Có --> S6 --> S7 --> S8 --> END(["Kết thúc"])
```

- **Happy path:**
  1. Người dùng mở danh sách bạn bè.
  2. Hệ thống hiện tên, ảnh, email, trạng thái online từng người (BR-25, BR-27).
  3. Chọn một người → "Hủy kết bạn".
  4. Xác nhận.
  5. Hệ thống kiểm tra hai người còn là bạn.
  6. Quan hệ bạn bè (ENT-04) → **Đã hủy** (BR-12).
  7. Mọi phòng có đúng 2 thành viên là hai người này → **chỉ đọc**, cập nhật tức thời (BR-13, SUP-09). Phòng ≥3 người không đổi. Từ giờ hai người không thêm nhau vào phòng mới được.
  8. Không thông báo cho bên kia (BR-12). Kết thúc.
- **Alternative paths:**
  - A1. Không xác nhận ở bước 4 → không đổi gì, quay lại bước 2.
  - A2. Từ danh sách bạn bè cũng chọn được **Chặn** → FLOW-07.
- **Exceptions:** E1. Bên kia vừa hủy trước → "Hai bạn không còn là bạn bè". Kết thúc.
- **Supporting kích hoạt:** SUP-09 bước 7.
- **Business rules áp dụng:** BR-12 bước 6, 8; BR-13 bước 7; BR-25, BR-27 bước 2.
