const express = require('express');
const router = express.Router();
const { askChatbot } = require('../controllers/chatbotController');

// Không cần bảo vệ bằng token (protect) nếu bạn muốn ai cũng chat được
// Hoặc có thể thêm protect nếu muốn bắt buộc đăng nhập
router.post('/', askChatbot);

module.exports = router;