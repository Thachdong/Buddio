# Backlog Coverage

> Cập nhật: 2026-11-13 · Kết luận: **PASS** · Kiểm bằng script (phạm vi = bảng mục 2 của file task; BR = cột nguồn của AC; NFR = AC hoặc DoD) + rà tay overlap

## 1. Độ phủ spec → task
### Thao tác màn hình
| Thao tác | Kênh | Task | Trạng thái |
|---|---|---|---|
| LAYOUT.A1 | API | T-002 | ✅ |
| LAYOUT.A2 | FS | T-024 | ✅ |
| LAYOUT.A3 | FS | T-006, T-021 | ✅ |
| LAYOUT.A4 | RTDB | T-022 | ✅ |
| SCR-01.A1 | API | T-001, T-002 | ✅ |
| SCR-01.A2 | API | T-002 | ✅ |
| SCR-02.A0 | API | T-011 | ✅ |
| SCR-02.A1 | NAV | T-011 | ✅ |
| SCR-02.A2 | API | T-011 | ✅ |
| SCR-02.A3 | API | T-011 | ✅ |
| SCR-02.A4 | API | T-014 | ✅ |
| SCR-02.A5 | API | T-011 | ✅ |
| SCR-03.A0 | FS | T-008 | ✅ |
| SCR-03.A1 | FS | T-021 | ✅ |
| SCR-03.A2 | NAV | T-008 | ✅ |
| SCR-04.A0 | FS | T-008 | ✅ |
| SCR-04.A1 | API | T-008 | ✅ |
| SCR-05.A0 | FS | T-009 | ✅ |
| SCR-05.A1 | FS | T-009 | ✅ |
| SCR-05.A2 | API | T-021 | ✅ |
| SCR-05.A3 | RTDB | T-022 | ✅ |
| SCR-05.A4 | RTDB | T-022 | ✅ |
| SCR-05.A5 | ST | T-019 | ✅ |
| SCR-05.A6 | API | T-009, T-019 | ✅ |
| SCR-05.A7 | API | T-009 | ✅ |
| SCR-05.A8 | API | T-020 | ✅ |
| SCR-05.A9 | API | T-019 | ✅ |
| SCR-05.A10 | NAV | T-015 | ✅ |
| SCR-06.A0 | FS | T-015, T-022 | ✅ |
| SCR-06.A1 | API | T-015 | ✅ |
| SCR-06.A8 | FS | T-016 | ✅ |
| SCR-06.A2 | API | T-016 | ✅ |
| SCR-06.A3 | API | T-016 | ✅ |
| SCR-06.A4 | API | T-018 | ✅ |
| SCR-06.A5 | API | T-018 | ✅ |
| SCR-06.A6 | API | T-017 | ✅ |
| SCR-06.A7 | API | T-016 | ✅ |
| SCR-07.A1 | API | T-005, T-027 | ✅ |
| SCR-07.A2 | API | T-005 | ✅ |
| SCR-07.A3 | API | T-012 | ✅ |
| SCR-07.A4 | API | T-010 | ✅ |
| SCR-08.A0 | FS | T-007, T-022 | ✅ |
| SCR-08.A1 | API | T-013 | ✅ |
| SCR-08.A2 | API | T-014 | ✅ |
| SCR-08.A3 | NAV | T-007 | ✅ |
| SCR-09.A0 | FS | T-006 | ✅ |
| SCR-09.A1 | FS | T-006 | ✅ |
| SCR-09.A2 | API | T-006 | ✅ |
| SCR-09.A3 | API | T-006 | ✅ |
| SCR-09.A4 | API | T-014 | ✅ |
| SCR-09.A5 | API | T-012 | ✅ |
| SCR-10.A0 | FS | T-024 | ✅ |
| SCR-10.A1 | API | T-024 | ✅ |
| SCR-10.A2 | API | T-024 | ✅ |
| SCR-10.A3 | NAV | T-024 | ✅ |
| SCR-10.A4 | API | T-025 | ✅ |
| SCR-10.A5 | API | T-025 | ✅ |
| SCR-10.A6 | API | T-025 | ✅ |
| SCR-11.A0 | FS | T-003 | ✅ |
| SCR-11.A1 | API | T-004 | ✅ |
| SCR-11.A2 | API | T-004 | ✅ |
| SCR-11.A3 | API | T-004, T-022 | ✅ |
| SCR-11.A4 | API | T-003 | ✅ |
| SCR-11.A5 | API | T-026 | ✅ |
| SCR-12.A0 | FS | T-014 | ✅ |
| SCR-12.A1 | API | T-014 | ✅ |

