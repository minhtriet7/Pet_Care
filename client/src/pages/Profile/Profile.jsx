import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  Heart,
  Calendar,
  Plus,
  Trash2,
  Camera,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../utils/axiosClient";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const [showAddPet, setShowAddPet] = useState(false);
  const navigate = useNavigate();

  // State cho Form Thêm Thú Cưng
  const [newPet, setNewPet] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    weight: "",
    gender: "male",
    medicalHistory: "",
  });
  // Hàm xử lý link ảnh thông minh
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`; // Đổi port 5000 thành port Backend của bạn
  };
  // 1. TẢI DỮ LIỆU TỔNG HỢP TỪ BACKEND
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [profileRes, ordersRes, petsRes, apptRes] =
        await Promise.allSettled([
          axiosClient.get("/users/profile"),
          axiosClient.get("/orders/my-orders"),
          axiosClient.get("/pets/my-pets"),
          axiosClient.get("/appointments/my-appointments"),
        ]);

        if (profileRes.status === "fulfilled") {
          const profileData = profileRes.value.data || profileRes.value;
          setUser(profileData);
          setAvatarUrl(profileData.avatar || "");
        }

        if (ordersRes.status === "fulfilled") {
          const orderData = ordersRes.value.data || ordersRes.value;
          setOrders(Array.isArray(orderData) ? orderData : orderData.data || []);
        }

        if (petsRes.status === "fulfilled") {
          const petData = petsRes.value.data || petsRes.value;
          setPets(Array.isArray(petData) ? petData : petData.data || []);
        }

        if (apptRes.status === "fulfilled") {
          const apptData = apptRes.value.data || apptRes.value;
          setAppointments(Array.isArray(apptData) ? apptData : apptData.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // 2. XỬ LÝ UPLOAD ẢNH ĐẠI DIỆN
  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingAvatar(true);
      const res = await axiosClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // FIX LỖI Ở ĐÂY: Hứng link ảnh thông minh hơn
      const uploadedUrl = res.imageUrl || res.data?.imageUrl || res.url;
      console.log("Link ảnh từ Backend trả về là:", uploadedUrl); // In ra để xem có bị rỗng không
      
      if (uploadedUrl) {
          setAvatarUrl(uploadedUrl);
      } else {
          alert("Backend không trả về link ảnh (imageUrl)!");
      }
    } catch (error) {
      alert("Lỗi tải ảnh lên. Vui lòng thử lại!",error);
    } finally {
      setUploadingAvatar(false);
    }

  };

  // 3. CẬP NHẬT THÔNG TIN TÀI KHOẢN
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedData = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      avatar: avatarUrl,
    };

    try {
      setUpdateLoading(true);
      const res = await axiosClient.put("/users/profile", updatedData);
      
      if (res.success || res.data) {
        const newData = res.data || res; // Đề phòng axios bọc 2 lớp data
        setUser(newData);
        
        // BÍ QUYẾT Ở ĐÂY: Lấy cái giỏ userInfo cũ ra để giữ lại cái token
        const oldUserInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
        const keepToken = oldUserInfo.token;

        // Lưu đè thông tin mới nhưng "nhét" lại cái token cũ vào
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...newData, token: keepToken })
        );
        
        window.dispatchEvent(new Event("storage"));
        alert("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setUpdateLoading(false);
    }
  };

  // 4. QUẢN LÝ THÚ CƯNG
  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/pets", newPet);
      if (res.success) {
        alert("Thêm hồ sơ thú cưng thành công!");
        setPets([...pets, res.data]);
        setShowAddPet(false);
        setNewPet({
          name: "",
          species: "dog",
          breed: "",
          age: "",
          weight: "",
          gender: "male",
          medicalHistory: "",
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi thêm thú cưng");
    }
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm("Xóa hồ sơ thú cưng này?")) return;
    try {
      const res = await axiosClient.delete(`/pets/${petId}`);
      if (res.success) setPets(pets.filter((p) => p._id !== petId));
    } catch (error) {
      alert("Lỗi khi xóa thú cưng",error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có muốn đăng xuất?")) {
      localStorage.removeItem("userInfo");
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  if (loading)
    return (
      <div className="text-center py-32 text-pink-500 font-bold animate-pulse">
        Đang tải thông tin tài khoản...
      </div>
    );

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-50 mb-6 flex flex-col items-center">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex justify-center items-center text-pink-500 mb-4 overflow-hidden border-2 border-pink-200">
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm mb-4 truncate w-full text-center">
                {user?.email}
              </p>
              <span className="bg-pink-100 text-pink-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {user?.role === "admin" ? "Quản trị viên" : "Thành viên"}
              </span>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-pink-50">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === "orders" ? "bg-pink-50 text-pink-500 border-l-4 border-pink-500" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <div className="flex items-center">
                  <Package size={20} className="mr-3" /> Lịch sử đơn hàng
                </div>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setActiveTab("pets")}
                className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === "pets" ? "bg-pink-50 text-pink-500 border-l-4 border-pink-500" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <div className="flex items-center">
                  <Heart size={20} className="mr-3" /> Thú cưng của tôi
                </div>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === "appointments" ? "bg-pink-50 text-pink-500 border-l-4 border-pink-500" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <div className="flex items-center">
                  <Calendar size={20} className="mr-3" /> Lịch hẹn dịch vụ
                </div>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === "settings" ? "bg-pink-50 text-pink-500 border-l-4 border-pink-500" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <div className="flex items-center">
                  <Settings size={20} className="mr-3" /> Cài đặt tài khoản
                </div>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-4 text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50"
              >
                <LogOut size={20} className="mr-3" /> Đăng xuất
              </button>
            </div>
          </div>

          {/* NỘI DUNG CHÍNH */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pink-50 min-h-[500px]">
              {/* TAB: ĐƠN HÀNG */}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Lịch sử mua sắm
                  </h2>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        // Hàm dịch trạng thái sang tiếng Việt cho dễ hiểu
                        const statusText = {
                          pending: "Chờ xác nhận",
                          processing: "Đang chuẩn bị",
                          shipped: "Đang giao hàng",
                          delivered: "Giao thành công",
                          cancelled: "Đã hủy",
                        };
                        const currentStatus =
                          statusText[order.orderStatus] || order.orderStatus;

                        return (
                          <div
                            key={order._id}
                            className="border border-gray-100 rounded-2xl p-5 hover:border-pink-300 transition-colors"
                          >
                            <div className="flex flex-wrap justify-between items-center mb-4 pb-4 border-b border-gray-100 gap-2">
                              <div>
                                <p className="font-bold text-gray-900">
                                  Mã đơn: #{order._id.slice(-8).toUpperCase()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Ngày đặt:{" "}
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                </p>
                              </div>
                              {/* Đổi màu dựa trên trạng thái thật */}
                              <span
                                className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                                  order.orderStatus === "delivered"
                                    ? "bg-green-100 text-green-600"
                                    : order.orderStatus === "cancelled"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {currentStatus}
                              </span>
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="text-sm text-gray-600">
                                {order.orderItems.map((item, i) => (
                                  <p key={i}>
                                    {item.name} x {item.quantity}
                                  </p>
                                ))}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">
                                  Thành tiền
                                </p>
                                <p className="text-xl font-bold text-pink-500">
                                  {formatPrice(order.totalPrice)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl">
                      Bạn chưa có đơn hàng nào.
                    </div>
                  )}
                </div>
              )}

              

              {/* TAB: THÚ CƯNG */}
              {activeTab === "pets" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Heart className="text-pink-500" /> Thú cưng của tôi
                    </h2>
                    <button
                      onClick={() => setShowAddPet(!showAddPet)}
                      className="bg-pink-100 text-pink-600 hover:bg-pink-500 hover:text-white transition-colors px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm"
                    >
                      {showAddPet ? (
                        "Hủy"
                      ) : (
                        <>
                          <Plus size={18} /> Thêm thú cưng
                        </>
                      )}
                    </button>
                  </div>

                  {showAddPet && (
                    <form
                      onSubmit={handleAddPet}
                      className="bg-pink-50 p-6 rounded-2xl mb-8 border border-pink-100"
                    >
                      <h3 className="font-bold text-gray-800 mb-4">
                        Hồ sơ thú cưng mới
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            Tên thú cưng *
                          </label>
                          <input
                            type="text"
                            required
                            value={newPet.name}
                            onChange={(e) =>
                              setNewPet({ ...newPet, name: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            Loài
                          </label>
                          <select
                            value={newPet.species}
                            onChange={(e) =>
                              setNewPet({ ...newPet, species: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-400"
                          >
                            <option value="dog">Chó</option>
                            <option value="cat">Mèo</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            Giống loài (Corgi, Poodle...)
                          </label>
                          <input
                            type="text"
                            value={newPet.breed}
                            onChange={(e) =>
                              setNewPet({ ...newPet, breed: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            Tuổi (tháng)
                          </label>
                          <input
                            type="number"
                            value={newPet.age}
                            onChange={(e) =>
                              setNewPet({ ...newPet, age: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            Cân nặng (kg)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={newPet.weight}
                            onChange={(e) =>
                              setNewPet({ ...newPet, weight: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            Giới tính
                          </label>
                          <select
                            value={newPet.gender}
                            onChange={(e) =>
                              setNewPet({ ...newPet, gender: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-400"
                          >
                            <option value="male">Đực</option>
                            <option value="female">Cái</option>
                          </select>
                        </div>
                      </div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        Tình trạng sức khỏe / Ghi chú
                      </label>
                      <textarea
                        value={newPet.medicalHistory}
                        onChange={(e) =>
                          setNewPet({
                            ...newPet,
                            medicalHistory: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-400 mb-4"
                        rows="2"
                      ></textarea>

                      <button
                        type="submit"
                        className="bg-pink-500 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-pink-600 transition-colors"
                      >
                        Lưu hồ sơ
                      </button>
                    </form>
                  )}

                  {pets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pets.map((pet) => (
                        <div
                          key={pet._id}
                          className="border border-gray-100 bg-gray-50 rounded-2xl p-5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-full border border-gray-200 flex items-center justify-center font-bold text-2xl">
                              {pet.species === "dog"
                                ? "🐶"
                                : pet.species === "cat"
                                  ? "🐱"
                                  : "🐾"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">
                                {pet.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {pet.breed || "Chưa xác định"} •{" "}
                                {pet.weight ? `${pet.weight}kg` : "?"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePet(pet._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      Bạn chưa có hồ sơ thú cưng nào.
                    </div>
                  )}
                </div>
              )}

              {/* TAB: LỊCH HẸN SPA */}
              {activeTab === "appointments" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Lịch hẹn dịch vụ
                  </h2>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appt) => (
                        <div
                          key={appt._id}
                          className="border border-gray-100 rounded-2xl p-5 hover:border-pink-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                            <div>
                              <p className="font-bold text-gray-900 text-lg mb-1">
                                {appt.service?.name || "Dịch vụ"}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock size={14} />{" "}
                                {new Date(appt.date).toLocaleDateString(
                                  "vi-VN",
                                )}{" "}
                                | {appt.timeSlot}
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-600 uppercase">
                              {appt.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-bold">Bé thú cưng:</span>{" "}
                                {appt.pet?.name || "N/A"}
                              </p>
                              {appt.notes && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Ghi chú: {appt.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-pink-500">
                                {formatPrice(appt.totalPrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      Chưa có lịch hẹn nào.
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CÀI ĐẶT TÀI KHOẢN */}
              {activeTab === "settings" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Cài đặt tài khoản
                  </h2>
                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-6 max-w-lg"
                  >
                    {/* Phần Upload Ảnh */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                        {avatarUrl ? (
                          <img
                            src={getImageUrl(avatarUrl)}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={30} className="text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={20} className="text-white" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAvatar}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                      <div className="text-sm text-gray-500">
                        {uploadingAvatar ? (
                          <span className="text-pink-500 font-bold animate-pulse">
                            Đang tải ảnh lên...
                          </span>
                        ) : (
                          "Nhấn vào ảnh để thay đổi Avatar"
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Email (Không thể thay đổi)
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={user?.email}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          name="name"
                          type="text"
                          defaultValue={user?.name}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          defaultValue={user?.phone}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Địa chỉ giao hàng
                        </label>
                        <input
                          name="address"
                          type="text"
                          defaultValue={user?.address}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={updateLoading || uploadingAvatar}
                      className="bg-pink-500 text-white font-bold py-3 px-10 rounded-xl hover:bg-pink-600 transition-colors shadow-lg shadow-pink-100 disabled:bg-gray-300 disabled:shadow-none"
                    >
                      {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
