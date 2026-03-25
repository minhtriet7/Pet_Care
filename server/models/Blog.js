const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Nội dung bài viết
  category: { type: String, required: true },
  author: { type: String, default: 'Admin' }, // Tên tác giả hiển thị
  image: { type: String }, // Ảnh bìa của bài viết
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);