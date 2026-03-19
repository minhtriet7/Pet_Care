const express = require('express');
const router = express.Router();
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts) // Ai cũng xem được
  .post(protect, admin, createProduct); // Chỉ Admin đã đăng nhập mới được tạo
// Xem chi tiết 1 sản phẩm (Public)

// Ví dụ trong productRoutes.js
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct) // Admin sửa sản phẩm
  .delete(protect, admin, deleteProduct); // Admin xóa sản phẩm
module.exports = router;