import api from './api'; 
// Đảm bảo rằng api.js được cấu hình đúng
// Hàm gửi dữ liệu bài viết mới đến server
export const submitStore = async (postData) => {
    try {
        const response = await api.post('/storeManagement', postData); // Gọi API /api/posts
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lưu bài viết:', error);
        throw error;
    }
};

// Hàm lấy danh sách bài viết từ server
export const fetchStores = async () => {
    try {
        const response = await api.get('/storeManagement');
        return Array.isArray(response.data) ? response.data : []; // Trả về mảng rỗng nếu không phải mảng
    } catch (error) {
        console.error('Lỗi khi tải danh sách bài viết:', error);
        throw error;
    }
};

export const deleteStore = async (storeId) => {
    try {
        const response = await api.delete(`/storeManagement/${storeId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        throw error;
    }
};

export const updateStore = async (storeId, updatedData) => {
    try {
        const response = await api.put(`/storeManagement/${storeId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        throw error;
    }
};

export const fetchStoreById = async (storeId) => {
    const response = await api.get(`/storeManagement/${storeId}`);
    return response.data;
};
