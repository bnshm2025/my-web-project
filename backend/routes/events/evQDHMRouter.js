const express = require('express');
const router = express.Router();
const { getRewardStatus, handleClaimReward, getAllRewards } = require('../../controllers/events/evQDHMController');

// Lấy trạng thái nhận quà của một mốc
router.get('QDHM/:userId/:rewardTier', getRewardStatus);

// Xử lý nhận quà
router.post('QDHM/claim', handleClaimReward);

// Lấy tất cả trạng thái mốc quà của một người dùng
router.get('QDHM/:userId', getAllRewards);

module.exports = router;
