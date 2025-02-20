const express = require('express');
const { getDepositInfo, addDeposit } = require('../../controllers/accountsmanager/addDepositController');

const router = express.Router();

// Route GET để lấy thông tin khoản nạp

router.get('/add-deposit-admin', getDepositInfo);

// Route POST để thêm khoản nạp
router.post('/add-deposit-admin/process', addDeposit);

module.exports = router;
