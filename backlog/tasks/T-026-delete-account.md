# T-026 · Xóa tài khoản

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-01 | M4 | 5 | T-018, T-014 | TODO |

## 1. Mục tiêu demo
Sau task này: **A (host phòng X, bạn của B, đang chặn C) mở Cài đặt → "Xóa tài khoản" → đọc cảnh báo, tích "Tôi hiểu và muốn xóa tài khoản" → "Xóa vĩnh viễn" → về màn Đăng nhập với dòng "Tài khoản đã được xóa.". B thấy A không còn trong danh sách bạn bè, tin cũ của A hiện "Người dùng đã xóa", trong phòng X có tin hệ thống A đã rời phòng; thành viên vào X sớm nhất trở thành host và nhận thông báo "Bạn đã trở thành host phòng X". A đăng nhập lại cùng Google → phải đồng ý chính sách và nhận tài khoản mới hoàn toàn.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-11.A5 | Nút "Xóa tài khoản" + dialog xác nhận (thành phần 11, 13) |
| API | `deleteMe` | `DELETE /api/me` → `202` |
| Job nền | `purgeAccount` (Cloud Functions task queue) | gọi lại `purgeRoom` (T-017) cho phòng không còn ai |
| Dữ liệu | TBL-01, TBL-02 | soft delete: `status=deleted`, xóa dữ liệu cá nhân |
| Dữ liệu | TBL-03 | xóa document |
| Dữ liệu | TBL-04 → TBL-10, TBL-14; Firebase Auth user | dọn bởi `purgeAccount` |
| Rule | BR-06, BR-12, BR-13, BR-17, BR-24, BR-28 | |
| Phụ trợ | SUP-02 | chỉ thông báo `room_host_received` cho người nhận host |
| NFR | NFR-11, NFR-18 | kết thúc phiên ngay; dữ liệu cá nhân biến mất ngay, xóa hẳn ≤ 24h |
| Quyết định | Q-037 | không thông báo cho ai trừ người nhận quyền host |
| Flow | FLOW-11 bước 1–8, A1, A2, E1 | |

**Ngoài phạm vi:** xóa khỏi bản sao lưu ≤ 30 ngày (cấu hình backup – T-028); hiển thị "Người dùng đã xóa" trong tin (đã có ở T-009, chỉ kiểm lại); logic rời phòng / chuyển host / `purgeRoom` (T-017, T-018 — dùng lại, không viết lại).

## 3. Việc cần làm
### UI
- [ ] SCR-11 thêm nút "Xóa tài khoản" (kiểu nguy hiểm) dưới "Đăng xuất".
- [ ] Dialog xác nhận (thành phần 13): cảnh báo không khôi phục được, hiệu lực ngay; rời mọi phòng (phòng mình làm host chuyển cho thành viên vào sớm nhất); xóa bạn bè, lời mời, link mời, danh sách chặn; tin đã gửi còn, hiển thị "Người dùng đã xóa"; đăng nhập lại = tài khoản mới. Checkbox "Tôi hiểu và muốn xóa tài khoản"; nút "Xóa vĩnh viễn" disabled tới khi tích; nút "Hủy".
- [ ] Bấm "Xóa vĩnh viễn" → spinner, khóa dialog → `deleteMe` → `202` → `signOut()` → `/login?reason=account_deleted` → SCR-01 vùng 5 "Tài khoản đã được xóa.". Lỗi → giữ dialog, toast lỗi. Hủy → đóng dialog, không đổi gì (E1).
- [ ] Kiểm lại hiển thị "Người dùng đã xóa" khi `profiles.status = deleted` ở: tin trong SCR-05 (T-009), xem trước tin cuối SCR-03, thông báo SCR-10 (T-024); bổ sung chỗ còn thiếu.

### API / Backend
- [ ] `DELETE /api/me` (`deleteMe`): `withAuth`. Một transaction:
  - `users/{uid}`: `status=deleted`, `deleted_at=now`, `email_norm=null`, `updated_at`.
  - `profiles/{uid}`: `status=deleted`, `display_name=null`, `photo_url=null`, `email=null`, `updated_at`.
  - Xóa `email_index/{email_norm}`.
