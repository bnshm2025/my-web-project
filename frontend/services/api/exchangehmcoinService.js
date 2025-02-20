import api from './api';

// Hàm gửi yêu cầu Deposit
export const depositRequest = async (userId, amount) => {
    try {
        // Gửi yêu cầu POST đến API
        const response = await api.post(`/add-deposit/process`, {
            game_account_id: userId, // game_account_id từ client
            amount, // amount từ client
        });

        // Kiểm tra xem API có trả về thành công hay không
        if (response.data.success) {
            return response.data;
        } else {
            // Xử lý nếu thất bại
            console.error('Deposit failed:', response.data.message);
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        // Xử lý nếu có lỗi trong quá trình gọi API
        console.error('Error when processing deposit:', error);
        return { success: false, message: 'Vui lòng đợi 1 chút trước khi tiếp tục quy đổi.....' };
    }
};
