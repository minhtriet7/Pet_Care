import React from 'react';
import { DollarSign, ShoppingBag, CalendarDays, PackageX, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- MOCK DATA (Dữ liệu giả lập - Sau này sẽ gọi từ API kết nối với các Controller) ---

// 1. Thống kê nhanh
const kpiData = {
  totalRevenue: 158000000, // Tổng doanh thu (VNĐ) -> Từ orderController + appointmentController
  newOrders: 25,            // Đơn hàng mới hôm nay -> Từ orderController
  newAppointments: 12,      // Lịch hẹn mới hôm nay -> Từ appointmentController
  totalUsers: 1250,         // Tổng khách hàng -> Từ userController
  lowStockProducts: 8       // Sản phẩm sắp hết hàng -> Từ productController
};

// 2. Dữ liệu biểu đồ xu hướng (Doanh thu & Lịch hẹn theo tháng)
const trendData = [
  { name: 'T1', doanhThu: 40, lichHen: 24 },
  { name: 'T2', doanhThu: 30, lichHen: 13 },
  { name: 'T3', doanhThu: 20, lichHen: 35 },
  { name: 'T4', doanhThu: 27, lichHen: 39 },
  { name: 'T5', doanhThu: 18, lichHen: 48 },
  { name: 'T6', doanhThu: 23, lichHen: 38 },
  { name: 'T7', doanhThu: 34, lichHen: 43 },
];

// 3. Dữ liệu biểu đồ tròn (Cơ cấu doanh thu)
const revenueStructureData = [
  { name: 'Sản phẩm (Shop)', value: 65 }, // -> Từ productController
  { name: 'Dịch vụ (Spa/Khám)', value: 35 }, // -> Từ serviceController
];
const COLORS = ['#F97316', '#3B82F6']; // Cam (Sản phẩm), Xanh (Dịch vụ)

// 4. Hoạt động gần đây
const recentOrders = [
  { id: 'ORD001', customer: 'Nguyễn Văn A', status: 'Đang giao', amount: 550000 },
  { id: 'ORD002', customer: 'Trần Thị B', status: 'Hoàn thành', amount: 1200000 },
];
const upcomingAppointments = [
  { id: 'APT001', pet: 'Milo (Corgi)', service: 'Tắm sấy', time: '14:30 - Hôm nay' },
  { id: 'APT002', pet: 'Luna (Mèo)', service: 'Khám bệnh', time: '09:00 - Mai' },
];

// --- COMPONENT CHÍNH ---

export default function Dashboard() {
  const formatVNĐ = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950">Tổng quan quản trị</h1>
        <div className="text-sm text-gray-500">Cập nhật lần cuối: 9:30 AM, Hôm nay</div>
      </div>

      {/* 1. KPI Cards - Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Tổng doanh thu (Tháng)" value={formatVNĐ(kpiData.totalRevenue)} Icon={DollarSign} color="text-orange-600" bgColor="bg-orange-50" />
        <StatCard title="Đơn hàng mới (Hôm nay)" value={kpiData.newOrders} Icon={ShoppingBag} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Lịch hẹn Spa/Khám (Hôm nay)" value={kpiData.newAppointments} Icon={CalendarDays} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="Sản phẩm sắp hết hàng" value={kpiData.lowStockProducts} Icon={PackageX} color="text-red-600" bgColor="bg-red-50" />
      </div>

      {/* 2. Biểu đồ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Biểu đồ đường - Xu hướng */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Xu hướng kinh doanh (7 tháng gần nhất)</h2>
            <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1.5 text-orange-600"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Doanh thu (Triệu VNĐ)</span>
                <span className="flex items-center gap-1.5 text-blue-600"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Lịch hẹn</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="doanhThu" stroke="#F97316" strokeWidth={3} dot={{ r: 5, strokeWidth: 3, fill: 'white' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="lichHen" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, strokeWidth: 3, fill: 'white' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn - Cơ cấu doanh thu */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Cơ cấu doanh thu (%)</h2>
          <div className="flex-grow h-60 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueStructureData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" cornerRadius={8}>
                  {revenueStructureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
                <div className="text-4xl font-bold text-gray-950">100%</div>
                <div className="text-sm text-gray-500">Tổng nguồn thu</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            {revenueStructureData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></span>
                    <span className="text-gray-600">{entry.name}</span>
                    <span className="font-semibold text-gray-950 ml-auto">{entry.value}%</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Đơn hàng mới */}
        <RecentActivityCard title="Đơn hàng mới cần xử lý" data={recentOrders} type="order" formatPrice={formatVNĐ} />
        {/* Lịch hẹn sắp tới */}
        <RecentActivityCard title="Lịch hẹn Spa/Khám sắp tới" data={upcomingAppointments} type="appointment" />
      </div>

    </div>
  );
}

// --- HELPER COMPONENTS ---

// Thẻ thống kê
// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, Icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
    <div className={`p-3 rounded-2xl ${bgColor}`}>
      <Icon className={`w-7 h-7 ${color}`} strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-950 mt-1">{value}</p>
    </div>
    <TrendingUp className="w-5 h-5 text-green-500 ml-auto" />
  </div>
);

// Thẻ hoạt động gần đây
const RecentActivityCard = ({ title, data, type, formatPrice }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button className="text-sm font-medium text-orange-600 hover:text-orange-700">Xem tất cả</button>
        </div>
        <div className="space-y-4">
            {data.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className={`p-2.5 rounded-xl ${type === 'order' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {type === 'order' ? <ShoppingBag size={20}/> : <CalendarDays size={20}/>}
                    </div>
                    <div className="flex-grow grid grid-cols-3 gap-2 items-center">
                        <div className='col-span-2'>
                            <p className="font-semibold text-gray-950">{type === 'order' ? `Đơn hàng ${item.id}` : `Lịch: ${item.pet}`}</p>
                            <p className="text-xs text-gray-500">{type === 'order' ? `Khách: ${item.customer}` : `Dịch vụ: ${item.service}`}</p>
                        </div>
                        <div className='text-right'>
                            <p className={`text-sm font-bold ${type === 'order' ? 'text-gray-950' : 'text-orange-600'}`}>{type === 'order' ? formatPrice(item.amount) : item.time}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type === 'order' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                                {type === 'order' ? item.status : 'Đã xác nhận'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)