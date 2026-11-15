---
name: fs-contract
description: Viết interface dùng chung client ↔ server cho một feature Buddio — Zod schema input/output, type DTO, danh sách mã lỗi từng operation — trong src/features/<feature>/contracts/, khớp specs/api-contract.yml. Dùng khi bắt đầu một task có operation mới, khi contract đổi, hoặc khi orchestrator (fs-build-feature, fs-change) giao section "contract". Không viết logic, không gọi DB.
---

# fs-contract

Một trách nhiệm: **khoá interface** giữa client và server. Mọi tầng khác đều phụ thuộc vào output của skill này, nên skill này luôn chạy đầu tiên.

Đọc trước: `../_shared/architecture.md` (mục 3: `contracts` chỉ được import `contracts` và `zod`), `../_shared/conventions.md` (mục 1–3).

## Input
- Section `## 1. contract` trong `.work/<task>/plan.md`: danh sách operation và schema cần tạo.
- `../../specs/api-contract.yml`: nguồn chuẩn.
- Không có plan (gọi trực tiếp): hỏi feature + operationId.

## Output
```
src/features/<feature>/contracts/
  schemas.ts   # Zod
  types.ts     # z.infer + type thuần
  errors.ts    # <operationId>Errors
  index.ts     # export * từ 3 file trên
```
Feature chưa có thư mục: gọi `fs-scaffold feature <name>` trước.

## Các bước

1. **Tìm operation:** grep `operationId: <op>` trong contract. Đọc:
   - `requestBody.content.application/json.schema` và `parameters` (path param). Đây là **input**.
   - Response 2xx. Đây là **output** (`204` thì output là `void`).
   - `x-errors` cộng các mã ghi trong `description` của response 4xx. Đây là **error list**.
   - `description`: chép các quy tắc ràng buộc dữ liệu (độ dài, enum, thứ tự…).
2. **Tìm schema** ở `components.schemas.<Name>` và dịch sang Zod theo bảng ở mục "Dịch OpenAPI sang Zod".
3. **Input = body + path params gộp phẳng** thành một object. Ví dụ `acceptFriendRequest` có input `{ requestId }`. Server Action nhận đúng object này; `runRoute` cũng gộp body với params theo cùng cách.
4. **Mã lỗi nghiệp vụ trong Zod:** rule nào ứng với mã lỗi của contract (vd `EMAIL_INVALID`, `DISPLAY_NAME_INVALID`, `ROOM_NAME_TOO_LONG`, `MESSAGE_TOO_LONG`) thì đặt `message: '<CODE>'`. Rule thuần cấu trúc thì để message mặc định (sẽ ra `VALIDATION_FAILED`).
5. **Tái sử dụng** schema ở `@/shared/contracts` (`UidSchema`, `TimestampSchema`, `EmailSchema`, `DisplayNameSchema`) và schema của feature khác (`import { FriendshipSchema } from '@/features/friends/contracts'`). Không định nghĩa lại.
6. **Có mã lỗi mới** chưa nằm trong `ERROR_HTTP_STATUS`: chạy `fs-scaffold sync-errors`. Không tự sửa tay `error-codes.ts`.
7. **Verify:** `npx tsc --noEmit` và `npx eslint src/features/<feature>/contracts`.

## Dịch OpenAPI sang Zod

| OpenAPI | Zod |
|---|---|
| `type: string` | `z.string()` (+ `.min/.max` theo `minLength/maxLength`) |
| `$ref: Uid` / `Timestamp` | `UidSchema` / `TimestampSchema` |
| `format: date-time`, `type: [string,'null']` | `TimestampSchema.nullable()` |
| `enum: [a, b]` | `z.enum(['a','b'])` |
| `enum` có `null` | `z.enum([...]).nullable()` |
| `required` thiếu field | `.optional()` |
| `oneOf` + discriminator, hoặc kết quả theo field `result` | `z.discriminatedUnion('result', [...])` |
| `type: array, items` | `z.array(X)` (+ `.max` theo `maxItems`) |
| `type: integer` | `z.number().int()` |
| `additionalProperties` không khai | `z.object` (mặc định strip field lạ) |

## Template

```ts
// schemas.ts
import { z } from 'zod'
import { EmailSchema, TimestampSchema, UidSchema } from '@/shared/contracts'

/** createFriendRequest — input (body) */
export const FriendRequestCreateSchema = z.object({ email: EmailSchema })

/** acceptFriendRequest — input (path param) */
export const FriendRequestIdSchema = z.object({ requestId: z.string().min(1) })

/** = components.schemas.FriendRequest */
export const FriendRequestSchema = z.object({
  id: z.string(),
  fromUid: UidSchema,
  toUid: UidSchema,
  channel: z.enum(['in_app', 'link']),
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn', 'closed']),
  closedReason: z.enum(['became_friends', 'blocked', 'account_deleted']).nullable().optional(),
  createdAt: TimestampSchema,
  respondedAt: TimestampSchema.nullable().optional(),
})
```

```ts
// types.ts
import type { z } from 'zod'
import type * as S from './schemas'

export type FriendRequestCreate = z.input<typeof S.FriendRequestCreateSchema>   // form/client gửi lên
export type FriendRequest = z.output<typeof S.FriendRequestSchema>
```
Input dùng `z.input` (trước transform), output dùng `z.output`.

```ts
// errors.ts
import type { ErrorCode } from '@/shared/contracts'

export const createFriendRequestErrors = [
  'CANNOT_INVITE_SELF', 'FRIEND_TARGET_NOT_FOUND', 'ALREADY_FRIENDS',
  'FRIEND_REQUEST_ALREADY_PENDING', 'REJECT_COOLDOWN',
] as const satisfies readonly ErrorCode[]
export type CreateFriendRequestError = (typeof createFriendRequestErrors)[number]
```
Không đưa `COMMON_ERROR_CODES` (`VALIDATION_FAILED`, `UNAUTHENTICATED`, …) vào list riêng; hook xử lý chúng chung.

## Checklist
- [ ] Tên schema = tên trong `components.schemas` + `Schema`; type cùng tên không có hậu tố.
- [ ] Không có field nội bộ (`email_norm`, `pair_key`, `schema_version`, `deleted_at`, `images[].path`, `lookup_window`, `display_name_custom`).
- [ ] camelCase toàn bộ; thời gian là ISO string.
- [ ] File chỉ import `zod` và `contracts` (của shared hoặc feature khác). Không có `server-only`, `firebase`, `next`.
- [ ] Mỗi operation trong plan có đủ input schema, output schema và `<op>Errors`.
- [ ] `tsc` và `eslint` pass.

## Handoff
Ghi vào `## 1. contract → Output` trong plan.md: bảng `operationId | input schema | output schema | errors const`. Worker sau chỉ đọc bảng này, không đọc lại contract YAML.
