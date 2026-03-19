const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 }, // Số lượng tồn kho
    images: [{ type: String }],
    brand: { type: String },
    attributes: {
      weight: { type: String }, // Ví dụ: Bao 1kg, 5kg
      flavor: { type: String }, // Vị cá hồi, bò...
      lifestage: { type: String, enum: ["puppy", "adult", "senior","kitten", "all"] },
    },
    sold: { type: Number, default: 0 }, // Số lượng đã bán
    ratingsAverage: {
      type: Number,
      default: 0,
      set: (val) => Math.round(val * 10) / 10,
    },
    numOfReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
