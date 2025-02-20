const {
    checkUserId,
    getUsernameByUserId,
    getDepositData,
    sendExternalServiceRequest,
} = require('../../services/accountsmanager/addDepositService')
// Lấy thông tin khoản nạp
async function getDepositInfo(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'Thiếu giá trị userId' });
    }

    try {
        // Kiểm tra sự tồn tại của userId
        const userExists = await checkUserId(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User ID không tồn tại.' });
        }

        // Lấy thông tin username và khoản nạp
        const username = await getUsernameByUserId(userId);
        if (!username) {
            return res.status(404).json({ message: 'Không tìm thấy tên người dùng.' });
        }

        const depositData = await getDepositData(userId);

        res.status(200).json({
            userId,
            username,
            totalBalance: depositData.totalBalance,
            totalAmount: depositData.totalAmount,
            deposits: depositData.deposits,
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin khoản nạp:', error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu khoản nạp.' });
    }
}

// Xử lý thêm khoản nạp
async function addDeposit(req, res) {
    const { amount, game_account_id } = req.body;

    if (!amount || isNaN(amount) || !game_account_id) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    }

    try {
        // Kiểm tra sự tồn tại của userId
        const userExists = await checkUserId(game_account_id);
        if (!userExists) {
            return res.status(404).json({ message: 'User ID không tồn tại.' });
        }

        // Gửi yêu cầu thêm khoản nạp
        await sendExternalServiceRequest(amount, game_account_id);

        // Lấy thông tin khoản nạp sau khi thêm thành công
        const depositData = await getDepositData(game_account_id);

        res.status(200).json({
            message: 'Khoản nạp đã được thêm thành công!',
            totalBalance: depositData.totalBalance,
            totalAmount: depositData.totalAmount,
        });
    } catch (error) {
        console.error('Lỗi khi thêm khoản nạp:', error);
        res.status(500).json({ message: 'Lỗi khi thêm khoản nạp.' });
    }
}

module.exports = {
    getDepositInfo,
    addDeposit,
};
