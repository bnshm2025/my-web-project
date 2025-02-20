const axios = require('axios');
const { connectBNSWebDb, sql } = require('../../config/db');
require('dotenv').config();
const moment = require('moment-timezone');

const bankMapping = {
    970422: 'MB Bank',
};

// Hàm để tạo mã QR từ API VietQR.io
async function generateVietQR({ amount, addInfo, template, userId, userName }) {
    try {
        // Lấy các giá trị từ môi trường (tệp .env)
        const accountNo = process.env.ACCOUNT_NO;
        const accountName = process.env.ACCOUNT_NAME;
        const acqId = process.env.ACQ_ID;

        // Gửi yêu cầu tới API VietQR
        const response = await axios.post(
            'https://api.vietqr.io/v2/generate',
            {
                accountNo,
                accountName,
                acqId,
                amount,
                addInfo,
                template: 'qr_only', // Mẫu QR mặc định
            },
            {
                headers: {
                    'x-client-id': process.env.CLIENT_ID_QR, // Lấy client id từ .env
                    'x-api-key': process.env.API_KEY, // Lấy API key từ .env
                    'Content-Type': 'application/json',
                },
            },
        );

        const bankName = bankMapping[acqId] || 'Ngân hàng không xác định';

        // Trả về dữ liệu mã QR, thông tin tài khoản, thông tin người dùng
        return {
            accountNo,
            accountName,
            bankName,
            qrCode: response.data.data.qrCode, // Mã QR
            qrDataURL: response.data.data.qrDataURL, // URL mã QR
            userId, // Thêm userId của người tạo mã
            userName, // Thêm userName của người tạo mã
        };
    } catch (error) {
        console.error('Lỗi khi gọi API VietQR:', error.message);
        throw new Error('Không thể tạo mã QR');
    }
}

// Hàm gọi API để lấy dữ liệu giao dịch
const fetchTransactionData = async () => {
    try {
        const response = await axios.get(
            'https://script.googleusercontent.com/macros/echo?user_content_key=qGJ-MPIr00OFDEe3dl5jWO-PAnD4bBGliV0UcRfSYt0dFM9QUHL4hnhvQFkHaerZp8eDoE49SUwWGghKNlUsbHs7oDw3H6cum5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnJjzfxYWt0CZBGfo6MZXr1HA59DFPPUJcs9AauIL-ubKOyAzdPZdO92rOrBF-Sa6A0Y6ZxkJUFm_HwEWH-MysZmP3UV7VMxepg&lib=MtiMdkoymVZ63qseutCKg4dagCCj8MHnP',
        );
        return response.data.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw new Error('Không thể lấy dữ liệu giao dịch.');
    }
};

// Hàm kiểm tra giao dịch có trùng khớp với số tiền và nội dung không
const checkTransactionMatch = async (amount, addInfo) => {
    const transactions = await fetchTransactionData();

    // Tìm giao dịch trùng khớp
    const matchedTransaction = transactions.find((transaction) => {
        return transaction['Giá trị'] === amount && transaction['Mô tả'].includes(addInfo);
    });

    return matchedTransaction || null;
};

// Hàm tạo đơn hàng
const createPaymentOrders = async (userId, userName, addInfo, amount) => {
    try {
        const pool = await connectBNSWebDb();

        // Tạo ID ngẫu nhiên 6 chữ số
        let randomId;
        let isIdUnique = false;

        // Kiểm tra ID cho đến khi tìm được ID duy nhất
        while (!isIdUnique) {
            randomId = Math.floor(Math.random() * 900000) + 100000; // Tạo số ngẫu nhiên từ 100000 đến 999999

            // Kiểm tra ID có trùng không
            const checkIdResult = await pool.request().input('id', sql.Int, randomId).query(`
                SELECT COUNT(*) AS count FROM PaymentOrders WHERE id = @id
            `);

            if (checkIdResult.recordset[0].count === 0) {
                // Nếu không trùng, ID hợp lệ
                isIdUnique = true;
            }
        }

        // Chuyển đổi thời gian hiện tại sang múi giờ Việt Nam (UTC+7)
        const createdAt = moment().tz('Asia/Ho_Chi_Minh').toISOString();

        // Chèn đơn hàng vào bảng
        const result = await // Lưu thời gian dưới dạng DateTime
        pool
            .request()
            .input('id', sql.Int, randomId)
            .input('userId', sql.UniqueIdentifier, userId)
            .input('userName', sql.NVarChar, userName)
            .input('addInfo', sql.NVarChar, addInfo)
            .input('amount', sql.Int, amount)
            .input('status', sql.NVarChar, 'Pending')
            .input('createdAt', sql.DateTime, new Date(createdAt)) // Chuyển chuỗi ISO thành Date object
            .query(`
                INSERT INTO PaymentOrders (id, userId, userName, addInfo, amount, status, createdAt)
                VALUES (@id, @userId, @userName, @addInfo, @amount, @status, @createdAt);
            `);

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return { randomId, createdAt };
        } else {
            throw new Error('Không có dữ liệu trả về từ câu truy vấn.');
        }
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        throw new Error('Không thể tạo đơn hàng. Lỗi: ' + error.message);
    }
};

