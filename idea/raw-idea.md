ứng dụng giải trí, xả stress
- user có thể tham gia platform dễ dàng chỉ bằng một cú click button "Login with Google"
- user có thể nhắn tin với nhau với các option như lưu tin nhắn ngắn hạn, hoặc lâu dài, tin nhắn được encrypt
- platform cung cấp một "game plugin", có thể mở rộng nhiều lại game để phục vụ nhu cầu giải trí "tạm thời" của user
- context: 2 hoặc nhiều hơn 2 user có thể nhắn tin với nhau, hoặc chơi game với nhau để giết thời gian
- các game có thể là: cờ ca rô, cờ thú, đua vit, cờ lô tô ...
- game chỉ tập trung vào rule game, không quan tâm đến lịch sử, tournament ...

về technical: tôi muốn implement hoàn toàn trên flatform của goole
- database: firestore (xem xét realtime firebase database cho chat)
- storeage: firebase storage
- authentication: google authentication
- UI/UX: NextJS
- backend: NextJS
- deploy: firebase app hosting

Các setting của user:
- flag "ẩn danh": user khác sẽ không thể tìm thấy user (kết bạn, chat, chơi game) -- default value là true

Tính năng chat:
- message có thể bao gồm: text và images (không quá 10M -- có thể setting thông qua env)
- user tự lấy msg realtime từ client thông qua firebase sdk (firebase client sdk)
- action write được thực hiện ở server thông qua firebase-admin sdk
- msg được encrypt trước khi lưu
- mỗi room chat sẽ có host, host là người tạo room chat
- host có thể thêm bạn vào room (không cần check bạn của user khác trong room)
- host có thể kick user trong room
- host có thể chuyển quyền host cho user khác trong room
- host thoát room phải chuyển quyền cho user khác
- đối với tin nhắn có thời hạn thì không thể thay đổi thời hạn sau khi tạo (vd: 1 ngày, 2 ngày, 3 ngày, 1 tuần, 1 tháng, 3 tháng)
- xoá tin nhắn, images của room hết hạn được thực hiện bằng rule của firestore và firebase storage

Tính năng kết bạn:
- UI kết bạn sẽ là input cho phép user nhập email:
  - nếu user chưa có trong flatform OR có trong flatform nhưng flag "ẩn danh" true -> chỉ có thể copy link và gửi cho user (ngoài flatform, messenger, zalo, email ...)
  - nếu user có trong flatform và flag "ẩn danh" false -> cho phép gửi, flatform sẽ gửi notification
- đối với case mời kết bạn cho user ngoài flatform -> sau khi đăng ký thành công thì hiển thị notification kết bạn cho user
- đối với case user có trong flatform và flag "ẩn danh" true thì hiển thị UI cho phép user accept/reject lời mời kết bạn
- user sẽ nhận được thông báo khi có lời mời kết bạn, user có thể accept / reject
- nếu reject thì người gửi sẽ nhận được thông báo từ chối
- nếu user A và B cùng lúc gửi lời mời kết bạn cho nhau thì cứ gửi notification bình thường
- case 1 trong 2 accept trước -> sau đó người còn lại reject -> reject vô hiệu (hiển thị UI cho người chơi huỷ kết bạn)
- case 1 trong 2 reject trước -> người còn lại accpet vẫn thành công
- chỉ cần 1 trong 2 người accept thì đã kết bạn thành công
- user huỷ kết bạn thì không thể chat/chơi game với nhau được
- user có thể block user khác: sau khi block thì user sẽ bị huỷ kết bạn (nếu đã kết bạn), không thể tìm kiếm user đã block và ngược lại
- sau khi block thì user vẫn có thể thấy các thông tin như tin nhắn, game đã chơi chung; chỉ không thể nhắn tin tiếp, hay mời chơi game tiếp được

Tính năng chơi game:
- kho game sẽ được mở rộng liên tục trong tương lai
- mỗi game sẽ được lưu trong các collection riêng biệt và có logic xử lý khác nhau
PHase này chưa làm game, chỉ làm tính năng kết bạn, chat trước 