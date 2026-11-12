# T-022 · Online & đang soạn tin

| Epic | Milestone | Point | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| EPIC-05 | M3 | 3 | T-016, T-004 | TODO |

## 1. Mục tiêu demo
Sau task này: **B mở app → A thấy chấm online của B ở danh sách bạn SCR-08, ở thông tin phòng SCR-06 và phụ đề "n thành viên · m đang online" trong phòng; B gõ trong phòng → A thấy "B đang soạn tin…"; B tắt "Hiển thị online" trong Cài đặt → A thấy B offline và B không còn thấy online của ai.**

## 2. Phạm vi
| Loại | ID | Ghi chú |
|---|---|---|
| Thao tác | LAYOUT.A4 | Ghi `status/{me}` online + `onDisconnect` offline, chỉ khi `show_online = true` |
| Thao tác | SCR-05.A3 | Ghi `typing/{roomId}/{me}` (throttle 3s), xóa khi gửi / xóa hết chữ, `onDisconnect().remove()` |
| Thao tác | SCR-05.A4 | Nghe `status/{uid}` của thành viên + `typing/{roomId}` |
| Thao tác | SCR-08.A0, SCR-06.A0 | Thêm cột chấm online |
| Thao tác | SCR-11.A3 | Hiệu lực hiển thị online (phần client: ghi offline / dừng LAYOUT.A4) |
| API | — | RTDB trực tiếp (ADR-05) |
| Dữ liệu | TBL-12 RTDB `status/{uid}` | Tạo + rules |
| Dữ liệu | TBL-13 RTDB `typing/{roomId}/{uid}` | Tạo + rules |
| Dữ liệu | TBL-14 RTDB `room_access` | Chỉ dùng trong rules đọc / ghi `typing` |
| Rule | BR-25 | Online chỉ cho bạn bè / người chung phòng; tắt → luôn offline và không thấy ai |
| Phụ trợ | SUP-09 | Realtime |
| NFR | NFR-02 | Online / đang soạn P95 ≤2s |
| Flow | FLOW-10a bước 5, A2; FLOW-02 bước 7 (online) | |

**Ngoài phạm vi:** lưu cài đặt `show_online` (đã làm ở T-004).

## 3. Việc cần làm
### UI
- [ ] Hook `usePresenceWriter` (gắn ở layout đã đăng nhập): khi `users.show_online = true` và `.info/connected = true` → `onDisconnect(status/me).set({state: offline, last_changed: serverTimestamp})` rồi `set(status/me, {state: online, …})`; `show_online = false` → ghi `offline`, hủy `onDisconnect`, không ghi `online` nữa; đăng xuất → ghi `offline` trước khi `signOut`.
- [ ] Hook `useOnline(uids)`: chỉ subscribe `status/{uid}` của bạn bè (SCR-08) và thành viên phòng đang xem (SCR-05, SCR-06); trả `false` cho mọi người khi chính mình `show_online = false` (không subscribe).
- [ ] SCR-08 hàng bạn: chấm online cạnh ảnh; SCR-06 hàng thành viên: chấm online; SCR-05 phụ đề "n thành viên · m đang online" (m không tính mình; ẩn phần "· m đang online" khi mình tắt `show_online`).
- [ ] Typing writer ở SCR-05: khi `onChange` ô nhập có chữ → ghi `typing/{roomId}/{me} = serverTimestamp` tối đa 1 lần / 3 giây; `onDisconnect().remove()`; gửi tin hoặc xóa hết chữ hoặc rời màn → `remove()`.
- [ ] Dòng đang soạn (component 14): nghe `typing/{roomId}`, bỏ chính mình, bỏ giá trị cũ >5 giây (so với server time offset `.info/serverTimeOffset`); 1 người "{Tên} đang soạn tin…", 2 người "{A} và {B} đang soạn tin…", ≥3 "Nhiều người đang soạn tin…".
- [ ] Phòng chỉ đọc: không ghi typing (ô nhập khóa).
- [ ] SCR-11.A3: sau khi `updateMe({showOnline})` thành công → bật / tắt writer ngay (không cần tải lại).

### API / Backend
- [ ] Không có endpoint mới. Kiểm `deleteCurrentSession` / `deleteMe` không phụ thuộc presence (client tự ghi offline; `onDisconnect` xử lý khi đóng tab).

