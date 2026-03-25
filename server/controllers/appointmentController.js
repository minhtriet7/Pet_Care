const Appointment = require("../models/Appointment");

const createAppointment = async (req, res) => {
  try {
    const { pet, service, date, timeSlot, totalPrice, notes } = req.body;
    const appointment = new Appointment({
      user: req.user._id,
      pet,
      service,
      date,
      timeSlot,
      totalPrice,
      notes,
    });
    const savedAppointment = await appointment.save();

    res.status(201).json({
      success: true,
      message: "Đặt lịch hẹn thành công",
      data: savedAppointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi đặt lịch",
      error: error.message,
    });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate("pet", "name species")
      .populate("service", "name");

    res.status(200).json({
      success: true,
      message: "Lấy danh sách lịch hẹn thành công",
      data: appointments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lịch hẹn" });

    // Cập nhật trạng thái lịch hẹn
    appointment.status = req.body.status || appointment.status;
    if (req.body.staff) appointment.staff = req.body.staff;

    // THÊM LOGIC NÀY: Nếu lịch hẹn đã "Hoàn thành" -> Đánh dấu là đã thanh toán
    if (req.body.status === "completed") {
      appointment.paymentStatus = "paid";
    }

    const updatedAppointment = await appointment.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái lịch hẹn thành công",
      data: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật lịch hẹn",
      error: error.message,
    });
  }
};

// ---> HÀM MỚI BỔ SUNG: Lấy toàn bộ lịch hẹn cho Admin
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("user", "name") // Lấy tên khách hàng
      .populate("pet", "name species") // Lấy tên và loài thú cưng
      .populate("service", "name"); // Lấy tên dịch vụ

    res.status(200).json({
      success: true,
      message: "Lấy tất cả lịch hẹn thành công",
      data: appointments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAllAppointments, // <-- Nhớ phải có dòng này để export hàm mới
};
