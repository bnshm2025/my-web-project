import api from './api'; // Đảm bảo rằng api.js được cấu hình đúng

// Hàm gửi dữ liệu bài viết mới đến server
export const submitPost = async (postData) => {
    try {
        const response = await api.post('/posts', postData); // Gọi API /api/posts
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lưu bài viết:', error);
        throw error;
    }
};

// Hàm lấy danh sách bài viết từ server
export const fetchPosts = async () => {
    try {
        const response = await api.get('/posts');
        return Array.isArray(response.data) ? response.data : []; // Trả về mảng rỗng nếu không phải mảng
    } catch (error) {
        console.error('Lỗi khi tải danh sách bài viết:', error);
        throw error;
    }
};

export const deletePost = async (postId) => {
    try {
        const response = await api.delete(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        throw error;
    }
};

export const updatePost = async (postId, updatedData) => {
    try {
        const response = await api.put(`/posts/${postId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        throw error;
    }
};

export const fetchPostById = async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
};

export const setMainNews = async (postId) => {
    try {
        const response = await api.put(`/posts/${postId}/setMainNews`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi chọn tin chính:', error);
        throw error;
    }
};

export const fetchPostBySlug = async (slug) => {
    try {
        const response = await api.get(`/posts/slug/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy bài viết theo slug:', error);
        throw error;
    }
};
