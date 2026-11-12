# Database Tables

> Thiết kế tổng thể & ERD: `specs/database-design.md` · DBMS: Firestore + Realtime Database (ADR-04, ADR-05) · Cập nhật: 2026-11-12
>
> **Quy ước kiểu (Firestore):** `string`, `bool`, `int` (integer), `timestamp`, `array<…>`, `map{…}`, `null`. "Null = YES" nghĩa là field có thể vắng hoặc `null`. "Default" do server đặt khi tạo. "Ràng buộc" kiểm ở server (Zod + transaction) vì client không được ghi (ADR-03).

## Danh sách bảng
| ID | Bảng (đường dẫn) | Mô tả | ENT |
|---|---|---|---|
| TBL-01 | `users/{uid}` | Tài khoản – phần riêng tư | ENT-01 |
| TBL-02 | `profiles/{uid}` | Tài khoản – phần công khai | ENT-01 |
| TBL-03 | `email_index/{email_norm}` | Tra email → uid, đảm bảo email duy nhất | ENT-01 |
| TBL-04 | `friend_requests/{id}` | Lời mời kết bạn | ENT-02 |
| TBL-05 | `friendships/{uidMin_uidMax}` | Quan hệ bạn bè đang hiệu lực | ENT-04 |
| TBL-06 | `blocks/{blocker_blocked}` | Quan hệ chặn đang hiệu lực | ENT-05 |
| TBL-07 | `rooms/{roomId}` | Phòng chat | ENT-06 |
| TBL-08 | `rooms/{roomId}/members/{uid}` | Thành viên phòng | ENT-07 |
| TBL-09 | `rooms/{roomId}/messages/{messageId}` | Tin nhắn + ảnh đính kèm | ENT-08, ENT-09 |
| TBL-10 | `users/{uid}/notifications/{id}` | Thông báo | ENT-10 |
| TBL-11 | `config/limits` | Giới hạn nghiệp vụ chỉnh được | — (NFR-08) |
| TBL-12 | RTDB `status/{uid}` | Online / offline | — (SUP-09) |
| TBL-13 | RTDB `typing/{roomId}/{uid}` | Đang soạn tin | — (SUP-09) |
| TBL-14 | RTDB `room_access/{roomId}/{uid}` | Bản sao thành viên cho RTDB rules | ENT-07 (mirror) |

ENT-03 Link mời: không lưu (ADR-08). Payload token: `{v: int, inviter_uid: string, email_norm: string, exp: int (epoch giây)}` mã hóa AES-256-GCM.

---

## TBL-01 `users/{uid}`
**Mô tả:** Phần riêng tư của tài khoản, chỉ chủ đọc. · **ENT:** ENT-01 · **Dùng bởi BIZ:** BIZ-01, BIZ-02, BIZ-03, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) uid | string | NO | uid Firebase Auth | PK | Mỗi lần đăng nhập lại sau khi xóa → uid mới (BR-28) |
| email_norm | string | YES | | lowercase + trim; null khi `deleted` | Email Google chuẩn hóa; khớp TBL-03 |
| anonymous | bool | NO | true | | Chế độ ẩn danh (BR-02) |
| show_online | bool | NO | true | | Hiển thị online (BR-25) |
| status | string | NO | `active` | enum | Vòng đời ENT-01 |
| consent_at | timestamp | NO | | | Thời điểm đồng ý chính sách quyền riêng tư (NFR-17) |
| last_active_at | timestamp | NO | now | | Cập nhật tối đa 1 lần / giờ; quá 30 ngày → thu hồi phiên (NFR-11) |
| lookup_window | map{start: timestamp, count: int} | YES | | count ≤ `config.email_lookups_per_hour` | Giới hạn tra email (NFR-16) |
| created_at | timestamp | NO | now | | Thời điểm tham gia |
| updated_at | timestamp | NO | now | | |
| deleted_at | timestamp | YES | | | Khi xóa tài khoản (BIZ-11) |

