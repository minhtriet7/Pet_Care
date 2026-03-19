const express = require('express');
const router = express.Router();
const { createReview, getItemReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Khách hàng đăng bài đánh giá (Cần Token)
router.route('/').post(protect, createReview);

// Xem danh sách đánh giá của 1 mặt hàng cụ thể (Không cần Token)
router.route('/:itemId').get(getItemReviews);

module.exports = router;