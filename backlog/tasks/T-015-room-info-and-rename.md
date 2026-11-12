# T-015 · Thông tin phòng: xem thành viên & sửa tên phòng

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-04 | M3 | 3 | T-009 | TODO |

## 1. Mục tiêu demo
Sau task này: **Thành viên trong phòng bấm tên phòng (hoặc ℹ) → mở Thông tin phòng, thấy chế độ lưu, "Thành viên (n/50)" và danh sách thành viên (ảnh, tên, email, nhãn Host). Host bấm ✎ → đổi tên thành "Cờ tướng cuối tuần" → mọi người thấy tin hệ thống "A đã đổi tên phòng thành Cờ tướng cuối tuần" và tên mới ở header + danh sách phòng; thành viên thường không thấy nút ✎.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-05.A10 | NAV từ tên phòng / ℹ → SCR-06 |
| Thao tác | SCR-06.A0 | Tải thông tin phòng & thành viên (FS listener) |
| Thao tác | SCR-06.A1 | Sửa tên phòng (host) |
| API | `updateRoom` | `PATCH /rooms/{roomId}` |
| Dữ liệu | TBL-07 | ghi `name`, `last_message`, `last_message_at`, `updated_at` |
| Dữ liệu | TBL-08 | chỉ đọc (`role`, `status`, `joined_at`) |
| Dữ liệu | TBL-09 | tạo tin hệ thống `room_renamed` |
| Dữ liệu | TBL-02, TBL-11 | chỉ đọc (hồ sơ, `room_name_max`, `max_room_members`) |
| Rule | BR-18 | chỉ host sửa tên |
| Rule | BR-24 | tin hệ thống khi đổi tên |
| Rule | BR-27 | thành viên thấy tên, ảnh, email của nhau |
| Rule | BR-16 | hiển thị chế độ lưu chỉ đọc; API không cho sửa `retention` / `ttlDays` |
| Rule | Q-037 | tên ≤50, lỗi quyền "Bạn không có quyền thực hiện thao tác này" |
| Phụ trợ | SUP-04, SUP-09 | tên mới + tin cuối cập nhật realtime |
| NFR | NFR-13 | quyền host kiểm phía server |
| Flow | FLOW-09a | xem thành viên + sửa tên (bước 1–4) |

**Ngoài phạm vi:** chấm online trong danh sách thành viên (T-022); menu ⋮ thành viên, thêm / kick / chặn (T-016); giải tán (T-017); chuyển host, rời phòng (T-018); panel desktop (T-029).

## 3. Việc cần làm
### UI
- [ ] SCR-05: header tên phòng + phụ đề "n thành viên" và nút ℹ đều mở `/rooms/{roomId}/info` (SCR-06) (SCR-05.A10). Phụ đề chưa có phần "m đang online" (T-022).
- [ ] SCR-06 (màn con, ẩn thanh tab): header ← "Thông tin phòng" → SCR-05; khối phòng: tên (trống → tên thành viên khác, dùng `roomDisplayName` của T-008) + ✎ chỉ khi `host_uid == me`; hộp chế độ lưu "Ngắn hạn · tin tự xóa sau {thời hạn} (không đổi được)" / "Lâu dài · giữ vĩnh viễn (không đổi được)"; chip "Chỉ đọc" khi `read_only`.
- [ ] SCR-06.A0: listener `rooms/{roomId}` + `rooms/{roomId}/members` where `status == active`; `profiles/{uid}` (get, cache); tiêu đề "Thành viên (n/{max_room_members})"; hàng thành viên: ảnh, tên (+ "(Bạn)"), email, nhãn "Host"; host đứng đầu, còn lại theo `joined_at` tăng dần; người đã xóa tài khoản → "Người dùng đã xóa" (BR-28, `profiles.status`).
- [ ] SCR-06 trạng thái: loading skeleton khối phòng + 5 hàng; empty (chỉ còn host) "Thêm bạn vào phòng để trò chuyện"; không còn là thành viên / phòng xóa (listener bị từ chối) → về SCR-03 kèm thông báo (dùng lại dialog 24 của SCR-05 từ T-009); giao diện host/thành viên đổi realtime theo `rooms.host_uid`.
- [ ] Dialog 11 đổi tên: ô nhập có giá trị hiện tại, trim, bộ đếm "n/50", chặn gõ quá `room_name_max`, gợi ý "Để trống để hiển thị tên các thành viên."; nút Lưu disabled khi giá trị (sau trim) không đổi; khi gửi → spinner.
- [ ] Xử lý lỗi `updateRoom`: `NOT_ROOM_HOST` → toast "Bạn không còn là host", ẩn ✎, đóng dialog; `ROOM_NAME_TOO_LONG` / `VALIDATION_FAILED` → lỗi tại ô; `NOT_ROOM_MEMBER` / `ROOM_NOT_FOUND` → về SCR-03; lỗi mạng → toast, giữ dialog.
- [ ] SCR-05: tin hệ thống `room_renamed` hiển thị "{actor} đã đổi tên phòng thành {room_name}"; tên trống → "{actor} đã xóa tên phòng" `[ASSUMED → Q-047]`.

