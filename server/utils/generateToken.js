const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Tạo token chứa payload là 'id' của user, ký bằng JWT_SECRET và có hạn 30 ngày
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;