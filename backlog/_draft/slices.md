# Slices — phạm vi từng task

> Nguồn: `specs/ui-ux/wireframe.md` mục 4, `specs/api-contract.yml`, `specs/database.md`, `specs/tech-stack.md`, `idea/business-flows.md`, `idea/business.md` · Thiết lập: Q-045 · Cập nhật: 2026-11-13
>
> Quy ước: "Thao tác" là mã trong wireframe.md mục 4. Bảng / endpoint / rules / index được tạo **trong task đầu tiên cần đến nó**. Thông báo (TBL-10) được **tạo** ngay trong task của nghiệp vụ sinh ra nó; màn xem thông báo là T-024.

## Milestone
| Milestone | Mục tiêu demo | Task | Point |
|---|---|---|---|
| M0 | Walking skeleton: chạy local + emulator, CI xanh; người dùng mới đăng nhập Google, đồng ý chính sách, thấy trang Phòng rỗng, đăng xuất được | T-001 → T-003 | 10 |
| M1 | Hành trình chính: B tắt ẩn danh → A tra email B, gửi lời mời → B chấp nhận → A tạo phòng với B → hai người chat chữ realtime | T-004 → T-009 | 25 |
| M2 | Kết bạn đầy đủ & quyền riêng tư: link mời, thu hồi, hủy kết bạn (phòng chỉ đọc), chặn / bỏ chặn | T-010 → T-014 | 20 |
| M3 | Phòng & chat đầy đủ: quản lý thành viên, host, giải tán, ảnh, thu hồi, đã xem / chưa đọc, online / đang soạn, tin hết hạn | T-015 → T-023 | 36 |
| M4 | Thông báo & vòng đời tài khoản: trung tâm thông báo, phản hồi lời mời từ thông báo, xóa tài khoản | T-024 → T-026 | 12 |
| M5 | Hardening: chống dò email, vận hành / tải, responsive desktop & trình duyệt | T-027 → T-029 | 13 |
| | | **29 task** | **116** |

## Epic
| EPIC | Tên | BIZ / SUP | Task |
|---|---|---|---|
| EPIC-01 | Nền tảng & tài khoản | BIZ-01, BIZ-02, BIZ-11 | T-001, T-002, T-003, T-004, T-026 |
| EPIC-02 | Kết bạn | BIZ-03, BIZ-04, BIZ-05, BIZ-06, SUP-01, SUP-07 | T-005, T-006, T-007, T-010, T-011, T-012, T-013 |
| EPIC-03 | Chặn | BIZ-07 | T-014 |
| EPIC-04 | Phòng & thành viên | BIZ-08, BIZ-09, SUP-02 | T-008, T-015, T-016, T-017, T-018 |
| EPIC-05 | Nhắn tin | BIZ-10, SUP-04, SUP-05, SUP-08, SUP-09 | T-009, T-019, T-020, T-021, T-022, T-023 |
| EPIC-06 | Thông báo | SUP-03, SUP-06 | T-024, T-025 |
| EPIC-07 | Hardening & NFR | NFR | T-027, T-028, T-029 |

---

# M0 — Walking skeleton

## T-001 · Khởi tạo dự án chạy local + emulator, CI xanh
- **Epic / Milestone / Point:** EPIC-01 / M0 / 3
- **Demo:** Dev chạy `npm run dev` + `firebase emulators:start` → mở `http://localhost:3000/login` thấy màn Đăng nhập tĩnh (tiếng Việt, khung mobile); `GET /api/health` trả 200; GitHub Actions xanh (lint, typecheck, Vitest, Playwright smoke).
- **Thao tác:** (khung SCR-01, chưa có hành động)
- **operationId:** getHealth
- **TBL:** — (khai báo `firestore.rules` / `database.rules.json` / `storage.rules` deny-all, `firestore.indexes.json` rỗng)
- **BR / SUP / NFR:** NFR-24 (file từ điển tiếng Việt), NFR-12 (TLS / mã hóa mặc định – không cấu hình thêm), NFR-27 (logger có cấu trúc, không ghi nội dung nhạy cảm)
- **Kỹ thuật:** Next.js 16 App Router + TS + Tailwind + shadcn/ui; Firebase Emulator Suite (Auth, Firestore, RTDB, Storage, Functions); Vitest; Playwright (viewport 375×812); GitHub Actions; cấu trúc thư mục `app/`, `server/` (route handler, domain), `functions/`
- **FLOW:** —
- **Ngoài phạm vi:** đăng nhập thật (T-002); deploy App Hosting (ngoài môi trường kiểm tra – Q-045)
- **Phụ thuộc:** —