// Service để cập nhật trạng thái đơn hàng
const updatePaymentOrdersStatus = async (orderId, status) => {
    try {
        const pool = await connectBNSWebDb();

        // Kiểm tra sự tồn tại và trạng thái hiện tại của đơn hàng
        const checkOrderResult = await pool.request().input('orderId', sql.Int, orderId).query(`
                SELECT status FROM PaymentOrders WHERE id = @orderId
            `);

        // Nếu đơn hàng không tồn tại, báo lỗi
        if (checkOrderResult.recordset.length === 0) {
            throw new Error('Đơn hàng không tồn tại.');
        }

        const currentStatus = checkOrderResult.recordset[0].status;

        // Chỉ cập nhật trạng thái nếu trạng thái mới khác với trạng thái hiện tại
        if (currentStatus === status) {
            return 'Không có thay đổi nào được thực hiện (trạng thái đã giống nhau).';
        }

        // Cập nhật trạng thái đơn hàng
        const result = await pool.request().input('orderId', sql.Int, orderId).input('status', sql.NVarChar, status)
            .query(`
                UPDATE PaymentOrders
                SET status = @status
                WHERE id = @orderId;
            `);

        // Kiểm tra nếu trạng thái đã được cập nhật thành công
        if (result.rowsAffected[0] > 0) {
            return 'Trạng thái đơn hàng đã được cập nhật.';
        } else {
            throw new Error('Không có thay đổi nào được thực hiện.');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error.message);
        throw new Error('Không thể cập nhật trạng thái đơn hàng. Lỗi: ' + error.message);
    }
};

const processPayment = async (userId, userName, amount) => {
    if (!userId || !userName || !amount) {
        return { status: 400, message: 'Missing required fields' };
    }

    const hongMoonCoin = Math.floor(amount / 1000);

    try {
        // Kết nối cơ sở dữ liệu
        await connectBNSWebDb();

        const result = await sql.query`SELECT * FROM HMCoin WHERE UserId = ${userId}`;

        if (result.recordset.length > 0) {
            // Người dùng đã tồn tại, cộng số tiền mới vào tổng số tiền cũ
            const user = result.recordset[0];
            const newTotal = user.Total + hongMoonCoin;

            // Cập nhật lại số tiền vào cơ sở dữ liệu
            await sql.query`
                UPDATE HMCoin
                SET HongMoonCoin = ${user.HongMoonCoin + hongMoonCoin}, Total = ${newTotal}
                WHERE UserId = ${userId}
            `;

            return { status: 200, message: 'Payment successful, balance updated' };
        } else {
            // Nếu người dùng chưa tồn tại trong bảng, thêm mới
            const newTotal = hongMoonCoin;

            await sql.query`
                INSERT INTO HMCoin (UserId, UserName, HongMoonCoin, Total)
                VALUES (${userId}, ${userName}, ${hongMoonCoin}, ${newTotal})
            `;

            return { status: 201, message: 'Payment successful, new user added' };
        }
    } catch (err) {
        console.error('Error processing payment:', err);
        throw new Error('Error processing payment');
    }
};

const spendHongMoonCoin = async (userId, spendAmount) => {
    if (!userId || !spendAmount || spendAmount <= 0) {
        return { status: 400, message: 'Missing required fields or invalid spendAmount' };
    }

    try {
        // Kết nối cơ sở dữ liệu
        await connectBNSWebDb();

        const result = await sql.query`SELECT * FROM HMCoin WHERE UserId = ${userId}`;

        if (result.recordset.length === 0) {
            return { status: 404, message: 'User not found' };
        }

        const user = result.recordset[0];

        if (user.HongMoonCoin < spendAmount) {
            return {
                status: 400,
                message: `Insufficient HongMoonCoin balance. You have ${user.HongMoonCoin} HMCoin, but tried to spend ${spendAmount} HMCoin.`,
            };
        }

        const newHongMoonCoin = user.HongMoonCoin - spendAmount;

        // Cập nhật lại số tiền vào cơ sở dữ liệu
        await sql.query`
            UPDATE HMCoin
            SET HongMoonCoin = ${newHongMoonCoin}
            WHERE UserId = ${userId}
        `;

        return {
            status: 200,
            message: `Successfully spent ${spendAmount} HMCoin. New HongMoonCoin balance: ${newHongMoonCoin}`,
        };
    } catch (err) {
        console.error('Error processing spend request:', err);
        throw new Error('Error processing spend request');
    }
};

module.exports = {
    generateVietQR,
    checkTransactionMatch,
    createPaymentOrders,
    updatePaymentOrdersStatus,
    processPayment,
    spendHongMoonCoin,
};
