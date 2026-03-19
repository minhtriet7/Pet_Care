const Service = require("../models/Service");

// @desc    Tạo dịch vụ mới (Chỉ Admin)
// @route   POST /api/services
exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res
      .status(201)
      .json({
        success: true,
        message: "Tạo dịch vụ thành công",
        data: service,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Lỗi tạo dịch vụ",
        error: error.message,
      });
  }
};

// @desc    Lấy tất cả dịch vụ (Ai cũng xem được)
// @route   GET /api/services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({}).populate("category", "name");
    res
      .status(200)
      .json({
        success: true,
        message: "Lấy danh sách dịch vụ thành công",
        data: services,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi lấy danh sách dịch vụ",
        error: error.message,
      });
  }
};
// @desc    Lấy chi tiết 1 dịch vụ
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("category", "name");
    if (!service) {
      return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ" });
    }
    res.status(200).json({
      success: true,
      message: "Lấy chi tiết dịch vụ thành công",
      data: service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};