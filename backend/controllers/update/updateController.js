const { getLatestUpdate } = require('../../services/update/updateService');

const getLatestUpdateController = async (req, res) => {
    try {
        // Gọi service để lấy thông tin phiên bản mới nhất
        const latestUpdate = await getLatestUpdate();

        // Xử lý khi không tìm thấy phiên bản cập nhật
        if (!latestUpdate) {
            console.warn('No updates available.');
            return res.status(404).json({
                success: false,
                message: 'No updates available.',
            });
        }

        // Trả về thông tin phiên bản mới nhất
        console.log('Latest update fetched successfully:', latestUpdate);
        return res.status(200).json({
            success: true,
            message: 'Update available.',
            data: latestUpdate,
        });
    } catch (error) {
        console.error('Error fetching latest update:', error);

        // Trả về lỗi server
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

module.exports = { getLatestUpdateController };
