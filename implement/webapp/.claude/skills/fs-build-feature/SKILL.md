---
name: fs-build-feature
description: Điều phối xây một feature/task mới của webapp Buddio từ đầu đến cuối — đọc task backlog (T-xxx) hoặc prompt, chọn transport (mặc định Server Action, API route chỉ khi được yêu cầu), lập handoff plan, gọi lần lượt các worker skill fs-contract → fs-db-schema → fs-repository → fs-service → fs-server-action/fs-api-route → fs-client-data → fs-ui-logic → fs-ui-component → fs-route-page → fs-test → fs-verify, lặp sửa đến khi verify PASS. Dùng khi user nói "làm T-005", "implement task…", "build feature…". Không tự viết code của tầng nào.
---

# fs-build-feature

Vai trò: **điều phối**. Skill này đọc spec, lập plan, giao việc cho worker theo đúng thứ tự, theo dõi kết quả. **Không tự viết code của tầng nào**. Mọi file code đều do worker tạo ra.

Đọc trước: `../_shared/architecture.md`, `../_shared/handoff.md`, `../_shared/specs-map.md`.

## Bước 0: Đầu vào và điều kiện

1. Xác định nguồn:
   - `T-xxx` → đọc `../../backlog/tasks/T-xxx-*.md`.
   - Prompt tự do → tìm task gần nhất trong `../../backlog/backlog.md`. Không có task thì dựa vào prompt và specs, rồi đặt id `F-<slug>`.
2. **Phụ thuộc:** đọc cột "Phụ thuộc" của task. Task phụ thuộc chưa `DONE` thì **dừng** và báo user (đề nghị làm task đó trước, hoặc user xác nhận làm tiếp bằng stub).
3. **Khung:** `src/shared/contracts/index.ts` chưa có thì gọi `fs-scaffold init` trước.

## Bước 1: Phân tích và chọn transport

Đọc task mục 2 (Phạm vi), 3 (Việc cần làm), 4 (AC), 7 (Ghi chú). Rút ra:
- **Operations** (`operationId`), **Screens** (`SCR-xx.Ay`), **Tables** (`TBL-xx`, mới hay chỉ đọc), **BR/FLOW/NFR**.
- **Features:** feature sở hữu từng operation và table (theo `specs-map.md`). Feature khác chỉ bị đọc thì ghi `(read)`.

**Chọn transport cho từng operation:**

| Điều kiện | Transport |
|---|---|
| Mặc định | `server-action` |
| Prompt **của user** nói rõ "API route", "route handler", "REST", "endpoint", "webhook" | `api-route` (thay thế, hoặc thêm cạnh action nếu user muốn cả hai) |
| Operation phục vụ client ngoài Next: `getHealth`, webhook, cron gọi HTTP | `api-route` |
| Task ghi `POST /api/...` **chỉ vì** ADR-03 cũ (task viết trước khi đổi sang Server Action) | **vẫn** `server-action` |

Ghi lý do chọn vào `Meta.Transport`.

**Lệch giữa task và kiến trúc:** task có `[ASSUMED]` về tên thư mục (`messages/vi.ts`, `server/`, `app/(app)`) thì **`_shared/architecture.md` thắng**. Ghi việc lệch này vào `## Issues` để báo user.

## Bước 2: Lập plan

Tạo `.work/<task-id>/plan.md` theo `_shared/handoff.md`. Mỗi section ghi checklist cụ thể (tên schema, hàm, file, key i18n dự kiến). Section không cần thì ghi `— bỏ qua (lý do)`, ví dụ không có realtime thì bỏ `client-data`. Điền `## AC map` từ mục 4 của task.

Báo user **một đoạn ngắn** (operations, transport, features, các section sẽ chạy), rồi làm tiếp. Chỉ dừng hỏi khi spec mâu thuẫn tới mức không chọn được hướng.

## Bước 3: Gọi worker

Gọi từng skill bằng Skill tool. Truyền vào: đường dẫn plan và tên section. Sau mỗi worker, đọc phần Output nó ghi rồi mới gọi worker tiếp theo.

```
fs-scaffold feature <f>      (feature chưa có thư mục)
fs-contract                  ← luôn chạy đầu, khoá interface
  ├─ nhánh server: fs-db-schema → fs-repository → fs-service → fs-server-action | fs-api-route
  └─ nhánh client: fs-client-data → fs-ui-logic → fs-ui-component
fs-route-page                (sau khi cả 2 nhánh xong)
fs-test
fs-verify
```

- Mặc định chạy **tuần tự, inline**. Hai nhánh độc lập sau `fs-contract` (tên action đã biết theo quy ước `<op>Action`), nên **chỉ khi user yêu cầu** chạy song song thì giao mỗi nhánh cho một subagent, mỗi subagent dùng worker skill của nhánh đó trên cùng plan.
- Worker ghi vào `## Issues` (thiếu index, thiếu `useAuthUser`, spec mơ hồ) thì xử lý ngay: giao cho đúng worker (vd `fs-db-schema` thêm index), hoặc gom lại báo user nếu cần quyết định.
- Orchestrator **không** sửa file code. Thấy sai thì giao lại cho worker kèm mô tả lỗi.

## Bước 4: Vòng verify

1. Gọi `fs-verify`.
2. FAIL → với mỗi dòng trong "Lỗi cần sửa", gọi worker được gán, truyền file:line và vấn đề.
3. Lặp lại tối đa **3 vòng**. Vẫn FAIL thì dừng và báo user: lỗi còn lại, đã thử gì, cần quyết định gì.

## Bước 5: Kết thúc

- Cập nhật task: tick checkbox mục 3 đã làm, đổi cột `Trạng thái` thành `DONE` **chỉ khi** verify PASS.
- Báo user:
  - AC nào pass bằng test tự động, AC nào cần test tay (kèm bước từ mục "Test tay" của task).
  - Các file chính đã tạo, theo tầng.
  - Giả định và độ lệch so với spec (từ `## Issues`).
  - Bước nào của verify chưa chạy được, và lý do.
- **Không commit** trừ khi user yêu cầu.

## Không làm
- Không viết code hay test trực tiếp.
- Không bỏ qua `fs-contract` hay `fs-verify`.
- Không chọn `api-route` khi không thoả bảng ở Bước 1.
- Không đánh dấu `DONE` khi verify chưa PASS.
