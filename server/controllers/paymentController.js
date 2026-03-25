const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");

exports.createPaymentUrl = (req, res) => {
  // Đã thay mã TmnCode và HashSecret của bạn vào đây
  let tmnCode = "V07SEF58";
  let secretKey = "1G9KX3BW8H4V4M44XB07XNRAD5CLY15M";
  let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  let returnUrl = "http://localhost:5173/vnpay-return";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");
  let orderId = moment(date).format("DDHHmmss");

  // Lấy IP của khách hàng (Bắt buộc với VNPay)
  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  let amount = req.body.amount;

  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang " + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100; // VNPay quy định phải nhân 100
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;

  vnp_Params = sortObject(vnp_Params);

  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

  res.status(200).json({ success: true, url: vnpUrl });
};

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
