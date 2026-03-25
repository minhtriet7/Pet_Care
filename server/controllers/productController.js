const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const products = await Product.find({ ...keyword }).populate(
      "category",
      "name",
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: products,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi server khi lấy sản phẩm",
        error: error.message,
      });
  }
};

const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: savedProduct,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        error: error.message,
      });
  }
};

const getProductById = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category')(
      "category",
      "name",
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });

    res
      .status(200)
      .json({
        success: true,
        message: "Lấy chi tiết sản phẩm thành công",
        data: product,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });

    const {
      name,
      slug,
      category,
      description,
      price,
      discountPrice,
      stock,
      images,
      brand,
      attributes,
    } = req.body;
    product.name = name || product.name;
    product.slug = slug || product.slug;
    product.category = category || product.category;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.discountPrice =
      discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    if (attributes) {
      product.attributes = { ...product.attributes, ...attributes };
    }

    const updatedProduct = await product.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: updatedProduct,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi cập nhật sản phẩm",
        error: error.message,
      });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });

    await product.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi xóa sản phẩm",
        error: error.message,
      });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
