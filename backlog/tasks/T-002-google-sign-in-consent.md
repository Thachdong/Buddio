# T-002 · Đăng nhập Google lần đầu & đồng ý chính sách

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-01 | M0 | 5 | T-001 | DONE |

## 1. Mục tiêu demo
Sau task này: **Người dùng mới mở app → bấm "Đăng nhập với Google" (Auth emulator) → thấy dialog chính sách quyền riêng tư → tích "Tôi đã đọc và đồng ý…" → "Đồng ý và tiếp tục" → thấy trang Phòng rỗng với thanh tab 4 mục. Lần đăng nhập sau vào thẳng trang Phòng; ảnh cập nhật theo Google, tên đã tự sửa giữ nguyên.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-01.A1 | Đăng nhập với Google → `createSession` |
| Thao tác | SCR-01.A2 | Đồng ý chính sách → `createAccount`; nút "Không đồng ý" → `signOut()` |
| Thao tác | LAYOUT.A1 | Khởi động app → `getMe` (hồ sơ + `limits`) |
| Thao tác | SCR-03 (trạng thái rỗng) | Chỉ empty state, chưa có listener phòng (T-008) |
| API | `createSession`, `createAccount`, `getMe` | |
| Dữ liệu | TBL-01 `users`, TBL-02 `profiles`, TBL-03 `email_index` | tạo mới + rules đọc |
| Dữ liệu | TBL-11 `config/limits` | seed |
| Rule | BR-01, BR-02, BR-28, BR-29 | |
| NFR | NFR-11 (một phần), NFR-13, NFR-17, NFR-22 | `checkRevoked`, ghi `last_active_at`; kiểm hết phiên 30 ngày ở T-003 |
| Flow | FLOW-01 bước 1–8 | happy path |
| Flow | FLOW-01 E1, E2 | hủy Google; thiếu tên |

**Ngoài phạm vi:** quay lại link mời sau đăng nhập, banner lời mời (T-011); đăng xuất, kiểm hết phiên 30 ngày, `SESSION_EXPIRED` (T-003); listener danh sách phòng (T-008); desktop sidebar (T-029).

## 3. Việc cần làm
### UI
- [x] SCR-01 nút "Đăng nhập với Google": `signInWithRedirect` khi viewport < 1024px, `signInWithPopup` khi ≥ 1024px (ADR-06) `[ASSUMED → Q-047]` phân biệt theo `matchMedia('(min-width: 1024px)')`. Sau khi có ID token → gọi `createSession`.
- [x] Trạng thái loading: nút chuyển spinner "Đang đăng nhập…", khóa thao tác (SCR-01 mục 4).
- [x] Vùng lỗi (thành phần 5): hủy popup / lỗi Google (`auth/popup-closed-by-user`, `auth/cancelled-popup-request`, lỗi redirect) → "Đăng nhập chưa hoàn tất. Vui lòng thử lại." (E1). Lỗi mạng / 5xx từ API → toast "Không kết nối được, thử lại".
- [x] Dialog chính sách (thành phần 7–10): nội dung chỉ thu email, tên, ảnh từ Google; không chia sẻ bên thứ ba; dữ liệu lưu tại Singapore. Checkbox mặc định chưa tích; "Đồng ý và tiếp tục" disabled tới khi tích; không đóng bằng chạm ra ngoài / Esc. "Không đồng ý" → `signOut()`, đóng dialog, ở lại SCR-01.
- [x] Lỗi khi `createAccount` → giữ dialog, toast lỗi, cho bấm lại.
- [x] Trang tĩnh `/privacy` (SSR, công khai) cùng nội dung chính sách + phiên bản `2026-11`.
- [x] Auth guard cho nhóm route `(app)`: `onAuthStateChanged` + `getMe`; chưa đăng nhập → `/login`; `403 CONSENT_REQUIRED` → gọi lại `createSession` để lấy `googleProfile` và mở lại dialog chính sách `[ASSUMED → Q-047]`. `/login` khi đã có phiên + tài khoản → chuyển thẳng `/rooms`.
- [x] Context `MeProvider` giữ `me` + `limits` từ `getMe` / `createSession` / `createAccount` cho mọi màn.
- [x] Layout chung mobile: thanh tab dưới 4 mục Phòng / Bạn bè / Thông báo / Cài đặt (icon + nhãn, vùng chạm ≥ 44px); tab đang chọn nổi bật. Tab chưa có màn → trang giữ chỗ "Sắp có" `[ASSUMED → Q-047]` (Cài đặt làm ở T-003, Bạn bè T-007, Thông báo T-024).
- [x] SCR-03 trạng thái rỗng (thành phần 1, 2, 11): tiêu đề "Phòng", "Chưa có phòng nào", nút "Tạo phòng", "Thêm bạn" — hiện nhưng dẫn tới trang giữ chỗ cho tới T-005 / T-008 `[ASSUMED → Q-047]`.
- [x] Client fetch wrapper: gắn `Authorization: Bearer <idToken>` (lấy mới bằng `getIdToken()`), parse schema `Error`, map `code` → thông điệp tiếng Việt từ từ điển.

