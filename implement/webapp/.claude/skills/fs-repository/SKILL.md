---
name: fs-repository
description: Viết tầng truy cập Firestore/RTDB/Storage bằng Admin SDK cho một feature Buddio — kiểu document snake_case, mapper doc ↔ entity ↔ DTO, hàm đọc/ghi nhận transaction — trong src/features/<feature>/server/repositories/. Dùng khi service cần đọc/ghi collection, khi thêm collection/field mới, hoặc khi orchestrator giao section "repository". Không chứa business rule.
---

# fs-repository

Một trách nhiệm: **nói chuyện với database**. Repo không biết gì về business rule, quyền hay HTTP.

Đọc trước: `../_shared/architecture.md` (mục 3: `repositories` chỉ được import `repositories`, `contracts`, `shared-server`, `lib`), `../_shared/conventions.md` (mục 7), `../_shared/specs-map.md` (feature nào sở hữu collection nào).

## Input
- Section `## 3. repository` trong plan.md: collection cần dùng và hàm service cần.
- `../../specs/database.md`, mục `## TBL-xx`: cột, kiểu, null, default, enum, index.
- Output của `fs-contract` (type DTO để map ra).

## Output
```
src/features/<owner-feature>/server/repositories/
  <entity>.doc.ts    # tên collection, kiểu Doc, kiểu Entity, toDoc/fromDoc, toDto, helper ID
  <entity>.repo.ts   # hàm đọc/ghi
```
**Chỉ feature sở hữu** collection (theo `specs-map.md`) được tạo repo cho collection đó. Feature khác cần dữ liệu đó thì import repo của owner. Nếu owner chưa có repo, tạo trong thư mục của **owner**.

## Ba kiểu dữ liệu

| Kiểu | Ở đâu | Dạng |
|---|---|---|
| `XxxDoc` | Firestore | snake_case, `Timestamp`, đúng như `database.md` |
| `XxxEntity` | repo ↔ service | camelCase, `Date`, **có** field nội bộ mà service cần (vd `respondedAt`, `pairKey`) |
| DTO (`Xxx` từ contracts) | service → client | camelCase, ISO string, **không có** field nội bộ |

`toXxxDoc` / `fromXxxDoc` đổi Entity ⇄ Doc. `toXxxDto(entity)` đổi Entity sang DTO. Repo không bao giờ trả `XxxDoc` hay `DocumentSnapshot` ra ngoài.

## Template

```ts
// friend-request.doc.ts
import 'server-only'
import { Timestamp } from 'firebase-admin/firestore'
import type { FriendRequest } from '../../contracts'

export const FRIEND_REQUESTS = 'friend_requests' // TBL-04

export type FriendRequestDoc = {
  from_uid: string
  to_uid: string
  channel: 'in_app' | 'link'
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'closed'
  closed_reason: 'became_friends' | 'blocked' | 'account_deleted' | null
  created_at: Timestamp
  responded_at: Timestamp | null
  expire_at: Timestamp | null
}

export type FriendRequestEntity = {
  id: string
  fromUid: string
  toUid: string
  channel: FriendRequestDoc['channel']
  status: FriendRequestDoc['status']
  closedReason: FriendRequestDoc['closed_reason']
  createdAt: Date
  respondedAt: Date | null
  expireAt: Date | null
}

export const tsOrNull = (d: Date | null) => (d ? Timestamp.fromDate(d) : null)

export function toFriendRequestDoc(e: Omit<FriendRequestEntity, 'id'>): FriendRequestDoc {
  return {
    from_uid: e.fromUid, to_uid: e.toUid, channel: e.channel, status: e.status,
    closed_reason: e.closedReason, created_at: Timestamp.fromDate(e.createdAt),
    responded_at: tsOrNull(e.respondedAt), expire_at: tsOrNull(e.expireAt),
  }
}

export function fromFriendRequestDoc(id: string, d: FriendRequestDoc): FriendRequestEntity {
  return {
    id, fromUid: d.from_uid, toUid: d.to_uid, channel: d.channel, status: d.status,
    closedReason: d.closed_reason ?? null, createdAt: d.created_at.toDate(),
    respondedAt: d.responded_at?.toDate() ?? null, expireAt: d.expire_at?.toDate() ?? null,
  }
}

export const toFriendRequestDto = (e: FriendRequestEntity): FriendRequest => ({
  id: e.id, fromUid: e.fromUid, toUid: e.toUid, channel: e.channel, status: e.status,
  closedReason: e.closedReason, createdAt: e.createdAt.toISOString(),
  respondedAt: e.respondedAt?.toISOString() ?? null,
})
```

