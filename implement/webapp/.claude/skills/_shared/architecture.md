# Architecture — Buddio webapp (Next.js 16 App Router + Firebase)

Luật chung cho mọi skill `fs-*`. Skill nào cũng phải tuân theo file này. Nếu có mâu thuẫn, file này thắng template trong skill.

## 1. Nguyên tắc

1. **Chia theo feature trước, sau đó chia theo layer bên trong feature.** Mỗi feature là một thư mục `src/features/<feature>/`, bên trong có cùng một bộ layer.
2. **Bốn tầng tách biệt:** UI · logic UI · logic backend · database. Interface (`contracts/`) là cầu nối duy nhất giữa client và server.
3. **Interface đi trước.** Phải có `contracts/` (Zod + type + mã lỗi) rồi mới viết code ở hai phía.
4. **Transport là adapter mỏng.** Mặc định dùng **Server Action**. Chỉ viết **Route Handler** (`app/api/**/route.ts`) khi prompt yêu cầu rõ (api route, REST, endpoint public, webhook, client ngoài Next). Cả hai chỉ gọi `services`; service không biết ai gọi mình.
5. **Client chỉ đọc Firestore/RTDB qua listener. Mọi thao tác ghi đi qua server** (ADR-03). Ngoại lệ duy nhất: RTDB `status/{uid}` và `typing/{roomId}/{uid}` (ADR-05).
6. **Next.js 16 khác dữ liệu train.** Trước khi dùng API của Next, đọc `node_modules/next/dist/docs/01-app/` (xem bảng ở mục 6).

## 2. Cây thư mục

```
implement/webapp/
  src/
    app/                                  # ROUTING ONLY — mỏng
      (public)/login/page.tsx
      (tabs)/friends/page.tsx             # ráp feature: gọi queries, render ui
      (tabs)/friends/add/page.tsx
      api/<resource>/route.ts             # CHỈ khi được yêu cầu
      layout.tsx  globals.css
    features/
      <feature>/                          # kebab-case: friend-requests, rooms, ...
        contracts/                        # [SHARED] isomorphic, không side-effect
          schemas.ts                      #   Zod input/output, tên theo operationId
          types.ts                        #   z.infer<...> + type DTO camelCase
          errors.ts                       #   mã lỗi từng operation (subset của ERROR_CODES)
          index.ts                        #   re-export
        ui/                               # [UI] component render, shadcn + Tailwind
          <name>.tsx
        hooks/                            # [LOGIC UI] 'use client' hooks: form, state, gọi action, map lỗi
          use-<name>.ts
        client/                           # [LOGIC UI - data] listener Firestore/RTDB, import 'client-only'
          <entity>.listener.ts
        server/
          actions.ts                      # [TRANSPORT] 'use server' — adapter mỏng
          services/<entity>.service.ts    # [BACKEND LOGIC] BR, policy, transaction — import 'server-only'
          queries/<entity>.query.ts       # [BACKEND READ] đọc phía server cho RSC — import 'server-only'
          repositories/
            <entity>.doc.ts               # [DB] kiểu document snake_case + converter
            <entity>.repo.ts              # [DB] truy cập Firestore Admin — import 'server-only'
    shared/
      contracts/                          # ActionResult, ERROR_CODES, Timestamp/Uid schema
      server/                             # firebase-admin, auth/session, runAction, runRoute, AppError, logger
      client/                             # firebase client SDK (auth, firestore, rtdb, storage)
      ui/                                 # shadcn primitives (components.json trỏ vào đây)
      lib/                                # utils thuần isomorphic (cn, date format)
      i18n/vi.ts                          # từ điển tiếng Việt (NFR-24)
  firebase/                               # firestore.rules, firestore.indexes.json, database.rules.json, storage.rules
  firebase.json  .firebaserc
  scripts/seed/                           # seed emulator
  e2e/                                    # Playwright
```

Danh sách feature (theo tag trong `specs/api-contract.yml`):
`auth` · `account` · `friend-requests` (gồm email lookup) · `invite-links` · `friends` · `blocks` · `rooms` · `messages` · `notifications` · `presence`.

## 3. Bảng phụ thuộc giữa các tầng (eslint `boundaries` cưỡng chế)

| Element | Glob | Được import | Cấm |
|---|---|---|---|
| `contracts` | `src/features/*/contracts/**`, `src/shared/contracts/**` | `contracts` (mọi feature), `zod` | mọi thứ khác |
| `lib` | `src/shared/lib/**` | `lib` | mọi thứ khác |
| `i18n` | `src/shared/i18n/**` | `contracts` (chỉ type) | mọi thứ khác |
| `shared-ui` | `src/shared/ui/**` | `shared-ui`, `lib` | features, server, client |
| `ui` | `src/features/*/ui/**` | `ui` (cùng feature, hoặc feature khác qua file ui công khai), `hooks` (cùng feature), `contracts`, `shared-ui`, `lib`, `i18n` | `server/*`, `client`, `shared-server`, firebase |
| `hooks` | `src/features/*/hooks/**` | `actions` (cùng feature), `client` (cùng feature), `contracts`, `shared-client`, `lib`, `i18n` | `services`, `queries`, `repositories`, `shared-server` |
| `client` | `src/features/*/client/**` | `contracts`, `shared-client`, `lib` | mọi thứ server |
| `shared-client` | `src/shared/client/**` | `contracts`, `lib` | mọi thứ server |
| `actions` | `src/features/*/server/actions.ts` | `services` (cùng feature), `contracts`, `shared-server` | `ui`, `hooks`, `client`, `repositories` |
| `app-api` | `src/app/api/**` | `services`, `contracts`, `shared-server` | `ui`, `hooks`, `client`, `repositories` |
| `services` | `src/features/*/server/services/**` | `repositories` (mọi feature), `services` (feature khác), `contracts`, `shared-server`, `lib` | `ui`, `hooks`, `client`, `actions` |
| `queries` | `src/features/*/server/queries/**` | `repositories` (mọi feature), `contracts`, `shared-server`, `lib` | `ui`, `hooks`, `client`, `actions` |
| `repositories` | `src/features/*/server/repositories/**` | `repositories` (chỉ file `*.doc.ts`), `contracts`, `shared-server`, `lib` | `services`, `actions`, mọi thứ client |
| `shared-server` | `src/shared/server/**` | `shared-server`, `contracts`, `lib`, `i18n` | features, client |
| `app-page` | `src/app/**` (trừ `api/`) | `ui`, `queries`, `shared-ui`, `shared-server` (chỉ `auth`), `i18n`, `lib` | `services`, `repositories`, `client` |

