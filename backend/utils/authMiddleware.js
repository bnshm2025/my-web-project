const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Lấy token từ header 'Authorization' hoặc cookie 'authToken'
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1]; // Token từ header Authorization
    const tokenFromCookie = req.cookies.authToken; // Token từ cookie (nếu có)

    // Chọn token hợp lệ từ header hoặc cookie
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) return res.sendStatus(401); // Nếu không có token, trả về 401 (Unauthorized)

    // Xác thực token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); //Nếu token không hợp lệ, trả về 403 (Forbidden)
        req.user = user; // Gắn thông tin người dùng đã xác thực vào req
        next(); // Chuyển tiếp xử lý tới middleware hoặc route tiếp theo
    });
}

function redirectIfAuthenticated(req, res, next) {
    const token = req.cookies.authToken;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err) => {
            if (!err) {
                return res.redirect('/'); // Redirect về trang chính nếu đã đăng nhập
            }
            next();
        });
    } else {
        next();
    }
}

module.exports = { authenticateToken, redirectIfAuthenticated };
