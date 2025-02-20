const axios = require('axios');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const chalk = require('chalk');
const { logData } = require('../../utils/logData');
const { cutStr } = require('../../utils/dataTransformations');
const { connectAcctWebDb } = require('../../config/db');
require('dotenv').config();

const logToConsole = process.env.LOG_TO_CONSOLE === 'true';

async function signupService(userName, email, password) {
    let pool;
    let transaction;

    try {
        // Kết nối tới cơ sở dữ liệu
        pool = await connectAcctWebDb();
        transaction = pool.transaction();
        await transaction.begin(); // Bắt đầu giao dịch

        // Tạo loginName từ userName
        const loginName = `${userName}@ncsoft.com`;

        // Kiểm tra trạng thái dịch vụ
        if (logToConsole) {
            console.log(chalk.cyan('signupService: Kiểm tra trạng thái dịch vụ'));
        }
        const response = await axios.get(`${process.env.SERVICE_URL}/Apps-State`);
        const resultApp = cutStr('<AppName>AuthSrv</AppName>', '</App>', response.data);
        const epoch = cutStr('<Epoch>', '</Epoch>', resultApp);

        // Tạo yêu cầu đăng ký
        if (logToConsole) {
            console.log(chalk.cyan('signupService: Tạo yêu cầu đăng ký'));
        }
        const postRequest = {
            loginName,
            userName,
            password,
            effectiveUntil: '',
            loginNameValidated: 1,
            userCenter: 17,
        };

        const url =
            `${process.env.SERVICE_URL}/spawned/AuthSrv.1.${epoch}/test/create_account?` +
            `loginName=${encodeURIComponent(postRequest.loginName)}&` +
            `password=${encodeURIComponent(postRequest.password)}&` +
            `userName=${encodeURIComponent(postRequest.userName)}&` +
            `userCenter=${encodeURIComponent(postRequest.userCenter)}&` +
            `effectiveUntil=${encodeURIComponent(postRequest.effectiveUntil)}&` +
            `loginNameValidated=${encodeURIComponent(postRequest.loginNameValidated)}`;

        if (logToConsole) {
            console.log(chalk.magenta('signupService: URL yêu cầu', url));
        }
        const result = await axios.get(url);

        // Lấy UserId và userCenter từ phản hồi
        const userId = cutStr('<UserId>', '</UserId>', result.data);
        const userCenter = cutStr('<UserCenter>', '</UserCenter>', result.data);

        const registrationDate = new Date();

        // Băm mật khẩu trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10); // 10 là số vòng băm

        // Thêm hoặc cập nhật thông tin người dùng trong bảng Users
        await transaction
            .request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('websitePassword', sql.NVarChar, hashedPassword)
            .input('email', sql.NVarChar, email)
            .input('loginName', sql.NVarChar, loginName).query(`
                UPDATE dbo.Users 
                SET WebsitePassword = @websitePassword, 
                    Email = @email,
                    LoginName = @loginName 
                WHERE UserId = @userId
            `);

        // Commit giao dịch nếu tất cả thành công
        await transaction.commit();

        // Ghi dữ liệu đăng ký vào file log
        logData(userName, email, userId, userCenter, registrationDate);

        if (logToConsole) {
            console.log(chalk.bgGreen('=============================================================='));
            console.log(chalk.blue('Đăng ký người dùng mới thành công:'));
            console.log(chalk.green('Tên người dùng:') + chalk.cyan(` ${userName}`));
            console.log(chalk.green('Email:') + chalk.cyan(` ${email}`));
            console.log(chalk.green('LoginName:') + chalk.cyan(` ${loginName}`));
            console.log(chalk.green('UserId:') + chalk.cyan(` ${userId}`));
            console.log(chalk.green('UserCenter:') + chalk.cyan(` ${userCenter}`));
            console.log(chalk.green('Ngày đăng ký:') + chalk.cyan(` ${registrationDate}`));
            console.log(chalk.bgGreen('=============================================================='));
        }

        return {
            success: true,
            message: `Chúc mừng ${userName}! Bạn đã đăng ký thành công trên máy chủ của chúng tôi.`,
        };
    } catch (err) {
        // Rollback giao dịch nếu xảy ra lỗi
        if (transaction) {
            await transaction.rollback();
        }

        if (logToConsole) {
            console.error(chalk.red('signupService: Lỗi trong quá trình đăng ký:', err.response?.data || err.message));
        }
        throw new Error('Đã xảy ra lỗi trong quá trình đăng ký.');
    } finally {
        // Đảm bảo đóng kết nối cơ sở dữ liệu
        if (pool) {
            pool.close();
        }
    }
}

module.exports = {
    signupService,
};
