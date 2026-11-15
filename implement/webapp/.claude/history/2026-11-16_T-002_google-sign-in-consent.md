# T-002 · Đăng nhập Google lần đầu & đồng ý chính sách

| Ngày | Skill | Kết quả | Task file | Plan |
|---|---|---|---|---|
| 2026-11-16 | fs-build-feature | PASS | ../../../backlog/tasks/T-002-google-sign-in-consent.md | .work/T-002/plan.md (không commit) |

## Tóm tắt
Người dùng mới bấm "Đăng nhập với Google" (Auth emulator; redirect < 1024px, popup ≥ 1024px) → `createSession` trả `consent_required`, không ghi gì → dialog chính sách (không đóng bằng chạm ngoài/Esc) → tích + "Đồng ý và tiếp tục" → `createAccount` tạo `users`/`profiles`/`email_index` trong một transaction → trang Phòng rỗng với thanh tab 4 mục. Lần sau vào thẳng `/rooms`; ảnh đồng bộ theo Google, tên tự sửa giữ nguyên. Có trang `/privacy`, guard server-side cho `(tabs)`/`(full)`, seed `config/limits`.

## Quyết định
| Quyết định | Lý do |
|---|---|
| Transport `createSession`, `createAccount` = server-action | mặc định; task ghi `POST /api/...`, `withAuth` + Bearer do ADR-03 cũ |
| `createSessionAction` auth `'public'` + `verifyIdToken` trong handler → `setSessionCookie` (cả khi `consent_required`) | chưa có cookie lúc gọi; `createAccount` (auth `'identity'`) cần cookie |
| `getMe` = query RSC trong guard `RequireMember`, **không** có `getMeAction` | LAYOUT.A1 chạy ở layout; `createSession`/`createAccount` đã trả `me + limits` cho client |
| `withAuth` = `requireAuth` có sẵn; fetch wrapper = `callAction` | architecture.md: Server Action + cookie `__session` |
| `Identity` thêm `name`, `picture` (claim Google) + `toIdentity`, `verifyIdToken` | service cần tên/ảnh Google; email luôn lấy từ token |
| Guard server-side (`(tabs)`/`(full)` layout trong `<Suspense>` + `proxy.ts` lạc quan); `/login` có `RedirectIfMember` | session cookie đọc được ở server; client chỉ tạo lại phiên / mở lại dialog |
| `CONSENT_REQUIRED` ở guard → `/login`; hook `useGoogleSignIn` khi mount thấy Firebase user còn đăng nhập → gọi lại `createSession` → mở lại dialog | task `[ASSUMED → Q-047]` |
| `normalizeDisplayName` ở `account/contracts` (isomorphic, cắt theo code point) | dùng chung service + test unit |
| `PRIVACY_POLICY_VERSION` ở `src/shared/contracts/policy.ts`; sai phiên bản → `VALIDATION_FAILED`, không lưu | task `[ASSUMED → Q-047]`; TBL-01 không có cột |
| `config/limits` reader ở `src/shared/server/limits.ts` (cache 5 phút, default khi thiếu field) | specs-map: TBL-11 thuộc shared/server |
| TabBar, ComingSoonScreen, PrivacyConsentDialog, MeProvider ở feature `account` | không có feature layout; shared/ui không được import i18n; hooks cùng feature với action |
| `next.config.ts` `turbopack.root = import.meta.dirname` | lockfile ở gốc repo làm Next suy ra root = thư mục cha → `next dev` full-reload vô hạn mọi trang có client component |
| `sonner.tsx` bỏ `next-themes` (gỡ dep), theme light cố định | app không có ThemeProvider |
| `RequireMember`/`RedirectIfMember` gọi `await connection()` đầu tiên | `verifySessionCookie` dùng `Date.now()` → dev báo lỗi prerender (partialPrefetching) |

