import React, { useState } from 'react';
import { Search, Check, X, Eye } from 'lucide-react';

export default function AdminAppointments() {
  // MOCK DATA: Dữ liệu mẫu giả lập
  const mockAppointments = [
    { _id: 'APT-1001', customerName: 'Nguyễn Văn A', petName: 'Milo (Chó Corgi)', service: 'Tắm sấy & Cắt tỉa', date: '2026-03-20', time: '09:00', status: 'pending' },
    { _id: 'APT-1002', customerName: 'Trần Thị B', petName: 'Luna (Mèo Anh)', service: 'Khám tổng quát', date: '2026-03-20', time: '14:30', status: 'confirmed' },
    { _id: 'APT-1003', customerName: 'Lê Văn C', petName: 'Kiki (Chó Poodle)', service: 'Tiêm phòng Vaccine', date: '2026-03-21', time: '10:00', status: 'completed' },
  ];

  const [appointments] = useState(mockAppointments);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg text-xs font-bold">Chờ xác nhận</span>;
      case 'confirmed': return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold">Đã xác nhận</span>;
      case 'completed': return <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-bold">Hoàn thành</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">Đã hủy</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Lịch hẹn (Spa & Khám)</h2>

      <div className="flex mb-6 relative">
        <input type="text" placeholder="Tìm kiếm theo tên khách, thú cưng..." className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" />
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Mã Lịch</th>
              <th className="p-4 font-semibold">Khách Hàng</th>
              <th className="p-4 font-semibold">Thú Cưng</th>
              <th className="p-4 font-semibold">Dịch Vụ</th>
              <th className="p-4 font-semibold">Thời Gian</th>
              <th className="p-4 font-semibold">Trạng Thái</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {appointments.map((apt) => (
              <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{apt._id}</td>
                <td className="p-4 text-gray-600">{apt.customerName}</td>
                <td className="p-4 text-gray-600 font-medium">{apt.petName}</td>
                <td className="p-4 text-orange-500 font-medium">{apt.service}</td>
                <td className="p-4 text-gray-600">
                  <div className="font-bold">{apt.time}</div>
                  <div className="text-xs">{new Date(apt.date).toLocaleDateString('vi-VN')}</div>
                </td>
                <td className="p-4">{getStatusBadge(apt.status)}</td>
                <td className="p-4 flex justify-center gap-2">
                  <button className="p-2 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg transition-colors" title="Xác nhận"><Check size={16} /></button>
                  <button className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Hủy lịch"><X size={16} /></button>
                  <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white rounded-lg transition-colors" title="Chi tiết"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}