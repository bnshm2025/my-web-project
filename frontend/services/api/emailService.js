// emailService.js
import api from './api';

// Gửi yêu cầu để gửi mã xác nhận qua email
export const sendVerificationEmail = async (email) => {
    try {
        const response = await api.post('/send-verification', { email });
        return response.data;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

// Gửi yêu cầu để xác minh mã xác nhận
export const verifyCode = async (email, code) => {
    try {
        const response = await api.post('/verify-code', { email, code });
        return response.data;
    } catch (error) {
        console.error('Error verifying code:', error);
        throw error;
    }
};

// Hàm gửi OTP cho việc đổi email
export const sendChangeEmailOTP = async (email) => {
    try {
        const response = await api.post('/send-verification', { 
            email,
            action: 'change-email'
        });
        return response.data;
    } catch (error) {
        console.error('Error sending change email OTP:', error);
        throw error;
    }
};
