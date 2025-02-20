const { changePassword } = require('../../services/password/changePasswordService');

const handleChangePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const username = req.user.username;

        // Validate mật khẩu mới
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
            });
        }

        const result = await changePassword(username, currentPassword, newPassword);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Change Password Route Error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi server khi đổi mật khẩu.',
        });
    }
};

const handleVerifyCurrentPassword = async (req, res) => {
    const { currentPassword } = req.body;
    const username = req.user.username;

    try {
        const result = await changePassword(username, currentPassword, null, true);
        res.json({ isValid: result.success });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi kiểm tra mật khẩu.' });
    }
};

module.exports = {
    handleChangePassword,
    handleVerifyCurrentPassword,
};
