import api from './api';

// Hàm gửi item
export const sendItem = async (charname, itemID, itemCount) => {
    // console.log('Sending item request:', { charname, itemID, itemCount });

    try {
        const response = await api.post('/send-item', {
            charname,
            itemID,
            itemCount,
        });

        // console.log('Response from server:', response.data);
        return response.data; // Trả về dữ liệu từ server
    } catch (error) {
        if (error.response) {
            console.error('Server Error:', error.response.data);
            throw new Error(error.response.data.error || 'Server error occurred');
        } else if (error.request) {
            console.error('No response from server:', error.request);
            throw new Error('No response from server');
        } else {
            console.error('Error setting up request:', error.message);
            throw new Error(error.message);
        }
    }
};
