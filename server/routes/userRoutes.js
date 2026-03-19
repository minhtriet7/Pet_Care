const express = require('express');
const router = express.Router();

// Bổ sung thêm toggleWishlist vào dòng này:
const { registerUser, loginUser, getUserProfile, toggleWishlist,updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route Đăng ký và Đăng nhập (Public)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Thay đổi dòng lấy profile thành:
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); // Thêm PUT để update

// Route Lấy thông tin cá nhân (Private - đi qua middleware protect)
router.get('/profile', protect, getUserProfile);

// Route thêm/xóa yêu thích (Private)
router.post('/wishlist', protect, toggleWishlist);

module.exports = router;