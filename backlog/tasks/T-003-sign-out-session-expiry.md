# T-003 · Đăng xuất & hết phiên sau 30 ngày không dùng

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-01 | M0 | 2 | T-002 | TODO |

## 1. Mục tiêu demo
Sau task này: **Người dùng mở tab Cài đặt → thấy ảnh, email, tên và 2 công tắc (chỉ xem) → bấm "Đăng xuất" → về màn Đăng nhập với dòng "Bạn đã đăng xuất.". Dev đặt `users.last_active_at` lùi 31 ngày → người dùng mở lại app → về màn Đăng nhập với dòng "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-11.A0 | Tải hồ sơ & cài đặt (listener `users/{me}` + `profiles/{me}`), công tắc chỉ xem |
| Thao tác | SCR-11.A4 | Đăng xuất |
| API | `deleteCurrentSession` | `DELETE /api/sessions/current` → 204 |
| API | (kiểm phiên trong `withAuth` → mọi API, gồm `getMe`) | `SESSION_EXPIRED`, `TOKEN_REVOKED` |
| Dữ liệu | TBL-01 | chỉ đọc `last_active_at` |
| Rule / NFR | NFR-11 | `revokeRefreshTokens`; phiên hết sau 30 ngày không dùng |
| Quyết định | Q-044 | Đăng xuất kết thúc phiên trên **mọi thiết bị** |
| Flow | FLOW-01 A1 | Đăng xuất |

**Ngoài phạm vi:** sửa tên / gạt công tắc (T-004); "Danh sách đã chặn" (T-014); xóa tài khoản (T-026); ngắt presence RTDB khi đăng xuất (T-022 — chưa có presence).

## 3. Việc cần làm
### UI
- [ ] Tab Cài đặt (SCR-11) theo layout mục 1: header "Cài đặt", ảnh + chú thích "Ảnh lấy từ Google", email (chỉ xem), tên hiển thị (chỉ xem trong task này), 2 công tắc "Chế độ ẩn danh", "Hiển thị trạng thái online" kèm mô tả — **disabled** `[ASSUMED → Q-047]` tới T-004; mục "Chính sách quyền riêng tư" → `/privacy`; nút "Đăng xuất". Các mục "Danh sách đã chặn", "Xóa tài khoản" chưa hiện `[ASSUMED → Q-047]`.
- [ ] SCR-11.A0: listener `users/{me}` + `profiles/{me}`; loading → skeleton khối hồ sơ + 2 công tắc; lỗi → "Không tải được" + "Thử lại".
- [ ] Nút "Đăng xuất" (không cần xác nhận): spinner khi đang gọi → `deleteCurrentSession` → `signOut()` → `/login?reason=signed_out` → vùng lỗi SCR-01 hiện "Bạn đã đăng xuất.". Lỗi mạng / 5xx → vẫn `signOut()` và về SCR-01 (Q-044).
- [ ] Fetch wrapper (từ T-002): nhận `401 SESSION_EXPIRED` hoặc `TOKEN_REVOKED` → `signOut()` → `/login?reason=expired` → "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại." `[ASSUMED → Q-047]` dùng chung một thông điệp cho cả 2 mã.
- [ ] `onAuthStateChanged` trả null giữa phiên (refresh token bị thu hồi ở thiết bị khác) → về `/login?reason=expired`.

### API / Backend
- [ ] `DELETE /api/sessions/current` (`deleteCurrentSession`): `withAuth` (không cần kiểm hết hạn để luôn đăng xuất được) → `auth.revokeRefreshTokens(uid)` → `204`.
- [ ] `withAuth` thêm bước kiểm phiên: đọc `users/{uid}.last_active_at`; `now − last_active_at > session_idle_days` (từ `config/limits`, mặc định 30) → `revokeRefreshTokens(uid)` + `401 SESSION_EXPIRED`. Áp dụng cho mọi API có `requireAccount` (gồm `getMe`).
- [ ] Đảm bảo thứ tự: kiểm hết phiên **trước** khi `getMe` cập nhật `last_active_at`.

### Data
- [ ] Không thêm field. Script dev `npm run dev:age-session -- <email> <days>` lùi `last_active_at` trên emulator để demo / test tay `[ASSUMED → Q-047]`.

