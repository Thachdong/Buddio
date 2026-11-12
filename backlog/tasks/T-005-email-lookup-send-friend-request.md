# T-005 · Tra email & gửi lời mời kết bạn trong platform

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-02 | M1 | 5 | T-004 | TODO |

## 1. Mục tiêu demo
Sau task này: **A mở tab Bạn bè → "+ Thêm bạn" (SCR-07), nhập email của B (B đã tắt ẩn danh) → Tìm → thấy tên, ảnh B và nút "Gửi lời mời" → bấm → thẻ đổi sang "Đang chờ phản hồi", toast "Đã gửi lời mời"; B có thông báo `friend_request_received` trong emulator.** Nhập email của chính mình / bạn bè / người chưa đăng ký / người ẩn danh → thấy đúng kết quả a / b / f (f chỉ có nút "Copy link mời", chưa bấm được).

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-07.A1 | Tra email, hiển thị 6 kết quả a–f |
| Thao tác | SCR-07.A2 | Gửi lời mời (kết quả e) |
| Thao tác | SCR-08 (khung) | Màn tab Bạn bè tối thiểu: header + nút "+ Thêm bạn" → SCR-07 |
| API | `createEmailLookup` | `POST /email-lookups` |
| API | `createFriendRequest` | `POST /friend-requests` |
| Dữ liệu | TBL-04 `friend_requests` | tạo mới + rules đọc + index `idx_fr_to`, `idx_fr_from`, `idx_fr_pair` |
| Dữ liệu | TBL-05 `friendships`, TBL-06 `blocks` | tạo collection + rules đọc; chỉ đọc khi kiểm (chưa có API ghi) |
| Dữ liệu | TBL-10 `users/{uid}/notifications` | tạo mới + rules đọc; ghi `friend_request_received`, field `expire_at` |
| Dữ liệu | TBL-01, TBL-02, TBL-03, TBL-11 | chỉ đọc (`anonymous`, `status`, `email_index`, `reject_cooldown_hours`, `notification_ttl_days`) |
| Rule | BR-03, BR-04, BR-05, BR-08, BR-10, BR-09 (A5) | |
| Phụ trợ | SUP-01 | tạo thông báo lời mời mới |
| NFR | NFR-15 (phần nội dung giống hệt), NFR-22 (mời bạn ≤3 bước), NFR-24, NFR-27 | |
| Flow | FLOW-03 bước 1–7, A1, A2, A3 (chỉ hiển thị), A4, A5, E1, E3 | |

**Ngoài phạm vi:** nút "Copy link mời" hoạt động (T-010); nút "Thu hồi lời mời" ở kết quả c (T-012); link "Xem lời mời đã gửi" (T-006); giới hạn 100 lượt/giờ + làm đều thời gian phản hồi (T-027); danh sách bạn (T-007); badge / hàng "Lời mời kết bạn" ở SCR-08 (T-006).

## 3. Việc cần làm
### UI
- [ ] SCR-08 khung: route `/friends` trong layout tab, header "Bạn bè" + nút "+ Thêm bạn" → `/friends/add` (phần danh sách để trống – T-007).
- [ ] SCR-07 `/friends/add`: màn con toàn màn hình, ẩn thanh tab; header ← + "Thêm bạn"; ô email (`type=email`, `autocomplete=off`), nút "Tìm" (Enter cũng tìm), ghi chú "Chỉ tìm được bằng email chính xác." (SCR-07 mục 2).
- [ ] Validation client bằng Zod schema dùng chung: trim + lowercase, sai định dạng → "Email không đúng định dạng." (E1), không gọi API.
- [ ] Nút "Tìm" disabled khi ô trống / đang tra; loading: spinner ở nút + skeleton thẻ kết quả.
- [ ] Thẻ kết quả theo `result`: a "Đây là email của bạn" · b "Hai bạn đã là bạn bè" · c "Đang chờ phản hồi" (không ảnh/tên – Q-044) · d "Chưa thể gửi lại, thử lại sau HH:mm ngày dd/MM" (giờ theo múi giờ thiết bị – NFR-24) · e ảnh + tên + nút "Gửi lời mời" · f "Không tìm thấy người dùng phù hợp" + câu hướng dẫn link 7 ngày + nút "Copy link mời" (disabled, tooltip "Sắp có" `[ASSUMED → Q-047]` – làm ở T-010).
- [ ] Thẻ f là **một component duy nhất**, không nhận tham số lý do (BR-04): không ảnh, không tên, không màu khác.
- [ ] Đổi nội dung ô email → xóa thẻ kết quả cũ (SCR-07 mục 5).
- [ ] Gửi lời mời (e): spinner nút → thành công đổi thẻ sang c + toast "Đã gửi lời mời". Lỗi: `ALREADY_FRIENDS` → b; `FRIEND_TARGET_NOT_FOUND` → f; `REJECT_COOLDOWN` → d (lấy `details[0].retryAfter`); `FRIEND_REQUEST_ALREADY_PENDING` → c `[ASSUMED → Q-047]`; `CANNOT_INVITE_SELF` → a; lỗi mạng → toast "Không kết nối được, thử lại".
- [ ] Mọi chuỗi giao diện thêm vào file từ điển tiếng Việt (NFR-24).