## Thay đổi theo tầng
| Tầng | File |
|---|---|
| contract | src/shared/contracts/policy.ts (+index); src/features/account/contracts/{schemas,types,errors,display-name,index}.ts; src/features/auth/contracts/{schemas,types,errors,index}.ts |
| db-schema | firebase/firestore.rules (TBL-01 get chủ, TBL-02 get khi đăng nhập/cấm list, còn lại deny, mọi write false); scripts/seed/index.ts; scripts/seed/fixtures/T-002.ts |
| repository | src/features/account/server/repositories/{user,profile,email-index}.{doc,repo}.ts; src/shared/server/limits.ts |
| service | src/features/auth/server/services/session.service.ts; src/features/account/server/services/account.service.ts; src/features/account/server/queries/me.query.ts; src/shared/server/auth.ts (Identity, toIdentity, verifyIdToken) |
| transport | src/features/auth/server/actions.ts (`createSessionAction`); src/features/account/server/actions.ts (`createAccountAction`) |
| client-data | src/features/auth/client/google-auth.ts; src/shared/client/auth.ts (`subscribeAuthUser`, `useAuthUser`) |
| ui-logic | src/features/auth/hooks/use-google-sign-in.ts; src/features/account/hooks/{use-privacy-consent,me-context}.ts |
| ui | src/features/auth/ui/{login-actions,login-screen}.tsx; src/features/account/ui/{privacy-consent-dialog,privacy-policy-content,me-provider,tab-bar,coming-soon-screen}.tsx; src/features/rooms/ui/rooms-screen.tsx; src/shared/ui/{dialog,checkbox,sonner}.tsx; src/shared/i18n/vi.ts (auth.login.*, account.*, rooms.list.*) |
| route | src/app/_components/{require-member,app-shell-skeleton}.tsx; src/app/(tabs)/{layout,rooms,friends,notifications,settings}; src/app/(full)/{layout,rooms/new,friends/add}; src/app/(public)/{login,privacy}/page.tsx; src/app/page.tsx; src/app/layout.tsx (Toaster); src/proxy.ts |
| test | src/features/account/contracts/{display-name,schemas}.test.ts; src/shared/server/errors.test.ts; src/features/auth/ui/login-screen.test.tsx; *.emu.test.ts (session, account, me.query, shared/server/auth); firebase/tests/account.rules.test.ts; e2e/T-002.spec.ts; e2e/support/{auth,admin}.ts; src/test/emulator.ts |
| shared / config | next.config.ts (turbopack.root); package.json (+sonner); .env.example (giá trị demo); playwright.config.ts (webServer.env từ .env.example) |
| spec | backlog/tasks/T-002 (tick mục 3, mục 8 ghi chú, DONE); backlog/backlog.md (DONE) |

## Acceptance criteria
| AC | Kết quả | Bằng |
|---|---|---|
| AC-1 | ✅ | session.service.emu › AC-1; e2e/T-002.spec.ts › AC-1, AC-2, AC-17, AC-19 |
| AC-2 | ✅ | account.service.emu › AC-2; e2e (cùng test) |
| AC-3 | ✅ | e2e › AC-3 |
| AC-4 | ✅ | session.service.emu › AC-4; e2e › AC-4 |
| AC-5 | ✅ | session.service.emu › AC-5 |
| AC-6 | ✅ popup / 🖐 redirect | e2e › AC-6 (desktop popup); redirect trên mobile: "Test tay" bước 7 |
| AC-7 | ✅ | display-name.test › AC-7; account.service.emu › AC-7 |
| AC-8 | ✅ | display-name.test › AC-8; account.service.emu › AC-8 |
| AC-9 | ✅ | account.service.emu › AC-9 |
| AC-10 | ✅ | shared/server/auth.emu › AC-10; me.query.emu › AC-10 (thay `GET /api/me`) |
| AC-11 | ✅ | auth.emu › AC-11; errors.test › AC-11 (thay `GET /api/me`) |
| AC-12 | ✅ | auth.emu › AC-12 (thay `GET /api/me`) |
| AC-13 | ✅ | schemas.test › AC-13; errors.test › AC-13 |
| AC-14 | ✅ | account.service.emu › AC-14 |
| AC-15 | ✅ | firebase/tests/account.rules.test.ts › AC-15 |
| AC-16 | ✅ | me.query.emu › AC-16 |
| AC-17 | ✅ | e2e › AC-1, AC-2, AC-17, AC-19 |
| AC-18 | ✅ | account.service.emu › AC-18; quét log WebServer khi chạy e2e: 0 dòng có email/tên |
| AC-19 | ✅ | e2e (375×812: dialog + nút trong viewport, không cuộn ngang) |