## T-002 · Đăng nhập Google lần đầu & đồng ý chính sách
- **Epic / Milestone / Point:** EPIC-01 / M0 / 5
- **Demo:** Người dùng mới mở app → "Đăng nhập với Google" (Auth emulator) → dialog chính sách → Đồng ý → thấy trang Phòng rỗng với thanh tab 4 mục; đăng nhập lại lần sau vào thẳng trang Phòng, ảnh cập nhật theo Google, tên tự sửa giữ nguyên.
- **Thao tác:** SCR-01.A1, SCR-01.A2, LAYOUT.A1, SCR-03 (trạng thái rỗng, chưa tải phòng)
- **operationId:** createSession, createAccount, getMe
- **TBL:** TBL-01, TBL-02, TBL-03 (tạo + rules đọc), TBL-11 (seed `config/limits`)
- **BR / SUP / NFR:** BR-01, BR-02 (ẩn danh mặc định bật), BR-28 (email từng xóa → tài khoản mới), BR-29 (tên mặc định ≤50, thiếu tên → phần trước "@"), NFR-11 (verifyIdToken checkRevoked, ghi `last_active_at`), NFR-13 (rules cấm ghi client, `profiles` cấm `list`), NFR-17 (đồng ý chính sách + `policyVersion`), NFR-22
- **Kỹ thuật:** auth guard (middleware + client), layout thanh tab (mobile), error handler chung + schema `Error`, Zod validation dùng chung, trang `/privacy` tĩnh
- **FLOW:** FLOW-01 bước 1–8, E1 (hủy Google), E2 (thiếu tên)
- **Ngoài phạm vi:** quay lại link mời sau đăng nhập (T-011); đăng xuất (T-003)
- **Phụ thuộc:** T-001

## T-003 · Đăng xuất & hết phiên sau 30 ngày không dùng
- **Epic / Milestone / Point:** EPIC-01 / M0 / 2
- **Demo:** Người dùng mở tab Cài đặt → thấy email, ảnh, tên, công tắc (chỉ xem) → bấm Đăng xuất → về màn Đăng nhập "Bạn đã đăng xuất". Đặt `last_active_at` lùi 31 ngày → mở app → về màn Đăng nhập "Phiên đăng nhập đã hết hạn".
- **Thao tác:** SCR-11.A0, SCR-11.A4
- **operationId:** deleteCurrentSession (+ kiểm phiên trong getMe / mọi API)
- **TBL:** TBL-01 (`last_active_at`)
- **BR / SUP / NFR:** NFR-11 (revokeRefreshTokens, `SESSION_EXPIRED`, `TOKEN_REVOKED`), Q-044 (đăng xuất mọi thiết bị)
- **FLOW:** FLOW-01 A1
- **Ngoài phạm vi:** sửa cài đặt (T-004); xóa tài khoản (T-026)
- **Phụ thuộc:** T-002

---

# M1 — Hành trình chính end-to-end

## T-004 · Cài đặt tài khoản: đổi tên, ẩn danh, hiển thị online
- **Epic / Milestone / Point:** EPIC-01 / M1 / 3
- **Demo:** Người dùng mở Cài đặt → đổi tên "Minh" → thấy tên mới ngay; gạt tắt Ẩn danh → lưu ngay; tên trống / >50 ký tự → lỗi, giữ tên cũ.
- **Thao tác:** SCR-11.A1, SCR-11.A2, SCR-11.A3
- **operationId:** updateMe
- **TBL:** TBL-01 (`anonymous`, `show_online`), TBL-02 (`display_name`, `display_name_custom`)
- **BR / SUP / NFR:** BR-02, BR-25 (chỉ lưu cài đặt; hiệu lực hiển thị online ở T-022), BR-29
- **FLOW:** FLOW-02 bước 1–7, A1 (lưu ngay khi gạt), E1
- **Ngoài phạm vi:** hiển thị online thật (T-022); danh sách đã chặn (T-014); xóa tài khoản (T-026)
- **Phụ thuộc:** T-003

## T-005 · Tra email & gửi lời mời kết bạn trong platform
- **Epic / Milestone / Point:** EPIC-02 / M1 / 5
- **Demo:** A mở Bạn bè → Thêm bạn → nhập email B (B đã tắt ẩn danh) → thấy tên, ảnh B + "Gửi lời mời" → bấm → thấy "Đang chờ phản hồi". Nhập email của chính mình / người chưa đăng ký / người ẩn danh → thấy đúng kết quả a / f (f chỉ có nút "Copy link mời", chưa bấm được).
- **Thao tác:** SCR-07.A1, SCR-07.A2; khung SCR-08 (nút Thêm bạn)
- **operationId:** createEmailLookup, createFriendRequest
- **TBL:** TBL-04 (tạo + rules + index `idx_fr_*`), TBL-05 / TBL-06 (đọc khi kiểm; tạo collection + rules), TBL-10 (tạo thông báo `friend_request_received` + rules + TTL field)
- **BR / SUP / NFR:** BR-03, BR-04 (6 kết quả, "không tìm thấy" giống hệt), BR-05, BR-08 (1 pending/chiều), BR-10 (hiện d khi bị từ chối <24h), SUP-01 (tạo), NFR-15 (nội dung giống hệt — phần thời gian đều ở T-027), Q-044 (chặn kiểm trước cooldown)
- **FLOW:** FLOW-03 bước 1–7, A1, A2, A3 (chỉ hiển thị "Đang chờ"), A4, A5, E1, E3
- **Ngoài phạm vi:** copy link (T-010); thu hồi (T-012); giới hạn 100 lượt/giờ + thời gian đều (T-027)
- **Phụ thuộc:** T-004

