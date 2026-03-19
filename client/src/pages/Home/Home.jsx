import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Calendar, ArrowRight } from "lucide-react";
import axiosClient from "../../utils/axiosClient";

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState({ products: [], pets: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // --- LẮNG NGHE & ĐỒNG BỘ DANH SÁCH YÊU THÍCH ---
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("petcare_favorites")) || [];
    setFavorites(favs);

    const updateFavs = () =>
      setFavorites(JSON.parse(localStorage.getItem("petcare_favorites")) || []);
    window.addEventListener("favoritesUpdated", updateFavs);
    return () => window.removeEventListener("favoritesUpdated", updateFavs);
  }, []);

  // 1. GỌI API LẤY DỮ LIỆU THỰC TẾ
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [resProd, resPets, resServ] = await Promise.allSettled([
          axiosClient.get("/products"),
          axiosClient.get("/pets/forsale"),
          axiosClient.get("/services"),
        ]);

        // Đính kèm itemType vào dữ liệu để trang Favorites dễ dàng nhận diện
        setData({
          products:
            resProd.status === "fulfilled" && resProd.value.success
              ? resProd.value.data
                  .slice(0, 8)
                  .map((p) => ({ ...p, itemType: "product" }))
              : [],
          pets:
            resPets.status === "fulfilled" && resPets.value.success
              ? resPets.value.data
                  .slice(0, 4)
                  .map((p) => ({ ...p, itemType: "thu-cung" }))
              : [],
          services:
            resServ.status === "fulfilled" && resServ.value.success
              ? resServ.value.data
                  .slice(0, 3)
                  .map((p) => ({ ...p, itemType: "dich-vu" }))
              : [],
        });
      } catch (err) {
        console.error("Lỗi lấy dữ liệu trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
    window.scrollTo(0, 0);
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  // 2. XỬ LÝ THÊM VÀO GIỎ HÀNG (Chỉ dành cho Sản phẩm)
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo || !userInfo.token) {
      const cart = JSON.parse(localStorage.getItem("petcare_cart")) || [];
      const existingItem = cart.find((item) => item._id === product._id);
      const productImage =
        (product.images && product.images[0]) ||
        product.imageUrl ||
        "https://via.placeholder.com/200";

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          ...product,
          quantity: 1,
          imageUrl: productImage,
          itemType: "product",
        });
      }
      localStorage.setItem("petcare_cart", JSON.stringify(cart));
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      try {
        const res = await axiosClient.post("/cart", {
          productId: product._id,
          quantity: 1,
        });
        if (res.success || res.data?.success)
          alert(`Đã thêm ${product.name} vào giỏ hàng!`);
      } catch (error) {
        alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng");
      }
    }
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // 3. XỬ LÝ THÊM/XÓA YÊU THÍCH (Wishlist)
  const handleToggleFavorite = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    let currentFavs =
      JSON.parse(localStorage.getItem("petcare_favorites")) || [];
    const isExist = currentFavs.find((fav) => fav._id === item._id);

    if (isExist) {
      currentFavs = currentFavs.filter((fav) => fav._id !== item._id); // Bỏ yêu thích
    } else {
      currentFavs.push(item); // Thêm yêu thích
    }

    localStorage.setItem("petcare_favorites", JSON.stringify(currentFavs));
    setFavorites(currentFavs);
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  // --- DỮ LIỆU TĨNH UI ---
  const CIRCULAR_CATEGORIES = [
    {
      name: "Thực Phẩm",
      slug: "thuc-pham",
      icon: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773749190/20_qjy048.png",
    },
    {
      name: "Dụng Cụ Ăn",
      slug: "dung-cu-an-uong",
      icon: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773748593/8_kezoof.png",
    },
    {
      name: "Vệ Sinh",
      slug: "ve-sinh-thu-cung",
      icon: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773748135/10_kew2aa.png",
    },
    {
      name: "Trang Phục",
      slug: "trang-phuc-di-chuyen",
      icon: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773747914/1_bgv3ry.png",
    },
    {
      name: "Chỗ Ở",
      slug: "cho-o-giai-tri",
      icon: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773747470/1_pype2b.jpg",
    },
    {
      name: "Spa Khám",
      slug: "dich-vu",
      icon: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773749810/4_ajrd6r.jpg",
    },
  ];

  const NEWS = [
    {
      id: 1,
      title: "Nguyên Nhân Chó Bị Tiểu Đường Mà Bạn Cần Nên Biết",
      img: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773888884/151-vet-300x200-985_iftpre.jpg",
      desc: "Cảnh báo những rủi ro không thể bỏ qua khi đổi chế độ ăn của boss...",
      url: "https://paddy.vn/blogs/cham-soc-thu-cung/nguyen-nhan-cho-bi-tieu-duong-ma-ban-can-nen-biet",
    },
    {
      id: 2,
      title: "Khám phá các giống chó ngoan ngoãn dễ nuôi cho căn hộ",
      img: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773745881/3_gdo1nb.png",
      desc: "Bạn ở chung cư và muốn nuôi cún? Đây là top 5 giống chó ít sủa, sạch sẽ...",
      url: "https://paddy.vn/blogs/cham-soc-thu-cung/cac-giong-cho-canh-de-nuoi-o-chung-cu?srsltid=AfmBOoplp8w5f5xIFE9UCDCrAikuNc4749u_P9R4EsTSLpzx-mREEfBU",
    },
    {
      id: 3,
      title: "Thức ăn giải nhiệt cho chó vào mùa hè, gợi ý dinh dưỡng giúp cún cưng luôn mát khỏe",
      img: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773749810/3_yqpe2m.jpg",
      desc: "Bảo vệ sức khỏe bé yêu với cẩm nang tiêm phòng và tẩy giun chi tiết nhất.",
      url: "https://paddy.vn/blogs/cham-soc-thu-cung/thuc-an-giai-nhiet-cho-cho-vao-mua-he-goi-y-dinh-duong-giup-cun-cung-luon-mat-khoe",
    },
    {
      id: 4,
      title: "ĐIỀU CHỈNH GIÁ SẢN PHẨM ROYAL CANIN TỪ 1/7/2025",
      img: "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1773882194/54e27e2b02b0e9d12811aeefcb9b2f72_ard21c.jpg",
      desc: "Thông báo điều chỉnh giá sản phẩm Royal Canin từ 1/7/2025 do biến động chi phí nguyên liệu và vận chuyển.",
      url: "https://paddy.vn/blogs/news/thong-bao-dieu-chinh-gia-san-pham-royal-canin-tu-1-7-2025",

    }

  ];

  return (
    <div className="bg-white pb-20">
      {/* BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        <div
          className="w-full h-48 md:h-[400px] rounded-3xl overflow-hidden shadow-sm relative group cursor-pointer"
          onClick={() => navigate("/products")}
        >
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200"
            alt="Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/80 to-transparent flex items-center px-8 md:px-16">
            <div className="text-white">
              <h2 className="text-3xl md:text-5xl font-black mb-2 text-shadow-sm uppercase tracking-wide">
                Giao hàng thần tốc
              </h2>
              <p className="text-xl md:text-2xl font-bold mb-6">
                NHẬN HÀNG TRONG 2H
              </p>
              <button className="bg-white text-pink-500 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-pink-50 transition-colors flex items-center gap-2">
                Khám phá ngay <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DANH MỤC TRÒN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">
          Danh Mục Nổi Bật
        </h2>
        <div className="flex overflow-x-auto gap-6 md:gap-10 pb-4 no-scrollbar">
          {CIRCULAR_CATEGORIES.map((cat, idx) => (
            <Link
              to={`/products?category=${cat.slug}`}
              key={idx}
              className="flex flex-col items-center min-w-[90px] md:min-w-[110px] group"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden mb-3 border-4 border-pink-50 shadow-sm group-hover:border-pink-300 transition-colors bg-white flex items-center justify-center p-2">
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-pink-500 text-center uppercase tracking-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* THÚ CƯNG ĐANG TÌM CHỦ */}
      {data.pets.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 bg-pink-50 py-10 rounded-3xl border border-pink-100">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase">
              Các Boss Đang Tìm Chủ
            </h2>
            <Link
              to="/products?category=thu-cung"
              className="text-sm font-bold text-pink-500 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {data.pets.map((pet) => (
              <Link
                to={`/product/${pet._id}?type=thu-cung`}
                key={pet._id}
                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all block group relative"
              >
                <div className="overflow-hidden rounded-xl mb-3 relative">
                  <img
                    src={
                      pet.avatar ||
                      pet.images?.[0] ||
                      "https://via.placeholder.com/200"
                    }
                    alt={pet.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* NÚT YÊU THÍCH CHO THÚ CƯNG */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, pet)}
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm z-10 transition-all"
                  >
                    <Heart
                      size={18}
                      className={
                        favorites.some((f) => f._id === pet._id)
                          ? "text-pink-500 fill-pink-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-pink-500 transition-colors">
                  {pet.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  Giống: <span className="font-semibold">{pet.breed}</span>
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-pink-500 font-bold">
                    {formatPrice(pet.price)}
                  </span>
                  {/* Nút Xem chi tiết thay vì thêm vào giỏ hàng */}
                  <span className="text-xs font-bold text-gray-400 group-hover:text-pink-500 transition-colors">
                    Xem bé ngay
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SẢN PHẨM BÁN CHẠY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-black text-gray-900 uppercase">
            Sản Phẩm Bán Chạy
          </h2>
          <Link
            to="/products"
            className="text-sm font-bold text-pink-500 hover:underline flex items-center gap-1"
          >
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="text-center text-pink-500 font-bold animate-pulse py-10">
            Đang tải sản phẩm...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {data.products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all group flex flex-col h-full relative"
              >
                <Link
                  to={`/product/${product._id}?type=product`}
                  className="h-48 mb-4 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center p-2 relative block"
                >
                  <img
                    src={
                      product.images?.[0] ||
                      product.imageUrl ||
                      "https://via.placeholder.com/200"
                    }
                    alt={product.name}
                    className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* NÚT YÊU THÍCH CHO SẢN PHẨM */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, product)}
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm z-10 transition-all"
                  >
                    <Heart
                      size={18}
                      className={
                        favorites.some((f) => f._id === product._id)
                          ? "text-pink-500 fill-pink-500"
                          : "text-gray-400"
                      }
                    />
                  </button>

                  {product.discountPrice && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      SALE
                    </span>
                  )}
                </Link>

                <Link
                  to={`/product/${product._id}?type=product`}
                  className="flex-grow flex flex-col"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors flex-grow">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-auto flex justify-between items-end border-t border-gray-50 pt-3">
                  <div>
                    <span className="text-lg font-bold text-pink-600 block">
                      {formatPrice(product.price)}
                    </span>
                    {product.discountPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.discountPrice)}
                      </span>
                    )}
                  </div>
                  {/* NÚT THÊM GIỎ HÀNG */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-pink-50 text-pink-500 p-2.5 rounded-xl hover:bg-pink-500 hover:text-white transition-colors cursor-pointer"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DỊCH VỤ NỔI BẬT */}
      {data.services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase">
              Dịch Vụ Chăm Sóc Spa
            </h2>
            <Link
              to="/products?category=dich-vu"
              className="text-sm font-bold text-pink-500 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.services.map((srv) => (
              <Link
                to={`/product/${srv._id}?type=dich-vu`}
                key={srv._id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all flex items-center p-4 group"
              >
                <div className="w-24 h-24 shrink-0 overflow-hidden rounded-2xl">
                  <img
                    src={srv.images?.[0] || "https://via.placeholder.com/150"}
                    alt={srv.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-pink-500 transition-colors line-clamp-2">
                    {srv.name}
                  </h3>
                  <p className="text-pink-500 font-bold mb-2">
                    Từ {formatPrice(srv.basePrice)}
                  </p>
                  <button className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center hover:bg-pink-500 transition-colors">
                    <Calendar size={14} className="mr-1" /> Đặt lịch
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TIN TỨC - CẨM NANG */}
      <section
        id="tin-tuc"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
      >
        <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase">
          Cẩm Nang Nuôi Boss
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {NEWS.map((news) => (
            /* ĐỔI TỪ <Link> THÀNH <a> ĐỂ MỞ TAB MỚI */
            <a
              href={news.url}
              target="_blank"
              rel="noreferrer"
              key={news.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="overflow-hidden h-48">
                <img
                  src={news.img}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {news.desc}
                </p>
                <span className="text-pink-500 font-bold text-sm flex items-center gap-1 group-hover:underline">
                  Đọc thêm <ArrowRight size={14} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