- [ ] Sau transaction: `auth.updateUser(uid, {disabled: true})` `[ASSUMED → Q-047]` + `auth.revokeRefreshTokens(uid)`; enqueue task `purgeAccount {uid}` (task queue, `id` = `purge-account-{uid}` để không đẩy trùng `[ASSUMED → Q-047]`); trả `202 {status:"deleted", deletedAt}`.
- [ ] Gọi lại `deleteMe` khi đã `deleted` → không xảy ra (withAuth chặn vì không còn tài khoản `active` → `403 CONSENT_REQUIRED` / token revoked → `401`).
- [ ] Function `purgeAccount` (`functions/`, 2nd gen, region `asia-southeast1`, retry + rate limit): idempotent, mỗi bước xử lý theo lô ≤ 500 ghi, chạy lại từ đầu an toàn:
  1. **Phòng** — query `rooms` where `member_uids array-contains uid` && `status == active`. Với từng phòng, trong một transaction (dùng lại domain rời phòng của T-018):
     - Là host và còn người khác → host mới = thành viên `active` có `joined_at` sớm nhất (index `idx_mem_join`); cập nhật `rooms.host_uid`, `members/{new}.role=host`; tin hệ thống `host_transferred`; thông báo `room_host_received` cho host mới với `room_name` (SUP-02).
     - Rời: `members/{uid}.status=left`, `left_at`; bỏ khỏi `member_uids`, `member_count−1`; tính lại `pair_key` và `read_only` (BR-13); tin hệ thống `member_left` (BR-24); cập nhật `last_message`; xóa RTDB `room_access/{roomId}/{uid}`.
     - Là người duy nhất → `rooms.status=deleted`, `deleted_at` → đẩy `purgeRoom` (T-017). Không tạo thông báo `room_disbanded` (Q-037).
  2. **Bạn bè** — xóa mọi `friendships` có `member_uids array-contains uid` (BR-12); không thông báo. Không đổi `read_only` của phòng 2 người còn lại vì A đã rời phòng ở bước 1.
  3. **Lời mời** — mọi `friend_requests` `pending` có `from_uid == uid` hoặc `to_uid == uid` → `closed`, `closed_reason=account_deleted`, `responded_at=now`, `expire_at=now+30 ngày`.
  4. **Chặn** — xóa mọi `blocks` có `blocker_uid == uid` hoặc `blocked_uid == uid` (cần query theo `blocked_uid` → xem Data).
  5. **Thông báo** — xóa toàn bộ `users/{uid}/notifications`.
  6. **RTDB** — xóa `status/{uid}`, `typing/*/{uid}` (nếu còn).
  7. **Firebase Auth** — `auth.deleteUser(uid)` (bước cuối; bỏ qua nếu đã xóa).
- [ ] Log chỉ ghi `uid`, số phòng / quan hệ đã xử lý; không ghi email / tên (NFR-27).

### Data
- [ ] Index phục vụ `purgeAccount`: `blocks` (`blocked_uid`) — single-field mặc định đủ cho equality; `friend_requests` (`from_uid`, `status`) và (`to_uid`, `status`) dùng `idx_fr_from`, `idx_fr_to` sẵn có; `members` `idx_mem_join` (T-018).
- [ ] Không đổi rules (mọi ghi qua Admin SDK). Kiểm rules hiện có: `profiles/{uid}` `deleted` vẫn `get` được (để hiển thị "Người dùng đã xóa").
- [ ] Seed `npm run seed:delete-account-demo`: A host phòng X (thành viên B vào trước, D vào sau), A là thành viên phòng Y (host E), A một mình trong phòng Z, phòng 2 người A–B, A–B là bạn, A chặn C, F chặn A, lời mời A→G `pending` và H→A `pending`, A có 3 thông báo, A có tin cũ trong X.

