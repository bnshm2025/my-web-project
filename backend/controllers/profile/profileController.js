const {
    getUserByUsername,
    getCreaturesByUserId,
    getDepositsByUserId,
    getHMCoinByUserId,
    getTransactionHistoryByUserId,

    deleteFailedPayments,
} = require('../../services/profile/profileService');
const cron = require('node-cron');

async function getProfile(req, res) {
    const { userName } = req.query;

    if (req.user.username !== userName) {
        return res.status(403).json({ message: 'Không có quyền truy cập thông tin người dùng này.' });
    }

    try {
        // Lấy thông tin người dùng theo userName
        const user = await getUserByUsername(userName);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Lấy danh sách các nhân vật của người dùng
        let creatures = await getCreaturesByUserId(user.UserId);
        if (!creatures || creatures.length === 0) {
            creatures = null;
        }
        // Lấy thông tin về số dư và khoản tiền gửi của người dùng
        const deposits = await getDepositsByUserId(user.UserId);
        const totalBalance = deposits.reduce((acc, deposit) => acc + Number(deposit.Balance), 0);
        const totalAmount = deposits.reduce((acc, deposit) => acc + Number(deposit.Amount), 0);

        // Lấy giá trị HongMoonCoin của người dùng
        const hongMoonCoin = await getHMCoinByUserId(user.UserId);

        // Lấy lịch sử giao dịch của người dùng
        const transactionHistory = await getTransactionHistoryByUserId(user.UserId);

        // Trả về dữ liệu hồ sơ người dùng với các thông tin đã lấy, bao gồm UserId
        return res.status(200).json({
            UserId: user.UserId,
            UserName: user.UserName,
            Email: user.Email,
            Created: user.Created,
            creatures: creatures,
            deposits: deposits,
            totalBalance: totalBalance,
            totalAmount: totalAmount,
            hongMoonCoin: hongMoonCoin,
            transactionHistory: transactionHistory,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}


/**
 * Cron job xóa các giao dịch thất bại sau 1 ngày.
 * Chạy hàng ngày lúc 00:00.
 * chay test bằng 1p thay 0 = sao/1
 */
cron.schedule('0 * * * *', async () => {
    try {
        const deletedCount = await deleteFailedPayments();
        console.log(`Deleted ${deletedCount} failed transactions older than 24 hours.`);
    } catch (error) {
        console.error('Error running deleteFailedPayments cron job:', error);
    }
});

console.log('Cron job to delete failed payments older than 24 hours has started.');

console.log('Cron job to delete failed payments has started.');


module.exports = {
    getProfile,
};
