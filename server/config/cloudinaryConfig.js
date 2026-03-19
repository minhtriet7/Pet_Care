const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình thông tin Cloudinary từ file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình kho lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petcare_uploads', // Tên thư mục sẽ chứa ảnh trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Các đuôi ảnh được phép
  },
});

const upload = multer({ storage });

module.exports = upload;