## Verify
PASS, 1 vòng sửa (xoá thư mục build rác `implement/webapp/implement/webapp/.next` do build lúc root sai làm eslint báo lỗi). typegen + tsc ✅ · eslint ✅ · build ✅ · `npm test` ✅ (unit 19, emulator 29, e2e 6) · quét kiến trúc ✅ · AC map 19/19 ✅ · contract ✅.

## Lệch spec / giả định
- REST `/api/sessions`, `/api/accounts`, `/api/me` + Bearer → Server Action + cookie `__session` (ADR-03/06 cập nhật). AC-10/11/12 kiểm ở `requireAuth`/`getMe`; bước test tay 12 (`curl /api/me`) không còn áp dụng.
- Auth guard: task nói client-side; làm server-side (guard layout + proxy), client lo tạo lại phiên.
- `app/(app)` → `(tabs)` + `(full)`.
- `consent_required.googleProfile.displayName` trả tên Google thô (chưa chuẩn hoá); tên chuẩn hoá chỉ ghi khi `createAccount`.
- `createAccount` khi `users/{uid}` tồn tại nhưng không `active` → `INTERNAL_ERROR` + log cảnh báo (spec không nêu).
- Các `[ASSUMED → Q-047]` của task giữ nguyên như mô tả (policyVersion, cắt 50 ký tự, mở lại dialog, trang "Sắp có", email_index trỏ uid active khác → 500).

## Còn mở / việc tiếp theo
- [ ] T-003: guard `SESSION_EXPIRED` hiện chỉ chuyển `/login`; `/login` thấy Firebase user còn đăng nhập sẽ tự `createSession` và vào lại → cần revoke + `signOut()` client + thông báo vùng 5 để thật sự bắt đăng nhập lại sau 30 ngày.
- [ ] AC-6 redirect (mobile): kiểm tay bước 7.
- [ ] `package.json` + `package-lock.json` ở gốc repo vẫn còn (đã chặn tác hại bằng `turbopack.root`); nên xoá nếu đặt nhầm.
- [ ] DoD: `callAction` (fetch wrapper) chưa có test riêng.
- [ ] Banner lời mời SCR-01 thành phần 3 (T-011); badge tab (T-008/T-024); desktop sidebar (T-029).

## Ghi chú cho lần sau
- Lockfile ở thư mục cha làm Next suy ra workspace root sai; ngoài cảnh báo khi khởi động, `next dev` sẽ full-reload vô hạn ở mọi trang có client component, và build có thể đẻ thư mục `implement/webapp/implement/webapp/.next` làm eslint báo lỗi. Đã ghim `turbopack.root`.
- Component server đọc session cookie rồi gọi Admin SDK (`verifySessionCookie` dùng `Date.now()`) phải `await connection()` trước, nếu không dev báo lỗi prerender khi bật `partialPrefetching`.
- Auth emulator widget: `Add new account`, `#email-input`, `#display-name-input`, `#profile-photo-input`, `#sign-in`; tài khoản Google cũ hiện theo email. Helper: `e2e/support/auth.ts`.
- Test `TOKEN_REVOKED` trên emulator cần token cấp trước mốc revoke ≥ 1 giây (so theo giây) → test có chờ 1,1s thật.
- `getByRole('alert')` trùng với `#__next-route-announcer__` của Next → scope vào `main`.
- Playwright webServer đọc biến từ `.env.example` (CI không có `.env.local`); local cần `cp .env.example .env.local`.
