const rateLimit = require('express-rate-limit');

// Tạo một hàm tiện ích để cấu hình rate limiter
const createRateLimiter = (maxRequests, windowMinutes) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000, // Đổi phút thành mili giây
        max: maxRequests, // Tối đa số yêu cầu trong khoảng thời gian
        message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.',
    });
};

module.exports = createRateLimiter;