### API / Backend
- [ ] `POST /api/email-lookups` (`createEmailLookup`): xác thực ID token + phiên (middleware T-002/T-003), `CONSENT_REQUIRED` khi chưa có tài khoản; Zod `EmailLookupCreate` → `VALIDATION_FAILED` / `422 EMAIL_INVALID`.
- [ ] Domain `lookupEmail(meUid, emailNorm)` theo **đúng thứ tự** của contract: `self` → có chặn bất kỳ chiều (`blocks/A_B`, `blocks/B_A`) → `not_found` → `already_friends` (`friendships/{uidMin_uidMax}`) → `pending_sent` (index `idx_fr_pair`, `from=me,to=B,status=pending`) → `reject_cooldown` (lời mời `from=me,to=B,status=rejected` mới nhất có `responded_at + reject_cooldown_hours > now`) → `found` (`users.anonymous == false`, `status == active`) → còn lại `not_found`.
- [ ] Response: `found` → `{result, user:{displayName, photoUrl}}`; `pending_sent` → `{result, requestId, user}`; `reject_cooldown` → `{result, retryAfter}`; `already_friends` → `{result, user:{uid, displayName, photoUrl}}`; `self` → `{result}`; `not_found` → **chỉ** `{"result":"not_found"}` cho mọi lý do (BR-04, NFR-15 – phần nội dung).
- [ ] `POST /api/friend-requests` (`createFriendRequest`): body `{email}`; trong **một Firestore transaction** kiểm lại toàn bộ BR-05 (FLOW-03 E3): self → `422 CANNOT_INVITE_SELF`; không có / ẩn danh / chặn / không active → `404 FRIEND_TARGET_NOT_FOUND`; đã là bạn → `409 ALREADY_FRIENDS`; đã có pending cùng chiều → `409 FRIEND_REQUEST_ALREADY_PENDING` (BR-08); cooldown → `409 REJECT_COOLDOWN` + `details[0].retryAfter` (BR-10). Lời mời ngược chiều đang chờ **không** chặn (BR-09, A5).
- [ ] Ghi trong cùng transaction: `friend_requests` (`from_uid`, `to_uid`, `channel = in_app`, `status = pending`, `created_at`, `expire_at = null`) + `users/{to}/notifications` (`type = friend_request_received`, `actor_uid = me`, `ref_type = friend_request`, `ref_id`, `read = false`, `expire_at = created_at + notification_ttl_days`) (SUP-01). Trả `201 FriendRequest`.
- [ ] Logger: không ghi email dạng đọc được (chỉ hash ngắn hoặc bỏ) – NFR-27.

### Data
- [ ] `firestore.rules`: `friend_requests` đọc khi `resource.data.from_uid == auth.uid || resource.data.to_uid == auth.uid`; `friendships` đọc khi `auth.uid in resource.data.member_uids`; `blocks` đọc khi `resource.data.blocker_uid == auth.uid`; `users/{uid}/notifications/*` đọc khi `auth.uid == uid`. Mọi `write` deny (ADR-03).
- [ ] `firestore.indexes.json`: `idx_fr_to` (to_uid, status, created_at desc), `idx_fr_from` (from_uid, status, created_at desc), `idx_fr_pair` (from_uid, to_uid, status, responded_at desc).
- [ ] Seed script emulator (`scripts/seed`): bổ sung người dùng mẫu cho các trường hợp a–f (xem mục 5).

