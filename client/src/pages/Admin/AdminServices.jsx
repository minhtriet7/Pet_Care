import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    basePrice: 0,
    duration: 30,
    description: "",
  });

  const getToken = () => JSON.parse(localStorage.getItem("userInfo"))?.token;

  const fetchData = async () => {
    try {
      const [srvRes, catRes] = await Promise.all([
        fetch("http://localhost:5000/api/services").then((res) => res.json()),
        fetch("http://localhost:5000/api/categories").then((res) => res.json()),
      ]);
      if (srvRes.success) setServices(srvRes.data);
      if (catRes.success)
        setCategories(catRes.data.filter((c) => c.type === "service"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `http://localhost:5000/api/services/${editingId}`
      : "http://localhost:5000/api/services";
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
        alert(editingId ? "Cập nhật thành công!" : "Thêm dịch vụ thành công!");
        setShowModal(false);
        setEditingId(null);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối!", error);
    }
  };

  const handleEdit = (srv) => {
    setEditingId(srv._id);
    setFormData({
      name: srv.name,
      slug: srv.slug,
      category: srv.category?._id || "",
      basePrice: srv.basePrice,
      duration: srv.duration,
      description: srv.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Chắc chắn xóa dịch vụ này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        alert("Xóa thành công!");
        fetchData();
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

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý Dịch Vụ</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              slug: "",
              category: "",
              basePrice: 0,
              duration: 30,
              description: "",
            });
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Thêm dịch vụ
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Tên Dịch Vụ</th>
              <th className="p-4 font-semibold">Danh mục</th>
              <th className="p-4 font-semibold">Mức Giá Cơ Bản</th>
              <th className="p-4 font-semibold">Thời gian (Phút)</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-orange-500 font-bold"
                >
                  Đang tải...
                </td>
              </tr>
            ) : (
              services.map((srv) => (
                <tr
                  key={srv._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-bold text-gray-900">{srv.name}</td>
                  <td className="p-4 text-gray-600">
                    {srv.category?.name || "Khác"}
                  </td>
                  <td className="p-4 font-bold text-orange-500">
                    {formatPrice(srv.basePrice)}
                  </td>
                  <td className="p-4 text-gray-600">{srv.duration}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(srv)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(srv._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Sửa Dịch Vụ" : "Thêm Dịch Vụ Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold mb-1">
                  Tên Dịch vụ
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold mb-1">
                  Danh mục
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Giá cơ bản (VNĐ)
                </label>
                <input
                  required
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Thời lượng (Phút)
                </label>
                <input
                  required
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Mô tả
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                  rows="4"
                ></textarea>
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl"
                >
                  {editingId ? "Cập Nhật" : "Lưu Dịch Vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
