const bcrypt = require('bcrypt');
const { connectAcctWebDb, sql } = require('../../config/db');
const { changeGamePassword } = require('../../services/password/changeGamePasswordService');

const resetPassword = async (req, res) => {
    const { email, newPassword, captchaToken } = req.body;
    let pool;

    try {
        if (!captchaToken) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng xác nhận captcha.'
            });
        }

        pool = await connectAcctWebDb();

        // Lấy thông tin người dùng
        const userResult = await pool
            .request()
            .input('email', sql.NVarChar, email)
            .query('SELECT UserId, UserName FROM dbo.Users WHERE Email = @email');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản với email này.'
            });
        }

        const user = userResult.recordset[0];

        // Đổi mật khẩu game
        const gamePasswordResult = await changeGamePassword(user.UserName, newPassword);
        if (!gamePasswordResult.success) {
            return res.status(400).json(gamePasswordResult);
        }

        // Băm mật khẩu mới cho website
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới trong database
        await pool
            .request()
            .input('userId', sql.UniqueIdentifier, user.UserId)
            .input('newPassword', sql.NVarChar, hashedNewPassword)
            .query('UPDATE dbo.Users SET WebsitePassword = @newPassword WHERE UserId = @userId');

        res.json({
            success: true,
            message: 'Đặt lại mật khẩu thành công.'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đặt lại mật khẩu.'
        });
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

module.exports = { resetPassword };
