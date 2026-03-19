const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Tất cả thao tác với giỏ hàng đều cần đăng nhập
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:productId')
  .delete(removeFromCart);

module.exports = router;