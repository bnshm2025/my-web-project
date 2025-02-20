const { sendVerificationEmail, verifyCode, sendForgotPassword } = require('../../services/email/emailService');

// Hàm xử lý gửi email xác nhận
const handleSendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email) {
        return res.status(400).json({ error: 'Email là bắt buộc.' });
    }

    try {
        // Gửi email xác nhận
        await sendVerificationEmail(email);
        res.status(200).json({ message: 'Email xác nhận đã được gửi thành công!' });
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        res.status(500).json({ error: 'Không thể gửi email xác nhận. Vui lòng thử lại sau.' });
    }
};

// Hàm xử lý xác minh mã xác nhận
const handleVerifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        // Kiểm tra code
        const isValid = await verifyCode(email, code);
        
        if (isValid) {
            res.json({
                success: true,
                message: 'Mã xác nhận chính xác!'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Mã xác nhận không chính xác!'
            });
        }
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Hàm xử lý gửi email khôi phục mật khẩu
const handleForgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email là bắt buộc.' });
    }

    try {
        const result = await sendForgotPassword(email);

        if (result.success) {
            return res.status(200).json({ message: 'Email khôi phục mật khẩu đã được gửi thành công!' });
        } else {
            return res.status(400).json({ error: result.message });
        }
    } catch (error) {
        console.error('Lỗi khi gửi email khôi phục mật khẩu:', error);
        return res.status(500).json({ error: 'Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại sau.' });
    }
};

module.exports = {
    handleSendVerificationEmail,
    handleForgotPassword,
    handleVerifyCode,
};
