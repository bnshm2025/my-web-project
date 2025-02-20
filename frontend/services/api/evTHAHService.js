import api from './api';

//Check xem đã nhận chưa
export const checkRewardStatus = async (userId, rewardDay) => {
    try {
        const response = await api.post('/check-reward-status', {
            user_id: userId,
            reward_day: rewardDay,
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái nhận thưởng:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

//Dữ liệu nhận thường
export const claimReward = async (userId, rewardDay, characterName) => {
    try {
        const response = await api.post('/claim-reward', {
            user_id: userId,
            reward_day: rewardDay,
            character_name: characterName,
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi nhận thưởng:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};
