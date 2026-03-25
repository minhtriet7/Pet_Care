const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Đọc file .env

// Import Routes
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
// Import các routes khác (userRoutes, orderRoutes...) ở đây
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const petRoutes = require('./routes/petRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
// Thêm vào khu vực Import
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();

// Middleware chung
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json()); // Phân tích body dạng JSON

// Cấu hình Database
// Cấu hình Database
const connectDB = async () => {
  try {
    // Đổi MONGO_URI thành MONGODB_URI và xóa 2 dòng tùy chọn cũ đi
    await mongoose.connect(process.env.MONGODB_URI); 
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};
connectDB();

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/blogs', blogRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `Không tìm thấy API: ${req.originalUrl}` });
});

// Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});