# T-006 · Xem lời mời & chấp nhận / từ chối

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-02 | M1 | 5 | T-005 | TODO |

## 1. Mục tiêu demo
Sau task này: **B thấy badge trên tab Bạn bè → mở "Lời mời kết bạn" (SCR-09) → tab Đã nhận có lời mời của A → bấm Chấp nhận → hàng biến mất, toast "Hai bạn đã là bạn bè", emulator có `friendships/{A_B}` và A có thông báo "đã thành bạn".** Trường hợp khác: B Từ chối → A tra lại email B thấy "Chưa thể gửi lại, thử lại sau…"; B tra email A và mời lại được ngay.

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-09.A0 | Listener lời mời đã nhận đang chờ |
| Thao tác | SCR-09.A1 | Listener lời mời đã gửi đang chờ (chỉ xem; nút Thu hồi ở T-012) |
| Thao tác | SCR-09.A2 | Chấp nhận |
| Thao tác | SCR-09.A3 | Từ chối |
| Thao tác | LAYOUT.A3 (phần lời mời) | Badge số lời mời đã nhận đang chờ trên tab Bạn bè + hàng "Lời mời kết bạn" ở SCR-08 |
| API | `acceptFriendRequest` | `POST /friend-requests/{requestId}/accept` |
| API | `rejectFriendRequest` | `POST /friend-requests/{requestId}/reject` |
| Dữ liệu | TBL-04 | cập nhật `status`, `responded_at`, `expire_at` (+30 ngày), `closed_reason`; TTL policy `expire_at` |
| Dữ liệu | TBL-05 | tạo `friendships/{uidMin_uidMax}` |
| Dữ liệu | TBL-10 | ghi `friend_request_accepted`, `friend_request_rejected` |
| Dữ liệu | TBL-02 | chỉ đọc (`profiles` get để hiện tên, ảnh) |
| Rule | BR-09, BR-10, BR-11 | |
| Phụ trợ | SUP-01 | tạo thông báo |
| NFR | NFR-04 (Should – không đo ở đây), NFR-24 | |
| Flow | FLOW-04 bước 1–3, C1, C2, C4, A2, A4, E1, E2 | |

**Ngoài phạm vi:** mở lại phòng chỉ đọc khi kết bạn lại (C3 – T-013); từ chối khi đã là bạn → dialog gợi ý hủy (A1 – T-013); chặn từ lời mời (SCR-09.A4 – T-014); thu hồi (SCR-09.A5 – T-012); danh sách bạn (T-007); xem thông báo (T-024).

## 3. Việc cần làm
### UI
- [ ] SCR-08: thêm hàng "Lời mời kết bạn" + badge số lời mời **đã nhận** pending → `/friends/requests` (SCR-08 thành phần 3).
- [ ] Thanh tab: badge tab Bạn bè = số lời mời đã nhận pending (listener LAYOUT.A3, ẩn badge khi lỗi / 0).
- [ ] SCR-09 `/friends/requests`: màn con, header ← + "Lời mời kết bạn", 2 tab "Đã nhận (n)" / "Đã gửi (n)"; query param `?tab=sent` chọn tab Đã gửi.
- [ ] Hàng đã nhận: ảnh, tên người gửi (`profiles/{from_uid}` get), thời gian tương đối, "· qua link mời" khi `channel = link`; **không** hiện email (Q-044). Nút Chấp nhận / Từ chối.
- [ ] Hàng đã gửi: ảnh, tên người nhận, "Đã gửi … · Đang chờ" (không có nút cho tới T-012).
- [ ] Trạng thái: loading 3 hàng skeleton; empty "Không có lời mời nào đang chờ" mỗi tab; lỗi listener "Không tải được" + "Thử lại"; khi bấm nút → spinner, khóa các nút khác của hàng.
- [ ] Chấp nhận thành công → toast "Hai bạn đã là bạn bè" (hàng tự biến mất nhờ listener). Từ chối → toast "Đã từ chối".
- [ ] Lỗi `FRIEND_REQUEST_NOT_PENDING` / `FRIEND_REQUEST_NOT_FOUND` → toast "Lời mời không còn hiệu lực" (thành phần 12).
- [ ] SCR-07 thẻ c: thêm link "Xem lời mời đã gửi" → `/friends/requests?tab=sent` `[ASSUMED → Q-047]` (SCR-07 thành phần 10, đưa vào đây vì SCR-09 có từ task này).