### Khác
- [ ] Type dùng chung `EmailLookupResult`, `FriendRequest` sinh/khớp với `specs/api-contract.yml`.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A đăng nhập; B active, `anonymous = false`, không chặn, chưa là bạn, không có lời mời | A nhập `Binh.Tran@Test.local ` (hoa/thường, khoảng trắng) và bấm Tìm | Thẻ e hiện ảnh + tên B và nút "Gửi lời mời" | FLOW-03 bước 1–5, BR-03, BR-05 |
| AC-2 | Như AC-1, thẻ e đang hiện | A bấm "Gửi lời mời" | Thẻ đổi sang "Đang chờ phản hồi", toast "Đã gửi lời mời"; emulator có 1 `friend_requests` `from=A,to=B,channel=in_app,status=pending`; `users/B/notifications` có 1 doc `friend_request_received`, `actor_uid=A`, `expire_at = created_at + 30 ngày` | FLOW-03 bước 6–7, SUP-01 |
| AC-3 | A đăng nhập | A tra email của chính mình | Thẻ "Đây là email của bạn", không có nút | FLOW-03 A1 |
| AC-4 | A và B đã là bạn (seed `friendships`) | A tra email B | Thẻ "Hai bạn đã là bạn bè" | FLOW-03 A2 |
| AC-5 | A đã có lời mời pending tới B | A tra email B | Thẻ "Đang chờ phản hồi", không hiện ảnh/tên; response có `requestId` | FLOW-03 A3, BR-08 |
| AC-6 | B đã từ chối lời mời của A cách đây 2 giờ | A tra email B | Thẻ "Chưa thể gửi lại, thử lại sau HH:mm ngày dd/MM" với thời điểm = `responded_at + 24h` theo giờ máy | FLOW-03 A4, BR-10 |
| AC-7 | B đã từ chối lời mời của A cách đây 24 giờ 1 phút | A tra email B | Thẻ e (tìm thấy) — biên 24h | BR-10 |
| AC-8 | Ba email: chưa đăng ký / ẩn danh (`anonymous = true`) / B chặn A (hoặc A chặn B) | A tra lần lượt từng email | Cả 3 lần response body đúng bằng `{"result":"not_found"}` và DOM thẻ f giống hệt nhau (chỉ có "Copy link mời") | BR-04, NFR-15, FLOW-03 bước 8 |
| AC-9 | B đã từ chối A <24h **và** B chặn A | A tra email B | Kết quả `not_found` (chặn kiểm trước cooldown) | Q-044, BR-04 |
| AC-10 | B đã có lời mời pending gửi cho A | A tra email B → Gửi lời mời | Thẻ e rồi c; emulator có 2 lời mời pending hai chiều | FLOW-03 A5, BR-09 |
| AC-11 | A đang ở thẻ e của B | B bật ẩn danh (hoặc chặn A) rồi A bấm "Gửi lời mời" | API `404 FRIEND_TARGET_NOT_FOUND`, UI hiện thẻ f, không tạo lời mời | FLOW-03 E3, BR-04 |
| AC-12 | A đang ở thẻ e của B | B vừa thành bạn với A (seed `friendships`) rồi A bấm Gửi | API `409 ALREADY_FRIENDS`, UI hiện thẻ b | FLOW-03 E3 |
| AC-13 | A đã gửi pending tới B | Gọi `createFriendRequest` lần 2 cùng email | `409 FRIEND_REQUEST_ALREADY_PENDING`, vẫn chỉ 1 doc pending | BR-08 |
| AC-14 | — | A nhập `abc@` và bấm Tìm | Hiện "Email không đúng định dạng.", không có request mạng; gọi API trực tiếp với email sai → `422 EMAIL_INVALID` | FLOW-03 E1 |
| AC-15 | Có lời mời A→B | C (không liên quan) đọc doc lời mời / `users/B/notifications` bằng client SDK | Bị từ chối (permission-denied); A và B đọc được lời mời; client bất kỳ ghi `friend_requests` → bị từ chối | NFR-13, ADR-03 |
| AC-16 | Không có ID token | Gọi `createEmailLookup` / `createFriendRequest` | `401` | NFR-11 |
| AC-17 | A đang ở tab Bạn bè | Đếm thao tác từ "+ Thêm bạn" tới khi lời mời được gửi | ≤ 3 bước (nhập → Tìm → Gửi lời mời) | NFR-22 |
| AC-18 | Đã chạy AC-1 → AC-14 | Đọc log server | Không có chuỗi email dạng đọc được | NFR-27 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `lookupEmail` (emulator Firestore): mỗi kết quả a, b, c, d, e, f có một case; email chuẩn hóa trim + lowercase | AC-1, AC-3 → AC-6 |
| `lookupEmail` biên cooldown: 23h59m → d; 24h01m → e | AC-6, AC-7 |
| `lookupEmail` not_found: 3 lý do → `JSON.stringify(body)` bằng nhau từng byte | AC-8 |
| `lookupEmail`: rejected <24h + chặn → `not_found` | AC-9 |
| `createFriendRequest` handler: tạo lời mời + thông báo trong cùng transaction (kiểm cả 2 doc) | AC-2 |
| `createFriendRequest`: lời mời ngược chiều pending → vẫn 201 | AC-10 |
| `createFriendRequest`: target ẩn danh / chặn / không tồn tại → 404 `FRIEND_TARGET_NOT_FOUND`; bạn → 409 `ALREADY_FRIENDS`; trùng pending → 409; cooldown → 409 + `retryAfter`; self → 422 | AC-11 → AC-13 |
| Zod schema email: sai định dạng → `EMAIL_INVALID` | AC-14 |
| Rules test (`@firebase/rules-unit-testing`): đọc `friend_requests` allow from/to, deny người khác; deny mọi ghi; `notifications` chỉ chủ đọc; `friendships` chỉ thành viên; `blocks` chỉ blocker | AC-15 |
| Route handler không token → 401 | AC-16 |
| Spy logger trong test handler: không chứa email đầu vào | AC-18 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 375×812: A đăng nhập (Auth emulator) → Bạn bè → Thêm bạn → nhập email B → Tìm → Gửi lời mời → thấy "Đang chờ phản hồi"; kiểm doc lời mời trong emulator | AC-1, AC-2, AC-17 |
| Playwright: tra 3 email not_found → so sánh `innerHTML` thẻ kết quả giống nhau; nhập `abc@` → thấy lỗi định dạng | AC-8, AC-14 |

