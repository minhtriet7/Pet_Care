import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Layers3, X } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Lưu ID nếu đang sửa
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "product",
    description: "",
  });

  const getToken = () => JSON.parse(localStorage.getItem("userInfo"))?.token;

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Xử lý Thêm / Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `http://localhost:5000/api/categories/${editingId}`
      : "http://localhost:5000/api/categories";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert(editingId ? "Cập nhật thành công!" : "Thêm danh mục thành công!");
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: "", slug: "", type: "product", description: "" });
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối server!", error);
    }
  };

  // Mở modal để Sửa
  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      description: cat.description || "",
    });
    setShowModal(true);
  };

  // Xử lý Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        alert("Xóa thành công!");
        fetchCategories();
      }
    } catch (error) {
      alert("Lỗi khi xóa!", error);
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
    setFormData({ ...formData, name, slug });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-950">Quản lý Danh mục</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              slug: "",
              type: "product",
              description: "",
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
        >
          <Plus size={20} /> Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 font-bold animate-pulse text-orange-500">
          Đang tải...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                    <Layers3 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-950">
                      {cat.name}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.type === "product" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
                    >
                      {cat.type === "product" ? "Sản phẩm" : "Dịch vụ"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Sửa Danh mục" : "Thêm Danh mục mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Tên danh mục
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Slug</label>
                <input
                  required
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Phân loại
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="product">Sản phẩm</option>
                  <option value="service">Dịch vụ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                  rows="3"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600"
              >
                Lưu Danh Mục
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
