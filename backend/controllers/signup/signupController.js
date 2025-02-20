const chalk = require('chalk');
const { signupService } = require('../../services/signup/signupService');

// Check environment variable for console logging
const logToConsole = process.env.LOG_TO_CONSOLE === 'true';

async function signupController(req, res) {
    const { userName: accountName, email, password } = req.body;

    // Ghi log yêu cầu
    if (logToConsole) {
        console.log(chalk.yellow(`POST /signup: Received data - Username: ${accountName}, Email: ${email}`));
    }

    // Kiểm tra dữ liệu đầu vào
    if (!accountName || !email || !password) {
        if (logToConsole) {
            console.error(chalk.red('POST /signup: Invalid request data - Missing username, email, or password.'));
        }
        return res.status(400).json({
            success: false,
            error: 'Tên tài khoản, email và mật khẩu không được để trống.',
        });
    }

    try {
        // Gọi service đăng ký
        const result = await signupService(accountName, email, password);

        if (logToConsole) {
            console.log(chalk.blue('POST /signup: Registration successful.'));
        }

        // Gửi phản hồi thành công
        return res.status(201).json({
            success: true,
            message: result.message,
        });
    } catch (err) {
        // Xử lý lỗi trong quá trình đăng ký
        if (logToConsole) {
            console.error(chalk.red(`POST /signup: Error during registration: ${err.message}`));
        }

        // Phản hồi lỗi chi tiết dựa trên loại lỗi
        if (err.message.includes('Email này đã tồn tại')) {
            return res.status(409).json({
                success: false,
                error: 'Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.',
            });
        }

        if (err.message.includes('Dịch vụ không trả về trạng thái hợp lệ')) {
            return res.status(503).json({
                success: false,
                error: 'Dịch vụ đăng ký hiện không khả dụng. Vui lòng thử lại sau.',
            });
        }

        // Lỗi không xác định
        return res.status(500).json({
            success: false,
            error: 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.',
        });
    }
}

module.exports = {
    signupController,
};
