# T-019 · Gửi & xem ảnh trong tin nhắn

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-05 | M3 | 5 | T-009 | TODO |

## 1. Mục tiêu demo
Sau task này: **A mở phòng chat SCR-05, chọn 3 ảnh, thấy ảnh xem trước + thanh tiến độ, bấm Gửi; B thấy tin có lưới 3 ảnh, bấm một ảnh thấy xem lớn "1/3". Chọn 11 ảnh / tổng >10MB / file PDF → báo lỗi, không gửi. Link ảnh lấy ra dùng lại sau khi hết hạn (≤1 giờ) hoặc bởi người ngoài phòng → không xem được.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-05.A5 | Chọn & upload ảnh tạm `uploads/{me}/{uuid}` |
| Thao tác | SCR-05.A6 | Gửi tin có ảnh (có / không kèm chữ) |
| Thao tác | SCR-05.A9 | Lấy signed URL xem ảnh |
| API | `createMessage` | Mở rộng body `images[]` (`uploadPath`, `width`, `height`) |
| API | `listMessageImageUrls` | `GET /rooms/{roomId}/messages/{messageId}/image-urls` |
| Dữ liệu | TBL-09 `messages.images` | Ghi `{path, content_type, size_bytes, width, height}` |
| Dữ liệu | Cloud Storage | Rules `uploads/{uid}/**`; chuyển ảnh sang `rooms/{roomId}/messages/{messageId}/{i}`; `customTime = expire_at` (phòng ngắn hạn); lifecycle `uploads/` `age: 1` |
| Dữ liệu | TBL-07 `rooms.last_message.image_count` | "Đã gửi n ảnh" |
| Rule | BR-21 | ≤10 ảnh, tổng ≤10MB, chỉ `image/*`, có chữ hoặc ảnh |
| Phụ trợ | SUP-08 | Lưu trữ ảnh private |
| NFR | NFR-05 | Xem trước ≤2s, 10 ảnh / 10MB gửi P95 ≤10s, có tiến độ |
| NFR | NFR-13 | Không link công khai; signed URL hết hạn `min(1h, expire_at)`; chỉ thành viên `active` |
| Flow | FLOW-10a bước 4, 7–8 | happy path phần ảnh |
| Flow | FLOW-10a E1 (phần ảnh) | quá 10 ảnh / >10MB / không phải ảnh |

**Ngoài phạm vi:** xóa ảnh khi thu hồi (T-020); lifecycle `rooms/` theo `customTime` và ẩn ảnh hết hạn (T-023); kéo-thả ảnh trên desktop (xem Ghi chú); resize ảnh phía server (không làm ở MVP – ADR-10).

## 3. Việc cần làm
### UI
- [ ] Nút chọn ảnh (component 16): `<input type="file" accept="image/*" multiple>`; lọc phía client: không phải `image/*` → bỏ + toast "Chỉ gửi được ảnh"; vượt `limits.max_images_per_message` hoặc tổng > `limits.max_image_bytes_per_message` → toast "Tối đa 10 ảnh, tổng 10MB", không thêm ảnh vượt.
- [ ] Khay ảnh đã chọn (component 15): thumbnail tạo bằng `URL.createObjectURL` (≤2s – NFR-05), nút × bỏ ảnh, "n ảnh · x/10 MB", thanh tiến độ từng ảnh; upload lỗi → nút thử lại trên thumbnail.
- [ ] Upload ngay khi chọn bằng `uploadBytesResumable` tới `uploads/{me}/{uuid}` với `contentType` của file; đọc `width`, `height` phía client.
- [ ] Nút Gửi (component 18): disabled khi đang upload hoặc không có chữ lẫn ảnh; gửi body `{text?, images[]}`; xóa khay sau khi gửi thành công.
- [ ] Bubble có ảnh (component 9): lưới 2 cột 1–10 ảnh; khi tin có ảnh hiện trên màn → gọi `listMessageImageUrls` (cache theo `messageId` tới `expiresAt`), placeholder trong lúc tải; 403/404 → ô "Ảnh không còn".
- [ ] Viewer ảnh lớn (component 23): toàn màn hình, "i/n", vuốt trái/phải (và phím ←/→), tên người gửi + giờ, nút ×; ảnh tải lỗi do URL hết hạn → tự gọi lại `listMessageImageUrls` một lần.
- [ ] Mapping lỗi API: `TOO_MANY_IMAGES`, `IMAGES_TOO_LARGE`, `INVALID_IMAGE_TYPE`, `UPLOAD_NOT_FOUND` → toast cụ thể, giữ khay ảnh để sửa.
- [ ] Xem trước tin cuối ở SCR-03: tin chỉ có ảnh → "Đã gửi n ảnh" / "{Tên}: Đã gửi n ảnh".

