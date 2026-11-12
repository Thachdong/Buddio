# SCR-01 Đăng nhập

- **Actor:** ACT-01, ACT-02 (ACT-06 Google xác thực)
- **BIZ thể hiện:** BIZ-01 — Buddio chỉ cho vào bằng tài khoản Google (BR-01); lần đăng nhập đầu cũng là đăng ký, nên màn này là cửa vào duy nhất và là nơi lấy đồng ý chính sách quyền riêng tư bắt buộc (NFR-17).
- **FLOW:** FLOW-01 (bước 1–9, E1, E2); FLOW-05 bước 4 (khi đang mở dở link mời)
- **Đến từ:** (mở app khi chưa đăng nhập), SCR-02 (bấm đăng nhập), SCR-11 (đăng xuất / xóa tài khoản), phiên hết hạn 30 ngày · **Đi tới:** SCR-03, SCR-02 (đang mở dở link mời)
- **Wireframe:** [drawio](./drawio/scr-01-login.drawio) — 2 trang: *SCR-01 Đăng nhập*, *Dialog đồng ý chính sách (lần đầu)*. Chưa export PNG (máy không có draw.io CLI).

## 1. Layout
Trang công khai, render ở server (NFR-06), không có thanh tab. Khung mobile 375×812, nội dung căn giữa theo chiều dọc: logo + tên → mô tả → (banner lời mời) → nút Google → vùng lỗi; link chính sách ở chân trang. Lần đầu đăng nhập: dialog chính sách phủ lên màn.

## 2. Thành phần
| # | Component | Loại | Dữ liệu hiển thị / nhập | Validation (BR) |
|---|---|---|---|---|
| 1 | Logo + tên "Buddio" | image + text | Tĩnh | — |
| 2 | Mô tả ngắn | text | "Trò chuyện, xả stress cùng bạn bè. Vào nhanh chỉ với một cú chạm." | — |
| 3 | Banner ngữ cảnh lời mời | banner | "Bạn đang mở một lời mời kết bạn. Đăng nhập để tiếp tục." Chỉ hiện khi đến từ SCR-02 (có `inviteToken` giữ trong query/sessionStorage) | — |
| 4 | Nút "Đăng nhập với Google" | button chính | Mở Google (popup trên desktop, redirect trên điện thoại – ADR-06) | BR-01: không có phương thức khác |
| 5 | Vùng thông báo lỗi | text | "Đăng nhập chưa hoàn tất. Vui lòng thử lại." (hủy / lỗi Google – E1); "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại." (NFR-11); "Bạn đã đăng xuất." / "Tài khoản đã được xóa." (từ SCR-11) | — |
| 6 | Link "Chính sách quyền riêng tư" | link | Mở trang tĩnh chính sách `[ASSUMED → Q-044]` `/privacy` (SSR, không phải SCR riêng) | — |
| 7 | Nội dung chính sách (dialog) | scroll text | Chỉ thu email, tên, ảnh từ Google; không chia sẻ bên thứ ba; dữ liệu lưu tại Singapore (ADR-04) | NFR-17 |
| 8 | Checkbox "Tôi đã đọc và đồng ý…" | checkbox | Mặc định chưa tích | Phải tích mới bật nút 9 |
| 9 | Nút "Đồng ý và tiếp tục" | button chính | — | Disabled khi chưa tích 8 |
| 10 | Nút "Không đồng ý" | button phụ | — | — |

## 3. Thao tác
| Mã | Thao tác | API (operationId) | Kết quả thành công | Khi lỗi |
|---|---|---|---|---|
| SCR-01.A1 | Đăng nhập với Google (nút 4): client lấy Firebase ID token qua Google provider rồi gọi API ghi phiên | `createSession` (`POST /sessions`) | Tài khoản đã có (Đang hoạt động): cập nhật ảnh theo Google, giữ tên nếu `display_name_custom` (Q-029), ghi `last_active_at` → chuyển SCR-02 nếu có `inviteToken`, ngược lại SCR-03. Lần đầu (chưa có tài khoản hoặc email thuộc tài khoản đã xóa – BR-28): API trả `accountStatus = consent_required` → mở dialog chính sách | Người dùng hủy / Google lỗi → ở lại, hiện 5 (E1), không tạo gì. Lỗi mạng/5xx → toast "Không kết nối được, thử lại" |
| SCR-01.A2 | Đồng ý chính sách (nút 9) | `createAccount` (`POST /accounts`, body `{acceptPrivacyPolicy: true, policyVersion}`) | Tạo TBL-01/02/03: ẩn danh **bật**, online **bật**, tên + ảnh từ Google; tên thiếu → phần trước "@" của email (FLOW-01 E2) → điều hướng như A1 | Lỗi → giữ dialog, toast lỗi, cho bấm lại |
| — | Không đồng ý (nút 10) | Không API — client `signOut()` Firebase Auth | Đóng dialog, ở lại SCR-01, không tạo tài khoản | — |

Điều hướng: đăng nhập xong → SCR-02 (đang mở dở link, FLOW-01 bước 9) hoặc SCR-03.

## 4. Trạng thái màn
| Trạng thái | Hiển thị |
|---|---|
| Loading | Sau khi Google trả về: nút 4 chuyển spinner "Đang đăng nhập…", khóa thao tác. Khi mở app đã có phiên → không render màn này, chuyển thẳng SCR-03 |
| Empty | Không áp dụng |
| Error | Vùng 5 (hủy / lỗi Google / phiên hết hạn); lỗi mạng → toast |
| Không có quyền | Không áp dụng (trang công khai) |
| Lần đầu đăng nhập | Dialog chính sách (7–10) bắt buộc, không đóng được bằng chạm ra ngoài |
| Có link mời đang mở dở | Hiện banner 3 |

## 5. Ghi chú UX
- Desktop (≥1024px): khung nội dung giữa màn, rộng tối đa 400px; đăng nhập bằng popup thay vì redirect.
- Không có form đăng ký riêng (BR-01).
- `[ASSUMED → Q-044]` `createSession` trả cờ `consentRequired` thay vì tạo tài khoản ngay; tài khoản chỉ được tạo ở A2 sau khi đồng ý (ADR-06: "bắt đồng ý chính sách trước khi tạo hồ sơ").
