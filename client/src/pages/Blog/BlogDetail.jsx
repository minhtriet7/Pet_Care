import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, Tag, ArrowLeft, Share2 } from "lucide-react";
import axiosClient from "../../utils/axiosClient";

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  // 1. TẢI CHI TIẾT BÀI VIẾT
  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const res = await axiosClient.get(`/blogs/${id}`);
        if (res.success || res.data) {
          setBlog(res.data?.data || res.data || res);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết bài viết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetail();
  }, [id]);

  // 2. THANH TIẾN ĐỘ ĐỌC BÀI
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. HÀM XỬ LÝ LINK ẢNH
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/1200x600?text=PetCare+Blog";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  // MÀN HÌNH LÚC ĐANG TẢI
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // MÀN HÌNH LỖI NẾU KHÔNG TÌM THẤY BÀI
  if (!blog) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex flex-col justify-center items-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Opps! Không tìm thấy bài viết này.
        </h2>
        <Link
          to="/blog"
          className="flex items-center gap-2 bg-pink-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-pink-600 transition-colors"
        >
          <ArrowLeft size={20} /> Quay lại danh sách Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50 relative">
      {/* THANH TIẾN ĐỘ ĐỌC (Reading Progress Bar) */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200 z-[100]">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Nút quay lại */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-500 font-bold mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={18} /> Cẩm nang nuôi Boss
        </Link>

        {/* ẢNH BÌA HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-10 border border-white">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-[400px] md:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                <Tag size={16} /> {blog.category || "Tin tức thú cưng"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-md">
              {blog.title}
            </h1>
          </div>
        </div>

        {/* THÔNG TIN TÁC GIẢ & META INFO */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10 flex items-center justify-between flex-wrap gap-4 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner border-2 border-white ring-2 ring-pink-100">
              {blog.author?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Viết bởi</p>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">
                {blog.author || "Admin PetCare"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
              <Calendar className="w-5 h-5 text-pink-500" />
              <span className="font-medium text-sm">
                {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <button className="flex items-center gap-2 bg-pink-50 text-pink-600 hover:bg-pink-100 px-4 py-2 rounded-xl transition-colors font-bold text-sm cursor-pointer">
              <Share2 className="w-4 h-4" /> Chia sẻ
            </button>
          </div>
        </div>

        {/* NỘI DUNG BÀI VIẾT CHÍNH */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-10 border border-gray-100">
          <div className="text-gray-700 text-lg leading-loose whitespace-pre-wrap font-medium">
            {blog.content}
          </div>
        </div>

        {/* KÊU GỌI HÀNH ĐỘNG (CTA) DƯỚI CÙNG */}
        <div className="bg-gradient-to-r from-pink-500 to-orange-400 rounded-3xl p-8 md:p-12 text-center shadow-xl text-white">
          <h3 className="text-2xl font-black mb-4">
            Bạn cần tư vấn thêm về thú cưng?
          </h3>
          <p className="text-pink-50 mb-8 max-w-2xl mx-auto">
            Hãy liên hệ ngay với đội ngũ bác sĩ thú y của PetCare để được hỗ trợ
            và giải đáp mọi thắc mắc hoàn toàn miễn phí.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/products"
              className="bg-white text-pink-600 font-bold py-3 px-8 rounded-full hover:bg-pink-50 transition-colors shadow-lg"
            >
              Mua sắm ngay
            </Link>
            <a
              href="tel:19001234"
              className="bg-black/20 text-white font-bold py-3 px-8 rounded-full hover:bg-black/30 transition-colors backdrop-blur-sm border border-white/20"
            >
              Gọi Hotline
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
