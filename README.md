
**Cách làm:**
1. Mở project của bạn lên (bằng VS Code).
2. Tạo một file tên là **`README.md`** nằm ở **ngoài cùng (thư mục gốc `Web_ThuCung`)**. *(Nhìn ảnh GitHub của bạn thì hình như bạn chưa có file này ở ngoài cùng).*
3. Copy toàn bộ nội dung dưới đây và dán vào file đó:

```markdown
# 🐾 PetCare E-Commerce - Hệ Sinh Thái Thú Cưng Toàn Diện

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react)
![Nodejs](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Gemini AI](https://img.shields.io/badge/AI-Gemini_Integrated-orange?style=for-the-badge)

Dự án Website Thương Mại Điện Tử chuyên bán lẻ đồ dùng thú cưng, đặt lịch dịch vụ (Spa, Khách sạn) và tích hợp Trí tuệ nhân tạo (AI Chatbot) hỗ trợ tư vấn khách hàng tự động 24/7.

## 🚀 Tính năng nổi bật

### Dành cho Khách hàng (User)
- 🔐 **Xác thực:** Đăng ký, Đăng nhập, Quản lý thông tin cá nhân.
- 🛍️ **Mua sắm:** Xem chi tiết sản phẩm, thêm vào giỏ hàng, đặt hàng.
- 💳 **Thanh toán:** Tích hợp cổng thanh toán trực tuyến **VNPAY** & Thanh toán khi nhận hàng (COD).
- ✂️ **Dịch vụ:** Đặt lịch hẹn chăm sóc thú cưng (Spa, Hotel, Khám bệnh).
- 🤖 **AI Chatbot:** Trợ lý ảo tư vấn sản phẩm thông minh sử dụng API Google Gemini.
- ❤️ **Tương tác:** Thêm vào danh sách yêu thích (Wishlist), đánh giá/bình luận sản phẩm.

### Dành cho Quản trị viên (Admin)
- 📊 **Dashboard:** Thống kê doanh thu, đơn hàng, tổng số khách hàng.
- 📦 **Quản lý Sản phẩm/Danh mục:** Thêm, sửa, xóa sản phẩm và hình ảnh (Cloudinary).
- 📝 **Quản lý Đơn hàng & Dịch vụ:** Phê duyệt đơn, thay đổi trạng thái giao hàng, duyệt lịch hẹn.
- 👥 **Quản lý Người dùng:** Phân quyền, Khóa/Mở khóa tài khoản khách hàng vi phạm.
- 🎟️ **Mã giảm giá (Coupon) & Blog:** Tạo mã khuyến mãi và viết bài cẩm nang chăm sóc.

## 🛠️ Công nghệ sử dụng

- **Frontend:** ReactJS (Vite), TailwindCSS, React Router, Axios, React Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose.
- **Dịch vụ bên thứ 3:** Cloudinary (Lưu trữ ảnh), Google Gemini API (Chatbot AI), VNPAY API (Thanh toán).

## ⚙️ Hướng dẫn cài đặt và chạy dự án (Run Locally)

### 1. Clone dự án về máy
```bash
git clone [https://github.com/minhtriet7/Pet_Shop.git](https://github.com/minhtriet7/Pet_Shop.git)
cd Pet_Shop
```

### 2. Cài đặt và cấu hình Backend
```bash
cd server
npm install
```
Tạo file `.env` trong thư mục `server` và cấu hình các biến môi trường:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
# ... (Thêm các API VNPAY nếu có)
```
Chạy Backend:
```bash
npm run dev
```

### 3. Cài đặt và cấu hình Frontend
Mở một Terminal mới:
```bash
cd client
npm install
```
Chạy Frontend:
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173`

## 📸 Giao diện dự án (Screenshots)
*(Sắp tới bạn có thể chụp ảnh trang chủ, trang Admin, Chatbot AI và dán link ảnh vào đây để README thêm sinh động nhé!)*

---
**Tác giả:** Minh Triết  
**Môn học / Đồ án:** Đồ án Web Thú Cưng
```
