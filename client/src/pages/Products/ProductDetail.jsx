import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";
import {
  ShoppingCart,
  Star,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Info,
  ShieldCheck, // Thêm dòng này
  Phone,       // Thêm dòng này
  MessageCircle
} from "lucide-react";
import axiosClient from "../../utils/axiosClient";

export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "product";
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImg, setMainImg] = useState("");

  const [activeTab, setActiveTab] = useState("info");
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // --- STATE CHO ĐÁNH GIÁ ---
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // --- STATE CHO ĐẶT LỊCH DỊCH VỤ ---
  const [myPets, setMyPets] = useState([]);
  const [bookingData, setBookingData] = useState({
    pet: "",
    date: "",
    timeSlot: "",
    notes: "",
  });
  const [isBooking, setIsBooking] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let url = `/products/${id}`;
        if (type === "thu-cung") url = `/pets/${id}`;
        if (type === "dich-vu") url = `/services/${id}`;

        const res = await axiosClient.get(url);
        if (res.success && res.data) {
          const currentProduct = res.data;
          setProduct(currentProduct);
          setMainImg(
            (currentProduct.images && currentProduct.images[0]) ||
              currentProduct.avatar ||
              currentProduct.imageUrl ||
              "https://via.placeholder.com/500",
          );

          let relatedUrl =
            type === "thu-cung"
              ? `/pets/forsale`
              : type === "dich-vu"
                ? `/services`
                : `/products`;
          const relatedRes = await axiosClient.get(relatedUrl);
          if (relatedRes.success) {
            let filtered = relatedRes.data.filter((p) => p._id !== id);
            if (type === "product" && currentProduct.category) {
              filtered = filtered.filter(
                (p) => p.category?._id === currentProduct.category?._id,
              );
            }
            setRelatedProducts(filtered.slice(0, 4));
          }
        }

        const reviewRes = await axiosClient.get(`/reviews/${id}`);
        if (reviewRes.success) setReviews(reviewRes.data);

        // NẾU LÀ DỊCH VỤ VÀ ĐÃ ĐĂNG NHẬP -> Lấy danh sách thú cưng của khách
        if (type === "dich-vu" && userInfo) {
          const petsRes = await axiosClient.get("/pets/my-pets");
          if (petsRes.success) setMyPets(petsRes.data);
        }
      } catch (error) {
        console.error("Lỗi gọi API Detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  // --- XỬ LÝ MUA HÀNG (Cho Sản phẩm & Thú cưng) ---
  const handleAddToCart = async () => {
    if (!userInfo) {
      // Lưu tạm vào LocalStorage
      const cart = JSON.parse(localStorage.getItem("petcare_cart")) || [];
      const existing = cart.find((i) => i._id === product._id);
      if (existing) existing.quantity += quantity;
      else
        cart.push({ ...product, quantity, itemType: type, imageUrl: mainImg });
      localStorage.setItem("petcare_cart", JSON.stringify(cart));
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
    } else {
      try {
        const res = await axiosClient.post("/cart", {
          productId: product._id,
          quantity,
        });
        if (res.success) alert(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi khi thêm vào giỏ");
      }
    }
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // --- XỬ LÝ ĐẶT LỊCH (Cho Dịch vụ) ---
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      alert("Vui lòng đăng nhập để đặt lịch dịch vụ!");
      return navigate("/login");
    }
    if (!bookingData.pet || !bookingData.date || !bookingData.timeSlot) {
      return alert("Vui lòng chọn đầy đủ thú cưng, ngày và giờ hẹn!");
    }

    try {
      setIsBooking(true);
      const payload = {
        pet: bookingData.pet,
        service: id,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        totalPrice: product.basePrice, // Lấy giá cơ bản, có thể tính lại ở Admin
        notes: bookingData.notes,
      };

      const res = await axiosClient.post("/appointments", payload);
      if (res.success) {
        alert(
          "🎉 Đặt lịch hẹn thành công! Vui lòng mang thú cưng đến đúng giờ nhé.",
        );
        navigate("/profile"); // Chuyển về profile để xem lịch
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi đặt lịch hẹn");
    } finally {
      setIsBooking(false);
    }
  };
  // --- XỬ LÝ GỬI ĐÁNH GIÁ ---
  // --- XỬ LÝ GỬI ĐÁNH GIÁ ---
  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    try {
      let modelType = "Product";
      if (type === "dich-vu") modelType = "Service";
      if (type === "thu-cung") modelType = "Pet";

      const payload = {
        item: id,
        itemModel: modelType,
        rating: rating,
        comment: comment
      };

      const res = await axiosClient.post("/reviews", payload);
      
      if (res.success || res.data?.success) {
        alert("🎉 Gửi đánh giá thành công! Cảm ơn bạn.");
        
        // 1. Tạo object chứa dữ liệu thật khách vừa nhập để ép React vẽ lên màn hình ngay
        const newReview = {
          _id: Math.random().toString(), // ID tạm thời cho UI
          user: { name: userInfo.name }, // Lấy tên thật của người đang đăng nhập
          rating: rating,
          comment: comment,
          createdAt: new Date().toISOString() // Giờ hiện tại
        };

        // 2. Ép React đẩy bình luận mới lên ĐẦU danh sách giao diện
        setReviews(prevReviews => [newReview, ...prevReviews]);

        // 3. Xóa form đi cho gọn
        setComment("");
        setRating(5);
        
        // 4. Gọi ngầm API một lần nữa để đồng bộ chắc chắn 100% dữ liệu gốc từ DB
        const reviewRes = await axiosClient.get(`/reviews/${id}`);
        if (reviewRes.success) {
           setReviews(reviewRes.data);
        } else if (reviewRes.data && reviewRes.data.success) {
           // Đề phòng trường hợp axiosClient bọc dữ liệu thêm 1 lớp
           setReviews(reviewRes.data.data);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi gửi đánh giá. Có thể bạn đã đánh giá mặt hàng này rồi.");
    }
  };
  if (loading)
    return (
      <div className="text-center py-32 text-pink-500 font-bold animate-pulse">
        Đang tải chi tiết...
      </div>
    );
  if (!product)
    return (
      <div className="text-center py-32 font-bold text-xl text-gray-500">
        Dữ liệu không tồn tại!
      </div>
    );

  const currentPrice = product.price || product.basePrice || 0;

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* KHUNG THÔNG TIN CƠ BẢN */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col lg:flex-row gap-10 mb-10">
          <div className="lg:w-1/2">
            <div className="bg-gray-50 rounded-2xl h-[400px] mb-4 border border-gray-100 flex items-center justify-center p-4">
              <img
                src={mainImg}
                alt={product.name}
                className="max-h-full object-contain rounded-xl mix-blend-multiply"
              />
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
              {product.name}
            </h1>
            <div className="flex items-end gap-4 mb-6 pb-6 border-b border-gray-100">
              <span className="text-3xl font-bold text-pink-500">
                {formatPrice(currentPrice)}
              </span>
              {product.discountPrice && (
                <span className="text-xl text-gray-400 line-through mb-1">
                  {formatPrice(product.discountPrice)}
                </span>
              )}
            </div>

            {/* HIỂN THỊ THÔNG SỐ HOẶC BẢNG GIÁ DỊCH VỤ */}
            {type === "dich-vu" && (
              <div className="bg-pink-50 p-4 rounded-xl mb-6 text-sm border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-pink-500" />
                  <span className="text-gray-700 font-bold">
                    Thời gian thực hiện:
                  </span>{" "}
                  {product.duration} phút
                </div>
                {product.priceVariations?.length > 0 && (
                  <div className="mt-4 border-t border-pink-200 pt-3">
                    <span className="text-gray-700 font-bold block mb-2">
                      Bảng giá tham khảo theo cân nặng:
                    </span>
                    <ul className="space-y-1">
                      {product.priceVariations.map((pv, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between text-gray-600"
                        >
                          <span>- {pv.condition}:</span>{" "}
                          <span className="font-bold text-pink-600">
                            {formatPrice(pv.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* --- GIAO DIỆN TÙY BIẾN THEO LOẠI (TYPE) --- */}
            {type === "dich-vu" ? (
              /* 1. FORM ĐẶT LỊCH NẾU LÀ DỊCH VỤ */
              <form
                onSubmit={handleBookAppointment}
                className="mt-auto bg-white border border-gray-200 p-5 rounded-2xl shadow-sm"
              >
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-pink-500" /> Chọn lịch hẹn
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Chọn thú cưng của bạn
                    </label>
                    {myPets.length > 0 ? (
                      <select
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none"
                        value={bookingData.pet}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            pet: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">-- Chọn thú cưng --</option>
                        {myPets.map((pet) => (
                          <option key={pet._id} value={pet._id}>
                            {pet.name} ({pet.species === "dog" ? "Chó" : "Mèo"})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                        Bạn chưa có hồ sơ thú cưng nào.{" "}
                        <Link to="/profile" className="font-bold underline">
                          Thêm thú cưng ngay
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Ngày hẹn
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={bookingData.date}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            date: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Giờ hẹn
                      </label>
                      <select
                        required
                        value={bookingData.timeSlot}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            timeSlot: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                      >
                        <option value="">-- Chọn giờ --</option>
                        <option value="09:00 - 10:00">09:00 - 10:00</option>
                        <option value="10:00 - 11:00">10:00 - 11:00</option>
                        <option value="14:00 - 15:00">14:00 - 15:00</option>
                        <option value="15:00 - 16:00">15:00 - 16:00</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Ghi chú (Vd: Bé mèo hơi nhát...)"
                      value={bookingData.notes}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          notes: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isBooking || myPets.length === 0}
                    className="w-full bg-pink-500 text-white font-bold py-3.5 rounded-xl hover:bg-pink-600 transition-colors disabled:bg-gray-300"
                  >
                    {isBooking ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                  </button>
                </div>
              </form>
            ) : type === "thu-cung" ? (
              /* 2. NẾU LÀ THÚ CƯNG -> ẨN GIỎ HÀNG, HIỆN BẢNG THÔNG SỐ VÀ LIÊN HỆ */
              <div className="mt-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500">Giống loài</p>
                    <p className="font-bold text-gray-800">{product.breed || 'Đang cập nhật'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500">Giới tính</p>
                    <p className="font-bold text-gray-800">{product.gender === 'male' ? 'Đực' : product.gender === 'female' ? 'Cái' : 'Chưa rõ'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500">Độ tuổi</p>
                    <p className="font-bold text-gray-800">{product.age ? `${product.age} tháng` : 'Đang cập nhật'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500">Tiêm phòng</p>
                    <p className="font-bold text-green-600 flex items-center gap-1"><ShieldCheck size={16}/> Đã tiêm</p>
                  </div>
                </div>

                <div className="bg-pink-50 p-5 rounded-2xl border border-pink-100">
                  <h3 className="font-bold text-gray-900 mb-2">Bạn muốn đón bé về nhà?</h3>
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                    Thú cưng cần được kiểm tra sức khỏe trực tiếp. Vui lòng liên hệ với cửa hàng để được tư vấn chi tiết và gửi video thực tế nhé!
                  </p>
                  <div className="flex gap-4">
                    <a href="tel:0901234567" className="flex-1 bg-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-pink-600 shadow-md shadow-pink-200 transition-colors text-center flex items-center justify-center gap-2">
                      <Phone size={18}/> Gọi ngay
                    </a>
                    <Link to="https://zalo.me/pc" className="flex-1 bg-white border border-pink-200 text-pink-500 font-bold py-3 px-6 rounded-xl hover:bg-pink-50 transition-colors text-center flex items-center justify-center gap-2">
                      <MessageCircle size={18}/> Zalo
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* 3. NẾU LÀ SẢN PHẨM BÌNH THƯỜNG -> HIỆN NÚT MUA HÀNG VÀ SỐ LƯỢNG */
              <div className="mt-auto">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-bold text-gray-700">Số lượng:</span>
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 w-32">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-gray-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="flex-1 text-center font-semibold text-gray-700">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock || 99, q + 1))
                      }
                      className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      handleAddToCart();
                      navigate("/cart");
                    }}
                    className="flex-1 bg-pink-400 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-500 shadow-md transition-colors uppercase flex items-center justify-center gap-2"
                  >
                    Mua Ngay {">"}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 border border-pink-200 text-pink-500 font-medium py-3 px-6 rounded-lg hover:bg-pink-50 transition-colors"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PHẦN TABS: THÔNG TIN VÀ ĐÁNH GIÁ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-10 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-4 font-bold text-sm uppercase transition-colors ${activeTab === "info" ? "text-pink-500 border-b-2 border-pink-500 bg-pink-50" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Thông tin chi tiết
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 py-4 font-bold text-sm uppercase transition-colors ${activeTab === "reviews" ? "text-pink-500 border-b-2 border-pink-500 bg-pink-50" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Đánh giá ({reviews.length})
            </button>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === "info" ? (
              <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description ||
                  product.medicalHistory ||
                  "Chưa có thông tin mô tả chi tiết."}
              </div>
            ) : (
              <div>
                {!userInfo ? (
                  <div className="bg-gray-50 border border-gray-100 p-6 rounded-lg mb-8 text-center">
                    <p className="text-gray-600 mb-2">Chưa có đánh giá nào.</p>
                    <p className="text-gray-600">
                      Chỉ những khách hàng đã đăng nhập mới có thể đưa ra đánh
                      giá.
                    </p>
                    <Link
                      to="/login"
                      className="inline-block mt-4 text-pink-500 font-bold hover:underline"
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                ) : (
                  <form
                    onSubmit={submitReview}
                    className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100"
                  >
                    <h3 className="font-bold text-gray-800 mb-4">
                      Viết đánh giá của bạn
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gray-600 text-sm">Chất lượng:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          onClick={() => setRating(star)}
                          className={`cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill={star <= rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Nhận xét của bạn..."
                      className="w-full p-4 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none"
                      rows="3"
                    ></textarea>
                    <button
                      type="submit"
                      className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                      Gửi đánh giá
                    </button>
                  </form>
                )}

                <div className="space-y-6">
                  {reviews.length > 0
                    ? reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border-b border-gray-100 pb-6"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold uppercase">
                              {review.user?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">
                                {review.user?.name || "Khách hàng"}
                              </p>
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    fill={
                                      i < review.rating
                                        ? "currentColor"
                                        : "none"
                                    }
                                    className={
                                      i >= review.rating ? "text-gray-300" : ""
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="ml-auto text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm ml-13 pl-13">
                            {review.comment}
                          </p>
                        </div>
                      ))
                    : userInfo && (
                        <p className="text-gray-500 italic">
                          Hãy là người đầu tiên đánh giá mục này!
                        </p>
                      )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SẢN PHẨM / DỊCH VỤ TƯƠNG TỰ */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 uppercase">
                Gợi ý cho bạn
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-pink-200 text-white flex items-center justify-center hover:bg-pink-400">
                  <ChevronLeft size={20} />
                </button>
                <button className="w-8 h-8 rounded-full bg-pink-200 text-white flex items-center justify-center hover:bg-pink-400">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  to={`/product/${p._id}?type=${type}`}
                  key={p._id}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 block"
                >
                  <div className="h-48 mb-4 bg-gray-50 rounded-lg p-2 flex items-center justify-center relative">
                    <img
                      src={
                        p.images?.[0] ||
                        p.avatar ||
                        p.imageUrl ||
                        "https://via.placeholder.com/200"
                      }
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      alt={p.name}
                    />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 hover:text-pink-500">
                    {p.name}
                  </h3>
                  <p className="text-pink-500 font-bold">
                    {formatPrice(p.price || p.basePrice)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
