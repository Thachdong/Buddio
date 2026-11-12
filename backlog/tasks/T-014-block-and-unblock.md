# T-014 · Chặn & bỏ chặn

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-03 | M2 | 5 | T-013, T-011 | TODO |

## 1. Mục tiêu demo
Sau task này: **A mở Bạn bè → ⋮ trên B → Chặn → xác nhận → B biến mất khỏi danh sách bạn của cả hai, lời mời giữa hai người đóng, phòng chỉ có A–B chuyển "Chỉ đọc" trên cả hai máy; B tra email A thấy "Không tìm thấy". A mở Cài đặt → Danh sách đã chặn → Bỏ chặn → B tra email A lại thấy A (nếu A tắt ẩn danh) nhưng hai người chưa là bạn và phòng A–B vẫn chỉ đọc.** Chặn cũng làm được từ lời mời đã nhận (SCR-09) và từ màn link mời (SCR-02).

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-08.A2 | Chặn một người bạn |
| Thao tác | SCR-09.A4 | Chặn người gửi lời mời |
| Thao tác | SCR-02.A4 | Chặn người mời từ màn link mời |
| Thao tác | SCR-12.A0 | Danh sách đã chặn (FS listener) |
| Thao tác | SCR-12.A1 | Bỏ chặn |
| Thao tác | SCR-11 mục 8 | NAV "Danh sách đã chặn" → SCR-12 |
| API | `createBlock` | `POST /blocks` |
| API | `deleteBlock` | `DELETE /blocks/{blockedUid}` |
| Dữ liệu | TBL-06 `blocks` | ghi (tạo / xóa) + index `idx_bl_blocker`; rules đọc `blocker_uid == me` (collection có từ T-005 — kiểm lại) |
| Dữ liệu | TBL-05 `friendships` | xóa khi chặn |
| Dữ liệu | TBL-04 `friend_requests` | `pending` 2 chiều → `closed` (`closed_reason = blocked`) |
| Dữ liệu | TBL-07 `rooms` | `read_only = true` cho phòng `pair_key` của cặp |
| Dữ liệu | TBL-08 | chỉ đọc (kiểm "người chung phòng" cho điều kiện có liên hệ) |
| Rule | BR-04 | hai bên tra email ra "không tìm thấy" giống hệt |
| Rule | BR-06 | link mời giữa hai bên không dùng được |
| Rule | BR-12 | chặn kết thúc quan hệ bạn bè |
| Rule | BR-13 | phòng đúng 2 người → chỉ đọc; nhóm ≥3 không ảnh hưởng; bỏ chặn không mở lại |
| Rule | BR-14 | đóng lời mời, không báo người bị chặn, hai chiều độc lập, bỏ chặn không kết bạn lại |
| Rule | Q-044 | chỉ chặn người có liên hệ; không hiện email ở danh sách chặn; lý do chỉ đọc dùng câu chung |
| Phụ trợ | SUP-09 | danh sách bạn, lời mời, trạng thái phòng cập nhật realtime |
| Flow | FLOW-07a bước 1–8 | happy path |
| Flow | FLOW-07a A1–A4 | đã chặn; bị chặn chiều ngược; chặn từ lời mời; không xác nhận |
| Flow | FLOW-07b bước 1–6 | bỏ chặn |

**Ngoài phạm vi:** chặn từ danh sách thành viên phòng SCR-06.A7 (T-016); chặn từ thông báo SCR-10.A6 (T-025); thời gian phản hồi đều của tra email (T-027).

