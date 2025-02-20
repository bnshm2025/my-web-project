const express = require('express');
const { getRewardStatus, handleClaimReward } = require('../../controllers/events/evTHAHController');
const router = express.Router();

// Kiểm tra trạng thái nhận thưởng
router.post('/check-reward-status', getRewardStatus);

// Nhận thưởng
router.post('/claim-reward', handleClaimReward);

module.exports = router;
