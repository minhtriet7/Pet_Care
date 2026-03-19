import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import axiosClient from "../../utils/axiosClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      // Gọi API đăng nhập
      const res = await axiosClient.post("/users/login", { email, password });

      if (res.success) {
        // Lưu toàn bộ thông tin trả về (bao gồm token)
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        window.dispatchEvent(new Event("storage")); // Kích hoạt sự kiện để Navbar cập nhật
        navigate("/");
      } else {
        setError(res.message || "Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Chào mừng trở lại</h2>
          <p className="text-gray-500 mt-2">Đăng nhập để tiếp tục chăm sóc thú cưng</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="email" placeholder="Email của bạn" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="password" placeholder="Mật khẩu" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="text-right text-sm text-pink-500 font-medium hover:underline cursor-pointer">
            Quên mật khẩu?
          </div>

          <button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2">
            {loading ? "Đang xác thực..." : "Đăng nhập"} <LogIn size={20} />
          </button>
        </form>

        <p className="text-center text-gray-600 mt-10">
          Chưa có tài khoản? <Link to="/register" className="text-pink-500 font-bold hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}