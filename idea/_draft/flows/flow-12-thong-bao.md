### FLOW-12 Xem & dọn thông báo (SUP-03, SUP-06 — flow phụ trợ, không có BIZ tương ứng)
- **Actor:** ACT-01 (chính); ACT-05 Hệ thống (liên quan)
- **Trigger:** Người dùng mở danh sách thông báo; hoặc thông báo đủ 30 ngày.
- **Kết quả:** Thông báo được đọc / dẫn tới đối tượng liên quan; thông báo cũ tự biến mất.

```mermaid
flowchart TD
  subgraph ND["ACT-01 Người dùng"]
    S1["1. Thấy badge số chưa đọc, mở danh sách thông báo"]
    S3["3. Chọn một thông báo / Đánh dấu tất cả đã đọc"]
  end
  subgraph HT["ACT-05 Hệ thống"]
    S2["2. Hiện thông báo mới nhất trước,<br/>phân biệt chưa đọc SUP-03"]
    S4["4. Thông báo → Đã đọc; cập nhật badge"]
    S5{"5. Loại thông báo?"}
    S5a["Lời mời mới → mở lời mời"]
    S5b["Được thêm / nhận quyền host → mở phòng"]
    S5c["Từ chối / đã thành bạn → mở hồ sơ người đó<br/>trong danh sách lời mời / bạn bè"]
    S5d["Bị kick / phòng giải tán → chỉ đọc nội dung"]
    J1["J1. Thông báo đủ 30 ngày → xóa<br/>SUP-06"]
  end
  S1 --> S2 --> S3 --> S4 --> S5
  S5 --> S5a --> F4(["→ FLOW-04"])
  S5 --> S5b --> F10(["→ FLOW-10"])
  S5 --> S5c --> END1(["Kết thúc"])
  S5 --> S5d --> END1
  J1 --> END2(["Biến mất khỏi danh sách"])
```

- **Happy path:**
  1. Người dùng thấy badge số thông báo chưa đọc, mở danh sách thông báo.
  2. Hệ thống hiện thông báo mới nhất trước, đánh dấu cái chưa đọc (SUP-03).
  3. Người dùng chọn một thông báo, hoặc "Đánh dấu tất cả đã đọc".
  4. Thông báo (ENT-10) → **Đã đọc**; badge cập nhật.
  5. Theo loại: lời mời mới → mở lời mời (FLOW-04); được thêm vào phòng / nhận quyền host → mở phòng (FLOW-10); bị từ chối / đã thành bạn → mở danh sách lời mời / bạn bè; bị kick / phòng giải tán → chỉ đọc nội dung.
- **Alternative paths:** A1. Đối tượng không còn (lời mời đã đóng, phòng đã xóa, đã bị kick khỏi phòng sau đó, người kia xóa tài khoản) → "Nội dung không còn hiệu lực" (Q-037).
- **Flow hệ thống:** J1. Thông báo đủ 30 ngày kể từ lúc tạo (đã đọc hay chưa) → hệ thống xóa (SUP-06, NFR-21).
- **Supporting kích hoạt:** SUP-03 bước 2–4; SUP-06 J1.
- **Business rules / NFR:** NFR-21.