### Khác
- [ ] Cấu hình queue `purgeAccount` trong `functions/` (retry tối đa 5, `maxConcurrentDispatches` 5) `[ASSUMED → Q-047]` thông số.
- [ ] Biến môi trường / cấu hình emulator cho task queue (Cloud Tasks emulator của Firebase) để chạy local.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A ở Cài đặt | Bấm "Xóa tài khoản" | Dialog cảnh báo đủ nội dung (không khôi phục, rời phòng, chuyển host, xóa bạn bè / lời mời / chặn, tin còn với tên "Người dùng đã xóa", đăng nhập lại = tài khoản mới); "Xóa vĩnh viễn" disabled tới khi tích checkbox | FLOW-11 bước 1–2, SCR-11 #13 |
| AC-2 | Dialog đang mở | Bấm "Hủy" (có hoặc chưa tích) | Dialog đóng, không gọi API, tài khoản giữ nguyên | FLOW-11 E1 |
| AC-3 | Đã tích checkbox | Bấm "Xóa vĩnh viễn" | `deleteMe` trả `202 {status:"deleted"}`; về SCR-01 "Tài khoản đã được xóa."; ngay lập tức `users/A.status=deleted`, `email_norm=null`; `profiles/A` có `status=deleted`, `display_name`, `photo_url`, `email` = null; không còn `email_index/a@gmail.com` | FLOW-11 bước 3–4, BR-28, NFR-18 |
| AC-4 | Ngay sau AC-3 | Gọi API bằng ID token cũ của A | `401 TOKEN_REVOKED` | NFR-11 |
| AC-5 | A là host phòng X với B (vào trước) và D (vào sau) | `purgeAccount` chạy xong | `rooms/X.host_uid = B`, `members/B.role = host`; X có tin hệ thống chuyển host và "A đã rời phòng"; `members/A.status = left`; A không còn trong `member_uids`; B có thông báo `room_host_received` "Bạn đã trở thành host phòng X"; D **không** nhận thông báo nào | FLOW-11 bước 5–6, BR-17, BR-24, SUP-02, Q-037 |
| AC-6 | A là thành viên thường phòng Y (host E, còn ≥ 2 người khác) | `purgeAccount` chạy xong | A bị bỏ khỏi Y, tin hệ thống "… đã rời phòng"; host Y không đổi; không ai nhận thông báo | FLOW-11 bước 6, Q-037 |
| AC-7 | A là người duy nhất trong phòng Z | `purgeAccount` chạy xong | `rooms/Z.status = deleted`; sau `purgeRoom` không còn tin / thành viên / ảnh `rooms/Z/` trong emulator; không có thông báo `room_disbanded` | FLOW-11 bước 5, SUP-08 |
| AC-8 | Phòng W gồm A, B, C; B và C không là bạn | `purgeAccount` chạy xong | W còn B, C, `member_count=2`, `pair_key = B_C`, `read_only = true` | BR-13, FLOW-11 bước 6 |
| AC-9 | A và B là bạn | `purgeAccount` chạy xong | Không còn `friendships/{A_B}`; B mở tab Bạn bè không thấy A; B không nhận thông báo | FLOW-11 bước 7, BR-12, Q-037 |
| AC-10 | Lời mời A→G và H→A đang `pending` | `purgeAccount` chạy xong | Cả hai `status=closed`, `closed_reason=account_deleted`, `expire_at` = responded_at + 30 ngày; G, H không nhận thông báo mới | FLOW-11 bước 7, BR-28 |
| AC-11 | H mở thông báo cũ "A đã gửi lời mời…" (nếu có) | Bấm hàng / bấm "Chấp nhận" | "Nội dung không còn hiệu lực" | FLOW-11 A2, FLOW-04 E1 |
| AC-12 | A chặn C; F chặn A | `purgeAccount` chạy xong | Không còn `blocks/A_C` và `blocks/F_A`; danh sách đã chặn của F không còn A | FLOW-11 bước 7, Q-029 |
| AC-13 | A có thông báo | `purgeAccount` chạy xong | `users/A/notifications` rỗng | database.md TBL-10 |
| AC-14 | A từng tạo link mời cho `moi@gmail.com` trước khi xóa | `moi@gmail.com` mở link | Thấy "Link không còn hiệu lực" (`410 INVITE_LINK_INVALID`) | FLOW-11 bước 7, BR-06 |
| AC-15 | A có tin cũ trong phòng X | B mở phòng X | Tin của A còn nguyên nội dung, người gửi hiện "Người dùng đã xóa", không có ảnh đại diện | FLOW-11 bước 8, BR-28 |
| AC-16 | `purgeAccount` đã chạy xong | Kiểm Firebase Auth emulator | Không còn user uid A | ADR-06, BR-28 |
| AC-17 | Sau AC-16 | A đăng nhập lại cùng Google `a@gmail.com` | Hiện dialog chính sách; đồng ý → uid mới, không có bạn bè, phòng, thông báo; `users/{uid cũ}` vẫn `deleted` | FLOW-11 A1, BR-28 |
| AC-18 | `purgeAccount` bị lỗi giữa chừng (giả lập ném lỗi sau bước Phòng) | Task retry | Lần chạy lại hoàn tất, không tạo trùng tin hệ thống / thông báo host, không lỗi khi phòng / quan hệ đã được dọn | ADR-11 (idempotent) |
| AC-19 | A tham gia 3 phòng, 600 thông báo, 30 bạn bè | Đo thời gian từ `deleteMe` tới khi `purgeAccount` xong trên emulator | Xong trong ≤ 5 phút (dưới mức ≤ 24h của NFR-18), không lỗi giới hạn 500 ghi | NFR-18 |
| AC-20 | — | Đọc log server + function khi xóa A | Không có chuỗi email / tên của A | NFR-27 |
| AC-21 | Trong khoảng sau `deleteMe` và trước khi `purgeAccount` xóa Auth user | A thử đăng nhập lại Google | Không vào được (tài khoản Auth bị vô hiệu), SCR-01 hiện "Đăng nhập chưa hoàn tất. Vui lòng thử lại." | `[ASSUMED → Q-047]` |
| AC-22 | `deleteMe` lỗi 5xx (giả lập) | Bấm "Xóa vĩnh viễn" | Dialog vẫn mở, toast lỗi; tài khoản không đổi | SCR-11.A5 Khi lỗi |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| `deleteMe` (emulator): `202`; kiểm `users`, `profiles` soft delete, `email_index` bị xóa; Auth user `disabled`; token cũ → `TOKEN_REVOKED`; task được enqueue 1 lần | AC-3, AC-4, AC-21 |
| `purgeAccount` handler gọi trực tiếp trên dữ liệu seed: phòng host + còn người → host = `joined_at` sớm nhất, tin hệ thống, thông báo đúng 1 cho host mới | AC-5 |
| Thành viên thường rời phòng, không thông báo | AC-6 |
| Phòng chỉ có A → `deleted` + `purgeRoom` được enqueue | AC-7 |
| Phòng 3 người → còn 2 không là bạn → `read_only=true`, `pair_key` | AC-8 |
| Friendships / lời mời / blocks / notifications được dọn đúng | AC-9, AC-10, AC-12, AC-13 |
| `openInviteLink` với token của A sau khi xóa → `410 INVITE_LINK_INVALID` (tái dùng test T-011) | AC-14 |
| Auth user bị xóa ở bước cuối | AC-16 |
| `createSession` + `createAccount` với cùng email, uid mới → tài khoản mới sạch | AC-17 |
| Idempotent: chạy `purgeAccount` 2 lần / ném lỗi sau bước 1 rồi chạy lại → kết quả giống chạy 1 lần, không trùng tin / thông báo | AC-18 |
| Hiệu năng: seed 3 phòng, 600 thông báo, 30 bạn → đo thời gian handler, kiểm số batch | AC-19 |
| Bắt log stream của API + function → không chứa email / tên A | AC-20 |
| Component test dialog: nút disabled tới khi tích; Hủy không gọi API; lỗi giữ dialog | AC-1, AC-2, AC-22 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Seed demo → A Cài đặt → Xóa tài khoản → tích → Xóa vĩnh viễn → thấy "Tài khoản đã được xóa." → chờ `purgeAccount` (poll emulator ≤ 60s) → đăng nhập B → tab Bạn bè không có A → mở phòng X: tin A hiện "Người dùng đã xóa", B là host → tab Thông báo có "Bạn đã trở thành host phòng X" | AC-3, AC-5, AC-9, AC-15 |
| A đăng nhập lại sau khi purge → dialog chính sách → đồng ý → trang Phòng rỗng | AC-17 |

