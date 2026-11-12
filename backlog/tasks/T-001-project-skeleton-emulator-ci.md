# T-001 · Khởi tạo dự án chạy local + emulator, CI xanh

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-01 | M0 | 3 | — | TODO |

## 1. Mục tiêu demo
Sau task này: **Dev chạy `npm run dev` + `firebase emulators:start`, mở `http://localhost:3000/login` trên khung mobile 375×812, thấy màn Đăng nhập tĩnh tiếng Việt (logo, mô tả, nút "Đăng nhập với Google" chưa hoạt động); gọi `GET /api/health` nhận `200 {"status":"ok"}`; GitHub Actions chạy lint, typecheck, Vitest (có test rules trên emulator) và Playwright smoke đều xanh.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-01 (khung tĩnh) | Chỉ layout + chữ; chưa gắn SCR-01.A1 / A2 |
| API | `getHealth` | `GET /api/health`, không cần xác thực (`security: []`) |
| Dữ liệu | — | Khai báo `firestore.rules`, `database.rules.json`, `storage.rules` ở chế độ **deny-all**; `firestore.indexes.json` rỗng |
| NFR | NFR-24 | File từ điển tiếng Việt, mọi chữ giao diện lấy từ đây |
| NFR | NFR-12 | TLS / mã hóa khi lưu mặc định của Google — không cấu hình thêm (ADR-07) |
| NFR | NFR-27 | Logger có cấu trúc, che các field nhạy cảm |
| Flow | — | |

**Ngoài phạm vi:** đăng nhập thật, dialog chính sách, auth guard, schema `Error` chung (T-002); deploy App Hosting, `firebase deploy` trong CI (ngoài môi trường kiểm tra – Q-045).

## 3. Việc cần làm
### UI
- [ ] Khởi tạo Next.js 16 (App Router) + React 19 + TypeScript 5 strict; pin chính xác phiên bản trong `package.json` (tech-stack mục 2).
- [ ] Tailwind 4 + shadcn/ui (Button, Dialog, Toast, Skeleton, Switch, Checkbox, Tabs — thêm khi dùng); font hỗ trợ tiếng Việt.
- [ ] Cấu trúc thư mục: `app/(public)/login`, `app/(app)/…` (nhóm route cần đăng nhập, để trống), `app/api/*` (route handler mỏng), `server/` (domain, repository, firebase-admin), `shared/` (schema Zod, type dùng chung client/server), `functions/` (Cloud Functions 2nd gen, chưa có function), `messages/vi.ts` (từ điển) `[ASSUMED → Q-047]` tên thư mục `shared/` và `messages/`.
- [ ] Trang `/login` render ở server (NFR-06) theo SCR-01 mục 1–2: logo + "Buddio", mô tả "Trò chuyện, xả stress cùng bạn bè. Vào nhanh chỉ với một cú chạm.", nút "Đăng nhập với Google" (chưa gắn hành động), link "Chính sách quyền riêng tư" (trỏ `/privacy`, trang làm ở T-002). Khung căn giữa, rộng tối đa 400px.
- [ ] Trang gốc `/` chuyển tới `/login` (chưa có phiên — guard thật ở T-002).
- [ ] Helper `t('key')` đọc `messages/vi.ts`; mọi chữ trên `/login` dùng helper (NFR-24).

### API / Backend
- [ ] `GET /api/health` (`getHealth`) → `200 {"status":"ok"}`, không đọc dữ liệu nghiệp vụ, không cần ID token.
- [ ] Khởi tạo `firebase-admin` dùng chung (`server/firebase-admin.ts`): tự trỏ emulator khi có biến `FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`, `FIREBASE_DATABASE_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST`.
- [ ] Khởi tạo Firebase JS SDK 12 phía client (`connectXxxEmulator` khi `NEXT_PUBLIC_USE_EMULATOR=true`).
- [ ] Logger có cấu trúc (JSON) dùng chung server + functions; danh sách field bị che (`email`, `emailNorm`, `email_norm`, `text`, `displayName`, `token`, `authorization`) → thay bằng `[REDACTED]` (NFR-27) `[ASSUMED → Q-047]` dùng pino với `redact`.
- [ ] Middleware log request cho route handler: method, path, status, thời gian; không log body / header `Authorization`.

### Data
- [ ] `firebase.json` cấu hình Emulator Suite: Auth, Firestore, Realtime Database, Storage, Functions (+ Emulator UI); region `asia-southeast1` cho functions.
- [ ] `firestore.rules`: `allow read, write: if false` cho mọi đường dẫn.
- [ ] `database.rules.json`: `.read: false`, `.write: false`.
- [ ] `storage.rules`: `allow read, write: if false`.
- [ ] `firestore.indexes.json`: `{ "indexes": [], "fieldOverrides": [] }`.
- [ ] Script `npm run seed` rỗng (khung để T-002 thêm `config/limits`) `[ASSUMED → Q-047]`.

