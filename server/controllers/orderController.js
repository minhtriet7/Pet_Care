const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Không có sản phẩm nào để đặt hàng" });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });
    const createdOrder = await order.save();

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    await Cart.findOneAndUpdate({ user: req.user._id }, { cartItems: [] });
    res
      .status(201)
      .json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: createdOrder,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi tạo đơn hàng",
        error: error.message,
      });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Lấy danh sách đơn hàng thành công",
        data: orders,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Bạn không có quyền xem đơn hàng này",
        });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Lấy chi tiết đơn hàng thành công",
        data: order,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "id name");
    res
      .status(200)
      .json({
        success: true,
        message: "Lấy tất cả đơn hàng thành công",
        data: orders,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    order.orderStatus = req.body.status;
    if (req.body.status === "delivered") order.paymentStatus = "paid";

    const updatedOrder = await order.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        data: updatedOrder,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address,
    };

    const updatedOrder = await order.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật trạng thái thanh toán thành công",
        data: updatedOrder,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi cập nhật thanh toán",
        error: error.message,
      });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  updateOrderToPaid,
};
