const sql = require('mssql');
const { connectAcctWebDb } = require('../../config/db');

async function checkAccountNameAvailability(accountName) {
    const pool = await connectAcctWebDb();
    try {
        const result = await pool
            .request()
            .input('accountName', sql.NVarChar, accountName)
            .query('SELECT COUNT(*) AS count FROM dbo.Users WHERE UserName = @accountName');
        return result.recordset[0].count > 0; // Trả về true nếu tên tài khoản đã tồn tại
    } finally {
        await pool.close();
    }
}

async function checkEmailAvailability(email) {
    const pool = await connectAcctWebDb();
    try {
        const result = await pool
            .request()
            .input('email', sql.NVarChar, email)
            .query('SELECT COUNT(*) AS count FROM dbo.Users WHERE Email = @email');
        return result.recordset[0].count > 0; // Trả về true nếu email đã tồn tại
    } finally {
        await pool.close();
    }
}

module.exports = { checkAccountNameAvailability, checkEmailAvailability };
