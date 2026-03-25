import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, Filter } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Quản lý trạng thái Đang Sửa
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
    images: [],
  });

  const getToken = () => JSON.parse(localStorage.getItem("userInfo"))?.token;

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("http://localhost:5000/api/products").then((res) => res.json()),
        fetch("http://localhost:5000/api/categories").then((res) => res.json()),
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success)
        setCategories(catRes.data.filter((c) => c.type === "product"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const data = new FormData();
    data.append("image", file);
    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.imageUrl)
        setFormData({ ...formData, images: [result.imageUrl] });
    } catch (error) {
      alert("Lỗi upload ảnh", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `http://localhost:5000/api/products/${editingId}`
      : "http://localhost:5000/api/products";
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
        alert(editingId ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!");
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

  // Mở modal để Sửa
  const handleEdit = (p) => {
    setEditingId(p._id);
    setFormData({
      name: p.name,
      slug: p.slug,
      category: p.category?._id || "",
      price: p.price,
      stock: p.stock,
      description: p.description,
      images: p.images || [],
    });
    setShowModal(true);
  };

  // Nút Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Chắc chắn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
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

  const displayedProducts = filterCategory
    ? products.filter((p) => p.category?._id === filterCategory)
    : products;
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý Sản phẩm</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              slug: "",
              category: "",
              price: 0,
              stock: 0,
              description: "",
              images: [],
            });
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      <div className="flex mb-6 gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none"
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        </div>
        <div className="relative min-w-[200px]">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none bg-gray-50"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <Filter size={18} className="absolute left-3 top-3 text-orange-500" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Sản phẩm</th>
              <th className="p-4 font-semibold">Danh mục</th>
              <th className="p-4 font-semibold">Giá bán</th>
              <th className="p-4 font-semibold">Tồn kho</th>
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
              displayedProducts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/50"}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="font-bold text-gray-900">{p.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {p.category?.name || "Khác"}
                  </td>
                  <td className="p-4 font-bold text-orange-500">
                    {formatPrice(p.price)}
                  </td>
                  <td className="p-4 font-bold text-gray-700">{p.stock}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
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
              {editingId ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold mb-1">
                  Tên sản phẩm
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
                  Giá bán (VNĐ)
                </label>
                <input
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Tồn kho
                </label>
                <input
                  required
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Hình ảnh
                </label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border rounded-xl"
                  accept="image/*"
                />
                {uploadingImage && (
                  <span className="text-sm text-orange-500">Đang tải...</span>
                )}
                {formData.images[0] && (
                  <img
                    src={formData.images[0]}
                    className="h-20 mt-2 rounded-lg border"
                  />
                )}
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
                  disabled={uploadingImage}
                  type="submit"
                  className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl"
                >
                  {editingId ? "Lưu Cập Nhật" : "Lưu Sản Phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
