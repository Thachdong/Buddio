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
2. **Dependencies** (pin chính xác theo `specs/tech-stack.md`, dùng `npm i -E`). Nếu đã có trong `package.json` thì bỏ qua bước này:
   - runtime: `zod@3` `firebase@12` `firebase-admin@13` `server-only` `client-only`
   - dev: `eslint-plugin-boundaries@7` `eslint-import-resolver-typescript`
   - `cn`, `radix-ui`, `lucide-react`, `class-variance-authority`, `tw-animate-css`, `shadcn` do shadcn init (bước 6) tự cài.
3. **Chuyển sang `src/`:** `git mv app src/app` (nếu chưa track thì dùng `mv`). Sửa `tsconfig.json`: `"paths": { "@/*": ["./src/*"] }`. Sau đó **xoá `.next/`**, vì type cũ trỏ vào `app/`.
4. **Copy template:** `templates/` vào gốc webapp, giữ nguyên đường dẫn:
   - `src/shared/contracts/{error-codes,primitives,result,index}.ts`
   - `src/shared/server/{firebase-admin,errors,auth,action,route,logger}.ts`
   - `src/shared/client/{firebase,call-action}.ts`
   - `src/shared/lib/{utils,date}.ts` (`utils` re-export `cn` từ package `cn` của shadcn), `src/shared/i18n/vi.ts`
   - `eslint.config.mjs` (thay file cũ; giữ phần next nếu file cũ có thêm cấu hình riêng)
   - `.env.example`; thêm `!.env.example` và `.work/` vào `.gitignore`
5. **Tái tạo `error-codes.ts`** từ contract hiện tại (mục C), vì template có thể đã cũ.
6. **shadcn** (Radix, preset Nova; đóng stdin để không treo ở prompt):
   ```
   npx -y shadcn@latest init -t next -b radix -p nova -y --no-monorepo --no-rtl </dev/null
   ```
   Sau đó:
   - Copy `templates/components.json` đè file vừa sinh (aliases: `ui`/`components` → `@/shared/ui`, `utils` → `@/shared/lib/utils`, `lib` → `@/shared/lib`, `hooks` → `@/shared/ui/hooks`).
   - Chuyển `src/components/ui/*` vào `src/shared/ui/`, rồi xoá `src/components/` và `src/lib/`.
   - `globals.css` của shadcn dùng `--font-sans`, nên trong `layout.tsx` đổi `variable: "--font-geist-sans"` thành `"--font-sans"`. Đặt `lang="vi"`.
7. **Tạo thư mục trống** `src/features/`, `firebase/`, `scripts/seed/`, `e2e/`, mỗi thư mục có `.gitkeep`.
8. **Verify** (bắt buộc pass):
   - `npx next typegen`, rồi `npx tsc --noEmit` (`LayoutProps`/`PageProps` là type do Next sinh)
   - `npx eslint .` (không được có warning `[boundaries]` về cú pháp deprecated)
   - **Kiểm boundaries chạy thật:** tạo 2 feature tạm `zprobe`, `zother` có cả import hợp lệ và import sai, chạy eslint và **phải thấy đúng** các lỗi: ui → shared-server, ui → `firebase/*`, actions → repositories, repositories → services, hooks → actions của feature khác. Import hợp lệ (hooks → actions cùng feature, ui → hooks, services → repositories) **không được** báo lỗi. Xoá feature tạm sau khi kiểm.
   - `npm run build`

Ghi chú eslint-plugin-boundaries v7: rule tên `boundaries/dependencies`, khai báo bằng `policies`; selector dạng `{ to: { element: { type, captured } } }`; template viết `{{ from.element.captured.feature }}`; element dùng `partialMatch: false` và **chỉ khớp folder**. Vì vậy `actions` khớp folder `server/` và phải khai báo sau services/queries/repositories; `proxy.ts` đưa vào `boundaries/ignore`.

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
