const express = require('express');
const {
    handleSendVerificationEmail,
    handleVerifyCode,
    handleForgotPassword,
} = require('../../controllers/email/emailController');
const createRateLimiter = require('../../utils/rateLimiter');

const router = express.Router();

// Tạo rate limiter cho endpoint gửi mã xác nhận
const limiter = createRateLimiter(5, 1); // Tối đa 5 yêu cầu mỗi phút

// Endpoint gửi email xác nhận với rate limiter
router.post('/send-verification', limiter, handleSendVerificationEmail);

// Endpoint xác minh mã xác nhận (không cần rate limiter)
router.post('/verify-code', handleVerifyCode);

// Endpoint gửi email khôi phục mật khẩu với rate limiter
router.post('/forgot-password', limiter, handleForgotPassword);

module.exports = router;
