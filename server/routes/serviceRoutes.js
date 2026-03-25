const express = require("express");
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect, admin } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(getServices) // Public
  .post(protect, admin, createService); // Admin

router
  .route("/:id")
  .get(getServiceById)
  .put(protect, admin, updateService)
  .delete(protect, admin, deleteService);
module.exports = router;