### API / job nền
| operationId / job | Task | Trạng thái |
|---|---|---|
| `createSession` | T-002 | ✅ |
| `deleteCurrentSession` | T-003, T-011 | ✅ |
| `createAccount` | T-002 | ✅ |
| `getMe` | T-002, T-003 | ✅ |
| `updateMe` | T-004 | ✅ |
| `deleteMe` | T-026 | ✅ |
| `createEmailLookup` | T-005, T-027 | ✅ |
| `createFriendRequest` | T-005 | ✅ |
| `withdrawFriendRequest` | T-012 | ✅ |
| `acceptFriendRequest` | T-006, T-011, T-013, T-025 | ✅ |
| `rejectFriendRequest` | T-006, T-011, T-013, T-025 | ✅ |
| `createInviteLink` | T-010 | ✅ |
| `openInviteLink` | T-011 | ✅ |
| `deleteFriend` | T-013 | ✅ |
| `createBlock` | T-014, T-016, T-025 | ✅ |
| `deleteBlock` | T-014 | ✅ |
| `createRoom` | T-008, T-013 | ✅ |
| `updateRoom` | T-015 | ✅ |
| `deleteRoom` | T-017 | ✅ |
| `addRoomMembers` | T-016 | ✅ |
| `kickRoomMember` | T-016 | ✅ |
| `transferRoomHost` | T-018 | ✅ |
| `leaveRoom` | T-018 | ✅ |
| `markRoomAsRead` | T-021 | ✅ |
| `createMessage` | T-009, T-013, T-019 | ✅ |
| `recallMessage` | T-020 | ✅ |
| `listMessageImageUrls` | T-019 | ✅ |
| `updateNotification` | T-024 | ✅ |
| `markAllNotificationsAsRead` | T-024 | ✅ |
| `getHealth` | T-001, T-028 | ✅ |
| Function `purgeRoom` (tạo ở T-017) | T-017, T-018, T-026 | ✅ |
| Function `purgeAccount` (tạo ở T-026) | T-026 | ✅ |
| Firestore TTL (lời mời T-006, tin T-023, thông báo T-024) | T-006, T-023, T-024 | ✅ |
| Storage lifecycle (`uploads/` T-019, `rooms/` T-023) | T-019, T-023 | ✅ |

### Dữ liệu
| TBL | Task tạo (task đầu tiên) | Task dùng tiếp | Trạng thái |
|---|---|---|---|
| TBL-01 | T-002 | T-003, T-004, T-005, T-011, T-026, T-027 | ✅ |
| TBL-02 | T-002 | T-004, T-005, T-006, T-007, T-008, T-009, T-015, T-024, T-026 | ✅ |
| TBL-03 | T-002 | T-005, T-011, T-026 | ✅ |
| TBL-04 | T-005 | T-006, T-011, T-012, T-014, T-024, T-025, T-026 | ✅ |
| TBL-05 | T-005 | T-006, T-007, T-008, T-011, T-013, T-014 | ✅ |
| TBL-06 | T-005 | T-011, T-013, T-014 | ✅ |
| TBL-07 | T-008 | T-009, T-013, T-014, T-015, T-016, T-017, T-018, T-019, T-020, T-021, T-024 | ✅ |
| TBL-08 | T-008 | T-009, T-014, T-015, T-016, T-017, T-018, T-021 | ✅ |
| TBL-09 | T-008 | T-009, T-015, T-016, T-017, T-018, T-019, T-020, T-021, T-023 | ✅ |
| TBL-10 | T-005 | T-006, T-008, T-011, T-016, T-017, T-018, T-024, T-025, T-026 | ✅ |
| TBL-11 | T-002 | T-005, T-008, T-015, T-027 | ✅ |
| TBL-12 | T-022 | — | ✅ |
| TBL-13 | T-022 | — | ✅ |
| TBL-14 | T-008 | T-016, T-017, T-018, T-022, T-026 | ✅ |

