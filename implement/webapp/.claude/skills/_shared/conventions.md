# Conventions — code chung cho mọi skill `fs-*`

Đọc cùng `architecture.md`. Các helper nói ở đây do `fs-scaffold` tạo trong `src/shared/`. **Dùng helper, không viết lại.**

## 1. Đặt tên

| Thứ | Quy tắc | Ví dụ |
|---|---|---|
| Thư mục feature | kebab-case, số nhiều theo resource | `friend-requests`, `rooms` |
| File | kebab-case + hậu tố vai trò | `friend-request.service.ts`, `friend-request.repo.ts`, `friend-request.doc.ts`, `use-add-friend.ts`, `email-lookup-card.tsx` |
| Zod schema | PascalCase + `Schema`, tên theo schema trong `api-contract.yml` | `EmailLookupCreateSchema`, `FriendRequestSchema` |
| Type DTO | trùng tên schema contract, không có hậu tố | `EmailLookupCreate`, `FriendRequest` |
| Server Action | `<operationId>Action` | `createFriendRequestAction` |
| Service function | `<operationId>` (bỏ chữ Action) | `createFriendRequest(ctx, input)` |
| Query function | `get…` / `list…` | `listFriends(uid)` |
| Repo function | động từ CRUD + entity | `getFriendRequest`, `findPendingPair`, `insertFriendRequest` |
| Hook | `use<Việc>` | `useEmailLookup`, `useSendFriendRequest` |
| Listener | `subscribe<Entity>` trả `Unsubscribe` | `subscribeIncomingRequests(uid, cb)` |
| Component | PascalCase, file kebab-case | `EmailLookupCard` trong `email-lookup-card.tsx` |

## 2. Contract (`contracts/`)

- Nguồn chuẩn là `specs/api-contract.yml`. Mỗi operation có: input schema, output schema, danh sách `x-errors`.
- JSON dùng **camelCase**, DB dùng **snake_case**. Mapper nằm ở repository.
- Thời gian trong DTO là **chuỗi ISO-8601 UTC** (`TimestampSchema` ở `shared/contracts`). Không truyền `Date`/`Timestamp` qua ranh giới.
- Chuẩn hoá input (trim, lowercase email) làm **trong Zod** (`.transform`), để client và server dùng chung một logic.
- Không đưa ra contract các cột nội bộ: `email_norm`, `lookup_window`, `display_name_custom`, `pair_key`, `schema_version`, `deleted_at`, `images[].path`.

```ts
// features/friend-requests/contracts/schemas.ts
import { z } from 'zod'
import { EmailSchema, TimestampSchema, UidSchema } from '@/shared/contracts'

export const EmailLookupCreateSchema = z.object({ email: EmailSchema })
export const EmailLookupResultSchema = z.discriminatedUnion('result', [ /* ... */ ])

// features/friend-requests/contracts/errors.ts
import type { ErrorCode } from '@/shared/contracts'
export const createFriendRequestErrors = [
  'CANNOT_INVITE_SELF', 'FRIEND_TARGET_NOT_FOUND', 'ALREADY_FRIENDS',
  'FRIEND_REQUEST_ALREADY_PENDING', 'REJECT_COOLDOWN',
] as const satisfies readonly ErrorCode[]
```

## 3. Kết quả và lỗi

```ts
// shared/contracts/result.ts
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: AppErrorPayload }
type AppErrorPayload = { code: ErrorCode; message: string; details?: ErrorDetail[] }  // = schema Error của contract
```

- Service **throw** `new AppError('ALREADY_FRIENDS', { details })` (lấy từ `@/shared/server/errors`). Không return lỗi.
- `runAction` / `runRoute` bắt `AppError` và chuyển thành `ActionResult` hoặc HTTP (status lấy từ `ERROR_HTTP_STATUS`). Lỗi lạ thì log và trả `INTERNAL_ERROR`, không lộ stack.
- `message` mặc định lấy từ `vi.errors[code]`. Service chỉ truyền `message` khi cần nội dung riêng.
- Hook map `error.code` sang UI state bằng `switch` **exhaustive** trên `(typeof <op>Errors)[number] | CommonErrorCode`.

## 4. Server Action (mặc định)

```ts
'use server'
import { runAction } from '@/shared/server/action'
import type { ActionResult } from '@/shared/contracts'
import { CreateFriendRequestSchema, FriendRequestSchema, type FriendRequest } from '../contracts'
import { createFriendRequest } from './services/friend-request.service'

export async function createFriendRequestAction(input: unknown): Promise<ActionResult<FriendRequest>> {
  return runAction(
    { name: 'createFriendRequest', auth: 'member', schema: CreateFriendRequestSchema, output: FriendRequestSchema, input },
    (data, ctx) => createFriendRequest(ctx, data),
  )
}
```

