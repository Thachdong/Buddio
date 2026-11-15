# History — nhật ký sau mỗi task / thay đổi

Skill điều phối (`fs-build-feature`, `fs-change`) **bắt buộc** ghi một bản ghi khi kết thúc. Kết quả PASS, FAIL hay dừng giữa chừng đều phải ghi. Mục đích: session sau (người hoặc agent) biết đã làm gì, vì sao, và còn dở gì, mà không phải đọc lại toàn bộ diff.

Khác với `.work/<id>/plan.md`:

| | `.work/<id>/plan.md` | `.claude/history/*.md` |
|---|---|---|
| Vai trò | Bảng làm việc tạm thời giữa các worker | Nhật ký lâu dài |
| Git | Bị ignore | **Được commit** |
| Nội dung | Checklist chi tiết từng section | Tóm tắt kết quả, quyết định, việc còn mở |

## Vị trí và tên file

```
implement/webapp/.claude/history/
  INDEX.md                                   # mỗi bản ghi một dòng, mới nhất ở trên
  2026-11-15_T-001_project-skeleton.md       # <yyyy-mm-dd>_<id>_<slug>.md
  2026-11-16_C-20261116-fix-lookup-copy.md
```
- `<id>` = task id (`T-005`) hoặc change id (`C-<yyyymmdd>-<slug>`) hoặc `F-<slug>`.
- Chạy lại cùng một task (sau khi FAIL hoặc làm tiếp) thì **tạo file mới** cùng id, ngày mới. Không ghi đè bản cũ.
- Ngày theo giờ máy (`date +%F`).

## Mẫu bản ghi

```markdown
# <id> · <tên task / mô tả thay đổi>

| Ngày | Skill | Kết quả | Task file | Plan |
|---|---|---|---|---|
| 2026-11-15 | fs-build-feature | PASS / FAIL / STOPPED | ../../../backlog/tasks/T-xxx-*.md | .work/<id>/plan.md (không commit) |

## Tóm tắt
2–4 câu: đã làm gì, cho ai thấy được gì (lấy theo "Mục tiêu demo" của task).

## Quyết định
| Quyết định | Lý do |
|---|---|
| Transport `createFriendRequest` = server-action | mặc định; task ghi POST /api do ADR-03 cũ |
| … | |

## Thay đổi theo tầng
| Tầng | File |
|---|---|
| contract | src/features/friend-requests/contracts/{schemas,types,errors}.ts |
| db-schema | firebase/firestore.rules (TBL-04, 05, 06, 10), firestore.indexes.json (+idx_fr_*) |
| repository | … |
| service | … |
| transport | … |
| client-data | … |
| ui-logic | … |
| ui | … |
| route | … |
| test | … |
| shared / config | … |
| spec | (nếu có sửa specs/…) |

## Acceptance criteria
| AC | Kết quả | Bằng |
|---|---|---|
| AC-1 | ✅ | e2e/T-005.spec.ts › AC-1 |
| AC-4 | 🖐 test tay | bước 3 mục "Test tay" |
| AC-6 | ❌ | lý do |

## Verify
Kết quả `fs-verify` cuối cùng: từng bước pass/fail/chưa chạy, số vòng sửa.

## Lệch spec / giả định
- … (lấy từ `## Issues` của plan)

## Còn mở / việc tiếp theo
- [ ] …  (việc chưa xong, TODO cho task sau, câu hỏi cần user trả lời)

## Ghi chú cho lần sau
Những điều không thấy được từ code: bẫy đã gặp, workaround, lý do chọn cách khó hơn.
```

Mục nào không có nội dung thì ghi `—`, không xoá mục.

## INDEX.md

Thêm **một dòng lên đầu** bảng, không sửa các dòng cũ:

```markdown
# History index

| Ngày | ID | Kết quả | Tóm tắt | File |
|---|---|---|---|---|
| 2026-11-15 | T-001 | PASS | Khung project, emulator, CI xanh | [2026-11-15_T-001_project-skeleton.md](2026-11-15_T-001_project-skeleton.md) |
```

## Quy tắc
- Ghi **sau** bước verify cuối cùng, trước khi báo user. Câu trả lời cho user có kèm đường dẫn tới bản ghi.
- Viết đúng sự thật: kết quả FAIL hay STOPPED phải ghi rõ dừng ở đâu và vì sao.
- Không chép code hay log dài; chỉ dẫn file:line.
- Không ghi secret, token, email thật hay dữ liệu người dùng (NFR-27).
- Đầu mỗi task, orchestrator **đọc INDEX.md** và bản ghi gần nhất của các task liên quan (task phụ thuộc, cùng feature) để biết việc còn mở và ghi chú từ lần trước.
