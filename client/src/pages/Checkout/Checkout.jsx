import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, CreditCard, ShoppingBag, ChevronRight, Truck, ArrowLeft } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCart, setFetchingCart] = useState(true);
  
  // Thông tin giao hàng
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      alert("Vui lòng đăng nhập để thanh toán!");
      navigate('/login');
      return;
    }

    const fetchCheckoutData = async () => {
      try {
        setFetchingCart(true);
        // 1. Lấy giỏ hàng từ DB
        const res = await axiosClient.get('/cart');
        if (res.success && res.data.cartItems.length > 0) {
          setCartItems(res.data.cartItems);
        } else if (res.success && res.data.cartItems.length === 0) {
            // Nếu vào trang checkout mà giỏ hàng trống, quay lại trang products
            navigate('/products');
        }

        // 2. Lấy thông tin mặc định từ Profile để user không phải gõ lại
        const profileRes = await axiosClient.get('/users/profile');
        if (profileRes.success) {
          setAddress(profileRes.data.address || '');
          setPhone(profileRes.data.phone || '');
          // Nếu city chưa có trong profile, có thể để trống hoặc mặc định
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu thanh toán:", error);
      } finally {
        setFetchingCart(false);
      }
    };

    fetchCheckoutData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Tính toán giá tiền dựa trên item.product (vì đã được populate từ Backend)
  const itemsPrice = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);
  
  const shippingPrice = itemsPrice > 500000 ? 0 : 30000; 
  const totalPrice = itemsPrice + shippingPrice;

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!address || !phone || !city) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu cho Order Schema
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.images?.[0] // Thêm ảnh để hiển thị trong lịch sử đơn
        })),
        shippingAddress: { address, city, phone },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice
      };

      const res = await axiosClient.post('/orders', orderData);

      if (res.success) {
        // Backend đã xóa Cart trong DB, ta chỉ cần xóa Local và thông báo Navbar
        localStorage.removeItem('petcare_cart');
        window.dispatchEvent(new Event('cartUpdated'));
        
        alert("Đặt hàng thành công! Cảm ơn bạn đã tin tưởng PetCare.");
        navigate('/profile'); // Chuyển về trang cá nhân để xem đơn hàng
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi xử lý đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCart) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9F5]">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
        <p className="text-pink-500 font-bold">Đang chuẩn bị đơn hàng...</p>
    </div>
  );

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
            <Link to="/cart" className="text-gray-500 hover:text-pink-500 flex items-center gap-2 mb-4 transition-colors">
                <ArrowLeft size={18} /> Quay lại giỏ hàng
            </Link>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <Truck className="text-pink-500" size={32} /> THANH TOÁN
            </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
          <div className="lg:w-2/3 space-y-6">
            
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-pink-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin size={22} className="text-pink-500" /> Thông tin nhận hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 mb-2">Địa chỉ nhận hàng (Số nhà, tên đường...)</label>
                  <input 
                    type="text" 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Thành phố / Tỉnh</label>
                  <input 
                    type="text" 
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="VD: Hà Nội"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Số điện thoại</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-pink-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard size={22} className="text-pink-500" /> Phương thức thanh toán
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'COD', label: 'Thanh toán khi nhận hàng (COD)', sub: 'Phí thu hộ 0đ' },
                  { id: 'VNPay', label: 'Ví VNPay / Thẻ ATM', sub: 'Giảm thêm 5k cho đơn trên 200k' },
                  { id: 'Momo', label: 'Ví điện tử MoMo', sub: 'Thanh toán một chạm' }
                ].map(method => (
                  <label 
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id ? 'border-pink-400 bg-pink-50' : 'border-gray-50 hover:border-pink-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        className="w-5 h-5 accent-pink-500"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                      />
                      <div>
                        <p className="font-bold text-gray-800 text-sm sm:text-base">{method.label}</p>
                        <p className="text-xs text-gray-400">{method.sub}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 sticky top-28 border border-pink-50">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-50 flex items-center gap-2">
                <ShoppingBag size={20} className="text-pink-500"/> Đơn hàng
              </h2>
              
              <div className="max-h-64 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {cartItems.map((item, idx) => {
                  const p = item.product;
                  return (
                    <div key={idx} className="flex justify-between items-center mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl p-1 shrink-0 border border-gray-100">
                          <img src={p.images?.[0] || "https://via.placeholder.com/100"} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{formatPrice(p.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50 mb-6">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Tạm tính</span>
                  <span>{formatPrice(itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Phí giao hàng</span>
                  <span className={shippingPrice === 0 ? "text-green-500 font-bold" : ""}>
                    {shippingPrice === 0 ? "Miễn phí" : formatPrice(shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-dashed border-gray-200">
                  <span className="font-bold text-gray-900 uppercase">Tổng cộng</span>
                  <span className="text-2xl font-black text-pink-500">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-pink-600 transition-all shadow-xl shadow-pink-100 uppercase tracking-widest disabled:bg-gray-300 disabled:shadow-none"
              >
                {loading ? "Đang đặt hàng..." : "Đặt hàng ngay"} <ChevronRight size={20} />
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
                Bằng cách đặt hàng, bạn đồng ý với các Điều khoản & Chính sách của PetCare Shop.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}