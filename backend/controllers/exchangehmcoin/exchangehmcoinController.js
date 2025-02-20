const { processDeposit, checkUserIdExistence } = require('../../services/exchangehmcoin/exchangehmcoinService.js');

// Tích hợp tất cả và trả về JSON
async function processDepositRequest(req, res) {
    const amount = req.body.amount;
    const game_account_id = req.body.game_account_id;

    // Kiểm tra đầu vào
    if (!amount || isNaN(amount) || !game_account_id || game_account_id.trim() === '') {
        return res.status(400).json({ error: 'Amount hoặc Game Account ID không thể để trống.' });
    }
    try {
        // Kiểm tra sự tồn tại của userId
        const userExists = await checkUserIdExistence(game_account_id);
        if (!userExists) {
            return res.status(404).json({ error: 'User ID không tìm thấy trong PlatformAcctDb.' });
        }

        // Gửi yêu cầu deposit
        const depositResult = await processDeposit(game_account_id, amount);

        // Kiểm tra kết quả yêu cầu deposit
        if (depositResult.success) {
            return res.json({
                success: true,
                message: 'Yêu cầu deposit đã được xử lý thành công.',
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi gửi yêu cầu deposit.',
                error: depositResult.error || 'Không có thông tin lỗi chi tiết.',
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Đã xảy ra lỗi khi xử lý yêu cầu.' });
    }
}

module.exports = { processDepositRequest };
