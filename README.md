# 📌 Chat App Realtime

Một ứng dụng chat realtime full-stack, xây dựng với **Angular (ng-zorro)** cho
frontend và **ExpressJS + MongoDB** cho backend. Sử dụng **Socket.IO** để đảm
bảo nhắn tin thời gian thực.

---

## 🚀 Tính năng chính

- ✅ Đăng ký, đăng nhập, đăng xuất với **JWT Authentication**
- ✅ Cập nhật thông tin cá nhân (avatar, tên hiển thị, email, mật khẩu)
- ✅ Chat thời gian thực bằng **Socket.IO**
- ✅ Hiển thị trạng thái **online/offline** của người dùng
- ✅ Gửi và nhận tin nhắn **text** và **ảnh**
- ✅ Thông báo số lượng tin nhắn **chưa đọc (real-time)**
- ✅ Phân chia tin nhắn theo **ngày**
- ✅ Tìm kiếm người dùng để chat
- ✅ Responsive cho mobile / tablet / desktop

---

## 🛠️ Công nghệ sử dụng

### Frontend

- [Angular](https://angular.io/) (v15+)
- [ng-zorro-antd](https://ng.ant.design/) (UI components)
- RxJS
- Socket.IO Client

### Backend

- [ExpressJS](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + Mongoose
- [Socket.IO](https://socket.io/)
- [Multer](https://github.com/expressjs/multer) (upload file)
- [JWT](https://jwt.io/) (xác thực)

### 🌐 Demo

🔗 **Link Deploy**:
[Chat App Realtime](https://chat-app-production-623f.up.railway.app/login)

| Email           | Mật khẩu | Ghi chú          |
| --------------- | -------- | ---------------- |
| use@gmail.com   | user123  | Tài khoản demo 1 |
| tam@example.com | tam123   | Tài khoản demo 2 |

---

## 📂 Cấu trúc dự án

### Frontend

```
/front-end
 ├── src/app
 │    ├── core/         # Đăng nhập/Đăng ký/Màn hình chính
 │    ├── models/       # Định nghĩa Models
 │    ├── services/     # Giao tiếp API & Socket
 │    └── shared/       # Component dùng chung
```

### Backend

```
/back-end
 ├── models/            # Mongoose models (User, Message, Conversation)
 ├── routes/            # REST APIs
 ├── controllers/       # Xử lý logic
 ├── socket/            # Socket.IO events
 └── server.js          # Entry point
```

---

## ⚡ Cài đặt & Chạy dự án

### Yêu cầu

- Node.js >= 16
- MongoDB >= 5

### Backend

```bash
cd server
npm install
npm run dev
```

File `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=4f92d17f1c83a93a8de76fbb04f0ac72f12a4d5c89b3e6af5c07e83d02b8f6cd
```

### Frontend

```bash
cd client
npm install
ng serve
```

Truy cập: `http://localhost:4200`

---

## 🔌 API chính

- `POST /api/auth/register` – Đăng ký
- `POST /api/auth/login` – Đăng nhập
- `GET /api/users/search?keyword=` – Tìm kiếm user
- `POST /api/messages/` – Gửi tin nhắn
- `GET /api/messages/:conversationId` – Lấy danh sách tin nhắn

---

## 🔔 Socket.IO Events

| Event               | Description              |
| ------------------- | ------------------------ |
| `join`              | Join vào phòng chat      |
| `sendMessage`       | Gửi tin nhắn             |
| `receiveMessage`    | Nhận tin nhắn            |
| `user-connected`    | User online              |
| `user-disconnected` | User offline             |
| `updateUnseenCount` | Cập nhật số tin chưa đọc |

## 🚀 Hướng phát triển

- Thêm chat nhóm (Group Chat)
- Trạng thái tin nhắn: sent / delivered / read
- Gửi file (PDF, DOCX, ZIP, …)
- Thêm tính năng gọi video/audio
- Tích hợp Docker + CI/CD

---

## 👨‍💻 Tác giả

- **Nguyễn Văn Trần Tâm** – Developer
