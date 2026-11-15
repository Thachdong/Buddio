---
name: fs-verify
description: Kiểm tra cuối cho một task hoặc thay đổi trong webapp Buddio — chạy typecheck, lint (boundaries), build, test, quét vi phạm kiến trúc (chuỗi hardcode, client ghi Firestore, thiếu server-only/'use server', log dữ liệu nhạy cảm), đối chiếu AC — rồi báo lỗi kèm worker skill phụ trách. Dùng ở bước cuối của fs-build-feature / fs-change, hoặc khi user hỏi "đã xong chưa / có vi phạm gì không". Chỉ báo cáo, không tự sửa code.
---

# fs-verify

Một trách nhiệm: **xác nhận đã xong và đúng kiến trúc**. Skill này **không sửa code**. Nó trả danh sách lỗi, mỗi lỗi gán cho đúng worker skill để orchestrator giao việc sửa.

Đọc trước: `../_shared/architecture.md`, `../_shared/conventions.md`.

## Input
- `.work/<task>/plan.md`: các file đã tạo (Output của từng section) và `## AC map`.
- `git diff --name-only` (thay đổi so với base).

## Các bước (chạy trong `implement/webapp`)

| # | Kiểm | Lệnh / cách | Fail → worker |
|---|---|---|---|
| 1 | Type | `npx next typegen && npx tsc --noEmit` | worker sở hữu file lỗi |
| 2 | Lint + boundaries | `npx eslint .` | worker sở hữu file lỗi |
| 3 | Build (bắt blocking-route, lỗi ranh giới server/client) | `npm run build` | `fs-route-page` / `fs-ui-component` |
| 4 | Test | `npm test` (nếu emulator chưa sẵn thì chạy `npm run test:unit` và ghi rõ bước nào bị bỏ) | theo file test fail: `fs-test` nếu test sai, worker của code nếu code sai |
| 5 | Quét kiến trúc | grep, xem bảng dưới | theo bảng |
| 6 | AC map | mọi AC có test pass hoặc ghi "test tay" | `fs-test` |
| 7 | Contract khớp | mỗi operation trong plan có schema ở `contracts/` và action/route | `fs-contract` / `fs-server-action` |

### Quét kiến trúc (bước 5), chỉ trên file đã thay đổi

| Vi phạm | Cách phát hiện | Worker |
|---|---|---|
| Chuỗi tiếng Việt hardcode trong UI | `grep -nP '[À-ỹ]' src/features/*/ui src/app --include=*.tsx` (trừ comment) | `fs-ui-component` |
| Client ghi Firestore | `grep -nE 'setDoc\|addDoc\|updateDoc\|deleteDoc\|writeBatch\|runTransaction' src/features/*/client src/features/*/hooks` | `fs-client-data` |
| Thiếu `server-only` | file trong `server/services|queries|repositories`, `shared/server` mà dòng đầu không phải `import 'server-only'` | worker tương ứng |
| Thiếu `client-only` | file trong `client/`, `shared/client/firebase.ts` | `fs-client-data` |
| `actions.ts` sai dạng | dòng đầu không phải `'use server'`, có `export const`, hoặc gọi `runAction` mà thiếu `output:` | `fs-server-action` |
| Service import Next | `grep -n "from 'next/" src/features/*/server/services src/features/*/server/queries` | `fs-service` |
| Log dữ liệu nhạy cảm | `console.log` ngoài `shared/server/logger.ts`; `logger.*(` có `email`/`text` trong **message** | worker sở hữu |
| Uid lấy từ input | service/action đọc `input.uid` hoặc `data.uid` để làm định danh người thực hiện | `fs-service` |
| Đọc runtime ngoài Suspense | build ở bước 3 báo *blocking-route* | `fs-route-page` |
| Query không có index | so `where`/`orderBy` trong repo và listener với `firebase/firestore.indexes.json` | `fs-db-schema` |

## Output: báo cáo

Ghi vào `## 11. verify` trong plan và trả về cho orchestrator:

```markdown
## 11. verify — <PASS | FAIL> (<ngày giờ>)
| # | Kiểm | Kết quả |
|---|---|---|
| 1 | tsc | ✅ |
| 2 | eslint | ❌ 2 lỗi |
| … |

### Lỗi cần sửa
| File:line | Vấn đề | Worker |
|---|---|---|
| src/features/friend-requests/ui/email-lookup-card.tsx:12 | chuỗi "Gửi lời mời" hardcode | fs-ui-component |

### Bỏ qua / chưa chạy
- test:e2e — emulator chưa khởi động (lý do)
```

## Quy tắc
- Báo **trung thực**. Bước nào không chạy được thì ghi "chưa chạy" kèm lý do, không ghi pass.
- Trích dòng lỗi ngắn nhất đủ hiểu. Không dán cả log.
- Không sửa code, không sửa test, không tắt rule eslint.
- PASS chỉ khi bước 1–3 và 5–7 đều sạch, bước 4 pass (hoặc phần bị bỏ có lý do được orchestrator chấp nhận).
