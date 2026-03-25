const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { protect, admin } = require("../middleware/authMiddleware");

// 1. CÁC ROUTE CỦA KHÁCH HÀNG (Ai cũng vào được, không cần đăng nhập)
router.route("/").get(getBlogs);
router.route("/:id").get(getBlogById);

// 2. CÁC ROUTE CỦA ADMIN (Bắt buộc phải đăng nhập và là Admin)
router.route("/").post(protect, admin, createBlog);
router
  .route("/:id")
  .put(protect, admin, updateBlog)
  .delete(protect, admin, deleteBlog);

module.exports = router;