## T-006 · Xem lời mời & chấp nhận / từ chối
- **Epic / Milestone / Point:** EPIC-02 / M1 / 5
- **Demo:** B thấy badge trên tab Bạn bè → mở Lời mời → tab Đã nhận có lời mời của A → Chấp nhận → A và B là bạn. Trường hợp khác: B Từ chối → A tra lại email B thấy "Chưa thể gửi lại, thử lại sau…"; B mời lại A được ngay.
- **Thao tác:** SCR-09.A0, SCR-09.A1, SCR-09.A2, SCR-09.A3, LAYOUT.A3 (phần số lời mời đang chờ); link "Xem lời mời đã gửi" ở SCR-07 (Q-047)
- **operationId:** acceptFriendRequest, rejectFriendRequest
- **TBL:** TBL-04 (cập nhật trạng thái, `expire_at` 30 ngày + TTL policy), TBL-05 (tạo quan hệ), TBL-10 (`friend_request_accepted`, `friend_request_rejected`)
- **BR / SUP / NFR:** BR-09 (lời mời ngược chiều tự đóng; từ chối trước – chấp nhận sau vẫn thành bạn), BR-10, BR-11, SUP-01 (tạo), Q-029 (thu hồi trùng lúc chấp nhận → chấp nhận thắng – phía accept)
- **FLOW:** FLOW-04 bước 1–3, C1, C2, C4, A2, A4, E1, E2
- **Ngoài phạm vi:** mở lại phòng chỉ đọc khi kết bạn lại (C3 – T-013); từ chối khi đã là bạn → gợi ý hủy (A1 – T-013); chặn từ lời mời (T-014); thu hồi (T-012)
- **Phụ thuộc:** T-005

## T-007 · Danh sách bạn bè
- **Epic / Milestone / Point:** EPIC-02 / M1 / 2
- **Demo:** A mở tab Bạn bè → thấy B (tên, ảnh, email), sắp A→Z; chưa có bạn → trạng thái rỗng với nút "Thêm bạn".
- **Thao tác:** SCR-08.A0, SCR-08.A3 (NAV)
- **operationId:** — (FS listener `friendships`)
- **TBL:** TBL-05 (index `idx_fs_member`), TBL-02 (get)
- **BR / SUP / NFR:** BR-27
- **FLOW:** FLOW-06 bước 1–2 (phần xem)
- **Ngoài phạm vi:** online (T-022); hủy kết bạn (T-013); chặn (T-014)
- **Phụ thuộc:** T-006

## T-008 · Tạo phòng & danh sách phòng
- **Epic / Milestone / Point:** EPIC-04 / M1 / 5
- **Demo:** A mở Phòng → Tạo phòng → chọn B, đặt tên, chọn Ngắn hạn 1 ngày → Tạo → vào phòng thấy tin hệ thống "A đã tạo phòng"; B (máy khác) thấy phòng xuất hiện trong danh sách ngay. Chưa có bạn → gợi ý mời bạn.
- **Thao tác:** SCR-04.A0, SCR-04.A1, SCR-03.A0, SCR-03.A2 (NAV)
- **operationId:** createRoom
- **TBL:** TBL-07 (gồm `pair_key` khi 2 người), TBL-08, TBL-09 (tin hệ thống), TBL-10 (`room_member_added`), TBL-14 (RTDB `room_access`) — tạo + rules + index `idx_rooms_member`
- **BR / SUP / NFR:** BR-15 (1–49 người, đều là bạn), BR-16 (chế độ lưu + thời hạn, không đổi), BR-17, BR-18, BR-24, SUP-02 (tạo thông báo được thêm), Q-037 (tên phòng ≤50)
- **FLOW:** FLOW-08 bước 1–8, A1, A2, E1, E2
- **Ngoài phạm vi:** số chưa đọc & tóm tắt tin cuối (T-021); quản lý phòng (T-015+)
- **Phụ thuộc:** T-007

## T-009 · Nhắn tin chữ realtime
- **Epic / Milestone / Point:** EPIC-05 / M1 / 5
- **Demo:** A mở phòng → gõ "Chào" → Gửi → B thấy ngay (≤1s); B cuộn lên tải tin cũ; tắt mạng A → gửi → "Gửi thất bại" → bật mạng → Gửi lại → B thấy đúng 1 tin; tin >1000 ký tự bị chặn.
- **Thao tác:** SCR-05.A0, SCR-05.A1, SCR-05.A6 (chữ), SCR-05.A7
- **operationId:** createMessage (PUT idempotent, chỉ `text`)
- **TBL:** TBL-09 (rules đọc theo `member_uids`), TBL-07 (`last_message`, `last_message_at`), TBL-08 (`last_read_at` người gửi)
- **BR / SUP / NFR:** BR-20 (chỉ thành viên active đọc/gửi), BR-21 (phần chữ, ≤1000 – Q-043), BR-23 (mặc định Google), BR-16 (ghi `expire_at` cho phòng ngắn hạn), BR-28 (hiển thị "Người dùng đã xóa" theo `profiles.status`), NFR-01, NFR-03 (50 tin + cuộn), NFR-10 (messageId client sinh, gửi lại idempotent, banner mất kết nối), SUP-09 (Firestore listener)
- **FLOW:** FLOW-10a bước 1–4, 6–10, A3, E1 (phần chữ), E2 (đóng phòng khi không còn quyền), E3
- **Ngoài phạm vi:** ảnh (T-019); thu hồi (T-020); đã xem / chưa đọc (T-021); đang soạn / online (T-022); ẩn tin hết hạn + TTL (T-023); phòng chỉ đọc (T-013)
- **Phụ thuộc:** T-008

---

# M2 — Kết bạn đầy đủ & quyền riêng tư

