const axios = require('axios');
const { connectAcctWebDb, sql } = require('../../config/db');
const punycode = require('punycode2');
const { cutStr } = require('../../utils/dataTransformations');

const changeGamePassword = async (userName, newPassword) => {
    try {
        // Lấy thông tin tài khoản
        const pool = await connectAcctWebDb();
        const userResult = await pool
            .request()
            .input('userName', sql.NVarChar, userName)
            .query('SELECT LoginName FROM Users WHERE UserName = @userName');

        if (userResult.recordset.length === 0) {
            return { success: false, message: 'Không tìm thấy tài khoản.' };
        }

        const accountId = userResult.recordset[0].LoginName.split('@')[0];
        const ranId = Math.floor(Math.random() * 1000);

        // Kiểm tra trạng thái dịch vụ
        const stateResponse = await axios.get(`${process.env.SERVICE_URL}/Apps-State`);
        const resultApp = cutStr('<AppName>AuthSrv</AppName>', '</App>', stateResponse.data);
        const epoch = cutStr('<Epoch>', '</Epoch>', resultApp);

        const changeUrl = `${process.env.SERVICE_URL}/spawned/AuthSrv.1.${epoch}/account/change_login_name`;

        // Bước 1: Đổi tên đăng nhập tạm thời
        const firstChangeParams = new URLSearchParams({
            old_login_name: `${accountId}@ncsoft.com`,
            new_login_name: `${accountId}${ranId}@ncsoft.com`,
            password: newPassword,
            not_login_name_validated: 'on',
            not_kick: 'on'
        });

        const firstResponse = await axios.get(`${changeUrl}?${firstChangeParams.toString()}`);
        
        if (firstResponse.data.includes('<Reply/>')) {
            // Bước 2: Đổi tên đăng nhập về tên gốc
            const secondChangeParams = new URLSearchParams({
                old_login_name: `${accountId}${ranId}@ncsoft.com`,
                new_login_name: `${accountId}@ncsoft.com`,
                password: newPassword,
                not_login_name_validated: 'on',
                not_kick: 'on'
            });

            const secondResponse = await axios.get(`${changeUrl}?${secondChangeParams.toString()}`);

            if (secondResponse.data.includes('<Reply/>')) {
                return { success: true, message: 'Đổi mật khẩu game thành công.' };
            }

            const errorCode = cutStr('code="', '"', secondResponse.data);
            return { 
                success: false, 
                message: 'Lỗi khi đổi tên đăng nhập về tên gốc.',
                errorCode 
            };
        }

        const errorCode = cutStr('code="', '"', firstResponse.data);
        return { 
            success: false, 
            message: 'Lỗi khi đổi tên đăng nhập tạm thời.',
            errorCode
        };

    } catch (error) {
        console.error('Change Game Password Error:', error);
        return { 
            success: false, 
            message: 'Lỗi kết nối đến máy chủ game.',
            error: error.response?.data || error.message
        };
    }
};

module.exports = { changeGamePassword };
