const express = require('express');
const {
    getEditCharacterPage,
    updateGameAccountExpHandler,
} = require('../../controllers/accountsmanager/editCharacterController');
const router = express.Router();

// Route để lấy trang chỉnh sửa nhân vật
router.get('/edit-charhongmoon', getEditCharacterPage);

// Route để cập nhật dữ liệu GameAccountExp
router.post('/update-game-account-exp', updateGameAccountExpHandler);

module.exports = router;
