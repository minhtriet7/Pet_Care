// models/Pet.js
const mongoose = require('mongoose');
const petSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Chủ sở hữu (Nếu là của Admin thì là hàng của shop)
  name: { type: String, required: true },
  species: { type: String, enum: ['dog', 'cat', 'other'], required: true },
  breed: { type: String }, 
  age: { type: Number }, 
  weight: { type: Number }, 
  gender: { type: String, enum: ['male', 'female'] },
  medicalHistory: { type: String }, 
  avatar: { type: String },

  // --- THÊM 2 TRƯỜNG NÀY ĐỂ BÁN HÀNG ---
  forSale: { type: Boolean, default: false }, // Đánh dấu là đang đăng bán
  price: { type: Number, default: 0 } // Giá bán
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);