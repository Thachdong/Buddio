# T-011 · Mở link mời → đăng nhập → lời mời đang chờ

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-02 | M2 | 5 | T-010, T-006 | TODO |

## 1. Mục tiêu demo
Sau task này: **C (chưa có tài khoản) mở link A gửi → thấy "Bạn nhận được một lời mời kết bạn" → "Đăng nhập với Google" (đúng email) → đồng ý chính sách → tự quay lại link, thấy ảnh + "An muốn kết bạn với bạn trên Buddio" → Chấp nhận → toast "Hai bạn đã là bạn bè" → vào trang Phòng; A thấy C trong danh sách bạn.** Đăng nhập sai email → "Link này không dành cho tài khoản của bạn" + "Đăng nhập tài khoản khác". Link hết hạn / đã là bạn → "Link không còn hiệu lực, hãy xin người mời link mới."

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | SCR-02.A0 | Kiểm link & lấy / tạo lời mời |
| Thao tác | SCR-02.A1 | NAV → SCR-01 giữ `token` |
| Thao tác | SCR-02.A2 | Chấp nhận (dùng lại `acceptFriendRequest`) |
| Thao tác | SCR-02.A3 | Từ chối (dùng lại `rejectFriendRequest`) |
| Thao tác | SCR-02.A5 | Đăng nhập tài khoản khác |
| Thao tác | SCR-01 → SCR-02 | Banner ngữ cảnh lời mời (SCR-01 thành phần 3), quay lại link sau đăng nhập (FLOW-01 bước 9) |
| API | `openInviteLink` | `POST /invite-links/open` (auth tùy chọn) |
| API | `acceptFriendRequest`, `rejectFriendRequest`, `deleteCurrentSession` | dùng lại (T-006, T-003) |
| Dữ liệu | TBL-04 | tạo lời mời `channel = link` |
| Dữ liệu | TBL-10 | `friend_request_received` cho người mở link |
| Dữ liệu | TBL-01, TBL-03, TBL-05, TBL-06 | chỉ đọc (người mời còn active, bạn bè, chặn) |
| Rule | BR-06, BR-07 | |
| Phụ trợ | SUP-07, SUP-01 | |
| NFR | NFR-06 (SSR trang công khai), NFR-14, NFR-15 (không hiện email được mời) | |
| Flow | FLOW-05 bước 1–9, A1, A2, E1, E2; FLOW-01 bước 9 | |

**Ngoài phạm vi:** link "Chặn người này" + dialog chặn (SCR-02.A4 – T-014); dialog "Hai bạn đã là bạn bè" khi từ chối (FLOW-04 A1 – T-013); tạo link (T-010).

## 3. Việc cần làm
### UI
- [ ] Route công khai `/invite/[token]` (không nằm trong auth guard, không thanh tab), render ở server: server component gọi domain `checkInviteToken(token)` (chỉ giải mã + hạn) → token hỏng / hết hạn → render luôn biến thể lỗi 1; còn lại render khung *Chưa đăng nhập* (logo, tiêu đề, mô tả, nút "Đăng nhập với Google") — NFR-06.
- [ ] Client: nếu đã đăng nhập → gọi `openInviteLink` kèm ID token → hiện *Lời mời hợp lệ*: ảnh người mời, "**{tên}** muốn kết bạn với bạn trên Buddio", Chấp nhận / Từ chối. Không hiện email người mời và email được mời. Ẩn link "Chặn người này" (T-014) `[ASSUMED → Q-047]`.
- [ ] Loading: skeleton ảnh + 2 dòng khi chạy A0; spinner trên nút 7/8 khi gửi.
- [ ] Nút "Đăng nhập với Google" → lưu `inviteToken` vào sessionStorage → `/login`; SCR-01 hiện banner "Bạn đang mở một lời mời kết bạn. Đăng nhập để tiếp tục." khi có `inviteToken`.
- [ ] Sau `createSession` thành công (hoặc sau dialog chính sách + `createAccount` cho người mới) → nếu có `inviteToken` → chuyển `/invite/{token}` thay vì `/rooms` (FLOW-01 bước 9).
- [ ] `CONSENT_REQUIRED` từ `openInviteLink` (có Google nhưng chưa có tài khoản) → mở dialog chính sách SCR-01.A2 → `createAccount` → chạy lại A0.
- [ ] Biến thể lỗi 1 (`INVITE_LINK_INVALID`): "Link không còn hiệu lực, hãy xin người mời link mới." + nút "Vào Buddio" → `/rooms` (nếu chưa đăng nhập → `/login`). **Một câu chung** cho mọi lý do.
- [ ] Biến thể lỗi 2 (`INVITE_LINK_WRONG_ACCOUNT`): "Link này không dành cho tài khoản của bạn." + "Đăng nhập tài khoản khác" + "Vào Buddio"; không hiện email.
- [ ] "Đăng nhập tài khoản khác" → `deleteCurrentSession` + `signOut()` → `/login` vẫn giữ `inviteToken` (Q-044).
- [ ] Chấp nhận → toast "Hai bạn đã là bạn bè" → `/rooms`; Từ chối → toast "Đã từ chối lời mời" → `/rooms`; `FRIEND_REQUEST_NOT_PENDING` → toast "Lời mời không còn hiệu lực" → biến thể 1. Sau chấp nhận / từ chối xóa `inviteToken` khỏi sessionStorage.
- [ ] Lỗi mạng → toast + nút "Thử lại" chạy lại A0.

