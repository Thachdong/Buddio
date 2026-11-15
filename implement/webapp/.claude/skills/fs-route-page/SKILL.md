---
name: fs-route-page
description: Ráp route Next.js 16 App Router cho Buddio — page/layout/loading/error/not-found trong src/app, route group (public)/(tabs), Suspense theo cacheComponents, đọc session + gọi queries ở Server Component, truyền DTO xuống screen của feature, proxy.ts redirect lạc quan. Dùng khi orchestrator giao section "route", khi thêm/đổi URL, layout, tab bar, hoặc gặp lỗi blocking-route/Suspense. Không chứa logic nghiệp vụ hay UI chi tiết.
---

# fs-route-page

Một trách nhiệm: **routing và ráp nối**. File trong `src/app/` mỏng: lấy params và session, gọi query, render screen của feature trong `<Suspense>`.

Đọc trước:
- `../_shared/architecture.md` (mục 3: `app-page` được import `ui`, `queries`, `shared-ui`, `shared-server`, `i18n`, `lib`; mục 6: lưu ý Next 16 / cacheComponents)
- Docs Next: `01-getting-started/03-layouts-and-pages.md`, `08-caching.md`, `10-error-handling.md`, `02-guides/authentication-with-cache-components.md`, `03-api-reference/03-file-conventions/{page,layout,loading,error,proxy}.md`

## Input
- Section `## 9. route` trong plan.md.
- `../../specs/ui-ux/wireframe.md`: sơ đồ điều hướng, URL, LAYOUT.
- `scr-xx.md`: màn này là public hay cần đăng nhập, có tab bar không.
- Output của `fs-ui-component` (screen) và `fs-service` (queries, nếu có SSR).

## Cấu trúc route

```
src/app/
  layout.tsx                 # html/body, font, <Toaster/>, AuthProvider (client) — KHÔNG đọc session
  (public)/                  # không cần đăng nhập: login, invite/[token]
    login/page.tsx
    invite/[token]/page.tsx
  (tabs)/                    # cần đăng nhập + thanh tab
    layout.tsx               # tab bar tĩnh + <Suspense><RequireMember/></Suspense>
    rooms/page.tsx  friends/page.tsx  notifications/page.tsx  settings/page.tsx
  (full)/                    # cần đăng nhập, màn con toàn màn hình (ẩn tab bar)
    friends/add/page.tsx  rooms/[roomId]/page.tsx  …
  error.tsx  not-found.tsx
src/proxy.ts                 # thiếu cookie __session ở route cần đăng nhập → redirect /login (chỉ lạc quan)
```
Đường dẫn thật lấy theo `wireframe.md`. Cây trên chỉ là quy ước nhóm.

## Template

```tsx
// (full)/friends/add/page.tsx — màn chỉ có client realtime / action, không cần SSR data
import { AddFriendScreen } from '@/features/friend-requests/ui/add-friend-screen'

export default function Page() {
  return <AddFriendScreen />
}
```

```tsx
// (tabs)/friends/page.tsx — có SSR data ban đầu, sau đó listener tiếp quản
import { Suspense } from 'react'
import { getOptionalIdentity } from '@/shared/server/auth'
import { listFriends } from '@/features/friends/server/queries/friend.query'
import { FriendsScreen, FriendsSkeleton } from '@/features/friends/ui/friends-screen'

export default function Page() {
  return (
    <Suspense fallback={<FriendsSkeleton />}>
      <FriendsData />
    </Suspense>
  )
}

async function FriendsData() {
  const me = await getOptionalIdentity()            // đọc cookie → phải nằm trong <Suspense>
  const initial = me ? await listFriends(me) : []
  return <FriendsScreen initialItems={initial} />  // DTO đã lọc, serializable
}
```

```tsx
// (full)/rooms/[roomId]/page.tsx — dynamic params
export default function Page(props: PageProps<'/rooms/[roomId]'>) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatRoom params={props.params} />
    </Suspense>
  )
}

async function ChatRoom({ params }: { params: PageProps<'/rooms/[roomId]'>['params'] }) {
  const { roomId } = await params   // await params → phải trong <Suspense>
  return <ChatRoomScreen roomId={roomId} />
}
```

## Quy tắc

**cacheComponents (bật trong `next.config.ts`)**
- Mọi chỗ đọc `cookies()`/`headers()`/`getOptionalIdentity()`, `await params`/`searchParams`, `new Date()` hay `Math.random()` phải nằm **trong `<Suspense>`**. Nếu không, build báo lỗi *blocking-route*. Phần tĩnh (header, tab bar) để ngoài Suspense để vào static shell.
- `new Date()` trong Server Component thì gọi `await connection()` trước.
- Không dùng `export const dynamic = …` hay route segment config cũ. Theo docs `08-caching.md`.

**Auth**
- `proxy.ts` chỉ kiểm **có** cookie `__session` hay không, rồi redirect. Không verify, vì proxy không phải ranh giới bảo mật.
- Layout `(tabs)`/`(full)` có `<Suspense><RequireMember/></Suspense>`: `getOptionalIdentity()` trả null thì `redirect('/login')`. Kiểm thật vẫn nằm ở mỗi action và query.
- Page không gọi `requireAuth` (hàm đó có thể xoá cookie, điều không được phép khi đang render).

**Data**
- Page chỉ gọi `queries` (server) và truyền **DTO** xuống. Không gọi `services`/`repositories`, không truyền document thô.
- Màn hình realtime: SSR chỉ cần thiết khi spec yêu cầu hiển thị nhanh (NFR-06). Còn lại để screen tự subscribe.
- Không truyền function từ Server Component xuống Client Component, trừ Server Action (tên kết thúc bằng `Action`).

**File convention**
- `loading.tsx` cho skeleton cấp route; `error.tsx` (`'use client'`) dùng `vi.common` và có nút thử lại; `not-found.tsx` cho `ROOM_NOT_FOUND`/`USER_NOT_FOUND` khi page gọi `notFound()`.
- `metadata` title lấy từ `vi`.
- Type `PageProps<'/route'>` và `LayoutProps<'/route'>` do Next sinh: chạy `npx next typegen` sau khi thêm route.

## Checklist
- [ ] Mỗi route trong plan khớp URL ở `wireframe.md`.
- [ ] Mọi chỗ đọc dữ liệu runtime đều nằm trong `<Suspense>` với fallback skeleton.
- [ ] Page không có logic: chỉ lấy params/session, gọi query, render screen.
- [ ] `npx next typegen && npx tsc --noEmit`, `eslint src/app`, và **`npm run build`** pass (build mới bắt được lỗi blocking-route).

## Handoff
Ghi vào `## 9. route → Output`: URL, file, màn public hay cần đăng nhập, có SSR data không.
