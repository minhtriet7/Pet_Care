const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAllAppointments, // <-- Import hàm mới
} = require("../controllers/appointmentController");

const { protect, admin } = require("../middleware/authMiddleware");

// Các route này đều yêu cầu đăng nhập
router.use(protect);

// ---> ROUTE MỚI BỔ SUNG: Lấy toàn bộ lịch hẹn (Dành cho Admin)
// Route này nên đặt lên trên cùng để tránh bị nhầm lẫn với các route dạng param (/:id)
router.route("/all").get(admin, getAllAppointments);

// Khách hàng tạo lịch hẹn mới
router.route("/").post(createAppointment);

// Khách hàng xem lịch sử đặt lịch của cá nhân
router.route("/my-appointments").get(getMyAppointments);

// Admin cập nhật trạng thái lịch hẹn (Xác nhận, hủy, hoàn thành...)
router.route("/:id/status").put(admin, updateAppointmentStatus);

module.exports = router;
