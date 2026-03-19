const Review = require("../models/Review");
const Product = require("../models/Product");
const Service = require("../models/Service");

// @desc    Tạo đánh giá mới cho Sản phẩm hoặc Dịch vụ
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { item, itemModel, rating, comment, images } = req.body;

    const alreadyReviewed = await Review.findOne({ user: req.user._id, item });
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Bạn đã đánh giá sản phẩm/dịch vụ này rồi",
        });
    }

    const review = new Review({
      user: req.user._id,
      item,
      itemModel,
      rating: Number(rating),
      comment,
      images,
    });

    await review.save();

    const reviews = await Review.find({ item });
    const numOfReviews = reviews.length;
    const ratingsAverage =
      reviews.reduce((acc, r) => acc + r.rating, 0) / numOfReviews;

    if (itemModel === "Product") {
      await Product.findByIdAndUpdate(item, { ratingsAverage, numOfReviews });
    } else if (itemModel === "Service") {
      await Service.findByIdAndUpdate(item, { ratingsAverage, numOfReviews });
    }else if (itemModel === "Pet") {
      // ĐỪNG QUÊN IMPORT MÔ HÌNH Pet Ở ĐẦU FILE NHÉ: const Pet = require("../models/Pet");
      await Pet.findByIdAndUpdate(item, { ratingsAverage, numOfReviews });
    }

    res
      .status(201)
      .json({ success: true, message: "Đánh giá thành công", data: review });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi thêm đánh giá",
        error: error.message,
      });
  }
};

// @desc    Lấy tất cả bình luận của 1 sản phẩm/dịch vụ
// @route   GET /api/reviews/:itemId
// @access  Public
const getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({
        success: true,
        message: "Lấy danh sách đánh giá thành công",
        data: reviews,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

module.exports = { createReview, getItemReviews };