### API / Backend
- [ ] Mở rộng Zod `MessageCreate`: `images` mảng `MessageImageUpload` (`uploadPath`, `width`, `height`), `anyOf text | images`.
- [ ] `createMessage`: với mỗi `uploadPath` – phải bắt đầu bằng `uploads/{uid người gửi}/` và tồn tại → nếu không `422 UPLOAD_NOT_FOUND`; đọc `contentType`, `size` **từ metadata Storage** (không tin client); số ảnh > `max_images_per_message` → `422 TOO_MANY_IMAGES`; tổng > `max_image_bytes_per_message` → `422 IMAGES_TOO_LARGE`; khác `image/*` → `422 INVALID_IMAGE_TYPE`; không chữ không ảnh → `422 MESSAGE_EMPTY`.
- [ ] Sau khi kiểm thành viên / phòng (như T-009): copy ảnh sang `rooms/{roomId}/messages/{messageId}/{index}` (phòng `short` → metadata `customTime = expire_at`), xóa file tạm; ghi `messages.images[]`, `rooms.last_message.image_count`. Thứ tự: copy trước, ghi transaction sau; transaction lỗi → xóa file đã copy `[ASSUMED → Q-047]`.
- [ ] Idempotent khi gửi lại (cùng `messageId`): ảnh đã chuyển → so khớp theo danh sách `images` đã lưu, trả `200`; không đòi lại file tạm `[ASSUMED → Q-047]`.
- [ ] Handler `GET /api/rooms/[roomId]/messages/[messageId]/image-urls` (`listMessageImageUrls`): thành viên `active` (403 `NOT_ROOM_MEMBER`); phòng không tồn tại → 404 `ROOM_NOT_FOUND`; tin không tồn tại / `expire_at ≤ now` → 404 `MESSAGE_NOT_FOUND`; `status = recalled` → 409 `MESSAGE_RECALLED`; trả `{messageId, expiresAt, items[{index, url, contentType, width, height}]}` với `expiresAt = min(now + 1h, expire_at)`.
- [ ] Adapter `ImageUrlSigner`: production dùng `getSignedUrl` v4 (`action: read`, `expires`); emulator không ký URL thật được → bản emulator cấp URL tới route dev `/api/_dev/images?path&exp&sig` (HMAC, kiểm `exp`) để tái hiện việc hết hạn `[ASSUMED → Q-047]`; route dev chỉ bật khi `FIREBASE_STORAGE_EMULATOR_HOST` có giá trị.
- [ ] Log: chỉ số ảnh, tổng byte; không log đường dẫn đầy đủ / nội dung (NFR-27).

### Data
- [ ] `storage.rules`: `uploads/{uid}/{file}` – `write` khi `request.auth.uid == uid` && `request.resource.contentType.matches('image/.*')` && `request.resource.size <= 10 * 1024 * 1024`; `read` chỉ chủ sở hữu; `rooms/**` – client không đọc / ghi.
- [ ] `infra/storage-lifecycle.json`: rule `{action: Delete, condition: {age: 1, matchesPrefix: ["uploads/"]}}` (rule `rooms/` thêm ở T-023).
- [ ] Seed: ảnh mẫu `fixtures/images/` (jpg 500KB × 12, png 4MB × 3, 1 file PDF, 1 file `.jpg` thực chất là text).

