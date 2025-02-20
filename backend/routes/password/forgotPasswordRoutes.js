const express = require('express');
const router = express.Router();
const { resetPassword } = require('../../controllers/password/forgotPasswordController');

router.post('/forgot-password/reset', resetPassword);

module.exports = router; 