## T-010 · Tạo & copy link mời
- **Epic / Milestone / Point:** EPIC-02 / M2 / 3
- **Demo:** A tra email người chưa đăng ký → bấm "Copy link mời" → toast "Đã copy link mời…"; link dạng `/invite/{token}` không chứa email đọc được; sửa 1 ký tự token → server coi là không hợp lệ (unit test).
- **Thao tác:** SCR-07.A4
- **operationId:** createInviteLink
- **TBL:** — (không lưu – Q-033); khóa AES-256-GCM qua Secret Manager (emulator: biến môi trường)
- **BR / SUP / NFR:** BR-06, SUP-07, NFR-14, Q-034 (link cũ vẫn hiệu lực, không giới hạn)
- **FLOW:** FLOW-03 bước 8–11
- **Ngoài phạm vi:** mở link (T-011)
- **Phụ thuộc:** T-005

## T-011 · Mở link mời → đăng nhập → lời mời đang chờ
- **Epic / Milestone / Point:** EPIC-02 / M2 / 5
- **Demo:** C (chưa có tài khoản) mở link A gửi → bấm Đăng nhập → đăng nhập đúng email → đồng ý chính sách → quay lại thấy "A mời bạn kết bạn" → Chấp nhận → A và C là bạn. Đăng nhập sai email → "Link này không dành cho tài khoản của bạn" + "Đăng nhập tài khoản khác". Link hết hạn / đã là bạn → "Link không còn hiệu lực…".
- **Thao tác:** SCR-02.A0, SCR-02.A1 (NAV), SCR-02.A2, SCR-02.A3, SCR-02.A5; SCR-01 → SCR-02 khi đang mở dở link
- **operationId:** openInviteLink, acceptFriendRequest, rejectFriendRequest, deleteCurrentSession
- **TBL:** TBL-04 (`channel = link`), TBL-10
- **BR / SUP / NFR:** BR-06, BR-07, SUP-07, NFR-06 (SSR trang công khai), NFR-14, Q-029 (đã có lời mời chờ → dùng lại), Q-036 (mở lại sau từ chối → lời mời mới)
- **FLOW:** FLOW-05 bước 1–9, A1, A2, E1, E2; FLOW-01 bước 9
- **Ngoài phạm vi:** chặn người mời từ màn link (T-014)
- **Phụ thuộc:** T-010, T-006

## T-012 · Thu hồi lời mời đã gửi
- **Epic / Milestone / Point:** EPIC-02 / M2 / 2
- **Demo:** A tra email B (đang chờ) → "Đang chờ phản hồi" + Thu hồi → bấm → lời mời biến mất khỏi tab Đã nhận của B; hoặc từ tab Đã gửi bấm Thu hồi. Thu hồi đúng lúc B chấp nhận → hiện "Hai bạn đã là bạn bè".
- **Thao tác:** SCR-07.A3, SCR-09.A5
- **operationId:** withdrawFriendRequest
- **TBL:** TBL-04
- **BR / SUP / NFR:** BR-08, Q-029 (chấp nhận thắng)
- **FLOW:** FLOW-03 A3, E2
- **Ngoài phạm vi:** —
- **Phụ thuộc:** T-006

## T-013 · Hủy kết bạn & phòng 2 người chỉ đọc
- **Epic / Milestone / Point:** EPIC-02 / M2 / 5
- **Demo:** A mở Bạn bè → B → Hủy kết bạn → xác nhận → B biến mất khỏi danh sách; phòng 2 người A–B chuyển chỉ đọc (ô nhập khóa, lý do "Hai bạn không còn là bạn bè") trên cả hai máy; phòng nhóm ≥3 người vẫn chat. Kết bạn lại → phòng mở lại. B từ chối lời mời cũ khi đã là bạn → thấy gợi ý Hủy kết bạn.
- **Thao tác:** SCR-08.A1; trạng thái chỉ đọc SCR-05 (khóa ô nhập); chip "Chỉ đọc" ở SCR-03 (Q-047)
- **operationId:** deleteFriend (+ cập nhật acceptFriendRequest: mở lại phòng; rejectFriendRequest: `ALREADY_FRIENDS`)
- **TBL:** TBL-05 (xóa), TBL-07 (`read_only`, index `idx_rooms_pair`; `pair_key` đã ghi từ T-008, task này kiểm lại)
- **BR / SUP / NFR:** BR-12, BR-13, Q-044 (lý do chung)
- **FLOW:** FLOW-06 bước 1–8, A1, E1; FLOW-04 A1, C3; FLOW-10a A1, E4
- **Ngoài phạm vi:** chặn (T-014); chỉ đọc do kick / rời (T-016, T-018 dùng lại hàm tính `read_only`)
- **Phụ thuộc:** T-009, T-007

## T-014 · Chặn & bỏ chặn
- **Epic / Milestone / Point:** EPIC-03 / M2 / 5
- **Demo:** A chặn B từ danh sách bạn (hoặc từ lời mời B gửi, hoặc từ màn link mời) → xác nhận → B mất khỏi bạn bè, lời mời giữa hai bên đóng, phòng A–B chỉ đọc; B tra email A thấy "không tìm thấy". A mở Cài đặt → Đã chặn → Bỏ chặn → hai người tìm thấy nhau lại nhưng chưa là bạn.
- **Thao tác:** SCR-08.A2, SCR-09.A4, SCR-02.A4, SCR-12.A0, SCR-12.A1; nút "Danh sách đã chặn" ở SCR-11
- **operationId:** createBlock, deleteBlock
- **TBL:** TBL-06 (tạo + index `idx_bl_blocker`), TBL-05, TBL-04 (`closed`, `blocked`), TBL-07 (`read_only`)
- **BR / SUP / NFR:** BR-04, BR-06 (link không dùng được), BR-12, BR-13, BR-14, Q-044 (chỉ chặn người có liên hệ; không hiện email người chưa là bạn)
- **FLOW:** FLOW-07a bước 1–8, A1–A4; FLOW-07b
- **Ngoài phạm vi:** chặn từ danh sách thành viên phòng (T-016); chặn từ thông báo (T-025)
- **Phụ thuộc:** T-013, T-011

