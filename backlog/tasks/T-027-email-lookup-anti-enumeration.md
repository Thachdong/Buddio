# T-027 · Chống dò email: thời gian phản hồi đều & giới hạn 100 lượt/giờ

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-07 | M5 | 3 | T-014 | TODO |

## 1. Mục tiêu demo
Sau task này: **Chạy script đo 50 lượt tra cho mỗi loại "không tìm thấy" (chưa đăng ký / ẩn danh / có chặn) và "tìm thấy" → chênh lệch thời gian trung bình giữa các loại "không tìm thấy" ≤50ms, body giống hệt từng byte; người dùng mở Thêm bạn SCR-07 tra tới lượt thứ 101 trong 1 giờ → ô tra bị khóa với thông báo "Bạn đã tra quá nhiều email trong 1 giờ. Thử lại sau HH:mm."**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-07.A1 | Tăng cường: khóa ô tra, thông báo giới hạn |
| API | `createEmailLookup` | Làm đều thời gian; `429 EMAIL_LOOKUP_RATE_LIMITED` + `Retry-After` |
| Dữ liệu | TBL-01 `users.lookup_window` | `{start, count}` |
| Dữ liệu | TBL-11 `config/limits.email_lookups_per_hour` | Chỉ đọc (100) |
| Rule | BR-04 | "Không tìm thấy" giống hệt nhau |
| NFR | NFR-15 | Phần thời gian: chênh lệch trung bình ≤50ms |
| NFR | NFR-16 | >100 lượt / giờ → khóa trong phần còn lại của 1 giờ |
| Flow | FLOW-03 bước 3 | Đối chiếu email |

**Ngoài phạm vi:** giới hạn gửi lời mời / tạo link (không áp – Q-034, NFR-16); nội dung "không tìm thấy" giống hệt (đã làm ở T-005, task này chỉ thêm test byte-level).

## 3. Việc cần làm
### UI
- [ ] SCR-07: nhận `429` → đọc header `Retry-After` (giây) → tính giờ mở khóa theo múi giờ thiết bị → hiện banner 5 "Bạn đã tra quá nhiều email trong 1 giờ. Thử lại sau HH:mm."; khóa ô email (2) và nút Tìm (3) tới giờ đó (timer tự mở khóa).
- [ ] Lưu `lockedUntil` trong `sessionStorage` để tải lại trang vẫn khóa `[ASSUMED → Q-047]`; server vẫn là nơi quyết định.

### API / Backend
- [ ] Middleware / helper `withMinDuration(handler, MIN_MS)` cho `createEmailLookup`: mọi kết quả (`self`, `already_friends`, `pending_sent`, `reject_cooldown`, `found`, `not_found`) đều trả sau ít nhất `EMAIL_LOOKUP_MIN_RESPONSE_MS` tính từ lúc nhận request; giá trị mặc định 400ms `[ASSUMED → Q-047]`, chọn ≥ p99 của đường xử lý chậm nhất đo trên emulator.
- [ ] Không rút ngắn đường "không tìm thấy" (vẫn đọc đủ các nhánh như đường dài để giảm chênh lệch tự nhiên) `[ASSUMED → Q-047]`.
- [ ] Rate limit trong transaction trên `users/{me}`: `lookup_window` null hoặc `now − start ≥ 1h` → `{start: now, count: 1}`; ngược lại `count + 1`; nếu `count` đã = `email_lookups_per_hour` → `429 EMAIL_LOOKUP_RATE_LIMITED`, header `Retry-After = ceil((start + 1h − now)/1000)`, không tra.
- [ ] Đếm cả lượt tra có kết quả bất kỳ (kể cả `self`); request sai định dạng (`400 VALIDATION_FAILED` / `422 EMAIL_INVALID`) không tính `[ASSUMED → Q-047]`.
- [ ] Phản hồi `not_found` cho 3 nguyên nhân: cùng status 200, cùng body `{"result":"not_found"}`, cùng tập header (không `ETag`, không header tùy biến khác nhau), `Cache-Control: no-store`.
- [ ] Log: chỉ `result`, thời gian xử lý; không log email (NFR-27).

### Data
- [ ] `users.lookup_window` (map `{start: timestamp, count: int}`) — field đã khai báo ở database.md; không index; rules không đổi (client đọc `users/{me}` nhưng không ghi).

