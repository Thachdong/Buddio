# T-010 · Tạo & copy link mời

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-02 | M2 | 3 | T-005 | TODO |

## 1. Mục tiêu demo
Sau task này: **A mở Thêm bạn, tra email người chưa đăng ký → thẻ "Không tìm thấy" → bấm "Copy link mời" → toast "Đã copy link mời. Hãy gửi cho người bạn qua Messenger, Zalo…"; clipboard có link dạng `http://localhost:3000/invite/{token}`, trong link không đọc được email; emulator không có bản ghi mới.** Sửa 1 ký tự token → hàm giải mã trả "không hợp lệ" (unit test).

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-07.A4 | Nút "Copy link mời" ở thẻ f |
| API | `createInviteLink` | `POST /invite-links` |
| Dữ liệu | — | Không lưu gì (Q-033); đọc `config/limits.invite_ttl_days` |
| Rule | BR-06 | email không xuất hiện dạng chữ, hạn 7 ngày, link mới không vô hiệu link cũ |
| Phụ trợ | SUP-07 | link tự chứa |
| NFR | NFR-14, NFR-15 (link sinh được cả khi có chặn), NFR-27 | |
| Flow | FLOW-03 bước 8–11 | |

**Ngoài phạm vi:** mở link, kiểm hạn / đúng email / quan hệ lúc mở (T-011); giới hạn tra email (T-027 – không áp cho tạo link); Secret Manager thật (chỉ khi deploy – Q-045).

## 3. Việc cần làm
### UI
- [ ] Thẻ f (SCR-07): bật nút "Copy link mời" (đã có ở T-005, đang disabled).
- [ ] Bấm → spinner → gọi API → `navigator.clipboard.writeText(url)` → toast "Đã copy link mời. Hãy gửi cho người bạn qua Messenger, Zalo…".
- [ ] Clipboard lỗi / không hỗ trợ → hiện ô chỉ đọc chứa link (tự chọn toàn bộ khi chạm) để người dùng tự copy (Q-044).
- [ ] Lỗi mạng → toast "Không kết nối được, thử lại"; `CANNOT_INVITE_SELF` không xảy ra từ UI (thẻ a không có nút) nhưng vẫn map thông điệp "Đây là email của bạn".
- [ ] Không có nút chia sẻ khác ở thẻ f (BR-04).

### API / Backend
- [ ] Module `server/invite-token.ts`:
  - `encodeInviteToken({inviterUid, emailNorm, exp})`: payload JSON `{v, inviterUid, emailNorm, exp}` → AES-256-GCM, nonce ngẫu nhiên 96-bit → base64url (ADR-08).
  - `decodeInviteToken(token)` → payload hoặc `null` khi sai định dạng / sai khóa / bị sửa (tag GCM sai) / không biết phiên bản khóa. Kiểm `exp` để T-011 dùng (trả kèm cờ `expired`).
  - Định dạng token: `version(1 byte) ‖ nonce(12) ‖ ciphertext ‖ tag(16)`, version đưa vào AAD `[ASSUMED → Q-047]` để chọn khóa trước khi giải mã và hỗ trợ xoay khóa.
- [ ] `POST /api/invite-links` (`createInviteLink`): auth + `CONSENT_REQUIRED`; Zod `InviteLinkCreate` → `EMAIL_INVALID`; email = email của mình → `422 CANNOT_INVITE_SELF`; còn lại **luôn** `201 {url, expiresAt}` với `exp = now + invite_ttl_days` — kể cả khi thực chất có chặn / đã là bạn / đã đăng ký (BR-04, NFR-15). Không ghi Firestore.
- [ ] Không tăng `lookup_window` (NFR-16 / Q-034). Log không chứa email, token (NFR-27).

### Data
- [ ] Không có collection mới.

