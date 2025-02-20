import api from './api';

const changeEmailService = {
    changeEmail: async (newEmail) => {
        try {
            const response = await api.post('/change-email', {
                newEmail
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Đã xảy ra lỗi khi đổi email.');
            } else {
                throw new Error('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.');
            }
        }
    }
};

export default changeEmailService; 