### Dữ liệu seed / tiền điều kiện
- Auth + Firestore emulator: A `an@test.local` (active), B `binh.tran@test.local` (`anonymous=false`), C `chi@test.local` (`anonymous=true`), D `dung@test.local` (`anonymous=false`, có `blocks/D_A`), E `em@test.local` (đã là bạn của A), F `phong@test.local` (đã từ chối A 2 giờ trước – `friend_requests` `rejected`, `responded_at = now-2h`); email chưa đăng ký `chua.co@test.local`.
- `config/limits` có `reject_cooldown_hours = 24`, `notification_ttl_days = 30`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Chạy seed, đăng nhập A, mở tab Bạn bè, bấm "+ Thêm bạn" | Màn Thêm bạn, ẩn thanh tab, có ghi chú email chính xác | AC-17 |
| 2 | Nhập ` Binh.Tran@TEST.local` → Tìm | Thẻ e: ảnh + tên B, nút "Gửi lời mời" | AC-1 |
| 3 | Bấm "Gửi lời mời" | Thẻ "Đang chờ phản hồi", toast; Emulator UI: doc `friend_requests` pending + `users/B/notifications` | AC-2 |
| 4 | Tra lại email B | "Đang chờ phản hồi" không ảnh/tên | AC-5 |
| 5 | Tra `an@test.local` | "Đây là email của bạn" | AC-3 |
| 6 | Tra email E | "Hai bạn đã là bạn bè" | AC-4 |
| 7 | Tra email F | "Chưa thể gửi lại, thử lại sau …" đúng giờ = lúc từ chối + 24h | AC-6 |
| 8 | Tra lần lượt C, D, `chua.co@test.local` | Ba thẻ giống hệt nhau, chỉ nút "Copy link mời" (disabled) | AC-8 |
| 9 | A vào Cài đặt tắt Ẩn danh; đăng nhập B ở cửa sổ riêng, tra email A → Gửi lời mời | B gửi được dù A đã mời B; Emulator UI có 2 lời mời pending hai chiều | AC-10 |
| 10 | Ở Emulator UI xóa `blocks/D_A`; A tra email D → thấy thẻ e; tạo lại `blocks/D_A` → A bấm "Gửi lời mời" | Thẻ đổi sang "Không tìm thấy", không có lời mời mới | AC-11 |
| 11 | Nhập `abc@` → Tìm | "Email không đúng định dạng." | AC-14 |
| 12 | Xem log terminal Next.js | Không thấy email nào dạng đọc được | AC-18 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Rules mới cho `friend_requests`, `friendships`, `blocks`, `notifications` có test allow + deny
- [ ] 3 index `idx_fr_*` khai báo trong `firestore.indexes.json` và truy vấn chạy được trên emulator
- [ ] Test khẳng định body `not_found` giống hệt cho 3 lý do (BR-04)
- [ ] Ghi lời mời + thông báo trong cùng transaction

## 7. Ghi chú
- `[ASSUMED → Q-047]` Nút "Copy link mời" ở thẻ f hiển thị nhưng disabled cho tới T-010 (giữ bố cục BR-04 ngay từ đầu).
- `[ASSUMED → Q-047]` `FRIEND_REQUEST_ALREADY_PENDING` khi gửi (hai tab cùng gửi) → UI hiện thẻ c như đã gửi thành công.
- `[ASSUMED → Q-047]` Seed account dùng domain `@test.local` trên Auth emulator.
- Phần "thời gian phản hồi đều" của NFR-15 và giới hạn NFR-16 không làm ở đây (T-027); test AC-8 chỉ so nội dung.
- Point 5 giữ nguyên: 2 endpoint + 4 collection rules + UI 6 trạng thái — vừa đủ 5.
