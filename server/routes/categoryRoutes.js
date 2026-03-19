const express = require('express');
const router = express.Router();
const { createCategory, getCategories } = require('../controllers/categoryController'); // Thêm getCategories
const { protect, admin } = require('../middleware/authMiddleware'); 

router.route('/')
  .get(getCategories) // Ai cũng xem được danh mục
  .post(protect, admin, createCategory); // Chỉ Admin mới được tạo

module.exports = router;