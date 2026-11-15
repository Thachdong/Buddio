---
name: fs-client-data
description: Viết tầng đọc dữ liệu realtime phía client cho một feature Buddio — Firestore onSnapshot / RTDB onValue bằng Firebase JS SDK, mapper document → DTO, lọc hết hạn, presence/typing (RTDB, ghi trực tiếp node của mình) — trong src/features/<feature>/client/. Dùng khi màn hình cần dữ liệu cập nhật realtime (danh sách phòng, tin nhắn, bạn bè, lời mời, thông báo, online) hoặc khi orchestrator giao section "client-data". Không ghi Firestore.
---

# fs-client-data

Một trách nhiệm: **đọc realtime** từ Firestore và RTDB ở trình duyệt, rồi trả về DTO. Theo ADR-03, client **không ghi** Firestore. Ngoại lệ duy nhất là RTDB `status/{uid}` và `typing/{roomId}/{uid}` (ADR-05).

Đọc trước:
- `../_shared/architecture.md` (mục 3: `client` chỉ được import `client` cùng feature, `contracts`, `shared-client`, `lib`; mục 5: luồng đọc realtime)
- `../_shared/conventions.md` (mục 1: tên `subscribe<Entity>`)

## Input
- Section `## 6. client-data` trong plan.md.
- Kênh `FS` / `RTDB` trong bảng thao tác ở `../../specs/ui-ux/wireframe.md` mục 4: màn nào đọc gì.
- `../../specs/database.md`: cột của collection, index, và **rules đọc** (query phải nằm gọn trong phạm vi rules cho phép).
- Type DTO từ `fs-contract`.

## Output
```
src/features/<feature>/client/
  <entity>.mapper.ts     # kiểu document phía client + fromSnapshot → DTO
  <entity>.listener.ts   # subscribe<Entity>(…, onData, onError): Unsubscribe
```
Hook bọc listener (`use<Entity>`) **không** đặt ở đây; nó thuộc `fs-ui-logic` trong `hooks/`.

## Template

```ts
// friend-request.mapper.ts
import 'client-only'
import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'
import type { FriendRequest } from '../contracts'

type FriendRequestClientDoc = {
  from_uid: string; to_uid: string; channel: FriendRequest['channel']; status: FriendRequest['status']
  closed_reason?: FriendRequest['closedReason']; created_at: Timestamp; responded_at?: Timestamp | null
}

export function friendRequestFromSnapshot(s: QueryDocumentSnapshot<DocumentData>): FriendRequest {
  const d = s.data() as FriendRequestClientDoc
  return {
    id: s.id, fromUid: d.from_uid, toUid: d.to_uid, channel: d.channel, status: d.status,
    closedReason: d.closed_reason ?? null,
    createdAt: d.created_at.toDate().toISOString(),
    respondedAt: d.responded_at?.toDate().toISOString() ?? null,
  }
}
```

```ts
// friend-request.listener.ts
import 'client-only'
import { collection, limit, onSnapshot, orderBy, query, where, type Unsubscribe } from 'firebase/firestore'
import { clientDb } from '@/shared/client/firebase'
import type { FriendRequest } from '../contracts'
import { friendRequestFromSnapshot } from './friend-request.mapper'

/** SCR-09 · idx_fr_to (to_uid, status, created_at desc) · rules: to_uid == auth.uid */
export function subscribeIncomingRequests(
  uid: string,
  onData: (items: FriendRequest[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(clientDb(), 'friend_requests'),
    where('to_uid', '==', uid), where('status', '==', 'pending'),
    orderBy('created_at', 'desc'), limit(100),
  )
  return onSnapshot(q, (snap) => onData(snap.docs.map(friendRequestFromSnapshot)), onError)
}
```

## Quy tắc

**Query**
- Query phải nằm trong phạm vi Security Rules cho phép. Rules **không lọc** dữ liệu: query vượt phạm vi sẽ bị từ chối cả query (`permission-denied`), nên phải có `where` theo đúng trường mà rules kiểm (`to_uid == uid`, `uid in member_uids`…).
- Mỗi query phải khớp một index trong `database.md`. Thiếu index thì ghi vào `## Issues` cho `fs-db-schema`.
- Luôn có `limit`. Phân trang tin nhắn dùng `startAfter` cursor, không dùng offset.
- `onError` bắt buộc. `permission-denied` thường là mất quyền (bị kick, bị chặn); hook sẽ map lỗi này sang UI state.

**Mapper**
- Phía client có kiểu doc riêng (Timestamp của `firebase/firestore`, không dùng chung với server). Chỉ map các field mà rules cho đọc **và** DTO cần.
- Kết quả trả ra phải đúng type DTO của contracts, để UI không phân biệt dữ liệu đến từ SSR hay từ listener.
- Profile người khác thì đọc `profiles/{uid}` bằng `get` (rules cấm `list`), cache theo uid trong hook.

**Hết hạn (ADR-09, NFR-19)**
- Tin nhắn và thông báo có `expire_at` thì query thêm `where('expire_at', '>', Timestamp.now())` **và** hook đặt timer để ẩn đúng lúc hết hạn (≤ 1 phút). Xem `fs-ui-logic`.

**RTDB presence / typing (ADR-05)**
- `status/{uid}`: lúc đăng nhập set `online` và `onDisconnect().set(offline)`. Chỉ ghi node của chính mình.
- `typing/{roomId}/{uid}`: set khi gõ, remove sau 3s không gõ, và `onDisconnect().remove()`.
- Lọc hiển thị theo quyền (BR-25, `show_online`) ở hook, không tin dữ liệu RTDB thô.

**Uid hiện tại**
- Listener nhận `uid` qua tham số, không tự đọc auth. Hook lấy uid từ `useAuthUser()` ở `@/shared/client/auth` (tạo ở T-002). Nếu chưa có, ghi vào `## Issues`.

## Checklist
- [ ] Dòng đầu là `import 'client-only'`. Không import `firebase-admin`, `next/*`, hay `server/*`.
- [ ] Không có `setDoc`, `addDoc`, `updateDoc`, `deleteDoc` lên Firestore (eslint không bắt được, tự kiểm bằng grep).
- [ ] Mỗi listener có JSDoc ghi SCR, index và rules đọc dùng.
- [ ] Trả `Unsubscribe`; có `limit`; có `onError`.
- [ ] `tsc` và `eslint src/features/<f>/client` pass.

## Handoff
Ghi vào `## 6. client-data → Output`: chữ ký `subscribe…`, index và rule mà mỗi query dựa vào.
