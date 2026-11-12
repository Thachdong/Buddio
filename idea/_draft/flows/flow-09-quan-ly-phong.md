### FLOW-09 Quản lý phòng & thành viên (BIZ-09)
- **Actor:** ACT-03 Host (chính); ACT-04 Thành viên (xem thành viên, rời phòng); ACT-05 Hệ thống (liên quan)
- **Trigger:** Host hoặc thành viên chọn thao tác trong phần thông tin phòng.
- **Điều kiện chung (mọi nhánh):** người thao tác là thành viên **Đang tham gia**, phòng **Đang hoạt động**; thao tác của host → kiểm tra đúng là host (BR-18). Sai → "Bạn không có quyền thực hiện thao tác này" (Q-037).
- **Kết quả:** Phòng luôn có đúng 1 host và ≤50 thành viên, hoặc phòng đã bị xóa.
- Tách nhánh: **09a** Xem thành viên & sửa tên phòng · **09b** Thêm thành viên · **09c** Kick · **09d** Chuyển quyền host · **09e** Rời phòng · **09f** Giải tán phòng.

#### FLOW-09a Xem thành viên & sửa tên phòng
- **Xem thành viên (mọi thành viên):** hệ thống hiện tên, ảnh, email, online, vai trò từng người (BR-25, BR-27). Từ đây chọn được **Chặn** một người (→ FLOW-07).
- **Sửa tên phòng (host):** 1. Host nhập tên mới (để trống được). 2. Hệ thống kiểm tra quyền host (BR-18). 3. Cập nhật tên; trống → hiển thị tên các thành viên. 4. Tin hệ thống "A đã đổi tên phòng thành …" (BR-24); mọi người thấy ngay (SUP-09, SUP-04).
  - (Q-037) Tên phòng tối đa 50 ký tự (giống tên hiển thị).

#### FLOW-09b Thêm thành viên

```mermaid
flowchart TD
  subgraph H["ACT-03 Host"]
    B1["1. Chọn Thêm thành viên"]
    B3["3. Chọn bạn chưa có trong phòng"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    B2{"2. Phòng còn chỗ? (dưới 50)<br/>BR-15"}
    B4{"4. Người được chọn vẫn là bạn host,<br/>chưa ở trong phòng, đủ chỗ?<br/>BR-18 BR-15"}
    B5["5. Thêm thành viên Đang tham gia;<br/>tin hệ thống A đã thêm B BR-24"]
    B6{"6. Phòng chỉ đọc mà nay ≥3 người?<br/>BR-13"}
    B6a["Mở lại chat bình thường"]
    E1["E1. Phòng đã đủ 50 người"]
    E2["E2. Báo lỗi, bỏ người không hợp lệ"]
  end
  subgraph TV["ACT-01 Người được thêm"]
    B7["7. Nhận thông báo Được thêm vào phòng;<br/>thấy toàn bộ tin còn hạn<br/>SUP-02 BR-20"]
  end
  B1 --> B2
  B2 -- Không --> E1 --> END0(["Kết thúc"])
  B2 -- Có --> B3 --> B4
  B4 -- Không --> E2 --> B3
  B4 -- Có --> B5 --> B6
  B6 -- Có --> B6a --> B7
  B6 -- Không --> B7
  B7 --> END(["Kết thúc"])
```

