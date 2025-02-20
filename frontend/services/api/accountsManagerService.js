import api from './api';

// Lấy thông tin bảng điều khiển (dashboard)
export const getAllUsers = async () => {
    try {
        const response = await api.get(`/getAllUsers`);
        return response.data; // Trả về dữ liệu từ server (dưới dạng JSON)
    } catch (error) {
        console.error('Có lỗi xảy ra khi lấy dữ liệu users dashboard:', error);
        throw error; // Throw lỗi nếu có vấn đề
    }
};