### API / Backend
- [ ] `PATCH /api/rooms/{roomId}` (`updateRoom`): Zod `RoomUpdate` `{name: string | null}` `additionalProperties: false` → gửi `retention`/`ttlDays`/field lạ → `400 VALIDATION_FAILED` (BR-16).
- [ ] Kiểm: phòng không tồn tại / `deleted` → `404 ROOM_NOT_FOUND`; mình không `active` → `403 NOT_ROOM_MEMBER`; `host_uid ≠ me` → `403 NOT_ROOM_HOST` (BR-18); tên sau trim > `room_name_max` → `422 ROOM_NAME_TOO_LONG`; trim rỗng → lưu `null` (Q-012).
- [ ] Transaction: cập nhật `rooms.name`, `updated_at`; tạo tin `kind = system`, `system_event {type: room_renamed, actor_uid: me, room_name: <tên mới | null>}`, `expire_at` theo `ttl_days` (BR-16); `rooms.last_message` + `last_message_at` = tin hệ thống (SUP-04). Dùng `buildSystemMessage` của T-008.
- [ ] Tên không đổi (sau trim bằng tên cũ) → trả `200` không tạo tin hệ thống `[ASSUMED → Q-047]`.
- [ ] Response `200 Room`.

### Data
- [ ] Không có bảng / index mới. Rules đọc `rooms`, `members` đã có từ T-008 — thêm test: thành viên đọc được `members` của phòng, người ngoài bị deny.
- [ ] Seed T-015: phòng nhóm "Hội cờ" (host A, thành viên B, C), phòng ngắn hạn 7 ngày; một phòng có thành viên đã xóa tài khoản (`profiles.status = deleted`).

### Khác
- [ ] Không có.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | B là thành viên phòng "Hội cờ" (host A, có C) | B ở SCR-05 bấm tên phòng | Mở SCR-06: thấy "Ngắn hạn · tin tự xóa sau 1 tuần (không đổi được)", "Thành viên (3/50)", A đứng đầu với nhãn "Host", rồi B "(Bạn)", C theo thứ tự vào phòng; mỗi hàng có ảnh, tên, email | FLOW-09a (xem), BR-27, BR-16 |
| AC-2 | Như AC-1 | B (thành viên thường) xem SCR-06 | Không có nút ✎ | BR-18, SCR-06 Không có quyền |
| AC-3 | A là host, B đang mở SCR-05 và C đang ở SCR-03 | A bấm ✎, nhập "Cờ tướng cuối tuần", Lưu | Trong ≤2 giây: tên ở SCR-06 / header SCR-05 của A và B đổi; B thấy tin hệ thống "A đã đổi tên phòng thành Cờ tướng cuối tuần"; tên mới ở SCR-03 của C | FLOW-09a bước 1–4, BR-24, SUP-09 |
| AC-4 | Như AC-3 | Kiểm emulator | `rooms.name = "Cờ tướng cuối tuần"`, `last_message.kind = system`; có 1 tin `system_event.type = room_renamed`, `room_name` đúng, `expire_at = created_at + 7 ngày` | BR-24, BR-16, SUP-04 |
| AC-5 | A là host | A xóa hết tên (hoặc chỉ nhập dấu cách) và Lưu | `rooms.name = null`; phòng hiển thị tên các thành viên khác ("B, C" với A); có tin hệ thống `room_renamed` | FLOW-09a bước 3, Q-012 |
| AC-6 | A là host, dialog đổi tên đang mở | A gõ 60 ký tự | Ô dừng ở 50, bộ đếm "50/50"; gọi API trực tiếp với tên 51 ký tự → `422 ROOM_NAME_TOO_LONG`, tên không đổi | Q-037 |
| AC-7 | B là thành viên thường | B gọi `updateRoom` trực tiếp | `403 NOT_ROOM_HOST`, tên không đổi, không có tin hệ thống | BR-18, NFR-13, Q-037 |
| AC-8 | A mở dialog đổi tên; trong lúc đó quyền host chuyển sang B (seed đổi `host_uid`) | A bấm Lưu | Toast "Bạn không còn là host", nút ✎ ẩn | SCR-06.A1 lỗi |
| AC-9 | D không ở trong phòng | D gọi `updateRoom` / đọc `rooms/{id}/members` bằng SDK | `403 NOT_ROOM_MEMBER`; đọc bị deny | NFR-13, BR-20 |
| AC-10 | A là host | A gọi `updateRoom` với `{retention: "long"}` hoặc `{name: "X", ttlDays: 30}` | `400 VALIDATION_FAILED`, phòng không đổi | BR-16 |
| AC-11 | A là host, dialog mở với tên hiện tại | A không sửa gì | Nút Lưu disabled | SCR-06 thành phần 11 |
| AC-12 | Phòng có thành viên E đã xóa tài khoản (seed `profiles/E.status = deleted`, E vẫn `active`) `[ASSUMED → Q-047]` | Mở SCR-06 | Hàng E hiện "Người dùng đã xóa", ảnh mặc định, không có email | BR-28 |
| AC-13 | B đang mở SCR-06 | B bị đưa ra khỏi `member_uids` (seed) | B được đưa về SCR-03 kèm thông báo "Bạn không còn ở trong phòng này" | SCR-06.A0 lỗi, BR-20 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Vitest Zod `RoomUpdate`: field lạ / `retention` → lỗi; `name: null` hợp lệ | AC-10 |
| Integration `updateRoom` (emulator): host đổi tên → `rooms.name`, tin hệ thống, `last_message` như AC-4 | AC-3, AC-4 |
| Integration: tên trống / toàn dấu cách → `null` + tin hệ thống | AC-5 |
| Integration: 51 ký tự → 422; thành viên thường → 403 `NOT_ROOM_HOST`; người ngoài → 403 `NOT_ROOM_MEMBER`; phòng `deleted` → 404 | AC-6, AC-7, AC-9 |
| Integration: tên không đổi → 200, không tạo tin | AC-11 |
| Rules test: thành viên đọc `members`; người ngoài deny | AC-9 |
| Vitest component SCR-06: ✎ chỉ render khi `host_uid == me`; sắp xếp host đầu + `joined_at`; hàng người đã xóa | AC-1, AC-2, AC-12 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context (A host, B thành viên): B mở SCR-06 không thấy ✎; A đổi tên → B thấy tin hệ thống và tên mới | AC-1, AC-2, AC-3 |
| Playwright: A gõ tên 60 ký tự → bị cắt ở 50; xóa tên → phòng hiện tên thành viên | AC-5, AC-6 |

