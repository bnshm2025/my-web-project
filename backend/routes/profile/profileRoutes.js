const express = require('express');
const { getProfile } = require('../../controllers/profile/profileController');
const authenticateToken = require('../../middleware/authenticateToken');

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);

module.exports = router;
