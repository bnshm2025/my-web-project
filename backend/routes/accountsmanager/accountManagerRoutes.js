const express = require('express');
const { getAllUsers } = require('../../controllers/accountsmanager/accountsManagerController');

const router = express.Router();

// Import controller để xử lý logic

// Định nghĩa route cho trang admin
router.get('/getAllUsers', getAllUsers);

module.exports = router;
