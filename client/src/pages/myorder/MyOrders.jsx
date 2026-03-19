import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null); // Quản lý đóng/mở chi tiết đơn hàng

  // 1. Gọi API lấy danh sách đơn hàng của tôi
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/orders/my-orders');
      if (res.success) {
        // Sắp xếp đơn hàng mới nhất lên đầu
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Định dạng hiển thị
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Chờ xác nhận', color: 'text-yellow-600 bg-yellow-50', icon: <Clock size={16} /> };
      case 'processing': return { label: 'Đang xử lý', color: 'text-blue-600 bg-blue-50', icon: <Package size={16} /> };
      case 'shipped': return { label: 'Đang giao hàng', color: 'text-purple-600 bg-purple-50', icon: <Truck size={16} /> };
      case 'delivered': return { label: 'Đã giao thành công', color: 'text-green-600 bg-green-50', icon: <CheckCircle size={16} /> };
      case 'cancelled': return { label: 'Đã hủy', color: 'text-red-600 bg-red-50', icon: <XCircle size={16} /> };
      default: return { label: status, color: 'text-gray-600 bg-gray-50', icon: <Clock size={16} /> };
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F5]">
      <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <ShoppingBag className="text-pink-500" size={32} /> ĐƠN HÀNG CỦA TÔI
          </h1>
          <Link to="/products" className="text-pink-500 font-bold hover:underline flex items-center gap-2">
            Tiếp tục mua sắm <ExternalLink size={16} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-pink-50">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={48} className="text-pink-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Bạn chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-8">Hãy khám phá các sản phẩm tuyệt vời cho thú cưng của bạn!</p>
            <Link to="/products" className="bg-pink-500 text-white font-bold py-3 px-10 rounded-full hover:bg-pink-600 transition-all shadow-lg shadow-pink-100">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatusInfo(order.orderStatus);
              const isExpanded = expandedOrder === order._id;

              return (
                <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden transition-all">
                  
                  {/* PHẦN ĐẦU ĐƠN HÀNG (CARD SUMMARY) */}
                  <div 
                    onClick={() => toggleOrder(order._id)}
                    className="p-6 cursor-pointer hover:bg-pink-50/30 transition-colors flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${status.color}`}>
                        {status.icon}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-wrap items-center justify-between md:justify-end gap-4 md:gap-10">
                      <div className="hidden sm:block text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tổng tiền</p>
                        <p className="font-black text-pink-500">{formatPrice(order.totalPrice)}</p>
                      </div>
                      
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${status.color}`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                        {status.label.toUpperCase()}
                      </div>

                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* PHẦN CHI TIẾT (KHI BẤM MỞ) */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                      <div className="border-t border-dashed border-pink-100 pt-6">
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Danh sách sản phẩm */}
                          <div>
                            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                                <Package size={16} className="text-pink-500" /> SẢN PHẨM ĐÃ MUA
                            </h3>
                            <div className="space-y-3">
                              {order.orderItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-lg p-1 border border-gray-100 flex items-center justify-center">
                                      <img src={item.image || "https://via.placeholder.com/100"} alt="" className="max-h-full object-contain" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                      <p className="text-xs text-gray-400">{formatPrice(item.price)} x {item.quantity}</p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Thông tin vận chuyển & thanh toán */}
                          <div className="space-y-6">
                            <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100">
                              <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                                <Truck size={16} className="text-pink-500" /> THÔNG TIN GIAO HÀNG
                              </h3>
                              <p className="text-sm text-gray-700 mb-1"><span className="font-bold">Địa chỉ:</span> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                              <p className="text-sm text-gray-700"><span className="font-bold">Điện thoại:</span> {order.shippingAddress.phone}</p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                              <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard size={16} className="text-pink-500" /> TỔNG KẾT ĐƠN HÀNG
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                  <span>Tạm tính ({order.orderItems.length} sản phẩm)</span>
                                  <span>{formatPrice(order.itemsPrice)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                  <span>Phí vận chuyển</span>
                                  <span>{formatPrice(order.shippingPrice)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                  <span>Phương thức thanh toán</span>
                                  <span className="font-bold">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-end pt-3 border-t border-gray-200 mt-2">
                                  <span className="font-bold text-gray-900 uppercase">Thành tiền</span>
                                  <span className="text-xl font-black text-pink-500">{formatPrice(order.totalPrice)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}