# Specs map — tìm thông tin ở đâu

Đường dẫn tính từ `implement/webapp/`. Specs nằm ở `../../`.

| Cần gì | File | Cách tìm |
|---|---|---|
| Task: phạm vi, việc cần làm, AC | `../../backlog/tasks/T-xxx-*.md` | mục 2 Phạm vi · mục 3 Việc cần làm · mục 4 AC |
| Thứ tự / phụ thuộc task | `../../backlog/backlog.md` | |
| Operation, schema, mã lỗi | `../../specs/api-contract.yml` | grep `operationId: <op>`; schema trong `components.schemas`; bảng mã lỗi ở `info.description` |
| Bảng / collection, cột, index, rules | `../../specs/database.md` | grep `## TBL-xx` |
| Lý do thiết kế DB | `../../specs/database-design.md` | |
| Màn hình, thao tác, state, copy | `../../specs/ui-ux/scr-xx-*.md` | thao tác `SCR-xx.Ay` |
| Wireframe tổng, bảng kênh thao tác | `../../specs/ui-ux/wireframe.md` | mục 4 (Kênh: `API`/`FS`/`RTDB`/`ST`/`NAV`) |
| Stack, ADR | `../../specs/tech-stack.md` | `### ADR-xx` |
| BR / FLOW / NFR | `../../idea/business.md`, `../../idea/business-flows.md` | grep `BR-xx`, `FLOW-xx`, `NFR-xx` |
| Truy vết ID | `../../specs/traceability.md` | |

## Feature sở hữu collection và operation

| Feature | Collections (ghi) | Operations |
|---|---|---|
| `auth` | — (cookie phiên) | `createSession`, `deleteCurrentSession` |
| `account` | TBL-01 `users`, TBL-02 `profiles`, TBL-03 `email_index` | `createAccount`, `getMe`, `updateMe`, `deleteMe` |
| `friend-requests` | TBL-04 `friend_requests` | `createEmailLookup`, `createFriendRequest`, `withdrawFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest` |
| `invite-links` | — (token tự chứa, ADR-08) | `createInviteLink`, `openInviteLink` |
| `friends` | TBL-05 `friendships` | `deleteFriend` |
| `blocks` | TBL-06 `blocks` | `createBlock`, `deleteBlock` |
| `rooms` | TBL-07 `rooms`, TBL-08 `members`, TBL-14 RTDB `room_access` | `createRoom`, `updateRoom`, `deleteRoom`, `addRoomMembers`, `kickRoomMember`, `transferRoomHost`, `leaveRoom`, `markRoomAsRead` |
| `messages` | TBL-09 `messages`, Storage `rooms/**` | `createMessage`, `recallMessage`, `listMessageImageUrls` |
| `notifications` | TBL-10 `users/{uid}/notifications` | `updateNotification`, `markAllNotificationsAsRead` |
| `presence` | TBL-12 RTDB `status`, TBL-13 RTDB `typing` (client ghi) | — |
| `shared/server` | TBL-11 `config/limits` (chỉ đọc) | `getHealth` |

Các service ghi chéo collection (vd tạo lời mời thì ghi thêm notification) phải gọi **repository của feature sở hữu** collection đó, bên trong cùng transaction.
