# T-001 · Khởi tạo dự án chạy local + emulator, CI xanh

| Ngày | Skill | Kết quả | Task file | Plan |
|---|---|---|---|---|
| 2026-11-15 | fs-build-feature | PASS | ../../../backlog/tasks/T-001-project-skeleton-emulator-ci.md | .work/T-001/plan.md (không commit) |

## Tóm tắt
Dựng khung chạy local: Firebase Emulator Suite (Auth, Firestore, RTDB, Storage, Functions + UI) với rules deny-all, màn `/login` tĩnh tiếng Việt (SCR-01 mục 1–2, `/` chuyển `/login`), `GET /api/health` → `200 {"status":"ok"}`, log request có che field nhạy cảm, hạ tầng test (Vitest unit + emulator, Playwright mobile) và workflow CI. `npm test` xanh trên máy local; workflow GitHub chưa chạy (chưa push).

## Quyết định
| Quyết định | Lý do |
|---|---|
| Transport `getHealth` = api-route (`src/app/api/health/route.ts`) | phục vụ uptime check ngoài Next (bảng Bước 1) |
| `HealthSchema` đặt ở `src/shared/contracts/health.ts` | specs-map: `getHealth` thuộc `shared/server`, không có feature |
| Màn login thuộc feature `auth` (`LoginScreen`, server component, chưa có hook) | SCR-01 do `auth` sở hữu (`createSession`); hành động gắn ở T-002 |
| Giữ logger JSON tự viết (có redact), không thêm pino | scaffold đã có; đủ field task yêu cầu |
| Từ điển = object `vi.*` có type, không làm helper `t('key')` | architecture.md thắng; key sai bị tsc bắt |
| Font Inter subset `latin` + `vietnamese` thay Geist | Geist không có glyph tiếng Việt |
| `functions/` có `firebase-functions` 7.4.0 + `setGlobalOptions({ region: 'asia-southeast1' })` | không có package này thì Functions emulator báo "Failed to load function definition" |
| CI ở `.github/workflows/ci.yml` gốc repo, `working-directory: implement/webapp` | webapp nằm trong thư mục con |
| `@types/node` ^20 → 22.20.5 | peer của vitest 5.1.0; runtime là Node 22 |

## Thay đổi theo tầng
| Tầng | File |
|---|---|
| contract | src/shared/contracts/health.ts (+ export ở index.ts) |
| db-schema | firebase.json, .firebaserc, firebase/{firestore.rules, firestore.indexes.json, database.rules.json, storage.rules}, functions/{package.json, package-lock.json, index.js, .gitignore}, scripts/seed/index.ts |
| repository | — |
| service | — |
| transport | src/app/api/health/route.ts |
| client-data | — |
| ui-logic | — |
| ui | src/features/auth/ui/login-screen.tsx; vi.app.*, vi.auth.login.* trong src/shared/i18n/vi.ts |
| route | src/app/(public)/login/page.tsx, src/app/page.tsx (redirect), src/app/layout.tsx (font, metadata) |
| test | vitest.config.mts, playwright.config.ts, src/test/empty.ts, src/app/api/health/route.test.ts, src/shared/server/logger.test.ts, src/features/auth/ui/login-screen.test.tsx, firebase/tests/deny-all.rules.test.ts, e2e/T-001.spec.ts |
| shared / config | src/shared/server/route.ts (log request + `unstable_rethrow`), fs-scaffold template route.ts (đồng bộ), src/features/auth/ (khung), package.json (scripts + devDeps), eslint.config.mjs (ignore functions/, report), .prettierrc.json, .prettierignore, .gitignore, README.md, ../../.github/workflows/ci.yml; xoá svg mẫu trong public/ |
| spec | backlog/tasks/T-001 (tick mục 3, ghi chú lệch, DONE), backlog/backlog.md (DONE) |

## Acceptance criteria
| AC | Kết quả | Bằng |
|---|---|---|
| AC-1 | ✅ | e2e/T-001.spec.ts › AC-1 |
| AC-2 | ✅ | src/app/api/health/route.test.ts › AC-2; e2e/T-001.spec.ts › AC-2 |
| AC-3 | ✅ | firebase/tests/deny-all.rules.test.ts › AC-3 (Firestore, RTDB, Storage; có và không đăng nhập) |
| AC-4 | ✅ | src/shared/server/logger.test.ts › AC-4 |
| AC-5 | ✅ | src/features/auth/ui/login-screen.test.tsx › AC-5 |
| AC-6 | 🖐 chưa chạy | bước 5 "Test tay": push rồi xem workflow `ci` trên GitHub |

## Verify
PASS sau 1 vòng sửa. tsc ✅ · eslint ✅ · build ✅ (`/`, `/login` static; `/api/health` dynamic) · `npm test` ✅ (unit 7, emulator 4, e2e 2) · quét kiến trúc ✅ · AC map ✅ · contract ✅. Vòng sửa: prettier cho 2 file mới. Chưa chạy: CI trên GitHub.

## Lệch spec / giả định
- Tên thư mục theo architecture.md, không theo task: `messages/vi.ts` → `src/shared/i18n/vi.ts`; `server/` → `src/shared/server` + `src/features/*/server`; `app/(app)` → `(tabs)`/`(full)`, chưa tạo vì route group rỗng không có tác dụng (T-002).
- Logger không dùng pino (task `[ASSUMED → Q-047]`).
- Biến client tên `NEXT_PUBLIC_USE_EMULATORS` (scaffold) thay vì `NEXT_PUBLIC_USE_EMULATOR` (task).
- Logo SCR-01 tạm là icon lucide `MessagesSquare`, chưa có asset logo trong spec.
- Script `emulators` chưa có `--import/--export-on-exit` (T-001 không cần giữ dữ liệu emulator).

## Còn mở / việc tiếp theo
- [ ] AC-6: push lên GitHub, xác nhận workflow `ci` xanh (lần đầu tải emulator jars + Chromium sẽ chậm).
- [ ] `package.json` + `package-lock.json` ở **gốc repo** (commit 202b0a9) chứa devDeps test. Có lockfile đó nên Next cảnh báo "inferred your workspace root". Đề nghị xoá nếu đặt nhầm chỗ, hoặc đặt `turbopack.root` trong next.config.ts.
- [ ] Trang `/privacy` (link ở /login đang 404) — T-002.
- [ ] `npm run format:check` chưa đưa vào CI: file scaffold cũ (layout ban đầu, shadcn button…) chưa format theo `.prettierrc.json`.

## Ghi chú cho lần sau
- `runRoute`/`runAction` phải gọi `unstable_rethrow(err)` đầu `catch`. Với `cacheComponents`, Next prerender GET route lúc build và dừng bằng một error khi route đọc `req.headers`/`req.url`. Nếu nuốt error đó, build log ERROR "needs to bail out of prerendering".
- Route GET không đọc request sẽ bị prerender tĩnh. `/api/health` chạy request-time vì `runRoute` đọc header.
- Vitest: `server-only`/`client-only` được alias sang `src/test/empty.ts`. Rules test đọc file rules bằng đường dẫn tương đối, nên phải chạy từ `implement/webapp`.
- Máy mới cần `npx playwright install chromium` (Playwright 1.65.1 dùng headless shell v1255).
- `next dev` tự ghi lại block trong AGENTS.md (diff ở file đó do Next sinh).
