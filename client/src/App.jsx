import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import Layout (Giao diện chuẩn)
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Chatbot from "./components/common/Chatbot";
import ScrollToTop from "./components/common/ScrollToTop";
import AdminLayout from "./pages/Admin/AdminLayout";

// Import Pages Khách Hàng
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import ProductDetail from "./pages/Products/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Profile/Profile";
import Favorites from './pages/Favorites/Favorites';
import Blog from './pages/Blog/Blog';
// Import Pages Admin
import Dashboard from "./pages/Admin/Dashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminBlogs from "./pages/Admin/AdminBlogs";
import AdminServices from "./pages/Admin/AdminServices";

// --- THÊM 2 IMPORT MỚI VÀO ĐÂY ---
import AdminAppointments from "./pages/Admin/AdminAppointments";
import AdminCategories from "./pages/Admin/AdminCategories";
import MyOrders from "./pages/myorder/MyOrders";

export default function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Component này sẽ tự động cuộn lên đầu khi chuyển trang */}
      <Routes>
        {/* ========================================================
            NHÁNH 1: GIAO DIỆN KHÁCH HÀNG (CÓ NAVBAR, FOOTER, CHATBOT)
        ======================================================== */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-[#FFF9F5]">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/blog" element={<Blog />} />
                </Routes>
              </main>
              <Chatbot /> {/* Bổ sung Chatbot vào góc màn hình */}
              <Footer />
            </div>
          }
        />

        {/* ========================================================
            NHÁNH 2: GIAO DIỆN ADMIN (CHỈ CÓ SIDEBAR KHUNG QUẢN TRỊ)
        ======================================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="services" element={<AdminServices />} />
          
          {/* --- THÊM 2 ROUTE NÀY ĐỂ FIX LỖI HIỂN THỊ --- */}
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="categories" element={<AdminCategories />} />

        </Route>
      </Routes>
    </Router>
  );
}