### API / Backend
- [ ] `POST /api/invite-links/open` (`openInviteLink`), `security: [{} , firebaseIdToken]`; token trong body (không trên URL API); Zod `InviteLinkOpen`.
- [ ] Không có header auth: `decodeInviteToken` (T-010) → null hoặc hết hạn → `410 INVITE_LINK_INVALID`; hợp lệ → `200 {status: login_required}` (không trả gì về người mời / email).
- [ ] Có ID token, chưa có tài khoản → `403 CONSENT_REQUIRED`.
- [ ] Có tài khoản, thứ tự kiểm: token hỏng / hết hạn → 410; `me.email_norm ≠ emailNorm` → `403 INVITE_LINK_WRONG_ACCOUNT` (BR-07); người mời không `active` / đã là bạn / có chặn chiều nào → `410 INVITE_LINK_INVALID` (BR-06); có lời mời `pending` từ người mời tới mình (kênh nào cũng được) → trả lời mời đó, `created = false` (A1, Q-029); chưa có → transaction tạo `friend_requests` (`from = inviter`, `to = me`, `channel = link`, `pending`) + `users/{me}/notifications` `friend_request_received` (`actor_uid = inviter`) → `created = true`.
- [ ] Mở lại link còn hạn sau khi đã từ chối → tạo lời mời mới, **không** áp cooldown BR-10 (A2, Q-036).
- [ ] Response `200 {status: pending_request, created, request, inviter:{uid, displayName, photoUrl, status}}`.
- [ ] Log: không ghi token, email (NFR-27).

### Data
- [ ] Không đổi rules / index (đã có `idx_fr_pair` – T-005).