---

# M3 — Phòng & chat đầy đủ

## T-015 · Thông tin phòng: xem thành viên & sửa tên phòng
- **Epic / Milestone / Point:** EPIC-04 / M3 / 3
- **Demo:** Thành viên bấm tên phòng → thấy danh sách thành viên (tên, ảnh, email, vai trò); host sửa tên phòng → tin hệ thống "A đã đổi tên phòng thành …" và tên mới ở danh sách phòng; thành viên thường không thấy nút sửa.
- **Thao tác:** SCR-05.A10 (NAV), SCR-06.A0, SCR-06.A1
- **operationId:** updateRoom
- **TBL:** TBL-07, TBL-08, TBL-09 (system `room_renamed`)
- **BR / SUP / NFR:** BR-18, BR-24, BR-27, Q-037 (≤50 ký tự, "Bạn không có quyền…")
- **FLOW:** FLOW-09a
- **Ngoài phạm vi:** online trong danh sách thành viên (T-022)
- **Phụ thuộc:** T-009

## T-016 · Host thêm & kick thành viên
- **Epic / Milestone / Point:** EPIC-04 / M3 / 5
- **Demo:** Host mở Thông tin phòng → Thêm thành viên → chọn C (bạn của host) → C thấy phòng và toàn bộ tin còn hạn; host kick C → C bị đóng phòng ngay, mất phòng khỏi danh sách. Phòng 2 người chỉ đọc + thêm người thứ 3 → chat lại. Thành viên chặn một người từ danh sách thành viên.
- **Thao tác:** SCR-06.A8, SCR-06.A2, SCR-06.A3, SCR-06.A7
- **operationId:** addRoomMembers, kickRoomMember, createBlock
- **TBL:** TBL-07, TBL-08, TBL-09 (system), TBL-10 (`room_member_added`, `room_member_kicked`), TBL-14
- **BR / SUP / NFR:** BR-13, BR-15, BR-18, BR-20, BR-24, SUP-02 (tạo)
- **FLOW:** FLOW-09b, FLOW-09c; FLOW-10a E2 (bị kick khi đang xem)
- **Ngoài phạm vi:** chuyển host, rời, giải tán (T-017, T-018)
- **Phụ thuộc:** T-015, T-014

## T-017 · Giải tán phòng (dọn dữ liệu nền)
- **Epic / Milestone / Point:** EPIC-04 / M3 / 5
- **Demo:** Host → Giải tán → xác nhận → phòng biến mất với mọi thành viên ngay (người đang mở bị đóng phòng); sau vài giây emulator không còn tin / thành viên / ảnh của phòng.
- **Thao tác:** SCR-06.A6
- **operationId:** deleteRoom (202) + Function task queue `purgeRoom`
- **TBL:** TBL-07 (`status = deleted`), TBL-08, TBL-09, TBL-10 (`room_disbanded`), TBL-14; Storage prefix `rooms/{roomId}/`
- **BR / SUP / NFR:** BR-19, SUP-02, SUP-08 (xóa ảnh), NFR-19 (xóa hẳn), Q-037 (thông báo giữ tên phòng)
- **FLOW:** FLOW-09f
- **Ngoài phạm vi:** host cuối rời → xóa phòng (T-018 gọi lại `purgeRoom`)
- **Phụ thuộc:** T-016

## T-018 · Chuyển quyền host & rời phòng
- **Epic / Milestone / Point:** EPIC-04 / M3 / 5
- **Demo:** Host chuyển quyền cho B → B thấy mình là host + thông báo; thành viên Rời phòng → mất phòng, tin hệ thống "C đã rời phòng"; host rời phải chọn người nhận quyền; host là người cuối → cảnh báo → rời = phòng bị xóa.
- **Thao tác:** SCR-06.A4, SCR-06.A5
- **operationId:** transferRoomHost, leaveRoom
- **TBL:** TBL-07 (`host_uid`, `member_uids`, `read_only`), TBL-08 (`role`, `left`), TBL-09, TBL-10 (`room_host_received`), TBL-14
- **BR / SUP / NFR:** BR-13, BR-17, BR-19, BR-20, BR-24, SUP-02, Q-029 (chọn người nhận khi rời)
- **FLOW:** FLOW-09d, FLOW-09e
- **Ngoài phạm vi:** tự chuyển host khi xóa tài khoản (T-026)
- **Phụ thuộc:** T-017

## T-019 · Gửi & xem ảnh
- **Epic / Milestone / Point:** EPIC-05 / M3 / 5
- **Demo:** A chọn 3 ảnh → thấy xem trước + tiến độ → Gửi → B thấy ảnh; bấm ảnh xem lớn. Chọn 11 ảnh / tổng >10MB / file PDF → báo lỗi không gửi. Người ngoài phòng dùng lại link ảnh sau 1 giờ → không xem được.
- **Thao tác:** SCR-05.A5, SCR-05.A6 (ảnh), SCR-05.A9
- **operationId:** createMessage (`images`), listMessageImageUrls
- **TBL:** TBL-09 (`images`); Storage rules `uploads/{uid}/`, chuyển sang `rooms/…`, `customTime = expire_at` (phòng ngắn hạn), lifecycle `uploads/` age 1
- **BR / SUP / NFR:** BR-21, SUP-08, NFR-05, NFR-13 (signed URL `min(1h, expire_at)`)
- **FLOW:** FLOW-10a bước 4, 7–8, E1 (phần ảnh)
- **Ngoài phạm vi:** xóa ảnh khi thu hồi (T-020); lifecycle `rooms/` theo customTime (T-023)
- **Phụ thuộc:** T-009