### Khác
- [ ] Thêm thông điệp vào `messages/vi.ts`: "Bạn đã đăng xuất.", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", nhãn màn Cài đặt.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | Người dùng An đã đăng nhập, `anonymous=true`, `show_online=true` | Mở tab Cài đặt | Thấy ảnh, email `an@gmail.com`, tên "An", 2 công tắc ở trạng thái Bật (không gạt được), nút "Đăng xuất" | SCR-11.A0, FLOW-02 bước 2 |
| AC-2 | Đang ở Cài đặt | Bấm "Đăng xuất" | `deleteCurrentSession` trả `204`; về SCR-01 với "Bạn đã đăng xuất."; mở lại `/rooms` → bị chuyển `/login` | FLOW-01 A1, NFR-11 |
| AC-3 | An vừa đăng xuất | Gọi bất kỳ API nào bằng ID token cũ (lấy trước khi đăng xuất) | `401 TOKEN_REVOKED` | NFR-11 |
| AC-4 | An đăng nhập ở 2 trình duyệt X, Y | Đăng xuất ở X, rồi ở Y thao tác gọi API (vd reload app → `getMe`) | Y về SCR-01 với "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại." | Q-044 |
| AC-5 | `last_active_at` = now − 31 ngày | Mở app (gọi `getMe`) | `401 SESSION_EXPIRED`; refresh token bị thu hồi; về SCR-01 với "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."; `last_active_at` không bị cập nhật | NFR-11 |
| AC-6 | `last_active_at` = now − 29 ngày | Mở app | Vào trang Phòng bình thường; `last_active_at` cập nhật = now | NFR-11 (biên) |
| AC-7 | Sau AC-5 | Đăng nhập lại bằng Google | Vào trang Phòng bình thường (không dialog chính sách), `last_active_at` = now | FLOW-01 bước 7 |
| AC-8 | Mất mạng (DevTools Offline) | Bấm "Đăng xuất" | Vẫn `signOut()` và về SCR-01 "Bạn đã đăng xuất." | SCR-11.A4 Khi lỗi, Q-044 |
| AC-9 | Listener `users/{me}` lỗi (vd rules từ chối giả lập) | Mở Cài đặt | Hiện "Không tải được" + "Thử lại" | SCR-11 trạng thái Error |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `deleteCurrentSession` (emulator): `204`; sau đó `verifyIdToken(oldToken, true)` ném `auth/id-token-revoked` → API trả `TOKEN_REVOKED` | AC-2, AC-3 |
| `withAuth` với `last_active_at` −31 ngày → `SESSION_EXPIRED`, gọi `revokeRefreshTokens`, không ghi `last_active_at` | AC-5 |
| `withAuth` với −29 ngày → qua; `getMe` cập nhật `last_active_at` | AC-6 |
| `withAuth` đọc `session_idle_days` từ `config/limits` (đổi thành 7 → −8 ngày hết phiên) | AC-5 |
| Fetch wrapper: response `SESSION_EXPIRED` / `TOKEN_REVOKED` → gọi `signOut` + điều hướng `reason=expired` (mock router) | AC-4, AC-5 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Đăng nhập (seed An) → tab Cài đặt → thấy email + 2 công tắc disabled → Đăng xuất → thấy "Bạn đã đăng xuất." → vào `/rooms` bị đẩy về `/login` | AC-1, AC-2 |
| Seed An với `last_active_at` −31 ngày, đăng nhập Auth emulator nhưng không qua `createSession` (đặt sẵn auth state) → mở `/rooms` → thấy "Phiên đăng nhập đã hết hạn…" `[ASSUMED → Q-047]` cách dựng: gọi `getMe` trực tiếp sau khi set auth state | AC-5 |

### Dữ liệu seed / tiền điều kiện
- `config/limits` (T-002).
- An `an@gmail.com`: `users` + `profiles` active, `anonymous=true`, `show_online=true`.
- Script `dev:age-session` để lùi `last_active_at`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Đăng nhập An (Chrome, 375×812) → tab Cài đặt | Ảnh, email, tên, 2 công tắc Bật và bị khóa, nút Đăng xuất | AC-1 |
| 2 | Mở Firefox, đăng nhập An | Vào trang Phòng | — |
| 3 | Ở Chrome bấm "Đăng xuất" | Về SCR-01 "Bạn đã đăng xuất." | AC-2 |
| 4 | Ở Firefox reload trang | Về SCR-01 "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại." | AC-3, AC-4 |
| 5 | Đăng nhập lại An ở Chrome; chạy `npm run dev:age-session -- an@gmail.com 31`; reload | Về SCR-01 "Phiên đăng nhập đã hết hạn…"; Firestore `last_active_at` vẫn là mốc −31 ngày | AC-5 |
| 6 | Đăng nhập lại An | Vào trang Phòng, không có dialog chính sách | AC-7 |
| 7 | Chạy `dev:age-session -- an@gmail.com 29`; reload | Vẫn ở trang Phòng; `last_active_at` = now | AC-6 |
| 8 | DevTools → Network Offline → Cài đặt → Đăng xuất | Vẫn về SCR-01 "Bạn đã đăng xuất." | AC-8 |
| 9 | Sửa tạm rules cấm đọc `users/{me}` trên emulator, mở Cài đặt | "Không tải được" + "Thử lại"; khôi phục rules sau đó | AC-9 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Kiểm hết phiên nằm trong `withAuth` (không lặp ở từng handler), có test biên 29 / 31 ngày
- [ ] Ghi chú giới hạn listener Firestore (mục 7) được đưa vào README phần "Bảo mật phiên"

## 7. Ghi chú
- `[ASSUMED → Q-047]` Hết phiên khi `now − last_active_at > 30 ngày` (đúng 30 ngày vẫn còn phiên).
- `[ASSUMED → Q-047]` `TOKEN_REVOKED` và `SESSION_EXPIRED` dùng chung thông điệp "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."
- `[ASSUMED → Q-047]` Công tắc ở Cài đặt hiện nhưng disabled tới T-004; mục "Danh sách đã chặn" (T-014), "Xóa tài khoản" (T-026) chưa hiện.
- Giới hạn kỹ thuật (không phải phạm vi mới): `revokeRefreshTokens` không làm mất hiệu lực ID token đang có đối với Firestore listener — thiết bị khác vẫn nhận dữ liệu realtime tối đa tới khi ID token hết hạn (≤ 1 giờ), sau đó refresh thất bại và `onAuthStateChanged` về null. Nếu cần chặn ngay, phải thêm kiểm `auth_time`/revoke trong Security Rules — đề xuất xem lại ở `tech-stack` (ADR-06), không làm trong task này.
- Point 2 hơi sát vì có thêm khung màn Cài đặt (SCR-11.A0); vẫn giữ 2.