### Rule / phụ trợ / NFR Must
| ID | Task (AC / DoD) | Trạng thái |
|---|---|---|
| BR-01 | T-002 | ✅ |
| BR-02 | T-002, T-004 | ✅ |
| BR-03 | T-005 | ✅ |
| BR-04 | T-005, T-010, T-014, T-027 | ✅ |
| BR-05 | T-005 | ✅ |
| BR-06 | T-010, T-011, T-014, T-026 | ✅ |
| BR-07 | T-011 | ✅ |
| BR-08 | T-005, T-012 | ✅ |
| BR-09 | T-005, T-006, T-013, T-025 | ✅ |
| BR-10 | T-005, T-006, T-012 | ✅ |
| BR-11 | T-006, T-025 | ✅ |
| BR-12 | T-013, T-014, T-026 | ✅ |
| BR-13 | T-013, T-014, T-016, T-018, T-022, T-026 | ✅ |
| BR-14 | T-014, T-016, T-025 | ✅ |
| BR-15 | T-008, T-016 | ✅ |
| BR-16 | T-008, T-009, T-015, T-019, T-023 | ✅ |
| BR-17 | T-008, T-016, T-018, T-026 | ✅ |
| BR-18 | T-008, T-015, T-016, T-017, T-018 | ✅ |
| BR-19 | T-017, T-018 | ✅ |
| BR-20 | T-008, T-009, T-015, T-016, T-018, T-019, T-020, T-021 | ✅ |
| BR-21 | T-009, T-019, T-029 | ✅ |
| BR-22 | T-019, T-020 | ✅ |
| BR-23 | T-009 DoD (ADR-07: mã hóa mặc định Google, không có hành vi quan sát được trên emulator) | ⚠️ DoD |
| BR-24 | T-008, T-009, T-015, T-016, T-018, T-026 | ✅ |
| BR-25 | T-004, T-022 | ✅ |
| BR-26 | T-021 | ✅ |
| BR-27 | T-007, T-015 | ✅ |
| BR-28 | T-002, T-009, T-015, T-021, T-024, T-026 | ✅ |
| BR-29 | T-002, T-004 | ✅ |
| SUP-01 | T-005, T-006, T-011, T-024, T-025 | ✅ |
| SUP-02 | T-008, T-016, T-017, T-018, T-024, T-026 | ✅ |
| SUP-03 | T-024 | ✅ |
| SUP-04 | T-015, T-021 | ✅ |
| SUP-05 | T-023 | ✅ |
| SUP-06 | T-024 | ✅ |
| SUP-07 | T-010, T-011 | ✅ |
| SUP-08 | T-017, T-018, T-019, T-020 | ✅ |
| SUP-09 | T-009, T-013, T-014, T-015, T-016, T-017, T-018, T-022 | ✅ |
| NFR-01 | T-009, T-028 | ✅ |
| NFR-03 | T-009, T-021 | ✅ |
| NFR-07 | T-028 | ✅ |
| NFR-10 | T-009, T-028 | ✅ |
| NFR-11 | T-002, T-003, T-005, T-009, T-010, T-026 | ✅ |
| NFR-12 | T-009 | ✅ |
| NFR-13 | T-002, T-005, T-006, T-007, T-008, T-009, T-012, T-013, T-014, T-015, T-016, T-017, T-018, T-019, T-020, T-022, T-024 | ✅ |
| NFR-14 | T-010, T-011 | ✅ |
| NFR-15 | T-005, T-010, T-011, T-027 | ✅ |
| NFR-17 | T-002, T-004 | ✅ |
| NFR-18 | T-026, T-028 | ✅ |
| NFR-19 | T-017, T-018, T-023, T-028 | ✅ |
| NFR-21 | T-024 | ✅ |
| NFR-22 | T-001, T-002, T-005, T-029 | ✅ |
| NFR-24 | T-001, T-021 | ✅ |
| NFR-25 | T-029 | ✅ |
| NFR-27 | T-001, T-002, T-005, T-009, T-010, T-011, T-026, T-027, T-028 | ✅ |

