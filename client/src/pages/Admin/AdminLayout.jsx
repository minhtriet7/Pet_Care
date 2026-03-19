import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
// Đã thêm các Icon mới: Layers3 (Danh mục), FileText (Blog), Stethoscope (Dịch vụ)
import { LayoutDashboard, Package, ShoppingCart, Users, Calendar, Settings, LogOut, PawPrint, Layers3, FileText, Stethoscope } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  // Đã bổ sung các menu còn thiếu vào Sidebar
  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { path: '/admin/categories', icon: <Layers3 size={20} />, label: 'Danh mục' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Sản phẩm' },
    { path: '/admin/services', icon: <Stethoscope size={20} />, label: 'Dịch vụ (Spa/Khám)' },
    { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Đơn hàng' },
    { path: '/admin/appointments', icon: <Calendar size={20} />, label: 'Lịch hẹn' },
    { path: '/admin/blogs', icon: <FileText size={20} />, label: 'Bài viết (Blog)' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Khách hàng' },
  ];



  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <PawPrint className="text-orange-500 mr-2" size={28} />
          <span className="font-bold text-2xl tracking-tight">Pet<span className="text-orange-500">Admin</span></span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              {item.icon}
              <span className="ml-3 font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center px-4 py-3 text-gray-400 hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="ml-3 font-medium">Về Trang chủ</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-bold text-gray-800">Bảng điều khiển</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900">Admin Manager</p>
              <p className="text-xs text-gray-500">admin@petcare.vn</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold">A</div>
          </div>
        </header>

        {/* Dynamic Content (Nơi nhúng các trang con vào) */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}