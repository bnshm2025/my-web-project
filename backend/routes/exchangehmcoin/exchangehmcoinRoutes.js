const express = require('express');
const { processDepositRequest } = require('../../controllers/exchangehmcoin/exchangehmcoinController');

const router = express.Router();

router.post('/add-deposit/process', processDepositRequest);

module.exports = router;
