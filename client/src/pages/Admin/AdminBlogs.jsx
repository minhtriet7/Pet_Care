import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import axiosClient from "../../utils/axiosClient";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho Modal (Form Thêm/Sửa)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Chăm sóc thú cưng", // Mặc định chọn danh mục 1
    author: "Admin",
    status: "published",
    content: "",
    image: "",
  });

  // Gọi API lấy danh sách bài viết
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/blogs");
      if (res.success || res.data) {
        setBlogs(res.data?.data || res.data || res);
      }
    } catch (error) {
      console.error("Lỗi lấy bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Hàm xử lý link ảnh hiển thị
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  // Xử lý Upload Ảnh bìa
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    try {
      const res = await axiosClient.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = res.imageUrl || res.data?.imageUrl || res.url;
      setFormData({ ...formData, image: uploadedUrl });
    } catch (error) {
      alert("Lỗi tải ảnh lên!", error);
    }
  };

  // Mở form Thêm mới
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      category: "Chăm sóc thú cưng", // Đặt lại mặc định
      author: "Admin",
      status: "published",
      content: "",
      image: "",
    });
    setShowModal(true);
  };

  // Mở form Sửa
  const handleOpenEdit = (blog) => {
    setIsEditing(true);
    setCurrentId(blog._id);
    setFormData({
      title: blog.title,
      category: blog.category || "Chăm sóc thú cưng",
      author: blog.author,
      status: blog.status,
      content: blog.content,
      image: blog.image || "",
    });
    setShowModal(true);
  };

  // Submit Form (Thêm hoặc Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.put(`/blogs/${currentId}`, formData);
        alert("Cập nhật bài viết thành công!");
      } else {
        await axiosClient.post("/blogs", formData);
        alert("Thêm bài viết mới thành công!");
      }
      setShowModal(false);
      fetchBlogs(); // Load lại danh sách
    } catch (error) {
      alert("Lỗi lưu bài viết: " + (error.response?.data?.message || ""));
    }
  };

  // Xóa bài viết
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?"))
      return;
    try {
      await axiosClient.delete(`/blogs/${id}`);
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (error) {
      alert("Lỗi khi xóa!", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-950">
          Quản lý Bài viết (Blog)
        </h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-md"
        >
          <Plus size={20} /> Viết bài mới
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">
            Đang tải dữ liệu...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-5 font-semibold">Tiêu đề bài viết</th>
                <th className="p-5 font-semibold">Danh mục</th>
                <th className="p-5 font-semibold">Ngày đăng</th>
                <th className="p-5 font-semibold">Trạng thái</th>
                <th className="p-5 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {blogs.map((blog) => (
                <tr
                  key={blog._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-5 font-bold text-gray-900 max-w-xs truncate">
                    {blog.title}
                  </td>
                  <td className="p-5 text-gray-600">
                    <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-xs font-bold">
                      {blog.category}
                    </span>
                  </td>
                  <td className="p-5 text-gray-600">
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${blog.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {blog.status === "published" ? "Đã đăng" : "Bản nháp"}
                    </span>
                  </td>
                  <td className="p-5 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(blog)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Sửa bài"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa bài"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    Chưa có bài viết nào. Hãy bấm "Viết bài mới" để bắt đầu!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL THÊM/SỬA BÀI VIẾT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Tiêu đề bài viết *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                      placeholder="Nhập tiêu đề..."
                    />
                  </div>

                  {/* FIX: ĐỔI INPUT THÀNH SELECT CHỈ CÓ 2 DANH MỤC */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Danh mục *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="Chăm sóc thú cưng">
                        Chăm sóc thú cưng
                      </option>
                      <option value="Dinh dưỡng">Dinh dưỡng</option>
                    </select>
                  </div>
                  {/* ------------------------------------------- */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Tác giả
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) =>
                          setFormData({ ...formData, author: e.target.value })
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Trạng thái
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 bg-white"
                      >
                        <option value="published">Đăng ngay</option>
                        <option value="draft">Lưu nháp</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Phần Upload Ảnh Bìa */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Ảnh bìa bài viết
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl h-[210px] flex flex-col items-center justify-center relative overflow-hidden group bg-gray-50">
                    {formData.image ? (
                      <img
                        src={getImageUrl(formData.image)}
                        alt="cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-gray-400">
                        <ImageIcon size={40} className="mx-auto mb-2" />
                        <p className="text-sm">Nhấn để tải ảnh lên</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nội dung chi tiết *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows="10"
                  className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-orange-500 resize-none leading-relaxed"
                  placeholder="Viết nội dung bài blog ở đây..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-lg shadow-orange-200 cursor-pointer"
                >
                  {isEditing ? "Lưu thay đổi" : "Đăng bài viết"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
