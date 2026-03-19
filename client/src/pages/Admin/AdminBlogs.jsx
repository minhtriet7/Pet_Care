import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

// MOCK DATA Bài viết
const mockBlogs = [
  { _id: 'BLG01', title: '5 cách chăm sóc mèo Anh lông ngắn vào mùa hè', category: 'Chăm sóc mèo', author: 'Admin', date: '2026-03-15', status: 'published' },
  { _id: 'BLG02', title: 'Chế độ dinh dưỡng chuẩn cho chó Corgi con', category: 'Dinh dưỡng thú cưng', author: 'Bác sĩ thú y', date: '2026-03-12', status: 'draft' },
  { _id: 'BLG03', title: 'Dấu hiệu nhận biết bệnh dại ở chó và cách phòng ngừa', category: 'Sức khỏe', author: 'Admin', date: '2026-03-10', status: 'published' },
];

export default function AdminBlogs() {
  const [blogs] = useState(mockBlogs);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-950">Quản lý Bài viết (Blog)</h1>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus size={20} /> Viết bài mới
        </button>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <input type="text" placeholder="Tìm kiếm tiêu đề bài viết..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none" />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        </div>
        <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 outline-none focus:border-orange-400">
            <option>Tất cả danh mục</option>
            <option>Chăm sóc mèo</option>
            <option>Dinh dưỡng</option>
        </select>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-5 font-semibold">Tiêu đề bài viết</th>
              <th className="p-5 font-semibold">Danh mục</th>
              <th className="p-5 font-semibold">Tác giả</th>
              <th className="p-5 font-semibold">Ngày đăng</th>
              <th className="p-5 font-semibold">Trạng thái</th>
              <th className="p-5 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {blogs.map(blog => (
              <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5 font-medium text-gray-950 max-w-xs truncate">{blog.title}</td>
                <td className="p-5 text-gray-600">{blog.category}</td>
                <td className="p-5 text-gray-600">{blog.author}</td>
                <td className="p-5 text-gray-600">{new Date(blog.date).toLocaleDateString('vi-VN')}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {blog.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                  </span>
                </td>
                <td className="p-5 flex items-center justify-center gap-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye size={16} /></button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}