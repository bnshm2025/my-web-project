import api from './api';

// Hàm để tạo mã QR với số tiền
export const generateVietQR = async (amount) => {
    try {
        // Gửi yêu cầu đến API để tạo mã QR
        const response = await api.post('/generate-vietqr', { amount });

        const { userId, userName, qrCode, qrDataURL } = response.data;

        // Trả về tất cả dữ liệu bao gồm qrCode, qrDataURL, addInfo, amount, expiryTime
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API generateVietQR:', error.message);

        // Trả về thông báo lỗi chi tiết nếu có
        throw new Error(error.response?.data?.error || 'Lỗi khi gọi API');
    }
};

// Hàm gọi API kiểm tra giao dịch
export const checkTransaction = async (amount, addInfo) => {
    try {
        // Gửi POST request tới backend với axios
        const response = await api.post('/check-transaction', {
            amount,
            addInfo,
        });

        // Kiểm tra kết quả trả về từ backend
        if (response.data.success) {
            // Nếu thành công, trả về toàn bộ dữ liệu bao gồm thông tin giao dịch và người dùng
            return {
                success: response.data.success,
                transaction: response.data.transaction, // Thông tin giao dịch
                userId: response.data.transaction.userId, // Thông tin userId
                userName: response.data.transaction.userName, // Thông tin userName
            };
        } else {
            throw new Error('Không tìm thấy giao dịch trùng khớp');
        }
    } catch (error) {
        // Xử lý lỗi khi gọi API
        console.error('Lỗi khi gọi API:', error);
        throw error; // Ném lỗi ra ngoài để xử lý tiếp
    }
};

// API tạo đơn hàng
export const createPaymentOrder = async (userId, userName, addInfo, amount) => {
    try {
        const response = await api.post('/create-payment-order', {
            userId,
            userName,
            addInfo,
            amount,
        });

        if (response.status === 201) {
            return response.data; // Trả về dữ liệu đơn hàng
        } else {
            throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
        }
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error.response ? error.response.data : error.message);
        throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
    }
};

// Hàm gọi API để cập nhật trạng thái đơn hàng
export const updatePaymentOrderStatus = async (orderId, status) => {
    try {
        const response = await api.post(`/update-payment-order-status`, {
            orderId,
            status,
        });
        return response.data; // Trả về dữ liệu phản hồi từ server
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        throw new Error('Không thể cập nhật trạng thái đơn hàng.');
    }
};

export const paymentSuccess = async (userId, userName, amount) => {
    // Kiểm tra nếu các tham số là hợp lệ
    if (!userId || !userName || amount <= 0) {
        console.error('Thông tin không hợp lệ:', { userId, userName, amount });
        return { success: false }; // Trả về false nếu tham số không hợp lệ
    }

    try {
        const response = await api.post('/payment-success', {
            userId,
            userName,
            amount,
        });

        // Kiểm tra cấu trúc response và đảm bảo trả về đúng format
        if (response.data && response.data.success !== undefined) {
            return response.data; // Trả về đối tượng của API
        } else {
            // Trường hợp API không trả về đúng dữ liệu cần thiết
            console.error('Response không hợp lệ:', response.data);
            return { success: false };
        }
    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu thanh toán thành công:', error);
        return { success: false }; // Trả về false khi có lỗi
    }
};

// Hàm tiêu HMCoin
export const spendHMCoin = async (userId, spendAmount) => {
    try {
        const response = await api.post(`/spend-hmcoin`, {
            userId,
            spendAmount,
        });
        return response.data; // Trả về dữ liệu thành công từ backend
    } catch (error) {
        console.error('Error in spendHMCoin:', error);
        if (error.response) {
            return { error: error.response.data.error }; // Lấy thông báo lỗi từ backend
        }
        return { error: 'An error occurred while spending HMCoin.' };
    }
};
