---
name: fs-change
description: Điều phối sửa hoặc thay đổi một phần đã có của webapp Buddio — bug, đổi hành vi, đổi copy/giao diện, thêm field, đổi rule, permission-denied, lỗi build — bằng cách xác định tầng bị ảnh hưởng, chỉ gọi worker skill của tầng đó (và các tầng phụ thuộc khi contract/DB đổi), viết test tái hiện bug trước, rồi fs-verify. Dùng khi user báo lỗi hoặc yêu cầu chỉnh sửa feature đã build. Feature/task mới hoàn toàn thì dùng fs-build-feature.
---

# fs-change

Vai trò: **điều phối thay đổi nhỏ và có mục tiêu**. Chỉ chạm vào các tầng cần thiết. Không tự viết code.

Đọc trước: `../_shared/architecture.md`, `../_shared/handoff.md`.

## Bước 1: Định vị

1. Tóm yêu cầu thành 1 câu: *hiện tại X, mong muốn Y*.
2. Tìm vị trí:
   - Đọc từ khoá trong yêu cầu (màn hình, operation, mã lỗi, BR) rồi grep `src/features`.
   - Nếu `../../graphify-out/graph.json` tồn tại, có thể chạy `graphify query "<câu hỏi>"` ở gốc repo để tìm spec liên quan (BR, SCR, TBL, task).
3. Xếp loại theo bảng dưới để chọn worker.

| Triệu chứng / yêu cầu | Tầng | Worker |
|---|---|---|
| Sai chữ, bố cục, màu, responsive, a11y | UI | `fs-ui-component` |
| Sai luồng màn hình, sai state, map lỗi sai, toast sai, optimistic | Logic UI | `fs-ui-logic` |
| Danh sách không cập nhật realtime, thiếu field hiển thị từ listener | Client data | `fs-client-data` |
| `permission-denied`, thiếu index (`FAILED_PRECONDITION`), seed | DB schema | `fs-db-schema` |
| Sai rule nghiệp vụ, sai thứ tự kiểm tra, sai dữ liệu ghi, lỗi transaction | Service | `fs-service` |
| Đọc/ghi sai field, mapper sai | Repository | `fs-repository` |
| Thêm/đổi field input/output, thêm mã lỗi | Contract | `fs-contract` → **cascade** |
| Sai auth level, cookie, revalidate | Transport | `fs-server-action` / `fs-api-route` |
| URL, layout, lỗi blocking-route/Suspense, redirect | Route | `fs-route-page` |
| User yêu cầu thêm API route cho operation đã có action | Transport | `fs-api-route` (dùng lại service) |

**Cascade khi đổi interface:**
- Contract đổi → kiểm lại `fs-repository` (`toDto`), `fs-service`, `fs-server-action` (output schema), `fs-ui-logic` (switch lỗi), `fs-ui-component`.
- Field DB đổi → `fs-db-schema` (rules, index), `fs-repository` (doc, mapper), `fs-client-data` (mapper client).

## Bước 2: Spec có đổi không?

- Yêu cầu **trái** với spec (`api-contract.yml`, `database.md`, `scr-xx.md`, BR): báo user và đề nghị sửa spec trước, vì spec là nguồn chuẩn. Chỉ sửa code sau khi user đồng ý. Sửa spec thì ghi `*Cập nhật <ngày>:*` giống cách ADR-03 đã làm.
- Yêu cầu khớp spec (code đang sai) thì làm luôn.

## Bước 3: Plan rút gọn

Tạo `.work/<change-id>/plan.md` (`change-id` = `C-<yyyymmdd>-<slug>`) theo `_shared/handoff.md`. Chỉ giữ các section của worker sẽ chạy. Ghi phần định vị (file, tầng, lý do) vào `Meta`.

## Bước 4: Thực hiện

1. **Bug:** gọi `fs-test` viết test **tái hiện** (phải fail trước khi sửa). Nếu không tái hiện bằng test tự động được, ghi các bước tái hiện bằng tay.
2. Gọi worker theo thứ tự tầng, từ trong ra ngoài: contract → db-schema → repository → service → transport → client-data → ui-logic → ui-component → route.
3. Gọi `fs-test` bổ sung hoặc cập nhật test cho hành vi mới.
4. Gọi `fs-verify`. FAIL thì giao lỗi cho worker được gán. Tối đa 3 vòng, sau đó dừng và báo user.

## Bước 5: Báo cáo
- Nguyên nhân gốc (nếu là bug), tầng đã sửa, file đã đổi.
- Test tái hiện: fail trước khi sửa, pass sau khi sửa.
- Spec đã cập nhật (nếu có).
- **Không commit** trừ khi user yêu cầu.

## Không làm
- Không sửa code trực tiếp; không sửa ở tầng sai chỉ cho nhanh (vd thêm `if` vào UI để vá lỗi của service).
- Không sửa test cho khớp với code sai.
- Không mở rộng phạm vi ngoài yêu cầu. Thấy vấn đề khác thì ghi vào báo cáo, không tự sửa.
