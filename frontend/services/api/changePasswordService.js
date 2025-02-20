import api from './api';

const changePasswordService = {
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await api.post('/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Đã xảy ra lỗi khi đổi mật khẩu.');
            } else {
                throw new Error('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.');
            }
        }
    },
    verifyCurrentPassword: async (currentPassword) => {
        try {
            const response = await api.post('/verify-current-password', { currentPassword });
            return response.data.isValid;
        } catch (error) {
            throw new Error('Không thể kiểm tra mật khẩu hiện tại.');
        }
    }
};

export default changePasswordService; 