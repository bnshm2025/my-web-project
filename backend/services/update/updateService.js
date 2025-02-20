const fs = require('fs').promises;
const path = require('path');

// Đường dẫn tới thư mục chứa các file cập nhật
const updatesDir = path.join(__dirname, '../../../updates');

// Hàm lấy thông tin bản cập nhật mới nhất
const getLatestUpdate = async () => {
    try {
        // Kiểm tra xem thư mục updates có tồn tại không
        await fs.access(updatesDir);

        // Lấy danh sách file trong thư mục updates
        const files = await fs.readdir(updatesDir);

        // Lọc các file .exe theo quy tắc đặt tên
        const setupFiles = files.filter((file) => file.startsWith('BNSHM Launcher Setup') && file.endsWith('.exe'));

        // Nếu không có file hợp lệ, trả về null
        if (setupFiles.length === 0) {
            console.warn('No setup files found in updates directory.');
            return null;
        }

        // Trích xuất phiên bản từ tên file
        const versions = setupFiles
            .map((file) => {
                const match = file.match(/BNSHM Launcher Setup (\d+\.\d+\.\d+)/);
                return match ? { fileName: file, version: match[1] } : null;
            })
            .filter(Boolean); // Loại bỏ các giá trị null

        // Nếu không có phiên bản hợp lệ, trả về null
        if (versions.length === 0) {
            console.warn('No valid version files found.');
            return null;
        }

        // Sắp xếp các phiên bản theo thứ tự giảm dần
        versions.sort((a, b) => {
            const [aMajor, aMinor, aPatch] = a.version.split('.').map(Number);
            const [bMajor, bMinor, bPatch] = b.version.split('.').map(Number);
            if (aMajor !== bMajor) return bMajor - aMajor;
            if (aMinor !== bMinor) return bMinor - aMinor;
            return bPatch - aPatch;
        });

        const latest = versions[0]; // Lấy phiên bản mới nhất

        // Lấy thông tin ngày chỉnh sửa cuối của file
        const fileStats = await fs.stat(path.join(updatesDir, latest.fileName));

        // Trả về thông tin phiên bản mới nhất
        return {
            version: latest.version, // Phiên bản
            filePath: `/updates/${latest.fileName}`, // Đường dẫn file
            releaseDate: fileStats.mtime.toISOString(), // Ngày phát hành
        };
    } catch (error) {
        console.error('Error while retrieving latest update:', error.message);
        return null;
    }
};

module.exports = { getLatestUpdate };
