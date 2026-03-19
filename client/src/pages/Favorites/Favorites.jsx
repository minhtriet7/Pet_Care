import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFavorites = () => {
      const savedFavs = JSON.parse(localStorage.getItem('petcare_favorites')) || [];
      setFavorites(savedFavs);
    };
    loadFavorites();
    window.addEventListener('favoritesUpdated', loadFavorites);
    return () => window.removeEventListener('favoritesUpdated', loadFavorites);
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  // Xóa khỏi danh sách yêu thích
  const handleRemoveFavorite = (id) => {
    const newFavs = favorites.filter(item => item._id !== id);
    setFavorites(newFavs);
    localStorage.setItem('petcare_favorites', JSON.stringify(newFavs));
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  // Thêm vào giỏ hàng từ trang Yêu thích
  const handleAddToCart = async (product) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo || !userInfo.token) {
      const cart = JSON.parse(localStorage.getItem("petcare_cart")) || [];
      const existing = cart.find(i => i._id === product._id);
      if (existing) existing.quantity += 1;
      else cart.push({ ...product, quantity: 1, itemType: 'product' });
      
      localStorage.setItem("petcare_cart", JSON.stringify(cart));
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      try {
        const res = await axiosClient.post("/cart", { productId: product._id, quantity: 1 });
        if (res.success || res.data?.success) alert(`Đã thêm ${product.name} vào giỏ hàng!`);
      } catch (error) {
        alert("Lỗi khi thêm vào giỏ hàng");
      }
    }
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Tùy chọn: Xóa khỏi danh sách yêu thích sau khi đã thêm vào giỏ
    handleRemoveFavorite(product._id);
  };

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase">
          <Heart className="text-pink-500 fill-pink-500" size={32} /> Mục Yêu Thích
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-pink-50">
            <Heart size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-500 mb-4">Bạn chưa yêu thích mục nào</h2>
            <Link to="/products" className="inline-block bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors shadow-md">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {favorites.map(item => (
              <div key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all flex flex-col h-full group">
                <Link to={`/product/${item._id}?type=${item.itemType || 'product'}`} className="block h-40 mb-4 overflow-hidden rounded-xl bg-gray-50 relative p-2">
                  <img src={item.images?.[0] || item.avatar || item.imageUrl || 'https://via.placeholder.com/200'} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                  <button 
                    onClick={(e) => { e.preventDefault(); handleRemoveFavorite(item._id); }}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-red-500 rounded-full shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </Link>
                <Link to={`/product/${item._id}?type=${item.itemType || 'product'}`} className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-pink-500">{item.name}</h3>
                </Link>
                <div className="mt-auto pt-3 border-t border-gray-50">
                  <span className="text-lg font-bold text-pink-600 block mb-3">{formatPrice(item.price || item.basePrice)}</span>
                  
                  {/* Nút thao tác tùy theo loại mặt hàng */}
                  {(!item.itemType || item.itemType === 'product') ? (
                    <button onClick={() => handleAddToCart(item)} className="w-full bg-pink-50 text-pink-600 font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-pink-500 hover:text-white transition-colors">
                      <ShoppingCart size={18}/> Thêm vào giỏ
                    </button>
                  ) : (
                    <Link to={`/product/${item._id}?type=${item.itemType}`} className="w-full bg-gray-100 text-gray-700 font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                      Xem chi tiết <ArrowRight size={18}/>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}