### API / Backend
- [x] `withAuth` dùng cho mọi route handler (trừ `getHealth`): đọc `Authorization`, `verifyIdToken(token, true)`; thiếu / sai → `401 UNAUTHENTICATED`; token bị thu hồi → `401 TOKEN_REVOKED`. Tùy chọn `requireAccount` (mặc định bật): chưa có `users/{uid}` `active` → `403 CONSENT_REQUIRED` (ngoại lệ: `createSession`, `createAccount`, `openInviteLink`).
- [x] Error handler chung: lỗi Zod → `400 VALIDATION_FAILED` + `details[].field`; `AppError(code, http)` → schema `Error`; lỗi khác → `500 INTERNAL_ERROR` (không lộ stack, log có `requestId`).
- [x] `POST /api/sessions` (`createSession`): lấy email, tên, ảnh từ token. Có `users/{uid}` `active` → transaction: `profiles.photo_url` = ảnh Google; nếu `display_name_custom = false` → `display_name` = tên Google (chuẩn hóa theo BR-29); `users.last_active_at = now`; trả `accountStatus: active` + `me` + `limits`. Chưa có → **không ghi gì**, trả `accountStatus: consent_required` + `googleProfile` + `policyVersion: "2026-11"`.
- [x] `POST /api/accounts` (`createAccount`): Zod `AccountCreate` (`acceptPrivacyPolicy` = true, `policyVersion` 1–32 ký tự); `policyVersion` khác phiên bản hiện hành → `400 VALIDATION_FAILED` `[ASSUMED → Q-047]`. Transaction tạo `users/{uid}` (`email_norm`, `anonymous=true`, `show_online=true`, `status=active`, `consent_at=now`, `last_active_at=now`, `created_at`, `updated_at`), `profiles/{uid}` (`display_name`, `display_name_custom=false`, `photo_url`, `email`, `status=active`), `email_index/{email_norm}` (`uid`). Email lấy từ token, không nhận từ body. Đã có tài khoản → `200` trả hiện có (idempotent); tạo mới → `201` `MeWithLimits`.
- [x] Chuẩn hóa tên (BR-29, FLOW-01 E2): trim; trống / thiếu → phần trước "@" của email; > 50 ký tự → cắt còn 50 `[ASSUMED → Q-047]`.
- [x] `email_index/{email_norm}` đã trỏ tới uid khác đang `active` (trường hợp hiếm: đổi uid Google) → `500 INTERNAL_ERROR` + log cảnh báo, không ghi đè `[ASSUMED → Q-047]`.
- [x] `GET /api/me` (`getMe`): đọc `users`, `profiles`, `config/limits` (cache 5 phút trong bộ nhớ); cập nhật `users.last_active_at` nếu lần ghi trước cách ≥ 1 giờ; trả `MeWithLimits` (bỏ cột nội bộ: `email_norm`, `lookup_window`, `display_name_custom`).
- [x] Repository `config/limits` đọc + map snake_case → camelCase `Limits`.
- [x] Log đăng nhập chỉ ghi `uid`, `accountStatus`; không ghi email / tên (NFR-27).

### Data
- [x] `firestore.rules` mở đọc: `users/{uid}` khi `request.auth.uid == uid`; `profiles/{uid}` `get` khi đã đăng nhập, `list` cấm; `email_index/*`, `config/*` cấm; mọi ghi `if false` (database-design 4.3, NFR-13).
- [x] `npm run seed`: tạo `config/limits` với 13 giá trị mặc định (database-design mục 6) — idempotent.
- [x] Zod schema dùng chung: `Me`, `Limits`, `MeWithLimits`, `SessionResult`, `AccountCreate`, `Error`.

