const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getOrders, updateOrderStatus, updateOrderToPaid } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Tất cả các route dưới đây đều cần đăng nhập
router.use(protect); 

// Các route tĩnh (phải đặt TRƯỚC các route có /:id)
router.route('/all').get(admin, getOrders); // Thêm admin vì chỉ admin mới được xem tất cả
router.route('/my-orders').get(getMyOrders);
router.route('/').post(createOrder);

// Các route động (có chứa /:id)
router.route('/:id').get(getOrderById);

// Admin cập nhật trạng thái vận chuyển
router.route('/:id/status').put(admin, updateOrderStatus); // <-- Xóa updateOrderToPaid ở đây

// User (hoặc hệ thống) cập nhật trạng thái thanh toán PayPal
router.route('/:id/pay').put(updateOrderToPaid);

module.exports = router;