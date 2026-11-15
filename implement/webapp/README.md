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
| `npm run lint` | ESLint (gồm `eslint-plugin-boundaries` kiểm ranh giới tầng) |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run format` / `format:check` | Prettier |
| `npm run test:unit` | Vitest project `unit` (không cần emulator) |
| `npm run test:emulator` | Vitest project `emulator` (rules, service) — cần emulator đang chạy |
| `npm run test:e2e` | Playwright, viewport mobile 375×812 (tự bật `npm run dev`) |
| `npm test` | Tất cả, trong `firebase emulators:exec` (giống CI) |

## Firebase

- Rules / index: `firebase/` (`firestore.rules`, `firestore.indexes.json`, `database.rules.json`, `storage.rules`). Client chỉ đọc; mọi ghi đi qua server (ADR-03).
- Cloud Functions: `functions/` (region `asia-southeast1`).
- TLS và mã hoá khi lưu: mặc định của Google, không cấu hình thêm (NFR-12, ADR-07).
- TTL (ADR-09) không chạy trên emulator; bật trên project thật bằng
  `gcloud firestore fields ttls update expire_at --collection-group=<messages|notifications> --enable-ttl`.

## CI

`.github/workflows/ci.yml` (gốc repo): Node 22, Java 21, cache npm + emulator jars → lint → typecheck → `npm test`.
