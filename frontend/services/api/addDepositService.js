import api from './api';

// Hàm gọi API để lấy thông tin khoản nạp
export const getDepositInfo = async (userId) => {
    try {
        const response = await api.get(`/add-deposit-admin`, {
            params: { userId },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API getDepositInfo:', error);
        throw error.response ? error.response.data : new Error('Lỗi không xác định');
    }
};

// Hàm gọi API để thêm khoản nạp
export const addDeposit = async (amount, gameAccountId) => {
    try {
        const response = await api.post(`/add-deposit-admin/process`, {
            amount,
            game_account_id: gameAccountId,
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API addDeposit:', error);
        throw error.response ? error.response.data : new Error('Lỗi không xác định');
    }
};
