import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Layers3 } from 'lucide-react';

// MOCK DATA Danh mục
const mockCategories = [
  { _id: 'CAT01', name: 'Thức ăn hạt', type: 'Sản phẩm', description: 'Các loại hạt dinh dưỡng cho chó mèo', productCount: 150, status: 'active' },
  { _id: 'CAT02', name: 'Đồ chơi thú cưng', type: 'Sản phẩm', description: 'Cần câu mèo, bóng bổng, xương gặm', productCount: 85, status: 'active' },
  { _id: 'CAT03', name: 'Phụ kiện & Vòng cổ', type: 'Sản phẩm', description: 'Áo, xích, vòng cổ, bảng tên', productCount: 42, status: 'active' },
  { _id: 'CAT04', name: 'Sức khỏe thú cưng', type: 'Bài viết (Blog)', description: 'Kiến thức về bệnh và cách phòng ngừa', productCount: 20, status: 'active' },
];

export default function AdminCategories() {
  const [categories] = useState(mockCategories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-950">Quản lý Danh mục</h1>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus size={20} /> Thêm danh mục mới
        </button>
      </div>

      {/* Bảng dữ liệu dạng lưới card - Phù hợp quản lý danh mục */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map(cat => (
            <div key={cat._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:border-orange-100 transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                            <Layers3 size={22}/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-950">{cat.name}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.type === 'Sản phẩm' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                Thuộc: {cat.type}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                </div>
                
                <p className="text-sm text-gray-600 flex-grow mb-5">{cat.description}</p>
                
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                    <p className="text-sm text-gray-500">Số lượng items: <span className="font-semibold text-gray-950">{cat.productCount}</span></p>
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Đang hoạt động
                    </span>
                </div>
            </div>
        ))}
      </div>

    </div>
  );
}