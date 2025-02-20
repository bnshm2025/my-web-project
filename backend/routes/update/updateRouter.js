const express = require('express');
const { getLatestUpdateController } = require('../../controllers/update/updateController');

const router = express.Router();

// Route lấy thông tin phiên bản cập nhật mới nhất
router.get('/latest-update', getLatestUpdateController);

module.exports = router;