### Khác
- [ ] Middleware auth guard bỏ qua `/invite/*`.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | Link A tạo cho `chi@test.local` còn hạn; C chưa đăng nhập | C mở link | Thấy "Bạn nhận được một lời mời kết bạn" + nút "Đăng nhập với Google"; không thấy tên / ảnh A, không thấy email | FLOW-05 bước 1–3, SCR-02 trang Chưa đăng nhập, Q-044 |
| AC-2 | Như AC-1, C chưa có tài khoản | C bấm Đăng nhập → Google (emulator, `chi@test.local`) → Đồng ý chính sách | Tự quay về `/invite/{token}`, thấy ảnh + "An … muốn kết bạn với bạn"; emulator có lời mời `from=A,to=C,channel=link,pending` và `users/C/notifications` `friend_request_received` | FLOW-05 bước 4–9, FLOW-01 bước 9, SUP-01, SUP-07 |
| AC-3 | Như AC-2 | C bấm Chấp nhận | Toast "Hai bạn đã là bạn bè" → trang Phòng; `friendships/{A_C}` tồn tại; A có thông báo `friend_request_accepted` | SCR-02.A2, FLOW-04 C1, C4 |
| AC-4 | Như AC-2 | C bấm Từ chối | Toast "Đã từ chối lời mời" → trang Phòng; lời mời `rejected`; A có thông báo `friend_request_rejected` | SCR-02.A3, FLOW-04 A2 |
| AC-5 | C đã từ chối ở AC-4, link còn hạn | C mở lại link | Tạo lời mời **mới** (`created = true`), hiện màn Chấp nhận / Từ chối, không bị chặn 24h | FLOW-05 A2, Q-036 |
| AC-6 | A đã gửi lời mời in_app tới C (pending) | C mở link của A | Hiện lời mời đó, `created = false`; không có lời mời thứ 2 | FLOW-05 A1, Q-029 |
| AC-7 | C đăng nhập bằng `khac@test.local` | Mở link dành cho `chi@test.local` | "Link này không dành cho tài khoản của bạn." + "Đăng nhập tài khoản khác"; HTML / response không chứa `chi@test.local`; không tạo lời mời | FLOW-05 E2, BR-07, NFR-14, NFR-15 |
| AC-8 | Như AC-7 | Bấm "Đăng nhập tài khoản khác" | Phiên bị thu hồi, về màn Đăng nhập có banner lời mời; đăng nhập đúng email → quay lại link, thấy lời mời | SCR-02.A5 |
| AC-9 | Token hết hạn (`exp` < now, seed) hoặc bị sửa 1 ký tự; chưa đăng nhập | Mở link | Hiện ngay "Link không còn hiệu lực, hãy xin người mời link mới." (không bắt đăng nhập) | FLOW-05 bước 2, E1, BR-06 |
| AC-10 | Đã đăng nhập đúng email; lần lượt: A và C đã là bạn / C chặn A / A chặn C / A đã `deleted` | Mở link | Cả 4 trường hợp hiện **cùng một câu** biến thể 1; API `410 INVITE_LINK_INVALID` body giống hệt; không tạo lời mời | FLOW-05 E1, BR-06, NFR-15 |
| AC-11 | Link hợp lệ, C đã đăng nhập; A thu hồi (seed `withdrawn`) sau khi C mở trang | C bấm Chấp nhận | Toast "Lời mời không còn hiệu lực" → biến thể 1 | FLOW-04 E1 |
| AC-12 | Link hợp lệ | Tải `/invite/{token}` với JavaScript tắt | HTML từ server đã có tiêu đề "Bạn nhận được một lời mời kết bạn" (hoặc thông điệp lỗi nếu token hỏng) | NFR-06 |
| AC-13 | Đã chấp nhận / từ chối | Kiểm sessionStorage; đăng nhập lại lần sau | Không còn `inviteToken`; đăng nhập vào thẳng trang Phòng | SCR-02 mục 5 |
| AC-14 | Đã chạy các AC trên | Đọc log server | Không có token, email | NFR-27 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Handler không auth: token hợp lệ → `login_required` (body chỉ có `status`); hỏng / hết hạn → 410 | AC-1, AC-9 |
| Handler có auth, chưa có tài khoản → 403 `CONSENT_REQUIRED` | AC-2 |
| Handler đúng email, chưa có lời mời → tạo lời mời `link` + thông báo cho người mở (cùng transaction) | AC-2 |
| Handler: lời mời in_app pending sẵn → `created=false`, không tạo thêm | AC-6 |
| Handler: sau `rejected` (vừa xong) → tạo lời mời mới | AC-5 |
| Handler: sai email → 403 `INVITE_LINK_WRONG_ACCOUNT`, body không chứa email | AC-7 |
| Handler: bạn bè / chặn 2 chiều / người mời `deleted` → 410, body giống hệt từng byte | AC-10 |
| Spy logger không chứa token / email | AC-14 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright: A tạo link (API) → context mới mở link → Đăng nhập (Auth emulator, user mới `chi@test.local`) → Đồng ý → quay lại thấy lời mời → Chấp nhận → ở trang Phòng; kiểm `friendships` | AC-1, AC-2, AC-3, AC-13 |
| Playwright: đăng nhập `khac@test.local` → mở link → thấy biến thể 2 → "Đăng nhập tài khoản khác" → đăng nhập đúng email → thấy lời mời | AC-7, AC-8 |
| Playwright (`javaScriptEnabled: false`): mở link hợp lệ và link hỏng → HTML có nội dung đúng | AC-9, AC-12 |

