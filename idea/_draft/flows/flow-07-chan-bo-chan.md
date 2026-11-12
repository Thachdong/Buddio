### FLOW-07 Chặn / bỏ chặn người dùng (BIZ-07)
- **Actor:** ACT-01 (chính); ACT-05 Hệ thống (liên quan)
- **Trigger:** Chặn — từ danh sách bạn bè, danh sách thành viên phòng, hoặc một lời mời kết bạn. Bỏ chặn — từ danh sách đã chặn.
- **Kết quả:** Quan hệ chặn có hiệu lực (kèm các hệ quả), hoặc được gỡ.

#### FLOW-07a Chặn

```mermaid
flowchart TD
  subgraph ND["ACT-01 Người chặn"]
    S1["1. Chọn Chặn trên một người<br/>(bạn bè / thành viên phòng / lời mời)"]
    S2["2. Xác nhận"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    S3{"3. Đã đang chặn người này?"}
    S4["4. Tạo quan hệ chặn Đang chặn"]
    S5["5. Đang là bạn → Đã hủy<br/>BR-12"]
    S6["6. Lời mời Đang chờ 2 chiều → Đã đóng;<br/>link mời giữa 2 bên không dùng được<br/>BR-14 BR-06"]
    S7["7. Phòng đúng 2 người đó → Chỉ đọc<br/>BR-13 SUP-09"]
    S8["8. Hai bên không tìm thấy nhau;<br/>không báo người bị chặn<br/>BR-04 BR-14"]
    A1["A1. Đã chặn rồi"]
  end
  S1 --> S2 --> S3
  S3 -- Có --> A1 --> END0(["Kết thúc"])
  S3 -- Không --> S4 --> S5 --> S6 --> S7 --> S8 --> END(["Kết thúc"])
```

- **Happy path:**
  1. Người dùng chọn **Chặn** trên một người (từ danh sách bạn bè, danh sách thành viên phòng, hoặc lời mời kết bạn). Chặn được cả người chưa là bạn (Q-025).
  2. Xác nhận.
  3. Hệ thống kiểm tra chưa chặn người này.
  4. Tạo quan hệ chặn (ENT-05) **Đang chặn**.
  5. Quan hệ bạn bè (nếu có) → **Đã hủy** (BR-12).
  6. Lời mời Đang chờ cả hai chiều → **Đã đóng**; link mời giữa hai bên không còn dùng được (BR-14, BR-06).
  7. Phòng có đúng 2 thành viên là hai người này → **chỉ đọc** (BR-13, SUP-09). Phòng ≥3 người: vẫn chat bình thường, cả hai vẫn thấy tin của nhau.
  8. Hai bên không tìm thấy nhau qua email; người bị chặn không được báo (BR-04, BR-14). Kết thúc.
- **Alternative paths:**
  - A1. Đã đang chặn người này → báo đã chặn. Kết thúc.
  - A2. Người kia đang chặn mình → vẫn chặn được; hai quan hệ độc lập (BR-14).
  - A3. Chặn từ lời mời: lời mời đó cũng đóng ở bước 6.
  - A4. Không xác nhận ở bước 2 → không đổi gì.
- **Business rules:** BR-04, BR-06, BR-12, BR-13, BR-14.

#### FLOW-07b Bỏ chặn

```mermaid
flowchart TD
  subgraph ND["ACT-01 Người chặn"]
    U1["1. Mở danh sách đã chặn"]
    U3["3. Chọn Bỏ chặn + xác nhận"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    U2["2. Hiện những người mình đã chặn<br/>(chỉ mình thấy) BR-14"]
    U4["4. Quan hệ chặn → Đã bỏ chặn;<br/>không kết bạn lại, không báo ai"]
    U5{"5. Còn bị chặn chiều ngược lại?"}
    U6["6. Hai bên lại tìm thấy nhau<br/>(nếu tắt ẩn danh)"]
  end
  U1 --> U2 --> U3 --> U4 --> U5
  U5 -- Có --> ENDU0(["Vẫn chịu hiệu lực chặn"])
  U5 -- Không --> U6 --> ENDU(["Muốn chat lại → FLOW-03"])
```

- **Happy path:** 1. Mở danh sách đã chặn. 2. Hệ thống hiện những người mình đã chặn — chỉ mình thấy (BR-14). 3. Chọn Bỏ chặn và xác nhận. 4. ENT-05 → **Đã bỏ chặn**; không tự kết bạn lại, không báo ai. 5–6. Nếu không còn chặn chiều ngược lại → hai bên lại tìm thấy nhau (nếu tắt ẩn danh). Phòng 2 người cũ **vẫn chỉ đọc** cho tới khi kết bạn lại (FLOW-03 → FLOW-04 C3) (BR-13).
- **Business rules:** BR-13, BR-14.
