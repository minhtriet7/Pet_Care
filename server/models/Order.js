const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // Lưu lại tên lúc mua tránh đổi tên sau này
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // Giá tại thời điểm mua
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['COD', 'VNPAY', 'Momo'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);