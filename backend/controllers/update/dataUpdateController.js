const { generateManifest, getManifests, getFile } = require('../../services/update/dataUpdateService');

// Endpoint: Tạo manifest.json
async function createManifest(req, res) {
    try {
        const manifest = await generateManifest();
        res.status(200).json({ message: 'Manifest generated successfully.', manifest });
    } catch (error) {
        console.error('Error generating manifest:', error);
        res.status(500).json({ error: 'Failed to generate manifest.' });
    }
}

// Endpoint: Lấy manifest.json
function getManifest(req, res) {
    try {
        const manifest = getManifests();
        res.status(200).json(manifest);
    } catch (error) {
        console.error('Error getting manifest:', error);
        res.status(404).json({ error: error.message });
    }
}

// Endpoint: Tải file cập nhật
function downloadFile(req, res) {
    try {
        const fileName = req.params.fileName;
        const filePath = getFile(fileName);
        res.download(filePath);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(404).json({ error: error.message });
    }
}

module.exports = {
    createManifest,
    getManifest,
    downloadFile,
};
