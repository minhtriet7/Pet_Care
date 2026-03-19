import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function AdminServices() {
  // MOCK DATA
  const mockServices = [
    { _id: 'SRV-01', name: 'Tắm sấy cơ bản', category: 'Spa & Grooming', price: 150000, duration: '60 phút', status: 'active' },
    { _id: 'SRV-02', name: 'Cắt tỉa lông trọn gói', category: 'Spa & Grooming', price: 350000, duration: '120 phút', status: 'active' },
    { _id: 'SRV-03', name: 'Khám bệnh tổng quát', category: 'Thú Y', price: 200000, duration: '30 phút', status: 'active' },
    { _id: 'SRV-04', name: 'Lưu chuồng (Hotel)', category: 'Dịch vụ khác', price: 100000, duration: 'Theo ngày', status: 'inactive' },
  ];

  const [services] = useState(mockServices);
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý Dịch Vụ</h2>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Thêm dịch vụ
        </button>
      </div>

      <div className="flex mb-6 relative">
        <input type="text" placeholder="Tìm kiếm dịch vụ..." className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" />
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Tên Dịch Vụ</th>
              <th className="p-4 font-semibold">Danh mục</th>
              <th className="p-4 font-semibold">Mức Giá</th>
              <th className="p-4 font-semibold">Thời gian</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {services.map((srv) => (
              <tr key={srv._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{srv.name}</td>
                <td className="p-4 text-gray-600">{srv.category}</td>
                <td className="p-4 font-bold text-orange-500">{formatPrice(srv.price)}</td>
                <td className="p-4 text-gray-600">{srv.duration}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${srv.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {srv.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"><Edit size={16} /></button>
                  <button className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}