### Data
- [ ] `database.rules.json`:
  - `status/$uid`: `.read: auth != null`; `.write: auth.uid === $uid`; `.validate`: `state` ∈ {`online`, `offline`}, `last_changed` là số ≤ `now`.
  - `typing/$roomId/$uid`: `.read: root.child('room_access/' + $roomId + '/' + auth.uid).exists()` (ở cấp `$roomId`); `.write: auth.uid === $uid && root.child('room_access/' + $roomId + '/' + $uid).exists()`; `.validate`: số (server timestamp) hoặc xóa.
  - `room_access`: `.read: false`, `.write: false` (chỉ Admin SDK).
- [ ] Seed RTDB `room_access` khớp seed phòng (T-008/T-016 đã ghi khi tạo / thêm / kick).

### Khác
- [ ] Hằng số `TYPING_THROTTLE_MS = 3000`, `TYPING_STALE_MS = 5000` đặt trong config client.

## 4. Acceptance criteria
| # | Given | When | Then | Nguồn |
|---|---|---|---|---|
| AC-1 | A và B là bạn, cùng phòng P, cả hai bật `show_online`; A đang ở SCR-08 | B mở app | A thấy chấm online cạnh B trong ≤2 giây; RTDB `status/B.state = online` | LAYOUT.A4, BR-25, NFR-02 |
| AC-2 | Như AC-1 | B đóng tab | A thấy B offline trong ≤2 giây sau khi kết nối của B đóng `[ASSUMED → Q-047]` (`onDisconnect`); `status/B.state = offline` | SUP-09, NFR-02 |
| AC-3 | A, B, C trong P; A đang mở P | B gõ chữ trong ô nhập P | A thấy "B đang soạn tin…" trong ≤2 giây; B gửi tin hoặc xóa hết chữ → dòng biến mất | FLOW-10a bước 5, SCR-05.A3/A4, NFR-02 |
| AC-4 | B và C cùng gõ / B, C, D cùng gõ | A xem P | "B và C đang soạn tin…" / "Nhiều người đang soạn tin…" | SCR-05 component 14 |
| AC-5 | B gõ rồi ngừng (không gửi, không xóa) | 5 giây sau lần ghi cuối | Dòng đang soạn của B biến mất trên màn A | SCR-05 component 14 |
| AC-6 | B đang online | B tắt "Hiển thị trạng thái online" ở Cài đặt | A thấy B offline ≤2 giây; B mở SCR-08 / SCR-06 không thấy chấm online của ai và phụ đề phòng chỉ "n thành viên"; RTDB `status/B.state = offline` và không đổi thành `online` khi B tải lại trang | BR-25, FLOW-10a A2, FLOW-02 bước 7 |
| AC-7 | B đã tắt rồi bật lại `show_online` | — | A thấy B online lại ≤2 giây; B thấy online của người khác | BR-25 |
| AC-8 | P có 4 thành viên, 2 người khác A đang online | A mở P | Phụ đề "4 thành viên · 2 đang online"; SCR-06 có chấm online cho đúng 2 người | SCR-05 component 2, SCR-06.A0 |
| AC-9 | C không là thành viên P (không có `room_access/P/C`) | C đọc `typing/P` hoặc ghi `typing/P/C` | RTDB rules từ chối cả hai | TBL-13, NFR-13 |
| AC-10 | A đã đăng nhập | A ghi `status/B` hoặc `typing/P/B` | Rules từ chối | TBL-12, TBL-13 |
| AC-11 | Phòng P chỉ đọc | B mở P | Không ghi node `typing/P/B` (ô nhập khóa) | BR-13 |

