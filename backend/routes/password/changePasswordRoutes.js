const express = require('express');
const router = express.Router();
const { handleChangePassword, handleVerifyCurrentPassword } = require('../../controllers/password/changePasswordController');
const authenticateToken = require('../../middleware/authenticateToken');

router.post('/change-password', authenticateToken, handleChangePassword);
router.post('/verify-current-password', authenticateToken, handleVerifyCurrentPassword);

module.exports = router; 