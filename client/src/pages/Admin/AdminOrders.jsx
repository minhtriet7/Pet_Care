import React, { useState, useEffect } from "react";
import { Eye, Search } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy Token dùng chung
  const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo?.token || userInfo?.data?.token;
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // HÀM DUYỆT / CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
  const handleUpdateStatus = async (orderId, newStatus) => {
    // Thêm hộp thoại cảnh báo để tránh Admin bấm nhầm
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn chuyển đơn hàng này sang trạng thái: ${newStatus}?`,
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await res.json();
      if (data.success) {
        alert("Cập nhật trạng thái thành công!");
        fetchOrders(); // Load lại dữ liệu để cập nhật màu sắc
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi khi cập nhật đơn hàng", error);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Đơn hàng</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Mã Đơn</th>
              <th className="p-4 font-semibold">Khách Hàng</th>
              <th className="p-4 font-semibold">Tổng Tiền</th>
              <th className="p-4 font-semibold">Thanh Toán</th>
              <th className="p-4 font-semibold">Cập nhật Trạng thái</th>
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
              orders.map((o) => {
                // Biến kiểm tra xem đơn hàng đã chốt sổ chưa
                const isFinished =
                  o.orderStatus === "delivered" ||
                  o.orderStatus === "cancelled";

                return (
                  <tr
                    key={o._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td
                      className="p-4 font-bold text-gray-900 line-clamp-1 w-24"
                      title={o._id}
                    >
                      {o._id.substring(0, 8)}...
                    </td>
                    <td className="p-4 text-gray-600">
                      {o.user?.name || "Khách vãng lai"}
                    </td>
                    <td className="p-4 font-bold text-orange-500">
                      {formatPrice(o.totalPrice)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${o.paymentStatus === "paid" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}
                      >
                        {o.paymentStatus === "paid"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </span>
                    </td>
                    <td className="p-4">
                      {/* NẾU ĐÃ GIAO HOẶC ĐÃ HỦY -> KHÓA LẠI, KHÔNG CHO SỬA NỮA */}
                      {isFinished ? (
                        <span
                          className={`text-sm font-bold italic py-1.5 ${o.orderStatus === "delivered" ? "text-green-600" : "text-red-600"}`}
                        >
                          {o.orderStatus === "delivered"
                            ? "Đã giao thành công"
                            : "Đã hủy"}
                        </span>
                      ) : (
                        <select
                          value={o.orderStatus}
                          onChange={(e) =>
                            handleUpdateStatus(o._id, e.target.value)
                          }
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold outline-none focus:border-orange-500"
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="processing">Đang chuẩn bị hàng</option>
                          <option value="shipped">Đang giao hàng</option>
                          <option value="delivered">Đã giao thành công</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