## 3. Việc cần làm
### UI
- [ ] SCR-08: menu ⋮ của hàng bạn có mục "Chặn" → dialog 9 ("Chặn {tên}? Hai bạn sẽ không còn là bạn bè… {tên} không được báo." Hủy / Chặn); thành công → toast "Đã chặn {tên}", hàng biến mất (qua listener `friendships`); `ALREADY_BLOCKED` → toast "Bạn đã chặn người này".
- [ ] SCR-09 tab Đã nhận: ⋮ → "Chặn" → dialog 10; thành công → hàng biến mất, toast "Đã chặn {tên}"; `ALREADY_BLOCKED` → toast như trên.
- [ ] SCR-02: link "Chặn người này" (thành phần 9) → dialog 13; thành công → toast "Đã chặn" → SCR-03; `ALREADY_BLOCKED` → coi như thành công; lỗi khác → toast, giữ dialog.
- [ ] Dialog chặn dùng chung một component (tham số: nội dung theo màn), nút Chặn spinner khi gọi API, Hủy không gọi API (FLOW-07a A4).
- [ ] SCR-11: mục "Danh sách đã chặn" → `/settings/blocked` (SCR-12).
- [ ] SCR-12: header ← + "Danh sách đã chặn"; ghi chú "Chỉ bạn thấy danh sách này. Người bị chặn không được báo khi bạn chặn hoặc bỏ chặn."; listener `blocks` where `blocker_uid == me` orderBy `created_at desc` + `profiles/{blocked_uid}` (get); hàng: ảnh, tên, "Đã chặn dd/MM/yyyy" theo múi giờ thiết bị, **không hiện email** (Q-044); nút "Bỏ chặn" → dialog 5 (Hủy / Bỏ chặn).
- [ ] SCR-12 trạng thái: loading 3 hàng skeleton; empty "Bạn chưa chặn ai"; lỗi tải "Không tải được" + "Thử lại"; bỏ chặn thành công → toast "Đã bỏ chặn {tên}"; `404 BLOCK_NOT_FOUND` → coi như thành công.
- [ ] SCR-05: thanh chỉ đọc (từ T-013) hiển thị cùng câu "Hai bạn không còn là bạn bè…" khi phòng chỉ đọc do chặn — không có câu riêng lộ việc bị chặn (Q-044, BR-14).

### API / Backend
- [ ] `POST /api/blocks` (`createBlock`): Zod `BlockCreate {blockedUid}`; `blockedUid == me` → `422 CANNOT_BLOCK_SELF`; người kia không tồn tại / đã xóa / **không có liên hệ** (không là bạn, không cùng phòng `active`, không có `friend_requests` nào giữa hai bên) → `404 USER_NOT_FOUND` (Q-044); `blocks/{me}_{uid}` đã có → `409 ALREADY_BLOCKED`.
- [ ] Transaction: tạo `blocks/{me}_{uid}` (`blocker_uid`, `blocked_uid`, `created_at`); xóa `friendships/{pair}` nếu có (BR-12); mọi `friend_requests` `pending` hai chiều → `status = closed`, `closed_reason = blocked`, `responded_at = now`, `expire_at = now + ended_request_ttl_days`; phòng `pair_key == pair` && `status == active` (index `idx_rooms_pair`) → `read_only = true` (dùng `recomputeReadOnly` của T-013 — đã xét `blocks` hai chiều).
- [ ] Không tạo thông báo cho bất kỳ ai (BR-14). Response `201 BlockCreated {block, unfriended, closedRequestIds, readOnlyRoomIds}`.
- [ ] `DELETE /api/blocks/{blockedUid}` (`deleteBlock`): không có `blocks/{me}_{uid}` → `404 BLOCK_NOT_FOUND`; có → xóa, `204`. Không đụng `friendships`, `rooms.read_only`, không thông báo (BR-13, BR-14).
- [ ] Kiểm lại các đường dùng điều kiện chặn đã viết ở task trước, thêm test end-to-end: `createEmailLookup` trả kết quả "không tìm thấy" khi có `blocks` bất kỳ chiều (T-005); `createFriendRequest` → `404 FRIEND_TARGET_NOT_FOUND`; `openInviteLink` → `410 INVITE_LINK_INVALID` (T-011); `acceptFriendRequest` mở lại phòng chỉ khi không còn chặn chiều nào (T-013). Sửa nếu thiếu.
- [ ] Log sự kiện chặn chỉ ghi uid, không ghi email / tên (NFR-27).

