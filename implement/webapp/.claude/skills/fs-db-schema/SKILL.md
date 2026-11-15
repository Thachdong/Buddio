---
name: fs-db-schema
description: Viết phần khai báo database của Buddio — firebase.json (Emulator Suite), firestore.rules (chỉ đọc theo quyền, cấm mọi ghi từ client), database.rules.json (RTDB presence/typing), storage.rules, firestore.indexes.json, cấu hình TTL, seed emulator — trong firebase/ và scripts/seed/. Dùng khi task thêm collection/index/rules, khi listener bị permission-denied hoặc thiếu index, hoặc khi orchestrator giao section "db-schema". Không viết code truy cập dữ liệu.
---

# fs-db-schema

Một trách nhiệm: **cấu trúc và quyền ở tầng database**: ai đọc được gì, index nào tồn tại, dữ liệu mẫu cho emulator. Code đọc/ghi thuộc `fs-repository` (server) và `fs-client-data` (client).

Đọc trước: `../_shared/architecture.md` (nguyên tắc 5: client chỉ đọc), `../_shared/specs-map.md`.

## Input
- Section `## 2. db-schema` trong plan.md.
- `../../specs/database.md`: `## TBL-xx` (cột, **Indexes**, mô tả rules), cùng phần RTDB TBL-12..14.
- `../../specs/database-design.md`: lý do (soft delete, TTL, pair_key…).
- `../../specs/tech-stack.md`: ADR-03, 05, 09, 10.
- Mục `## Issues` trong plan: listener/repo báo thiếu index hoặc rules.

## Output
```
firebase.json                 # emulators + trỏ tới các file rules/index bên dưới
.firebaserc                   # { "projects": { "default": "demo-buddio" } }
firebase/
  firestore.rules
  firestore.indexes.json
  database.rules.json
  storage.rules
scripts/seed/
  index.ts                    # npm run seed — ghi bằng Admin SDK vào emulator
  fixtures/<task-id>.ts       # dữ liệu mẫu theo case của task
```

## firestore.rules — khung

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isMe(uid) { return signedIn() && request.auth.uid == uid; }

    // ADR-03: client CHỈ ĐỌC. Mọi ghi đi qua Server Action (Admin SDK bỏ qua rules).
    match /{document=**} { allow write: if false; }

    match /users/{uid} { allow read: if isMe(uid); }                                   // TBL-01
    match /users/{uid}/notifications/{id} { allow read: if isMe(uid); }                // TBL-10
    match /profiles/{uid} { allow get: if signedIn(); allow list: if false; }          // TBL-02
    match /friend_requests/{id} {                                                       // TBL-04
      allow read: if signedIn() && (resource.data.from_uid == request.auth.uid || resource.data.to_uid == request.auth.uid);
    }
    // … mỗi TBL một block, chép đúng điều kiện ghi trong database.md
  }
}
```

## Quy tắc

**Rules**
- Viết đúng điều kiện đọc ghi trong `database.md` cho từng TBL. Không nới rộng.
- `allow write: if false` cho toàn bộ Firestore và Storage `rooms/**`. Ngoại lệ:
  - Storage `uploads/{uid}/{file}`: chủ sở hữu được tạo, `contentType` khớp `image/.*`, `size <= 10MB` (ADR-10).
  - RTDB `status/$uid`, `typing/$roomId/$uid`: chỉ `auth.uid == $uid`; `typing` chỉ khi `root.child('room_access/' + $roomId + '/' + auth.uid).exists()` (TBL-14).
- Rules không lọc dữ liệu: điều kiện phải tham chiếu được từ query của listener (`resource.data.x == request.auth.uid`).
- Điều kiện phức tạp (kiểm membership) thì dùng `get()`/`exists()`. Mỗi lần đánh giá rules tối đa 10 lần gọi như vậy; cần nhiều hơn thì ghi Issue để xem lại mô hình dữ liệu.
- Tách hàm helper (`isMember(roomId)`) ở đầu file và tái sử dụng.

**Index**
- `firestore.indexes.json` chỉ chứa index được liệt kê trong `database.md` (`idx_…`). Thứ tự field và hướng sắp xếp phải giống hệt.
- Cần index mà `database.md` chưa có thì thêm, đồng thời ghi Issue đề nghị cập nhật `database.md`. Không lặng lẽ lệch spec.
- **TTL** (ADR-09: `messages.expire_at`, `notifications.expire_at`) không khai trong file index. Ghi lệnh vào README (`gcloud firestore fields ttls update expire_at --collection-group=messages --enable-ttl`). Emulator không chạy TTL, nên test dựa vào bộ lọc `expire_at > now`.

**Emulator / seed**
- `firebase.json`: emulators `auth:9099`, `firestore:8080`, `database:9000`, `storage:9199`, `functions:5001`, `ui:4000`, và `singleProjectMode: true`. Port phải khớp `src/shared/client/firebase.ts` và `.env.example`.
- Project id dùng `demo-buddio`. Với `demo-*`, emulator không gọi dịch vụ thật.
- Seed ghi bằng Admin SDK (bỏ qua rules), có `config/limits` (TBL-11) và user mẫu theo case của task. Tạo user trên Auth emulator bằng `adminAuth().createUser({ uid, email })`.
- Seed phải idempotent: chạy lại không nhân đôi dữ liệu (dùng `set` với id cố định).

## Checklist
- [ ] Mỗi TBL mà task chạm tới có block rules và comment `// TBL-xx`.
- [ ] Không có `allow write` nào ngoài các ngoại lệ ở trên.
- [ ] Index khớp `database.md`.
- [ ] `firebase emulators:exec --only firestore,database,storage "true"` khởi động được (rules hợp lệ).
- [ ] Đã giao cho `fs-test` danh sách case rules cần test: ai đọc được và ai **bị từ chối**.

## Handoff
Ghi vào `## 2. db-schema → Output`: block rules đã thêm hoặc sửa, index, fixture seed (uid/email từng case), và các case allow/deny cho `fs-test`.
