import api from './api';

export const getProfile = async (userName) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get('/profile', {
            params: { userName },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu hồ sơ người dùng:', error);
        throw error;
    }
};
