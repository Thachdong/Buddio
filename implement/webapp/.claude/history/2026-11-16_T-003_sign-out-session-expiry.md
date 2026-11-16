# T-003 · Đăng xuất & hết phiên sau 30 ngày không dùng

| Ngày | Skill | Kết quả | Task file | Plan |
|---|---|---|---|---|
| 2026-11-16 | fs-build-feature | PASS | ../../../backlog/tasks/T-003-sign-out-session-expiry.md | .work/T-003/plan.md (không commit) |

## Tóm tắt
Tab Cài đặt (SCR-11) hiện ảnh, email, tên và 2 công tắc chỉ xem (đọc realtime `users/{me}` + `profiles/{me}`), mục chính sách, nút "Đăng xuất". Đăng xuất thu hồi phiên trên mọi thiết bị, xoá cookie, `signOut()` rồi về SCR-01 "Bạn đã đăng xuất.". Quá `session_idle_days` (mặc định 30) ngày không dùng, hoặc phiên bị thu hồi ở thiết bị khác → về SCR-01 "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."; đăng nhập lại vào thẳng trang Phòng. Đóng việc còn mở từ T-002 (hết phiên trước đây tự đăng nhập lại).

## Quyết định
| Quyết định | Lý do |
|---|---|
| `deleteCurrentSession` = server-action, auth `'identity'` (không kiểm hết phiên) | mặc định; task ghi `DELETE /api/...` do ADR-03 cũ; luôn đăng xuất được |
| Kiểm phiên gom vào `checkMemberSession(uid, { now, clearCookie })` ở `src/shared/server/auth.ts`, dùng cho `requireAuth('member')` và query `getMe` (guard RSC) | DoD "không lặp ở từng handler"; ngưỡng đọc `config/limits.session_idle_days`; đúng 30 ngày vẫn còn phiên (`>`); hết phiên không ghi `last_active_at` |
| Guard dùng `verifySession()` (không nuốt lỗi): `SESSION_EXPIRED`/`TOKEN_REVOKED` → `/login?reason=expired`; `UNAUTHENTICATED`/`CONSENT_REQUIRED` → `/login` | AC-4: thiết bị khác thấy đúng thông điệp |
| `?reason=signed_out|expired` đọc ở client (`LoginActions` mount), không dùng `searchParams` trong page | giữ `/login` là static shell; có reason → `signOut()` và KHÔNG tự tạo lại phiên |
| `callAction` mặc định bắt `SESSION_EXPIRED`/`TOKEN_REVOKED` → `signOutClient` + `window.location.replace('/login?reason=expired')`; tham số `onSessionEnded: 'ignore'` cho createSession/đăng xuất | task "fetch wrapper"; dùng chung cho mọi action sau này |
| `SessionWatcher` ở layout `(tabs)`/`(full)`: Firebase user về null mà không do app chủ động → expired; `signOutClient()` đánh dấu chủ động | task: `onAuthStateChanged` null giữa phiên |
| Đăng xuất lỗi mạng vẫn `signOut` + về SCR-01; `RedirectIfMember` bỏ qua khi có `?reason` | Q-044, AC-8 (cookie có thể còn khi action không tới server) |
| Màn Cài đặt khởi tạo từ `MeProvider` (SSR), listener tiếp quản; listener chỉ coi "không tồn tại" là lỗi khi snapshot từ server | tránh skeleton thừa; snapshot cache cũ sau "Thử lại" từng gây lỗi giả |
| `E2E_PORT` cho Playwright (mặc định 3000) | chạy e2e khi port 3000 đang bận dev/test tay |

## Thay đổi theo tầng
| Tầng | File |
|---|---|
| contract | src/shared/contracts/login-reason.ts (+index); src/features/auth/contracts/{schemas,errors}.ts (`DeleteCurrentSessionSchema`, `NoContentSchema`, `deleteCurrentSessionErrors`); src/features/account/contracts/{schemas,types}.ts (`MySettings`) |
| db-schema | scripts/dev/age-session.ts, package.json `dev:age-session`; scripts/seed/index.ts (`export {}`) — rules/index không đổi |
| repository | — |
| service | src/shared/server/auth.ts (`checkMemberSession` thay `assertMember`); src/features/account/server/queries/me.query.ts; src/features/auth/server/services/session.service.ts (`deleteCurrentSession`) |
| transport | src/features/auth/server/actions.ts (`deleteCurrentSessionAction`) |
| client-data | src/features/account/client/my-settings.listener.ts; src/shared/client/auth.ts (`signOutClient`, `isIntentionalSignOut`); src/features/auth/client/google-auth.ts |
| ui-logic | src/shared/client/call-action.ts; src/features/auth/hooks/{use-sign-out,use-session-watcher,use-google-sign-in}.ts; src/features/account/hooks/use-my-settings.ts |
| ui | src/features/account/ui/settings-screen.tsx; src/features/auth/ui/{sign-out-button,session-watcher,login-actions}.tsx; src/shared/ui/{switch,avatar}.tsx; src/shared/i18n/vi.ts (auth.login.signedOut/sessionExpired, account.settings.*) |
| route | src/app/(tabs)/settings/page.tsx; src/app/_components/require-member.tsx; src/app/(tabs)/layout.tsx, src/app/(full)/layout.tsx (`SessionWatcher`); src/app/(public)/login/page.tsx (searchParams → RedirectIfMember) |
| test | src/shared/server/session.emu.test.ts; src/shared/client/call-action.test.ts; e2e/T-003.spec.ts; e2e/support/auth.ts (`signUpViaUi`, regex port) |
| shared / config | playwright.config.ts (`E2E_PORT`); README.md (lệnh mới, "Bảo mật phiên", "Lưu ý khi chạy dev"); package.json (`dev:age-session`) |
| spec | backlog/tasks/T-003 (tick mục 3 + DoD 2 mục, mục 8, DONE); backlog/backlog.md (DONE) |

