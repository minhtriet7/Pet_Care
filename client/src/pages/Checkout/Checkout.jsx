import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CheckCircle } from "lucide-react";
import axiosClient from "../../utils/axiosClient";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("VNPAY");

  useEffect(() => {
    const fetchCartData = async () => {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("userInfo"));
      if (!user || !user.token) {
        alert("Vui lòng đăng nhập tài khoản để tiến hành thanh toán nhé!");
        navigate("/login"); // Đẩy khách về trang đăng nhập
        return;
      }
      setUserInfo(user);

      let currentCart = [];

      if (user && user.token) {
        try {
          const res = await axiosClient.get("/cart");
          const responseData = res.data || res;

          let dbCart = [];
          if (Array.isArray(responseData)) dbCart = responseData;
          else if (responseData.items && Array.isArray(responseData.items))
            dbCart = responseData.items;
          else if (
            responseData.cartItems &&
            Array.isArray(responseData.cartItems)
          )
            dbCart = responseData.cartItems;

          // BÍ QUYẾT Ở ĐÂY: Nếu giỏ trên mạng trống, lấy giỏ dưới máy tính bù vào!
          const localCart =
            JSON.parse(localStorage.getItem("petcare_cart")) || [];
          if (dbCart.length === 0 && localCart.length > 0) {
            currentCart = localCart;
          } else {
            currentCart = dbCart;
          }
        } catch (error) {
          console.error("Lỗi lấy giỏ hàng từ server:", error);
        }
      } else {
        currentCart = JSON.parse(localStorage.getItem("petcare_cart")) || [];
      }

      // Đảm bảo state luôn luôn là Mảng (Array)
      setCartItems(Array.isArray(currentCart) ? currentCart : []);
      setLoading(false);

      if (!currentCart || currentCart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        navigate("/cart");
      }
    };

    fetchCartData();
  }, [navigate]);

  // Sử dụng (Array.isArray) thêm một lần nữa để chắc chắn 100% không bao giờ lỗi
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const validCartItems = safeCartItems.filter(
    (item) => item && (item._id || item.product),
  );

  const subtotal = validCartItems.reduce((acc, item) => {
    const itemPrice =
      item.price ||
      item.basePrice ||
      item.product?.price ||
      item.product?.basePrice ||
      0;
    return acc + itemPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const totalVND = subtotal + shippingFee;

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const handlePlaceOrder = async () => {
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      alert("Vui lòng điền đầy đủ thông tin nhận hàng!");
      return;
    }

    const orderData = {
      orderItems: validCartItems.map((item) => ({
        name: item.name || item.product?.name,
        quantity: item.quantity,
        image:
          item.images?.[0] ||
          item.product?.images?.[0] ||
          item.imageUrl ||
          "https://via.placeholder.com/100",
        price:
          item.price ||
          item.basePrice ||
          item.product?.price ||
          item.product?.basePrice,
        product: item._id || item.product?._id,
      })),
      shippingAddress: shippingInfo,
      paymentMethod: paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: shippingFee,
      totalPrice: totalVND,
    };

    if (paymentMethod === "PAYPAL") {
      alert(
        "Tính năng thanh toán PayPal đang được bảo trì. Vui lòng chọn VNPay hoặc COD nhé!",
      );
      return;
    } else if (paymentMethod === "VNPAY") {
      try {
        const payload = {
          amount: totalVND,
          bankCode: "",
          orderDescription: "Thanh toan don hang Petcare",
        };

        const res = await axiosClient.post(
          "/payment/create_payment_url",
          payload,
        );

        const vnpayUrl = res.url || res.data?.url;

        if (vnpayUrl) {
          localStorage.setItem("pending_order", JSON.stringify(orderData));
          window.location.href = vnpayUrl;
          
        } else {
          alert("Lỗi: Backend chưa trả về đường dẫn VNPay!");
        }
      } catch (error) {
        console.error("Lỗi gọi API VNPay:", error);
        alert(
          "Không thể kết nối đến cổng thanh toán VNPay. Hãy kiểm tra lại Backend!",
        );
      }

      // ĐÃ FIX LỖI DƯ DẤU NGOẶC Ở DÒNG DƯỚI NÀY
    }  else if (paymentMethod === "COD") {
      try {
        // 1. GỌI API LƯU ĐƠN HÀNG VÀO DATABASE
        await axiosClient.post("/orders", {
          ...orderData,
          isPaid: false, // COD thì chưa thanh toán
        });

        alert("🎉 Đã đặt hàng thành công bằng hình thức COD!");

        // 2. KHÔNG CẦN GỌI API XÓA GIỎ HÀNG NỮA
        // Vì Backend đã tự động dọn sạch giỏ hàng trong DB rồi.
        
        // 3. Chỉ cần dọn rác dưới trình duyệt và cập nhật số lượng
        localStorage.removeItem("petcare_cart");
        window.dispatchEvent(new Event("cartUpdated"));

        // 4. Đẩy khách sang thẳng trang Đơn hàng của tôi
        navigate("/my-orders");
      } catch (error) {
        console.error("Lỗi khi lưu đơn hàng COD:", error);
        alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="inline-flex items-center text-gray-500 hover:text-pink-500 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Quay lại giỏ hàng
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase flex items-center gap-3">
          <span className="bg-pink-500 text-white p-2 rounded-xl">
            <CheckCircle size={28} />
          </span>{" "}
          THANH TOÁN
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="text-pink-500" /> Thông tin nhận hàng
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        address: e.target.value,
                      })
                    }
                    className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-200"
                    placeholder="Số nhà, đường..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          city: e.target.value,
                        })
                      }
                      className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-200"
                      placeholder="Cần Thơ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-200"
                      placeholder="09xxxx..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-pink-500 font-black text-2xl">💳</span>{" "}
                Phương thức thanh toán
              </h2>
              <div className="space-y-4">
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === "VNPAY" ? "border-pink-500 bg-pink-50" : "border-gray-100 hover:border-pink-200"}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      value="VNPAY"
                      checked={paymentMethod === "VNPAY"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-pink-600 focus:ring-pink-500"
                    />
                    <div>
                      <p className="font-bold text-gray-900">
                        Ví VNPay / Thẻ ATM
                      </p>
                      <p className="text-sm text-gray-500">
                        Quét mã QR cực nhanh
                      </p>
                    </div>
                  </div>
                  <img
                    src="https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773988418/vnpay_hlc9gh.png"
                    alt="VNPay"
                    className="w-16 h-auto object-contain"
                  />
                </label>

                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === "COD" ? "border-pink-500 bg-pink-50" : "border-gray-100 hover:border-pink-200"}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-pink-600 focus:ring-pink-500"
                    />
                    <div>
                      <p className="font-bold text-gray-900">
                        Thanh toán khi nhận hàng (COD)
                      </p>
                      <p className="text-sm text-gray-500">Phí thu hộ 0đ</p>
                    </div>
                  </div>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2800/2800015.png"
                    alt="COD"
                    className="w-10 h-10 object-contain opacity-70"
                  />
                </label>
                {/* TÙY CHỌN PAYPAL */}
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === "PAYPAL" ? "border-pink-500 bg-pink-50" : "border-gray-100 hover:border-pink-200"}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      value="PAYPAL"
                      checked={paymentMethod === "PAYPAL"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-pink-600 focus:ring-pink-500"
                    />
                    <div>
                      <p className="font-bold text-gray-900">
                        Ví PayPal Quốc Tế
                      </p>
                      <p className="text-sm text-gray-500">
                        Môi trường thử nghiệm
                      </p>
                    </div>
                  </div>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png"
                    alt="PayPal"
                    className="w-16 h-auto object-contain"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {validCartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl p-1 border border-gray-100 shrink-0 flex items-center justify-center">
                      <img
                        src={
                          item.images?.[0] ||
                          item.product?.images?.[0] ||
                          item.imageUrl ||
                          "https://via.placeholder.com/100"
                        }
                        alt=""
                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                        {item.name || item.product?.name}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          SL: {item.quantity}
                        </p>
                        <p className="font-bold text-sm text-gray-900">
                          {formatPrice(
                            (item.price ||
                              item.basePrice ||
                              item.product?.price ||
                              item.product?.basePrice) * item.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-green-600">
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">
                  TỔNG CỘNG
                </span>
                <span className="text-2xl font-black text-pink-500 block">
                  {formatPrice(totalVND)}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl hover:bg-pink-600 shadow-md shadow-pink-200 uppercase text-lg transition-colors"
              >
                {paymentMethod === "VNPAY"
                  ? "MỞ CỔNG VNPAY >"
                  : paymentMethod === "PAYPAL"
                    ? "THANH TOÁN PAYPAL >"
                    : "ĐẶT HÀNG NGAY >"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
