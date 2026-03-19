const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "cartItems.product",
      "name price images stock",
    );
    if (!cart) cart = await Cart.create({ user: req.user._id, cartItems: [] });

    res
      .status(200)
      .json({ success: true, message: "Lấy giỏ hàng thành công", data: cart });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi lấy giỏ hàng",
        error: error.message,
      });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    if (product.stock < quantity)
      return res
        .status(400)
        .json({ success: false, message: "Số lượng tồn kho không đủ" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [{ product: productId, quantity }],
      });
      return res
        .status(201)
        .json({
          success: true,
          message: "Thêm vào giỏ hàng thành công",
          data: cart,
        });
    }

    const itemIndex = cart.cartItems.findIndex(
      (p) => p.product.toString() === productId,
    );
    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += quantity;
      if (cart.cartItems[itemIndex].quantity > product.stock) {
        cart.cartItems[itemIndex].quantity = product.stock;
      }
    } else {
      cart.cartItems.push({ product: productId, quantity });
    }

    await cart.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật giỏ hàng thành công",
        data: cart,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi thêm vào giỏ hàng",
        error: error.message,
      });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Giỏ hàng trống" });

    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== req.params.productId,
    );
    await cart.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Xóa sản phẩm khỏi giỏ hàng thành công",
        data: cart,
      });
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

module.exports = { getCart, addToCart, removeFromCart };
