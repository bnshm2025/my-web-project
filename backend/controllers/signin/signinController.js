const { signin } = require('../../services/signin/signinService');
const jwt = require('jsonwebtoken');

const signinController = async (req, res) => {
    const { identifier, signin_password } = req.body;
    const result = await signin(identifier, signin_password);

    if (result.success) {
        // Tạo token JWT thực tế chứa thông tin người dùng
        const token = jwt.sign(
            { id: result.userId, username: result.userName }, // Sử dụng result.userId thay vì result.id
            process.env.JWT_SECRET,
            { expiresIn: '1d' }, // Token hết hạn sau 1 ngày
        );

        // Thiết lập cookie chứa token JWT
        res.cookie('authToken', token, {
            httpOnly: false, // Cookie không thể truy cập qua JavaScript
            secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS trong môi trường production
            sameSite: 'Strict', // Ngăn chặn CSRF
            maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie (1 ngày)
        });

        // Trả về response với thông tin người dùng và token
        res.status(200).json({
            message: 'Đăng nhập thành công',
            userId: result.userId, // Trả về UserId từ kết quả đăng nhập
            userName: result.userName, // Trả về UserName
            token, // Trả về token JWT
        });
    } else {
        res.status(401).json({ message: result.message });
    }
};

module.exports = { signinController };
