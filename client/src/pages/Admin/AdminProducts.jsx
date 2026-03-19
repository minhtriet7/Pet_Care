import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý Sản phẩm</h2>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="flex mb-6 relative">
        <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" />
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Sản phẩm</th>
              <th className="p-4 font-semibold">Danh mục</th>
              <th className="p-4 font-semibold">Giá bán</th>
              <th className="p-4 font-semibold">Tồn kho</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-orange-500 font-bold">Đang tải dữ liệu...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có sản phẩm nào.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.images?.[0] || p.imageUrl || 'https://via.placeholder.com/50'} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    <span className="font-bold text-gray-900 line-clamp-1">{p.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">{p.category?.name || p._categorySlug || 'Khác'}</td>
                  <td className="p-4 font-bold text-orange-500">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg font-bold text-xs ${p.stock > 10 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"><Edit size={16} /></button>
                    <button className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}