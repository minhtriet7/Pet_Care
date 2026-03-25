import React, { useState, useEffect } from "react";
import { Search, Check, X } from "lucide-react";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo?.token || userInfo?.data?.token;
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/appointments/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setAppointments(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // HÀM DUYỆT / HỦY LỊCH HẸN
  const handleUpdateStatus = async (aptId, newStatus) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn chuyển lịch hẹn này sang trạng thái: ${newStatus}?`,
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/${aptId}/status`,
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
        alert("Cập nhật thành công!");
        fetchAppointments();
      }
    } catch (error) {
      alert("Lỗi khi cập nhật lịch hẹn", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg text-xs font-bold">
            Chờ xác nhận
          </span>
        );
      case "confirmed":
        return (
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold">
            Đã xác nhận
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-bold">
            Hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Lịch hẹn</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Khách Hàng</th>
              <th className="p-4 font-semibold">Thú Cưng</th>
              <th className="p-4 font-semibold">Dịch Vụ</th>
              <th className="p-4 font-semibold">Thời Gian</th>
              <th className="p-4 font-semibold">Trạng Thái</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-orange-500 font-bold"
                >
                  Đang tải...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  Chưa có lịch hẹn nào.
                </td>
              </tr>
            ) : (
              appointments.map((apt) => {
                // Biến kiểm tra xem lịch hẹn đã kết thúc chưa
                const isFinished =
                  apt.status === "completed" || apt.status === "cancelled";

                return (
                  <tr
                    key={apt._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-600">
                      {apt.user?.name || "Ẩn danh"}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {apt.pet?.name || "Không rõ"}
                    </td>
                    <td className="p-4 text-orange-500 font-medium">
                      {apt.service?.name}
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="font-bold">{apt.timeSlot}</div>
                      <div className="text-xs">
                        {new Date(apt.date).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(apt.status)}</td>
                    <td className="p-4 flex justify-center gap-2">
                      {/* NẾU ĐÃ HOÀN THÀNH/HỦY THÌ ẨN NÚT VÀ HIỆN CHỮ */}
                      {isFinished ? (
                        <span className="text-gray-400 text-xs font-medium italic py-2">
                          Đã chốt
                        </span>
                      ) : (
                        <>
                          {/* Chỉ hiện nút Xác nhận nếu đang Pending */}
                          {apt.status === "pending" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(apt._id, "confirmed")
                              }
                              className="p-2 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg"
                              title="Xác nhận"
                            >
                              <Check size={16} />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleUpdateStatus(apt._id, "completed")
                            }
                            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold"
                            title="Hoàn thành"
                          >
                            Xong
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateStatus(apt._id, "cancelled")
                            }
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg"
                            title="Hủy lịch"
                          >
                            <X size={16} />
                          </button>
                        </>
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
