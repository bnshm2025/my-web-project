import api from './api';

const forgotPasswordService = {
    // Gửi yêu cầu quên mật khẩu
    sendForgotPassword: async (email) => {
        try {
            const response = await api.post('/forgot-password/send', { email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể gửi yêu cầu khôi phục mật khẩu');
        }
    },

    // Reset mật khẩu
    resetPassword: async (email, newPassword, captchaToken) => {
        try {
            const response = await api.post('/forgot-password/reset', {
                email,
                newPassword,
                captchaToken
            });

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
        }
    }
};

export default forgotPasswordService;