Nhánh exception của FLOW: mọi `E*` trong business-flows.md có AC ở task tương ứng ✅.

## 2. Chất lượng task
| Task | Demo | AC (số / có nguồn) | Test phủ AC | Point | Milestone | Phụ thuộc hợp lệ | Ghi chú |
|---|---|---|---|---|---|---|---|
| T-001 | ✅ | 6 / ✅ | ✅ | 3 | M0 | — ✅ |  |
| T-002 | ✅ | 19 / ✅ | ✅ | 5 | M0 | T-001 ✅ | BR-01 thêm vào nguồn AC-1 (vòng sửa 1) |
| T-003 | ✅ | 9 / ✅ | ✅ | 2 | M0 | T-002 ✅ |  |
| T-004 | ✅ | 12 / ✅ | ✅ | 3 | M1 | T-003 ✅ |  |
| T-005 | ✅ | 18 / ✅ | ✅ | 5 | M1 | T-004 ✅ |  |
| T-006 | ✅ | 13 / ✅ | ✅ | 5 | M1 | T-005 ✅ |  |
| T-007 | ✅ | 6 / ✅ | ✅ | 2 | M1 | T-006 ✅ |  |
| T-008 | ✅ | 14 / ✅ | ✅ | 5 | M1 | T-007 ✅ |  |
| T-009 | ✅ | 18 / ✅ | ✅ | 5 | M1 | T-008 ✅ | thêm DoD BR-23 / NFR-12 (vòng sửa 1) |
| T-010 | ✅ | 11 / ✅ | ✅ | 3 | M2 | T-005 ✅ |  |
| T-011 | ✅ | 14 / ✅ | ✅ | 5 | M2 | T-010, T-006 ✅ |  |
| T-012 | ✅ | 7 / ✅ | ✅ | 2 | M2 | T-006 ✅ |  |
| T-013 | ✅ | 13 / ✅ | ✅ | 5 | M2 | T-009, T-007 ✅ | sát trần 5 (agent ước ~8) – giữ theo Q-047 |
| T-014 | ✅ | 18 / ✅ | ✅ | 5 | M2 | T-013, T-011 ✅ |  |
| T-015 | ✅ | 13 / ✅ | ✅ | 3 | M3 | T-009 ✅ |  |
| T-016 | ✅ | 17 / ✅ | ✅ | 5 | M3 | T-015, T-014 ✅ |  |
| T-017 | ✅ | 11 / ✅ | ✅ | 5 | M3 | T-016 ✅ | rủi ro cấu hình Functions/Cloud Tasks emulator lần đầu |
| T-018 | ✅ | 16 / ✅ | ✅ | 5 | M3 | T-017 ✅ |  |
| T-019 | ✅ | 14 / ✅ | ✅ | 5 | M3 | T-009 ✅ | sát trần 5 – giữ theo Q-047 |
| T-020 | ✅ | 8 / ✅ | ✅ | 2 | M3 | T-019, T-013 ✅ |  |
| T-021 | ✅ | 14 / ✅ | ✅ | 5 | M3 | T-009 ✅ |  |
| T-022 | ✅ | 11 / ✅ | ✅ | 3 | M3 | T-016, T-004 ✅ | AC-11 thêm test (vòng sửa 1) |
| T-023 | ✅ | 8 / ✅ | ✅ | 3 | M3 | T-019, T-021 ✅ |  |
| T-024 | ✅ | 22 / ✅ | ✅ | 5 | M4 | T-018, T-011 ✅ | AC-21 thêm test (vòng sửa 1) |
| T-025 | ✅ | 11 / ✅ | ✅ | 2 | M4 | T-024, T-014 ✅ |  |
| T-026 | ✅ | 22 / ✅ | ✅ | 5 | M4 | T-018, T-014 ✅ | sát trần 5 – giữ theo Q-047 |
| T-027 | ✅ | 10 / ✅ | ✅ | 3 | M5 | T-014 ✅ |  |
| T-028 | ✅ | 7 / ✅ | ✅ | 5 | M5 | T-023, T-026 ✅ |  |
| T-029 | ✅ | 13 / ✅ | ✅ | 5 | M5 | T-022, T-024 ✅ | 5 point – thêm kéo-thả ảnh (Q-047) |

