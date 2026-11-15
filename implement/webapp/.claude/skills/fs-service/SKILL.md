---
name: fs-service
description: Viết logic backend của một feature Buddio — business rule (BR-xx), thứ tự kiểm tra theo contract, quyền, Firestore transaction, ghi chéo collection, ném AppError — trong src/features/<feature>/server/services/ (ghi) và server/queries/ (đọc cho RSC). Dùng khi orchestrator giao section "service", khi sửa một BR, hoặc khi cần hàm đọc phía server cho page. Không biết gì về HTTP, cookie, Next.js.
---

# fs-service

Một trách nhiệm: **quy tắc nghiệp vụ**. Service là nơi duy nhất quyết định một thao tác có được phép hay không và ghi những gì.

Đọc trước: `../_shared/architecture.md` (mục 3: `services` được import `repositories` của mọi feature, `services` của feature khác, `contracts`, `shared-server`, `lib`), `../_shared/conventions.md` (mục 3, 7, 9).

## Input
- Section `## 4. service` trong plan.md.
- `description` của operation trong `api-contract.yml`: **thứ tự kiểm tra** và những gì phải ghi.
- BR / FLOW / SUP liên quan trong `../../idea/business.md`, `../../idea/business-flows.md`.
- Task `../../backlog/tasks/T-xxx-*.md`, mục 3 "API / Backend".
- Output của `fs-contract` (input/output/error types) và `fs-repository` (hàm repo).

## Output
```
src/features/<feature>/server/services/<entity>.service.ts   # hàm ghi: <operationId>(ctx, input)
src/features/<feature>/server/queries/<entity>.query.ts      # hàm đọc cho RSC: get…/list…(ctx, …)
```

## Chữ ký chuẩn

```ts
import 'server-only'
import type { Identity } from '@/shared/server/auth'

export async function createFriendRequest(ctx: Identity, input: FriendRequestCreateInput): Promise<FriendRequest>
```
- `ctx` lấy từ `runAction`/`runRoute`. **Uid luôn là `ctx.uid`**, không bao giờ lấy từ input.
- `input` đã qua Zod (kiểu `z.output`). Không validate lại cấu trúc, chỉ kiểm quy tắc nghiệp vụ.
- Trả **DTO** (dùng `toXxxDto`). Không trả entity.

## Template

```ts
// friend-request.service.ts
import 'server-only'
import { adminDb } from '@/shared/server/firebase-admin'
import { AppError } from '@/shared/server/errors'
import type { Identity } from '@/shared/server/auth'
import type { FriendRequest, FriendRequestCreate } from '../../contracts'
import { findPendingPair, insertFriendRequest } from '../repositories/friend-request.repo'
import { toFriendRequestDto } from '../repositories/friend-request.doc'
// Repo của feature khác: tên hàm dưới đây là minh hoạ — dùng đúng hàm đã có (hoặc nhờ fs-repository tạo ở feature owner)
import { findActiveUserByEmail } from '@/features/account/server/repositories/user.repo'
import { findBlockEitherWay } from '@/features/blocks/server/repositories/block.repo'
import { insertNotification } from '@/features/notifications/server/repositories/notification.repo'

/** BIZ-03 · FLOW-03 E3 · BR-05, BR-08, BR-09, BR-10 · SUP-01 */
export async function createFriendRequest(ctx: Identity, input: FriendRequestCreate): Promise<FriendRequest> {
  const now = new Date()
  return adminDb().runTransaction(async (tx) => {
    // 1. ĐỌC — mọi tx.get phải xong trước khi ghi
    const target = await findActiveUserByEmail(input.email, tx)
    if (target?.uid === ctx.uid) throw new AppError('CANNOT_INVITE_SELF')
    if (!target || target.anonymous || (await findBlockEitherWay(ctx.uid, target.uid, tx)))
      throw new AppError('FRIEND_TARGET_NOT_FOUND') // BR-04: không lộ lý do
    // … ALREADY_FRIENDS → FRIEND_REQUEST_ALREADY_PENDING → REJECT_COOLDOWN (đúng thứ tự contract)

    // 2. GHI
    const entity = { fromUid: ctx.uid, toUid: target.uid, channel: 'in_app' as const, status: 'pending' as const,
      closedReason: null, createdAt: now, respondedAt: null, expireAt: null }
    const id = insertFriendRequest(entity, tx)
    insertNotification(target.uid, { type: 'friend_request_received', actorUid: ctx.uid,
      refType: 'friend_request', refId: id, createdAt: now }, tx)

    return toFriendRequestDto({ id, ...entity })
  })
}
```

## Quy tắc

**Thứ tự và lỗi**
- Kiểm tra theo **đúng thứ tự** ghi trong `description` của contract, vì thứ tự quyết định mã lỗi trả về (và việc có lộ thông tin hay không).
- Lỗi luôn là `throw new AppError('<CODE>', { details })`, với `<CODE>` thuộc `<op>Errors` của contract. Thêm `details` khi contract có (vd `REJECT_COOLDOWN` có `details: [{ retryAfter }]`).
- **Chống lộ thông tin (BR-04):** các lý do mà contract gộp chung (chưa đăng ký / ẩn danh / bị chặn) phải ném **cùng một** `AppError`, không thêm `details` hay `message` riêng cho từng lý do.

**Transaction**
- Thao tác ghi nhiều document hoặc phụ thuộc vào dữ liệu vừa đọc thì phải chạy trong `adminDb().runTransaction`.
- Trong transaction, đọc hết rồi mới ghi. Firestore tự retry transaction, nên trong callback **không** gây side-effect ra ngoài (gửi mail, log nghiệp vụ, đẩy task queue). Những việc đó làm sau khi transaction resolve.
- `const now = new Date()` một lần ở đầu hàm và dùng lại cho mọi field thời gian.
- Ghi vào collection của feature khác thì gọi **repo của feature sở hữu** và truyền `tx`.

**Ranh giới**
- **Cấm** import `next/*` (`cookies`, `headers`, `revalidatePath`, `redirect`). Những thứ đó thuộc transport (`fs-server-action`).
- Không đọc `process.env` trực tiếp. Cấu hình nghiệp vụ (giới hạn, TTL) đọc từ `config/limits` (TBL-11) qua repo; secret lấy qua `shared/server`.
- Không gọi service của feature khác **bên trong** transaction, trừ khi hàm đó nhận `tx`. Ưu tiên gọi thẳng repo.
- Việc nền dài (purge) thì đẩy task queue Cloud Functions sau khi commit (ADR-11), không làm đồng bộ.

**Queries (đọc cho RSC)**
- `server/queries/*.query.ts` chỉ đọc và trả DTO đã lọc theo quyền của `ctx.uid`.
- Page gọi query bên trong `<Suspense>` (vì `cacheComponents`). Query không tự đọc cookie: page gọi `getOptionalIdentity()` rồi truyền `ctx` vào.

## Checklist
- [ ] Dòng đầu là `import 'server-only'`; không import `next/*`.
- [ ] Mỗi hàm có JSDoc ghi BIZ/FLOW/BR được thực thi.
- [ ] Đủ mọi nhánh lỗi trong `<op>Errors`, đúng thứ tự contract.
- [ ] Không có side-effect bên trong callback transaction.
- [ ] Trả về DTO qua `toXxxDto`.
- [ ] `tsc` và `eslint src/features/<f>/server` pass.

## Handoff
Ghi vào `## 4. service → Output`: chữ ký hàm, map BR → nhánh code, và các case cần test (để `fs-test` viết test theo từng nhánh lỗi).
