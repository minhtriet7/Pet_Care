const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinaryConfig');

// @desc    Upload 1 ảnh lên Cloudinary
// @route   POST /api/upload
// @access  Public (Tùy bạn có thể thêm middleware protect nếu chỉ cho user đăng nhập up ảnh)
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file ảnh nào được gửi lên' });
    }

    // Trả về URL của ảnh đã được lưu thành công trên Cloud
    res.status(200).json({
      message: 'Tải ảnh lên thành công',
      imageUrl: req.file.path, 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi upload ảnh', error: error.message });
  }
});

module.exports = router;