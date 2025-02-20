import api from './api';

// Hàm kiểm tra tính sẵn có của tên tài khoản
export async function checkAccountNameAvailability(accountName) {
    try {
        const response = await api.get('/check-availability', {
            params: { account_name: accountName },
        });
        return response.data.accountNameTaken; // Trả về true nếu tên tài khoản đã tồn tại
    } catch (error) {
        console.error('Error checking account name availability:', error);
        throw error;
    }
}

// Hàm kiểm tra tính sẵn có của email
export async function checkEmailAvailability(email) {
    try {
        const response = await api.get('/check-availability', {
            params: { email },
        });
        return response.data.emailTaken; // Trả về true nếu email đã tồn tại
    } catch (error) {
        console.error('Error checking email availability:', error);
        throw error;
    }
}
