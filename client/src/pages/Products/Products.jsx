import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShoppingCart, Star, Heart } from "lucide-react";
import axiosClient from "../../utils/axiosClient";
import { PRODUCT_CATEGORIES } from "../../utils/constants";
import Pagination from "../../components/common/Pagination";

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "all";
  const keyword = searchParams.get("keyword")?.toLowerCase().trim() || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);

  const [sortOrder, setSortOrder] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "all");
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const loadFavs = () => {
      const favs = JSON.parse(localStorage.getItem("petcare_favorites")) || [];
      setFavorites(favs);
    };
    loadFavs();
    window.addEventListener("favoritesUpdated", loadFavs);
    return () => window.removeEventListener("favoritesUpdated", loadFavs);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        let allItems = [];

        const resProducts = await axiosClient.get("/products");
        if (resProducts.success) {
          const mappedProducts = resProducts.data.map((p) => ({
            ...p,
            itemType: "product",
          }));
          allItems = [...allItems, ...mappedProducts];
        }

        try {
          const resServices = await axiosClient.get("/services");
          if (resServices.success) {
            const mappedServices = resServices.data.map((s) => ({
              ...s,
              itemType: "dich-vu",
              price: s.basePrice,
              category: s.category || {
                name: "Dịch Vụ Spa/Khám",
                slug: "dich-vu",
              },
            }));
            allItems = [...allItems, ...mappedServices];
          }
        } catch (error) {
          console.error("Lỗi khi tải dịch vụ:", error);
        }

        try {
          const resPets = await axiosClient.get("/pets/forsale");
          if (resPets.success && Array.isArray(resPets.data)) {
            const mappedPets = resPets.data.map((p) => ({
              ...p,
              itemType: "thu-cung",
              category: { name: "Chó Mèo Cảnh", slug: "thu-cung" },
              images: p.avatar
                ? [p.avatar]
                : ["https://via.placeholder.com/200"],
            }));
            allItems = [...allItems, ...mappedPets];
          }
        } catch (error) {
          console.error("Lỗi khi tải thú cưng:", error);
        }

        setProducts(allItems);
      } catch (error) {
        console.error("Lỗi fetch data tổng hợp:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleToggleFavorite = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    let currentFavs =
      JSON.parse(localStorage.getItem("petcare_favorites")) || [];
    const isExist = currentFavs.find((fav) => fav._id === item._id);
    if (isExist) {
      currentFavs = currentFavs.filter((fav) => fav._id !== item._id);
    } else {
      currentFavs.push(item);
    }
    localStorage.setItem("petcare_favorites", JSON.stringify(currentFavs));
    setFavorites(currentFavs);
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo || !userInfo.token) {
      const cart = JSON.parse(localStorage.getItem("petcare_cart")) || [];
      const existingItem = cart.find((item) => item._id === product._id);
      const productImage =
        (product.images && product.images[0]) ||
        product.avatar ||
        product.imageUrl ||
        "https://via.placeholder.com/200";

      if (existingItem) {
        if (product.stock && existingItem.quantity >= product.stock) {
          alert("Sản phẩm này đã đạt giới hạn tồn kho!");
          return;
        }
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1, imageUrl: productImage });
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
          alert(`Đã thêm ${product.name} vào giỏ hàng hệ thống!`);
      } catch (error) {
        alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng");
      }
    }
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // =================================================================
  // LOGIC LỌC VÀ TÌM KIẾM ĐÃ ĐƯỢC CHUẨN HÓA
  // =================================================================
  const activeCategoryObj = PRODUCT_CATEGORIES.find(
    (c) => c.slug === activeCategory,
  );
  const activeCategoryName =
    activeCategoryObj?.name?.toLowerCase().trim() || "";

  let filteredProducts = products.filter((p) => {
    // 1. Quét tìm kiếm (Tên, mô tả VÀ Danh mục)
    // 1. Quét tìm kiếm (Tên, mô tả, Danh mục VÀ GIỐNG LOÀI)
    if (keyword) {
      const productName = p.name?.toLowerCase() || "";
      const productDesc = p.description?.toLowerCase() || "";
      const catName = p.category?.name?.toLowerCase() || ""; 
      const petBreed = p.breed?.toLowerCase() || ""; // THÊM DÒNG NÀY

      // THÊM Điều kiện quét petBreed vào đây
      if (!productName.includes(keyword) && 
          !productDesc.includes(keyword) && 
          !catName.includes(keyword) &&
          !petBreed.includes(keyword)) {
        return false; 
      }
    }

    // 2. Lọc chính xác danh mục (Tab nào ra tab đó)
    if (activeCategory !== "all") {
      if (activeCategory === "dich-vu") {
        if (p.itemType !== "dich-vu") return false;
      } else if (activeCategory === "thu-cung") {
        if (p.itemType !== "thu-cung") return false;
      } else {
        if (p.itemType !== "product") return false;
        const catSlugDB = p.category?.slug || "";
        const catNameDB = p.category?.name?.toLowerCase().trim() || "";
        if (
          catSlugDB !== activeCategory &&
          !catNameDB.includes(activeCategoryName)
        )
          return false;
      }
    }

    // 3. Lọc khoảng giá tiền tỷ
    const itemPrice = p.price || p.basePrice || 0;
    if (priceRange === "under500k" && itemPrice >= 500000) return false;
    if (
      priceRange === "500kTo2M" &&
      (itemPrice < 500000 || itemPrice > 2000000)
    )
      return false;
    if (
      priceRange === "2MTo10M" &&
      (itemPrice < 2000000 || itemPrice > 10000000)
    )
      return false;
    if (priceRange === "over10M" && itemPrice <= 10000000) return false;

    return true;
  });

  if (sortOrder === "priceAsc") {
    filteredProducts.sort(
      (a, b) => (a.price || a.basePrice || 0) - (b.price || b.basePrice || 0),
    );
  } else if (sortOrder === "priceDesc") {
    filteredProducts.sort(
      (a, b) => (b.price || b.basePrice || 0) - (a.price || a.basePrice || 0),
    );
  } else {
    filteredProducts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {keyword ? (
              <>
                Tìm kiếm:{" "}
                <span className="text-pink-500">
                  "{searchParams.get("keyword")}"
                </span>
              </>
            ) : (
              <>
                Tất cả <span className="text-pink-500">Sản phẩm</span>
              </>
            )}
          </h1>

          <div className="flex bg-white p-2 rounded-full shadow-sm border border-pink-100 overflow-x-auto w-full md:w-auto no-scrollbar">
            <Link
              to="/products"
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeCategory === "all" ? "bg-pink-500 text-white shadow-md" : "text-gray-500 hover:text-pink-500"}`}
            >
              Tất cả
            </Link>
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeCategory === cat.slug ? "bg-pink-500 text-white shadow-md" : "text-gray-500 hover:text-pink-500"}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600">Khoảng giá:</span>
            <select
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-200 outline-none cursor-pointer text-gray-700 font-medium"
            >
              <option value="all">Tất cả mức giá</option>
              <option value="under500k">Dưới 500.000đ</option>
              <option value="500kTo2M">500.000đ - 2 Triệu</option>
              <option value="2MTo10M">2 Triệu - 10 Triệu</option>
              <option value="over10M">Trên 10 Triệu</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600">
              Sắp xếp theo:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-200 outline-none cursor-pointer text-gray-700 font-medium"
            >
              <option value="newest">Hàng mới nhất</option>
              <option value="priceAsc">Giá: Thấp đến Cao</option>
              <option value="priceDesc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
            <div className="text-pink-500 font-bold">
              Đang tìm các món đồ xinh xắn...
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-shadow relative group border border-transparent hover:border-pink-100 flex flex-col h-full"
                >
                  <Link
                    to={`/product/${product._id}?type=${product.itemType || "product"}`}
                    className="block relative h-48 mb-4 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center"
                  >
                    <img
                      src={
                        product.images?.[0] ||
                        product.avatar ||
                        product.imageUrl ||
                        "https://via.placeholder.com/200"
                      }
                      alt={product.name}
                      className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                    />

                    <button
                      onClick={(e) => handleToggleFavorite(e, product)}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all z-10"
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
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        Giảm giá
                      </span>
                    )}
                  </Link>

                  <div className="flex items-center mb-1">
                    <Star
                      size={14}
                      className="text-yellow-400 mr-1"
                      fill="currentColor"
                    />
                    <span className="text-xs text-gray-500 font-medium">
                      {product.ratingsAverage || 5.0}
                    </span>
                  </div>

                  <Link
                    to={`/product/${product._id}?type=${product.itemType || "product"}`}
                    className="flex-grow"
                  >
                    <p className="text-xs text-gray-400 mb-1 uppercase">
                      {product.category?.name ||
                        (product.itemType === "dich-vu"
                          ? "Dịch Vụ"
                          : "Sản phẩm")}
                    </p>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-pink-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-100 border-dashed">
                    <div>
                      <span className="text-lg font-bold text-pink-600 block">
                        {formatPrice(product.price || product.basePrice)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.discountPrice)}
                        </span>
                      )}
                    </div>
                    {product.itemType === "product" && (
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-pink-50 hover:bg-pink-500 text-pink-500 hover:text-white p-3 rounded-xl transition-colors shadow-sm"
                        title="Thêm vào giỏ hàng"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
              alt="Empty"
              className="w-24 h-24 opacity-50 mb-4"
            />
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p className="text-gray-500">
              Hãy thử tìm với một từ khóa khác hoặc bỏ các bộ lọc nhé.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