### Khác
- [ ] Biến môi trường `DEV_IMAGE_URL_SECRET` (chỉ local/emulator), ghi vào `.env.example`.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A, B là thành viên `active` phòng lâu dài P, đang mở P | A chọn 3 ảnh jpg, gõ "Ảnh nè", bấm Gửi | Khay hiện 3 thumbnail ≤2s + tiến độ; sau gửi B thấy bubble "Ảnh nè" + lưới 3 ảnh; emulator: `messages.images` có 3 phần tử với `size_bytes`, `content_type` thật; file ở `rooms/P/messages/{id}/0..2`, `uploads/A/` không còn file của tin | FLOW-10a bước 4, 7–8, SUP-08, NFR-05 |
| AC-2 | B thấy tin có 3 ảnh | B bấm ảnh thứ 2 | Viewer toàn màn hình "2/3", tên A + giờ; vuốt / ← → đổi ảnh; × đóng | SCR-05 component 23 |
| AC-3 | A đang soạn | A chọn 11 ảnh | Khay chỉ nhận 10, toast "Tối đa 10 ảnh, tổng 10MB"; gọi API trực tiếp với 11 upload → `422 TOO_MANY_IMAGES` | BR-21, FLOW-10a E1 |
| AC-4 | A đang soạn | A chọn ảnh có tổng 12MB | Ảnh làm vượt 10MB không được thêm + toast; API với tổng > 10485760 byte → `422 IMAGES_TOO_LARGE` | BR-21, FLOW-10a E1 |
| AC-5 | A đang soạn | A chọn file PDF / file `.jpg` có `contentType` `text/plain` | PDF bị bỏ + toast "Chỉ gửi được ảnh"; Storage rules từ chối upload `text/plain`; API với upload có `contentType` không phải ảnh (ghi bằng admin) → `422 INVALID_IMAGE_TYPE` | BR-21, NFR-13 |
| AC-6 | B biết `uploadPath` của A | B gọi `createMessage` dùng `uploads/A/...` | `422 UPLOAD_NOT_FOUND`, không file nào bị chuyển | ADR-10, NFR-13 |
| AC-7 | Phòng ngắn hạn 1 ngày | A gửi 1 ảnh | File ở `rooms/…` có metadata `customTime` = `messages.expire_at`; phòng lâu dài thì không có `customTime` | BR-16, ADR-09 |
| AC-8 | A gửi tin chỉ có 2 ảnh | B xem danh sách phòng | Xem trước tin cuối "A: Đã gửi 2 ảnh" | SUP-04 |
| AC-9 | Tin có ảnh trong P | B (thành viên) gọi `listMessageImageUrls` | `200`, mỗi ảnh có URL, `expiresAt` ≤ now + 1h (phòng ngắn hạn: ≤ `expire_at`); mở URL → ảnh hiển thị | NFR-13 |
| AC-10 | C không phải thành viên P | C gọi `listMessageImageUrls`; C đọc trực tiếp `rooms/P/...` qua Storage SDK | API `403 NOT_ROOM_MEMBER`; Storage rules từ chối | NFR-13, BR-20 |
| AC-11 | URL ảnh đã cấp cho B | Mở URL sau `expiresAt` (test: giả lập đồng hồ / `exp` quá khứ) | Không trả ảnh (403); trên UI ô ảnh tự lấy URL mới khi còn là thành viên | NFR-13, SCR-05 component 23 |
| AC-12 | Tin có `expire_at` đã qua (seed) / tin `status = recalled` (seed) | Gọi `listMessageImageUrls` | `404 MESSAGE_NOT_FOUND` / `409 MESSAGE_RECALLED`; UI hiện "Ảnh không còn" | ADR-09, BR-22 |
| AC-13 | A chọn 10 ảnh tổng ~10MB | A bấm Gửi (local + emulator, mạng throttle "Fast 4G" của Chrome) | Có thanh tiến độ; tin hiện trên B trong ≤10 giây | NFR-05 |
| AC-14 | Upload 1 ảnh thất bại (ngắt mạng giữa chừng) | A bấm thử lại trên thumbnail | Ảnh upload lại thành công; trong lúc lỗi nút Gửi disabled | SCR-05.A5 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `createMessage` + Storage emulator: 3 ảnh hợp lệ → 201, file chuyển đúng prefix, `uploads/` trống, `images[]` lấy size/contentType từ metadata | AC-1 |
| Biên: 10 ảnh → 201; 11 → 422 `TOO_MANY_IMAGES`; tổng đúng 10485760 → 201; +1 byte → 422 `IMAGES_TOO_LARGE`; `application/pdf` → 422 `INVALID_IMAGE_TYPE`; path của người khác / không tồn tại → 422 `UPLOAD_NOT_FOUND` | AC-3, AC-4, AC-5, AC-6 |
| Phòng `short` → `customTime` = `expire_at`; `long` → không có | AC-7 |
| `rooms.last_message.image_count` = 2, `text_preview` rỗng | AC-8 |
| `listMessageImageUrls`: thành viên → 200 và `expiresAt = min(now+1h, expire_at)`; người ngoài → 403; tin hết hạn → 404; thu hồi → 409 | AC-9, AC-10, AC-12 |
| Signer emulator: URL quá `exp` hoặc sửa `sig` → 403 | AC-11 |
| Storage rules test: chủ sở hữu ghi `image/png` 1MB được; `text/plain` bị từ chối; >10MB bị từ chối; ghi vào `uploads/{uid khác}` bị từ chối; đọc `rooms/**` bị từ chối | AC-5, AC-10 |
| Component test khay ảnh: lọc 11 ảnh, tổng >10MB, file không phải ảnh, nút Gửi disabled khi đang upload | AC-3, AC-4, AC-5, AC-14 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context: A `setInputFiles` 3 ảnh → Gửi → B thấy lưới 3 ảnh → bấm ảnh 2 → viewer "2/3" → × | AC-1, AC-2 |
| A chọn 11 ảnh + 1 PDF → thấy toast, khay có 10 ảnh, PDF không vào khay | AC-3, AC-5 |