### API / Backend
- [ ] `acceptFriendRequest`: chỉ người nhận (`to_uid == me`, khác → `403 FRIEND_REQUEST_FORBIDDEN`); không tồn tại → `404 FRIEND_REQUEST_NOT_FOUND`; không `pending` → `409 FRIEND_REQUEST_NOT_PENDING`.
- [ ] Transaction accept: lời mời → `accepted`, `responded_at = now`, `expire_at = now + ended_request_ttl_days`; tạo `friendships/{uidMin_uidMax}` (`member_uids` sắp xếp, `since`, `request_id`) — đã tồn tại thì giữ nguyên `[ASSUMED → Q-047]`; lời mời ngược chiều pending → `closed`, `closed_reason = became_friends`, `responded_at`, `expire_at` (C2); thông báo `friend_request_accepted` cho người gửi (`actor_uid = me`) (C4, BR-11). Trả `200 {request, friendship:{friendUid, since}, reopenedRoomIds: []}`.
- [ ] `rejectFriendRequest`: quyền / lỗi như accept; transaction: → `rejected`, `responded_at` (mốc 24h – BR-10), `expire_at`; thông báo `friend_request_rejected` cho người gửi (R2, BR-11).
- [ ] Đảm bảo đọc-kiểm-ghi trong transaction để thu hồi đồng thời không ghi đè kết quả chấp nhận (E2 – phía accept; phía withdraw ở T-012).
- [ ] Logic cooldown ở `lookupEmail`/`createFriendRequest` (T-005) đã tính theo **chiều** `from → to`: xác nhận lại bằng test để người từ chối mời lại được ngay (BR-10).

### Data
- [ ] `firestore.indexes.json`: thêm `fieldOverrides` TTL cho `friend_requests.expire_at` (`ttl_fr`) — emulator không chạy TTL, chỉ khai báo.
- [ ] Không đổi rules (đã có ở T-005); thêm test rules cho truy vấn listener có `where to_uid == me` / `from_uid == me`.

### Khác
- [ ] Hàm hiển thị thời gian tương đối tiếng Việt ("vừa xong", "5 phút trước"…) dùng chung.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A đã gửi lời mời tới B (pending) | B mở app | Tab Bạn bè có badge "1"; hàng "Lời mời kết bạn" ở SCR-08 có badge "1" | LAYOUT.A3, FLOW-04 bước 1 |
| AC-2 | Như AC-1 | B mở SCR-09 tab Đã nhận | Thấy hàng của A (ảnh, tên, thời gian tương đối), không có email A; tab Đã gửi của A có hàng của B | SCR-09.A0, SCR-09.A1, Q-044 |
| AC-3 | Như AC-1 | B bấm Chấp nhận | Hàng biến mất, toast "Hai bạn đã là bạn bè"; emulator: lời mời `accepted`, `expire_at ≈ responded_at + 30 ngày`; có `friendships/{uidMin_uidMax}` với `member_uids = [A,B]`; `users/A/notifications` có `friend_request_accepted`; badge B về 0 | FLOW-04 bước 2–3, C1, C4, BR-11 |
| AC-4 | A→B pending và B→A pending | B chấp nhận lời mời của A | Lời mời B→A thành `closed`, `closed_reason = became_friends`; biến mất khỏi tab Đã gửi của B và tab Đã nhận của A | FLOW-04 C2, BR-09 |
| AC-5 | A→B pending | B bấm Từ chối | Toast "Đã từ chối", hàng biến mất; lời mời `rejected` có `responded_at`; `users/A/notifications` có `friend_request_rejected` | FLOW-04 A2, BR-11 |
| AC-6 | B vừa từ chối A | A tra email B | Thẻ "Chưa thể gửi lại, thử lại sau …" | BR-10 |
| AC-7 | B vừa từ chối A | B tra email A (A `anonymous=false`) và gửi lời mời | Thành công (không bị cooldown) | BR-10 |
| AC-8 | B đã từ chối A; B gửi lời mời B→A | A chấp nhận | A và B là bạn (`friendships` tồn tại) | FLOW-04 A4, BR-09 |
| AC-9 | Lời mời A→B đã `withdrawn` hoặc `closed` (seed) trong khi B còn mở màn | B bấm Chấp nhận / Từ chối | API `409 FRIEND_REQUEST_NOT_PENDING`; toast "Lời mời không còn hiệu lực"; không tạo `friendships` | FLOW-04 E1 |
| AC-10 | Lời mời A→B pending | A (người gửi) hoặc C gọi accept / reject | `403 FRIEND_REQUEST_FORBIDDEN`; id không tồn tại → `404 FRIEND_REQUEST_NOT_FOUND` | NFR-13 |
| AC-11 | Lời mời A→B pending | Gọi accept và một thao tác ghi khác đổi status (withdraw giả lập bằng transaction song song) | Chỉ một bên thành công; không có trạng thái lai (accepted nhưng thiếu `friendships`, hoặc withdrawn nhưng có `friendships`) | FLOW-04 E2, Q-029 |
| AC-12 | B không có lời mời nào | B mở SCR-09 | Mỗi tab hiện "Không có lời mời nào đang chờ"; không có badge | SCR-09 trạng thái Empty |
| AC-13 | Listener lỗi (giả lập rules deny / offline lâu) | B mở SCR-09 | Hiện "Không tải được" + "Thử lại" | SCR-09 trạng thái Error |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Handler accept (emulator): pending → accepted + friendships + notification + expire_at | AC-3 |
| Handler accept: có lời mời ngược chiều pending → closed `became_friends` | AC-4 |
| Handler reject: pending → rejected + notification | AC-5 |
| `lookupEmail` sau reject: chiều A→B = `reject_cooldown`, chiều B→A = `found` | AC-6, AC-7 |
| Chuỗi: A→B reject, B→A create, A accept → friendships | AC-8 |
| Handler accept/reject với status `withdrawn` / `closed` → 409, không ghi gì | AC-9 |
| Handler: người gọi không phải `to_uid` → 403; id sai → 404 | AC-10 |
| Hai transaction song song (accept + cập nhật status) trên emulator → kết quả nhất quán | AC-11 |
| Rules test: listener `where to_uid == me` allow; `where to_uid == other` deny | AC-2 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context: A gửi lời mời cho B (qua UI T-005) → B thấy badge → mở Lời mời → Chấp nhận → toast; kiểm `friendships` trong emulator | AC-1, AC-2, AC-3 |
| Playwright: A gửi, B Từ chối → A tra lại email B thấy thẻ cooldown | AC-5, AC-6 |