## 5. Test
### Unit / integration
| Case | Phủ AC |
|---|---|
| Component test ô nhập SCR-05 khi `room.readOnly = true`: gõ phím → hook `useTyping` không gọi ghi `typing/P/{me}` (mock RTDB) | AC-11 |
| RTDB rules test (`@firebase/rules-unit-testing`, database emulator): ghi `status` của mình được / của người khác bị từ chối; `state` sai giá trị bị từ chối | AC-10 |
| RTDB rules: thành viên (có `room_access`) đọc / ghi `typing` được; người ngoài bị từ chối đọc / ghi; ghi `typing/P/{uid khác}` bị từ chối; client ghi `room_access` bị từ chối | AC-9, AC-10 |
| `usePresenceWriter` (Vitest, mock RTDB): `show_online` true → set online + onDisconnect; false → set offline, không set online | AC-1, AC-6, AC-7 |
| `formatTypingLine` + lọc stale >5s, loại chính mình (fake timers) | AC-4, AC-5 |
| Throttle typing: gõ liên tục 10s → ≤4 lần ghi | AC-3 |
| `useOnline`: mình tắt `show_online` → mọi người false, không subscribe | AC-6 |

### E2E
| Kịch bản | Phủ AC |
|---|---|
| Playwright 2 context: B mở app → A thấy chấm online ở SCR-08; B gõ trong P → A thấy "B đang soạn tin…"; B gửi → dòng biến mất; B đóng page → A thấy offline | AC-1, AC-2, AC-3 |
| B tắt "Hiển thị online" → A thấy offline; B không thấy chấm online ở SCR-08 | AC-6 |

### Dữ liệu seed / tiền điều kiện
- Seed T-016: A, B, C, D là bạn của A; phòng P (A host, B, C, D) + `room_access` tương ứng; phòng 2 người chỉ đọc A–E.
- Mọi tài khoản `show_online = true` mặc định.

### Test tay
| Bước | Thao tác | Kết quả mong đợi | AC |
|---|---|---|---|
| 1 | A mở Bạn bè; B đăng nhập ở trình duyệt khác | Chấm online cạnh B ≤2s | AC-1 |
| 2 | A mở P (4 thành viên), C cũng mở app | Phụ đề "4 thành viên · 2 đang online"; ℹ → SCR-06 có chấm đúng | AC-8 |
| 3 | B gõ trong P; C cũng gõ; D cũng gõ | "B đang soạn tin…" → "B và C…" → "Nhiều người…" | AC-3, AC-4 |
| 4 | B ngừng gõ 6 giây | Tên B biến mất khỏi dòng | AC-5 |
| 5 | B đóng tab | A thấy B offline | AC-2 |
| 6 | B mở lại, vào Cài đặt tắt "Hiển thị trạng thái online", tải lại trang | A thấy B offline; B không thấy chấm online của ai | AC-6 |
| 7 | B bật lại | Cả hai thấy online của nhau | AC-7 |
| 8 | Emulator UI RTDB: thử thêm `typing/P/C2` bằng tài khoản ngoài phòng (script rules) | Bị từ chối | AC-9 |

## 6. Definition of Done
- [ ] DoD chung (xem `backlog.md` mục 1)
- [ ] `database.rules.json` có test cho phép / từ chối cho `status`, `typing`, `room_access`
- [ ] Đăng xuất (T-003) vẫn chạy, ghi `offline` trước khi `signOut`

## 7. Ghi chú
- `[ASSUMED → Q-047]` Trong emulator, `onDisconnect` chạy ngay khi page đóng; ở production có thể trễ tới ~60 giây khi mất mạng đột ngột (giới hạn của RTDB) — NFR-02 chỉ đo cho trường hợp đóng tab / tắt online bình thường.
- `[ASSUMED → Q-047]` BR-25 "chỉ bạn bè và người chung phòng" được thực thi **phía client** (chỉ subscribe uid là bạn / thành viên phòng) vì rules `status/{uid}` là "đã đăng nhập" (database-design 4.3). Người dùng biết uid vẫn đọc được trạng thái online qua SDK → rủi ro riêng tư nhỏ, cần chốt ở Phase 3 nếu muốn chặn bằng rules.
- (Q-047) Chấm online ở hàng phòng 2 người trên SCR-03 (scr-03 component 5) thuộc task này, giữ 3 point: dùng lại hook presence của SCR-08 cho người còn lại trong phòng 2 người.
- **Đề xuất point: 5 (sơ bộ 3).** Task gồm 2 cơ chế RTDB (presence + typing) với `onDisconnect`, rules mới cho 3 node kèm test, hiển thị ở 3 màn và tương tác với cài đặt `show_online`. Giữ 3 trong file theo slices.md.
