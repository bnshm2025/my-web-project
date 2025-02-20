const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Lấy token từ cookie
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Không tìm thấy token xác thực.' 
        });
    }

    try {
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Lưu thông tin user vào request để sử dụng ở các middleware tiếp theo
        req.user = {
            id: decoded.id,
            username: decoded.username
        };
        
        next();
    } catch (error) {
        console.error('Token Authentication Error:', error);
        return res.status(403).json({ 
            success: false, 
            message: 'Token không hợp lệ hoặc đã hết hạn.' 
        });
    }
};

module.exports = authenticateToken; 