import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, MessageSquare, X } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

export default function BookingModal({ service, isOpen, onClose }) {
  const [myPets, setMyPets] = useState([]);
  const [formData, setFormData] = useState({
    pet: '',
    date: '',
    timeSlot: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // 1. Lấy danh sách thú cưng của khách để chọn
  useEffect(() => {
    if (isOpen) {
      const fetchPets = async () => {
        try {
          const res = await axiosClient.get('/pets/my-pets');
          if (res.success) setMyPets(res.data);
        } catch (error) {
            
          console.error("Lỗi lấy thú cưng", error);
        }
      };
      fetchPets();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pet || !formData.date || !formData.timeSlot) {
      alert("Vui lòng điền đầy đủ thông tin đặt lịch!");
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        ...formData,
        service: service._id,
        totalPrice: service.basePrice // Hoặc tính toán theo cân nặng thú cưng
      };

      const res = await axiosClient.post('/appointments', orderData);
      if (res.success) {
        alert("Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận sớm.");
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi đặt lịch");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-pink-500 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Đặt lịch: {service.name}</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Chọn thú cưng */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <PawPrint size={18} className="text-pink-500"/> Chọn thú cưng của bạn
            </label>
            {myPets.length > 0 ? (
              <select 
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-200"
                onChange={(e) => setFormData({...formData, pet: e.target.value})}
                required
              >
                <option value="">-- Chọn bé cưng --</option>
                {myPets.map(pet => (
                  <option key={pet._id} value={pet._id}>{pet.name} ({pet.species === 'dog' ? 'Chó' : 'Mèo'})</option>
                ))}
              </select>
            ) : (
              <Link to="/profile" className="text-sm text-pink-500 underline">Bạn chưa có thú cưng? Thêm ngay</Link>
            )}
          </div>

          {/* Chọn ngày & giờ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={18} className="text-pink-500"/> Ngày
              </label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-200"
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={18} className="text-pink-500"/> Giờ
              </label>
              <select 
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-200"
                onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                required
              >
                <option value="">Chọn giờ</option>
                <option value="08:00 - 09:00">08:00 - 09:00</option>
                <option value="10:00 - 11:00">10:00 - 11:00</option>
                <option value="14:00 - 15:00">14:00 - 15:00</option>
                <option value="16:00 - 17:00">16:00 - 17:00</option>
              </select>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare size={18} className="text-pink-500"/> Ghi chú cho nhân viên
            </label>
            <textarea 
              placeholder="Ví dụ: Bé hơi nhát người lạ..."
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-200"
              rows="2"
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl hover:bg-pink-600 transition-all shadow-lg shadow-pink-100 uppercase"
          >
            {loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
          </button>
        </form>
      </div>
    </div>
  );
}