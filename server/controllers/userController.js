const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "Email này đã được sử dụng!" });

    const user = await User.create({ name, email, password, phone });
    if (user) {
      const emailHtml = `<h2>Chào mừng ${user.name} đến với PetCare!</h2><p>Cảm ơn bạn đã đăng ký tài khoản.</p>`;
      sendEmail({
        email: user.email,
        subject: "Xác nhận đăng ký tài khoản PetCare",
        html: emailHtml,
      }).catch((err) => console.log(err));

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Dữ liệu người dùng không hợp lệ" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res
        .status(401)
        .json({
          success: false,
          message: "Email hoặc mật khẩu không chính xác",
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    res
      .status(200)
      .json({
        success: true,
        message: "Lấy thông tin profile thành công",
        data: user,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.avatar = req.body.avatar || user.avatar;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi cập nhật", error: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const isLiked = user.wishlist.includes(productId);

    if (isLiked) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString(),
      );
    } else {
      user.wishlist.push(productId);
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: isLiked ? "Đã bỏ thích sản phẩm" : "Đã thêm vào yêu thích",
      data: { wishlist: user.wishlist },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi xử lý yêu thích",
        error: error.message,
      });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleWishlist,
};
