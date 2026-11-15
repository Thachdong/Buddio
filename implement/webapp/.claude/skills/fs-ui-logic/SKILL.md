---
name: fs-ui-logic
description: Viết logic UI phía client cho một feature Buddio — hook 'use client' quản lý state màn hình, validate form bằng Zod dùng chung, gọi Server Action qua callAction, map mã lỗi sang UI state/toast, optimistic update, bọc listener realtime, timer hết hạn — trong src/features/<feature>/hooks/. Dùng khi orchestrator giao section "ui-logic", hoặc khi sửa hành vi màn hình (không phải giao diện). Không render JSX, không đọc DB trực tiếp.
---

# fs-ui-logic

Một trách nhiệm: **hành vi của màn hình**. Hook giữ state, quyết định gọi gì và khi nào, rồi đổi kết quả thành thứ UI chỉ việc hiển thị. Component trong `ui/` chỉ gọi hook và render.

Đọc trước:
- `../_shared/architecture.md` (mục 3: `hooks` được import `actions`/`client`/`hooks` cùng feature, `contracts`, `shared-client`, `lib`, `i18n`)
- `../_shared/conventions.md` (mục 3, 8)
- `node_modules/next/dist/docs/01-app/02-guides/forms.md` (useActionState, useOptimistic)

## Input
- Section `## 7. ui-logic` trong plan.md.
- Màn hình `../../specs/ui-ux/scr-xx-*.md`: các state, thao tác `SCR-xx.Ay`, copy, cách xử lý lỗi.
- Task, mục 3 "UI": đặc tả map lỗi → hiển thị.
- Bảng output của `fs-contract` (schema, `<op>Errors`), `fs-server-action` (tên action), `fs-client-data` (`subscribe…`).

## Output
`src/features/<feature>/hooks/use-<việc>.ts`. Mỗi hook phục vụ một thao tác hoặc một nguồn dữ liệu của màn hình.

## Mẫu 1: hook gọi action

```ts
'use client'
import { useState, useTransition } from 'react'
import { callAction } from '@/shared/client/call-action'
import { vi } from '@/shared/i18n/vi'
import { FriendRequestCreateSchema, type FriendRequest, type CreateFriendRequestError } from '../contracts'
import { createFriendRequestAction } from '../server/actions'

/** Kết quả UI sau khi gửi — UI chỉ switch trên `kind`. */
export type SendState =
  | { kind: 'idle' }
  | { kind: 'sent'; request: FriendRequest }
  | { kind: 'card'; card: 'self' | 'already_friends' | 'pending_sent' | 'not_found' }
  | { kind: 'cooldown'; retryAfter: string }
  | { kind: 'error'; message: string }

/** SCR-07.A2 · T-005 mục 3 "Gửi lời mời" */
export function useSendFriendRequest(onToast: (msg: string) => void) {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<SendState>({ kind: 'idle' })

  const send = (raw: { email: string }) => {
    const parsed = FriendRequestCreateSchema.safeParse(raw)          // validate client = cùng schema server
    if (!parsed.success) return setState({ kind: 'error', message: vi.errors.EMAIL_INVALID })

    startTransition(async () => {
      const r = await callAction(() => createFriendRequestAction(parsed.data))
      if (r.ok) {
        setState({ kind: 'sent', request: r.data })
        return onToast(vi.friendRequests.sent)
      }
      setState(mapSendError(r.error))
    })
  }
  return { state, pending, send }
}

function mapSendError(e: { code: string; message: string; details?: { retryAfter?: string }[] }): SendState {
  switch (e.code as CreateFriendRequestError | 'NETWORK_ERROR' | 'STALE_DEPLOY') {
    case 'CANNOT_INVITE_SELF': return { kind: 'card', card: 'self' }
    case 'ALREADY_FRIENDS': return { kind: 'card', card: 'already_friends' }
    case 'FRIEND_REQUEST_ALREADY_PENDING': return { kind: 'card', card: 'pending_sent' }
    case 'FRIEND_TARGET_NOT_FOUND': return { kind: 'card', card: 'not_found' }
    case 'REJECT_COOLDOWN': return { kind: 'cooldown', retryAfter: e.details?.[0]?.retryAfter ?? '' }
    case 'NETWORK_ERROR': return { kind: 'error', message: vi.common.networkError }
    case 'STALE_DEPLOY': return { kind: 'error', message: vi.common.staleDeploy }
    default: return { kind: 'error', message: e.message } // common codes: message đã là tiếng Việt từ server
  }
}
```

