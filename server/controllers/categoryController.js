const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, type, description, image } = req.body;
    const category = await Category.create({
      name,
      slug,
      type,
      description,
      image,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Tạo danh mục thành công",
        data: category,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Lỗi tạo danh mục",
        error: error.message,
      });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res
      .status(200)
      .json({
        success: true,
        message: "Lấy danh sách danh mục thành công",
        data: categories,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi lấy danh sách danh mục",
        error: error.message,
      });
  }
};