```ts
// friend-request.repo.ts
import 'server-only'
import type { CollectionReference, Transaction } from 'firebase-admin/firestore'
import { adminDb } from '@/shared/server/firebase-admin'
import {
  FRIEND_REQUESTS, fromFriendRequestDoc, toFriendRequestDoc, tsOrNull,
  type FriendRequestDoc, type FriendRequestEntity,
} from './friend-request.doc'

const col = () => adminDb().collection(FRIEND_REQUESTS) as CollectionReference<FriendRequestDoc>

export async function getFriendRequest(id: string, tx?: Transaction): Promise<FriendRequestEntity | null> {
  const ref = col().doc(id)
  const snap = tx ? await tx.get(ref) : await ref.get()
  return snap.exists ? fromFriendRequestDoc(snap.id, snap.data()!) : null
}

/** idx_fr_pair: from_uid, to_uid, status, responded_at desc */
export async function findPendingPair(fromUid: string, toUid: string, tx?: Transaction) {
  const q = col().where('from_uid', '==', fromUid).where('to_uid', '==', toUid)
    .where('status', '==', 'pending').limit(1)
  const snap = tx ? await tx.get(q) : await q.get()
  return snap.empty ? null : fromFriendRequestDoc(snap.docs[0].id, snap.docs[0].data())
}

/** Trả id mới. Trong tx: chỉ gọi SAU khi đã đọc xong (luật của Firestore transaction). */
export function insertFriendRequest(data: Omit<FriendRequestEntity, 'id'>, tx: Transaction): string {
  const ref = col().doc()
  tx.create(ref, toFriendRequestDoc(data))
  return ref.id
}

export function updateFriendRequestStatus(
  id: string, patch: Pick<FriendRequestEntity, 'status' | 'respondedAt' | 'closedReason'>, tx: Transaction,
) {
  tx.update(col().doc(id), {
    status: patch.status,
    responded_at: tsOrNull(patch.respondedAt),
    closed_reason: patch.closedReason,
  })
}
```

Không dùng `withConverter`: kiểu `FirestoreDataConverter` của Admin SDK v13 quá rộng (`PartialWithFieldValue`) nên không giữ được type chặt. Thay vào đó cast `CollectionReference<XxxDoc>` một lần trong `col()` và dùng 2 hàm thuần `toXxxDoc` / `fromXxxDoc`.

## Quy tắc
- **Đọc** nhận `tx?: Transaction` (tuỳ chọn). **Ghi nhiều bản ghi liên quan** bắt buộc nhận `tx` hoặc `WriteBatch`; ghi đơn lẻ không cần atomic thì được tự `await ref.set()`.
- Field cập nhật một phần thì `tx.update` bằng tên snake_case. Không ghi cả `toXxxDoc(entity)` khi chỉ đổi vài field, vì sẽ ghi đè các field khác.
- Thời gian do **service** truyền vào (`Date`). Repo không tự gọi `new Date()`, để service test được bằng fake timer. Chỉ dùng `FieldValue.serverTimestamp()` khi không cần trả giá trị đó về client.
- ID có quy ước trong `database.md` (vd `friendships/{uidMin_uidMax}`, `blocks/{blocker_blocked}`) thì tạo bằng helper trong `*.doc.ts` (vd `friendshipId(a, b)`). Không ghép chuỗi ở service.
- Query nào cũng phải có index trong `database.md`, nếu không có thì ghi vào `## Issues` của plan để `fs-db-schema` thêm. Không tự thêm query trái index.
- Field `expire_at` (TTL) và `schema_version` đặt đúng như `database.md`.
- Không `throw AppError` ở repo. Không tìm thấy thì trả `null`; service quyết định mã lỗi.
- Không log dữ liệu người dùng (NFR-27).

## Checklist
- [ ] Đầu mọi file có `import 'server-only'`.
- [ ] Doc type khớp từng cột của TBL-xx (tên, kiểu, nullable, enum).
- [ ] Không export Doc type hay snapshot ra ngoài thư mục `repositories/`, trừ helper ID.
- [ ] `toXxxDto` loại hết field nội bộ; kiểu trả về là type từ contracts.
- [ ] `tsc` và `eslint src/features/<f>/server/repositories` pass.

## Handoff
Ghi vào `## 3. repository → Output`: danh sách hàm, chữ ký, index mà mỗi query dùng.
