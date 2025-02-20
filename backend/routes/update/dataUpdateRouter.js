const express = require('express');
const { createManifest, getManifest, downloadFile } = require('../../controllers/update/dataUpdateController');

const router = express.Router();

// Tạo manifest.json
router.post('/dataupdate/generate', createManifest);

// Lấy manifest.json
router.get('/dataupdate/manifest', getManifest);

// Tải file cập nhật
router.get('/dataupdate/:fileName', downloadFile);

module.exports = router;
