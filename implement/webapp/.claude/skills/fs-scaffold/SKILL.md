---
name: fs-scaffold
description: Dựng hoặc sửa khung kiến trúc của webapp Buddio (Next.js 16 + Firebase) — cây src/ feature-based, path alias, eslint boundaries, server-only/client-only, helper shared (runAction, runRoute, AppError, auth session cookie, firebase admin/client, logger, i18n). Dùng khi khởi tạo project (T-001), khi src/shared chưa có, khi tạo thư mục feature mới, hoặc khi contract thêm mã lỗi mới. Không dùng để viết logic feature.
---

# fs-scaffold

Một trách nhiệm: **khung và hạ tầng dùng chung**. Không viết logic nghiệp vụ.

Đọc trước: `../_shared/architecture.md`, `../_shared/conventions.md`.

## Chế độ

| Mode | Khi nào | Làm gì |
|---|---|---|
| `init` | `src/shared/` chưa có | Toàn bộ mục A |
| `feature <name>` | orchestrator cần feature chưa có thư mục | Mục B |
| `sync-errors` | `api-contract.yml` đổi bảng mã lỗi | Mục C |

Nếu không được truyền mode: `src/shared/contracts/index.ts` chưa có thì chạy `init`, ngược lại hỏi orchestrator.

## A. init

Thứ tự thực hiện:

1. **Kiểm tra trạng thái:** `git status`. Nếu `src/` đã có code thật thì dừng và báo lại. Không ghi đè.
2. **Dependencies** (pin chính xác theo `specs/tech-stack.md`, dùng `npm i -E`):
   - runtime: `zod@3` `firebase@12` `firebase-admin@13` `server-only` `client-only` `clsx` `tailwind-merge`
   - dev: `eslint-plugin-boundaries` `eslint-import-resolver-typescript`
3. **Chuyển sang `src/`:** `git mv app src/app` (nếu chưa track thì dùng `mv`). Sửa `tsconfig.json`: `"paths": { "@/*": ["./src/*"] }`.
4. **Copy template:** `templates/` vào gốc webapp, giữ nguyên đường dẫn:
   - `src/shared/contracts/{error-codes,primitives,result,index}.ts`
   - `src/shared/server/{firebase-admin,errors,auth,action,route,logger}.ts`
   - `src/shared/client/firebase.ts`
   - `src/shared/lib/{utils,date}.ts`, `src/shared/i18n/vi.ts`
   - `eslint.config.mjs` (thay file cũ; giữ phần next nếu file cũ có thêm cấu hình riêng)
   - `.env.example`; thêm `!.env.example` và `.work/` vào `.gitignore`
5. **Tái tạo `error-codes.ts`** từ contract hiện tại (mục C), vì template có thể đã cũ.
6. **shadcn:** chạy `npx shadcn@latest init`. Sau đó sửa `components.json`: `aliases.ui = "@/shared/ui"`, `aliases.utils = "@/shared/lib/utils"`, `aliases.components = "@/shared/ui"`. Xoá `src/lib/utils.ts` nếu shadcn tự tạo.
7. **Tạo thư mục trống** `src/features/`, `firebase/`, `scripts/seed/`, `e2e/`, mỗi thư mục có `.gitkeep`.
8. **Verify** (bắt buộc pass):
   - `npx tsc --noEmit`
   - `npx eslint src`
   - Kiểm boundaries chạy thật: tạo file tạm `src/features/_probe/ui/x.tsx` import `@/shared/server/auth`, chạy eslint và **phải thấy lỗi** `boundaries/element-types`, sau đó xoá file tạm. Nếu không có lỗi thì cú pháp capture sai: đọc `node_modules/eslint-plugin-boundaries/README.md` và sửa `${from.feature}` thành `{{from.feature}}` hoặc ngược lại.
   - `npm run build`

## B. feature `<name>`

Tạo khung cho feature (tên kebab-case, phải có trong bảng ở `_shared/specs-map.md`):

```
src/features/<name>/
  contracts/{schemas,types,errors,index}.ts   # rỗng, có export {} 
  ui/  hooks/  client/                         # .gitkeep
  server/{services,queries,repositories}/      # .gitkeep
```
Không tạo `server/actions.ts`. File đó do `fs-server-action` tạo khi có action đầu tiên.

## C. sync-errors

Đọc bảng `| CODE | HTTP | Ý nghĩa | Ref |` trong `info.description` của `../../specs/api-contract.yml` và sinh lại `src/shared/contracts/error-codes.ts` (cùng format với template). Sau đó:
- Thêm key còn thiếu vào `vi.errors` (TS `satisfies Record<ErrorCode,string>` sẽ báo lỗi nếu thiếu).
- Chạy `tsc --noEmit`.

## Không làm

- Không viết collection, rules, service, UI của feature. Việc đó thuộc các worker khác.
- Không sửa `next.config.ts`, trừ khi orchestrator yêu cầu.

## Handoff

Ghi vào `plan.md` (nếu có) phần Output: danh sách file đã tạo, version các dependency, kết quả 4 lệnh verify.