## T-020 · Thu hồi tin
- **Epic / Milestone / Point:** EPIC-05 / M3 / 2
- **Demo:** A nhấn giữ tin của mình → Thu hồi → xác nhận → mọi người thấy "Đã thu hồi", ảnh kèm biến mất (file bị xóa trong emulator); thu hồi được cả khi phòng chỉ đọc.
- **Thao tác:** SCR-05.A8
- **operationId:** recallMessage
- **TBL:** TBL-09 (`recalled`), TBL-07 (`last_message`); Storage xóa file
- **BR / SUP / NFR:** BR-22, SUP-08, Q-035 (thu hồi khi chỉ đọc)
- **FLOW:** FLOW-10b
- **Ngoài phạm vi:** —
- **Phụ thuộc:** T-019, T-013

## T-021 · Đã xem, số tin chưa đọc & tóm tắt phòng
- **Epic / Milestone / Point:** EPIC-05 / M3 / 5
- **Demo:** A gửi 3 tin → danh sách phòng của B hiện tin cuối + "3", tab Phòng có badge tổng; B mở phòng → số về 0; A thấy avatar B dưới tin cuối (đã xem); bấm tin → danh sách người đã xem.
- **Thao tác:** SCR-05.A2, SCR-03.A1, LAYOUT.A3 (phần tin chưa đọc)
- **operationId:** markRoomAsRead
- **TBL:** TBL-08 (`last_read_at`), TBL-07 (`last_message`), TBL-09 (`count()`)
- **BR / SUP / NFR:** BR-26, SUP-04, NFR-03, Q-044 (debounce, "99+", tin cuối hết hạn)
- **FLOW:** FLOW-10a bước 1, 3, 9–10
- **Ngoài phạm vi:** —
- **Phụ thuộc:** T-009

## T-022 · Online & đang soạn tin
- **Epic / Milestone / Point:** EPIC-05 / M3 / 3
- **Demo:** B mở app → A thấy chấm online của B ở danh sách bạn và thông tin phòng; B gõ trong phòng → A thấy "B đang soạn…"; B tắt "Hiển thị online" → A thấy B offline và B không thấy online của ai.
- **Thao tác:** LAYOUT.A4, SCR-05.A3, SCR-05.A4; cột online ở SCR-08.A0, SCR-06.A0; chấm online hàng phòng 2 người SCR-03 (Q-047)
- **operationId:** — (RTDB)
- **TBL:** TBL-12, TBL-13, TBL-14 (rules đọc `typing`)
- **BR / SUP / NFR:** BR-25, SUP-09, NFR-02
- **FLOW:** FLOW-10a bước 5, A2; FLOW-02 bước 7 (online)
- **Ngoài phạm vi:** —
- **Phụ thuộc:** T-016, T-004

## T-023 · Tin hết hạn ở phòng ngắn hạn
- **Epic / Milestone / Point:** EPIC-05 / M3 / 3
- **Demo:** Phòng ngắn hạn: đặt `expire_at` của một tin còn 30 giây (seed) → tin tự biến mất trên màn của mọi người đúng giờ, danh sách phòng cập nhật tin cuối; cấu hình TTL policy và lifecycle `rooms/` (`daysSinceCustomTime: 0`) được khai báo và kiểm bằng test cấu hình.
- **Thao tác:** (hành vi trong SCR-05, SCR-03)
- **operationId:** — (Firestore TTL + Storage lifecycle)
- **TBL:** TBL-09 (`expire_at` TTL policy), Storage lifecycle
- **BR / SUP / NFR:** BR-16, SUP-05, NFR-19
- **FLOW:** FLOW-10c
- **Ngoài phạm vi:** xác minh TTL / lifecycle xóa vật lý thật (cần project Firebase thật – emulator không chạy TTL; ghi chú ở T-028)
- **Phụ thuộc:** T-019, T-021

---

# M4 — Thông báo & vòng đời tài khoản

## T-024 · Trung tâm thông báo
- **Epic / Milestone / Point:** EPIC-06 / M4 / 5
- **Demo:** B thấy badge trên tab Thông báo → mở → thấy "A đã thêm bạn vào phòng X", "Có lời mời mới từ C"…, chưa đọc nổi bật → chọn một cái → mở đúng phòng / lời mời; "Đánh dấu tất cả đã đọc" → badge về 0; mở thông báo của phòng đã bị giải tán → "Nội dung không còn hiệu lực".
- **Thao tác:** SCR-10.A0, SCR-10.A1, SCR-10.A2, SCR-10.A3 (NAV), LAYOUT.A2
- **operationId:** updateNotification, markAllNotificationsAsRead
- **TBL:** TBL-10 (index `idx_noti_list`, TTL policy `expire_at`)
- **BR / SUP / NFR:** SUP-01, SUP-02, SUP-03 (hiển thị), SUP-06, NFR-21, Q-044 ("một phòng chat")
- **FLOW:** FLOW-12
- **Ngoài phạm vi:** chấp nhận / từ chối / chặn ngay trên thông báo (T-025)
- **Phụ thuộc:** T-018, T-011

