const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo SDK với API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askChatbot = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Chọn model (gemini-1.5-flash phù hợp cho chat nhanh)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Cấp "ngữ cảnh" để AI đóng vai bác sĩ thú y / nhân viên tư vấn
    const systemInstruction = "Bạn là chuyên gia tư vấn chăm sóc chó mèo của cửa hàng PetCare. Hãy trả lời ngắn gọn, thân thiện và hữu ích.";
    const fullPrompt = `${systemInstruction}\n\nKhách hàng hỏi: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    res.status(200).json({ reply: responseText });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi gọi Chatbot', error: error.message });
  }
};

module.exports = { askChatbot };