const express = require('express');
const router = express.Router();
const { handleChangeEmail } = require('../../controllers/email/changeEmailController');
const authenticateToken = require('../../middleware/authenticateToken');

router.post('/change-email', authenticateToken, handleChangeEmail);

module.exports = router;