## T-025 · Phản hồi lời mời ngay trên thông báo
- **Epic / Milestone / Point:** EPIC-06 / M4 / 2
- **Demo:** B mở Thông báo → thông báo lời mời của A có nút Chấp nhận / Từ chối / ⋮ Chặn → bấm Chấp nhận → nút biến mất, A và B là bạn; lời mời đã bị thu hồi → báo không còn hiệu lực.
- **Thao tác:** SCR-10.A4, SCR-10.A5, SCR-10.A6
- **operationId:** acceptFriendRequest, rejectFriendRequest, createBlock
- **TBL:** —
- **BR / SUP / NFR:** BR-09, BR-11, BR-14, SUP-01
- **FLOW:** FLOW-04 (vào từ thông báo), FLOW-12 bước 5
- **Ngoài phạm vi:** —
- **Phụ thuộc:** T-024, T-014

## T-026 · Xóa tài khoản
- **Epic / Milestone / Point:** EPIC-01 / M4 / 5
- **Demo:** A (host phòng X, bạn của B, đang chặn C) → Cài đặt → Xóa tài khoản → tích xác nhận → Xóa → về màn Đăng nhập; B thấy A không còn trong bạn bè, tin cũ của A hiện "Người dùng đã xóa", thành viên vào sớm nhất của X thành host + nhận thông báo; A đăng nhập lại cùng Google → tài khoản mới hoàn toàn.
- **Thao tác:** SCR-11.A5
- **operationId:** deleteMe (202) + Function task queue `purgeAccount` (gọi `purgeRoom` cho phòng chỉ còn A)
- **TBL:** TBL-01, TBL-02, TBL-03 (xóa), TBL-04 → TBL-10, TBL-14; Firebase Auth user
- **BR / SUP / NFR:** BR-06, BR-12, BR-17, BR-24, BR-28, SUP-02, NFR-18, Q-037 (không báo ai trừ người nhận host)
- **FLOW:** FLOW-11
- **Ngoài phạm vi:** xóa khỏi bản sao lưu (cấu hình backup – T-028)
- **Phụ thuộc:** T-018, T-014

---

# M5 — Hardening

## T-027 · Chống dò email: thời gian phản hồi đều & giới hạn 100 lượt/giờ
- **Epic / Milestone / Point:** EPIC-07 / M5 / 3
- **Demo:** Script đo 50 lượt tra mỗi loại (chưa đăng ký / ẩn danh / có chặn) → chênh lệch thời gian trung bình ≤50ms; tra lượt 101 trong 1 giờ → ô tra khóa với thông báo thời gian chờ.
- **Thao tác:** SCR-07.A1 (tăng cường)
- **operationId:** createEmailLookup (`EMAIL_LOOKUP_RATE_LIMITED`, 429 `Retry-After`)
- **TBL:** TBL-01 (`lookup_window`)
- **BR / SUP / NFR:** BR-04, NFR-15 (thời gian), NFR-16
- **FLOW:** FLOW-03 bước 3
- **Ngoài phạm vi:** —
- **Phụ thuộc:** T-014

## T-028 · Vận hành: tải, sao lưu, cảnh báo, nhật ký an toàn
- **Epic / Milestone / Point:** EPIC-07 / M5 / 5
- **Demo:** Chạy script tải (k6 hoặc Artillery) trên emulator: 200 người dùng ảo gửi tin trong 5 phút → P95 gửi→nhận ≤1s, không mất / trùng tin; test tự động khẳng định log không chứa nội dung tin / email; file cấu hình (backup hằng ngày 7 ngày, alert NFR-26, uptime check `/api/health`, TTL policy, lifecycle) có trong repo kèm runbook triển khai.
- **Thao tác:** —
- **operationId:** getHealth (uptime)
- **TBL:** — (cấu hình hạ tầng)
- **BR / SUP / NFR:** NFR-07, NFR-09, NFR-18 (backup ≤30 ngày), NFR-20, NFR-26, NFR-27
- **FLOW:** —
- **Ngoài phạm vi:** áp cấu hình lên project Firebase thật và đo tải thật (môi trường kiểm tra chỉ local – Q-045; làm khi có staging)
- **Phụ thuộc:** T-023, T-026

## T-029 · Responsive desktop & kiểm trình duyệt
- **Epic / Milestone / Point:** EPIC-07 / M5 / 5
- **Demo:** Mở app ở 1280px → sidebar trái + danh sách phòng + khung chat cạnh nhau, Thông tin phòng là panel phải, Thêm bạn / Tạo phòng dạng dialog; Enter gửi, Shift+Enter xuống dòng; kéo-thả ảnh vào khung chat (Q-047); Playwright chạy smoke trên Chromium, Firefox, WebKit (iOS Safari viewport) đều xanh; vùng chạm ≥44px.
- **Thao tác:** layout chung (wireframe mục 5); kéo-thả ảnh SCR-05 desktop (Q-047)
- **operationId:** —
- **TBL:** —
- **BR / SUP / NFR:** NFR-22, NFR-23 (Could – vùng chạm, kiểm độ tương phản bằng axe), NFR-25, Q-044 (Enter gửi)
- **FLOW:** —
- **Ngoài phạm vi:** —
- **Phụ thuộc:** T-022, T-024

