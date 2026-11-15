---
name: fs-ui-component
description: Viết component giao diện cho một feature Buddio — shadcn/ui (Radix) + Tailwind 4, mobile-first 360px, đủ state loading/empty/error, a11y, chuỗi từ từ điển vi — trong src/features/<feature>/ui/ (và primitive chung ở src/shared/ui/). Dùng khi orchestrator giao section "ui", hoặc khi sửa giao diện/bố cục/copy của màn hình. Không chứa logic nghiệp vụ, không gọi server.
---

# fs-ui-component

Một trách nhiệm: **hiển thị**. Component nhận state từ hook (hoặc từ props SSR) rồi render. Mọi quyết định "làm gì" đã nằm trong hook.

Đọc trước:
- `../_shared/architecture.md` (mục 3: `ui` được import `ui`, `hooks` cùng feature, `contracts`, `shared-ui`, `lib`, `i18n`)
- `../_shared/conventions.md` (mục 8)
- `node_modules/next/dist/docs/01-app/02-guides/server-and-client-boundary.md`

## Input
- Section `## 8. ui` trong plan.md.
- `../../specs/ui-ux/scr-xx-*.md`: layout, thành phần, state, copy, hành vi.
- `../../specs/ui-ux/wireframe.md`: layout chung (LAYOUT, thanh tab, header).
- Output của `fs-ui-logic`: hook và kiểu state.

## Output
```
src/features/<feature>/ui/
  <screen>-screen.tsx       # component gốc của màn (client nếu có tương tác), ráp các phần
  <part>.tsx                # khối con, chỉ nhận props
src/shared/ui/<primitive>.tsx  # chỉ khi cần thêm primitive shadcn
```

## Hai loại component

| Loại | Có `'use client'` | Gọi hook | Ví dụ |
|---|---|---|---|
| **Screen / connected** | Có (khi dùng hook) | Có, chỉ hook của **cùng feature** | `AddFriendScreen` dùng `useEmailLookup`, `useSendFriendRequest` |
| **View** | Không, trừ khi cần state UI thuần (mở/đóng) | Không | `EmailLookupCard({ state, onSend })` |

View nhận dữ liệu và callback qua props, nên Storybook/test render được mà không cần server.

## Template

```tsx
// add-friend-screen.tsx
'use client'
import { useEmailLookup } from '../hooks/use-email-lookup'
import { useSendFriendRequest } from '../hooks/use-send-friend-request'
import { EmailLookupForm } from './email-lookup-form'
import { EmailLookupCard } from './email-lookup-card'
import { toast } from 'sonner'

export function AddFriendScreen() {
  const lookup = useEmailLookup()
  const send = useSendFriendRequest(toast.success)
  return (
    <div className="flex flex-col gap-4 p-4">
      <EmailLookupForm pending={lookup.pending} onSubmit={lookup.search} onChange={lookup.reset} />
      <EmailLookupCard result={lookup.state} sendState={send.state} sending={send.pending} onSend={send.send} />
    </div>
  )
}
```

```tsx
// email-lookup-card.tsx  — view, không 'use client'
import { vi } from '@/shared/i18n/vi'
import { Button } from '@/shared/ui/button'
import type { LookupState } from '../hooks/use-email-lookup'

export function EmailLookupCard({ result, sending, onSend }: { result: LookupState; sending: boolean; onSend: () => void }) {
  switch (result.kind) {
    case 'idle': return null
    case 'loading': return <CardSkeleton />
    case 'not_found': return <NotFoundCard />            // BR-04: MỘT component, không nhận lý do
    case 'found': return (/* ảnh + tên + <Button disabled={sending} onClick={onSend}>{vi.friendRequests.send}</Button> */)
    // … đủ mọi kind
  }
}
```

## Quy tắc

**Ranh giới**
- Không `fetch`, không gọi action, không import `firebase*` hay `server/*`. Eslint chặn.
- Không đặt logic trong JSX: không có `if` nghiệp vụ hay map mã lỗi. Chỉ `switch` trên `kind`/`status` mà hook trả về.
- Đặt `'use client'` ở **entry** của subtree tương tác (screen), không rải lên mọi file con.
- Truyền Server Component vào Client Component qua `children`/slot, không import ngược.
- Compound component (`Menu.Item`) không dùng được qua ranh giới server→client. Export các phần thành named export.

**Giao diện**
- Primitive lấy từ `@/shared/ui`. Thiếu thì chạy `npx shadcn@latest add <name>` (alias đã trỏ vào `@/shared/ui`), rồi đổi import `cn` nếu cần. Không tự viết lại primitive mà shadcn đã có.
- Toast dùng `sonner` (`npx shadcn@latest add sonner`). `<Toaster />` đặt một lần ở root layout (`fs-route-page`).
- Tailwind 4 với token từ `globals.css` (`bg-background`, `text-muted-foreground`…). Không hardcode màu hex.
- **Mobile-first:** viết cho 360px trước, rồi mở rộng bằng `sm:`/`md:`. Vùng chạm ≥ 44px. Màn con toàn màn hình thì ẩn tab bar theo spec.
- Icon dùng `lucide-react`.

**Nội dung**
- Mọi chữ hiển thị lấy từ `vi.<feature>.*`. Key nào chưa có thì thêm vào `src/shared/i18n/vi.ts`, copy **đúng nguyên văn** từ `scr-xx.md`.
- Ngày giờ dùng `formatDateTime` ở `@/shared/lib/date`.
- Spec có ràng buộc giống BR-04 (vd thẻ "không tìm thấy" phải giống hệt nhau) thì làm **một** component không nhận tham số lý do.

**Trạng thái và a11y**
- Đủ các state spec liệt kê: loading (skeleton hoặc spinner tại nút), empty, error (kèm nút thử lại nếu spec có), success.
- Input có `<label>` (hoặc `aria-label`). Lỗi hiển thị bằng `aria-live="polite"`. Nút loading có `aria-busy`.
- Điều hướng được bằng bàn phím; focus rõ; Enter submit form.

## Checklist
- [ ] Không có chuỗi tiếng Việt hardcode trong `.tsx` (grep `[À-ỹ]`).
- [ ] `switch` render bao đủ mọi `kind`/`status` của hook.
- [ ] Không import ngoài danh sách cho phép (`eslint` pass).
- [ ] Đã xem ở chiều rộng 360px (dùng skill `run` hoặc Playwright screenshot nếu có).
- [ ] `tsc` và `eslint src/features/<f>/ui src/shared/ui` pass.

## Handoff
Ghi vào `## 8. ui → Output`: component screen đã export, props, và các key `vi` đã thêm. `fs-route-page` dùng phần này để ráp vào route.