**Indexes:** không cần composite (truy cập theo doc id).
**Foreign keys:** `uid` ↔ TBL-02 (cùng id), TBL-03 (`email_index.uid`). Xóa tài khoản: soft delete (giữ document, xóa `email_norm`), `purgeAccount` dọn phụ thuộc.

**Enum / giá trị hợp lệ**
| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| status | `active` | Đang hoạt động |
| status | `deleted` | Đã xóa (BR-28) |

---

## TBL-02 `profiles/{uid}`
**Mô tả:** Phần công khai: bạn bè và người chung phòng thấy (BR-27). Rules: `get` khi đã đăng nhập, **cấm `list`**. · **ENT:** ENT-01 · **Dùng bởi BIZ:** BIZ-01, BIZ-02, BIZ-06, BIZ-09, BIZ-10, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) uid | string | NO | | PK, = TBL-01 | |
| display_name | string | YES | Tên Google; thiếu → phần trước "@" của email | 1–50 ký tự sau trim; null khi `deleted` | BR-29, Q-037 |
| display_name_custom | bool | NO | false | | true sau khi người dùng tự đổi tên → đăng nhập không ghi đè (Q-029) |
| photo_url | string | YES | Ảnh Google | null khi `deleted` | Cập nhật theo Google mỗi lần đăng nhập (Q-029) |
| email | string | YES | | null khi `deleted` | Email hiển thị cho bạn bè / người chung phòng (BR-27) |
| status | string | NO | `active` | enum như TBL-01 | `deleted` → client hiện "Người dùng đã xóa" (BR-28) |
| updated_at | timestamp | NO | now | | |

**Indexes:** không. · **Foreign keys:** `uid` → TBL-01, cùng vòng đời.

---

## TBL-03 `email_index/{email_norm}`
**Mô tả:** Map email → uid cho tài khoản **đang hoạt động**. Chỉ server đọc / ghi. · **ENT:** ENT-01 · **Dùng bởi BIZ:** BIZ-01, BIZ-03, BIZ-05, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) email_norm | string | NO | | PK → **email duy nhất** | |
| uid | string | NO | | → TBL-01 | |
| created_at | timestamp | NO | now | | |

**Foreign keys**
| Cột | Tham chiếu | On delete |
|---|---|---|
| uid | TBL-01 | Xóa document này khi tài khoản → `deleted` (cùng transaction) → email dùng lại được cho tài khoản mới (BR-28) |

---

## TBL-04 `friend_requests/{id}`
**Mô tả:** Lời mời kết bạn. · **ENT:** ENT-02 · **Dùng bởi BIZ:** BIZ-03, BIZ-04, BIZ-05, BIZ-07, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) id | string | NO | auto-id | PK | |
| from_uid | string | NO | | → TBL-01; ≠ to_uid | Người gửi |
| to_uid | string | NO | | → TBL-01, status active | Người nhận |
| channel | string | NO | | enum | `in_app` / `link` |
| status | string | NO | `pending` | enum; tối đa 1 `pending` cho mỗi (from_uid, to_uid) – kiểm trong transaction | BR-08 |
| closed_reason | string | YES | | enum, chỉ khi `closed` | |
| created_at | timestamp | NO | now | | |
| responded_at | timestamp | YES | | | Lúc chấp nhận / từ chối / thu hồi / đóng; dùng cho BR-10 (24h) |
| expire_at | timestamp | YES | | TTL | Đặt = responded_at + 30 ngày khi rời `pending` (Q-043); null khi `pending` (BR-08 không tự hết hạn) |

**Indexes**
| Tên | Cột | Loại | Lý do |
|---|---|---|---|
| idx_fr_to | to_uid, status, created_at desc | composite | Lời mời đã nhận |
| idx_fr_from | from_uid, status, created_at desc | composite | Lời mời đã gửi |
| idx_fr_pair | from_uid, to_uid, status, responded_at desc | composite | BR-08 (1 pending / chiều), BR-10 (24h sau từ chối) |
| ttl_fr | expire_at | TTL policy | Dọn lời mời đã kết thúc |

**Foreign keys**
| Cột | Tham chiếu | On delete |
|---|---|---|
| from_uid, to_uid | TBL-01 | Tài khoản bị xóa → lời mời `pending` → `closed` (`account_deleted`) bởi `purgeAccount` |