## 3. Vấn đề
| # | Loại | Mô tả | File | Skill sửa | Trạng thái |
|---|---|---|---|---|---|
| 1 | UNTESTABLE | AC-11 (không ghi `typing` khi phòng chỉ đọc) chưa có test | T-022 | backlog-task-detail T-022 | ✅ Đã sửa (component test) |
| 2 | UNTESTABLE | AC-21 (lỗi tải thông báo) chưa có test | T-024 | backlog-task-detail T-024 | ✅ Đã sửa (component test) |
| 3 | MISSING | BR-01 không có AC nào trỏ tới | T-002 | backlog-task-detail T-002 | ✅ Đã sửa (nguồn AC-1) |
| 4 | MISSING | BR-23 / NFR-12 không có AC hay DoD đo được | T-009 | backlog-task-detail T-009 | ✅ Đã sửa (mục DoD kiểm code) – vẫn ⚠️ vì không quan sát được trên emulator |
| 5 | OVERLAP (đã chia nhánh) | 7 thao tác thuộc 2 task: LAYOUT.A3 (lời mời T-006 / tin chưa đọc T-021), SCR-01.A1 (khung T-001 / hành động T-002), SCR-05.A6 (chữ T-009 / ảnh T-019), SCR-06.A0 & SCR-08.A0 (danh sách T-015, T-007 / cột online T-022), SCR-07.A1 (tra cơ bản T-005 / chống dò T-027), SCR-11.A3 (lưu cài đặt T-004 / hiệu lực online T-022) | — | — | ✅ Chủ ý, mỗi task ghi rõ "Ngoài phạm vi" |
| 6 | Rủi ro point | T-013, T-017, T-019, T-026 sát trần 5; agent ước có thể vượt | slices.md | backlog-slice (nếu vượt khi làm) | ℹ️ User chọn giữ point (Q-047) |
| 7 | Giới hạn môi trường | TTL / lifecycle xóa thật, backup, alert, đo tải thật không kiểm được trên emulator | T-023, T-028 | — | ℹ️ Ngoài môi trường kiểm tra (Q-045), có runbook |

Không có ORPHAN, HORIZONTAL, TOO-BIG (max 5 point), ORDER, vòng phụ thuộc.

## 4. Tổng kết
| Milestone | Số task | Tổng point |
|---|---|---|
| M0 | 3 | 10 |
| M1 | 6 | 25 |
| M2 | 5 | 20 |
| M3 | 9 | 36 |
| M4 | 3 | 12 |
| M5 | 3 | 13 |
| **Tổng** | **29** | **116** |

- Độ phủ: thao tác 66/66 · operationId 30/30 · job nền 2/2 + TTL / lifecycle · TBL 14/14 · BR 28/29 qua AC + 1 qua DoD · SUP 9/9 · NFR Must 17/17
- Vấn đề: 4 đã sửa ở vòng 1; 0 MISSING / UNTESTABLE / ORDER còn mở.
- `[ASSUMED]` còn chờ xác nhận: 0 (192 mục đã xác nhận – Q-047).