---

## Phụ thuộc (tóm tắt)
| Task | Phụ thuộc |
|---|---|
| T-001 | — |
| T-002 | T-001 |
| T-003 | T-002 |
| T-004 | T-003 |
| T-005 | T-004 |
| T-006 | T-005 |
| T-007 | T-006 |
| T-008 | T-007 |
| T-009 | T-008 |
| T-010 | T-005 |
| T-011 | T-010, T-006 |
| T-012 | T-006 |
| T-013 | T-009, T-007 |
| T-014 | T-013, T-011 |
| T-015 | T-009 |
| T-016 | T-015, T-014 |
| T-017 | T-016 |
| T-018 | T-017 |
| T-019 | T-009 |
| T-020 | T-019, T-013 |
| T-021 | T-009 |
| T-022 | T-016, T-004 |
| T-023 | T-019, T-021 |
| T-024 | T-018, T-011 |
| T-025 | T-024, T-014 |
| T-026 | T-018, T-014 |
| T-027 | T-014 |
| T-028 | T-023, T-026 |
| T-029 | T-022, T-024 |

## Gợi ý sprint (1 dev, ~10 point / sprint 2 tuần – Q-045)
Xếp theo phụ thuộc, mỗi sprint ≤ 10 point, task trong sprint làm theo thứ tự ghi.

| Sprint | Task | Point | Milestone xong |
|---|---|---|---|
| S1 | T-001 → T-002 → T-003 | 10 | M0 |
| S2 | T-004 → T-005 | 8 | |
| S3 | T-006 → T-007, T-012 | 9 | |
| S4 | T-008, T-010 | 8 | |
| S5 | T-009, T-021 | 10 | M1 (sau T-009) |
| S6 | T-011, T-013 | 10 | |
| S7 | T-014, T-015 | 8 | M2 |
| S8 | T-016, T-019 | 10 | |
| S9 | T-017, T-020, T-022 | 10 | |
| S10 | T-018, T-023 | 8 | M3 |
| S11 | T-024 → T-025, T-027 | 10 | |
| S12 | T-026 → T-028 | 10 | M4 |
| S13 | T-029 | 5 | M5 |

Ghi chú: T-012 (M2) và T-021 (M3) được kéo lên sớm vì nhỏ và đã đủ phụ thuộc. Đây chỉ là thứ tự làm, milestone của task không đổi.

Ước tính: **13 sprint ≈ 26 tuần** cho 116 point. M1 (dùng thử được) xong sau ~10 tuần.

## Tự kiểm độ phủ
- **Thao tác (66):** (+ phạm vi nhỏ bổ sung Q-047: chấm online SCR-03 → T-022, "Xem lời mời đã gửi" → T-006, chip "Chỉ đọc" SCR-03 → T-013, kéo-thả ảnh desktop → T-029) mọi `SCR-xx.Ay` / `LAYOUT.Ay` thuộc ≥1 task (NAV gắn task màn đích: SCR-02.A1 → T-011, SCR-03.A2 → T-008, SCR-05.A10 → T-015, SCR-08.A3 → T-007, SCR-10.A3 → T-024).
- **operationId (30):** getHealth T-001; createSession, createAccount, getMe T-002; deleteCurrentSession T-003, T-011; updateMe T-004; createEmailLookup T-005, T-027; createFriendRequest T-005; acceptFriendRequest / rejectFriendRequest T-006, T-011, T-013, T-025; withdrawFriendRequest T-012; createInviteLink T-010; openInviteLink T-011; deleteFriend T-013; createBlock T-014, T-016, T-025; deleteBlock T-014; createRoom T-008; updateRoom T-015; addRoomMembers, kickRoomMember T-016; deleteRoom T-017; transferRoomHost, leaveRoom T-018; createMessage T-009, T-019; recallMessage T-020; listMessageImageUrls T-019; markRoomAsRead T-021; updateNotification, markAllNotificationsAsRead T-024; deleteMe T-026.
- **Job nền:** `purgeRoom` T-017; `purgeAccount` T-026; TTL / lifecycle T-006 (lời mời), T-019 (`uploads/`), T-023 (tin, `rooms/`), T-024 (thông báo).
- **BR-01 → BR-29:** đều có task (xem từng task).
- **SUP MVP (9):** SUP-01 T-005, T-006, T-011, T-024; SUP-02 T-008, T-016–T-018, T-026, T-024; SUP-03 T-024; SUP-04 T-021; SUP-05 T-023; SUP-06 T-024; SUP-07 T-010, T-011; SUP-08 T-017, T-019, T-020; SUP-09 T-009, T-022.
- **NFR Must (17):** NFR-01 T-009, T-028; NFR-03 T-009, T-021; NFR-07 T-028; NFR-10 T-009; NFR-11 T-002, T-003; NFR-12 T-001; NFR-13 T-002, T-019; NFR-14 T-010, T-011; NFR-15 T-005, T-027; NFR-17 T-002; NFR-18 T-026, T-028; NFR-19 T-017, T-023; NFR-21 T-024; NFR-22 mọi task UI, T-029; NFR-24 T-001; NFR-25 T-029; NFR-27 T-001, T-028.
- **Chưa phủ / ngoài phạm vi:** SUP-10 Push, SUP-11 → SUP-14 (ngoài MVP); xác minh trên project Firebase thật (TTL, lifecycle, backup, alert, tải thật) – môi trường kiểm tra chỉ local (Q-045).