### Khác
- [x] Hằng `PRIVACY_POLICY_VERSION = "2026-11"` trong `shared/` `[ASSUMED → Q-047]` nơi đặt.
- [x] Helper test e2e `loginWithGoogleEmulator(page, {email, name, photo})` điền màn tài khoản giả của Auth emulator.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | Email `binh@gmail.com` chưa có tài khoản | Bấm "Đăng nhập với Google", chọn tài khoản trên Auth emulator | `createSession` trả `consent_required`; dialog chính sách hiện, nút "Đồng ý và tiếp tục" disabled; Firestore chưa có `users/{uid}`, `profiles/{uid}`, `email_index/binh@gmail.com` | FLOW-01 bước 1–5, NFR-17, BR-01 |
| AC-2 | Dialog chính sách đang mở | Tích checkbox → bấm "Đồng ý và tiếp tục" | `createAccount` trả `201`; có `users/{uid}` với `anonymous=true`, `show_online=true`, `status=active`, `consent_at` ≠ null; `profiles/{uid}` tên + ảnh Google; `email_index/binh@gmail.com.uid = uid`; màn chuyển tới trang Phòng rỗng "Chưa có phòng nào" + thanh tab 4 mục | FLOW-01 bước 6, 8, BR-02, SCR-03 Empty |
| AC-3 | Dialog chính sách đang mở | Bấm "Không đồng ý" | Dialog đóng, ở lại SCR-01, Firebase Auth đã `signOut`, không có document nào được tạo | NFR-17, SCR-01 nút 10 |
| AC-4 | Người dùng `an@gmail.com` đã có tài khoản, `display_name_custom=true` với tên "An Gamer", ảnh Google đổi sang URL mới | Đăng nhập lại | Vào thẳng trang Phòng (không có dialog); `profiles.photo_url` = URL mới; `display_name` vẫn "An Gamer"; `users.last_active_at` cập nhật | FLOW-01 bước 7, Q-029 |
| AC-5 | Tài khoản đã có, `display_name_custom=false`, tên Google đổi từ "An" thành "An Nguyễn" | Đăng nhập lại | `profiles.display_name` = "An Nguyễn" | FLOW-01 bước 7 |
| AC-6 | Đang ở SCR-01 | Mở popup / redirect Google rồi hủy | Ở lại SCR-01, vùng lỗi hiện "Đăng nhập chưa hoàn tất. Vui lòng thử lại.", không có document nào được tạo | FLOW-01 E1 |
| AC-7 | Tài khoản Google `noname@gmail.com` không có tên | Đăng nhập lần đầu + đồng ý | `profiles.display_name` = "noname" | FLOW-01 E2, BR-29 |
| AC-8 | Tài khoản Google có tên dài 60 ký tự | Đăng nhập lần đầu + đồng ý | `display_name` dài đúng 50 ký tự (cắt đầu chuỗi) | BR-29 `[ASSUMED → Q-047]` |
| AC-9 | `users/u_old` có `status=deleted`, `email_norm=null`, không có `email_index/cu@gmail.com`; Google trả uid mới `u_new` cho `cu@gmail.com` | Đăng nhập + đồng ý | Tạo `users/u_new`, `profiles/u_new`, `email_index/cu@gmail.com → u_new`; `users/u_old` không đổi | BR-28 |
| AC-10 | Chưa đồng ý chính sách (đã có ID token, chưa có `users/{uid}`) | Gọi `GET /api/me` | `403`, `code = CONSENT_REQUIRED` | NFR-17, api-contract Xác thực |
| AC-11 | Không gửi `Authorization`, hoặc token sai chữ ký | Gọi `GET /api/me` | `401 UNAUTHENTICATED`, body theo schema `Error` | ADR-06 |
| AC-12 | Token của uid đã bị `revokeRefreshTokens` | Gọi `GET /api/me` bằng token cũ | `401 TOKEN_REVOKED` | NFR-11 |
| AC-13 | Body `createAccount` là `{acceptPrivacyPolicy: false}` hoặc thiếu `policyVersion` | Gọi `POST /api/accounts` | `400 VALIDATION_FAILED`, không tạo document | NFR-17, `AccountCreate` |
| AC-14 | Tài khoản đã tạo | Gọi `POST /api/accounts` lần 2 | `200`, trả tài khoản hiện có, không tạo thêm / không đổi `consent_at` | api-contract `createAccount` |
| AC-15 | Đã đăng nhập (uid A) | Client đọc `users/B`, `list` `profiles`, đọc `email_index/*`, `config/limits`, ghi `users/A` | Tất cả bị từ chối; `get` `users/A` và `get` `profiles/B` được phép | NFR-13, database-design 4.3 |
| AC-16 | `last_active_at` cách hiện tại 30 phút | Gọi `getMe` | `last_active_at` không đổi; nếu cách 2 giờ → cập nhật = now | api-contract `getMe` |
| AC-17 | Đã đăng nhập, có tài khoản | Mở `/login` | Chuyển thẳng trang Phòng | SCR-01 mục 4 Loading |
| AC-18 | Đăng nhập lần đầu `binh@gmail.com` | Đọc log server của request | Không có chuỗi `binh@gmail.com` hay tên hiển thị trong log | NFR-27 |
| AC-19 | Viewport 375×812 | Đi hết luồng đăng nhập lần đầu | Không cuộn ngang; dialog hiển thị trọn, các nút trong vùng nhìn thấy | NFR-22 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `createSession` (emulator Auth + Firestore, token thật từ emulator): uid chưa có → `consent_required`, không ghi document | AC-1 |
| `createAccount` hợp lệ → `201`, kiểm 3 document và giá trị mặc định | AC-2 |
| `createSession` tài khoản có `display_name_custom=true` → photo đổi, tên giữ; `false` → tên đổi | AC-4, AC-5 |
| `normalizeDisplayName`: trống / null → phần trước "@"; 60 ký tự → 50; trim khoảng trắng | AC-7, AC-8 |
| `createAccount` với uid mới, email từng thuộc `users/u_old` deleted → tạo mới, `u_old` giữ nguyên | AC-9 |
| `withAuth`: không token → `UNAUTHENTICATED`; token revoked → `TOKEN_REVOKED`; chưa có tài khoản → `CONSENT_REQUIRED` | AC-10, AC-11, AC-12 |
| `createAccount` body sai (false / thiếu / sai version) → `400 VALIDATION_FAILED` | AC-13 |
| `createAccount` gọi 2 lần → lần 2 `200`, `consent_at` không đổi | AC-14 |
| Rules: allow get `users/me`, deny `users/other`, allow get `profiles/x`, deny list `profiles`, deny `email_index`, `config`, deny mọi write | AC-15 |
| `getMe` với `last_active_at` 30 phút trước / 2 giờ trước (fake timer) | AC-16 |
| Bắt log stream khi gọi `createSession` + `createAccount` → không chứa email / tên | AC-18 |
| Error handler: Zod error → `400` có `details[].field`; lỗi lạ → `500 INTERNAL_ERROR` không có stack | AC-11, AC-13 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Happy path mobile: `/login` → Đăng nhập (Auth emulator) → dialog → nút disabled → tích → Đồng ý → thấy "Chưa có phòng nào" + 4 tab; reload → vẫn ở trang Phòng; mở `/login` → chuyển trang Phòng | AC-1, AC-2, AC-17, AC-19 |
| Không đồng ý: đăng nhập → dialog → "Không đồng ý" → ở lại `/login`, Firestore emulator không có `users/{uid}` | AC-3 |
| Đăng nhập lần 2 (seed tài khoản sẵn, đổi ảnh trên Auth emulator) → không có dialog, vào thẳng trang Phòng | AC-4 |