### Khác
- [ ] Biến môi trường `EMAIL_LOOKUP_MIN_RESPONSE_MS` (mặc định 400) trong `.env.example`.
- [ ] Script `scripts/measure-lookup-timing.ts`: gọi API trên emulator 50 lượt / loại (chưa đăng ký, ẩn danh, chặn chiều A→B, chặn chiều B→A, tìm thấy), in trung bình, p50, p95, chênh lệch tối đa giữa các loại `not_found`; exit code ≠ 0 khi chênh lệch trung bình >50ms.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | Seed: email chưa đăng ký U1, người ẩn danh U2, người A đã chặn U3, người đã chặn A U4 | Script đo gọi 50 lượt cho mỗi loại (tài khoản đo được miễn giới hạn bằng seed `lookup_window` reset mỗi 90 lượt) | Chênh lệch thời gian phản hồi trung bình giữa 4 loại ≤50ms; mọi phản hồi ≥ `EMAIL_LOOKUP_MIN_RESPONSE_MS` | NFR-15, BR-04 |
| AC-2 | Như AC-1 | So sánh phản hồi của 4 loại | Status, body (byte-level) và tập header giống hệt nhau | BR-04, NFR-15 |
| AC-3 | Tài khoản A chưa tra lần nào | A tra lần 1 | `users/A.lookup_window = {start: now, count: 1}` | NFR-16 |
| AC-4 | `lookup_window.count = 100`, `start` cách đây 20 phút | A tra lần 101 | `429 EMAIL_LOOKUP_RATE_LIMITED`, `Retry-After` ≈ 2400 giây (±5); `count` không tăng; SCR-07 hiện "Bạn đã tra quá nhiều email trong 1 giờ. Thử lại sau HH:mm." (HH:mm = giờ thiết bị + 40 phút), ô nhập và nút Tìm disabled | NFR-16, SCR-07 component 5 |
| AC-5 | Như AC-4 | Tải lại trang SCR-07 | Vẫn khóa tới giờ đó | SCR-07 `[ASSUMED → Q-047]` |
| AC-6 | `count = 100`, `start` cách đây 61 phút | A tra | `200`; `lookup_window = {start: now, count: 1}`; ô tra mở | NFR-16 |
| AC-7 | `count = 99` | A tra lần 100 | `200` (lượt 100 vẫn được) | NFR-16 (biên) |
| AC-8 | A đã bị khóa tra | A gửi lời mời cho kết quả đang hiện / tạo link mời | Vẫn thành công (không bị giới hạn) | NFR-16, Q-034 |
| AC-9 | A gửi email sai định dạng 5 lần | Kiểm `lookup_window` | `count` không tăng | `[ASSUMED → Q-047]` |
| AC-10 | Một lượt tra bất kỳ | Đọc log server | Không có email dạng đọc được | NFR-27 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Handler (emulator) với đồng hồ giả: lần 1 tạo cửa sổ; lần 100 được; lần 101 → 429 + `Retry-After` đúng; sau 61 phút reset | AC-3, AC-4, AC-6, AC-7 |
| Request sai định dạng không tăng `count` | AC-9 |
| So sánh byte-level body + header của 4 loại `not_found` | AC-2 |
| `withMinDuration`: handler xong sau 10ms → trả sau ≥400ms; handler xong sau 600ms → trả ngay | AC-1 |
| Script đo timing chạy trong CI (job riêng, emulator) với ngưỡng 50ms | AC-1 |
| `createFriendRequest`, `createInviteLink` khi `lookup_window.count = 100` → vẫn thành công | AC-8 |
| Logger spy: không có email | AC-10 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright: seed `lookup_window = {count: 100, start: now − 20 phút}` → A tra email → banner giới hạn, ô + nút disabled → reload vẫn khóa | AC-4, AC-5 |

### Dữ liệu seed / tiền điều kiện
- Tài khoản A; U2 (`anonymous = true`), U3 (A chặn U3), U4 (U4 chặn A), U5 (tìm thấy); email U1 không tồn tại.
- Seed tùy chọn `lookup_window` cho A theo từng case.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | `npm run measure:lookup` trên emulator | In bảng thời gian; chênh lệch TB ≤50ms, exit 0 | AC-1 |
| 2 | DevTools: tra U1, U2, U3 và so sánh Response + Headers | Giống hệt | AC-2 |
| 3 | Emulator UI đặt `users/A.lookup_window = {count: 100, start: now−20m}`; A tra một email | Banner "…Thử lại sau HH:mm" đúng giờ, ô + nút khóa | AC-4 |
| 4 | Tải lại trang | Vẫn khóa | AC-5 |
| 5 | A vào Lời mời gửi lời mời / tạo link (từ kết quả cũ hoặc qua API) | Thành công | AC-8 |
| 6 | Đặt `start` lùi 61 phút, tra lại | Tra được, `count = 1` | AC-6 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Script đo timing có trong repo và chạy trong CI với ngưỡng 50ms
- [ ] Kết quả đo (trung bình, p95 mỗi loại) ghi vào mô tả PR

## 7. Ghi chú
- `[ASSUMED → Q-047]` Thời gian tối thiểu cố định 400ms (cấu hình được bằng biến môi trường); đo lại và chỉnh khi có staging vì độ trễ Firestore thật khác emulator.
- `[ASSUMED → Q-047]` Cửa sổ cố định 1 giờ tính từ lượt đầu tiên (fixed window), khớp field `lookup_window {start, count}`.
- `[ASSUMED → Q-047]` Lượt tra sai định dạng không tính vào giới hạn; khóa được nhớ phía client bằng `sessionStorage`.
- NFR-15 đo trên local + emulator (Q-045); không chứng minh được trên mạng thật.
- Point 3 giữ nguyên.
