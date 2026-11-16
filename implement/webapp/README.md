# Buddio webapp

Next.js 16 (App Router) + React 19 + Firebase (Auth, Firestore, Realtime Database, Storage, Cloud Functions 2nd gen).
Kiến trúc và quy ước: [.claude/skills/_shared/architecture.md](.claude/skills/_shared/architecture.md).

## Chạy local

Yêu cầu: **Node 22**, **Java 21+** (Firebase Emulator Suite chạy trên JVM). Không cần project Firebase thật:
emulator dùng project id `demo-buddio` (Firebase coi `demo-*` là project giả, không gọi dịch vụ thật).

```bash
cd implement/webapp
npm ci
npm ci --prefix functions          # Cloud Functions (chưa có function, cần để emulator load được)
cp .env.example .env.local         # biến emulator + NEXT_PUBLIC_FIREBASE_* (demo-buddio)
npx playwright install chromium    # một lần, cho test e2e
```

Hai terminal:

```bash
npm run emulators   # Auth 9099 · Firestore 8080 · Database 9000 · Storage 9199 · Functions 5001 · UI http://localhost:4000
npm run dev         # http://localhost:3000 → chuyển /login
```

Kiểm nhanh:

```bash
curl -i http://localhost:3000/api/health   # 200 {"status":"ok"}
```

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Next dev server |
| `npm run emulators` | Firebase Emulator Suite + UI |
| `npm run seed` | Ghi dữ liệu mẫu vào emulator (chỉ chạy với `demo-*` / emulator) |
| `npm run dev:age-session -- <email> <days>` | Lùi `users.last_active_at` trên emulator để thử hết phiên (vd `an@gmail.com 31`) |
| `npm run lint` | ESLint (gồm `eslint-plugin-boundaries` kiểm ranh giới tầng) |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run format` / `format:check` | Prettier |
| `npm run test:unit` | Vitest project `unit` (không cần emulator) |
| `npm run test:emulator` | Vitest project `emulator` (rules, service) — cần emulator đang chạy |
| `npm run test:e2e` | Playwright, viewport mobile 375×812 (tự bật `npm run dev`; `E2E_PORT=3100` nếu port 3000 đang bận) |
| `npm test` | Tất cả, trong `firebase emulators:exec` (giống CI) |

## Firebase

- Rules / index: `firebase/` (`firestore.rules`, `firestore.indexes.json`, `database.rules.json`, `storage.rules`). Client chỉ đọc; mọi ghi đi qua server (ADR-03).
- Cloud Functions: `functions/` (region `asia-southeast1`).
- TLS và mã hoá khi lưu: mặc định của Google, không cấu hình thêm (NFR-12, ADR-07).
- TTL (ADR-09) không chạy trên emulator; bật trên project thật bằng
  `gcloud firestore fields ttls update expire_at --collection-group=<messages|notifications> --enable-ttl`.

## Bảo mật phiên

- Phiên server = cookie `__session` (Firebase session cookie, ≤ 14 ngày), kiểm `verifySessionCookie(…, checkRevoked)` mỗi request.
- Hết phiên sau `config/limits.session_idle_days` (mặc định 30) ngày không dùng, tính theo `users.last_active_at`
  (cập nhật tối đa 1 lần/giờ). Kiểm ở một chỗ: `checkMemberSession` (`src/shared/server/auth.ts`) — dùng cho mọi
  Server Action mức `member` và guard `(tabs)`/`(full)`. Hết phiên → `revokeRefreshTokens` + `SESSION_EXPIRED`.
- Đăng xuất (`deleteCurrentSession`) thu hồi refresh token trên **mọi thiết bị** (Q-044); client nhận
  `SESSION_EXPIRED` / `TOKEN_REVOKED` thì `signOut()` và về `/login?reason=expired`.
- **Giới hạn:** `revokeRefreshTokens` không làm mất hiệu lực ID token đang có đối với **Firestore listener**.
  Thiết bị khác vẫn nhận dữ liệu realtime tối đa tới khi ID token hết hạn (≤ 1 giờ); sau đó refresh thất bại,
  `onAuthStateChanged` về null và app chuyển `/login?reason=expired`. Muốn chặn ngay phải kiểm `auth_time` /
  revoke trong Security Rules (đề xuất xem lại ADR-06).

## Lưu ý khi chạy dev

- Chạy `npm run build` rồi `npm run dev` trên cùng thư mục làm `next dev` full-reload trang liên tục.
  Xoá `.next` (`rm -rf .next`) trước khi `npm run dev` / `npm run test:e2e` nếu vừa build.

## CI

`.github/workflows/ci.yml` (gốc repo): Node 22, Java 21, cache npm + emulator jars → lint → typecheck → `npm test`.
