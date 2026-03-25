import React, { useState, useRef, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import MarkdownFormatter from "./MarkdownFormatter";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Chào bạn! Mình là trợ lý ảo của PetCare. Mình có thể giúp gì cho bạn hôm nay? (Ví dụ: Hỏi giá thức ăn cho mèo, dịch vụ tắm tỉa...)",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const  data  = await axiosClient.post("/chatbot", {
        message: userMsg,
      });
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Xin lỗi, hệ thống AI đang quá tải. Bạn vui lòng liên hệ hotline nhé!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút bật/tắt Chatbot */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div
          /* - Thêm 'resize' để cho phép kéo giãn ở góc phải dưới
            - Đặt w, h mặc định, kèm theo min-w, max-w, min-h, max-h để giới hạn tỉ lệ
          */
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 resize w-[350px] sm:w-[400px] h-[500px] min-w-[300px] max-w-[90vw] min-h-[400px] max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-pink-500 text-white p-4 flex justify-between items-center shrink-0">
            <h3 className="font-bold flex items-center gap-2">
              <span className="text-xl">🐶</span> PetCare AI
            </h3>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body tin nhắn */}
          {/* Đổi h-[400px] thành flex-1 để tự động chiếm phần không gian còn lại khi khung chat bị kéo */}
          <div className="p-4 flex-1 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Thêm class 'break-words' vào đây để chữ quá dài tự động rớt dòng */}
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-sm break-words ${
                    msg.sender === "user"
                      ? "bg-pink-500 text-white rounded-br-none whitespace-pre-line"
                      : "bg-gray-200 text-gray-800 rounded-bl-none prose prose-sm max-w-none"
                  }`}
                >
                  {msg.sender === "user" ? (
                    msg.text
                  ) : (
                    <MarkdownFormatter value={msg.text} />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 p-3 rounded-lg rounded-bl-none text-sm animate-pulse">
                  Đang gõ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={sendMessage}
            className="p-3 bg-white border-t border-gray-200 flex items-end gap-2 shrink-0"
          >
            <textarea
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-none min-h-[42px] max-h-28 overflow-y-auto leading-relaxed"
              placeholder="Nhập câu hỏi... (Shift + Enter để xuống dòng)"
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Trick để textarea tự động giãn chiều cao theo nội dung
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 112) + "px"; // 112px tương đương max-h-28
              }}
              onKeyDown={(e) => {
                // Nhấn Enter (không giữ Shift) để gửi
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Ngăn chặn việc tạo dòng mới
                  if (input.trim() && !isLoading) {
                    sendMessage(e);
                    // Reset lại chiều cao về mặc định sau khi gửi
                    e.target.style.height = "auto";
                  }
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-pink-500 text-white px-4 h-[42px] rounded-lg hover:bg-pink-600 disabled:bg-gray-400 transition-colors shrink-0 flex items-center justify-center"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
