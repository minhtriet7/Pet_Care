const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const { protect, admin } = require("../middleware/authMiddleware");
// Các route này đều yêu cầu đăng nhập
router.use(protect);

router.route("/").post(createAppointment);

router.route("/my-appointments").get(getMyAppointments);
router.route("/:id/status").put(protect, admin, updateAppointmentStatus);
module.exports = router;
