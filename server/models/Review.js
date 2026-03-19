const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID của Product hoặc Service
  itemModel: { type: String, required: true, enum: ['Product', 'Service','Pet'] }, // Phân biệt đánh giá cho cái gì
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  images: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);