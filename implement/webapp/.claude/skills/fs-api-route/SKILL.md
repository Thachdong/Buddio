---
name: fs-api-route
description: Viết Route Handler (src/app/api/**/route.ts) cho một operation Buddio bằng runRoute — chỉ khi thật sự cần endpoint HTTP (prompt yêu cầu API route/REST/webhook/client ngoài Next, hoặc operation như getHealth phục vụ monitoring). Đúng path/method/status/body theo specs/api-contract.yml, gọi cùng service với Server Action. Không dùng làm mặc định cho UI — mặc định là fs-server-action.
---

# fs-api-route

Một trách nhiệm: **expose service qua HTTP** khi có lý do. Route cũng là adapter mỏng như action, chỉ khác giao thức.

Đọc trước:
- `../_shared/architecture.md` (mục 1 nguyên tắc 4; mục 3: `app-api` được import `services`, `contracts`, `shared-server`)
- `../_shared/conventions.md` (mục 5)
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` và `03-api-reference/03-file-conventions/route.md`

## Khi nào dùng (orchestrator đã quyết, ghi trong `Meta.Transport` của plan)
| Trường hợp | Ví dụ |
|---|---|
| Prompt của user nói rõ API route / REST / endpoint / webhook | "làm API route cho tạo phòng" |
| Gọi từ ngoài Next (monitoring, mobile app, cron, webhook bên thứ ba) | `getHealth` (`GET /api/health`) |
| Task ghi `POST /api/...` **chỉ vì** ADR-03 cũ | **Không** dùng route, dùng action |

## Input
- Section `## 5. transport` trong plan (transport = `api-route`).
- Operation trong `api-contract.yml`: `path`, method, `parameters`, `requestBody`, status 2xx, các response lỗi, header đặc biệt (`Retry-After`).
- Output của `fs-contract` và `fs-service`.

## Output
`src/app/api/<path theo contract>/route.ts`. Path param `{requestId}` thành thư mục `[requestId]`. Path trong contract **không** có tiền tố `/api` (server url đã có), nên thư mục là `src/app/api/...`.

## Template

```ts
// src/app/api/friend-requests/[requestId]/accept/route.ts
import { runRoute } from '@/shared/server/route'
import { FriendRequestAcceptedSchema, FriendRequestIdSchema } from '@/features/friend-requests/contracts'
import { acceptFriendRequest } from '@/features/friend-requests/server/services/friend-request.service'

export const POST = runRoute(
  { name: 'acceptFriendRequest', auth: 'member', schema: FriendRequestIdSchema, output: FriendRequestAcceptedSchema, status: 200 },
  (data, ctx) => acceptFriendRequest(ctx, data),
)
```

```ts
// src/app/api/health/route.ts — getHealth: public, không đụng DB nghiệp vụ
import { runRoute } from '@/shared/server/route'

export const GET = runRoute({ name: 'getHealth', auth: 'public' }, async () => ({ status: 'ok' as const }))
```

## Quy tắc
- Method export trùng method trong contract (`GET`, `POST`, `PATCH`, `DELETE`). Status thành công đúng như contract (`201` khi tạo, `204` thì không có body).
- Input = JSON body cộng path params (gộp trong `runRoute`). Query string (nếu contract có) đọc trong handler qua `req` rồi gộp vào trước khi validate. Nếu gặp trường hợp này, sửa `runRoute` để nhận `input(req, params)` thay vì làm riêng từng route.
- Auth: cookie `__session` **hoặc** `Authorization: Bearer <idToken>` (`runRoute` tự xử lý). Mức auth giống bảng trong `fs-server-action`.
- Header đặc biệt (`EMAIL_LOOKUP_RATE_LIMITED` cần `Retry-After`): bọc response trả về từ `runRoute`, hoặc mở rộng `runRoute` bằng option `headers(error)`. Không tự viết `try/catch` riêng.
- Không có logic ngoài việc gọi service. Nếu đã có action cho operation này, cả hai phải dùng **cùng** service và cùng schema.
- Với `cacheComponents`, route handler GET mặc định động. Không dùng `export const dynamic`.
- Log request (method, path, status, ms) qua `logger`. Không log body hay header `Authorization`.

## Checklist
- [ ] Path, method, status khớp `api-contract.yml`.
- [ ] Body lỗi đúng schema `Error` (`{ code, message, details? }`) và status theo `ERROR_HTTP_STATUS`.
- [ ] `eslint src/app/api` pass (boundaries chặn route → repositories).
- [ ] Thử bằng `curl -i` trên dev server (hoặc test gọi handler trực tiếp, xem `fs-test`).

## Handoff
Ghi vào `## 5. transport → Output`: bảng `operationId | METHOD path | auth | status`.