### Dữ liệu seed / tiền điều kiện
- A `an@test.local`, B `binh.tran@test.local` (cả hai `anonymous=false`), C `chi@test.local`.
- Seed riêng cho AC-9: lời mời A→B `status=withdrawn`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | B (cửa sổ 2) mở app khi chưa có lời mời → Bạn bè → Lời mời kết bạn | Không badge; 2 tab đều "Không có lời mời nào đang chờ" | AC-12 |
| 2 | A (cửa sổ 1) gửi lời mời cho B | Badge "1" xuất hiện ở tab Bạn bè của B, không cần tải lại | AC-1 |
| 3 | B mở tab Đã nhận; A mở Lời mời → tab Đã gửi | B thấy A (không email); A thấy B "Đang chờ" | AC-2 |
| 4 | B bấm Chấp nhận | Toast, hàng mất, badge 0; Emulator UI có `friendships`, thông báo cho A | AC-3 |
| 5 | Seed lại: A→B và B→A cùng pending; B chấp nhận lời mời của A | Lời mời B→A `closed`/`became_friends`, mất khỏi cả hai tab | AC-4 |
| 6 | Seed lại: A→B pending; B Từ chối | Toast "Đã từ chối"; A có thông báo `friend_request_rejected` | AC-5 |
| 7 | A tra email B; B tra email A rồi Gửi lời mời | A thấy cooldown; B gửi được | AC-6, AC-7 |
| 8 | A chấp nhận lời mời của B ở bước 7 | Hai người là bạn | AC-8 |
| 9 | Seed A→B pending; B mở tab Đã nhận; ở Emulator UI đổi status thành `withdrawn` nhanh trước khi listener cập nhật (hoặc gọi API bằng REST client) rồi bấm Chấp nhận | Toast "Lời mời không còn hiệu lực" | AC-9 |
| 10 | Tắt emulator Firestore khi đang ở SCR-09 rồi bấm Thử lại sau khi bật | Hiện trạng thái lỗi, Thử lại tải được | AC-13 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Accept / reject ghi trong một transaction (lời mời + friendships + lời mời ngược chiều + thông báo)
- [ ] TTL `friend_requests.expire_at` khai báo trong `firestore.indexes.json` (`fieldOverrides`)
- [ ] Demo M1 bước "B chấp nhận" chạy được nối tiếp T-005

## 7. Ghi chú
- `[ASSUMED → Q-047]` `friendships` đã tồn tại khi accept (hiếm, do race) → giữ doc cũ, vẫn chuyển lời mời sang `accepted`.
- `[ASSUMED → Q-047]` Link "Xem lời mời đã gửi" ở SCR-07 thẻ c làm trong task này.
- `[ASSUMED → Q-047]` Khi lời mời bị `closed (became_friends)` mà người nhận vẫn bấm Từ chối, task này trả `FRIEND_REQUEST_NOT_PENDING`; T-013 đổi thành `409 ALREADY_FRIENDS` + dialog gợi ý hủy kết bạn (FLOW-04 A1).
- "Chấp nhận thắng" (Q-029) thực hiện bằng transaction: thao tác commit trước thắng; phía thu hồi xử lý ở T-012.
- Point 5 giữ nguyên.
