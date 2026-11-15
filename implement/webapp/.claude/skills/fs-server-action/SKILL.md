---
name: fs-server-action
description: Viết Server Action ('use server') làm adapter transport mặc định cho một operation Buddio — runAction (auth + Zod + AppError → ActionResult), output schema, revalidate, cookie phiên — trong src/features/<feature>/server/actions.ts. Đây là cách mặc định để UI gọi server; chỉ dùng fs-api-route khi prompt yêu cầu API route. Dùng khi orchestrator giao section "transport" với transport = server-action.
---

# fs-server-action

Một trách nhiệm: **đưa service ra cho client gọi** qua Server Action. Action phải mỏng: không có business rule, không truy cập DB.

Đọc trước:
- `../_shared/architecture.md` (mục 3: `actions` chỉ được import `services` cùng feature, `contracts`, `shared-server`; mục 6: lưu ý Next 16)
- `../_shared/conventions.md` (mục 4, 6)
- `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` và `03-api-reference/01-directives/use-server.md`

## Input
- Section `## 5. transport` trong plan.md (transport = `server-action`).
- Bảng output của `fs-contract` (schema input/output) và của `fs-service` (chữ ký hàm).

## Output
`src/features/<feature>/server/actions.ts`: **một file cho mỗi feature**, mỗi operation là một export.

## Template

```ts
'use server'

import type { ActionResult } from '@/shared/contracts'
import { runAction } from '@/shared/server/action'
import {
  FriendRequestAcceptedSchema, FriendRequestCreateSchema, FriendRequestIdSchema, FriendRequestSchema,
  type FriendRequest,
} from '../contracts'
import { acceptFriendRequest, createFriendRequest } from './services/friend-request.service'

export async function createFriendRequestAction(input: unknown): Promise<ActionResult<FriendRequest>> {
  return runAction(
    { name: 'createFriendRequest', auth: 'member', schema: FriendRequestCreateSchema, output: FriendRequestSchema, input },
    (data, ctx) => createFriendRequest(ctx, data),
  )
}

export async function acceptFriendRequestAction(input: unknown) {
  return runAction(
    { name: 'acceptFriendRequest', auth: 'member', schema: FriendRequestIdSchema, output: FriendRequestAcceptedSchema, input },
    (data, ctx) => acceptFriendRequest(ctx, data),
  )
}
```

## Quy tắc

| Việc | Quy tắc |
|---|---|
| Tên | `<operationId>Action`. Plugin TS của Next chấp nhận prop kiểu function có tên kết thúc bằng `Action`. |
| Export | Chỉ `export async function`. Không export const, type hay hằng số từ file `'use server'`. |
| Tham số | Một tham số `input: unknown`. Danh tính lấy từ session, không bao giờ từ input. |
| Auth | `'member'` cho mọi operation, trừ: `createSession`, `createAccount`, `openInviteLink` dùng `'identity'`; `getHealth` dùng `'public'`. |
| Output | **Luôn** truyền `output` schema để Zod loại field thừa trước khi serialize. |
| Lỗi | Không `try/catch` trong action; `runAction` đã xử lý. Không throw ra client. |
| Revalidate | Chỉ khi trang hiển thị dữ liệu này qua `queries` SSR. Gọi `updateTag`/`revalidatePath` **trong handler, sau** khi service trả về. Dữ liệu client đọc bằng listener realtime thì **không** cần revalidate. |
| Cookie | Chỉ action được set hoặc xoá cookie: `createSession` → `setSessionCookie(idToken)`; `deleteCurrentSession` / `deleteMe` → `clearSessionCookie()` (cả hai từ `@/shared/server/auth`). Service không đụng cookie. |
| Redirect | Hạn chế. Ưu tiên trả `ActionResult` để hook điều hướng phía client. Nếu dùng `redirect()` thì `runAction` đã `unstable_rethrow` nên vẫn chạy đúng. |
| Body lớn | Action giới hạn 1MB. Ảnh **không** đi qua action: client upload thẳng lên Storage (`uploads/{uid}/…`, ADR-10), action chỉ nhận `uploadIds`. |
| Song song | Client gọi action tuần tự. Cần nhiều việc cùng lúc thì gộp vào một action và một service. |

### Form với `useActionState`
Không viết action thứ hai có logic riêng. Tạo wrapper đổi `FormData` thành object rồi gọi action chuẩn:

```ts
export async function updateMeFormAction(_prev: ActionResult<Me> | null, formData: FormData) {
  return updateMeAction(Object.fromEntries(formData))
}
```

### Có kèm `fs-api-route`
Nếu plan có cả route, action và route gọi **cùng một** hàm service với cùng một schema. Không copy logic.

## Checklist
- [ ] Dòng đầu là `'use server'`. Chỉ import `../contracts`, `./services/*`, `@/shared/server/*`, `@/shared/contracts`, `next/cache`.
- [ ] Mỗi action có `name` = operationId, `auth` đúng mức, `schema`, `output`.
- [ ] Không có `if`/business rule hay truy cập DB/repo trong action.
- [ ] `tsc`, `eslint src/features/<f>/server` pass (boundaries chặn action → repositories).

## Handoff
Ghi vào `## 5. transport → Output`: bảng `operationId | action | auth | revalidate`. `fs-ui-logic` dùng bảng này để viết hook.