### Dữ liệu seed / tiền điều kiện
- `npm run seed:delete-account-demo` (mục 3 Data): A `a@gmail.com`, B, C, D, E, F, G, H, `moi@gmail.com` chưa đăng ký; phòng X (host A, B vào trước D), Y (host E, A thành viên, thêm 2 người), Z (chỉ A), W (A, B, C — B và C không là bạn); A–B bạn; A chặn C; F chặn A; lời mời A→G, H→A `pending` + thông báo của H; A có 3 thông báo; A có tin trong X; 1 link mời A tạo cho `moi@gmail.com` (lưu token trong file seed output).
- Emulator chạy đủ Functions + Cloud Tasks emulator.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | Chạy seed, đăng nhập A (375×812) → Cài đặt → "Xóa tài khoản" | Dialog cảnh báo đủ ý; "Xóa vĩnh viễn" mờ | AC-1 |
| 2 | Bấm "Hủy" | Đóng dialog; Firestore không đổi | AC-2 |
| 3 | Mở lại → tích → "Xóa vĩnh viễn" | Về SCR-01 "Tài khoản đã được xóa."; Firestore `users/A.status=deleted`, `profiles/A` không còn tên / ảnh / email, `email_index/a@gmail.com` mất | AC-3 |
| 4 | Ngay lập tức bấm đăng nhập lại A | Không vào được, "Đăng nhập chưa hoàn tất. Vui lòng thử lại." | AC-21 |
| 5 | Đợi log function `purgeAccount` báo xong (Emulator UI → Logs) | Hoàn tất ≤ 5 phút | AC-19 |
| 6 | Đăng nhập B → tab Bạn bè | Không có A | AC-9 |
| 7 | B mở phòng X | Tin cũ của A hiện "Người dùng đã xóa"; có tin hệ thống chuyển host và A rời phòng; B là host | AC-5, AC-15 |
| 8 | B → tab Thông báo | "Bạn đã trở thành host phòng X" | AC-5 |
| 9 | Đăng nhập D → tab Thông báo | Không có thông báo mới | AC-5 |
| 10 | Emulator UI: phòng Y, Z, W | Y: A đã rời, host E; Z: `deleted`, sau ít giây không còn subcollection; W: `read_only=true` | AC-6, AC-7, AC-8 |
| 11 | Emulator UI: `friend_requests`, `blocks`, `users/A/notifications` | Lời mời `closed (account_deleted)`; không còn `A_C`, `F_A`; thông báo A rỗng | AC-10, AC-12, AC-13 |
| 12 | Đăng nhập H → Thông báo → bấm thông báo lời mời của A | "Nội dung không còn hiệu lực" | AC-11 |
| 13 | Mở link mời của A bằng `moi@gmail.com` | "Link không còn hiệu lực" | AC-14 |
| 14 | Auth emulator | Không còn user A cũ | AC-16 |
| 15 | Đăng nhập lại `a@gmail.com` → đồng ý chính sách | Tài khoản mới: trang Phòng rỗng, không bạn bè, không thông báo | AC-17 |
| 16 | Xem terminal Next + log function | Không có `a@gmail.com` / tên A | AC-20 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] `purgeAccount` dùng lại domain rời phòng / chuyển host (T-018) và `purgeRoom` (T-017), không nhân bản logic
- [ ] Test idempotent (chạy lại sau lỗi) pass
- [ ] Runbook ghi cách theo dõi / chạy lại task `purgeAccount` thất bại

