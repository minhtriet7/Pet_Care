const users = [
  {
    name: 'Admin PetCare',
    email: 'admin@gmail.com',
    password: 'password123', // Lát nữa seeder sẽ tự động mã hóa mật khẩu này
    phone: '0999999999',
    role: 'admin'
  },
  {
    name: 'Khách Hàng 1',
    email: 'khach1@gmail.com',
    password: 'password123',
    phone: '0988888888',
    role: 'customer'
  }
];

module.exports = users;