import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowRight } from "lucide-react";
import axiosClient from "../../utils/axiosClient";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --- KIỂM TRA RÀNG BUỘC (VALIDATION) ---
    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }
    if (formData.password.length < 6) {
      return setError("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    try {
      setLoading(true);
      // Gọi API đăng ký từ userController
      const res = await axiosClient.post("/users/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      if (res.success) {
        // Lưu thông tin vào localStorage
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        // Thông báo cho các component khác (như Navbar) cập nhật
        window.dispatchEvent(new Event("storage"));
        alert("Đăng ký thành công!");
        navigate("/");
      } else {
        setError(res.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Tạo tài khoản</h2>
          <p className="text-gray-500 mt-2">Gia nhập gia đình PetCare ngay hôm nay</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input name="name" type="text" placeholder="Họ và tên" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all" onChange={handleChange} />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input name="email" type="email" placeholder="Email" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all" onChange={handleChange} />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
            <input name="phone" type="text" placeholder="Số điện thoại" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all" onChange={handleChange} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input name="password" type="password" placeholder="Mật khẩu" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all" onChange={handleChange} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input name="confirmPassword" type="password" placeholder="Xác nhận mật khẩu" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all" onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2">
            {loading ? "Đang xử lý..." : "Đăng ký ngay"} <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-gray-600 mt-8">
          Đã có tài khoản? <Link to="/login" className="text-pink-500 font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}