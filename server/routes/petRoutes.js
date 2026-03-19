const express = require("express");
const router = express.Router();
const {
  createPet,
  getMyPets,
  getPetsForSale,
  getPetById,
  deletePet,
} = require("../controllers/petController");
const { protect } = require("../middleware/authMiddleware");

// Route lấy thú cưng CỦA TÔI (Phải đăng nhập) - Đặt lên TRÊN CÙNG
router.route("/my-pets").get(protect, getMyPets);

// Route lấy thú cưng ĐANG BÁN (Public) - Đặt lên TRÊN CÙNG
router.route("/forsale").get(getPetsForSale);

// Các route cơ bản chung chung (Thêm mới, Xóa, Xem chi tiết ID)
router.route("/")
  .post(protect, createPet);

router.route("/:id")
  .get(getPetById)
  .delete(protect, deletePet);

module.exports = router;