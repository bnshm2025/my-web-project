const express = require('express');
const { updateCharacterController } = require('../../controllers/accountsmanager/updateCharacterController');

const router = express.Router();

// API cập nhật nhân vật
router.post('/update-character', updateCharacterController);

module.exports = router;
