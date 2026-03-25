const Blog = require("../models/Blog");

// @desc    Lấy danh sách TẤT CẢ bài viết
// @route   GET /api/blogs
// @access  Public (Ai cũng xem được)
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// @desc    Lấy CHI TIẾT 1 bài viết bằng ID
// @route   GET /api/blogs/:id
// @access  Public (Ai cũng xem được)
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// @desc    THÊM bài viết mới
// @route   POST /api/blogs
// @access  Private/Admin (Chỉ Admin mới được làm)
exports.createBlog = async (req, res) => {
  try {
    const blog = new Blog(req.body);
    const savedBlog = await blog.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Tạo bài viết thành công",
        data: savedBlog,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Lỗi khi tạo bài viết",
        error: error.message,
      });
  }
};

// @desc    SỬA bài viết
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });

    res
      .status(200)
      .json({ success: true, message: "Cập nhật thành công", data: blog });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Lỗi cập nhật", error: error.message });
  }
};

// @desc    XÓA bài viết
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });

    res
      .status(200)
      .json({ success: true, message: "Đã xóa bài viết thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};
