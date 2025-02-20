const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const logDirectory = path.resolve('logs');
const logFilePath = path.join(logDirectory, 'đăng kí.log');

function ensureLogFileExists() {
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, ''); // Tạo file rỗng nếu chưa tồn tại
    }
}

function formatDate(date) {
    // Kiểm tra nếu `date` hợp lệ trước khi định dạng
    if (!date) return 'N/A';

    const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

    const formattedDate = new Date(date).toLocaleDateString('vi-VN', optionsDate);
    const formattedTime = new Date(date).toLocaleTimeString('vi-VN', optionsTime);

    return `${formattedDate} ${formattedTime}`;
}

function logData(accountName, email, userId, userCenter, registrationDate) {
    ensureLogFileExists();

    // Định dạng ngày tháng
    const formattedDate = formatDate(registrationDate);

    const logMessage = `
    ==================== User Registration ====================
    Tên người dùng: ${accountName}
    Email: ${email}
    UserId: ${userId}
    UserCenter: ${userCenter}
    Ngày đăng ký: ${formattedDate}
    ==========================================================
    `;

    // Đọc nội dung file log hiện tại
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(chalk.red('Lỗi khi đọc file log:', err));
            return;
        }

        // Ghi log mới lên đầu và giữ lại nội dung cũ
        const updatedLog = logMessage + data;
        fs.writeFile(logFilePath, updatedLog, (err) => {
            if (err) {
                console.error(chalk.red('Lỗi khi ghi vào file log:', err));
            } else {
                console.log(chalk.green('Dữ liệu đăng ký đã được ghi vào file log thành công.'));
            }
        });
    });
}

module.exports = { logData };
