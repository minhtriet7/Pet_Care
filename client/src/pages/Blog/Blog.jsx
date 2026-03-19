import React from "react";
import { ArrowRight, Calendar, User } from "lucide-react";

export default function Blog() {
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
      title:
        "Thức ăn giải nhiệt cho chó vào mùa hè, gợi ý dinh dưỡng giúp cún cưng luôn mát khỏe",
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
    },
  ];

  return (
    <div className="bg-[#FFF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">
            Cẩm Nang <span className="text-pink-500">Nuôi Boss</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Tổng hợp các kiến thức thú y, mẹo huấn luyện và chế độ dinh dưỡng
            chuẩn khoa học giúp thú cưng của bạn luôn khỏe mạnh và hạnh phúc.
          </p>
        </div>

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
      </div>
    </div>
  );
}
