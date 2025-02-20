import api from './api';

export async function signup(accountName, email, password) {
    try {
        const response = await api.post('/signup', {
            email: email,
            userName: accountName,
            password: password,
        });

        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw new Error('Đăng ký thất bại. Vui lòng thử lại.');
    }
}
