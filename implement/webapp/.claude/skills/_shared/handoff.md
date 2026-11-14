# Handoff plan — định dạng `.work/<task-id>/plan.md`

Orchestrator (`fs-build-feature`, `fs-change`) tạo file này. Mỗi worker đọc **section của mình**, làm việc, tick checkbox và ghi phần **Output** (chữ ký đã tạo, file đã tạo). Worker không sửa section của worker khác. Nếu thấy sai thì ghi vào `## Issues`.

`.work/` nằm trong `.gitignore`.

```markdown
# <task-id> · <tên task>

## Meta
- Source: ../../backlog/tasks/T-xxx-*.md
- Feature(s): friend-requests (owner), friends (read), blocks (read), notifications (write via repo)
- Transport: server-action | api-route  — lý do: <mặc định | prompt yêu cầu "...">
- Operations: createEmailLookup, createFriendRequest
- Screens: SCR-07.A1, SCR-07.A2, SCR-08 (khung)
- Tables: TBL-04 (new), TBL-05/06 (read), TBL-10 (write)

## 1. contract — fs-contract
- [ ] EmailLookupCreateSchema, EmailLookupResultSchema
- [ ] CreateFriendRequestSchema, FriendRequestSchema
- [ ] errors: createEmailLookupErrors, createFriendRequestErrors
Output:

## 2. db-schema — fs-db-schema
- [ ] rules đọc friend_requests / friendships / blocks / notifications
- [ ] index idx_fr_to, idx_fr_from, idx_fr_pair
- [ ] seed các case a–f
Output:

## 3. repository — fs-repository
## 4. service — fs-service
## 5. transport — fs-server-action | fs-api-route
## 6. client-data — fs-client-data            (bỏ qua nếu không có realtime)
## 7. ui-logic — fs-ui-logic
## 8. ui — fs-ui-component
## 9. route — fs-route-page
## 10. test — fs-test   (map AC-n → file test)
## 11. verify — fs-verify

## AC map
| AC | Test | Status |
|---|---|---|

## Issues
```
