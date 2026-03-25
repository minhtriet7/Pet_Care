import React, { useState, useEffect } from "react";
import { Search, Shield, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${userInfo.token || userInfo.data?.token}`,
        },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // HÀM XÓA KHÁCH HÀNG
  const handleDeleteUser = async (id, name) => {
    const confirmDelete = window.confirm(
      `⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa khách hàng "${name}" không?\nLưu ý: Nếu khách hàng này đã từng đặt đơn hàng, việc xóa có thể gây lỗi lịch sử đơn hàng!`,
    );

    if (!confirmDelete) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userInfo.token || userInfo.data?.token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        alert("Đã xóa khách hàng thành công!");
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi khi xóa khách hàng!", error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Quản lý Khách Hàng
      </h2>

      <div className="flex mb-6 relative">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email..."
          className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none"
        />
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold rounded-tl-xl">Khách Hàng</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Số điện thoại</th>
              <th className="p-4 font-semibold">Vai trò</th>
              <th className="p-4 font-semibold text-center rounded-tr-xl">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-orange-500 font-bold"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 text-gray-600">
                    {u.phone || "Chưa cập nhật"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${u.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    {u.role !== "admin" ? (
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <Shield
                        size={20}
                        className="text-purple-500"
                        title="Quản trị viên"
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