### Dữ liệu seed / tiền điều kiện
- `config/limits` từ `npm run seed`.
- Tài khoản Auth emulator: `binh@gmail.com` (mới, có tên "Bình Trần"), `noname@gmail.com` (không tên), `an@gmail.com` (đã có `users`/`profiles`, `display_name_custom=true`, tên "An Gamer").
- `users/u_old` (`status=deleted`, `email_norm=null`) + `profiles/u_old` (`status=deleted`) cho `cu@gmail.com`; Auth emulator tạo `cu@gmail.com` với uid khác.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | `npm run emulators`, `npm run seed`, `npm run dev`; mở `http://localhost:3000` ở 375×812 | Ở `/login` | — |
| 2 | Bấm "Đăng nhập với Google" → trên màn Auth emulator bấm "Add new account", nhập `binh@gmail.com`, tên "Bình Trần" | Dialog chính sách; nút "Đồng ý và tiếp tục" mờ | AC-1 |
| 3 | Mở Emulator UI Firestore | Chưa có `users`, `profiles`, `email_index` cho Bình | AC-1 |
| 4 | Tích checkbox → "Đồng ý và tiếp tục" | Trang Phòng "Chưa có phòng nào", 4 tab dưới; Firestore có 3 document với `anonymous=true`, `show_online=true` | AC-2, AC-19 |
| 5 | Mở `/login` lần nữa | Chuyển ngay về trang Phòng | AC-17 |
| 6 | Mở cửa sổ ẩn danh, đăng nhập `khach@gmail.com` → "Không đồng ý" | Ở lại `/login`, không có document cho khách | AC-3 |
| 7 | Cửa sổ ẩn danh mới, bấm đăng nhập rồi đóng popup / bấm Back trên màn emulator | "Đăng nhập chưa hoàn tất. Vui lòng thử lại." | AC-6 |
| 8 | Đăng nhập `noname@gmail.com` không nhập tên → đồng ý | `profiles.display_name = "noname"` | AC-7 |
| 9 | Đăng nhập tài khoản tên 60 ký tự → đồng ý | Tên trong `profiles` dài 50 ký tự | AC-8 |
| 10 | Đăng nhập `cu@gmail.com` (seed `u_old` deleted) → đồng ý | Có `users/{uid mới}`; `users/u_old` vẫn deleted | AC-9 |
| 11 | Sửa tay `profiles/{an}.photo_url` thành URL cũ, đăng nhập lại `an@gmail.com` | Không dialog; ảnh trở về URL Google; tên vẫn "An Gamer" | AC-4 |
| 12 | `curl -i http://localhost:3000/api/me` (không header) | `401`, `"code":"UNAUTHENTICATED"` | AC-11 |
| 13 | Xem terminal `npm run dev` | Không thấy email / tên người dùng trong log | AC-18 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Rules `users`, `profiles`, `email_index`, `config` có test allow + deny
- [ ] `withAuth` + error handler + fetch wrapper được dùng lại được cho mọi API sau (có test riêng)
- [ ] Seed `config/limits` chạy lại không lỗi (idempotent)
- [ ] Trang `/privacy` truy cập được không cần đăng nhập

