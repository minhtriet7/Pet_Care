require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

// Import Models (Hãy đảm bảo đường dẫn đúng với cấu trúc thư mục của bạn)
const Category = require("./models/Category");
const Product = require("./models/Product");
const Service = require("./models/Service");
const Pet = require("./models/Pet");
const User = require("./models/User"); // Giả định bạn có model User

// --- 1. KẾT NỐI MONGODB ---
mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/pet_ecommerce",
);

// --- 2. HÀM IMPORT DỮ LIỆU ---
const importData = async () => {
  try {
    console.log("⏳ Đang đọc các file JSON...");

    // Sử dụng path.join để đường dẫn an toàn hơn trên mọi hệ điều hành
    const categoriesRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "categories.json"), "utf-8"),
    );
    const productsRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "products.json"), "utf-8"),
    );
    const servicesRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "services.json"), "utf-8"),
    );
    const petsRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "pets.json"), "utf-8"),
    );

    console.log("⏳ Đang chuẩn bị và xóa dữ liệu cũ...");

    // Xóa sạch dữ liệu cũ
    await Category.deleteMany();
    await Product.deleteMany();
    await Service.deleteMany();
    await Pet.deleteMany();

    // Lấy Admin User để gán làm chủ của Pet (Giả định)
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.warn(
        "⚠️ Cảnh báo: Không tìm thấy Admin User. Vui lòng đảm bảo bảng User đã có tài khoản admin để gắn cho Pet.",
      );
    }
    const adminId = adminUser ? adminUser._id : null;

    // --- BƯỚC 1: IMPORT CATEGORIES ---
    await Category.insertMany(categoriesRaw);
    console.log("✅ Đã import Category!");

    // --- TẠO MAP CATEGORY ---
    // Điểm mấu chốt: Map cả slug cha và slug con về ObjectID của Category cha
    const categories = await Category.find({});
    const categoryMap = {};

    categories.forEach((c) => {
      // 1. Ánh xạ slug của danh mục cha
      categoryMap[c.slug] = c._id;

      // 2. Ánh xạ toàn bộ slug của danh mục con (nếu có) vào _id của danh mục cha
      if (c.subcategories && c.subcategories.length > 0) {
        c.subcategories.forEach((sub) => {
          categoryMap[sub.slug] = c._id;
        });
      }
    });

    // --- BƯỚC 2: XỬ LÝ & IMPORT PRODUCTS ---
    const finalProducts = productsRaw.map((product) => {
      const categoryId = categoryMap[product._categorySlug];
      if (!categoryId) {
        console.warn(
          `⚠️ Không tìm thấy Category/Subcategory slug '${product._categorySlug}' cho sản phẩm '${product.name}'`,
        );
      }

      // Destructuring để loại bỏ trường tạm _categorySlug khỏi object lưu vào DB
      const { _categorySlug, ...rest } = product;
      return {
        ...rest,
        category: categoryId,
      };
    });
    await Product.insertMany(finalProducts);
    console.log("✅ Đã import Product!");

    // --- BƯỚC 3: XỬ LÝ & IMPORT SERVICES ---
    const finalServices = servicesRaw.map((service) => {
      const categoryId = categoryMap[service._categorySlug];
      if (!categoryId) {
        console.warn(
          `⚠️ Không tìm thấy Category/Subcategory slug '${service._categorySlug}' cho dịch vụ '${service.name}'`,
        );
      }

      const { _categorySlug, ...rest } = service;
      return {
        ...rest,
        category: categoryId,
      };
    });
    await Service.insertMany(finalServices);
    console.log("✅ Đã import Service!");

    // --- BƯỚC 4: IMPORT PETS ---
    if (adminId) {
      const finalPets = petsRaw.map((pet) => ({
        ...pet,
        owner: adminId,
      }));
      await Pet.insertMany(finalPets);
      console.log("✅ Đã import Pet!");
    } else {
      console.log("⏭️ Bỏ qua import Pet vì không tìm thấy Admin ID.");
    }

    console.log("🎉 HOÀN TẤT IMPORT DỮ LIỆU!");
    process.exit();
  } catch (error) {
    console.error("\n❌ LỖI IMPORT DỮ LIỆU KHIẾN SCRIPT DỪNG LẠI:");

    // Nếu lỗi do gõ sai cú pháp JSON (quên dấu phẩy, ngoặc kép)
    if (error instanceof SyntaxError) {
      console.error("- Bệnh: Lỗi cú pháp trong file JSON.");
      console.error(`- Chi tiết: ${error.message}`);
      console.error(
        '- Lời khuyên: Hãy vào file JSON vừa sửa ảnh, tìm xem có thiếu dấu phẩy (,) ở cuối dòng hoặc thiếu ngoặc kép (" ") bao quanh link ảnh không.',
      );
    }
    // Nếu lỗi do Mongoose chặn lại (sai kiểu dữ liệu, thiếu trường)
    else if (error.name === "ValidationError") {
      for (let field in error.errors) {
        console.error(`- Lỗi ở trường: [${field}]`);
        console.error(`- Chi tiết: ${error.errors[field].message}`);
      }
    } else {
      console.error(error.message || error);
    }
    process.exit(1);
  }
};

// --- 3. HÀM XÓA DỮ LIỆU ---
const destroyData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    await Service.deleteMany();
    await Pet.deleteMany();

    console.log("🗑️ Đã xóa sạch dữ liệu 4 bảng!");
    process.exit();
  } catch (error) {
    console.error("❌ Lỗi Delete:", error);
    process.exit(1);
  }
};

// --- 4. CHẠY SCRIPT ---
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
