// src/components/layout/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // ĐÃ THÊM IMPORT VÀO ĐÂY
import { MapPin, Phone, Mail, Facebook, Instagram, Music } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate(); // ĐÃ ĐƯA VÀO BÊN TRONG HÀM

  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      {/* Khối Đăng ký nhận tin */}
      <div className="bg-[#f8f9fa] py-12">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thành viên Petcare
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Đăng ký thành viên ngay hôm nay để nhận email về sản phẩm mới và
            chương trình khuyến mãi của chúng tôi.
          </p>
          <form className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-4 py-3 rounded-l-xl border border-gray-300 focus:outline-none focus:border-pink-500"
            />
            <button
              type="button" // THÊM DÒNG NÀY ĐỂ KHÔNG BỊ TẢI LẠI TRANG
              onClick={() => navigate("/register")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-r-lg transition-colors"
            >
              Đăng Ký
            </button>
          </form>
        </div>
      </div>

      {/* Khối Links 4 cột */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-pink-500">
                  Dành Cho Chó
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Dành Cho Mèo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Thương Hiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Blogs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Bộ Sưu Tập
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Về Petcare</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-pink-500">
                  Giới Thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Thành Viên Hội
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Điều Khoản Sử Dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Tuyển Dụng
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">
              Hỗ Trợ Khách Hàng
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-pink-500">
                  Chính Sách Đổi Trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Phương Thức Vận Chuyển
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Phương Thức Thanh Toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500">
                  Chính Sách Hoàn Tiền
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Liên Hệ</h3>
            <div className="text-sm text-gray-600 space-y-3">
              <p className="font-bold text-gray-900 uppercase">
                CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ PETCARE
              </p>
              <p>
                Giấy Chứng Nhận Kinh Doanh Số: 0123456789 do Sở KH&ĐT CT Cấp
                ngày 01/01/2026
              </p>
              <p className="flex items-start">
                <MapPin size={18} className="mr-2 shrink-0 mt-0.5" /> Địa chỉ:
                Ninh Kiều Cần Thơ
              </p>
              <p className="flex items-center">
                <Phone size={18} className="mr-2 shrink-0" /> Hotline: 1900 8888
              </p>
              <p className="flex items-center">
                <Mail size={18} className="mr-2 shrink-0" /> Email:
                contact@petcare.vn
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="bg-[#0b1426] text-white p-2 rounded-full hover:bg-pink-500 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="bg-[#0b1426] text-white p-2 rounded-full hover:bg-pink-500 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="bg-[#0b1426] text-white p-2 rounded-full hover:bg-pink-500 transition-colors"
              >
                <Music size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>@2026 Petcare VN. All Rights Reserved.</p>
          <img
            src="https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773919339/web-bo-cong-thuong-16268377266071391177101-0-141-138-362-crop-16268377518651546625939_d6col7.png"
            alt="Bộ Công Thương"
            className="h-10 mt-4 md:mt-0"
          />
        </div>
      </div>
    </footer>
  );
}