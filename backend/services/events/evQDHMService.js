const sql = require('mssql');
const { connectBNSPostsWebDb } = require('../../config/db');

// Hàm kiểm tra trạng thái nhận quà
async function checkRewardStatus(userId, rewardTier) {
    const pool = await connectBNSPostsWebDb;
    const result = await pool
        .request()
        .input('UserId', sql.UniqueIdentifier, userId)
        .input('RewardTier', sql.Int, rewardTier).query(`
            SELECT IsClaimed 
            FROM QDHMC 
            WHERE UserId = @UserId AND RewardTier = @RewardTier
        `);

    if (result.recordset.length > 0) {
        return result.recordset[0].IsClaimed; // Trả về trạng thái IsClaimed (true/false)
    }
    return false; // Mặc định là chưa nhận
}

// Hàm xử lý nhận quà
async function claimReward(userId, rewardTier) {
    const pool = await connectBNSPostsWebDb;

    // Kiểm tra trạng thái nhận quà
    const isClaimed = await checkRewardStatus(userId, rewardTier);
    if (isClaimed) {
        throw new Error(`Người dùng đã nhận quà ở mốc ${rewardTier}.`);
    }

    // Thêm thông tin nhận quà vào bảng QDHMC
    await pool.request().input('UserId', sql.UniqueIdentifier, userId).input('RewardTier', sql.Int, rewardTier).query(`
            INSERT INTO QDHMC (UserId, RewardTier, IsClaimed, ClaimedAt)
            VALUES (@UserId, @RewardTier, 1, GETDATE())
        `);

    return `Quà mốc ${rewardTier} đã được nhận thành công!`;
}

// Hàm lấy danh sách trạng thái các mốc quà
async function getAllRewardStatuses(userId) {
    const pool = await connectBNSPostsWebDb;
    const result = await pool.request().input('UserId', sql.UniqueIdentifier, userId).query(`
            SELECT RewardTier, IsClaimed 
            FROM QDHMC 
            WHERE UserId = @UserId
        `);

    return result.recordset; // Trả về danh sách các trạng thái mốc quà
}

module.exports = {
    checkRewardStatus,
    claimReward,
    getAllRewardStatuses,
};
