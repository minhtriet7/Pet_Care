const express = require('express');
const router = express.Router();
const { createCategory, getCategories ,updateCategory, deleteCategory} = require('../controllers/categoryController'); // Thêm getCategories
const { protect, admin } = require('../middleware/authMiddleware'); 

router.route('/')
  .get(getCategories) // Ai cũng xem được danh mục
  .post(protect, admin, createCategory); // Chỉ Admin mới được tạo
router.route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);
module.exports = router;
