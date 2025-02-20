const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Thư mục chứa các file cần cập nhật
const updatesDir = path.join(__dirname, '../updates');

// Hàm tính SHA256 của file
function calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

// Lấy metadata của tất cả file trong thư mục
async function getMetadata() {
    try {
        const files = fs.readdirSync(updatesDir);

        const metadata = await Promise.all(
            files.map(async (fileName) => {
                const filePath = path.join(updatesDir, fileName);
                const stats = fs.statSync(filePath);
                const hash = await calculateFileHash(filePath);

                return {
                    name: fileName,
                    size: stats.size,
                    lastModified: stats.mtime.toISOString(),
                    hash,
                    url: `/updates/${fileName}`,
                };
            }),
        );

        return metadata;
    } catch (error) {
        console.error('Lỗi khi lấy metadata:', error);
        throw new Error('Không thể lấy metadata.');
    }
}

// Cập nhật metadata (ghi vào file JSON)
async function updateMetadata(metadataPath) {
    try {
        const metadata = await getMetadata();
        fs.writeFileSync(metadataPath, JSON.stringify({ files: metadata }, null, 2));
        return { message: 'Metadata được cập nhật thành công.' };
    } catch (error) {
        console.error('Lỗi khi cập nhật metadata:', error);
        throw new Error('Không thể cập nhật metadata.');
    }
}

module.exports = {
    getMetadata,
    updateMetadata,
};
