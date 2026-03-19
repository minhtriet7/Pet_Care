import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  PawPrint,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  Heart
} from "lucide-react";
import { PRODUCT_CATEGORIES } from "../../utils/constants";
import axiosClient from "../../utils/axiosClient";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Cho mobile
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Kiểm tra trạng thái đăng nhập và giỏ hàng
  const updateStatus = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (userInfo && userInfo.token) {
      try {
        const res = await axiosClient.get("/cart");
        if (res.success && res.data) {
          const total = res.data.cartItems.reduce(
            (acc, item) => acc + item.quantity,
            0,
          );
          setCartCount(total);
          return;
        }
      } catch (error) {
        console.error("Không lấy được số lượng giỏ hàng từ DB");
      }
    }

    const cart = JSON.parse(localStorage.getItem("petcare_cart")) || [];
    setCartCount(
      cart.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0),
    );
  };

  useEffect(() => {
    updateStatus();

    window.addEventListener("storage", updateStatus);
    window.addEventListener("cartUpdated", updateStatus);

    return () => {
      window.removeEventListener("storage", updateStatus);
      window.removeEventListener("cartUpdated", updateStatus);
    };
  }, []);

  // 2. Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${searchQuery}`);
      setIsMenuOpen(false);
    }
  };

  // 3. Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
      localStorage.removeItem("userInfo");
      setUser(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* --- TOP BAR (Logo, Search, Icons) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <PawPrint className="h-8 w-8 text-pink-500 mr-2" />
            <span className="font-bold text-2xl text-gray-900 tracking-tight">
              Pet<span className="text-pink-500">care</span>
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl relative"
          >
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-400 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1.5 p-1.5 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-5">
            
            {/* User Account / Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition-all">
                  <div className="w-9 h-9 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs text-gray-500 leading-none mb-1">Xin chào,</p>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                      {user.name.split(" ").pop()} <ChevronDown size={14} />
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] mt-1">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                    <User size={18} /> Thông tin cá nhân
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-semibold">
                      <LayoutDashboard size={18} /> Quản trị hệ thống
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                    <Settings size={18} /> Quản lý tài khoản
                  </Link>
                  <hr className="my-1 border-gray-50" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-700">
                <div className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <span className="hidden sm:inline text-sm font-bold">Đăng nhập</span>
              </Link>
            )}

            {/* Icon Yêu Thích (DESKTOP) */}
            <Link to="/favorites" className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-700 group">
              <Heart size={24} className="group-hover:text-pink-500 transition-colors" />
            </Link>

            {/* Cart Icon (DESKTOP) */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-700 group">
              <ShoppingCart size={24} className="group-hover:text-pink-500 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110 animate-in zoom-in duration-300">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION MENU (Desktop) --- */}
      <nav className="hidden md:block bg-pink-500 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center space-x-1">
            <li>
              <Link
                to="/products"
                className={`px-5 py-3.5 inline-block text-sm font-bold hover:bg-pink-600 transition-colors ${location.pathname === "/products" && !location.search ? "bg-pink-600" : ""}`}
              >
                TẤT CẢ
              </Link>
            </li>
            {PRODUCT_CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className={`px-5 py-3.5 inline-block text-sm font-bold hover:bg-pink-600 transition-colors uppercase ${location.search.includes(cat.slug) ? "bg-pink-600" : ""}`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            {/* THÊM MENU BLOG Ở ĐÂY */}
            <li>
              <Link
                to="/blog"
                className={`px-5 py-3.5 inline-block text-sm font-bold hover:bg-pink-600 transition-colors uppercase ${location.pathname === "/blog" ? "bg-pink-600" : ""}`}
              >
                CẨM NANG BLOG
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* --- MOBILE SIDEBAR --- */}
      <div
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 md:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl transition-transform duration-300 p-6 flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-xl text-pink-500">DANH MỤC</span>
            <button onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-8 relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 border-none outline-none focus:ring-2 focus:ring-pink-200"
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
          </form>

          <ul className="space-y-4 flex-grow overflow-y-auto">
            <li>
              <Link to="/products" className="text-gray-700 font-bold block py-2 border-b border-gray-50 hover:text-pink-500">
                TẤT CẢ SẢN PHẨM
              </Link>
            </li>
            {PRODUCT_CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link to={`/products?category=${cat.slug}`} className="text-gray-700 font-bold block py-2 border-b border-gray-50 hover:text-pink-500 uppercase">
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/blog" className="text-pink-500 font-bold block py-2 border-b border-gray-50">
                CẨM NANG BLOG
              </Link>
            </li>
          </ul>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
            <Link to="/favorites" className="flex items-center gap-3 text-gray-700 font-bold hover:text-pink-500 transition-colors">
              <Heart size={22} /> Mục yêu thích
            </Link>
            <Link to="/cart" className="flex items-center gap-3 text-gray-700 font-bold hover:text-pink-500 transition-colors">
              <ShoppingCart size={22} /> Giỏ hàng ({cartCount})
            </Link>
            {!user && (
              <Link to="/login" className="flex items-center gap-3 text-pink-500 font-bold">
                <User size={22} /> Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}