**Enum / giá trị hợp lệ**
| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| channel | `in_app` | Gửi trong platform (FLOW-03) |
| channel | `link` | Phát sinh khi mở link mời (FLOW-05) |
| status | `pending` | Đang chờ |
| status | `accepted` | Đã chấp nhận |
| status | `rejected` | Đã từ chối |
| status | `withdrawn` | Đã thu hồi |
| status | `closed` | Đã đóng |
| closed_reason | `became_friends` | Thành bạn qua lời mời ngược chiều (BR-09) |
| closed_reason | `blocked` | Một bên chặn (BR-14) |
| closed_reason | `account_deleted` | Một bên xóa tài khoản (BR-28) |

---

## TBL-05 `friendships/{uidMin_uidMax}`
**Mô tả:** Quan hệ bạn bè **đang hiệu lực**. Có document = đang là bạn; hủy = xóa document (Q-043). · **ENT:** ENT-04 · **Dùng bởi BIZ:** BIZ-04, BIZ-06, BIZ-07, BIZ-08, BIZ-09, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) pair_id | string | NO | `uidMin_uidMax` (sắp xếp) | PK → tối đa 1 quan hệ / cặp | |
| member_uids | array<string> | NO | | đúng 2 phần tử, khác nhau | Truy vấn danh sách bạn bè |
| since | timestamp | NO | now | | Thời điểm kết bạn |
| request_id | string | YES | | → TBL-04 | Lời mời đã tạo quan hệ |

**Indexes**
| Tên | Cột | Loại | Lý do |
|---|---|---|---|
| idx_fs_member | member_uids array-contains, since desc | composite | Danh sách bạn bè |

**Foreign keys**
| Cột | Tham chiếu | On delete |
|---|---|---|
| member_uids | TBL-01 | Một bên xóa tài khoản / chặn / hủy → xóa document (BR-12) |

---

## TBL-06 `blocks/{blocker_blocked}`
**Mô tả:** Quan hệ chặn một chiều đang hiệu lực. Bỏ chặn = xóa document. · **ENT:** ENT-05 · **Dùng bởi BIZ:** BIZ-03, BIZ-05, BIZ-07, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) id | string | NO | `{blocker_uid}_{blocked_uid}` | PK → không chặn trùng | A chặn B và B chặn A là 2 document (BR-14) |
| blocker_uid | string | NO | | → TBL-01 | |
| blocked_uid | string | NO | | → TBL-01; ≠ blocker_uid | |
| created_at | timestamp | NO | now | | |

**Indexes**
| Tên | Cột | Loại | Lý do |
|---|---|---|---|
| idx_bl_blocker | blocker_uid, created_at desc | composite | Danh sách đã chặn (chỉ người chặn đọc – BR-14) |

Kiểm "có quan hệ chặn" giữa A, B = `get` 2 document `A_B`, `B_A`.

**Foreign keys**
| Cột | Tham chiếu | On delete |
|---|---|---|
| blocker_uid, blocked_uid | TBL-01 | Một bên xóa tài khoản → xóa document (Q-029) |

---