### Dữ liệu seed / tiền điều kiện
- Seed T-009 (A, B, C; phòng lâu dài P1, phòng ngắn hạn P2).
- `fixtures/images/`: 12 ảnh jpg ~500KB, 3 ảnh png ~4MB, 10 ảnh tổng ≈ 9,9MB, 1 PDF.
- Seed thêm: 1 tin có ảnh với `expire_at` đã qua, 1 tin có ảnh `status = recalled`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A mở P1, chọn 3 ảnh | Thumbnail hiện gần như ngay, "3 ảnh · x/10 MB", thanh tiến độ chạy | AC-1 |
| 2 | Gõ "Ảnh nè" → Gửi; B xem | B thấy chữ + lưới 3 ảnh; Emulator Storage: file ở `rooms/P1/messages/…`, `uploads/A/` trống | AC-1 |
| 3 | B bấm ảnh 2, vuốt / bấm → | Viewer "2/3" → "3/3", × đóng | AC-2 |
| 4 | A chọn 11 ảnh, rồi chọn thêm PDF | Toast giới hạn, khay 10 ảnh; PDF bị bỏ + toast | AC-3, AC-5 |
| 5 | A bỏ hết, chọn 3 ảnh png 4MB | Ảnh thứ 3 không vào khay, toast | AC-4 |
| 6 | A mở P2 (ngắn hạn), gửi 1 ảnh; xem metadata file trong Emulator UI | Có `customTime` = `expire_at` của tin | AC-7 |
| 7 | B quay về danh sách phòng sau khi A gửi tin chỉ có 2 ảnh | "A: Đã gửi 2 ảnh" | AC-8 |
| 8 | Copy URL ảnh từ DevTools Network của B, mở trong cửa sổ đăng nhập C; sửa tham số `exp` về quá khứ | Cả hai trường hợp 403, không thấy ảnh | AC-10, AC-11 |
| 9 | Chrome DevTools throttle "Fast 4G", A gửi 10 ảnh ~10MB | Tiến độ chạy, B thấy tin ≤10 giây | AC-13 |
| 10 | Khi đang upload, bật Offline rồi Online, bấm thử lại trên thumbnail lỗi | Upload xong, nút Gửi bật lại | AC-14 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] `storage.rules` có test cho phép / từ chối (chủ sở hữu, sai contentType, quá cỡ, sai uid, đọc `rooms/**`)
- [ ] Route dev ký URL chỉ chạy khi có emulator (test khẳng định trả 404 khi biến môi trường emulator không có)
- [ ] `infra/storage-lifecycle.json` có rule `uploads/` `age: 1`

## 7. Ghi chú
- `[ASSUMED → Q-047]` Storage emulator không ký được signed URL v4 như production → dùng adapter `ImageUrlSigner` với bản emulator (HMAC + `exp`) để AC hết hạn kiểm được trên local; bản production chỉ kiểm bằng unit test (mock) cho tới khi có staging.
- `[ASSUMED → Q-047]` Copy ảnh ngoài transaction Firestore; transaction lỗi → xóa file đã copy; file tạm sót lại do lifecycle `uploads/` dọn sau 1 ngày.
- `[ASSUMED → Q-047]` Gửi lại (cùng `messageId`) sau khi ảnh đã chuyển → so khớp theo `images` đã lưu, trả 200.
- Kéo-thả ảnh vào khung chat trên desktop (SCR-05 mục 5) không có trong slices.md T-019 lẫn T-029 → đề xuất bổ sung vào T-029.
- **Đề xuất point: 8 (sơ bộ 5).** Ngoài upload/gửi còn phải làm signed URL + adapter emulator + viewer + rules Storage mới + kiểm metadata thật. Phương án thay thế: tách T-019a "Gửi ảnh (upload, kiểm BR-21, chuyển file)" 5 điểm và T-019b "Xem ảnh (signed URL, viewer)" 3 điểm. Giữ 5 trong file theo slices.md.
