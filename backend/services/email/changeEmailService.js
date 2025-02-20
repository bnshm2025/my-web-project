const { connectAcctWebDb, sql } = require('../../config/db');

const changeEmail = async (username, newEmail) => {
    let pool;

    try {
        pool = await connectAcctWebDb();

        // Kiểm tra email mới đã tồn tại chưa
        const emailCheckResult = await pool
            .request()
            .input('email', sql.NVarChar, newEmail)
            .query('SELECT UserId FROM dbo.Users WHERE Email = @email');

        if (emailCheckResult.recordset.length > 0) {
            return { success: false, message: 'Email này đã được sử dụng.' };
        }

        // Lấy thông tin người dùng
        const userResult = await pool
            .request()
            .input('username', sql.NVarChar, username)
            .query('SELECT UserId FROM dbo.Users WHERE UserName = @username');

        if (userResult.recordset.length === 0) {
            return { success: false, message: 'Không tìm thấy người dùng.' };
        }

        const user = userResult.recordset[0];

        // Cập nhật email mới
        await pool
            .request()
            .input('userId', sql.UniqueIdentifier, user.UserId)
            .input('newEmail', sql.NVarChar, newEmail)
            .query('UPDATE dbo.Users SET Email = @newEmail WHERE UserId = @userId');

        return { success: true, message: 'Đổi email thành công.' };
    } catch (error) {
        console.error('Change Email Service Error:', error);
        return { success: false, message: 'Đã xảy ra lỗi khi đổi email.' };
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

module.exports = { changeEmail }; 