## 7. Ghi chú
- `[ASSUMED → Q-047]` `policyVersion` khác `PRIVACY_POLICY_VERSION` → `400 VALIDATION_FAILED`. TBL-01 chỉ có `consent_at`, **không có cột lưu `policyVersion`** — task chỉ kiểm, không lưu. Nếu cần lưu (để bắt đồng ý lại khi chính sách đổi) phải bổ sung `users.consent_policy_version` ở `db-design`.
- `[ASSUMED → Q-047]` Tên Google > 50 ký tự → cắt còn 50 (spec chỉ nói ≤ 50).
- `[ASSUMED → Q-047]` `getMe` trả `403 CONSENT_REQUIRED` khi reload giữa chừng → client gọi lại `createSession` và mở lại dialog.
- `[ASSUMED → Q-047]` Tab chưa làm và nút "Tạo phòng" / "Thêm bạn" dẫn tới trang giữ chỗ "Sắp có".
- `[ASSUMED → Q-047]` Auth guard đặt phía client (Firebase Auth chạy ở trình duyệt); slice ghi "middleware + client" — Next middleware chỉ dùng để chuyển `/` → `/login` hoặc `/rooms` theo cookie gợi ý nếu cần, không phải nơi kiểm quyền. Kiểm quyền thật nằm ở `withAuth` phía API.
- `[ASSUMED → Q-047]` `email_index` trỏ uid khác đang active → 500 + log cảnh báo (trường hợp bất thường, spec không nêu).
- Point 5 khá sát: task gánh nhiều phần nền dùng chung (withAuth, error handler, fetch wrapper, layout tab). Không đề xuất đổi.

## 8. Ghi chú triển khai (2026-11-16)
- Transport: **Server Action** + cookie `__session` (ADR-03/06 cập nhật), không phải REST `/api/sessions`, `/api/accounts`, `/api/me`. `withAuth` = `requireAuth` (src/shared/server/auth.ts); fetch wrapper = `callAction`. `getMe` là query RSC trong guard `(tabs)`/`(full)`, không có action/endpoint. AC-10/11/12 kiểm qua `requireAuth`/`getMe` thay vì HTTP; bước test tay 12 (`curl /api/me`) không áp dụng.
- Auth guard đặt server-side (layout `(tabs)`/`(full)` + `proxy.ts` lạc quan), client chỉ lo tạo lại phiên / mở lại dialog.
- Route group `(app)` → `(tabs)` + `(full)` theo architecture.md.
- Lịch sử: `.claude/history/2026-11-16_T-002_google-sign-in-consent.md`.