### Data
- [ ] `firestore.indexes.json`: `idx_bl_blocker` (`blocker_uid ASC`, `created_at DESC`).
- [ ] `firestore.rules` `blocks/{id}`: read khi `resource.data.blocker_uid == request.auth.uid`; write `false` (kiểm lại; thêm test deny cho người bị chặn).
- [ ] Seed T-014: A–B là bạn + phòng 2 người A–B + phòng nhóm A–B–C; D gửi lời mời `pending` tới A; link mời A → email F (F đã đăng ký); G không có liên hệ với A; B tắt ẩn danh, A tắt ẩn danh.

### Khác
- [ ] Không có.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A và B là bạn, có phòng 2 người A–B và phòng nhóm A–B–C; B đang mở app | A mở SCR-08 → ⋮ B → Chặn → xác nhận | A thấy toast "Đã chặn B", B biến mất khỏi danh sách bạn của A; trong ≤2 giây A biến mất khỏi SCR-08 của B; phòng A–B có chip "Chỉ đọc" ở SCR-03 và thanh chỉ đọc ở SCR-05 trên cả hai máy; phòng nhóm A–B–C vẫn gửi tin được | FLOW-07a bước 1–7, BR-12, BR-13 |
| AC-2 | Như AC-1 | Kiểm emulator | Có `blocks/A_B`; không còn `friendships/{A,B}`; `rooms` A–B `read_only = true`; phòng nhóm `read_only = false`; response có `unfriended = true`, `readOnlyRoomIds` chứa phòng A–B | FLOW-07a bước 4–7 |
| AC-3 | A đã chặn B; B tắt ẩn danh | B mở Thêm bạn và tra email A; A tra email B | Cả hai thấy kết quả "không tìm thấy" giống hệt người chưa đăng ký (chỉ có "Copy link mời"); gọi `createFriendRequest` → `404 FRIEND_TARGET_NOT_FOUND` | FLOW-07a bước 8, BR-04, BR-14 |
| AC-4 | Như AC-1 | Kiểm `users/B/notifications` và giao diện của B | Không có thông báo nào mới liên quan tới việc chặn; SCR-05 của B hiện đúng câu "Hai bạn không còn là bạn bè…" (không có chữ "chặn") | BR-14, Q-044 |
| AC-5 | A và B có lời mời `pending` cả hai chiều (seed, chưa là bạn nhưng có liên hệ) | A chặn B | Cả hai lời mời `status = closed`, `closed_reason = blocked`; biến mất khỏi SCR-09 của A và B | FLOW-07a bước 6, BR-14 |
| AC-6 | D gửi lời mời tới A (`pending`) | A mở SCR-09 → Đã nhận → ⋮ trên D → Chặn → xác nhận | Hàng lời mời biến mất, toast "Đã chặn D"; lời mời `closed (blocked)`; D không nhận thông báo | FLOW-07a A3, SCR-09.A4 |
| AC-7 | F (đã đăng ký) mở link mời của A, thấy "A mời bạn kết bạn" | F bấm "Chặn người này" → xác nhận | Toast "Đã chặn" → SCR-03; lời mời kênh `link` → `closed (blocked)`; F mở lại cùng link → "Link không còn hiệu lực, hãy xin người mời link mới." | SCR-02.A4, BR-06, BR-14 |
| AC-8 | A đã chặn B | A chặn B lần nữa (gọi lại API hoặc từ màn chưa làm mới) | `409 ALREADY_BLOCKED`, UI toast "Bạn đã chặn người này"; dữ liệu không đổi | FLOW-07a A1 |
| AC-9 | B đang chặn A | A chặn B | Thành công; có 2 document độc lập `blocks/B_A`, `blocks/A_B` | FLOW-07a A2, BR-14 |
| AC-10 | A mở dialog chặn B | A bấm Hủy | Không gọi API, không đổi dữ liệu, B vẫn trong danh sách bạn | FLOW-07a A4 |
| AC-11 | — | A gọi `createBlock` với uid của chính mình; với uid G (không liên hệ); với uid không tồn tại | Lần lượt `422 CANNOT_BLOCK_SELF`, `404 USER_NOT_FOUND`, `404 USER_NOT_FOUND` (cùng nội dung lỗi) | Q-044, ENT-05 |
| AC-12 | A đã chặn B (lúc 10/11/2026) và E | A mở Cài đặt → Danh sách đã chặn | Thấy B và E, mới chặn trước, mỗi hàng có ảnh, tên, "Đã chặn 10/11/2026", **không có email**; có ghi chú quyền riêng tư | FLOW-07b bước 1–2, Q-044 |
| AC-13 | A đã chặn B | B dùng client SDK đọc `blocks/A_B` hoặc query `blocks` where `blocked_uid == B` | Bị từ chối (permission-denied); A đọc được | BR-14, NFR-13 |
| AC-14 | A chưa chặn ai | A mở SCR-12 | "Bạn chưa chặn ai" | SCR-12 Empty |
| AC-15 | A đã chặn B (AC-1); B không chặn A; cả hai tắt ẩn danh | A ở SCR-12 bấm Bỏ chặn B → xác nhận | Toast "Đã bỏ chặn B", hàng biến mất; `blocks/A_B` bị xóa; A và B tra email thấy nhau (kết quả "có thể gửi lời mời"), nhưng **không** là bạn; phòng A–B vẫn `read_only = true`; B không có thông báo | FLOW-07b bước 3–6, BR-13, BR-14 |
| AC-16 | A chặn B và B chặn A | A bỏ chặn B | A tra email B vẫn "không tìm thấy" (vì B còn chặn A) | FLOW-07b bước 5 |
| AC-17 | A đã bỏ chặn B ở thiết bị khác | A bấm Bỏ chặn B ở SCR-12 chưa làm mới | API `404 BLOCK_NOT_FOUND`, UI coi như thành công, hàng biến mất | SCR-12.A1 |
| AC-18 | A đã bỏ chặn B (AC-15) | A gửi lời mời, B chấp nhận | Phòng A–B mở lại (`read_only = false`), gửi tin được | BR-13, FLOW-04 C3 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Integration `createBlock` (handler + emulator): bạn + phòng 2 người + phòng nhóm → document như AC-2, không có notification | AC-1, AC-2, AC-4 |
| Integration: lời mời pending 2 chiều → closed (blocked), `expire_at` đặt | AC-5, AC-6 |
| Integration: chặn trùng → 409; bị chặn chiều ngược vẫn tạo được | AC-8, AC-9 |
| Integration: tự chặn → 422; G không liên hệ / uid không tồn tại → 404 cùng body; có liên hệ qua "chung phòng active" hoặc "có lời mời link" → 201 | AC-11, AC-7 |
| Integration chéo: sau chặn, `createEmailLookup` (cả 2 chiều) trả cùng payload với email chưa đăng ký; `createFriendRequest` → 404 `FRIEND_TARGET_NOT_FOUND`; `openInviteLink` → 410 | AC-3, AC-7 |
| Integration `deleteBlock`: 204 + không đổi `friendships` / `read_only`; lần 2 → 404 | AC-15, AC-17 |
| Integration: chặn 2 chiều, bỏ một chiều → lookup vẫn "không tìm thấy" | AC-16 |
| Integration: bỏ chặn → kết bạn lại → `read_only = false`; còn chặn chiều ngược → vẫn `true` | AC-18 |
| Rules test `blocks`: blocker đọc được; blocked đọc / list bị deny; write deny | AC-13 |
| Vitest component SCR-12: hàng không render email; định dạng ngày; empty state | AC-12, AC-14 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context (A, B): A chặn B từ SCR-08 → B mất khỏi danh sách của A; context B thấy A biến mất và phòng A–B hiện thanh chỉ đọc; phòng nhóm gửi tin được | AC-1, AC-4 |
| Playwright: A mở SCR-12 → bỏ chặn B → B tra email A thấy A, không phải bạn | AC-15 |
| Playwright: F mở link mời của A → Chặn người này → mở lại link thấy "Link không còn hiệu lực…" | AC-7 |