## Acceptance criteria
| AC | Kết quả | Bằng |
|---|---|---|
| AC-1 | ✅ | e2e/T-003.spec.ts › AC-1, AC-2 |
| AC-2 | ✅ | session.emu › AC-2, AC-3; e2e › AC-1, AC-2 |
| AC-3 | ✅ | session.emu › AC-2, AC-3 |
| AC-4 | ✅ | e2e › AC-4 (2 browser context); call-action.test › AC-4, AC-5 |
| AC-5 | ✅ | session.emu › AC-5 (−31 ngày; idle 7 ngày); e2e › AC-5, AC-7 |
| AC-6 | ✅ | session.emu › AC-6; e2e › AC-6 |
| AC-7 | ✅ | e2e › AC-5, AC-7 |
| AC-8 | ✅ / 🖐 | e2e › AC-8 (abort request Server Action); DevTools Offline thật: "Test tay" bước 8 |
| AC-9 | ✅ / 🖐 | e2e › AC-9 (xoá `users/{me}` → listener lỗi → "Thử lại"); rules từ chối thật: "Test tay" bước 9 |

## Verify
PASS, 1 vòng sửa. typegen + tsc ✅ · eslint ✅ · build ✅ · unit 24 ✅ · emulator 35 ✅ · e2e 12 ✅ (T-001 2, T-002 4, T-003 6) · quét kiến trúc ✅ · AC map ✅ · contract ✅. Test emulator/e2e chạy trên emulator nền của user (`npm run emulators`, port bận nên không dùng `npm test`/emulators:exec) và dev riêng `E2E_PORT=3100`. Vòng sửa: 3 lỗi code do e2e bắt — đăng nhập lại sau `?reason` bị signOut lại (ui-logic), đăng xuất lỗi mạng bị đẩy về `/rooms` (route), listener báo lỗi từ snapshot cache (client-data).

## Lệch spec / giả định
- `DELETE /api/sessions/current`, `withAuth`, fetch wrapper → Server Action, `checkMemberSession`/`requireAuth`, `callAction` (ADR-03/06 cập nhật). AC-3 kiểm bằng `verifyIdToken(oldToken)` thay vì gọi API HTTP.
- `messages/vi.ts` → `src/shared/i18n/vi.ts`.
- Giữ các `[ASSUMED → Q-047]` của task: `>` 30 ngày, dùng chung thông điệp cho 2 mã, công tắc disabled, chưa hiện "Danh sách đã chặn"/"Xóa tài khoản".
- `SessionWatcher` coi mọi lần Firebase user = null không chủ động là hết phiên (kể cả khi người dùng tự xoá dữ liệu trình duyệt).

## Còn mở / việc tiếp theo
- [ ] Test tay bước 8 (DevTools Offline thật) và bước 9 (sửa rules cấm đọc `users/{me}`).
- [ ] Đăng xuất khi mất mạng: cookie `__session` còn hiệu lực trên trình duyệt đó tới khi hết hạn; mở lại `/rooms` sẽ vào app rồi `SessionWatcher` mới đẩy về `/login?reason=expired`.
- [ ] Chặn ngay Firestore listener ở thiết bị khác sau đăng xuất cần kiểm `auth_time` trong Security Rules (README "Bảo mật phiên", xem lại ADR-06).
- [ ] Bản báo cáo feedback Next.js gửi ở T-002 (workspace root sai gây reload vô hạn) có thể sai nguyên nhân — xem ghi chú bên dưới.

## Ghi chú cho lần sau
- **`next build` rồi `next dev` cùng thư mục `.next` → `next dev` full-reload vô hạn** (mọi trang có client component, log lặp `Compiled in Xms` + `GET`). Tái hiện 2 lần trong task này; `rm -rf .next` là hết. Vòng reload ở T-002 nhiều khả năng cũng do đây — đổi `turbopack.root` lúc đó có lẽ chỉ tình cờ làm mất hiệu lực cache. Verify nên chạy test **trước** build, hoặc xoá `.next` sau build. CI không build nên không bị.
- Trên App Router, `history.replaceState` bị Next coi như điều hướng → component mount lại, mất state. Chỉ bỏ `?reason` ngay trước khi bắt đầu đăng nhập Google.
- Firebase `revokeRefreshTokens` so theo giây: phiên / token phải được cấp trước mốc revoke ≥ 1 giây (test có chờ 1,1s).
- Firestore listener có thể trả snapshot từ cache ("không tồn tại") trước snapshot server — kiểm `metadata.fromCache` trước khi coi là lỗi.
- Emulator chạy nền (`npm run emulators`) chiếm port → `npm test` (emulators:exec) không chạy được; đặt biến `*_EMULATOR_HOST`, `FIREBASE_EMULATOR_HUB=127.0.0.1:4400` rồi chạy `test:emulator`, `E2E_PORT=3100 npx playwright test`. Các test này **xoá dữ liệu emulator**; chạy `npm run seed` lại sau đó.
