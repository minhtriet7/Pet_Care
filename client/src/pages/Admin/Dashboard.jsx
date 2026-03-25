import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  CalendarDays,
  PackageX,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    newOrders: 0,
    newAppointments: 0,
    lowStockProducts: 0,
  });

  // Các state lưu dữ liệu thật cho Biểu đồ và Hoạt động gần đây
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#F97316", "#3B82F6"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token || userInfo?.data?.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Gọi song song nhiều API
        const [ordersRes, aptRes, productsRes] = await Promise.all([
          fetch("http://localhost:5000/api/orders/all", { headers }).then(
            (res) => res.json(),
          ),
          fetch("http://localhost:5000/api/appointments/all", { headers }).then(
            (res) => res.json(),
          ),
          fetch("http://localhost:5000/api/products").then((res) => res.json()),
        ]);

        if (ordersRes.success && aptRes.success && productsRes.success) {
          const orders = ordersRes.data;
          const appointments = aptRes.data;
          const products = productsRes.data;

          // --- 1. TÍNH TOÁN KPI TỔNG ---
          const orderRevenue = orders
            .filter((o) => o.paymentStatus === "paid")
            .reduce((acc, curr) => acc + curr.totalPrice, 0);

          const aptRevenue = appointments
            .filter(
              (a) => a.status === "completed" || a.paymentStatus === "paid",
            )
            .reduce((acc, curr) => acc + curr.totalPrice, 0);

          const totalRevenue = orderRevenue + aptRevenue;
          const lowStock = products.filter((p) => p.stock < 5).length;

          setKpiData({
            totalRevenue: totalRevenue,
            newOrders: orders.length,
            newAppointments: appointments.length,
            lowStockProducts: lowStock,
          });

          // --- 2. TÍNH DỮ LIỆU BIỂU ĐỒ TRÒN (CƠ CẤU DOANH THU) ---
          setPieData([
            { name: "Sản phẩm", value: orderRevenue },
            { name: "Dịch vụ", value: aptRevenue },
          ]);

          // --- 3. TÍNH DỮ LIỆU BIỂU ĐỒ ĐƯỜNG (6 THÁNG GẦN NHẤT) ---
          const monthlyData = {};
          // Khởi tạo khung 6 tháng
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = `T${d.getMonth() + 1}`;
            monthlyData[monthStr] = { name: monthStr, doanhThu: 0, lichHen: 0 };
          }

          // Cộng dồn doanh thu đơn hàng vào từng tháng
          orders.forEach((o) => {
            if (o.paymentStatus === "paid") {
              const d = new Date(o.createdAt);
              const monthStr = `T${d.getMonth() + 1}`;
              if (monthlyData[monthStr])
                monthlyData[monthStr].doanhThu += o.totalPrice;
            }
          });

          // Cộng dồn lịch hẹn và doanh thu dịch vụ vào từng tháng
          appointments.forEach((a) => {
            const d = new Date(a.createdAt || a.date);
            const monthStr = `T${d.getMonth() + 1}`;
            if (monthlyData[monthStr]) {
              monthlyData[monthStr].lichHen += 1; // Đếm số lượng lịch hẹn
              if (a.status === "completed" || a.paymentStatus === "paid") {
                monthlyData[monthStr].doanhThu += a.totalPrice; // Cộng tiền
              }
            }
          });
          setChartData(Object.values(monthlyData));

          // --- 4. HOẠT ĐỘNG GẦN ĐÂY ---
          // Lấy 5 đơn hàng mới nhất
          setRecentOrders(
            orders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5),
          );

          // Lấy 5 lịch hẹn sắp tới (Chưa hoàn thành/Hủy)
          const upcoming = appointments
            .filter((a) => a.status === "pending" || a.status === "confirmed")
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
          setUpcomingAppointments(upcoming);
        }
      } catch (error) {
        console.error("Lỗi khi fetch data Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatVNĐ = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  if (loading)
    return (
      <div className="text-center p-10 font-bold text-orange-500">
        Đang tổng hợp dữ liệu thật...
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950"> Quản trị</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatVNĐ(kpiData.totalRevenue)}
          Icon={DollarSign}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Tổng Đơn hàng"
          value={kpiData.newOrders}
          Icon={ShoppingBag}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Tổng Lịch hẹn"
          value={kpiData.newAppointments}
          Icon={CalendarDays}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Sản phẩm sắp hết"
          value={kpiData.lowStockProducts}
          Icon={PackageX}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Biểu đồ xu hướng (Line Chart) */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Xu hướng kinh doanh (6 tháng qua)
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                {/* Ẩn tick YAxis để giao diện thoáng hơn, Tooltip sẽ hiện chi tiết */}
                <YAxis
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "doanhThu" ? formatVNĐ(value) : value,
                    name === "doanhThu" ? "Doanh thu" : "Lịch hẹn",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="doanhThu"
                  stroke="#F97316"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="lichHen"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Cơ cấu (Pie Chart) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Cơ cấu doanh thu
          </h2>
          <div className="flex-grow h-60 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={5}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatVNĐ(value)} />
              </PieChart>
            </ResponsiveContainer>
            {/* Chú thích màu sắc */}
            <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>Sản
                phẩm
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>Dịch
                vụ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            Đơn hàng mới nhất
          </h2>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có đơn hàng nào.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      #{order._id.substring(0, 6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.user?.name || "Khách vãng lai"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600 text-sm">
                      {formatVNĐ(order.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            Lịch hẹn sắp tới
          </h2>
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Không có lịch hẹn chờ xử lý.
              </p>
            ) : (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {apt.service?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {apt.user?.name} - Thú cưng: {apt.pet?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 text-sm">
                      {apt.timeSlot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(apt.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component cho Dashboard
const StatCard = ({ title, value, Icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`p-3 rounded-2xl ${bgColor}`}>
      <Icon className={`w-7 h-7 ${color}`} strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-950 mt-1">{value}</p>
    </div>
  </div>
);
