const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");
const Service = require("../models/Service");
const Pet = require("../models/Pet");

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askChatbot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Vui lòng nhập câu hỏi" });
    }

    // 1. TRUY XUẤT DỮ LIỆU TỪ DATABASE
    // Lấy top 30 sản phẩm (có thể tùy chỉnh)
    const products = await Product.find({})
      .select("name price discountPrice stock attributes brand")
      .limit(30);

    // Lấy tất cả dịch vụ và các mức giá
    const services = await Service.find({}).select(
      "name basePrice priceVariations duration description",
    );

    // Lấy danh sách thú cưng đang bán
    const petsForSale = await Pet.find({ forSale: true }).select(
      "name species breed age gender price",
    );

    // 2. XÂY DỰNG "BỘ NÃO" CHO AI (SYSTEM INSTRUCTION)
    let systemInstruction = `Bạn tên là "PetCare AI", một trợ lý ảo thân thiện, chuyên nghiệp và đáng yêu của hệ thống chăm sóc thú cưng PetCare. 
    Nhiệm vụ của bạn là tư vấn cho khách hàng dựa trên dữ liệu thực tế của cửa hàng dưới đây.
    
    THÔNG TIN CỬA HÀNG PETCARE:
    - Chuyên: Bán sản phẩm thú cưng, cung cấp dịch vụ Spa/Khám bệnh, và bán thú cưng.
    - Phương thức thanh toán hỗ trợ: Tiền mặt khi nhận hàng (COD), VNPAY, Ví Momo.
    - Đặt lịch hẹn: Khách hàng có thể đặt lịch dịch vụ trực tiếp trên website (chọn ngày, giờ và nhân viên).

    DỮ LIỆU SẢN PHẨM HIỆN CÓ:
    `;

    // Đổ dữ liệu Sản phẩm
    products.forEach((p) => {
      const priceStr = p.discountPrice
        ? `${p.discountPrice} (giảm từ ${p.price})`
        : `${p.price}`;
      const stockStr = p.stock > 0 ? `Còn ${p.stock}` : "Hết hàng";
      const attrStr = p.attributes
        ? `[${p.attributes.weight || ""} ${p.attributes.flavor || ""} ${p.attributes.lifestage || ""}]`
        : "";
      systemInstruction += `- ${p.name} (Hãng: ${p.brand || "N/A"}) ${attrStr} | Giá: ${priceStr} VNĐ | Tình trạng: ${stockStr}\n`;
    });

    systemInstruction += `\nDỮ LIỆU DỊCH VỤ SPA & THÚ Y:
    `;

    // Đổ dữ liệu Dịch vụ
    services.forEach((s) => {
      let variationStr = "";
      if (s.priceVariations && s.priceVariations.length > 0) {
        variationStr =
          " (Phụ thu: " +
          s.priceVariations
            .map((v) => `${v.condition}: ${v.price}`)
            .join(", ") +
          ")";
      }
      systemInstruction += `- ${s.name} | Giá cơ bản: ${s.basePrice} VNĐ ${variationStr} | Thời gian: ${s.duration} phút | Mô tả: ${s.description}\n`;
    });

    systemInstruction += `\nDANH SÁCH THÚ CƯNG ĐANG TÌM CHỦ (ĐANG BÁN):
    `;

    // Đổ dữ liệu Thú cưng
    if (petsForSale.length > 0) {
      petsForSale.forEach((pet) => {
        const ageStr = pet.age ? `${pet.age} tháng tuổi` : "Không rõ tuổi";
        const genderStr =
          pet.gender === "male"
            ? "Đực"
            : pet.gender === "female"
              ? "Cái"
              : "Không rõ";
        systemInstruction += `- Bé ${pet.name} | Giống: ${pet.breed} (${pet.species}) | Giới tính: ${genderStr} | Tuổi: ${ageStr} | Giá: ${pet.price} VNĐ\n`;
      });
    } else {
      systemInstruction += `- Hiện tại cửa hàng đã bán hết thú cưng, khách có thể theo dõi thêm vào đợt sau.\n`;
    }

    // 3. QUY TẮC TRẢ LỜI CỦA AI
    systemInstruction += `\nQUY TẮC TRẢ LỜI:
    1. Chỉ trả lời dựa trên dữ liệu được cung cấp ở trên.
    2. Nếu khách hỏi sản phẩm/dịch vụ/thú cưng KHÔNG CÓ trong danh sách, hãy nói: "Dạ hiện tại PetCare không có thông tin về sản phẩm/dịch vụ này, bạn tham khảo các mục khác giúp mình nhé!".
    3. Trả lời thân thiện, có thể dùng emoji như 🐶, 🐱, ✨.
    4. Định dạng văn bản bằng Markdown (dùng in đậm **chữ** cho các thông tin quan trọng như tên, giá).
    5. Luôn định dạng số tiền có dấu chấm (VD: 150.000 VNĐ).
    `;

    // 4. GỌI GEMINI API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${systemInstruction}\n\nKhách hàng hỏi: "${message}"\nPetCare AI trả lời:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
console.log("text", text);
    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Lỗi Chatbot:", error);
    return res
      .status(500)
      .json({
        message: "Hệ thống chatbot đang bảo trì, vui lòng thử lại sau.",
      });
  }
};

module.exports = { askChatbot };