### Dữ liệu seed / tiền điều kiện
- Emulator Auth, Firestore; A, B, C, D đã đồng ý chính sách.
- Phòng "Hội cờ" ngắn hạn 7 ngày: host A, thành viên B, C (thứ tự `joined_at` A < B < C).
- Phòng phụ cho AC-12: có E `active` với `profiles/E.status = deleted`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | B mở phòng "Hội cờ" → bấm tên phòng | SCR-06 hiện đủ thông tin, không có ✎ | AC-1, AC-2 |
| 2 | A mở SCR-06 → ✎ → không sửa | Lưu disabled | AC-11 |
| 3 | A gõ 60 ký tự | Dừng ở 50 | AC-6 |
| 4 | A nhập "Cờ tướng cuối tuần" → Lưu; B, C quan sát | Tên đổi, tin hệ thống, SCR-03 cập nhật | AC-3 |
| 5 | Emulator UI kiểm `rooms`, `messages` | Như AC-4 | AC-4 |
| 6 | A xóa tên → Lưu | Phòng hiện "B, C" | AC-5 |
| 7 | curl `updateRoom` bằng token B; token D; body `{retention:"long"}` bằng token A | 403 NOT_ROOM_HOST; 403 NOT_ROOM_MEMBER; 400 | AC-7, AC-9, AC-10 |
| 8 | A mở dialog, sửa `host_uid` sang B trong Emulator UI, A bấm Lưu | Toast "Bạn không còn là host", ✎ ẩn | AC-8 |
| 9 | Mở phòng phụ có E | Hàng "Người dùng đã xóa" | AC-12 |
| 10 | B đang ở SCR-06, xóa B khỏi `member_uids` trong Emulator UI | B về SCR-03 với thông báo | AC-13 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Rules `members` có test deny cho người ngoài phòng
- [ ] `updateRoom` kiểm quyền host phía server, có test 403 (NFR-13)

## 7. Ghi chú
- `[ASSUMED → Q-047]` Tin hệ thống khi xóa tên phòng: "{actor} đã xóa tên phòng" (spec chỉ có câu "đã đổi tên phòng thành …").
- `[ASSUMED → Q-047]` Lưu tên giống tên cũ không sinh tin hệ thống, trả 200.
- `[ASSUMED → Q-047]` AC-12: xóa tài khoản sẽ đưa người đó ra khỏi phòng (T-026, `purgeAccount` chạy nền); trong khoảng chờ task nền, hồ sơ đã `deleted` nhưng thành viên còn `active` → SCR-06 phải hiển thị an toàn. Seed chỉ để kiểm hiển thị.
- Các nút "+ Thêm thành viên", menu ⋮, "Rời phòng", "Giải tán phòng" của SCR-06 chưa render ở task này — thêm ở T-016 / T-017 / T-018.