Quy tắc phụ:
- Cross-feature: `services → services` hoặc `services → repositories` của feature khác được phép, vì transaction phải đọc chéo (vd friend-requests đọc `blocks`). Không cho chiều ngược `repositories → services`.
- `actions.ts` được import từ `hooks` dưới dạng **reference** (Next thay bằng action ID). UI không import action trực tiếp mà đi qua hook.
- Server Component (`app-page`, component `ui` không có `'use client'`) truyền data xuống client component qua props. Props phải serializable và **đã lọc** (chỉ DTO trong `contracts`, không có document thô).

## 4. Cơ chế cưỡng chế

| Cơ chế | Ở đâu | Bắt lỗi gì |
|---|---|---|
| `import 'server-only'` dòng đầu | services, queries, repositories, shared/server | client bundle kéo code server, build fail |
| `import 'client-only'` dòng đầu | client/, shared/client | server kéo SDK browser |
| `'use server'` dòng đầu | `server/actions.ts` | mọi export phải là async function |
| `'use client'` | entry của subtree client (hooks, ui tương tác) | — |
| `eslint-plugin-boundaries` v7 (`boundaries/dependencies`) | `eslint.config.mjs` | import sai tầng theo bảng mục 3 |
| `tsc --noEmit` | CI | contract lệch giữa hai phía |
| Path alias `@/*` → `src/*` | `tsconfig.json` | cấm import tương đối vượt quá 1 cấp `../..` sang feature khác |

## 5. Luồng dữ liệu

```
GHI (mặc định):  ui ──event──> hooks ──call──> server/actions.ts ──> services ──> repositories ──> Firestore (Admin SDK)
                                 ▲                 │ runAction: auth + Zod + AppError → ActionResult<T>
                                 └── ActionResult ─┘
GHI (khi yêu cầu): fetch ──> app/api/**/route.ts ──runRoute──> services   (cùng service, map AppError → HTTP)
ĐỌC SSR:         app-page ──> queries ──> repositories ──> DTO ──props──> ui
ĐỌC REALTIME:    hooks ──> client/*.listener.ts ──onSnapshot──> Firestore (Security Rules chỉ cho đọc) ──map──> DTO
```

## 6. Docs Next.js cần đọc theo tác vụ (`node_modules/next/dist/docs/01-app/`)

| Tác vụ | File |
|---|---|
| Server Action, bảo mật, revalidate | `02-guides/server-actions.md`, `01-getting-started/07-mutating-data.md`, `03-api-reference/01-directives/use-server.md` |
| Form + `useActionState` | `02-guides/forms.md` |
| Ranh giới server/client, props serializable | `02-guides/server-and-client-boundary.md`, `01-getting-started/05-server-and-client-components.md` |
| DAL, `server-only`, taint | `02-guides/data-security.md` |
| Auth / session cookie | `02-guides/authentication.md`, `03-api-reference/04-functions/cookies.md` |
| Route Handler | `01-getting-started/15-route-handlers.md`, `03-api-reference/03-file-conventions/route.md` |
| Proxy (tên mới của middleware ở v16) | `01-getting-started/16-proxy.md` |
| Fetch / cache / revalidate | `01-getting-started/06-fetching-data.md`, `08-caching.md`, `09-revalidating.md` |
| Error / loading / not-found | `01-getting-started/10-error-handling.md`, `03-api-reference/03-file-conventions/*.md` |

Lưu ý Next 16 đã biết:
- `middleware.ts` đổi tên thành `proxy.ts`. Proxy chỉ dùng cho check lạc quan (redirect), **không** làm authorization.
- Client dispatch Server Action **tuần tự**. Đừng `Promise.all` nhiều action. Cần song song thì gộp vào một action.
- Deploy mới thì action ID đổi. UI phải xử lý lỗi "Failed to find Server Action" bằng hướng dẫn tải lại trang.
- `next.config.ts` bật **`cacheComponents: true`**. Đọc `cookies()`/session ở ngoài `<Suspense>` là **build error**. Phần UI phụ thuộc user phải nằm trong `<Suspense>`. Phần tĩnh để ngoài (static shell). Xem `02-guides/authentication-with-cache-components.md`.
- `try/catch` bọc code có thể gọi `redirect()`/`notFound()` thì phải `unstable_rethrow(err)` đầu tiên trong `catch`.
