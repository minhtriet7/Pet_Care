const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  toggleWishlist,
  updateUserProfile,
  getUsers, 
  deleteUser, // <-- Import hàm mới
} = require("../controllers/userController");

// Bổ sung import thêm 'admin' middleware
const { protect, admin } = require("../middleware/authMiddleware");

// Route Đăng ký và Đăng nhập (Public)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Route Profile của cá nhân User (Cần đăng nhập)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser);
// Route thêm/xóa yêu thích (Private)
router.post("/wishlist", protect, toggleWishlist);

// ---> ROUTE MỚI BỔ SUNG: Lấy tất cả user (Chỉ Admin mới được phép gọi)
router.route("/").get(protect, admin, getUsers);

module.exports = router;