### Khác
- [ ] Biến môi trường (emulator/local, `.env.local` + `.env.example`): `INVITE_LINK_KEYS` (JSON `{"1":"<base64 32 byte>"}`), `INVITE_LINK_KEY_VERSION=1`, `APP_BASE_URL=http://localhost:3000` `[ASSUMED → Q-047]`. Ghi chú README: production đọc từ Secret Manager (ADR-08).
- [ ] CI (GitHub Actions): sinh khóa test ngẫu nhiên cho job.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A tra `chua.co@test.local` → thẻ f | A bấm "Copy link mời" | Toast "Đã copy link mời…"; clipboard chứa `{APP_BASE_URL}/invite/{token}`; response `201` có `expiresAt` = now + 7 ngày (±1 phút) | FLOW-03 bước 9–10, SUP-07, BR-06 |
| AC-2 | Token từ AC-1 | Base64url-decode token và tìm chuỗi `chua.co` / `test.local` | Không tìm thấy (email không đọc được) | BR-06, NFR-14 |
| AC-3 | Token hợp lệ | Sửa 1 ký tự bất kỳ (đầu, giữa, cuối) rồi `decodeInviteToken` | Trả `null` (không hợp lệ) | NFR-14 |
| AC-4 | Token mã hóa bằng khóa phiên bản 1 | Giải mã với bộ khóa không có phiên bản 1 / khóa khác | Trả `null` | NFR-14 |
| AC-5 | A đã tạo link cho cùng email lúc trước | A bấm "Copy link mời" lần 2 | Link mới khác link cũ (nonce khác); cả hai đều giải mã được ra cùng `inviterUid`, `emailNorm` | BR-06, Q-034 |
| AC-6 | Trước và sau khi tạo 5 link | Đếm document toàn bộ collection trong Firestore emulator | Không đổi | Q-033, SUP-07 |
| AC-7 | D chặn A (thẻ f vì chặn) | A bấm "Copy link mời" | Vẫn `201` + toast như AC-1 (không lộ lý do) | BR-04, NFR-15, FLOW-03 bước 10 |
| AC-8 | — | Gọi API với email của chính A / email sai định dạng | `422 CANNOT_INVITE_SELF` / `422 EMAIL_INVALID` | contract `createInviteLink` |
| AC-9 | Trình duyệt chặn quyền clipboard | A bấm "Copy link mời" | Hiện ô chỉ đọc chứa link, không lỗi trắng màn | SCR-07.A4, Q-044 |
| AC-10 | Đã tạo link | Đọc log server | Không có email, không có token | NFR-27 |
| AC-11 | Không ID token | Gọi `createInviteLink` | `401` | NFR-11 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `encode` → `decode` round-trip đúng payload; `exp` đúng `invite_ttl_days` | AC-1 |
| Token không chứa email dạng chữ (decode base64url, kiểm substring) | AC-2 |
| Property test: đổi 1 ký tự ở 20 vị trí ngẫu nhiên → luôn `null` | AC-3 |
| Khóa sai / phiên bản lạ → `null` | AC-4 |
| Hai lần encode cùng payload → token khác nhau, cùng decode | AC-5 |
| Handler (emulator): tạo link không ghi Firestore (snapshot số doc trước / sau) | AC-6 |
| Handler: email bị chặn → 201; self → 422; email sai → 422; không token → 401 | AC-7, AC-8, AC-11 |
| Spy logger: không chứa email / token | AC-10 |
| Component test: `clipboard.writeText` reject → hiện ô link chỉ đọc | AC-9 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright (Chromium, cấp quyền `clipboard-read/write`): tra email chưa đăng ký → Copy link mời → đọc clipboard khớp `/invite/` + toast | AC-1 |
| Playwright: không cấp quyền clipboard → thấy ô link chỉ đọc | AC-9 |

### Dữ liệu seed / tiền điều kiện
- A `an@test.local`; D `dung@test.local` có `blocks/D_A`; email chưa đăng ký `chua.co@test.local`.
- `.env.local` có `INVITE_LINK_KEYS`, `INVITE_LINK_KEY_VERSION`, `APP_BASE_URL`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A → Thêm bạn → tra `chua.co@test.local` → Copy link mời | Toast; dán vào ô ghi chú thấy link `/invite/…` | AC-1 |
| 2 | Nhìn link, thử decode base64 (vd bằng `node -e`) | Không thấy email | AC-2 |
| 3 | Bấm Copy link mời lần nữa, so sánh 2 link | Khác nhau | AC-5 |
| 4 | Mở Emulator UI Firestore trước / sau bước 1–3 | Không có document mới | AC-6 |
| 5 | Tra email D → Copy link mời | Toast giống bước 1 | AC-7 |
| 6 | Xem log terminal | Không có email / token | AC-10 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Unit test chống sửa token (NFR-14) pass
- [ ] `.env.example` cập nhật biến khóa link mời; không commit khóa thật
- [ ] Test khẳng định tạo link không ghi Firestore

## 7. Ghi chú
- `[ASSUMED → Q-047]` Định dạng token `version ‖ nonce ‖ ciphertext ‖ tag`, version là AAD (ADR-08 chỉ nói payload có `v`; đưa `v` ra ngoài để chọn khóa trước khi giải mã).
- `[ASSUMED → Q-047]` Khóa ở môi trường local lấy từ biến môi trường `INVITE_LINK_KEYS`; tích hợp Secret Manager làm khi deploy (ngoài môi trường kiểm tra – Q-045).
- Point 3 giữ nguyên (có thể chỉ 2 nếu bỏ phần xoay khóa; giữ 3 vì có module crypto + test bảo mật).
