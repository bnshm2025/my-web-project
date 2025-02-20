const bcrypt = require('bcrypt');
const { connectAcctWebDb, sql } = require('../../config/db');
const { changeGamePassword } = require('./changeGamePasswordService');

const changePassword = async (username, currentPassword, newPassword, verifyOnly = false) => {
    let pool;

    try {
        pool = await connectAcctWebDb();

        // Lấy thông tin người dùng
        const userResult = await pool
            .request()
            .input('username', sql.NVarChar, username)
            .query('SELECT UserId, WebsitePassword FROM dbo.Users WHERE UserName = @username');

        if (userResult.recordset.length === 0) {
            return { success: false, message: 'Không tìm thấy người dùng.' };
        }

        const user = userResult.recordset[0];

        // Kiểm tra mật khẩu hiện tại
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.WebsitePassword);
        if (!isPasswordMatch) {
            return { success: false, message: 'Mật khẩu hiện tại không đúng.' };
        }

        if (verifyOnly) {
            return { success: true };
        }

        // Đổi mật khẩu game trước
        const gamePasswordResult = await changeGamePassword(username, newPassword);
        if (!gamePasswordResult.success) {
            return gamePasswordResult;
        }

        // Băm mật khẩu mới cho website
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới trong database
        await pool
            .request()
            .input('userId', sql.UniqueIdentifier, user.UserId)
            .input('newPassword', sql.NVarChar, hashedNewPassword)
            .query('UPDATE dbo.Users SET WebsitePassword = @newPassword WHERE UserId = @userId');

        return { success: true, message: 'Đổi mật khẩu thành công.' };
    } catch (error) {
        console.error('Change Password Service Error:', error);
        return { success: false, message: 'Đã xảy ra lỗi khi đổi mật khẩu.' };
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

module.exports = { changePassword }; 