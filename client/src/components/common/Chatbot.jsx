import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là chuyên gia tư vấn thú y của Petcare. Bạn cần hỏi gì về chế độ dinh dưỡng hay sức khỏe của các bé ạ?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Thêm hiệu ứng đang gõ
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsTyping(true); // Hiện loadding

    // Gọi API Chatbot thật của bạn
    try {
      const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      });
      
      const data = await res.json();
      
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply || 'Xin lỗi, hiện tại tôi đang quá tải!' }]);
    } catch (error) {
      console.error("Lỗi Chatbot:", error); // <- Đã fix lỗi ESLint ở đây
      setMessages(prev => [...prev, { sender: 'bot', text: 'Lỗi kết nối đến máy chủ AI. Bạn hãy thử lại sau nhé.' }]);
    } finally {
      setIsTyping(false); // Tắt loading
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[450px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden">
          <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center"><MessageCircle size={20} className="mr-2"/> Bác sĩ Petcare AI</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-orange-600 p-1 rounded-lg transition-colors"><X size={20} /></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Hiệu ứng Bot đang rep */}
            {isTyping && (
               <div className="flex justify-start">
                 <div className="p-3 bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                    <Loader2 size={16} className="animate-spin" /> Đang suy nghĩ...
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              type="text" 
              placeholder="Nhập câu hỏi của bạn..." 
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm disabled:opacity-50" 
            />
            <button type="submit" disabled={isTyping || !input.trim()} className="bg-orange-500 text-white p-2.5 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition-colors">
              <Send size={18}/>
            </button>
          </form>
        </div>
      )}
      
      <button onClick={() => setIsOpen(!isOpen)} className="bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 float-right">
        <MessageCircle size={28} />
      </button>
    </div>
  );
}