### Khác
- [ ] Vitest: 2 project — `unit` (node) và `emulator` (chạy trong `firebase emulators:exec`); `@firebase/rules-unit-testing` cho test rules.
- [ ] Playwright: project `mobile` viewport 375×812, `baseURL http://localhost:3000`, `webServer` khởi động Next dev.
- [ ] ESLint + Prettier; `npm run lint`, `npm run typecheck` (`tsc --noEmit`).
- [ ] GitHub Actions `.github/workflows/ci.yml`: Node 22, Java 21 (cho emulator), cache npm + emulator jars; các bước lint → typecheck → `firebase emulators:exec "npm run test:unit && npm run test:emulator && npm run test:e2e"`.
- [ ] `.env.example` (biến emulator, `NEXT_PUBLIC_FIREBASE_*` dùng project id demo `demo-buddio`) `[ASSUMED → Q-047]` project id dạng `demo-*` để emulator không cần project thật.
- [ ] `README.md` mục "Chạy local": cài đặt, `npm run emulators`, `npm run dev`, `npm test`.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | Repo mới clone, đã `npm ci`, emulator đang chạy | Chạy `npm run dev` và mở `/login` ở viewport 375×812 | Thấy "Buddio", câu mô tả, nút "Đăng nhập với Google", link "Chính sách quyền riêng tư"; không có thanh cuộn ngang | SCR-01 mục 1–2, NFR-22 |
| AC-2 | App đang chạy | Gửi `GET /api/health` không kèm `Authorization` | `200`, body đúng `{"status":"ok"}` (khớp schema `Health`) | `getHealth` |
| AC-3 | Emulator đang chạy, client đã đăng nhập (uid bất kỳ) | Đọc hoặc ghi một document Firestore bất kỳ, một node RTDB, một file Storage | Cả 3 đều bị từ chối (`permission-denied`) | ADR-03 (deny-all khởi điểm) |
| AC-4 | Logger được gọi với object chứa `email: "a@gmail.com"`, `text: "xin chào"` | Ghi log | Dòng log JSON chứa `[REDACTED]` ở 2 field đó, không chứa chuỗi `a@gmail.com` hay `xin chào` | NFR-27 |
| AC-5 | Mã nguồn trang `/login` | Chạy test kiểm từ điển | Mọi chữ hiển thị trên `/login` là giá trị trong `messages/vi.ts` (không có chuỗi tiếng Việt hard-code trong component) | NFR-24 |
| AC-6 | Đẩy một commit lên nhánh bất kỳ | GitHub Actions chạy workflow `ci` | Các job lint, typecheck, Vitest (unit + emulator), Playwright smoke đều xanh | ADR-12 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `GET /api/health` (gọi handler trực tiếp) → 200 `{status:"ok"}`; không gọi Firestore | AC-2 |
| Rules (emulator, `@firebase/rules-unit-testing`): user đã đăng nhập `getDoc`/`setDoc` trên `users/x`, `rooms/y` → deny; unauthenticated → deny | AC-3 |
| RTDB rules: đọc / ghi `status/x` → deny | AC-3 |
| Storage rules: upload `uploads/x/a.png` → deny | AC-3 |
| Logger: log object có `email`, `text`, `authorization` → output không chứa giá trị gốc | AC-4 |
| Test quét `app/(public)/login/**/*.tsx` không chứa ký tự tiếng Việt có dấu ngoài import từ điển `[ASSUMED → Q-047]` (regex `[À-ỹ]`) | AC-5 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Smoke mobile: mở `/` → bị chuyển tới `/login` → thấy nút "Đăng nhập với Google", không tràn ngang (`scrollWidth ≤ 375`) | AC-1 |
| Smoke API: `request.get('/api/health')` → 200 | AC-2 |

### Dữ liệu seed / tiền điều kiện
- Không cần dữ liệu. Emulator project id `demo-buddio`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Clone repo, `npm ci`, `npm run emulators` | Emulator UI mở ở `http://localhost:4000`, đủ Auth, Firestore, Database, Storage, Functions | AC-1 |
| 2 | `npm run dev`, mở Chrome DevTools chế độ iPhone (375×812), vào `http://localhost:3000` | Tự chuyển `/login`, thấy màn Đăng nhập tiếng Việt, không cuộn ngang | AC-1 |
| 3 | `curl -i http://localhost:3000/api/health` | `HTTP/1.1 200`, body `{"status":"ok"}` | AC-2 |
| 4 | Trong Emulator UI, mở Firestore → Rules playground (hoặc chạy `npm run test:emulator`) | Mọi read/write bị từ chối | AC-3 |
| 5 | Mở tab Actions trên GitHub sau khi push | Workflow `ci` xanh | AC-6 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] README có hướng dẫn chạy local + emulator, dev mới làm theo chạy được trong ≤ 15 phút
- [ ] File rules deny-all có test deny cho Firestore, RTDB, Storage
- [ ] CI chạy được với emulator (không cần project Firebase thật)

## 7. Ghi chú
- `[ASSUMED → Q-047]` Dùng project id `demo-buddio` cho emulator (Firebase coi `demo-*` là project giả, không gọi dịch vụ thật).
- `[ASSUMED → Q-047]` Logger chọn pino (có `redact` sẵn); spec chỉ yêu cầu "log có cấu trúc" (ADR-12).
- `[ASSUMED → Q-047]` Thư mục `shared/` cho Zod schema dùng chung và `messages/vi.ts` cho từ điển — spec không nêu tên.
- Rủi ro point: dựng CI chạy emulator (Java + cache) thường tốn thời gian hơn dự kiến; giữ 3 point.