### Dữ liệu seed / tiền điều kiện
- A `an@test.local` (active). C `chi@test.local` chưa có tài khoản (chỉ tồn tại ở Auth emulator khi đăng nhập). `khac@test.local` có tài khoản.
- Script `scripts/make-invite.ts --inviter an@test.local --email chi@test.local [--exp-offset=-1d]` sinh link hợp lệ / hết hạn bằng khóa local.
- Các biến thể quan hệ cho AC-10: `friendships/A_C`, `blocks/C_A`, `blocks/A_C`, A `status=deleted`.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A tạo link cho `chi@test.local` (T-010); mở link trong cửa sổ riêng | Trang Chưa đăng nhập, không có tên A / email | AC-1 |
| 2 | Đăng nhập Google emulator bằng `chi@test.local` → Đồng ý chính sách | Quay lại link, thấy ảnh + tên A, 2 nút | AC-2 |
| 3 | Bấm Chấp nhận | Toast, vào trang Phòng; A thấy C ở tab Bạn bè | AC-3 |
| 4 | Reset dữ liệu; lặp bước 1–2, bấm Từ chối; mở lại link | Toast từ chối; mở lại thấy lời mời mới | AC-4, AC-5 |
| 5 | Reset; A gửi lời mời in_app cho C (C tắt ẩn danh), rồi C mở link | Thấy cùng lời mời, Emulator UI chỉ 1 lời mời pending | AC-6 |
| 6 | Đăng nhập `khac@test.local`, mở link | Biến thể 2, không email | AC-7 |
| 7 | Bấm "Đăng nhập tài khoản khác" → đăng nhập `chi@test.local` | Quay lại link, thấy lời mời | AC-8 |
| 8 | Mở link hết hạn (script `--exp-offset=-1d`) khi chưa đăng nhập; sửa 1 ký tự link hợp lệ | Biến thể 1 ngay | AC-9 |
| 9 | Lần lượt tạo quan hệ bạn / chặn / A deleted trong Emulator UI, C mở link | Cùng một câu biến thể 1 | AC-10 |
| 10 | C mở link hợp lệ, trong Emulator UI đổi lời mời sang `withdrawn`, C bấm Chấp nhận | "Lời mời không còn hiệu lực" | AC-11 |
| 11 | Sau bước 3: DevTools → sessionStorage | Không còn `inviteToken` | AC-13 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] Trang `/invite/[token]` render server, có e2e với JS tắt
- [ ] Test khẳng định không có email được mời trong mọi response / HTML của luồng link
- [ ] Demo M2 phần "link mời" chạy được nối tiếp T-010

## 7. Ghi chú
- `[ASSUMED → Q-047]` Ẩn link "Chặn người này" tới T-014 (không hiện nút chết).
- `[ASSUMED → Q-047]` SSR chỉ làm phần không cần đăng nhập (kiểm token + hạn); phần đã đăng nhập gọi `openInviteLink` từ client với ID token (ADR-06 dùng ID token phía client).
- `[ASSUMED → Q-047]` Thứ tự kiểm khi đã đăng nhập: hạn → đúng email → quan hệ (contract mô tả cùng thứ tự). Người sai email với link có chặn → thấy biến thể 2 (không lộ chặn).
- `[ASSUMED → Q-047]` Script `scripts/make-invite.ts` phục vụ test (không phải tính năng).
- Rủi ro point: task gồm SSR + chuyển tiếp đăng nhập / đồng ý + 2 biến thể lỗi + endpoint mới; 5 là sát trần — nếu vượt, tách "Đăng nhập tài khoản khác" (SCR-02.A5) sang task sau.
