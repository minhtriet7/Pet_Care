import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import axiosClient from "../../utils/axiosClient";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // 1. Lấy dữ liệu giỏ hàng từ API
  const fetchCart = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo || !userInfo.token) {
      const localCart = JSON.parse(localStorage.getItem("petcare_cart")) || [];
      setCartItems(localCart);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.get("/cart");

      // LƯU Ý QUAN TRỌNG:
      // Backend của bạn trả về data nằm trong res.data.cartItems
      if (res.success && res.data) {
        console.log("Dữ liệu giỏ hàng từ DB:", res.data.cartItems);
        setCartItems(res.data.cartItems || []);
      }
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
      const localCart = JSON.parse(localStorage.getItem("petcare_cart")) || [];
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Cập nhật số lượng
  const handleQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    if (!userInfo) {
      const updated = cartItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQty } : item,
      );
      setCartItems(updated);
      localStorage.setItem("petcare_cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    try {
      // Gọi API addToCart (tăng/giảm số lượng)
      await axiosClient.post("/cart", { productId, quantity: change });
      fetchCart(); // Tải lại giỏ hàng
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật số lượng");
    }
  };

  // 3. Xóa sản phẩm
  const handleRemove = async (productId) => {
    if (!window.confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;

    if (!userInfo) {
      const updated = cartItems.filter((item) => item._id !== productId);
      setCartItems(updated);
      localStorage.setItem("petcare_cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    try {
      await axiosClient.delete(`/cart/${productId}`);
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      alert("Lỗi khi xóa sản phẩm",error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item || !item.product) return sum; // Bỏ qua nếu dữ liệu lỗi
    const price = item.product.price || item.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  if (loading)
    return (
      <div className="text-center py-32 text-pink-500 font-bold">
        Đang kiểm tra giỏ hàng...
      </div>
    );

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-3">
          <ShoppingBag className="text-pink-500" size={32} /> Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-pink-50">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
              className="w-32 h-32 mx-auto opacity-20 mb-6"
              alt="empty"
            />
            <h2 className="text-xl font-bold text-gray-400 mb-6">
              Giỏ hàng của bạn đang trống
            </h2>
            <Link
              to="/products"
              className="inline-block bg-pink-500 text-white font-bold py-3 px-10 rounded-full hover:bg-pink-600 shadow-lg shadow-pink-100 transition-all"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* DANH SÁCH SẢN PHẨM */}
            <div className="lg:w-2/3 space-y-4">
              <div className="bg-white rounded-3xl shadow-sm p-2 sm:p-6 border border-pink-50">
                {cartItems.map((item) => {
                  // item.product là object chứa thông tin sản phẩm từ DB
                  // Nếu là khách vãng lai (Local), item chính là sản phẩm luôn
                  const p = item.product || item;

                  const price = p.price || 0;
                  const quantity = item.quantity || 1;

                  // Backend trả về mảng images, ta lấy ảnh đầu tiên
                  const img =
                    p.images && p.images.length > 0
                      ? p.images[0]
                      : p.imageUrl || "https://via.placeholder.com/200";

                  return (
                    <div
                      key={p._id || item._id}
                      className="flex flex-col sm:flex-row items-center py-6 border-b border-gray-50 last:border-0 gap-6"
                    >
                      <img
                        src={img}
                        alt={p.name}
                        className="w-24 h-24 object-contain bg-gray-50 rounded-2xl p-2"
                      />
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-gray-900 mb-1 hover:text-pink-500 transition-colors">
                          <Link to={`/product/${p._id}`}>{p.name}</Link>
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          Đơn giá: {formatPrice(price)}
                        </p>
                        <span className="font-bold text-pink-500 text-lg">
                          {formatPrice(price * quantity)}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1">
                          {/* Truyền p._id vào hàm xử lý */}
                          <button
                            onClick={() => handleQuantity(p._id, quantity, -1)}
                            className="w-9 h-9 hover:bg-white rounded-lg flex justify-center items-center text-gray-500 transition-all"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="w-10 text-center font-bold text-gray-800">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantity(p._id, quantity, 1)}
                            className="w-9 h-9 hover:bg-white rounded-lg flex justify-center items-center text-gray-500 transition-all"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(p._id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TỔNG KẾT THANH TOÁN */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-3xl shadow-sm p-8 sticky top-28 border border-pink-50">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-50">
                  Chi tiết đơn hàng
                </h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-500 font-medium">Miễn phí</span>
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-3xl font-black text-pink-500">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-pink-600 transition-all shadow-xl shadow-pink-100 uppercase tracking-wide"
                >
                  Thanh toán ngay <ArrowRight size={20} />
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Đảm bảo thanh toán an toàn & bảo mật
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
