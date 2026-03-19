const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  type: { type: String, enum: ['product', 'service'], required: true },
  description: { type: String },
  subcategories: [{
    name: { type: String, required: true },
    slug: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);