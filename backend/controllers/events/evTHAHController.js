const { checkRewardStatus, claimReward } = require('../../services/events/evTHAHService');

const getRewardStatus = async (req, res) => {
    const { user_id, reward_day } = req.body;

    try {
        const rewardStatus = await checkRewardStatus(user_id, reward_day);

        if (!rewardStatus || !rewardStatus.data) {
            // Trả về success: false khi không có dữ liệu
            return res.status(200).json({ success: false, claimed: false, message: 'Không tìm thấy dữ liệu.' });
        }

        // Nếu tìm thấy dữ liệu, trả về kết quả
        res.status(200).json({
            success: true,
            claimed: rewardStatus.data.claimed, // Lấy giá trị `claimed` từ rewardStatus
            character_name: rewardStatus.data.character_name,
        });
    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái nhận thưởng:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống!' });
    }
};

const handleClaimReward = async (req, res) => {
    const { user_id, reward_day, character_name } = req.body;

    try {
        const rewardStatus = await checkRewardStatus(user_id, reward_day);

        if (rewardStatus && rewardStatus.claimed) {
            return res.status(400).json({ success: false, message: 'Phần thưởng đã được nhận!' });
        }

        const response = await claimReward(user_id, reward_day, character_name);
        res.status(200).json(response);
    } catch (error) {
        console.error('Lỗi khi nhận phần thưởng:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống!' });
    }
};

module.exports = { getRewardStatus, handleClaimReward };
