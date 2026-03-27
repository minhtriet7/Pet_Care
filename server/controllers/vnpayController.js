const crypto = require("crypto");
const qs = require("qs");
// Nếu bạn dùng model Booking để lưu đơn sân, thì import vào (Nhớ sửa lại đường dẫn cho đúng nha)
// const Booking = require("../models/Booking"); 

// Hàm phụ trợ: Sắp xếp object theo đúng chuẩn chữ cái (VNPAY bắt buộc phải có cái này)
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// 1. API TẠO ĐƯỜNG LINK THANH TOÁN
exports.createPaymentUrl = async (req, res) => {
  try {
    const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "127.0.0.1";
    
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    // Lấy thông tin từ Frontend gửi lên (Ví dụ: ID đơn đặt sân, tổng tiền)
    const { orderId, amount, bankCode } = req.body;

    // Format ngày tháng theo chuẩn yyyyMMddHHmmss
    const date = new Date();
    const createDate = date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId; // Mã đơn hàng (Phải duy nhất)
    vnp_Params["vnp_OrderInfo"] = "Thanh toan don dat san: " + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100; // VNPAY yêu cầu nhân 100
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode; // Nếu user chọn sẵn ngân hàng
    }

    // Sắp xếp dữ liệu và tạo chữ ký (Signature)
    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
    
    // Đính kèm chữ ký vào URL
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

    // Trả cái link VNPAY xịn xò này về cho Frontend
    res.status(200).json({ paymentUrl: vnpUrl });
  } catch (error) {
    console.error("Lỗi tạo URL VNPAY:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 2. API NHẬN THÔNG BÁO NGẦM TỪ VNPAY (IPN URL)
// Chỗ này cực kỳ quan trọng: VNPAY sẽ gọi API này để báo kết quả!
exports.vnpayIpn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    // Bỏ 2 trường này ra trước khi verify chữ ký
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      // 👇👇👇 XỬ LÝ DATABASE Ở ĐÂY 👇👇👇
      // 1. Tìm đơn hàng (Booking) trong Database bằng cái orderId
      // const booking = await Booking.findById(orderId);
      
      // 2. Kiểm tra xem đơn hàng đã được thanh toán trước đó chưa
      // if (booking.isPaid) return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });

      if (rspCode === "00") {
        // Giao dịch thành công
        // await Booking.findByIdAndUpdate(orderId, { isPaid: true, status: 'Đã thanh toán' });
        console.log(`✅ Đơn ${orderId} thanh toán THÀNH CÔNG!`);
      } else {
        // Giao dịch thất bại
        // await Booking.findByIdAndUpdate(orderId, { status: 'Thất bại' });
        console.log(`❌ Đơn ${orderId} thanh toán THẤT BẠI!`);
      }

      // Trả lời cho VNPAY biết là "Tao nhận được thông tin rồi, đừng gửi nữa"
      res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
    }
  } catch (error) {
    console.error("Lỗi IPN VNPAY:", error);
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};