## Mẫu 2: hook bọc listener

```ts
'use client'
import { useEffect, useState } from 'react'
import { vi } from '@/shared/i18n/vi'
import { useAuthUser } from '@/shared/client/auth'
import type { FriendRequest } from '../contracts'
import { subscribeIncomingRequests } from '../client/friend-request.listener'

export type ListState<T> = { status: 'loading' } | { status: 'ready'; items: T[] } | { status: 'error'; message: string }

export function useIncomingRequests(): ListState<FriendRequest> {
  const user = useAuthUser()
  const [state, setState] = useState<ListState<FriendRequest>>({ status: 'loading' })
  useEffect(() => {
    if (!user) return
    return subscribeIncomingRequests(
      user.uid,
      (items) => setState({ status: 'ready', items }),
      () => setState({ status: 'error', message: vi.common.loadError }),
    )
  }, [user])
  return state
}
```

## Quy tắc

**State**
- Trả về **discriminated union** (`kind`/`status`) để UI dùng `switch`. Không trả nhiều boolean rời rạc (`isError`, `isEmpty`, …).
- State khởi tạo từ props SSR nếu có (`initialItems`), sau đó listener ghi đè.
- Input đổi thì xoá kết quả cũ, nếu spec màn hình yêu cầu (vd SCR-07 mục 5).

**Gọi server**
- Luôn qua `callAction(() => xxxAction(input))`. Không gọi action trần, không `fetch` route (trừ khi plan có transport `api-route`).
- Bọc trong `startTransition` hoặc dùng `useActionState` cho `<form action>`. `pending` lấy từ hook React, không tự quản bằng `useState`.
- Validate trước bằng **cùng schema** ở `contracts`. Không viết regex riêng.
- Client gọi action tuần tự. Thao tác nhiều bước thì xin một action gộp, không gọi `Promise.all` nhiều action.
- Optimistic (vd gửi tin nhắn): `useOptimistic`, và tạo `messageId` ở client (`crypto.randomUUID()`) để server idempotent (NFR-10). Lỗi thì rollback và hiện trạng thái "gửi lỗi" (FLOW-10a E3).

**Map lỗi**
- `switch` trên `<op>Errors` cộng `ClientErrorCode`. Mọi mã trong `<op>Errors` phải có nhánh riêng; `default` chỉ dành cho common code.
- `UNAUTHENTICATED`, `TOKEN_REVOKED`, `SESSION_EXPIRED` thì `router.replace('/login')`. `CONSENT_REQUIRED` thì về màn đồng ý (SCR-01). Gom vào hook dùng chung của feature `auth` khi có.
- Chuỗi hiển thị lấy từ `vi`. Hook thêm key mới vào `vi.<feature>.*` trong `src/shared/i18n/vi.ts`, copy đúng từ `scr-xx.md`.

**Realtime / thời gian**
- Effect subscribe phải trả `Unsubscribe`, dependency là `[uid, …]`.
- Dữ liệu có `expireAt` thì đặt `setTimeout` tới mốc hết hạn gần nhất để lọc khỏi state, và clear timer khi unmount.
- Giờ hiển thị đã format bằng `@/shared/lib/date`, theo múi giờ thiết bị.

## Checklist
- [ ] Dòng đầu là `'use client'`. Không import `firebase*` trực tiếp (dùng `client/`), không import `server/services|repositories`.
- [ ] Không có JSX trong `hooks/`.
- [ ] Mỗi hook có JSDoc ghi `SCR-xx.Ay` hoặc task.
- [ ] `switch` map lỗi bao đủ `<op>Errors`.
- [ ] `tsc` và `eslint src/features/<f>/hooks` pass.

## Handoff
Ghi vào `## 7. ui-logic → Output`: tên hook, kiểu state trả về, các hàm hành động. `fs-ui-component` render theo đúng các kiểu này.