## TBL-07 `rooms/{roomId}`
**Mô tả:** Phòng chat. · **ENT:** ENT-06 · **Dùng bởi BIZ:** BIZ-04, BIZ-06, BIZ-07, BIZ-08, BIZ-09, BIZ-10, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) id | string | NO | auto-id | PK | |
| name | string | YES | | ≤50 ký tự (Q-037); null/rỗng → hiển thị tên thành viên | Q-012 |
| host_uid | string | NO | người tạo | ∈ member_uids | Đúng 1 host (BR-17) |
| retention | string | NO | | enum; không đổi sau khi tạo | BR-16 |
| ttl_days | int | YES | | ∈ {1, 2, 3, 7, 30, 90} khi `short`; null khi `long`; không đổi | BR-16 |
| status | string | NO | `active` | enum | Vòng đời ENT-06 |
| member_uids | array<string> | NO | | 1–50 phần tử (`config.max_room_members`); khi tạo ≥2 | Thành viên đang tham gia; dùng cho rules + danh sách phòng (BR-15) |
| member_count | int | NO | | = len(member_uids) | |
| pair_key | string | YES | | `uidMin_uidMax` khi member_count = 2, ngược lại null | BR-13 |
| read_only | bool | NO | false | server tính | true khi member_count = 2 và (không là bạn hoặc có chặn) – BR-13 |
| last_message | map{id, kind, sender_uid, text_preview, image_count, status, created_at, expire_at} | YES | | text_preview ≤100 ký tự | Tóm tắt phòng (SUP-04); client ẩn nếu đã quá expire_at |
| last_message_at | timestamp | NO | = created_at | | Sắp xếp danh sách phòng |
| created_by | string | NO | | → TBL-01 | |
| created_at | timestamp | NO | now | | |
| updated_at | timestamp | NO | now | | |
| deleted_at | timestamp | YES | | | Khi giải tán / người cuối rời |
| schema_version | int | NO | 1 | | |

**Indexes**
| Tên | Cột | Loại | Lý do |
|---|---|---|---|
| idx_rooms_member | member_uids array-contains, status, last_message_at desc | composite | Danh sách phòng (NFR-03) |
| idx_rooms_pair | pair_key, status | composite | Tìm phòng 2 người của một cặp (BR-13) |
| — | last_message | tắt index | Giảm chi phí ghi |

**Foreign keys**
| Cột | Tham chiếu | On delete |
|---|---|---|
| host_uid | TBL-01 | Host xóa tài khoản → chuyển cho thành viên vào sớm nhất; không còn ai → phòng `deleted` (BR-28) |
| (subcollections) | TBL-08, TBL-09 | Phòng `deleted` → `purgeRoom` xóa đệ quy + ảnh Storage |

**Enum / giá trị hợp lệ**
| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| retention | `short` | Ngắn hạn |
| retention | `long` | Lâu dài |
| status | `active` | Đang hoạt động |
| status | `deleted` | Đã xóa |

---

## TBL-08 `rooms/{roomId}/members/{uid}`
**Mô tả:** Lần tham gia hiện tại của một người trong phòng. Thêm lại sau khi rời / bị kick → ghi đè document, `joined_at` mới. · **ENT:** ENT-07 · **Dùng bởi BIZ:** BIZ-08, BIZ-09, BIZ-10, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) uid | string | NO | | PK → mỗi người 1 lần tham gia hiệu lực / phòng | |
| role | string | NO | `member` | enum; đúng 1 `host` / phòng, khớp `rooms.host_uid` | BR-17 |
| status | string | NO | `active` | enum; `active` ⇔ uid ∈ `rooms.member_uids` (cùng transaction) | |
| joined_at | timestamp | NO | now | | Chọn host mới khi host xóa tài khoản (BR-28) |
| added_by | string | YES | | → TBL-01; null với host tạo phòng; phải là bạn của uid lúc thêm | BR-18 |
| left_at | timestamp | YES | | | Khi `left` / `kicked` |
| last_read_at | timestamp | NO | = joined_at | | Đã xem (BR-26) + đếm chưa đọc (SUP-04); server cập nhật khi mở phòng / có tin mới đã hiện / tự gửi tin |

**Indexes**
| Tên | Cột | Loại | Lý do |
|---|---|---|---|
| idx_mem_join | status, joined_at asc | composite | Host mới = thành viên `active` vào sớm nhất (BR-28) |

**Foreign keys**
| Cột | Tham chiếu | On delete |
|---|---|---|
| uid | TBL-01 | Xóa tài khoản → `left` (BR-28) |
| (parent) | TBL-07 | Xóa cùng phòng (`purgeRoom`) |

**Enum / giá trị hợp lệ**
| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| role | `host` / `member` | Host / Thành viên |
| status | `active` | Đang tham gia |
| status | `left` | Đã rời |
| status | `kicked` | Bị kick |

---

