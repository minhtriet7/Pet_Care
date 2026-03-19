const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import thư viện mã hóa

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  avatar: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Thêm dòng này
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // Dùng 'return' thay vì 'next()'
  }

  // Tạo "muối" (salt) để tăng độ phức tạp cho mật khẩu
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); 
});

// Thêm method để kiểm tra mật khẩu lúc đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);