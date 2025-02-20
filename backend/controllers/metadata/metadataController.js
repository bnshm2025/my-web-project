const { getMetadata, updateMetadata } = require('../../services/metadata/metadataService');
const path = require('path');

// Đường dẫn file metadata
const metadataPath = path.join(__dirname, '../../../metadata/metadata.json');

// Lấy metadata
async function getMetadata(req, res) {
    try {
        const metadata = await getMetadata();
        res.status(200).json({ files: metadata });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Cập nhật metadata
async function updateMetadata(req, res) {
    try {
        const result = await updateMetadata(metadataPath);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getMetadata,
    updateMetadata,
};