## TBL-09 `rooms/{roomId}/messages/{messageId}`
**Mô tả:** Tin nhắn người dùng và tin hệ thống; ảnh nhúng (ENT-09). · **ENT:** ENT-08, ENT-09 · **Dùng bởi BIZ:** BIZ-08, BIZ-09, BIZ-10, BIZ-11

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) id | string | NO | auto-id (client sinh, gửi kèm) | PK | Client sinh trước để gửi lại không trùng (NFR-10) |
| kind | string | NO | | enum | `user` / `system` (Q-026) |
| sender_uid | string | YES | | → TBL-01; null khi `system`; phải là thành viên `active`, phòng không `read_only` | BR-13, BR-20 |
| text | string | YES | | `user`: text hoặc images phải có (BR-21); ≤1000 ký tự (Q-043) | Mã hóa khi lưu theo mặc định Google (ADR-07) |
| images | array<map{path, content_type, size_bytes, width, height}> | YES | [] | ≤10 phần tử; tổng size_bytes ≤ 10485760; content_type `image/*` | ENT-09, BR-21 |
| system_event | map{type, actor_uid, target_uid, room_name} | YES | | chỉ khi `system` | BR-24 |
| status | string | NO | `sent` | enum | Vòng đời ENT-08 |
| created_at | timestamp | NO | now (server) | | |
| recalled_at | timestamp | YES | | | BR-22 |
| expire_at | timestamp | YES | | = created_at + ttl_days khi phòng `short`; null khi `long` | TTL (BR-16, NFR-19) |
| schema_version | int | NO | 1 | | |

**Indexes**
| Tên | Cột | Loại | Lý do |
|---|---|---|---|
| (mặc định) | created_at | single-field | 50 tin mới nhất (NFR-03) |
| idx_msg_unread | kind, created_at | composite | `count()` tin chưa đọc: `kind = user` và `created_at > last_read_at` – không tính tin hệ thống (SUP-04, Q-047) |
| ttl_msg | expire_at | TTL policy (collection group) | NFR-19 |
| — | text, images, system_event | tắt index | Giảm chi phí |

**Foreign keys**
| Cột | Tham chiếu | On delete |
|---|---|---|
| sender_uid | TBL-01 | Giữ tin; hiển thị "Người dùng đã xóa" (BR-28) |
| images[].path | Cloud Storage | Thu hồi → API xóa file + `images = []`; hết hạn → lifecycle `customTime`; phòng xóa → `purgeRoom` |
| (parent) | TBL-07 | Xóa cùng phòng |

**Enum / giá trị hợp lệ**
| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| kind | `user` / `system` | Tin người dùng / tin hệ thống |
| status | `sent` | Đã gửi |
| status | `recalled` | Đã thu hồi (text = null, images = []) |
| system_event.type | `room_created`, `member_added`, `member_kicked`, `member_left`, `host_transferred`, `room_renamed` | BR-24 |

---

## TBL-10 `users/{uid}/notifications/{id}`
**Mô tả:** Thông báo in-app. · **ENT:** ENT-10 · **Dùng bởi BIZ:** BIZ-03, BIZ-04, BIZ-05, BIZ-08, BIZ-09, BIZ-11 (SUP-01, SUP-02, SUP-03, SUP-06)

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| (doc id) id | string | NO | auto-id | PK | |
| type | string | NO | | enum (7 loại) | Q-030 |
| actor_uid | string | YES | | → TBL-01 | Người gây ra sự kiện |
| ref_type | string | NO | | enum | `friend_request` / `room` |
| ref_id | string | NO | | | id lời mời / phòng |
| room_name | string | YES | | | Ảnh chụp tên phòng lúc tạo thông báo (Q-037: thông báo giải tán giữ tên phòng) |
| read | bool | NO | false | | |
| read_at | timestamp | YES | | | |
| created_at | timestamp | NO | now | | |
| expire_at | timestamp | NO | created_at + 30 ngày | | TTL (NFR-21) |

**Indexes**
| Tên | Cột | Loại | Lý do |
|---|---|---|---|
| idx_noti_list | read, created_at desc | composite | Badge chưa đọc + danh sách (SUP-03) |
| ttl_noti | expire_at | TTL policy | SUP-06 |