## 7. Ghi chú
- `[ASSUMED → Q-047]` `deleteMe` đặt Firebase Auth user `disabled: true` ngay (spec chỉ nêu `revokeRefreshTokens`) để người dùng không đăng nhập lại được bằng **cùng uid** trong lúc `purgeAccount` chưa xóa Auth user; nếu không, `createSession` sẽ gặp uid có `users.status = deleted` — trường hợp spec chưa định nghĩa.
- `[ASSUMED → Q-047]` Khi host bị xóa tài khoản, phòng có 2 tin hệ thống: chuyển host (`host_transferred`) rồi rời phòng (`member_left`) — BR-24 yêu cầu cả hai sự kiện sinh tin hệ thống.
- `[ASSUMED → Q-047]` Task id `purge-account-{uid}` để chống enqueue trùng; queue retry 5 lần, 5 dispatch đồng thời.
- `[ASSUMED → Q-047]` Phòng còn đúng 1 người sau khi A rời → `read_only = false` (BR-13 chỉ áp cho phòng đúng 2 người).
- `[ASSUMED → Q-047]` Ngưỡng ≤ 5 phút đo trên emulator chỉ để kiểm hồi quy; NFR-18 gốc là ≤ 24h.
- **Đề xuất point:** checklist gồm UI + API tức thì + function 7 bước có transaction từng phòng, tính lại `read_only`, thông báo, gọi `purgeRoom`, idempotent + retry và test hiệu năng — ước tính **8 point** (lệch 1 bậc so với 5). Giữ 5 trong file theo slices.md; đề xuất hoặc nâng lên 8, hoặc tách: (a) "Xóa tài khoản tức thì" — UI + `deleteMe` + soft delete + revoke/disable + enqueue (3 point); (b) "Dọn dữ liệu tài khoản đã xóa" — `purgeAccount` bước 1–7 (5 point).