- **Happy path:** 1. Host chọn Thêm thành viên. 2. Hệ thống kiểm tra phòng < 50 người (BR-15). 3. Host chọn một hoặc nhiều **bạn của mình** chưa có trong phòng. 4. Kiểm tra từng người vẫn là bạn host, chưa ở trong phòng, tổng không vượt 50 (BR-18, BR-15). 5. Thêm thành viên (ENT-07) **Đang tham gia** — không cần người được thêm đồng ý (Q-029); tin hệ thống "A đã thêm B" (BR-24). 6. Nếu phòng đang chỉ đọc và giờ có ≥3 người → chat lại bình thường (BR-13). 7. Người được thêm nhận thông báo (SUP-02, SUP-03), thấy toàn bộ tin còn hạn (BR-20). Kết thúc.
- **Alternative:** A1. Thêm lại người đã rời / bị kick → lần tham gia mới, thấy toàn bộ tin còn hạn (BR-20).
- **Exceptions:** E1. Phòng đủ 50 → không thêm được. E2. Người được chọn vừa hủy kết bạn / chặn host, hoặc vượt số chỗ còn lại → báo lỗi, quay lại bước 3.
- **Business rules:** BR-13, BR-15, BR-18, BR-20, BR-24.

#### FLOW-09c Kick thành viên

```mermaid
flowchart TD
  subgraph H["ACT-03 Host"]
    K1["1. Chọn Kick một thành viên + xác nhận"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    K2{"2. Người đó còn Đang tham gia?"}
    K3["3. Thành viên → Bị kick;<br/>tin hệ thống A đã mời B ra khỏi phòng BR-24"]
    K4["4. Đóng phòng trên màn hình người bị kick<br/>SUP-09 BR-20"]
    E1["E1. Người này không còn trong phòng"]
  end
  subgraph TV["ACT-01 Người bị kick"]
    K5["5. Nhận thông báo Bị kick khỏi phòng<br/>SUP-02"]
  end
  K1 --> K2
  K2 -- Không --> E1 --> END0(["Kết thúc"])
  K2 -- Có --> K3 --> K4 --> K5 --> END(["Kết thúc"])
```

- **Happy path:** 1. Host chọn Kick một thành viên (không phải chính mình) và xác nhận. 2. Kiểm tra người đó còn Đang tham gia. 3. ENT-07 → **Bị kick**; tin hệ thống (BR-24). 4. Người bị kick mất phòng ngay, không xem được tin nữa (BR-20, SUP-09). 5. Người bị kick nhận thông báo (SUP-02, SUP-03).
- **Alternative:** A1. Kick làm phòng chỉ còn 2 người không còn là bạn / có chặn → phòng chuyển chỉ đọc (BR-13). A2. Kick làm phòng chỉ còn host → phòng vẫn tồn tại (Q-018).
- **Exceptions:** E1. Người đó vừa rời → "Người này không còn trong phòng".
- **Business rules:** BR-13, BR-18, BR-20, BR-24.

#### FLOW-09d Chuyển quyền host

```mermaid
flowchart TD
  subgraph H["ACT-03 Host hiện tại"]
    T1["1. Chọn Chuyển quyền host → chọn 1 thành viên"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    T2{"2. Người nhận còn Đang tham gia?"}
    T3["3. Đổi vai trò: người nhận → Host,<br/>host cũ → Thành viên BR-17;<br/>tin hệ thống BR-24"]
    E1["E1. Người này không còn trong phòng"]
  end
  subgraph NN["ACT-04 Người nhận quyền"]
    T4["4. Nhận thông báo Được nhận quyền host<br/>SUP-02"]
  end
  T1 --> T2
  T2 -- Không --> E1 --> END0(["Kết thúc"])
  T2 -- Có --> T3 --> T4 --> END(["Kết thúc"])
```

- **Happy path:** 1. Host chọn một thành viên đang tham gia. 2. Kiểm tra còn Đang tham gia. 3. Đổi vai trò hai người — không cần người nhận đồng ý (Q-029); luôn đúng 1 host (BR-17); tin hệ thống "A chuyển quyền host cho B" (BR-24). 4. Người nhận được thông báo (SUP-02, SUP-03).
- **Exceptions:** E1. Người nhận vừa rời → "Người này không còn trong phòng".
- **Business rules:** BR-17, BR-18, BR-24.

#### FLOW-09e Rời phòng

