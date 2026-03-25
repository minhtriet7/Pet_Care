const express = require('express');
const router = express.Router();
const { createPaymentUrl } = require('../controllers/paymentController');

// Route này được gọi từ Checkout.jsx
router.post('/create_payment_url', createPaymentUrl);

module.exports = router;

