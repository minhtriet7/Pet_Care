const mongoose = require("mongoose");
const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true }, // Giá cơ bản
    priceVariations: [
      {
        condition: { type: String }, // Ví dụ: "Dưới 5kg", "Từ 5-10kg"
        price: { type: Number },
      },
    ],
    duration: { type: Number, required: true }, // Thời gian thực hiện (phút)
    images: [{ type: String }],
    ratingsAverage: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Service", serviceSchema);
