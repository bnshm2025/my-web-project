const {
    generateVietQR,
    checkTransactionMatch,
    createPaymentOrders,
    updatePaymentOrdersStatus,
    spendHongMoonCoin,
    processPayment,
} = require('../../services/Transactions/TransactionsService');

// Hàm để tạo nội dung giao dịch ngẫu nhiên
function generateAddInfo() {
    const timestamp = Date.now().toString().slice(-6); // Lấy 6 chữ số cuối của timestamp
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase(); // Chuỗi 3 ký tự ngẫu nhiên
    return `HMC${timestamp}${randomStr}`; // Chuỗi addInfo không có dấu gạch ngang
}

// Controller để xử lý yêu cầu tạo mã QR chỉ với số tiền
async function createVietQR(req, res) {
    const { amount } = req.body;

    // Kiểm tra xem tham số amount có được gửi lên không
    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Số tiền không hợp lệ. Vui lòng nhập số tiền lớn hơn 0.' });
    }

    // Kiểm tra nếu người dùng đã đăng nhập
    if (!req.user) {
        return res.status(401).json({ error: 'Bạn cần đăng nhập để tạo mã QR.' });
    }

    // Tạo addInfo tự động
    const addInfo = generateAddInfo();

    try {
        // Gọi service để tạo mã QR
        const qrData = await generateVietQR({
            amount,
            addInfo,
            template: 'qr_only',
        });

        // Lấy thông tin người dùng
        const { id: userId, username: userName } = req.user;

        // Trả về thông tin mã QR, số tài khoản, tên tài khoản và các thông tin khác
        res.json({
            qrCode: qrData.qrCode,
            qrDataURL: qrData.qrDataURL,
            addInfo,
            amount,
            accountNo: qrData.accountNo,
            accountName: qrData.accountName,
            bankName: qrData.bankName,
            userId,
            userName,
        });
    } catch (error) {
        res.status(500).json({ error: 'Không thể tạo mã QR. Vui lòng thử lại sau.' });
    }
}

// Kiểm tra trạng thái server
function checkStatus(req, res) {
    res.send('Server is running and secure.');
}

// Hàm xử lý yêu cầu kiểm tra giao dịch
const checkTransaction = async (req, res) => {
    const { amount, addInfo } = req.body;

    if (!amount || !addInfo) {
        return res.status(400).json({ error: 'Số tiền và nội dung phải được cung cấp.' });
    }

    try {
        const transaction = await checkTransactionMatch(amount, addInfo);

        if (transaction) {
            return res.json({
                success: true,
                transaction,
            });
        } else {
            return res.json({
                success: false,
                message: 'Không tìm thấy giao dịch trùng khớp.',
            });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý giao dịch:', error);
        return res.status(500).json({ error: 'Đã xảy ra lỗi khi kiểm tra giao dịch.' });
    }
};

const createPaymentOrder = async (req, res) => {
    try {
        // Lấy dữ liệu từ body
        const { userId, userName, addInfo, amount } = req.body;

        // Kiểm tra các tham số yêu cầu
        if (!userId || !userName || !addInfo || !amount) {
            return res.status(400).json({ error: 'Thiếu thông tin yêu cầu. Vui lòng kiểm tra lại.' });
        }

        // Gọi service để tạo đơn hàng
        const { randomId, createdAt } = await createPaymentOrders(userId, userName, addInfo, amount);

        // Chuyển đổi thời gian tạo (createdAt) sang múi giờ của Việt Nam (UTC+7)
        const vietnamTime = new Date(createdAt).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh', // Chuyển sang múi giờ Việt Nam
        });

        // Trả về ID và thời gian tạo của đơn hàng mới
        res.status(201).json({
            message: 'Đơn hàng đã được tạo thành công',
            orderId: randomId, // ID đơn hàng
            createdAt: vietnamTime, // Thời gian tạo đã chuyển sang múi giờ Việt Nam
        });
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({
            message: error.message || 'Lỗi server. Vui lòng thử lại.',
        });
    }
};

// Controller để cập nhật trạng thái đơn hàng
const updatePaymentOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Kiểm tra tham số yêu cầu
        if (!orderId || !status) {
            return res.status(400).json({ error: 'Thiếu thông tin đơn hàng hoặc trạng thái.' });
        }

        // Kiểm tra trạng thái hợp lệ
        const validStatuses = ['Pending', 'Failed', 'Completed']; // Các trạng thái hợp lệ
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
        }

        // Gọi service để cập nhật trạng thái đơn hàng
        const message = await updatePaymentOrdersStatus(orderId, status);

        res.status(200).json({ message });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        res.status(500).json({ message: error.message || 'Lỗi server. Vui lòng thử lại.' });
    }
};

const handlePaymentSuccess = async (req, res) => {
    const { userId, userName, amount } = req.body;

    try {
        const response = await processPayment(userId, userName, amount);
        res.status(response.status).json({ message: response.message });
    } catch (err) {
        console.error('Error processing payment:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const spendHMCoin = async (req, res) => {
    const { userId, spendAmount } = req.body;

    try {
        const response = await spendHongMoonCoin(userId, spendAmount);
        res.status(response.status).json({ message: response.message });
    } catch (err) {
        console.error('Error processing spend request:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createVietQR,
    checkStatus,
    checkTransaction,
    createPaymentOrder,
    updatePaymentOrderStatus,
    handlePaymentSuccess,
    spendHMCoin,
};
