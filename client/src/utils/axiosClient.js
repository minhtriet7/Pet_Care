import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Interceptor cho Request: Đính kèm Token vào Header
instance.interceptors.request.use(
  function (config) {
    // Lấy thông tin user từ localStorage
    const userInfo = JSON.parse(window.localStorage.getItem("userInfo"));
    
    // Nếu có userInfo và token, đính kèm vào header Authorization
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Trả về trực tiếp data
instance.interceptors.response.use(
  function (response) {
    return response.data; // axiosClient ở trang Cart của bạn đang dùng res.success, nên trả về response
  },
  function (error) {
    // Nếu lỗi 401 (Hết hạn token), có thể xóa userInfo và đẩy về trang login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("userInfo");
    }
    return Promise.reject(error);
  }
);

export default instance;