### Dữ liệu seed / tiền điều kiện
- Emulator Auth, Firestore, RTDB; tài khoản A, B, C, D, E, F, G đã đồng ý chính sách; A, B tắt ẩn danh.
- A–B bạn bè, phòng 2 người A–B (`pair_key`), phòng nhóm A–B–C; A–E bạn bè; D → A lời mời `pending`; token link mời A → email F (sinh bằng hàm `createInviteLink` của T-010).
- Biến thể: A–B lời mời `pending` 2 chiều (không là bạn); `blocks/B_A` sẵn có.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A mở Bạn bè → ⋮ B → Chặn → Hủy | Không đổi gì | AC-10 |
| 2 | Lặp lại, bấm Chặn; B mở song song | Toast, B mất khỏi cả hai danh sách, phòng A–B chỉ đọc ở hai máy, phòng nhóm vẫn chat | AC-1 |
| 3 | Emulator UI kiểm `blocks`, `friendships`, `rooms` | Như AC-2 | AC-2 |
| 4 | B xem Thông báo / phòng A–B | Không có thông báo; câu chỉ đọc chung | AC-4 |
| 5 | B tra email A; A tra email B | Cả hai "không tìm thấy" + "Copy link mời" | AC-3 |
| 6 | Gọi `createBlock` B lần 2 (curl với ID token emulator) | 409 ALREADY_BLOCKED | AC-8 |
| 7 | A mở Lời mời → Đã nhận → chặn D | Hàng biến mất, toast | AC-6 |
| 8 | F mở link A → Chặn người này → mở lại link | "Link không còn hiệu lực…" | AC-7 |
| 9 | curl `createBlock` với uid A (tự chặn), uid G | 422 / 404 | AC-11 |
| 10 | A mở Cài đặt → Danh sách đã chặn | B, D, … theo thời gian, không email | AC-12 |
| 11 | Đăng nhập tài khoản mới không chặn ai, mở SCR-12 | "Bạn chưa chặn ai" | AC-14 |
| 12 | A bỏ chặn B; B tra email A | Thấy A, có nút gửi lời mời; phòng A–B vẫn chỉ đọc | AC-15 |
| 13 | A gửi lời mời, B chấp nhận | Phòng A–B gửi tin được | AC-18 |
| 14 | Seed `blocks/B_A` + `blocks/A_B`; A bỏ chặn B; A tra email B | Vẫn "không tìm thấy" | AC-9, AC-16 |
| 15 | Mở SCR-12 ở 2 tab, bỏ chặn ở tab 1 rồi bấm ở tab 2 | Tab 2 không báo lỗi | AC-17 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Rules `blocks` có test deny cho người bị chặn
- [ ] Index `idx_bl_blocker` khai báo, query SCR-12 chạy trên emulator
- [ ] Test chéo khẳng định T-005 (tra email), T-011 (link), T-013 (mở lại phòng) tôn trọng quan hệ chặn
- [ ] Không có chuỗi nào trên giao diện người bị chặn để lộ việc bị chặn

## 7. Ghi chú
- `[ASSUMED → Q-047]` "Có liên hệ" (Q-044) = đang là bạn, HOẶC cùng phòng `active` (cả hai trong `member_uids`), HOẶC có bất kỳ `friend_requests` nào giữa hai bên còn lưu (mọi trạng thái, mọi kênh). Kiểm "chung phòng" bằng query `rooms` where `member_uids array-contains me` (dùng `idx_rooms_member`) rồi lọc phía server.
- `[ASSUMED → Q-047]` `404 USER_NOT_FOUND` cho "không liên hệ" và "không tồn tại" trả body giống nhau.
- `[ASSUMED → Q-047]` Chặn một người đã là bạn nhưng phòng 2 người đang chỉ đọc sẵn → không đổi `read_only`, `readOnlyRoomIds` vẫn liệt kê phòng đó.
- Hàm `recomputeReadOnly` (T-013) phải xét cả `blocks` hai chiều; nếu T-013 chưa làm phần này thì bổ sung ở đây.
- Point 5 giữ nguyên; rủi ro: 3 điểm vào UI + màn mới SCR-12 + kiểm chéo 4 endpoint cũ. Nếu vượt, tách "SCR-02.A4 chặn từ link mời" thành task 1–2 point.
