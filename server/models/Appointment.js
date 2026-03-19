const mongoose = require('mongoose'); // Thêm dòng này vào
const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // Ví dụ: "09:00 - 10:00"
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Nhân viên phụ trách (nếu có)
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  notes: { type: String } // Ghi chú của khách hàng (VD: bé mèo hơi dữ)
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);