**Foreign keys**
| Cột | Tham chiếu | On delete |
|---|---|---|
| (parent uid) | TBL-01 | Xóa tài khoản → `purgeAccount` xóa cả subcollection |
| ref_id | TBL-04 / TBL-07 | Không ràng buộc; đối tượng mất → "Nội dung không còn hiệu lực" (FLOW-12 A1) |

**Enum / giá trị hợp lệ**
| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| type | `friend_request_received` | Có lời mời kết bạn mới (SUP-01) |
| type | `friend_request_rejected` | Lời mời bị từ chối (SUP-01) |
| type | `friend_request_accepted` | Đã thành bạn (SUP-01) |
| type | `room_member_added` | Được thêm vào phòng (SUP-02) |
| type | `room_member_kicked` | Bị kick (SUP-02) |
| type | `room_disbanded` | Phòng bị giải tán (SUP-02) |
| type | `room_host_received` | Được nhận quyền host (SUP-02) |

---

## TBL-11 `config/limits`
**Mô tả:** Một document chứa giới hạn chỉnh được (NFR-08). Server đọc (cache 5 phút); client nhận qua API. · **Dùng bởi BIZ:** BIZ-02, BIZ-03, BIZ-08, BIZ-09, BIZ-10

| Cột | Kiểu | Null | Default | Mô tả / BR |
|---|---|---|---|---|
| max_room_members | int | NO | 50 | BR-15 |
| max_images_per_message | int | NO | 10 | BR-21 |
| max_image_bytes_per_message | int | NO | 10485760 | BR-21 |
| ttl_days_options | array<int> | NO | [1, 2, 3, 7, 30, 90] | BR-16 |
| invite_ttl_days | int | NO | 7 | BR-06 |
| notification_ttl_days | int | NO | 30 | NFR-21 |
| email_lookups_per_hour | int | NO | 100 | NFR-16 |
| reject_cooldown_hours | int | NO | 24 | BR-10 |
| max_message_chars | int | NO | 1000 | Q-043 |
| ended_request_ttl_days | int | NO | 30 | Q-043 |
| display_name_max | int | NO | 50 | BR-29 |
| room_name_max | int | NO | 50 | Q-037 |
| session_idle_days | int | NO | 30 | NFR-11 |
| updated_at | timestamp | NO | now | |

---

## TBL-12 RTDB `status/{uid}`
**Mô tả:** Presence. Client ghi node của mình; `onDisconnect` đặt offline. · **Dùng bởi:** BIZ-02, BIZ-06, BIZ-09, BIZ-10 (SUP-09)

| Cột | Kiểu | Null | Default | Ràng buộc | Mô tả / BR |
|---|---|---|---|---|---|
| state | string | NO | | `online` / `offline` | Client không ghi `online` khi `show_online = false` (BR-25) |
| last_changed | number (server timestamp) | NO | | | |

Client chỉ hiển thị online của bạn bè / người chung phòng, và chỉ khi chính mình bật `show_online` (BR-25).

## TBL-13 RTDB `typing/{roomId}/{uid}`
**Mô tả:** Đang soạn tin. Giá trị = server timestamp lần gõ gần nhất; client coi hết hiệu lực sau 5 giây; `onDisconnect().remove()`. · **Dùng bởi:** BIZ-10 (SUP-09)

| Cột | Kiểu | Null | Ràng buộc |
|---|---|---|---|
| (value) | number (server timestamp) | NO | Ghi: `auth.uid == uid` và `room_access/{roomId}/{uid}` tồn tại. Đọc: `room_access/{roomId}/{auth.uid}` tồn tại |

## TBL-14 RTDB `room_access/{roomId}/{uid}`
**Mô tả:** Bản sao `rooms.member_uids` cho RTDB rules. Server ghi cùng lúc với TBL-08 (thêm / rời / kick / xóa phòng). · **ENT:** ENT-07

| Cột | Kiểu | Null | Ràng buộc |
|---|---|---|---|
| (value) | bool `true` | NO | Chỉ server ghi; client không đọc |
