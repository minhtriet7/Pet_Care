const Pet = require("../models/Pet");

// @desc    Thêm thú cưng mới
// @route   POST /api/pets
// @access  Private
exports.createPet = async (req, res) => {
  try {
    const { name, species, breed, age, weight, gender, medicalHistory } =
      req.body;

    const pet = new Pet({
     owner: req.user._id,// LƯU Ý: Trường này tên là 'owner'
      name,
      species,
      breed,
      age,
      weight,
      gender,
      medicalHistory,
    });

    const savedPet = await pet.save();
    res.status(201).json({
      success: true,
      message: "Thêm thú cưng thành công",
      data: savedPet,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi thêm thú cưng",
      error: error.message,
    });
  }
};

// @desc    Lấy danh sách thú cưng CỦA TÔI (người dùng đang đăng nhập)
// @route   GET /api/pets/my-pets
// @access  Private
exports.getMyPets = async (req, res) => {
  try {
    // Tìm đúng trường 'customer' trong Database
    const pets = await Pet.find({ owner: req.user._id });
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thú cưng", error });
  }
};

// @desc    Lấy danh sách thú cưng ĐANG BÁN (hiển thị ngoài trang chủ/shop)
// @route   GET /api/pets/forsale
// @access  Public
exports.getPetsForSale = async (req, res) => {
  try {
    const pets = await Pet.find({ forSale: true });
    res.status(200).json({
      success: true,
      message: "Lấy danh sách thú cưng đang bán thành công",
      data: pets,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// @desc    Lấy chi tiết 1 thú cưng bằng ID
// @route   GET /api/pets/:id
// @access  Public
exports.getPetById = async (req, res) => {
  try {
    // Đã fix lỗi: Tìm chính xác theo ID truyền trên URL
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thú cưng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết thú cưng thành công",
      data: pet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Xóa thú cưng
// @route   DELETE /api/pets/:id
// @access  Private
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thú cưng" });

    // Kiểm tra quyền: Chỉ chủ sở hữu mới được xóa thú cưng của mình
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa thú cưng này",
      });
    }

    await pet.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Đã xóa thú cưng thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};
