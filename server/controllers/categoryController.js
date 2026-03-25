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
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    res.status(200).json({ success: true, message: "Cập nhật thành công", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    await category.deleteOne();
    res.status(200).json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa danh mục", error: error.message });
  }
};