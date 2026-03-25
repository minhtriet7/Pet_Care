import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import axiosClient from "../../utils/axiosClient"; // Phải import cái này để gọi API

export default function VnpayReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const processOrder = async () => {
      const responseCode = searchParams.get("vnp_ResponseCode");

      if (responseCode === "00") {
        setStatus("success");

        // Lấy đơn hàng lúc nãy cất tạm trong máy
        const pendingOrder = JSON.parse(localStorage.getItem("pending_order"));

        if (pendingOrder) {
          try {
            // 1. XÓA RÁC NGAY LẬP TỨC ĐỂ CHẶN REACT CHẠY 2 LẦN
            localStorage.removeItem("pending_order");
            localStorage.removeItem("petcare_cart");

            // 2. SAU ĐÓ MỚI GỌI API LƯU ĐƠN HÀNG VÀO DATABASE
            await axiosClient.post("/orders", {
              ...pendingOrder,
              isPaid: true,
              paidAt: new Date(),
            });

            // 3. Cập nhật lại số lượng giỏ hàng trên Header
            window.dispatchEvent(new Event("cartUpdated"));
          } catch (error) {
            console.error("Lỗi khi lưu đơn hàng vào DB:", error);
          }
        }
      } else {
        setStatus("failed");
      }
    };

    processOrder();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Đang lưu đơn hàng...
            </h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-500 mb-8">
              Cảm ơn bạn đã mua sắm tại PetCare. Đơn hàng của bạn đã được ghi
              nhận vào hệ thống.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link
                to="/products"
                className="flex-1 bg-pink-50 text-pink-600 font-bold py-3 rounded-xl hover:bg-pink-100 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
              <Link
                to="/"
                className="flex-1 bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 shadow-md shadow-pink-200 flex items-center justify-center gap-2"
              >
                Về trang chủ <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <XCircle className="w-24 h-24 text-red-500 mb-6" />
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Thanh toán thất bại!
            </h2>
            <p className="text-gray-500 mb-8">
              Giao dịch bị hủy. Bạn chưa bị trừ tiền.
            </p>
            <Link
              to="/cart"
              className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 shadow-md transition-colors"
            >
              Thử thanh toán lại
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
