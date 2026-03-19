import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  // Hàm định dạng tiền tệ VNĐ
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group border border-orange-50">
      <Link to={`/product/${product._id}`} className="block relative h-56 mb-4 overflow-hidden rounded-2xl">
        {/* Mongo thường dùng _id thay vì id */}
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{product.discount}%
          </span>
        )}
      </Link>
      
      <div className="flex items-center mb-2">
        <Star size={16} className="text-yellow-400" fill="currentColor" />
        <span className="text-sm text-gray-500 ml-1 font-medium">{product.rating || "5.0"}</span>
      </div>
      
      <Link to={`/product/${product._id}`}>
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-orange-500 transition-colors flex-grow">
          {product.name}
        </h3>
      </Link>
      
      <div className="mt-auto pt-4 flex justify-between items-center border-t border-orange-100 border-dashed">
        <div>
          <span className="text-lg font-extrabold text-orange-600">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through block">{formatPrice(product.oldPrice)}</span>}
        </div>
        <button className="bg-orange-50 hover:bg-orange-500 text-orange-500 hover:text-white p-3 rounded-xl transition-all shadow-sm">
          <ShoppingCart size={20} />
        </button>
      </div>
    </div>
  );
}