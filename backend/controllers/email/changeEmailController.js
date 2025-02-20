const { changeEmail } = require('../../services/email/changeEmailService');

const handleChangeEmail = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const username = req.user.username;

        // Validate email mới
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmail || !emailRegex.test(newEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ.',
            });
        }

        const result = await changeEmail(username, newEmail);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Change Email Route Error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi server khi đổi email.',
        });
    }
};

module.exports = { handleChangeEmail }; 