```mermaid
flowchart TD
  subgraph ND["ACT-03/04 Người rời"]
    R1["1. Chọn Rời phòng"]
    R3["3. Host: chọn người nhận quyền"]
    R5["5. Xác nhận"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    R2{"2. Là host?"}
    R4{"4. Host là người cuối cùng?<br/>BR-19"}
    R4a["Cảnh báo: rời = phòng bị xóa"]
    R6["6. Chuyển quyền cho người được chọn<br/>→ FLOW-09d bước 3–4"]
    R7["7. Thành viên → Đã rời; mất phòng;<br/>tin hệ thống C đã rời phòng<br/>BR-20 BR-24"]
    R8{"8. Phòng còn 2 người<br/>không là bạn / có chặn?<br/>BR-13"}
    R8a["Phòng → Chỉ đọc"]
    R9["9. Xóa phòng + toàn bộ tin, ảnh<br/>SUP-08"]
  end
  R1 --> R2
  R2 -- "Không (thành viên)" --> R5
  R2 -- Có --> R4
  R4 -- Có --> R4a --> R5
  R4 -- Không --> R3 --> R5
  R5 --> R4b{"Host cuối cùng?"}
  R4b -- Có --> R9 --> END1(["Phòng đã xóa"])
  R4b -- "Không, là host" --> R6 --> R7
  R4b -- "Không, là thành viên" --> R7
  R7 --> R8
  R8 -- Có --> R8a --> END2(["Kết thúc"])
  R8 -- Không --> END2
```

- **Happy path (thành viên):** 1. Chọn Rời phòng. 2. Không phải host. 5. Xác nhận. 7. ENT-07 → **Đã rời**, mất phòng và tin (BR-20); tin hệ thống "C đã rời phòng" (BR-24). 8. Nếu còn đúng 2 người không là bạn / có chặn → phòng chỉ đọc (BR-13). Kết thúc.
- **Alternative paths:**
  - A1. *(Host, còn người khác)* bước 3 chọn người nhận quyền ngay trong thao tác rời (Q-029) → 5 xác nhận → 6 chuyển quyền (FLOW-09d bước 3–4, có thông báo SUP-02) → 7.
  - A2. *(Host là người cuối cùng)* bước 4 cảnh báo rời = phòng bị xóa → 5 xác nhận → 9 xóa phòng (ENT-06 **Đã xóa**) cùng toàn bộ tin và ảnh (BR-19, SUP-08).
  - A3. Không xác nhận ở bước 5 → không đổi gì.
- **Business rules:** BR-13, BR-17, BR-19, BR-20, BR-24.

#### FLOW-09f Giải tán phòng

```mermaid
flowchart TD
  subgraph H["ACT-03 Host"]
    G1["1. Chọn Giải tán phòng + xác nhận<br/>(cảnh báo xóa toàn bộ tin, ảnh)"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    G2["2. Phòng → Đã xóa; xóa toàn bộ tin, ảnh<br/>BR-19 SUP-08"]
    G3["3. Đóng phòng trên màn hình mọi người;<br/>gỡ khỏi danh sách phòng SUP-09 SUP-04"]
  end
  subgraph TV["ACT-04 Các thành viên khác"]
    G4["4. Nhận thông báo Phòng bị giải tán<br/>SUP-02"]
  end
  G1 --> G2 --> G3 --> G4 --> END(["Kết thúc"])
```

- **Happy path:** 1. Host chọn Giải tán và xác nhận (cảnh báo không khôi phục được). 2. Phòng → **Đã xóa**, toàn bộ tin và ảnh bị xóa (BR-19, SUP-08). 3. Phòng biến mất với mọi thành viên ngay, kể cả người đang mở (SUP-09, SUP-04). 4. Các thành viên khác nhận thông báo "Phòng X đã bị giải tán" (SUP-02, SUP-03) — thông báo giữ tên phòng để người nhận biết (Q-037).
- **Business rules:** BR-18, BR-19.
