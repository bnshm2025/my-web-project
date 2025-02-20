const { checkRewardStatus, claimReward, getAllRewardStatuses } = require('../../services/events/evQDHMService');

// Kiểm tra trạng thái nhận quà
async function getRewardStatus(req, res) {
    const { userId, rewardTier } = req.params;

    try {
        const isClaimed = await checkRewardStatus(userId, rewardTier);
        res.status(200).json({ isClaimed });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Xử lý nhận quà
async function handleClaimReward(req, res) {
    const { userId, rewardTier } = req.body;

    try {
        const message = await claimReward(userId, rewardTier);
        res.status(200).json({ message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Lấy trạng thái tất cả các mốc quà của người dùng
async function getAllRewards(req, res) {
    const { userId } = req.params;

    try {
        const rewards = await getAllRewardStatuses(userId);
        res.status(200).json({ rewards });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getRewardStatus,
    handleClaimReward,
    getAllRewards,
};
