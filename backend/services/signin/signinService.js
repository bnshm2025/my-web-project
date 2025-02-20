const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectAcctWebDb, sql } = require('../../config/db');

const signin = async (identifier, password) => {
    let pool;

    try {
        pool = await connectAcctWebDb();

        // Kiểm tra nếu `identifier` là `email`
        const emailResult = await pool
            .request()
            .input('identifier', sql.NVarChar, identifier)
            .query('SELECT UserId, UserName, WebsitePassword FROM dbo.Users WHERE Email = @identifier');

        // Kiểm tra nếu `identifier` là `username`
        const usernameResult = await pool
            .request()
            .input('identifier', sql.NVarChar, identifier)
            .query('SELECT UserId, UserName, WebsitePassword FROM dbo.Users WHERE UserName = @identifier');

        let userRecord;
        let identifierType;

        // Xác định loại định danh và lưu thông tin người dùng (nếu có)
        if (emailResult.recordset.length > 0) {
            userRecord = emailResult.recordset[0];
            identifierType = 'email';
        } else if (usernameResult.recordset.length > 0) {
            userRecord = usernameResult.recordset[0];
            identifierType = 'username';
        } else {
            return { success: false, message: 'Sai tên đăng nhập hoặc email.' };
        }

        // Kiểm tra mật khẩu
        const isPasswordMatch = await bcrypt.compare(password, userRecord.WebsitePassword);
        if (isPasswordMatch) {
            // Tạo token JWT chứa thông tin người dùng và UserId
            const token = jwt.sign(
                { id: userRecord.UserId, username: userRecord.UserName }, // Thêm UserId vào payload
                process.env.JWT_SECRET,
                { expiresIn: '1d' }, // Token hết hạn sau 1 ngày
            );

            // Trả về token và thông tin người dùng
            return { success: true, token, userName: userRecord.UserName, userId: userRecord.UserId };
        } else {
            return { success: false, message: 'Sai mật khẩu.' };
        }
    } catch (error) {
        console.error('Signin Service: Error during signin:', error.message);
        return { success: false, message: 'An error occurred during signin.' };
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

module.exports = { signin };
