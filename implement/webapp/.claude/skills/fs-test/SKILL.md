---
name: fs-test
description: Viết test cho một task Buddio theo acceptance criteria — Vitest unit (contract, logger, mapper), Vitest emulator (service + transaction trên Firestore emulator, Security Rules bằng @firebase/rules-unit-testing), hook test, Playwright e2e mobile theo AC — và hạ tầng test (vitest.config, playwright.config, script npm, CI). Dùng khi orchestrator giao section "test", khi thêm AC, hoặc khi cần tái hiện bug bằng test trước khi sửa.
---

# fs-test

Một trách nhiệm: **chứng minh AC đúng bằng test**. Mỗi AC của task có ít nhất một test, và tên test chứa mã AC.

Đọc trước: `../_shared/conventions.md` (mục 10), task `../../backlog/tasks/T-xxx-*.md` mục 4 (AC) và mục 5 (Test), `../../backlog/backlog.md` mục DoD.

## Input
- Section `## 10. test` và bảng `## AC map` trong plan.
- Handoff của các worker: nhánh lỗi của service, case allow/deny của rules, fixture seed, state của hook.

## Hạ tầng (tạo nếu chưa có; T-001)

| File | Nội dung |
|---|---|
| `vitest.config.ts` | 2 project: `unit` (env `node`, `src/**/*.test.ts` trừ `*.emu.test.ts`) và `emulator` (`**/*.emu.test.ts`, `firebase/tests/**`, `pool: 'forks'`, chạy tuần tự). Alias `@` → `src`. Mock `server-only`/`client-only` thành module rỗng. |
| `playwright.config.ts` | project `mobile` viewport 375×812, `baseURL http://localhost:3000`, `webServer: npm run dev`. |
| `package.json` scripts | `emulators` = `firebase emulators:start --import=.emulator-data --export-on-exit`, `test:unit` = `vitest run --project unit`, `test:emulator` = `vitest run --project emulator`, `test:e2e` = `playwright test`, `test` = `firebase emulators:exec "npm run test:unit && npm run test:emulator && npm run test:e2e"`, `typecheck` = `next typegen && tsc --noEmit`, `seed`. |
| `.github/workflows/ci.yml` | Node 22, Java 21, cache npm + `~/.cache/firebase/emulators`; lint, typecheck, rồi `npm test`. |

Dev dependency cần (cài bằng `npm i -D -E`): `vitest`, `@firebase/rules-unit-testing`, `@playwright/test`, `firebase-tools`; nếu test hook thì thêm `@testing-library/react` và `jsdom`.

## Loại test và vị trí

| Loại | File | Cách viết |
|---|---|---|
| Contract | `features/<f>/contracts/schemas.test.ts` | Input chuẩn hoá (trim/lowercase) và message mã lỗi (`EMAIL_INVALID`). |
| Service | `features/<f>/server/services/<x>.service.emu.test.ts` | Gọi **thẳng** hàm service với `ctx = { uid, email }`. Seed bằng Admin SDK. Kiểm cả kết quả trả về **và** document trong DB. Mỗi mã lỗi trong `<op>Errors` có một test. |
| Rules | `firebase/tests/<tbl>.rules.emu.test.ts` | `initializeTestEnvironment({ projectId: 'demo-buddio', firestore: { rules } })`. Với mỗi case: `assertSucceeds` cho người được đọc, `assertFails` cho người lạ, và `assertFails` cho **mọi** thao tác ghi. |
| Hook | `features/<f>/hooks/<x>.test.ts` | Mock action module (`vi.mock('../server/actions')`). Kiểm state chuyển đúng theo từng mã lỗi. |
| Action / route | `*.emu.test.ts` | Chỉ khi có logic transport đặc biệt (cookie, header). Route thì gọi `POST(new Request(...), { params: Promise.resolve({...}) })`. |
| E2E | `e2e/<task-id>.spec.ts` | Một `test()` cho mỗi AC có UI, tên `AC-n: …`. Seed qua script trước khi chạy. Đăng nhập bằng Auth emulator qua helper `e2e/support/auth.ts` (T-002 tạo). |

## Mẫu service test

```ts
// friend-request.service.emu.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adminDb } from '@/shared/server/firebase-admin'
import { AppError } from '@/shared/server/errors'
import { createFriendRequest } from './friend-request.service'
import { clearFirestore, seedUsers } from '@/test/emulator'   // helper dùng chung, tạo ở lần đầu

const A = { uid: 'u_a', email: 'a@test.local' }

describe('createFriendRequest', () => {
  beforeEach(async () => { await clearFirestore(); await seedUsers('T-005') })

  it('AC-3: gửi tới B hợp lệ → tạo pending + notification', async () => {
    const fr = await createFriendRequest(A, { email: 'b@test.local' })
    expect(fr.status).toBe('pending')
    const n = await adminDb().collection('users/u_b/notifications').get()
    expect(n.docs[0].data().type).toBe('friend_request_received')
  })

  it('REJECT_COOLDOWN có retryAfter', async () => {
    vi.setSystemTime(new Date('2026-11-12T00:00:00Z'))
    await expect(createFriendRequest(A, { email: 'c@test.local' }))
      .rejects.toMatchObject({ code: 'REJECT_COOLDOWN', details: [{ retryAfter: expect.any(String) }] } satisfies Partial<AppError>)
  })
})
```

`src/test/emulator.ts` chứa `clearFirestore()` (gọi `DELETE http://127.0.0.1:8080/emulator/v1/projects/demo-buddio/databases/(default)/documents`), `clearAuth()`, và `seedUsers(fixture)` dùng lại `scripts/seed/fixtures`.

## Quy tắc
- **Mỗi AC phải có ít nhất 1 test** và tên test bắt đầu bằng `AC-n:`. AC chỉ kiểm được bằng tay (theo bảng "Test tay" trong task) thì ghi rõ trong AC map, không bỏ trống.
- Test phải **độc lập**: tự dọn emulator ở `beforeEach`, không phụ thuộc thứ tự chạy.
- Thời gian dùng `vi.setSystemTime` hoặc fake timer, không `sleep`.
- Không mock Firestore cho service test. Chạy trên emulator để bắt lỗi transaction và index thật.
- Ràng buộc chống lộ thông tin (BR-04, NFR-15) phải có test so sánh **body giống hệt** giữa các lý do `not_found`.
- Test e2e chọn phần tử theo role/label (`getByRole('button', { name: vi.… })`), không theo class CSS.
- Test thất bại vì code sai thì **không sửa test cho khớp code**. Ghi vào `## Issues`, chỉ ra worker phụ trách.

## Checklist
- [ ] Bảng AC map đầy đủ: mỗi AC có file test + tên test, hoặc ghi "test tay".
- [ ] Đủ test cho mọi nhánh lỗi của service, mọi case allow/deny của rules.
- [ ] `npm test` (emulators:exec) pass trên máy local.

## Handoff
Cập nhật `## AC map` (AC | test | status) và `## 10. test → Output` (file test, lệnh chạy, kết quả).