- Mỗi export là một `async function` khai báo tường minh (không `export const x = wrap(...)`).
- Luôn truyền `output` schema: Zod strip field thừa, nên document thô không lọt ra client.
- Rule Zod nào tương ứng mã lỗi nghiệp vụ (vd `EMAIL_INVALID`) thì đặt `message` = mã đó. `runAction` sẽ trả đúng mã đó thay vì `VALIDATION_FAILED`.
- Tham số là `input: unknown`. Mọi giá trị đều được parse lại bằng Zod. Định danh người dùng lấy từ session, **không** lấy từ input.
- Mức auth: `'public'` · `'identity'` (có Firebase identity hợp lệ, chưa cần tài khoản: `createSession`, `createAccount`, `openInviteLink`) · `'member'` (có tài khoản + đã đồng ý + phiên chưa quá 30 ngày; còn lại đều dùng mức này).
- Revalidate (`revalidatePath`/`updateTag`) chỉ khi trang có dùng `queries` SSR. Dữ liệu realtime tự cập nhật qua listener.
- Action nhận form bằng `useActionState` thì dùng chữ ký `(prev, formData)` và **chuyển formData → object rồi gọi lại action chuẩn**. Không nhân đôi logic.

## 5. Route Handler (chỉ khi được yêu cầu)

```ts
// app/api/friend-requests/route.ts
import { runRoute } from '@/shared/server/route'
export const POST = runRoute({ auth: 'member', schema: CreateFriendRequestSchema, status: 201 },
  (data, ctx) => createFriendRequest(ctx, data))
```
Path, method, status và body phải khớp `api-contract.yml`. Auth: dùng cookie phiên, hoặc header `Authorization: Bearer <idToken>` cho client ngoài.

## 6. Auth & phiên (ADR-06 đã cập nhật)

- Cookie `__session` = Firebase **session cookie** (`createSessionCookie`, tối đa 14 ngày). Firebase App Hosting chỉ forward cookie có tên `__session`.
- Đăng nhập: client sign-in Google, lấy ID token, gọi `createSessionAction({ idToken })`. Server verify rồi set cookie (`httpOnly`, `secure`, `sameSite=lax`).
- Cookie hết hạn nhưng Firebase client vẫn đăng nhập: `AuthProvider` tự lấy ID token mới và tạo lại phiên (không bắt user đăng nhập lại).
- Kiểm 30 ngày không dùng (NFR-11) dựa trên `users.last_active_at`, cập nhật tối đa 1 lần/giờ trong `requireAuth('member')`.
- Đăng xuất / xóa tài khoản: `revokeRefreshTokens` + xoá cookie + `signOut()` ở client.

## 7. Repository & Firestore

- Mỗi collection thuộc **một feature sở hữu** (xem `specs-map.md`). Chỉ repo của feature đó được ghi vào collection đó.
- `*.doc.ts`: type document snake_case + `FirestoreDataConverter` + hàm `toDto()`. Timestamp đổi sang ISO ở đây.
- Mọi hàm repo nhận tham số cuối là `tx?: Transaction`, để service gộp nhiều repo vào một transaction.
- Không trả document thô ra ngoài repo; luôn trả DTO hoặc type domain đã map.
- Rules: client **chỉ đọc**, mọi `write` đều deny (trừ RTDB `status`, `typing`).

## 8. UI

- Mobile-first từ 360px. Dùng shadcn/ui ở `@/shared/ui` và Tailwind 4.
- **Mọi chuỗi hiển thị** lấy từ `vi` (`@/shared/i18n/vi`). Không hardcode tiếng Việt trong component.
- Component trong `ui/` không gọi `fetch`, không gọi action, không dùng Firebase. Data và callback đi vào qua props hoặc qua hook của chính feature.
- Có đủ state: loading (skeleton/spinner) · empty · error · success. Có a11y: label, `aria-*`, focus, hỗ trợ bàn phím.
- Ngày giờ hiển thị theo múi giờ thiết bị, dùng formatter ở `@/shared/lib/date`.

## 9. Logging & bảo mật (NFR-27)

- Dùng `logger` ở `@/shared/server/logger`. **Không** log email dạng đọc được, nội dung tin, URL ảnh, token. Cần thì dùng `hashForLog(value)`.
- Action/route luôn auth và validate trước. Nội dung render ở UI **không** phải là ranh giới bảo mật.
- Không đưa secret ra client. Chỉ biến môi trường `NEXT_PUBLIC_FIREBASE_*` được dùng ở client.

## 10. Test

| Loại | Vị trí | Công cụ |
|---|---|---|
| Service (BR, transaction) | `features/<f>/server/services/*.test.ts` | Vitest + Firestore emulator |
| Contract (Zod) | `features/<f>/contracts/*.test.ts` | Vitest |
| Security Rules | `firebase/tests/*.rules.test.ts` | `@firebase/rules-unit-testing` |
| Hook | `features/<f>/hooks/*.test.ts` | Vitest + Testing Library |
| E2E theo AC | `e2e/<task-id>.spec.ts` | Playwright + emulator |
