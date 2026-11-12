# Project State

- **Phase hiện tại:** 4
- **Cập nhật lần cuối:** 2026-11-13

## Phase 1 — Business discovery → `idea/business.md`
- [x] idea-parse
- [x] biz-actor-entity
- [x] biz-capability
- [x] biz-compile
- [x] biz-review
- [x] ✅ User xác nhận chốt Phase 1

## Phase 2 — Business flows → `idea/business-flows.md`
- [x] biz-supporting
- [x] flow-detail
- [x] flow-overview
- [x] nfr-define
- [x] flow-compile
- [x] ✅ User xác nhận chốt Phase 2

## Phase 3 — Technical specs → `specs/`
- [x] tech-stack-select
- [x] db-design
- [x] ui-screen-map
- [x] api-contract
- [x] ui-screen-design
- [x] spec-crosscheck
- [x] ✅ User xác nhận chốt Phase 3

## Phase 4 — Backlog → `backlog/`
- [x] backlog-slice
- [x] backlog-task-detail
- [x] backlog-review
- [x] ✅ User xác nhận chốt Phase 4

## Câu hỏi còn mở
| ID | Câu hỏi | Liên quan | Chặn bước nào? |
|---|---|---|---|

## Ghi chú
- Project root: `buddio/` — mọi đường dẫn `idea/`, `specs/` trong skill tính từ thư mục này.
- 2026-11-11: chuyển `buddio/raw-idea.md` → `buddio/idea/raw-idea.md` cho đúng cấu trúc.
- 2026-11-11: biz-review vòng 1 PASS (0 HIGH). Đã sửa trình bày trực tiếp trong `business.md` (5 mục). Từ đây `business.md` là bản chuẩn, các file `_draft/` chỉ để tham khảo.
- Chuyển Phase 2: thông báo (gồm danh sách thông báo/đã đọc), tự xóa tin hết hạn, link mời hết hạn 7 ngày, mức mã hóa tin nhắn, độ trễ realtime.
- 2026-11-11: **Tạm dừng tại cổng chuyển Phase 1 → 2.** Phase 1 xong, chờ user xác nhận "✅ chốt Phase 1". Làm tiếp bằng `/idea-to-specs buddio` (sẽ hỏi lại cổng chốt Phase 1 rồi sang Phase 2).
- 2026-11-12: User xác nhận chốt Phase 1 (`/idea-to-specs start phase 2`). Bắt đầu Phase 2.
- 2026-11-12: biz-supporting xong — 14 SUP (9 trong MVP, SUP-10 Push để sau, 4 ngoài phạm vi). User xác nhận. Q-030 → Q-034. business.md cập nhật ENT-03/BR-06/BIZ-03f (link tự chứa), ENT-10.
- 2026-11-12: flow-detail xong — 11 FLOW (FLOW-01→11; tách 07a/b, 09a–f, 10a–c) + vòng đời 9 entity tại `_draft/flows/`. Q-035 → Q-037. business.md cập nhật ENT-06 (tên phòng ≤50), ENT-03/BR-06 (mở lại link sau từ chối).
- 2026-11-12: flow-overview xong, user xác nhận (`_draft/flows/overview.md`).
- 2026-11-12: nfr-define xong — 27 NFR (17 Must / 9 Should / 1 Could), user xác nhận. Q-038, Q-039. business.md cập nhật BR-23, ENT-08, BIZ-01 (đồng ý chính sách), BIZ-03 (giới hạn tra email).
- 2026-11-12: flow-compile xong → `idea/business-flows.md`. Thêm FLOW-12 Xem & dọn thông báo (SUP-03, SUP-06, không có BIZ tương ứng) để phủ SUP-06. Kiểm tra: 11/11 BIZ có FLOW, 9/9 SUP MVP có trong FLOW, 12/12 FLOW trong overview, Mermaid PASS (rà cấu trúc, chưa render bằng mermaid-cli). 0 OPEN / 0 ASSUMED. Chờ user chốt Phase 2.
- 2026-11-12: User xác nhận chốt Phase 2. Chuyển Phase 3.
- 2026-11-12: tech-stack-select xong — Firebase (Next.js/App Hosting, Firestore, RTDB presence, Storage, 2 Functions task queue), 12 ADR. Q-040 → Q-042.
- 2026-11-12: db-design xong — 14 TBL (11 Firestore, 3 RTDB), ERD, rules đọc, rà 12 flow. Q-043. business.md BR-21 thêm 1000 ký tự.
- 2026-11-12: ui-screen-map xong — 12 SCR, 63 thao tác (38 API), user duyệt. Chạy song song api-contract ∥ ui-screen-design.
- 2026-11-12: api-contract xong (agent) — 30 operation / 27 path, lint redocly valid, 13 ASSUMED chờ xác nhận.
- 2026-11-12: ui-screen-design xong (agent) — 12 md + 12 drawio (mobile 375×812), không export PNG (không có draw.io CLI). Bổ sung thao tác SCR-02.A5, SCR-06.A8, SCR-10.A4–A6. 26 ASSUMED → user xác nhận Q-044.
- 2026-11-12: spec-crosscheck PASS — 4 vấn đề nhỏ đã sửa, 1 NFR-GAP (NFR-23 Could) chấp nhận. `specs/traceability.md`. Chờ user chốt Phase 3.
- 2026-11-12: User xác nhận chốt Phase 3. Hoàn tất cả 3 phase.
- 2026-11-13: Bắt đầu Phase 4. Thiết lập backlog Q-045.
- 2026-11-13: backlog-slice xong — 29 task, 7 EPIC, 6 milestone, 114 point. User duyệt Q-046.
- 2026-11-13: backlog-task-detail xong (4 agent) — 29 file task, 116 point (T-029 3→5 thêm kéo-thả ảnh). Q-047: giữ point, sửa index messages(kind, created_at) + debounce 1s, chấp nhận 192 ASSUMED.
- 2026-11-13: backlog-review PASS (vòng sửa 1: 4 vấn đề nhỏ đã sửa). `backlog/coverage.md`. Chờ user chốt Phase 4.
- 2026-11-13: User xác nhận chốt Phase 4. Hoàn tất 4 phase — bắt đầu code từ T-001.
- 2026-11-13: Đổi tên project GameHub → Buddio, thư mục `buddio/` (Q-048).
