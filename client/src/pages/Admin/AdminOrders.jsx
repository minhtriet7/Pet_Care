import React, { useState } from 'react';
import { Eye, Search } from 'lucide-react';

export default function AdminOrders() {
  // MOCK DATA
  const mockOrders = [
    { _id: 'ORD-12345', user: { name: 'Nguyễn Văn A' }, totalPrice: 450000, isPaid: true, orderStatus: 'processing', createdAt: '2026-03-18' },
    { _id: 'ORD-12346', user: { name: 'Trần Thị B' }, totalPrice: 1250000, isPaid: false, orderStatus: 'pending', createdAt: '2026-03-17' },
  ];

  // KHỞI TẠO STATE TRỰC TIẾP (Xóa loading và useEffect đi để dọn sạch lỗi)
  const [orders] = useState(mockOrders);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Đơn hàng</h2>

      <div className="flex mb-6 relative">
        <input type="text" placeholder="Tìm kiếm mã đơn hàng..." className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" />
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Mã Đơn</th>
              <th className="p-4 font-semibold">Khách Hàng</th>
              <th className="p-4 font-semibold">Ngày Đặt</th>
              <th className="p-4 font-semibold">Tổng Tiền</th>
              <th className="p-4 font-semibold">Thanh Toán</th>
              <th className="p-4 font-semibold">Trạng Thái</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{o._id}</td>
                <td className="p-4 text-gray-600">{o.user?.name}</td>
                <td className="p-4 text-gray-600">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 font-bold text-orange-500">{formatPrice(o.totalPrice)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${o.isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {o.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${o.orderStatus === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {o.orderStatus.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white rounded-lg transition-colors"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}